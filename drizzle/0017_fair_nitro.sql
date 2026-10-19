CREATE TABLE "saved_recipe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"meal_id" uuid,
	"meal_name" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"minutes" integer NOT NULL,
	"extras" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"tip" text,
	"ingredients" jsonb NOT NULL,
	"macros" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saved_recipe" ADD CONSTRAINT "saved_recipe_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_recipe" ADD CONSTRAINT "saved_recipe_meal_id_diet_meal_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."diet_meal"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saved_recipe_user_id_idx" ON "saved_recipe" USING btree ("user_id");