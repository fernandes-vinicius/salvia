CREATE TYPE "public"."objective" AS ENUM('lose', 'maintain', 'gain');--> statement-breakpoint
CREATE TABLE "goal" (
	"user_id" text PRIMARY KEY NOT NULL,
	"objective" "objective" NOT NULL,
	"calorie_adjustment" integer NOT NULL,
	"protein_per_kg" double precision NOT NULL,
	"fat_per_kg" double precision NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "goal" ADD CONSTRAINT "goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;