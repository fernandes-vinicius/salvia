CREATE TABLE "supplement_checkin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"supplement_id" uuid,
	"supplement_name" text NOT NULL,
	"day" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "supplement_checkin" ADD CONSTRAINT "supplement_checkin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplement_checkin" ADD CONSTRAINT "supplement_checkin_supplement_id_diet_supplement_id_fk" FOREIGN KEY ("supplement_id") REFERENCES "public"."diet_supplement"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "supplement_checkin_user_day_idx" ON "supplement_checkin" USING btree ("user_id","day");--> statement-breakpoint
CREATE UNIQUE INDEX "supplement_checkin_supplement_day_idx" ON "supplement_checkin" USING btree ("supplement_id","day");