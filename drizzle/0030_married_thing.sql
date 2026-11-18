ALTER TABLE "diet_meal" ADD COLUMN "variant" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "diet_meal" ADD COLUMN "source_meal_id" uuid;--> statement-breakpoint
ALTER TABLE "diet_meal" ADD CONSTRAINT "diet_meal_source_meal_id_diet_meal_id_fk" FOREIGN KEY ("source_meal_id") REFERENCES "public"."diet_meal"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diet_meal_user_variant_idx" ON "diet_meal" USING btree ("user_id","variant");