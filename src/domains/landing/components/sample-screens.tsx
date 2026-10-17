"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import {
	SAMPLE_GOAL,
	SAMPLE_MEASUREMENTS,
	SAMPLE_TARGETS,
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

function noop() {}

function Placeholder({ className }: { className: string }) {
	return <div className={`rounded-3xl bg-card ${className}`} />;
}
