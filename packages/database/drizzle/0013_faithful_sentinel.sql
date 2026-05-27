ALTER TABLE "forms" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "max_responses" integer;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "notify_creator_on_submission" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "send_respondent_confirmation" boolean DEFAULT true NOT NULL;