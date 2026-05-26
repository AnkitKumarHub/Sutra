import { emailLayoutHtml, escapeHtml } from "./layout";

interface WorkspaceInviteTemplateInput {
  workspaceName: string;
  role: string;
  invitedByName: string;
}

export function workspaceInviteEmailHtml(input: WorkspaceInviteTemplateInput) {
  const safeWorkspaceName = escapeHtml(input.workspaceName);
  const safeRole = escapeHtml(input.role);
  const safeInvitedByName = escapeHtml(input.invitedByName);

  return emailLayoutHtml({
    title: `Invitation to ${input.workspaceName}`,
    bodyHtml: `
      <p style="margin:0 0 12px 0;">You were added to a workspace in Sutra.</p>
      <p style="margin:0;">
        <strong>Workspace:</strong> ${safeWorkspaceName}<br/>
        <strong>Role:</strong> ${safeRole}<br/>
        <strong>Invited By:</strong> ${safeInvitedByName}
      </p>
    `,
  });
}
