ALTER TABLE "profile" ADD COLUMN "neat_factor" double precision DEFAULT 1.15 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "strength_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "strength_days" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "strength_minutes" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "strength_met" double precision DEFAULT 5.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "cardio_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "cardio_days" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "cardio_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "cardio_met" double precision DEFAULT 7.5 NOT NULL;