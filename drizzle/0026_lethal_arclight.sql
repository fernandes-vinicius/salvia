CREATE TYPE "public"."supplement_days" AS ENUM('every_day', 'training_days', 'weekdays');--> statement-breakpoint
CREATE TYPE "public"."supplement_timing" AS ENUM('meal', 'before_workout', 'after_workout', 'wake_up', 'bedtime', 'time');--> statement-breakpoint
CREATE TYPE "public"."supplement_unit" AS ENUM('g', 'mg', 'mcg', 'ml', 'capsule', 'tablet', 'scoop', 'drop', 'sachet', 'iu');--> statement-breakpoint
CREATE TABLE "diet_supplement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"dose" double precision NOT NULL,
	"unit" "supplement_unit" NOT NULL,
	"timing" "supplement_timing" NOT NULL,
	"meal_id" uuid,
	"time" text,
	"days" "supplement_days" NOT NULL,
	"weekdays" integer[] DEFAULT '{}' NOT NULL,
	"note" text,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diet_supplement" ADD CONSTRAINT "diet_supplement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diet_supplement" ADD CONSTRAINT "diet_supplement_meal_id_diet_meal_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."diet_meal"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diet_supplement_user_id_idx" ON "diet_supplement" USING btree ("user_id");