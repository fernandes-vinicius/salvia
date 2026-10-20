ALTER TABLE "goal" ADD COLUMN "started_on" date;--> statement-breakpoint
ALTER TABLE "goal" ADD COLUMN "reviewed_day" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Contas que já tinham meta: a dieta conta desde o último ajuste pelo peso
-- ou desde a última mudança da meta.
UPDATE "goal" SET "started_on" = (coalesce("calibrated_at", "updated_at") AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date WHERE "started_on" IS NULL;
