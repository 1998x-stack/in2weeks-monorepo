CREATE TYPE "public"."artifact_kind" AS ENUM('file', 'link', 'github', 'text', 'image');--> statement-breakpoint
CREATE TYPE "public"."day_level" AS ENUM('L1', 'L2', 'L3', 'L4', 'L5');--> statement-breakpoint
CREATE TYPE "public"."day_status" AS ENUM('locked', 'available', 'completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."sprint_status" AS ENUM('draft', 'active', 'paused', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."sprint_visibility" AS ENUM('private', 'unlisted', 'public');--> statement-breakpoint
CREATE TYPE "public"."verification_method" AS ENUM('test', 'demo', 'review', 'other');--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprint_id" uuid NOT NULL,
	"sprint_day_id" uuid,
	"kind" "artifact_kind" NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprint_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprint_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"text" text NOT NULL,
	"verification" "verification_method" DEFAULT 'other' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprint_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprint_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"theme" text NOT NULL,
	"task" text NOT NULL,
	"evidence_requirement" text NOT NULL,
	"level" "day_level" NOT NULL,
	"status" "day_status" DEFAULT 'locked' NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"artifact_summary" text DEFAULT '' NOT NULL,
	"obstacle" text DEFAULT '' NOT NULL,
	"recall" text DEFAULT '' NOT NULL,
	"next_action" text DEFAULT '' NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" uuid,
	"title" text NOT NULL,
	"audience" text NOT NULL,
	"daily_minutes" integer DEFAULT 90 NOT NULL,
	"start_date" date NOT NULL,
	"status" "sprint_status" DEFAULT 'active' NOT NULL,
	"visibility" "sprint_visibility" DEFAULT 'private' NOT NULL,
	"current_day" integer DEFAULT 1 NOT NULL,
	"excluded_scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_sprint_day_id_sprint_days_id_fk" FOREIGN KEY ("sprint_day_id") REFERENCES "public"."sprint_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint_criteria" ADD CONSTRAINT "sprint_criteria_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint_days" ADD CONSTRAINT "sprint_days_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifacts_sprint_id_idx" ON "artifacts" USING btree ("sprint_id");--> statement-breakpoint
CREATE INDEX "artifacts_sprint_day_id_idx" ON "artifacts" USING btree ("sprint_day_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sprint_criteria_position_unique" ON "sprint_criteria" USING btree ("sprint_id","position");--> statement-breakpoint
CREATE INDEX "sprint_criteria_sprint_id_idx" ON "sprint_criteria" USING btree ("sprint_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sprint_days_number_unique" ON "sprint_days" USING btree ("sprint_id","day_number");--> statement-breakpoint
CREATE INDEX "sprint_days_sprint_status_idx" ON "sprint_days" USING btree ("sprint_id","status");--> statement-breakpoint
CREATE INDEX "sprints_user_status_idx" ON "sprints" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "sprints_project_id_idx" ON "sprints" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sprints_one_active_per_user_unique" ON "sprints" USING btree ("user_id") WHERE "sprints"."status" = 'active';