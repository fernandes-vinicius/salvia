import {
	date,
	doublePrecision,
	index,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

// Medidas corporais ao longo do tempo (substitui a planilha de medidas).
// Tudo opcional: nem toda medição mede tudo. Uma por dia por usuário.
export const bodyMeasurement = pgTable(
	"body_measurement",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		measuredOn: date("measured_on").notNull(),
		weightKg: doublePrecision("weight_kg"),
		waistCm: doublePrecision("waist_cm"),
		neckCm: doublePrecision("neck_cm"),
		shoulderCm: doublePrecision("shoulder_cm"),
		chestCm: doublePrecision("chest_cm"),
		bicepsLeftCm: doublePrecision("biceps_left_cm"),
		bicepsRightCm: doublePrecision("biceps_right_cm"),
		forearmLeftCm: doublePrecision("forearm_left_cm"),
		forearmRightCm: doublePrecision("forearm_right_cm"),
		abdomenCm: doublePrecision("abdomen_cm"),
		hipsCm: doublePrecision("hips_cm"),
		thighLeftCm: doublePrecision("thigh_left_cm"),
		thighRightCm: doublePrecision("thigh_right_cm"),
		calfLeftCm: doublePrecision("calf_left_cm"),
		calfRightCm: doublePrecision("calf_right_cm"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("body_measurement_user_id_idx").on(table.userId),
		unique("body_measurement_user_day").on(table.userId, table.measuredOn),
	],
);
