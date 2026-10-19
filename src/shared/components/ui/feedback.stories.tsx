import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ShoppingCart, TriangleAlertIcon } from "~/shared/components/icons";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "~/shared/components/ui/alert";
import { Button } from "~/shared/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "~/shared/components/ui/empty";
import { Progress } from "~/shared/components/ui/progress";
import { Skeleton } from "~/shared/components/ui/skeleton";

const meta = {
	title: "Componentes/Avisos e estados",
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Alerta: Story = {
	render: () => (
		<div className="flex max-w-md flex-col gap-3">
			<Alert>
				<AlertTitle>Ajuste pelo seu peso</AlertTitle>
				<AlertDescription>
					Seu peso caiu menos que o esperado. Que tal comer 150 kcal a menos por
					dia?
				</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<TriangleAlertIcon />
				<AlertDescription className="text-destructive!">
					Não foi possível entrar com o Google. Tente novamente.
				</AlertDescription>
			</Alert>
		</div>
	),
};

export const Vazio: Story = {
	render: () => (
		<Empty className="max-w-md rounded-2xl bg-card">
			<EmptyHeader>
				<EmptyMedia
					variant="icon"
					className="rounded-full bg-secondary text-primary"
				>
					<ShoppingCart />
				</EmptyMedia>
				<EmptyTitle>Sua dieta ainda está vazia</EmptyTitle>
				<EmptyDescription>
					A lista sai dos alimentos da sua dieta. Monte as refeições e volte
					aqui.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button>Montar dieta</Button>
			</EmptyContent>
		</Empty>
	),
};

export const Carregando: Story = {
	render: () => (
		<div className="flex max-w-md flex-col gap-3">
			<Skeleton className="h-9 w-48" />
			<Skeleton className="h-24 rounded-3xl" />
			<Progress value={64} aria-label="Progresso" />
		</div>
	),
};
