CREATE TABLE "diet_share" (
	"user_id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "diet_share_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "diet_share" ADD CONSTRAINT "diet_share_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;