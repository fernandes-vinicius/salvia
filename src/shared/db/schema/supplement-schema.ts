import {
	doublePrecision,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import {
	SUPPLEMENT_DAYS,
	SUPPLEMENT_TIMINGS,
	SUPPLEMENT_UNITS,
} from "~/domains/supplements/types/supplement-types";
import { user } from "~/shared/db/schema/auth-schema";
import { dietMeal } from "~/shared/db/schema/diet-schema";

export const supplementUnitEnum = pgEnum("supplement_unit", SUPPLEMENT_UNITS);
export const supplementTimingEnum = pgEnum(
	"supplement_timing",
	SUPPLEMENT_TIMINGS,
);
export const supplementDaysEnum = pgEnum("supplement_days", SUPPLEMENT_DAYS);

// Suplementação da dieta (seção no fim da Dieta, no Visualizar/PDF e no
// link compartilhado). Só anotação: não entra nas calorias nem nos macros.
export const dietSupplement = pgTable(
	"diet_supplement",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		dose: doublePrecision("dose").notNull(),
		unit: supplementUnitEnum("unit").notNull(),
		timing: supplementTimingEnum("timing").notNull(),
		/** Refeição de quando `timing` = "meal"; vira nulo se ela for apagada. */
		mealId: uuid("meal_id").references(() => dietMeal.id, {
			onDelete: "set null",
		}),
		/** "HH:MM" quando `timing` = "time". */
		time: text("time"),
		days: supplementDaysEnum("days").notNull(),
		/** 0 = domingo … 6 = sábado, quando `days` = "weekdays". */
		weekdays: integer("weekdays").array().notNull().default([]),
		note: text("note"),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("diet_supplement_user_id_idx").on(table.userId)],
);
