ALTER TABLE "form_fields" RENAME COLUMN "options" TO "config";--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "config" SET DATA TYPE jsonb USING (
  CASE
    WHEN "config" IS NULL OR btrim("config") = '' THEN '{}'::jsonb
    WHEN left(btrim("config"), 1) = '[' THEN jsonb_build_object('options', "config"::jsonb)
    WHEN left(btrim("config"), 1) = '{' THEN "config"::jsonb
    ELSE '{}'::jsonb
  END
);--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "config" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "config" SET NOT NULL;