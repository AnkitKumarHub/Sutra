import { emailLayoutHtml, escapeHtml } from "./layout";

interface RespondentConfirmationTemplateInput {
  formTitle: string;
  submissionId: string;
  submittedAt: string;
}

export function respondentConfirmationEmailHtml(input: RespondentConfirmationTemplateInput) {
  const safeFormTitle = escapeHtml(input.formTitle);
  const safeSubmissionId = escapeHtml(input.submissionId);
  const safeSubmittedAt = escapeHtml(input.submittedAt);

  return emailLayoutHtml({
    title: `Submission received for ${input.formTitle}`,
    bodyHtml: `
      <p style="margin:0 0 12px 0;">Your response has been received.</p>
      <p style="margin:0 0 12px 0;"><strong>Form:</strong> ${safeFormTitle}</p>
      <p style="margin:0;">
        <strong>Submission ID:</strong> ${safeSubmissionId}<br/>
        <strong>Submitted At:</strong> ${safeSubmittedAt}
      </p>
    `,
  });
}
