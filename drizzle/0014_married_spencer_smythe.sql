CREATE TYPE "public"."checkin_status" AS ENUM('done', 'option', 'skipped');--> statement-breakpoint
CREATE TABLE "meal_checkin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"meal_id" uuid,
	"meal_name" text NOT NULL,
	"day" date NOT NULL,
	"status" "checkin_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meal_checkin" ADD CONSTRAINT "meal_checkin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_checkin" ADD CONSTRAINT "meal_checkin_meal_id_diet_meal_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."diet_meal"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meal_checkin_user_day_idx" ON "meal_checkin" USING btree ("user_id","day");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_checkin_meal_day_idx" ON "meal_checkin" USING btree ("meal_id","day");