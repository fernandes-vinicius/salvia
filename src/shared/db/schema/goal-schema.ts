import {
	doublePrecision,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

export const objectiveEnum = pgEnum("objective", ["lose", "maintain", "gain"]);

// Meta nutricional (aba Meta). Um por usuário.
export const goal = pgTable("goal", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	objective: objectiveEnum("objective").notNull(),
	/** kcal/dia somadas ao gasto (negativo = déficit). */
	calorieAdjustment: integer("calorie_adjustment").notNull(),
	/** Meta de proteína ANIMAL em g/kg (igual à planilha). */
	proteinPerKg: doublePrecision("protein_per_kg").notNull(),
	fatPerKg: doublePrecision("fat_per_kg").notNull(),
	/** g/kg fixado pelo usuário; `null` = automático (o que sobra da meta). */
	carbsPerKg: doublePrecision("carbs_per_kg"),
	/**
	 * Correção do gasto pelo peso real (kcal/dia, soma ao gasto da fórmula).
	 * Vem do ajuste automático; não é editada pelo formulário da Meta.
	 */
	calibrationKcal: integer("calibration_kcal").notNull().default(0),
	/** Quando a correção foi aplicada (a próxima análise começa daqui). */
	calibratedAt: timestamp("calibrated_at"),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
