"use client";

import { useState } from "react";

import { MacroTargets } from "~/domains/goal/components/macro-targets";
import {
	SAMPLE_GOAL,
	SAMPLE_MEASUREMENTS,
	SAMPLE_TARGETS,
} from "~/domains/landing/utils/sample-data";
import { EvolutionChart } from "~/domains/measurements/components/evolution-chart";
import { MeasurementStats } from "~/domains/measurements/components/measurement-stats";
import type { MeasurementKey } from "~/domains/measurements/types/measurement-types";

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
