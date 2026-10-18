"use client";

import { useState } from "react";

import { saveCalculatorDraft } from "~/domains/calculators/utils/calculator-draft";
import { GoalFields } from "~/domains/goal/components/goal-fields";
import { TargetSummary } from "~/domains/goal/components/target-summary";
import type { Goal } from "~/domains/goal/types/goal-types";
import { calculateTargets, defaultGoalFor } from "~/domains/goal/utils/goal";
import { ProfileFields } from "~/domains/profile/components/profile-fields";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	calculateBmr,
	calculateTdee,
	EXAMPLE_PROFILE,
} from "~/domains/profile/utils/energy";

// Calculadora pública de macros: TMB + Meta numa página só (mesmos campos do
// app), começando em "Perder peso", que é o que mais se busca.
export function MacroCalculator() {
	const [profile, setProfile] = useState(EXAMPLE_PROFILE);
	const [goal, setGoal] = useState<Goal>(() => defaultGoalFor("lose"));

	const tdee = calculateTdee(profile);
	const targets = calculateTargets(goal, {
		tdee,
		bmr: calculateBmr(profile),
		weightKg: profile.weightKg,
	});

	function updateProfile<K extends keyof BodyProfile>(
		key: K,
		value: BodyProfile[K],
	) {
		const next = { ...profile, [key]: value };
		setProfile(next);
		saveCalculatorDraft({ profile: next });
	}

	function updateGoal(next: Goal) {
		setGoal(next);
		saveCalculatorDraft({ goal: next, profile });
	}

	return (
		<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
			<TargetSummary
				targets={targets}
				tdee={tdee}
				calorieAdjustment={goal.calorieAdjustment}
				className="sticky top-20 z-10 md:order-2"
			/>
			<div className="flex flex-col gap-12 md:order-1">
				<Step number={1} title="Seu gasto por dia">
					<ProfileFields profile={profile} onChange={updateProfile} />
				</Step>
				<Step number={2} title="Sua meta">
					<GoalFields goal={goal} targets={targets} onChange={updateGoal} />
				</Step>
			</div>
		</div>
	);
}

function Step({
	number,
	title,
	children,
}: {
	number: number;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-6" aria-label={title}>
			<p className="flex items-center gap-3 font-heading font-semibold text-xl">
				<span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm tabular-nums">
					{number}
				</span>
				{title}
			</p>
			{children}
		</section>
	);
}
