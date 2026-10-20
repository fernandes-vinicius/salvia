CREATE TABLE "weekly_summary" (
	"user_id" text NOT NULL,
	"week_start" date NOT NULL,
	"title" text NOT NULL,
	"text" text NOT NULL,
	"next_step" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_summary_user_id_week_start_pk" PRIMARY KEY("user_id","week_start")
);
--> statement-breakpoint
ALTER TABLE "weekly_summary" ADD CONSTRAINT "weekly_summary_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;