// Sugestões e problemas enviados pelo app ("Enviar sugestão" no menu do
// perfil). Uso: `bun run feedback` (banco local) ou `bun run feedback:prod`
// (Neon, lê `.env.neon`). Só leitura; mostra a mensagem, o tipo e a página,
// sem nome nem e-mail. `-- --dias=30` muda o período (padrão: 30 dias).
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
}>(
	`select kind, message, page, created_at from feedback
	 where created_at >= now() - make_interval(days => $1)
	 order by created_at desc`,
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
	console.log(`  ${row.message.replace(/\n/g, "\n  ")}\n`);
}
