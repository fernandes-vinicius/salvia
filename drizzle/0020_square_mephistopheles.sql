CREATE TYPE "public"."protein_counting" AS ENUM('total', 'animal');--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "protein_counting" "protein_counting" DEFAULT 'total' NOT NULL;--> statement-breakpoint
-- Quem já usava o app definiu a meta pensando em proteína animal (o único
-- jeito até aqui): fica em "só animal". Contas novas começam no total.
INSERT INTO "settings" ("user_id", "protein_counting") SELECT "id", 'animal' FROM "user" ON CONFLICT ("user_id") DO UPDATE SET "protein_counting" = 'animal';
