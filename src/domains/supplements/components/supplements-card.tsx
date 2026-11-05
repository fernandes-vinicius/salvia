"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import {
	addSupplementAction,
	deleteSupplementAction,
	reorderSupplementsAction,
	type SupplementActionResult,
	updateSupplementAction,
} from "~/domains/supplements/actions/supplement-actions";
import { SupplementSheet } from "~/domains/supplements/components/supplement-sheet";
import type { SupplementInput } from "~/domains/supplements/schemas/supplement-schema";
import type {
	Supplement,
	SupplementMealRef,
} from "~/domains/supplements/types/supplement-types";
import {
	daysLabel,
	doseLabel,
	moveSupplement,
	timingLabel,
} from "~/domains/supplements/utils/supplements";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Check,
	ChevronRight,
	EllipsisVertical,
	Pill,
	Plus,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { analytics } from "~/shared/lib/analytics/analytics";

interface SupplementsCardProps {
	supplements: Supplement[];
	onSupplementsChange: (next: Supplement[]) => void;
	meals: SupplementMealRef[];
	/** Erro "stale": algo mudou em outra aba (recarrega a dieta). */
	onStale: () => void;
}

const inputOf = ({ id: _, ...supplement }: Supplement): SupplementInput =>
	supplement;

// Suplementação na Dieta (Editar): no fim, depois das refeições, como a linha
// "Suplementação" da planilha. Só anotação: não entra nas calorias. O Sálvia
// não indica suplemento nem dose; a pessoa anota o que toma.
export function SupplementsCard({
	supplements,
	onSupplementsChange,
	meals,
	onStale,
}: SupplementsCardProps) {
	const [editing, setEditing] = useState<Supplement | "new" | null>(null);
	const [reordering, setReordering] = useState(false);
	// Ref espelhada: o "Desfazer" do toast roda depois de outras mudanças.
	const listRef = useRef(supplements);
	listRef.current = supplements;

	function setList(next: Supplement[]) {
		listRef.current = next;
		onSupplementsChange(next);
	}

	function handleError(result: Extract<SupplementActionResult, { ok: false }>) {
		if (result.stale) {
			toast.info(
				"Sua dieta mudou em outra aba ou aparelho. Atualizamos a tela.",
			);
			setEditing(null);
			onStale();
			return;
		}
		toast.error(result.error);
	}

	async function save(input: SupplementInput) {
		const current = editing;
		if (current === null) return false;
		const result =
			current === "new"
				? await addSupplementAction(input)
				: await updateSupplementAction(current.id, input);
		if (!result.ok) {
			handleError(result);
			return false;
		}
		if (current === "new") {
			setList([...listRef.current, result.data]);
			analytics.track("suplemento_adicionado", {
				unidade: input.unit,
				momento: input.timing,
				dias: input.days,
			});
		} else {
			setList(
				listRef.current.map((s) => (s.id === current.id ? result.data : s)),
			);
		}
		setEditing(null);
		return true;
	}

	async function remove(supplement: Supplement) {
		setEditing(null);
		const previous = listRef.current;
		const index = previous.findIndex((s) => s.id === supplement.id);
		setList(previous.filter((s) => s.id !== supplement.id));
		const result = await deleteSupplementAction(supplement.id);
		if (!result.ok) {
			setList(previous);
			handleError(result);
			return;
		}
		toast(`${supplement.name} removido da suplementação.`, {
			duration: 8000,
			action: {
				label: "Desfazer",
				onClick: async () => {
					const undo = await addSupplementAction(inputOf(supplement), index);
					if (!undo.ok) {
						handleError(undo);
						return;
					}
					const list = [...listRef.current];
					list.splice(Math.min(index, list.length), 0, undo.data);
					setList(list);
				},
			},
		});
	}

	async function move(id: string, direction: -1 | 1) {
		const previous = listRef.current;
		const next = moveSupplement(previous, id, direction);
		if (next === previous) return;
		setList(next);
		const result = await reorderSupplementsAction(next.map((s) => s.id));
		if (!result.ok) {
			setList(previous);
			handleError(result);
		}
	}

	const count = supplements.length;

	return (
		<section
			aria-labelledby="suplementacao-titulo"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4"
		>
			<header className="flex items-center gap-3">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
					<Pill className="size-5" aria-hidden />
				</span>
				<div className="flex min-w-0 flex-1 flex-col">
					<h3 id="suplementacao-titulo" className="font-heading font-semibold">
						Suplementação
					</h3>
					<p className="text-muted-foreground text-xs">
						{count > 0
							? `${count === 1 ? "1 item" : `${count} itens`} · não entra nas calorias`
							: "Não entra nas calorias"}
					</p>
				</div>
				{reordering ? (
					<Button size="sm" onClick={() => setReordering(false)}>
						<Check data-icon="inline-start" />
						Pronto
					</Button>
				) : (
					count > 1 && (
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button
										variant="ghost"
										size="icon"
										aria-label="Opções da suplementação"
									/>
								}
							>
								<EllipsisVertical />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-auto">
								<DropdownMenuItem onClick={() => setReordering(true)}>
									<ArrowUpDown />
									Reordenar
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)
				)}
			</header>

			{count > 0 ? (
				<ul className="flex flex-col">
					{supplements.map((supplement, index) => {
						const details = (
							<span className="flex min-w-0 flex-1 flex-col gap-0.5">
								<span className="flex items-baseline justify-between gap-3">
									<span className="truncate font-medium text-sm">
										{supplement.name}
									</span>
									<span className="shrink-0 font-heading font-semibold text-sm tabular-nums">
										{doseLabel(supplement.dose, supplement.unit)}
									</span>
								</span>
								<span className="text-muted-foreground text-xs">
									{daysLabel(supplement.days, supplement.weekdays)} ·{" "}
									{timingLabel(supplement, meals)}
								</span>
								{supplement.note && (
									<span className="text-muted-foreground text-xs italic">
										{supplement.note}
									</span>
								)}
							</span>
						);
						return (
							<li
								key={supplement.id}
								className="border-border border-t first:border-t-0"
							>
								{reordering ? (
									<div className="flex items-center gap-2 py-2">
										{details}
										<Button
											variant="ghost"
											size="icon"
											aria-label={`Subir ${supplement.name}`}
											disabled={index === 0}
											onClick={() => move(supplement.id, -1)}
										>
											<ArrowUp />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											aria-label={`Descer ${supplement.name}`}
											disabled={index === count - 1}
											onClick={() => move(supplement.id, 1)}
										>
											<ArrowDown />
										</Button>
									</div>
								) : (
									<button
										type="button"
										onClick={() => setEditing(supplement)}
										aria-label={`Editar ${supplement.name}`}
										className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-2xl px-2 py-2.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										{details}
										<ChevronRight
											className="size-4 shrink-0 text-muted-foreground"
											aria-hidden
										/>
									</button>
								)}
							</li>
						);
					})}
				</ul>
			) : (
				<p className="text-muted-foreground text-sm">
					Creatina, ômega 3, vitaminas… Anote o que você toma ou o que seu
					nutricionista passou, com dose, horário e dias. Sai junto no PDF.
				</p>
			)}

			{!reordering && (
				<Button
					variant="ghost"
					className="self-start text-primary"
					onClick={() => setEditing("new")}
				>
					<Plus data-icon="inline-start" />
					Adicionar suplemento
				</Button>
			)}

			<SupplementSheet
				editing={editing}
				meals={meals}
				onOpenChange={(open) => !open && setEditing(null)}
				onSave={save}
				onDelete={remove}
			/>
		</section>
	);
}
