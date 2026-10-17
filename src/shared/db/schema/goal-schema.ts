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

// Meta nutricional (aba Meta). Um por usuário. Carboidrato não é guardado:
// é sempre o que sobra da meta de calorias.
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
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
