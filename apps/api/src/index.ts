import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";
import { setupWebSocketServer, broadcastAnalyticsDelta } from "./websocket";
import { submissionBus } from "@repo/trpc/server/utils/submission-bus";
import type { SubmissionEvent } from "@repo/trpc/server/utils/submission-bus";
import { env } from "./env";

async function init() {
  try {
    const server = http.createServer(expressApplication);
    setupWebSocketServer(server);

    // Listen for form submission events and broadcast real-time delta to analytics clients
    submissionBus.on("submission", (event: SubmissionEvent) => {
      broadcastAnalyticsDelta(event.formId, {
        totalResponses: 0, // Client will increment locally; server provides submission data
        newSubmission: {
          id: event.submissionId,
          submittedAt: event.submittedAt,
          values: event.values,
        },
      });
    });

    const PORT: number = env.PORT ? +env.PORT : 8000;
    server.listen(PORT, () => {
      logger.info(`http server is running on PORT ${PORT}`);
      logger.info(`WebSocket server ready on ws://localhost:${PORT}/ws`);
    });
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
