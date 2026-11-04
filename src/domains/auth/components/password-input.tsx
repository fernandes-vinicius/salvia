"use client";

import { useState } from "react";

import { Eye, EyeOff } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";

export function PasswordInput(
	props: Omit<React.ComponentProps<typeof Input>, "type">,
) {
	const [visible, setVisible] = useState(false);
	const Icon = visible ? EyeOff : Eye;

	return (
		<div className="relative">
			<Input
				{...props}
				type={visible ? "text" : "password"}
				className="pr-11"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
				aria-label={visible ? "Esconder senha" : "Mostrar senha"}
				aria-pressed={visible}
				onClick={() => setVisible((current) => !current)}
			>
				<Icon />
			</Button>
		</div>
	);
}
