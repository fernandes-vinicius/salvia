ALTER TABLE "saved_recipe" ADD COLUMN "share_token" text;--> statement-breakpoint
ALTER TABLE "saved_recipe" ADD CONSTRAINT "saved_recipe_share_token_unique" UNIQUE("share_token");