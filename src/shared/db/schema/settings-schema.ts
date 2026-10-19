import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

export const bmrFormulaEnum = pgEnum("bmr_formula", ["mifflin", "harris"]);

// Preferências do usuário (tela Configurações). Um por usuário; sem linha =
// valores padrão.
export const settings = pgTable("settings", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	bmrFormula: bmrFormulaEnum("bmr_formula").notNull().default("mifflin"),
	/** Confete e animações ao cumprir metas (check-in, dia completo…). */
	celebrations: boolean("celebrations").notNull().default(true),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
