ALTER TABLE "sprint_criteria" ADD CONSTRAINT "sprint_criteria_position_check" CHECK ("sprint_criteria"."position" between 1 and 3);--> statement-breakpoint
ALTER TABLE "sprint_criteria" ADD CONSTRAINT "sprint_criteria_text_check" CHECK (char_length(trim("sprint_criteria"."text")) between 3 and 120);--> statement-breakpoint
ALTER TABLE "sprint_days" ADD CONSTRAINT "sprint_days_number_check" CHECK ("sprint_days"."day_number" between 1 and 14);--> statement-breakpoint
ALTER TABLE "sprint_days" ADD CONSTRAINT "sprint_days_minutes_check" CHECK ("sprint_days"."minutes" between 0 and 600);--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_daily_minutes_check" CHECK ("sprints"."daily_minutes" between 30 and 240);--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_current_day_check" CHECK ("sprints"."current_day" between 1 and 14);