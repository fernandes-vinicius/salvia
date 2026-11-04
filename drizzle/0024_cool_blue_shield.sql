CREATE TABLE "ai_interest" (
	"user_id" text NOT NULL,
	"feature" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_interest_user_id_feature_pk" PRIMARY KEY("user_id","feature")
);
--> statement-breakpoint
ALTER TABLE "ai_interest" ADD CONSTRAINT "ai_interest_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;