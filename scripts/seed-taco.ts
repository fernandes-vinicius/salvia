// Importa a base TACO (src/shared/db/seeds/taco) pra tabela `food`.
// Idempotente: atualiza pelo `taco_id`. Uso: `bun run db:seed:taco`.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
	normalizeSearchText,
	parseCsv,
	tacoMacros,
	tacoProteinSource,
} from "~/domains/food/utils/food";
import { food } from "~/shared/db/schema";

// Rodado via `bun run` na raiz do projeto.
const dir = join(process.cwd(), "src/shared/db/seeds/taco");
const read = (file: string) => parseCsv(readFileSync(join(dir, file), "utf8"));

const categories = new Map(
	read("categories.csv").map((row) => [Number(row.id), row.name]),
);
const nutrients = new Map(
	read("nutrients.csv").map((row) => [Number(row.foodId), row]),
);

const rows = read("food.csv").map((row) => {
	const tacoId = Number(row.id);
	const categoryId = Number(row.categoryId);
	const n = nutrients.get(tacoId);
	if (!n) throw new Error(`Sem nutrientes para o alimento TACO ${tacoId}`);

	return {
		source: "taco" as const,
		tacoId,
		name: row.name,
		searchName: normalizeSearchText(row.name),
		category: categories.get(categoryId) ?? null,
		unit: "g" as const,
		// Vazio = não medido (0), menos as lacunas preenchidas em `tacoMacros`.
		...tacoMacros(row.name, n),
		proteinSource: tacoProteinSource(categoryId, row.name),
	};
});

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida (veja .env.example).");

const pool = new Pool({ connectionString: url });
const db = drizzle({ client: pool });

await db
	.insert(food)
	.values(rows)
	.onConflictDoUpdate({
		target: food.tacoId,
		set: {
			name: sql`excluded.name`,
			searchName: sql`excluded.search_name`,
			category: sql`excluded.category`,
			protein: sql`excluded.protein`,
			carbs: sql`excluded.carbs`,
			fat: sql`excluded.fat`,
			fiber: sql`excluded.fiber`,
			proteinSource: sql`excluded.protein_source`,
		},
	});

const animal = rows.filter((r) => r.proteinSource === "animal").length;
console.log(
	`TACO: ${rows.length} alimentos importados (${animal} com proteína animal).`,
);
await pool.end();
