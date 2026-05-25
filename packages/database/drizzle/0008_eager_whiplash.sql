ALTER TABLE "forms" ADD COLUMN "slug" varchar(255);--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_slug_unique" UNIQUE("slug");