import type { Metadata } from "next";

import { AttentionList } from "~/domains/home/components/attention-list";
import { SetupChecklist } from "~/domains/home/components/setup-checklist";
import { Flame, Plus } from "~/shared/components/icons";
import { ModeToggle } from "~/shared/components/mode-toggle";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/shared/components/ui/card";
import { Field, FieldLabel } from "~/shared/components/ui/field";
import { Input } from "~/shared/components/ui/input";
import {
	Progress,
	ProgressLabel,
	ProgressValue,
} from "~/shared/components/ui/progress";

export const metadata: Metadata = { title: "Design system" };

const colorTokens = [
	{ name: "background", className: "bg-background" },
	{ name: "card", className: "bg-card" },
	{ name: "muted", className: "bg-muted" },
	{ name: "secondary", className: "bg-secondary" },
	{ name: "accent", className: "bg-accent" },
	{ name: "primary", className: "bg-primary" },
	{ name: "foreground", className: "bg-foreground" },
	{ name: "destructive", className: "bg-destructive" },
	{ name: "border", className: "bg-border" },
	{ name: "ring", className: "bg-ring" },
];

const chartTokens = [
	"bg-chart-1",
	"bg-chart-2",
	"bg-chart-3",
	"bg-chart-4",
	"bg-chart-5",
];

const macros = [
	{ name: "Proteína", grams: 167, goal: 154, className: "bg-macro-protein" },
	{ name: "Carboidrato", grams: 138, goal: 140, className: "bg-macro-carb" },
	{ name: "Gordura", grams: 54, goal: 60, className: "bg-macro-fat" },
];

export default function DesignSystemPage() {
	return (
		<main className="container-wrapper flex flex-col gap-12">
			<header className="flex items-center justify-between">
				<div>
					<p className="text-muted-foreground text-sm">Verde-sálvia + creme</p>
					<h1 className="font-heading font-semibold text-3xl">Design system</h1>
				</div>
				<ModeToggle />
			</header>

			<section className="flex flex-col gap-4">
				<h2 className="font-heading font-semibold text-lg">Cores</h2>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
					{colorTokens.map((token) => (
						<div key={token.name} className="flex flex-col gap-2">
							<div
								className={`${token.className} h-16 rounded-xl ring-1 ring-foreground/5`}
							/>
							<span className="text-muted-foreground text-xs">
								{token.name}
							</span>
						</div>
					))}
				</div>
				<div className="flex gap-2">
					{chartTokens.map((className) => (
						<div
							key={className}
							className={`${className} h-8 flex-1 rounded-lg`}
						/>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-4">
				<h2 className="font-heading font-semibold text-lg">Tipografia</h2>
				<p className="font-heading font-semibold text-5xl tabular-nums">
					1706
					<span className="font-normal text-muted-foreground text-xl">
						{" "}
						/ 2177 kcal
					</span>
				</p>
				<p className="font-heading font-semibold text-2xl">Refeição 2 — 12h</p>
				<p className="text-sm">
					Texto de corpo em Inter. Títulos e números em Manrope.
				</p>
				<p className="text-muted-foreground text-sm">
					Texto secundário para descrições e legendas.
				</p>
			</section>

			<section className="flex flex-col gap-4">
				<h2 className="font-heading font-semibold text-lg">Botões e badges</h2>
				<div className="flex flex-wrap items-center gap-2">
					<Button>
						<Plus data-icon="inline-start" />
						Adicionar alimento
					</Button>
					<Button variant="secondary">Secundário</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Excluir</Button>
					<Button variant="link">Link</Button>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Badge>Primária</Badge>
					<Badge variant="secondary">Secundária</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="destructive">Acima da meta</Badge>
				</div>
			</section>

			<section className="grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Resumo do dia</CardTitle>
						<CardDescription>Déficit de 471 kcal</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<div className="flex items-center gap-2">
							<Flame className="size-5 text-primary" />
							<span className="font-heading font-semibold text-3xl tabular-nums">
								1706
							</span>
							<span className="text-muted-foreground">/ 2177 kcal</span>
						</div>
						{macros.map((macro) => (
							<div key={macro.name} className="flex flex-col gap-1.5">
								<div className="flex justify-between text-sm">
									<span>{macro.name}</span>
									<span className="text-muted-foreground tabular-nums">
										{macro.grams}g / {macro.goal}g
									</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-muted">
									<div
										className={`${macro.className} h-full rounded-full`}
										style={{
											width: `${Math.min(100, (macro.grams / macro.goal) * 100)}%`,
										}}
									/>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card className="bg-secondary ring-0">
					<CardHeader>
						<CardTitle>Perfil</CardTitle>
						<CardDescription>Card de destaque em sálvia claro</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<Field>
							<FieldLabel htmlFor="peso">Peso (kg)</FieldLabel>
							<Input id="peso" inputMode="decimal" defaultValue="70" />
						</Field>
						<Progress value={78}>
							<ProgressLabel>Meta de proteína</ProgressLabel>
							<ProgressValue />
						</Progress>
					</CardContent>
				</Card>
			</section>

			<section className="flex flex-col gap-4">
				<h2 className="font-heading font-semibold text-lg">
					Início: blocos condicionais
				</h2>
				<SetupChecklist
					steps={[
						{
							label: "Preencher seus dados",
							description: "Peso, altura, idade e rotina.",
							href: "/tmb",
							done: true,
						},
						{
							label: "Definir sua meta",
							description: "Perder, manter ou ganhar, e os macros do dia.",
							href: "/meta",
							done: false,
						},
						{
							label: "Montar sua dieta",
							description: "Refeições e alimentos, comparados com a meta.",
							href: "/dieta",
							done: false,
						},
					]}
				/>
				<AttentionList
					items={[
						{
							id: "goal",
							message:
								"Sua meta ficou abaixo do que o corpo gasta em repouso (TMB).",
							href: "/meta",
							action: "Ajustar meta",
						},
						{
							id: "food",
							message:
								"whey protein está com 25 g de proteína por 100 g. Isso parece ser o valor de uma dose.",
							href: "/configuracoes",
							action: "Revisar alimento",
						},
					]}
				/>
			</section>
		</main>
	);
}
