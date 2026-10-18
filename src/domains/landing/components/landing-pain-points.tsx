import {
	FileSpreadsheet,
	type LucideIcon,
	NotebookPen,
	Wallet,
} from "~/shared/components/icons";
import { APP_NAME } from "~/shared/lib/app-config";

const PAINS: { icon: LucideIcon; title: string; text: string }[] = [
	{
		icon: NotebookPen,
		title: "Dieta no papel ou no print",
		text: "A folha do nutri amassada na mochila, o print no WhatsApp. Mudou uma refeição? Refaz a conta toda.",
	},
	{
		icon: FileSpreadsheet,
		title: "Planilha que quebra",
		text: "Trocou o arroz pela batata e a fórmula sumiu. No celular, então, nem dá pra mexer.",
	},
	{
		icon: Wallet,
		title: "Nutri todo mês pesa no bolso",
		text: "Você já sabe o básico: comer menos do que gasta, g/kg, bater a proteína. Falta uma ferramenta, não uma consulta.",
	},
];

export function LandingPainPoints() {
	return (
		<section className="bg-card">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-20">
				<div className="flex max-w-2xl flex-col gap-3">
					<h2 className="text-balance font-heading font-semibold text-3xl tracking-tight">
						Se identifica?
					</h2>
					<p className="text-pretty text-muted-foreground">
						O {APP_NAME} nasceu da planilha de dieta de um marombeiro: a mesma
						lógica, só que num app que funciona no celular e faz as contas por
						você.
					</p>
				</div>
				<ul className="grid gap-4 md:grid-cols-3">
					{PAINS.map(({ icon: Icon, title, text }) => (
						<li
							key={title}
							className="flex flex-col gap-3 rounded-3xl bg-background p-6"
						>
							<span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
								<Icon className="size-5" aria-hidden />
							</span>
							<h3 className="font-heading font-semibold">{title}</h3>
							<p className="text-pretty text-muted-foreground text-sm">
								{text}
							</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
