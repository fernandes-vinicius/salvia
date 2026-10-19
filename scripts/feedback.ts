// Sugestões e problemas enviados pelo app ("Enviar sugestão" no menu do
// perfil). Uso: `bun run feedback` (banco local) ou `bun run feedback:prod`
// (Neon, lê `.env.neon`). Só leitura; mostra quem mandou (nome e e-mail, pra
// poder responder), o tipo, a página e a mensagem. `-- --dias=30` muda o
// período (padrão: 30 dias).
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida.");

const days = Number(
	process.argv.find((arg) => arg.startsWith("--dias="))?.split("=")[1] ?? 30,
);
const LABELS: Record<string, string> = {
	feature: "Ideia",
	problem: "Problema",
	other: "Outro",
};

const pool = new Pool({ connectionString: url });
const { rows } = await pool.query<{
	kind: string;
	message: string;
	page: string | null;
	created_at: Date;
	name: string;
	email: string;
}>(
	`select f.kind, f.message, f.page, f.created_at, u.name, u.email
	 from feedback f join "user" u on u.id = f.user_id
	 where f.created_at >= now() - make_interval(days => $1)
	 order by f.created_at desc`,
	[days],
);
await pool.end();

const totals = Object.entries(LABELS)
	.map(
		([kind, label]) =>
			`${label}: ${rows.filter((r) => r.kind === kind).length}`,
	)
	.join(" · ");
console.log(`Feedback dos últimos ${days} dias (${rows.length}) · ${totals}\n`);
for (const row of rows) {
	const date = row.created_at.toLocaleString("pt-BR", {
		timeZone: "America/Sao_Paulo",
	});
	console.log(`[${LABELS[row.kind] ?? row.kind}] ${date} · ${row.page ?? "—"}`);
	console.log(`  ${row.name} <${row.email}>`);
	console.log(`  ${row.message.replace(/\n/g, "\n  ")}\n`);
}
