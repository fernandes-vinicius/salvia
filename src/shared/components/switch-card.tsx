"use client";

import type { ReactNode } from "react";

import type { LucideIcon } from "~/shared/components/icons";
import { Switch } from "~/shared/components/ui/switch";

interface SwitchCardProps {
	icon: LucideIcon;
	title: ReactNode;
	description?: ReactNode;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

// Card inteiro clicável com um Switch (liga/desliga uma seção ou modo).
export function SwitchCard({
	icon: Icon,
	title,
	description,
	checked,
	onCheckedChange,
}: SwitchCardProps) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: o controle é o Switch (Base UI) dentro do label
		<label className="group/switch-card flex cursor-pointer items-center gap-3 rounded-2xl bg-card p-4 transition-colors hover:bg-accent">
			<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-has-data-checked/switch-card:bg-primary group-has-data-checked/switch-card:text-primary-foreground">
				<Icon className="size-5" aria-hidden />
			</span>
			<span className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="font-medium text-sm">{title}</span>
				{description && (
					<span className="text-muted-foreground text-xs tabular-nums">
						{description}
					</span>
				)}
			</span>
			<Switch checked={checked} onCheckedChange={onCheckedChange} />
		</label>
	);
}
