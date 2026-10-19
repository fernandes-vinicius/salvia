"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import {
	SAMPLE_CALIBRATION,
	SAMPLE_CHECKINS,
	SAMPLE_GOAL,
	SAMPLE_MEALS,
	SAMPLE_MEASUREMENTS,
	SAMPLE_SHOPPING,
	SAMPLE_SHOPPING_COST,
	SAMPLE_TARGETS,
	SAMPLE_TODAY,
} from "~/domains/landing/utils/sample-data";
import type { MeasurementKey } from "~/domains/measurements/types/measurement-types";

// Estas telas ficam bem abaixo da dobra: o JS delas (sliders, Recharts, o
// maior pacote da página) carrega depois da hidratação, sem pesar no
// carregamento inicial. O espaço reservado tem a altura aproximada da tela.
const MacroTargets = dynamic(
	() =>
		import("~/domains/goal/components/macro-targets").then(
			(mod) => mod.MacroTargets,
		),
	{ ssr: false, loading: () => <Placeholder className="h-64" /> },
);

const MeasurementStats = dynamic(
	() =>
		import("~/domains/measurements/components/measurement-stats").then(
			(mod) => mod.MeasurementStats,
		),
	{ ssr: false, loading: () => <Placeholder className="h-72 lg:h-32" /> },
);

const EvolutionChart = dynamic(
	() =>
		import("~/domains/measurements/components/evolution-chart").then(
			(mod) => mod.EvolutionChart,
		),
	{
		ssr: false,
		loading: () => <Placeholder className="h-[22.5rem]" />,
	},
);

const CalibrationCard = dynamic(
	() =>
		import("~/domains/goal/components/calibration-card").then(
			(mod) => mod.CalibrationCard,
		),
	{ ssr: false, loading: () => <Placeholder className="h-56" /> },
);

const ShoppingGroups = dynamic(
	() =>
		import("~/domains/shopping/components/shopping-groups").then(
			(mod) => mod.ShoppingGroups,
		),
	{ ssr: false, loading: () => <Placeholder className="h-[26rem]" /> },
);

const CheckinCard = dynamic(
	() =>
		import("~/domains/checkin/components/checkin-card").then(
			(mod) => mod.CheckinCard,
		),
	{ ssr: false, loading: () => <Placeholder className="h-[26rem]" /> },
);

// Telas interativas do app com os dados da persona. Na landing ficam dentro
// de `ShowcaseFrame` (inert), então os callbacks nunca disparam.

export function SampleMacroTargets() {
	return (
		<MacroTargets goal={SAMPLE_GOAL} targets={SAMPLE_TARGETS} onChange={noop} />
	);
}

export function SampleMeasurements() {
	const [selected, setSelected] = useState<MeasurementKey>("weightKg");
	return (
		<>
			<MeasurementStats
				measurements={SAMPLE_MEASUREMENTS}
				selected={selected}
				onSelect={setSelected}
			/>
			<EvolutionChart
				measurements={SAMPLE_MEASUREMENTS}
				selected={selected}
				onSelect={setSelected}
			/>
		</>
	);
}

export function SampleCalibration() {
	return (
		<CalibrationCard
			analysis={SAMPLE_CALIBRATION}
			calibration={{ kcal: 0, since: null }}
		/>
	);
}

/** Seções que mais mostram a conversão (pronto → cru, unidades). */
const SHOWN_SECTIONS = new Set([
	"Açougue e peixaria",
	"Laticínios e ovos",
	"Mercearia",
]);
const SAMPLE_CHECKED = new Set(["rule:Ovos", "rule:Arroz"]);

export function SampleShopping() {
	return (
		<ShoppingGroups
			groups={SAMPLE_SHOPPING.filter((group) =>
				SHOWN_SECTIONS.has(group.section),
			)}
			checked={SAMPLE_CHECKED}
			onToggle={noop}
			prices={SAMPLE_SHOPPING_COST.byItem}
			onEditPrice={noop}
			className="md:grid-cols-1"
		/>
	);
}

export function SampleCheckin() {
	return (
		<CheckinCard
			meals={SAMPLE_MEALS.map((meal) => ({
				id: meal.id,
				name: meal.name,
				time: meal.time,
			}))}
			today={SAMPLE_TODAY}
			initialCheckins={SAMPLE_CHECKINS}
		/>
	);
}

function noop() {}

function Placeholder({ className }: { className: string }) {
	return <div className={`rounded-3xl bg-card ${className}`} />;
}
