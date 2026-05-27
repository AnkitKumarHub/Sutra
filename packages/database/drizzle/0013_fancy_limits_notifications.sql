ALTER TABLE "forms" ADD COLUMN "expires_at" timestamp;
ALTER TABLE "forms" ADD COLUMN "max_responses" integer;
ALTER TABLE "forms" ADD COLUMN "notify_creator_on_submission" boolean DEFAULT true NOT NULL;
ALTER TABLE "forms" ADD COLUMN "send_respondent_confirmation" boolean DEFAULT true NOT NULL;
