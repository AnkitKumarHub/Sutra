export interface SendSubmissionEmailsInput {
  formId: string;
  formTitle: string;
  submissionId: string;
  submittedAt: string;
  creatorEmail: string;
  creatorName: string;
  respondentEmail?: string;
  sendRespondentConfirmation?: boolean;
}

export interface SendWorkspaceInviteEmailInput {
  inviteeEmail: string;
  workspaceName: string;
  role: string;
  invitedByName: string;
}
