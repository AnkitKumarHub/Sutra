CREATE TYPE "public"."form_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "status" "form_status_enum" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "deleted_at" timestamp;