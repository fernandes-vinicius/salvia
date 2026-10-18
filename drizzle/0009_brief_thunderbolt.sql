CREATE TABLE "user_activity" (
	"user_id" text NOT NULL,
	"day" date NOT NULL,
	CONSTRAINT "user_activity_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
ALTER TABLE "goal" ADD COLUMN "calibration_kcal" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "goal" ADD COLUMN "calibrated_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;