import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { logger } from "@repo/logger";

/** Channel name → set of open WebSocket connections */
const channels = new Map<string, Set<WebSocket>>();

export interface AnalyticsDelta {
  totalResponses: number;
  newSubmission: {
    id: string;
    submittedAt: string;
    values: Array<{ fieldId: string; value: unknown }>;
  };
}

/**
 * Attach a WebSocket server to an existing HTTP server.
 * Clients connect via:  ws://host/ws?channel=analytics:{formId}
 */
export function setupWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    // Only handle /ws upgrades — ignore everything else
    if (!url.pathname.startsWith("/ws")) {
      socket.destroy();
      return;
    }

    const channel = url.searchParams.get("channel");

    wss.handleUpgrade(request, socket, head, (ws) => {
      if (!channel) {
        ws.close(4000, "Missing channel parameter");
        return;
      }

      // Register client in channel
      if (!channels.has(channel)) channels.set(channel, new Set());
      channels.get(channel)!.add(ws);

      logger.info(`[WS] Client connected → channel: ${channel}`);

      // Acknowledge connection
      ws.send(JSON.stringify({ type: "connected", channel }));

      ws.on("close", () => {
        const set = channels.get(channel);
        if (set) {
          set.delete(ws);
          if (set.size === 0) channels.delete(channel);
        }
        logger.info(`[WS] Client disconnected ← channel: ${channel}`);
      });

      ws.on("error", (err) => {
        logger.error("[WS] Socket error", { error: err.message, channel });
      });
    });
  });

  logger.info("[WS] WebSocket server ready");
}

/**
 * Broadcast an analytics delta to all clients watching a form.
 * Called by the form submission handler after a successful DB insert.
 */
export function broadcastAnalyticsDelta(formId: string, delta: AnalyticsDelta): void {
  const channel = `analytics:${formId}`;
  const clients = channels.get(channel);

  if (!clients || clients.size === 0) return;

  const message = JSON.stringify({
    type: "response_delta",
    formId,
    delta,
    timestamp: new Date().toISOString(),
  });

  let sent = 0;
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      sent++;
    }
  }

  if (sent > 0) {
    logger.info(`[WS] Broadcasted delta to ${sent} client(s) on ${channel}`);
  }
}
