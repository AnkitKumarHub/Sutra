import { EventEmitter } from "node:events";

/**
 * A singleton EventEmitter that acts as the bridge between:
 * - packages/trpc  → emits "submission" events after a form is submitted
 * - apps/api       → listens and calls broadcastAnalyticsDelta()
 *
 * This avoids any circular import between the two packages.
 */
class SubmissionEventBus extends EventEmitter {}

export const submissionBus = new SubmissionEventBus();

export interface SubmissionEvent {
  formId: string;
  submissionId: string;
  submittedAt: string;
  values: Array<{ fieldId: string; value: unknown }>;
}
