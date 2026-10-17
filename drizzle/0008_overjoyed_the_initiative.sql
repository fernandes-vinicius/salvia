CREATE TABLE "body_measurement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"measured_on" date NOT NULL,
	"weight_kg" double precision,
	"waist_cm" double precision,
	"neck_cm" double precision,
	"shoulder_cm" double precision,
	"chest_cm" double precision,
	"biceps_left_cm" double precision,
	"biceps_right_cm" double precision,
	"forearm_left_cm" double precision,
	"forearm_right_cm" double precision,
	"abdomen_cm" double precision,
	"hips_cm" double precision,
	"thigh_left_cm" double precision,
	"thigh_right_cm" double precision,
	"calf_left_cm" double precision,
	"calf_right_cm" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "body_measurement_user_day" UNIQUE("user_id","measured_on")
);
--> statement-breakpoint
ALTER TABLE "body_measurement" ADD CONSTRAINT "body_measurement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "body_measurement_user_id_idx" ON "body_measurement" USING btree ("user_id");