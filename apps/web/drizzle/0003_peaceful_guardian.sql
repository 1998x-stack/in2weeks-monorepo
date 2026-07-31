CREATE TABLE "rate_limits" (
	"action" text NOT NULL,
	"identifier_hash" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "rate_limits_action_identifier_hash_window_start_pk" PRIMARY KEY("action","identifier_hash","window_start"),
	CONSTRAINT "rate_limits_attempts_check" CHECK ("rate_limits"."attempts" > 0)
);
--> statement-breakpoint
CREATE INDEX "rate_limits_window_start_idx" ON "rate_limits" USING btree ("window_start");