import { emailLayoutHtml, escapeHtml } from "./layout";

interface SubmissionNotifyTemplateInput {
  creatorName: string;
  formTitle: string;
  submissionId: string;
  submittedAt: string;
}

export function submissionNotifyEmailHtml(input: SubmissionNotifyTemplateInput) {
  const safeCreatorName = escapeHtml(input.creatorName);
  const safeFormTitle = escapeHtml(input.formTitle);
  const safeSubmissionId = escapeHtml(input.submissionId);
  const safeSubmittedAt = escapeHtml(input.submittedAt);

  return emailLayoutHtml({
    title: `New response for ${input.formTitle}`,
    bodyHtml: `
      <p style="margin:0 0 12px 0;">Hi ${safeCreatorName},</p>
      <p style="margin:0 0 12px 0;">You received a new submission for <strong>${safeFormTitle}</strong>.</p>
      <p style="margin:0;">
        <strong>Submission ID:</strong> ${safeSubmissionId}<br/>
        <strong>Submitted At:</strong> ${safeSubmittedAt}
      </p>
    `,
  });
}
