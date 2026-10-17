CREATE TYPE "public"."food_source" AS ENUM('taco', 'custom');--> statement-breakpoint
CREATE TYPE "public"."food_unit" AS ENUM('g', 'ml', 'unit');--> statement-breakpoint
CREATE TYPE "public"."protein_source" AS ENUM('animal', 'vegetal');--> statement-breakpoint
CREATE TABLE "diet_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"quantity" double precision NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diet_meal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"time" text,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"source" "food_source" NOT NULL,
	"taco_id" integer,
	"name" text NOT NULL,
	"search_name" text NOT NULL,
	"category" text,
	"unit" "food_unit" NOT NULL,
	"protein" double precision NOT NULL,
	"carbs" double precision NOT NULL,
	"fat" double precision NOT NULL,
	"protein_source" "protein_source" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "food_taco_id_unique" UNIQUE("taco_id")
);
--> statement-breakpoint
ALTER TABLE "diet_item" ADD CONSTRAINT "diet_item_meal_id_diet_meal_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."diet_meal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diet_item" ADD CONSTRAINT "diet_item_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diet_meal" ADD CONSTRAINT "diet_meal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diet_item_meal_id_idx" ON "diet_item" USING btree ("meal_id");--> statement-breakpoint
CREATE INDEX "diet_meal_user_id_idx" ON "diet_meal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "food_user_id_idx" ON "food" USING btree ("user_id");