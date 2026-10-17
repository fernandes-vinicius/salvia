import { DietSummaryCard } from "~/domains/diet/components/diet-summary";
import { summarizeDiet } from "~/domains/diet/utils/diet";
import {
	SAMPLE_MEALS,
	SAMPLE_PROFILE,
} from "~/domains/landing/utils/sample-diet";
import { NotebookPen } from "~/shared/components/icons";

const STEPS = [
	{
		title: "Seus dados",
		text: "Peso, altura, idade, rotina e treino. O app calcula a TMB e o gasto diário.",
	},
	{
		title: "Sua meta",
		text: "Escolha o ritmo (déficit ou superávit) e os g/kg de proteína e gordura.",
	},
	{
		title: "Sua dieta",
		text: "Monte as refeições e acompanhe, em tempo real, quanto falta pra bater cada macro.",
	},
];

export function LandingHowItWorks() {
	const summary = summarizeDiet(SAMPLE_MEALS, SAMPLE_PROFILE);

	return (
		<section id="como-funciona" className="scroll-mt-20 bg-card">
			<div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_380px] lg:items-center lg:gap-16 lg:py-24">
				<div className="flex flex-col gap-10">
					<div className="flex max-w-2xl flex-col gap-3">
						<h2 className="text-balance font-heading font-semibold text-3xl tracking-tight">
							Três passos e a dieta tá no ar
						</h2>
						<p className="text-pretty text-muted-foreground">
							Sem fórmula pra decorar: você escolhe opções descritivas e o app
							mostra os números.
						</p>
					</div>
					<ol className="flex flex-col gap-6">
						{STEPS.map((step, index) => (
							<li key={step.title} className="flex gap-4">
								<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading font-semibold text-primary-foreground text-sm tabular-nums">
									{index + 1}
								</span>
								<div className="flex flex-col gap-1">
									<h3 className="font-heading font-semibold">{step.title}</h3>
									<p className="text-pretty text-muted-foreground text-sm">
										{step.text}
									</p>
								</div>
							</li>
						))}
					</ol>
					<div className="flex gap-4 rounded-3xl bg-secondary/60 p-5">
						<NotebookPen
							className="mt-0.5 size-5 shrink-0 text-primary"
							aria-hidden
						/>
						<p className="text-pretty text-sm">
							<span className="font-medium">Já tem a dieta no papel?</span>{" "}
							<span className="text-muted-foreground">
								Passa pro app em minutos: busca o alimento, ajusta a gramagem e
								pronto. Os macros e o total do dia aparecem sozinhos.
							</span>
						</p>
					</div>
				</div>

				{/* Resumo real do dia de exemplo (mesmo componente da aba Dieta). */}
				<div aria-hidden className="pointer-events-none select-none">
					<DietSummaryCard summary={summary} tdee={SAMPLE_PROFILE.tdee} />
				</div>
			</div>
		</section>
	);
}
