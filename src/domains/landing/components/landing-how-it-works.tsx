import type { ReactNode } from "react";

import { GoalProgress } from "~/domains/diet/components/goal-progress";
import { SampleMacroTargets } from "~/domains/landing/components/sample-screens";
import { ShowcaseFrame } from "~/domains/landing/components/showcase-frame";
import {
	SAMPLE_ENERGY,
	SAMPLE_SUMMARY,
	SAMPLE_TARGETS,
} from "~/domains/landing/utils/sample-data";
import { EnergySummary } from "~/domains/profile/components/energy-summary";
import { NotebookPen } from "~/shared/components/icons";

const STEPS: { title: string; text: string; visual: ReactNode }[] = [
	{
		title: "Seus dados",
		text: "Peso, altura, idade, rotina e treino. O app calcula a TMB e o gasto do dia.",
		visual: (
			<EnergySummary energy={SAMPLE_ENERGY} status="saved" isExample={false} />
		),
	},
	{
		title: "Sua meta",
		text: "Escolha o ritmo e os g/kg de proteína e gordura. O carbo fecha a conta.",
		visual: <SampleMacroTargets />,
	},
	{
		title: "Sua dieta",
		text: "Monte as refeições e veja, em tempo real, quanto falta pra bater cada macro.",
		visual: <GoalProgress summary={SAMPLE_SUMMARY} targets={SAMPLE_TARGETS} />,
	},
];

export function LandingHowItWorks() {
	return (
		<section id="como-funciona" className="scroll-mt-20 bg-card">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:py-24">
				<div className="flex max-w-2xl flex-col gap-3">
					<h2 className="text-balance font-heading font-semibold text-3xl tracking-tight">
						Três passos e a dieta tá no ar
					</h2>
					<p className="text-pretty text-muted-foreground">
						Sem fórmula pra decorar: você escolhe opções descritivas e o app
						mostra os números.
					</p>
				</div>

				<ol className="grid gap-12 lg:grid-cols-3 lg:gap-8">
					{STEPS.map((step, index) => (
						<li key={step.title} className="flex min-w-0 flex-col gap-5">
							<div className="flex gap-4">
								<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading font-semibold text-primary-foreground text-sm tabular-nums">
									{index + 1}
								</span>
								<div className="flex flex-col gap-1">
									<h3 className="font-heading font-semibold">{step.title}</h3>
									<p className="text-pretty text-muted-foreground text-sm">
										{step.text}
									</p>
								</div>
							</div>
							<ShowcaseFrame
								label={`Tela do passo ${index + 1}: ${step.title}`}
								className="bg-background"
							>
								{step.visual}
							</ShowcaseFrame>
						</li>
					))}
				</ol>

				<div className="flex gap-4 rounded-3xl bg-secondary/60 p-5 lg:mx-auto lg:max-w-3xl">
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
		</section>
	);
}
