// Funil e retenção a partir do próprio banco (sem ferramenta de terceiros).
// Uso: `bun run metrics` (banco local) ou `bun run metrics:prod` (Neon, lê
// `.env.neon`). Só leitura, só números agregados: nada de nome ou e-mail.
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida.");

const pool = new Pool({ connectionString: url });

const percent = (part: number, total: number) =>
	total === 0 ? "—" : `${Math.round((part / total) * 100)}%`;

async function query<T>(text: string) {
	const { rows } = await pool.query(text);
	return rows as T[];
}

// Cada pessoa com as etapas que já cumpriu. "Voltou na 2ª semana" = usou o app
// entre o 7º e o 13º dia depois do cadastro (só conta quem tem 14+ dias).
const PEOPLE = `
	select
		u.id,
		u.created_at,
		to_char(date_trunc('week', u.created_at), 'YYYY-MM-DD') as cohort,
		exists (select 1 from profile p where p.user_id = u.id) as has_profile,
		exists (select 1 from goal g where g.user_id = u.id) as has_goal,
		exists (
			select 1 from diet_item i join diet_meal m on m.id = i.meal_id
			where m.user_id = u.id
		) as has_diet,
		(select count(*) from body_measurement b
			where b.user_id = u.id and b.weight_kg is not null) as weigh_ins,
		u.created_at <= now() - interval '14 days' as eligible_week2,
		exists (
			select 1 from user_activity a
			where a.user_id = u.id
				and a.day between (u.created_at::date + 7) and (u.created_at::date + 13)
		) as returned_week2
	from "user" u
`;

type Person = {
	cohort: string;
	has_profile: boolean;
	has_goal: boolean;
	has_diet: boolean;
	weigh_ins: string;
	eligible_week2: boolean;
	returned_week2: boolean;
};

const people = await query<Person>(PEOPLE);
const total = people.length;
const count = (predicate: (p: Person) => boolean) =>
	people.filter(predicate).length;

const eligible = people.filter((p) => p.eligible_week2);
const [active] = await query<{ d7: string; d30: string }>(`
	select
		count(distinct user_id) filter (where day > current_date - 7) as d7,
		count(distinct user_id) filter (where day > current_date - 30) as d30
	from user_activity
`);

console.log(`\nFunil (${total} cadastros)`);
console.table(
	[
		["Cadastrou", total],
		["Preencheu TMB", count((p) => p.has_profile)],
		["Definiu a meta", count((p) => p.has_goal)],
		["Montou a dieta", count((p) => p.has_diet)],
		["Pesou 2+ vezes", count((p) => Number(p.weigh_ins) >= 2)],
	].map(([etapa, pessoas]) => ({
		etapa,
		pessoas,
		"% dos cadastros": percent(Number(pessoas), total),
	})),
);

console.log("Retenção");
console.table([
	{
		métrica: "Voltou na 2ª semana",
		valor: `${count((p) => p.eligible_week2 && p.returned_week2)} de ${eligible.length}`,
		"%": percent(
			count((p) => p.eligible_week2 && p.returned_week2),
			eligible.length,
		),
	},
	{ métrica: "Ativos nos últimos 7 dias", valor: active.d7, "%": "" },
	{ métrica: "Ativos nos últimos 30 dias", valor: active.d30, "%": "" },
]);

const cohorts = Map.groupBy(people, (p) => p.cohort);
console.log("Por semana de cadastro");
console.table(
	[...cohorts.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([week, group]) => {
			const groupEligible = group.filter((p) => p.eligible_week2);
			return {
				semana: week.split("-").reverse().join("/"),
				cadastros: group.length,
				"montou dieta": percent(
					group.filter((p) => p.has_diet).length,
					group.length,
				),
				"voltou na 2ª semana": percent(
					groupEligible.filter((p) => p.returned_week2).length,
					groupEligible.length,
				),
			};
		}),
);

console.log(
	"Obs.: a atividade diária começou a ser registrada em out/2026; cadastros anteriores aparecem com retenção subestimada.\n",
);
await pool.end();
