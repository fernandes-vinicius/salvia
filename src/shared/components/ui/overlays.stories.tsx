import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import {
	EllipsisVertical,
	FileDown,
	RotateCcw,
	ShoppingCart,
} from "~/shared/components/icons";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/shared/components/ui/alert-dialog";
import { Button } from "~/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/shared/components/ui/sheet";

const meta = {
	title: "Componentes/Painéis e menus",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Painéis de adicionar/editar sobem de baixo (`BottomSheetContent` dentro de `<Sheet>`). Confirmações destrutivas usam `AlertDialog`; ações de uma tela inteira ficam num menu ⋮.",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PainelDeBaixo: Story = {
	name: "Painel de baixo (bottom sheet)",
	render: () => (
		<Sheet>
			<SheetTrigger render={<Button />}>Abrir painel</SheetTrigger>
			<BottomSheetContent>
				<SheetHeader className="text-center">
					<SheetTitle>Arroz, tipo 1, cozido</SheetTitle>
					<SheetDescription>Tabela TACO</SheetDescription>
				</SheetHeader>
				<div className="p-4 text-sm">
					Conteúdo do painel (quantidade, opções…).
				</div>
			</BottomSheetContent>
		</Sheet>
	),
};

export const Confirmacao: Story = {
	name: "Confirmação",
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger render={<Button variant="destructive" />}>
				Resetar dieta
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Resetar a dieta?</AlertDialogTitle>
					<AlertDialogDescription>
						Apaga todas as refeições e alimentos e recria 3 refeições em branco.
						Não dá pra desfazer.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction variant="destructive">Resetar</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
};

export const Menu: Story = {
	name: "Menu de opções",
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="outline" size="icon" aria-label="Opções da dieta" />
				}
			>
				<EllipsisVertical />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-auto">
				<DropdownMenuItem>
					<FileDown />
					Exportar PDF
				</DropdownMenuItem>
				<DropdownMenuItem>
					<ShoppingCart />
					Lista de compras
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">
					<RotateCcw />
					Resetar dieta
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};
