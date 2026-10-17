import {
	boolean,
	doublePrecision,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

export const sexEnum = pgEnum("sex", ["male", "female"]);

// Dados corporais usados no cálculo da TMB/GCD (aba TMB). Um por usuário.
export const profile = pgTable("profile", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	sex: sexEnum("sex").notNull(),
	ageYears: integer("age_years").notNull(),
	weightKg: doublePrecision("weight_kg").notNull(),
	heightCm: integer("height_cm").notNull(),
	/** Movimento do dia a dia SEM treino (NEAT), multiplica a TMB. */
	neatFactor: doublePrecision("neat_factor").notNull().default(1.15),
	// Treinos somados à parte, por MET (calorias = (MET − 1) × kg × horas).
	strengthEnabled: boolean("strength_enabled").notNull().default(false),
	strengthDays: integer("strength_days").notNull().default(3),
	strengthMinutes: integer("strength_minutes").notNull().default(60),
	strengthMet: doublePrecision("strength_met").notNull().default(5.5),
	cardioEnabled: boolean("cardio_enabled").notNull().default(false),
	cardioDays: integer("cardio_days").notNull().default(3),
	cardioMinutes: integer("cardio_minutes").notNull().default(30),
	cardioMet: doublePrecision("cardio_met").notNull().default(7.5),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
