import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { MascotCelebration } from "~/domains/checkin/components/mascot-celebration";
import type { CheckinCelebration } from "~/domains/checkin/utils/checkin";
import { mascotMoment } from "~/domains/checkin/utils/mascot";
import { WaterCelebration } from "~/domains/water/components/water-celebration";
import { THIRST_LOOK, waterMoment } from "~/domains/water/utils/water-moment";
import { PlantProvider } from "~/shared/components/mascot/plant-context";
import { PotMascot } from "~/shared/components/mascot/pot-mascot";
import { Button } from "~/shared/components/ui/button";

const meta = {
	title: "App/Mascote",
	component: PotMascot,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'Jarrinho do Sálvia: ganha uma folha a cada refeição seguida no dia e floresce quando o dia fica completo. No Início, aparece depois de cada "Comi" (`MascotCelebration`), com a frase de `mascotMoment`.',
			},
		},
	},
	args: { leaves: 3 },
} satisfies Meta<typeof PotMascot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Estagios: Story = {
	name: "Estágios do dia",
	render: () => (
		<div className="flex flex-wrap items-end gap-6">
			{[1, 2, 3, 4].map((leaves) => (
				<figure key={leaves} className="flex flex-col items-center gap-1">
					<PotMascot leaves={leaves} className="h-36 w-auto" />
					<figcaption className="text-muted-foreground text-xs">
						{leaves} de 4
					</figcaption>
				</figure>
			))}
			<figure className="flex flex-col items-center gap-1">
				<PotMascot leaves={4} bloom mood="party" className="h-36 w-auto" />
				<figcaption className="text-muted-foreground text-xs">
					dia completo
				</figcaption>
			</figure>
		</div>
	),
};

const MEALS = 4;

export const NoCheckin: Story = {
	name: "Depois do “Comi”",
	render: function Render() {
		const [shown, setShown] = useState<{
			id: number;
			followed: number;
			level: CheckinCelebration;
			streak: number;
		} | null>(null);
		const show = (followed: number, level: CheckinCelebration, streak = 0) =>
			setShown({ id: Date.now(), followed, level, streak });

		return (
			<div className="flex min-h-96 flex-wrap content-start gap-2">
				{[1, 2, 3].map((followed) => (
					<Button
						key={followed}
						variant="outline"
						onClick={() => show(followed, "tap")}
					>
						Comi ({followed} de {MEALS})
					</Button>
				))}
				<Button onClick={() => show(MEALS, "day", 2)}>Dia completo</Button>
				<Button onClick={() => show(MEALS, "milestone", 7)}>
					7 dias seguidos
				</Button>
				{shown && (
					<MascotCelebration
						key={shown.id}
						followed={shown.followed}
						mealCount={MEALS}
						moment={mascotMoment({
							level: shown.level,
							followed: shown.followed,
							mealCount: MEALS,
							streak: shown.streak,
						})}
						onDone={() => setShown(null)}
					/>
				)}
			</div>
		);
	},
};

export const DiaCompleto: Story = {
	name: "Balão do dia completo",
	render: () => (
		<div className="min-h-96">
			<MascotCelebration
				followed={MEALS}
				mealCount={MEALS}
				moment={mascotMoment({
					level: "day",
					followed: MEALS,
					mealCount: MEALS,
					streak: 2,
				})}
				onDone={() => {}}
			/>
		</div>
	),
};

export const Folha: Story = {
	name: "Balão de uma refeição",
	render: () => (
		<div className="min-h-96">
			<MascotCelebration
				followed={2}
				mealCount={MEALS}
				moment={mascotMoment({
					level: "tap",
					followed: 2,
					mealCount: MEALS,
					streak: 0,
				})}
				onDone={() => {}}
			/>
		</div>
	),
};

const plantWithThreeLeaves = { leaves: 3, bloom: false };

export const Regando: Story = {
	name: "Balão da água",
	render: () => (
		<PlantProvider initial={plantWithThreeLeaves}>
			<div className="min-h-96">
				<WaterCelebration
					percent={45}
					moment={waterMoment({
						level: null,
						added: 250,
						total: 1250,
						target: 2800,
						streak: 0,
					})}
					onDone={() => {}}
				/>
			</div>
		</PlantProvider>
	),
};

export const MetaDeAgua: Story = {
	name: "Meta de água batida",
	render: () => (
		<PlantProvider initial={plantWithThreeLeaves}>
			<div className="min-h-96">
				<WaterCelebration
					percent={100}
					moment={waterMoment({
						level: "day",
						added: 500,
						total: 2800,
						target: 2800,
						streak: 2,
					})}
					onDone={() => {}}
				/>
			</div>
		</PlantProvider>
	),
};

export const CardDaAgua: Story = {
	name: "No card da água",
	render: () => (
		<div className="flex flex-wrap items-end gap-6">
			{(["thirsty", "fine", "hydrated"] as const).map((thirst) => (
				<figure key={thirst} className="flex flex-col items-center gap-1">
					<PotMascot
						leaves={3}
						droop={THIRST_LOOK[thirst].droop}
						wilted={THIRST_LOOK[thirst].wilted}
						mood={THIRST_LOOK[thirst].mood}
						dew={thirst === "hydrated"}
						label={THIRST_LOOK[thirst].label}
						className="h-28 w-auto"
					/>
					<figcaption className="text-muted-foreground text-xs">
						{THIRST_LOOK[thirst].label}
					</figcaption>
				</figure>
			))}
		</div>
	),
};
