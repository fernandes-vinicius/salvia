CREATE TYPE "public"."price_unit" AS ENUM('kg', 'L', 'un', 'dz');--> statement-breakpoint
CREATE TABLE "user_price" (
	"user_id" text NOT NULL,
	"item_key" text NOT NULL,
	"value" double precision NOT NULL,
	"per" "price_unit" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_price_user_id_item_key_pk" PRIMARY KEY("user_id","item_key")
);
--> statement-breakpoint
ALTER TABLE "user_price" ADD CONSTRAINT "user_price_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;