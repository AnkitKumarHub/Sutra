CREATE TYPE "public"."template_category_enum" AS ENUM('feedback', 'hr', 'education', 'events', 'research', 'health', 'business', 'personal');--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(300),
	"category" "template_category_enum" NOT NULL,
	"emoji" varchar(10),
	"is_paid" boolean DEFAULT false NOT NULL,
	"fields" jsonb NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
