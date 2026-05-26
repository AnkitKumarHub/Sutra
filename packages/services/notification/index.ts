import { logger } from "@repo/logger";
import { Resend } from "resend";

import { env } from "../env";
import type { SendSubmissionEmailsInput, SendWorkspaceInviteEmailInput } from "./model";
import { respondentConfirmationEmailHtml } from "./templates/respondent-confirmation";
import { submissionNotifyEmailHtml } from "./templates/submission-notify";
import { workspaceInviteEmailHtml } from "./templates/workspace-invite";

class NotificationService {
  private readonly resend = new Resend(env.RESEND_API_KEY);

  private canSendEmails() {
    if (!env.RESEND_API_KEY) {
      logger.warn("Email send skipped: RESEND_API_KEY is not configured");
      return false;
    }
    return true;
  }

  public async sendSubmissionEmails(input: SendSubmissionEmailsInput) {
    if (!this.canSendEmails()) return;

    await this.resend.emails.send({
      from: env.EMAIL_FROM,
      to: input.creatorEmail,
      replyTo: env.EMAIL_REPLY_TO,
      subject: `New submission: ${input.formTitle}`,
      html: submissionNotifyEmailHtml({
        creatorName: input.creatorName,
        formTitle: input.formTitle,
        submissionId: input.submissionId,
        submittedAt: input.submittedAt,
      }),
    });

    if (input.sendRespondentConfirmation && input.respondentEmail) {
      await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to: input.respondentEmail,
        replyTo: env.EMAIL_REPLY_TO,
        subject: `Submission received: ${input.formTitle}`,
        html: respondentConfirmationEmailHtml({
          formTitle: input.formTitle,
          submissionId: input.submissionId,
          submittedAt: input.submittedAt,
        }),
      });
    }
  }

  public async sendWorkspaceInviteEmail(input: SendWorkspaceInviteEmailInput) {
    if (!this.canSendEmails()) return;

    await this.resend.emails.send({
      from: env.EMAIL_FROM,
      to: input.inviteeEmail,
      replyTo: env.EMAIL_REPLY_TO,
      subject: `You were invited to ${input.workspaceName}`,
      html: workspaceInviteEmailHtml({
        workspaceName: input.workspaceName,
        role: input.role,
        invitedByName: input.invitedByName,
      }),
    });
  }
}

export default NotificationService;
