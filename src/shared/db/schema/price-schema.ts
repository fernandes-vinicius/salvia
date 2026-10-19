import {
	doublePrecision,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "~/shared/db/schema/auth-schema";

export const priceUnitEnum = pgEnum("price_unit", ["kg", "L", "un", "dz"]);

// Preço que a pessoa paga no mercado dela, por item da lista de compras
// (`item_key` = nome sem acento e minúsculo). Vence o preço de referência.
export const userPrice = pgTable(
	"user_price",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		itemKey: text("item_key").notNull(),
		value: doublePrecision("value").notNull(),
		per: priceUnitEnum("per").notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.itemKey] })],
);
