import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

export const bmrFormulaEnum = pgEnum("bmr_formula", ["mifflin", "harris"]);
export const proteinCountingEnum = pgEnum("protein_counting", [
	"total",
	"animal",
]);

// Preferências do usuário (tela Configurações). Um por usuário; sem linha =
// valores padrão.
export const settings = pgTable("settings", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	bmrFormula: bmrFormulaEnum("bmr_formula").notNull().default("mifflin"),
	/** Confete e animações ao cumprir metas (check-in, dia completo…). */
	celebrations: boolean("celebrations").notNull().default(true),
	/** Proteína que conta pra meta: total (animal + vegetal) ou só animal. */
	proteinCounting: proteinCountingEnum("protein_counting")
		.notNull()
		.default("total"),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
