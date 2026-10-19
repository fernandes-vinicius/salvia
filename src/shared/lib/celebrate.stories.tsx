import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Check } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { type CelebrationLevel, celebrate } from "~/shared/lib/celebrate";
import { cn } from "~/shared/lib/utils";

const LEVELS: { level: CelebrationLevel; label: string; when: string }[] = [
	{ level: "tap", label: "Toque", when: "Marcou uma refeição no check-in." },
	{
		level: "goal",
		label: "Meta",
		when: "Pesagem nova, dieta batendo a meta, fibra no recomendado.",
	},
	{
		level: "day",
		label: "Dia completo",
		when: "Última refeição do dia marcada.",
	},
	{
		level: "milestone",
		label: "Marco",
		when: "Sequência chegou a 3, 7, 14, 30, 60 ou 100 dias.",
	},
];

const meta = {
	title: "App/Comemorações",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'Retorno visual ao cumprir metas, proporcional à conquista (`celebrate` em `~/shared/lib/celebrate`, ou `useCelebrate()` no app, que respeita o interruptor de Configurações). Só em transições pra frente; nada com "reduzir movimento" ligado. O `canvas-confetti` é baixado só na primeira comemoração.',
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Niveis: Story = {
	name: "Níveis",
	render: () => (
		<div className="flex max-w-xl flex-col gap-2">
			{LEVELS.map(({ level, label, when }) => (
				<div
					key={level}
					className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4"
				>
					<span className="flex flex-col text-sm">
						<span className="font-medium">{label}</span>
						<span className="text-muted-foreground text-xs">{when}</span>
					</span>
					<Button
						size="sm"
						onClick={(event) =>
							celebrate(level, event.currentTarget.getBoundingClientRect())
						}
					>
						Disparar
					</Button>
				</div>
			))}
		</div>
	),
};

export const BotaoDoCheckin: Story = {
	name: "Botão do check-in",
	render: function Render() {
		const [pressed, setPressed] = useState(false);
		const [pop, setPop] = useState(false);
		return (
			<Button
				size="sm"
				variant={pressed ? "default" : "outline"}
				aria-pressed={pressed}
				className={cn(pop && "motion-safe:animate-pop")}
				onClick={(event) => {
					const next = !pressed;
					setPressed(next);
					if (!next) return;
					setPop(true);
					setTimeout(() => setPop(false), 450);
					celebrate("tap", event.currentTarget.getBoundingClientRect());
				}}
			>
				<Check
					data-icon="inline-start"
					className={cn(pop && "motion-safe:animate-check")}
				/>
				Comi
			</Button>
		);
	},
};
