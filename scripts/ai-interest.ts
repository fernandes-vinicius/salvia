// Quem tocou em "Quero usar mais" com a cota de IA do mês no fim. Uso:
// `bun run ai-interest` (banco local) ou `bun run ai-interest:prod` (Neon, lê
// `.env.neon`). Só leitura; mostra nome e e-mail pra poder avisar quando
// houver um jeito de usar mais.
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida.");

const pool = new Pool({ connectionString: url });
const { rows } = await pool.query<{
	feature: string;
	created_at: Date;
	name: string;
	email: string;
}>(
	`select i.feature, i.created_at, u.name, u.email
	 from ai_interest i join "user" u on u.id = i.user_id
	 order by i.created_at desc`,
);
await pool.end();

const people = new Set(rows.map((row) => row.email)).size;
const byFeature = Object.entries(
	Object.groupBy(rows, (row) => row.feature),
).map(([feature, list]) => `${feature}: ${list?.length ?? 0}`);
console.log(
	`Pediram mais IA: ${people} pessoas · ${byFeature.join(" · ") || "nenhum pedido"}\n`,
);
for (const row of rows) {
	const date = row.created_at.toLocaleDateString("pt-BR", {
		timeZone: "America/Sao_Paulo",
	});
	console.log(`${date} · ${row.feature} · ${row.name} <${row.email}>`);
}
