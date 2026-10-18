CREATE TABLE "diet_item_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"quantity" double precision NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diet_item_option" ADD CONSTRAINT "diet_item_option_item_id_diet_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."diet_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diet_item_option" ADD CONSTRAINT "diet_item_option_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diet_item_option_item_id_idx" ON "diet_item_option" USING btree ("item_id");