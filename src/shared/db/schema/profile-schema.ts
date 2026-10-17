import {
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
	activityFactor: doublePrecision("activity_factor").notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
