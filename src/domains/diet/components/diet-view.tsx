"use client";

import {
	type Announcements,
	type CollisionDetection,
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	pointerWithin,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import type { WaterResult } from "~/domains/calculators/utils/water";
import {
	type ActionResult,
	addItemAction,
	addItemOptionAction,
	addMealAction,
	deleteItemAction,
	deleteItemOptionAction,
	deleteMealAction,
	placeItemsAction,
	reorderMealsAction,
	replaceItemFoodAction,
	resetDietAction,
	swapItemOptionAction,
	updateMealAction,
} from "~/domains/diet/actions/diet-actions";
import { AddFoodSheet } from "~/domains/diet/components/add-food-sheet";
import { DietPreview } from "~/domains/diet/components/diet-preview";
import { DietSummaryCard } from "~/domains/diet/components/diet-summary";
import { DietSummaryCompact } from "~/domains/diet/components/diet-summary-compact";
import { GoalProgress } from "~/domains/diet/components/goal-progress";
import { ItemSheet } from "~/domains/diet/components/item-sheet";
import { MealCard } from "~/domains/diet/components/meal-card";
import {
	type MealEditFocus,
	MealEditSheet,
} from "~/domains/diet/components/meal-edit-sheet";
import {
	MealMenu,
	type MealMenuActions,
} from "~/domains/diet/components/meal-menu";
import { ReorderMealsSheet } from "~/domains/diet/components/reorder-meals-sheet";
import { ShareDietSheet } from "~/domains/diet/components/share-diet-sheet";
import { TRASH_ID, TrashZone } from "~/domains/diet/components/trash-zone";
import type { DietItem, DietMeal } from "~/domains/diet/types/diet-types";
import {
	changedLayouts,
	findMealOfItem,
	moveItemTo,
	nextMealName,
	summarizeDiet,
} from "~/domains/diet/utils/diet";
import { dayMicronutrients } from "~/domains/diet/utils/micronutrients";
import { type Food, MacroLine, macrosFor, UNIT_LABELS } from "~/domains/food";
import type { GoalTargets } from "~/domains/goal/types/goal-types";
import type { ProteinCounting } from "~/domains/goal/utils/protein-counting";
import { type MealFill, MealFillSheet } from "~/domains/meal-fill";
import {
	hasMeaningfulGap,
	macroGap,
} from "~/domains/meal-fill/utils/meal-fill";
import { MealRecipeSheet } from "~/domains/meal-recipe";
import {
	type MealVariation,
	MealVariationSheet,
} from "~/domains/meal-variation";
import {
	applyVariationAction,
	restoreVariationAction,
} from "~/domains/meal-variation/actions/meal-variation-actions";
import { PricesProvider } from "~/domains/shopping/components/prices-context";
import type { Price } from "~/domains/shopping/data/reference-prices";
import {
	ArrowUpDown,
	EllipsisVertical,
	Eye,
	FileDown,
	GripVertical,
	Loader2Icon,
	Plus,
	RotateCcw,
	Share,
	ShoppingCart,
	Sparkles,
} from "~/shared/components/icons";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/shared/components/ui/alert-dialog";
import { Button } from "~/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { Switch } from "~/shared/components/ui/switch";
import { useStickyTop } from "~/shared/hooks/use-sticky-top";
import { analytics } from "~/shared/lib/analytics/analytics";
import { formatNumber } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

interface DietViewProps {
	initialMeals: DietMeal[];
	weightKg: number | null;
	tdee: number | null;
	targets: GoalTargets | null;
	/** Água sugerida pelo perfil; null sem TMB preenchida. */
	water: WaterResult | null;
	/** Recursos em beta liberados (`BETA_EMAILS`), ex.: importar dieta. */
	beta?: boolean;
	/** Receitas salvas por refeição (id → quantidade), só no beta. */
	initialSavedRecipes?: Record<string, number>;
	/** Proteína que conta pra meta (Configurações): coluna P ou P(A). */
	proteinCounting: ProteinCounting;
	/** Ferro recomendado (mg/dia) pelo perfil; null sem TMB. */
	ironGoal?: number | null;
	/** Preços da pessoa (`[chave, preço]`), pro custo das trocas. */
	userPrices?: [string, Price][];
}

const MODES = ["editar", "visualizar"] as const;

const SUMMARY_OPEN_KEY = "salvia:resumo-dieta-aberto";

/** Atualiza só a refeição `mealId`. */
function mapMeal(
	meals: DietMeal[],
	mealId: string,
	fn: (meal: DietMeal) => DietMeal,
) {
	return meals.map((meal) => (meal.id === mealId ? fn(meal) : meal));
}

function mapItem(
	meals: DietMeal[],
	itemId: string,
	fn: (item: DietItem) => DietItem,
) {
	return meals.map((meal) => ({
		...meal,
		items: meal.items.map((item) => (item.id === itemId ? fn(item) : item)),
	}));
}

/** Opções no formato de recriar (copiar, desfazer). */
const optionInputs = (item: DietItem) =>
	item.options.map((option) => ({
		foodId: option.food.id,
		quantity: option.quantity,
	}));

export function DietView({
	initialMeals,
	weightKg,
	tdee,
	targets,
	water,
	beta = false,
	initialSavedRecipes = {},
	proteinCounting,
	ironGoal = null,
	userPrices = [],
}: DietViewProps) {
	const router = useRouter();
	// Id estável pro dnd-kit: sem ele, o contador global dos ids de
	// acessibilidade (`DndDescribedBy-N`) diverge entre servidor e navegador.
	const dndId = useId();
	// Editar (grade com arrastar, menus e painéis) × Visualizar (só leitura,
	// em lista; base do PDF). Fica na URL pra sobreviver ao recarregar.
	const [mode, setMode] = useQueryState(
		"modo",
		parseAsStringLiteral(MODES)
			.withDefault("editar")
			.withOptions({ history: "replace" }),
	);
	const preview = mode === "visualizar";
	// Exportar no modo Editar: troca pro Visualizar (que é o layout do PDF),
	// imprime depois que ele renderiza e volta pra edição ao fechar.
	const [exportFromEdit, setExportFromEdit] = useState(false);

	useEffect(() => {
		if (!preview || !exportFromEdit) return;
		setExportFromEdit(false);
		const backToEdit = () => setMode("editar");
		window.addEventListener("afterprint", backToEdit, { once: true });
		window.print();
	}, [preview, exportFromEdit, setMode]);

	function handleExport() {
		if (preview) {
			window.print();
			return;
		}
		setExportFromEdit(true);
		setMode("visualizar");
	}
	const [meals, setMealsState] = useState(initialMeals);
	// dnd-kit dispara `onDragEnd` logo depois do último `onDragOver`, antes do
	// re-render comitar: a ref espelhada (atualizada de forma síncrona) garante
	// que o fim do arrasto leia a posição mais recente (mesmo padrão do listify).
	const mealsRef = useRef(meals);
	// Coluna lateral fixa no desktop: gruda no topo ou, se for mais alta que
	// a tela, pelo fim (acima da barra de abas), sem rolagem própria.
	const asideRef = useRef<HTMLElement>(null);
	const asideTop = useStickyTop(asideRef, { top: 24, bottom: 88 });
	const dragSnapshot = useRef<DietMeal[]>(meals);

	const [addingTo, setAddingTo] = useState<string | null>(null);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [editingMeal, setEditingMeal] = useState<{
		id: string;
		focus: MealEditFocus;
	} | null>(null);
	const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
	const [confirmingReset, setConfirmingReset] = useState(false);
	const [sharing, setSharing] = useState(false);
	const [recipeMealId, setRecipeMealId] = useState<string | null>(null);
	const [variationMealId, setVariationMealId] = useState<string | null>(null);
	const [fillMealId, setFillMealId] = useState<string | null>(null);
	const [reorderingMeals, setReorderingMeals] = useState(false);
	const [savedRecipes, setSavedRecipes] = useState(initialSavedRecipes);
	// Celular: resumo completo recolhido por padrão (a grade aparece antes);
	// a escolha fica neste aparelho.
	const [summaryOpen, setSummaryOpen] = useState(false);
	useEffect(() => {
		try {
			setSummaryOpen(localStorage.getItem(SUMMARY_OPEN_KEY) === "1");
		} catch {
			// Sem armazenamento: começa recolhido.
		}
	}, []);
	function toggleSummary() {
		const next = !summaryOpen;
		setSummaryOpen(next);
		try {
			localStorage.setItem(SUMMARY_OPEN_KEY, next ? "1" : "0");
		} catch {
			// Sem armazenamento: vale só até recarregar.
		}
	}

	// Menu ⋮ da refeição: o mesmo nos modos Editar e Visualizar.
	const menuFor = (meal: DietMeal): MealMenuActions => ({
		canDelete: meals.length > 1,
		onRename: () => setEditingMeal({ id: meal.id, focus: "name" }),
		onEditTime: () => setEditingMeal({ id: meal.id, focus: "time" }),
		onDelete: () => setDeletingMealId(meal.id),
		onSuggestRecipe: beta ? () => setRecipeMealId(meal.id) : undefined,
		onVaryMeal: beta ? () => setVariationMealId(meal.id) : undefined,
		onFillMeal: canFill ? () => setFillMealId(meal.id) : undefined,
		onOpenSavedRecipes: beta
			? () => router.push(`/receitas?refeicao=${meal.id}`)
			: undefined,
		savedRecipes: savedRecipes[meal.id] ?? 0,
	});
	const [resetting, setResetting] = useState(false);
	const [addingMeal, setAddingMeal] = useState(false);
	const [activeItemId, setActiveItemId] = useState<string | null>(null);

	function setMeals(next: DietMeal[] | ((current: DietMeal[]) => DietMeal[])) {
		const value = typeof next === "function" ? next(mealsRef.current) : next;
		mealsRef.current = value;
		setMealsState(value);
	}

	const summary = summarizeDiet(meals, { weightKg, tdee });
	const micros = { values: dayMicronutrients(meals), ironGoal };
	// "Completar com IA" só quando falta algo pra meta (mesma regra do servidor).
	const canFill =
		beta &&
		targets !== null &&
		hasMeaningfulGap(macroGap(summary, targets, proteinCounting));

	const mealIds = new Set(meals.map((meal) => meal.id));
	const findMeal = (id: string | null) =>
		meals.find((meal) => meal.id === id) ?? null;
	const findItem = (id: string | null) =>
		meals.flatMap((meal) => meal.items).find((item) => item.id === id) ?? null;
	const editingItem = findItem(editingItemId);
	const activeItem = findItem(activeItemId);

	/**
	 * Erro "stale" = a dieta mudou em outra aba/aparelho (refeição ou item não
	 * existe mais): recarrega do servidor. A página remonta esta view com os
	 * dados novos (key pelos ids das refeições).
	 */
	function handleError(result: Extract<ActionResult<unknown>, { ok: false }>) {
		if (result.stale) {
			toast.info(
				"Sua dieta mudou em outra aba ou aparelho. Atualizamos a tela.",
			);
			router.refresh();
			return;
		}
		toast.error(result.error);
	}

	/** Aplica a mudança na hora e desfaz se o servidor recusar. */
	async function optimistic(
		next: (current: DietMeal[]) => DietMeal[],
		request: () => Promise<ActionResult<unknown>>,
		previous: DietMeal[] = mealsRef.current,
	) {
		setMeals(next);
		const result = await request();
		if (!result.ok) {
			setMeals(previous);
			handleError(result);
		}
		return result.ok;
	}

	/** Remove o alimento com opção de desfazer (recria na mesma posição). */
	async function removeItem(itemId: string, from: DietMeal[] = meals) {
		const meal = findMealOfItem(from, itemId);
		const index = meal?.items.findIndex((item) => item.id === itemId) ?? -1;
		const item = meal?.items[index];
		if (!meal || !item) return;

		const ok = await optimistic(
			(current) =>
				current.map((m) => ({
					...m,
					items: m.items.filter((i) => i.id !== itemId),
				})),
			() => deleteItemAction(itemId),
			from,
		);
		if (!ok) return;

		toast(`${item.food.name} removido de ${meal.name}.`, {
			// Tempo extra pra dar tempo de desfazer.
			duration: 8000,
			action: {
				label: "Desfazer",
				onClick: () => restoreItem(meal.id, item, index),
			},
		});
	}

	async function restoreItem(mealId: string, item: DietItem, index: number) {
		const result = await addItemAction({
			mealId,
			foodId: item.food.id,
			quantity: item.quantity,
			index,
			options: optionInputs(item),
		});
		if (!result.ok) {
			handleError(result);
			return;
		}
		setMeals((current) =>
			mapMeal(current, mealId, (meal) => {
				const items = [...meal.items];
				items.splice(Math.min(index, items.length), 0, result.data);
				return { ...meal, items };
			}),
		);
	}

	/** Troca o alimento no mesmo lugar, com "Desfazer" (volta o anterior). */
	async function replaceItem(itemId: string, food: Food, quantity: number) {
		const previous = findItem(itemId);
		if (!previous) return false;
		const result = await replaceItemFoodAction({
			itemId,
			foodId: food.id,
			quantity,
		});
		if (!result.ok) {
			handleError(result);
			if (result.stale) setEditingItemId(null);
			return false;
		}
		setItem(result.data);
		setEditingItemId(null);

		toast(`${previous.food.name} trocado por ${food.name}.`, {
			duration: 8000,
			action: {
				label: "Desfazer",
				onClick: async () => {
					const undo = await replaceItemFoodAction({
						itemId,
						foodId: previous.food.id,
						quantity: previous.quantity,
					});
					if (undo.ok) setItem(undo.data);
					else handleError(undo);
				},
			},
		});
		return true;
	}

	/**
	 * "Usar esta" do Variar refeição: troca os alimentos (o servidor confere
	 * a equivalência de novo), com "Desfazer" que volta todos de uma vez.
	 */
	async function applyVariation(mealId: string, variation: MealVariation) {
		const meal = findMeal(mealId);
		if (!meal) return false;
		const previous = meal.items.filter((item) =>
			variation.swaps.some((swap) => swap.itemId === item.id),
		);
		const result = await applyVariationAction({
			mealId,
			swaps: variation.swaps.map((swap) => ({
				itemId: swap.itemId,
				foodId: swap.food.id,
			})),
		});
		if (!result.ok) {
			toast.error(result.error);
			return false;
		}
		for (const item of result.data.items) setItem(item);
		setVariationMealId(null);
		analytics.track("refeicao_variada_usada", {
			trocas: result.data.items.length,
		});

		toast(`${meal.name}: refeição trocada.`, {
			duration: 8000,
			action: {
				label: "Desfazer",
				onClick: async () => {
					const undo = await restoreVariationAction({
						mealId,
						items: previous.map((item) => ({
							itemId: item.id,
							foodId: item.food.id,
							quantity: item.quantity,
						})),
					});
					if (!undo.ok) {
						toast.error(undo.error);
						return;
					}
					for (const { id, food, quantity } of previous) {
						setItem({ id, food, quantity });
					}
					analytics.track("refeicao_variada_desfeita");
				},
			},
		});
		return true;
	}

	/** "Completar com IA": adiciona os alimentos no fim da refeição, com "Desfazer". */
	async function applyMealFill(mealId: string, fill: MealFill) {
		const meal = findMeal(mealId);
		if (!meal) return false;
		const added: DietItem[] = [];
		for (const item of fill.items) {
			const result = await addItemAction({
				mealId,
				foodId: item.food.id,
				quantity: item.quantity,
			});
			if (!result.ok) {
				handleError(result);
				break;
			}
			added.push(result.data);
			setMeals((current) =>
				mapMeal(current, mealId, (m) => ({
					...m,
					items: [...m.items, result.data],
				})),
			);
		}
		if (added.length === 0) return false;
		setFillMealId(null);
		analytics.track("refeicao_completada_usada", { alimentos: added.length });

		const ids = new Set(added.map((item) => item.id));
		toast(
			`${meal.name}: ${added.length === 1 ? "1 alimento adicionado" : `${added.length} alimentos adicionados`}.`,
			{
				duration: 8000,
				action: {
					label: "Desfazer",
					onClick: async () => {
						const before = mealsRef.current;
						setMeals((current) =>
							current.map((m) => ({
								...m,
								items: m.items.filter((i) => !ids.has(i.id)),
							})),
						);
						for (const id of ids) {
							const result = await deleteItemAction(id);
							if (!result.ok) {
								setMeals(before);
								handleError(result);
								return;
							}
						}
					},
				},
			},
		);
		return true;
	}

	/** Nova ordem das refeições: muda na hora e volta se não salvar. */
	async function reorderMeals(next: DietMeal[]) {
		const previous = mealsRef.current;
		setMeals(next);
		const result = await reorderMealsAction(next.map((meal) => meal.id));
		if (!result.ok) {
			setMeals(previous);
			handleError(result);
		}
	}

	/** Atualiza alimento/quantidade do item, mantendo as opções. */
	function setItem(next: Omit<DietItem, "options">) {
		setMeals((current) =>
			mapItem(current, next.id, (item) => ({ ...item, ...next })),
		);
	}

	/** Copia o alimento (mesma quantidade) pro fim de outra refeição. */
	async function copyItem(itemId: string, mealId: string) {
		const item = findItem(itemId);
		const meal = findMeal(mealId);
		if (!item || !meal) return false;
		const result = await addItemAction({
			mealId,
			foodId: item.food.id,
			quantity: item.quantity,
			options: optionInputs(item),
		});
		if (!result.ok) {
			handleError(result);
			if (result.stale) setEditingItemId(null);
			return false;
		}
		const copy = result.data;
		setMeals((current) =>
			mapMeal(current, mealId, (m) => ({ ...m, items: [...m.items, copy] })),
		);
		setEditingItemId(null);

		toast(`${item.food.name} copiado para ${meal.name}.`, {
			duration: 8000,
			action: {
				label: "Desfazer",
				onClick: () =>
					optimistic(
						(current) =>
							mapMeal(current, mealId, (m) => ({
								...m,
								items: m.items.filter((i) => i.id !== copy.id),
							})),
						() => deleteItemAction(copy.id),
					),
			},
		});
		return true;
	}

	// --- Opções do item ("ou 1 banana") ----------------------------------------

	async function addOption(itemId: string, food: Food, quantity: number) {
		const result = await addItemOptionAction({
			itemId,
			foodId: food.id,
			quantity,
		});
		if (!result.ok) {
			handleError(result);
			if (result.stale) setEditingItemId(null);
			return false;
		}
		setMeals((current) =>
			mapItem(current, itemId, (item) => ({
				...item,
				options: [...item.options, result.data],
			})),
		);
		return true;
	}

	/** Remove a opção com "Desfazer" (recria no fim da lista). */
	async function removeOption(itemId: string, optionId: string) {
		const option = findItem(itemId)?.options.find((o) => o.id === optionId);
		if (!option) return;
		const ok = await optimistic(
			(current) =>
				mapItem(current, itemId, (item) => ({
					...item,
					options: item.options.filter((o) => o.id !== optionId),
				})),
			() => deleteItemOptionAction(optionId),
		);
		if (!ok) return;
		toast(`Opção ${option.food.name} removida.`, {
			duration: 8000,
			action: {
				label: "Desfazer",
				onClick: () => addOption(itemId, option.food, option.quantity),
			},
		});
	}

	/**
	 * "Usar esta": a opção vira o alimento do item e o de antes vira a opção,
	 * no mesmo lugar. Desfazer = trocar de novo.
	 */
	async function swapOption(itemId: string, optionId: string) {
		const item = findItem(itemId);
		const option = item?.options.find((o) => o.id === optionId);
		if (!item || !option) return false;
		const swap = (current: DietMeal[]) =>
			mapItem(current, itemId, (it) => {
				const target = it.options.find((o) => o.id === optionId);
				if (!target) return it;
				return {
					...it,
					food: target.food,
					quantity: target.quantity,
					options: it.options.map((o) =>
						o.id === optionId
							? { ...o, food: it.food, quantity: it.quantity }
							: o,
					),
				};
			});
		const ok = await optimistic(swap, () => swapItemOptionAction(optionId));
		if (!ok) return false;
		toast(`${option.food.name} no lugar de ${item.food.name}.`, {
			duration: 8000,
			action: {
				label: "Desfazer",
				onClick: () => optimistic(swap, () => swapItemOptionAction(optionId)),
			},
		});
		return true;
	}

	/** Volta ao estado inicial: 3 refeições vazias (após confirmação). */
	async function handleReset() {
		setResetting(true);
		const result = await resetDietAction();
		setResetting(false);
		setConfirmingReset(false);
		if (!result.ok) {
			handleError(result);
			return;
		}
		setAddingTo(null);
		setEditingItemId(null);
		setEditingMeal(null);
		setMeals(result.data);
		toast.success("Dieta resetada: 3 refeições em branco.");
	}

	async function handleAddMeal() {
		setAddingMeal(true);
		const result = await addMealAction(nextMealName(meals));
		setAddingMeal(false);
		if (result.ok) setMeals((current) => [...current, result.data]);
		else handleError(result);
	}

	async function handleAddFood(food: Food, quantity: number) {
		const mealId = addingTo;
		if (!mealId) return false;
		const result = await addItemAction({ mealId, foodId: food.id, quantity });
		if (!result.ok) {
			handleError(result);
			if (result.stale) setAddingTo(null);
			return false;
		}
		analytics.track("alimento_adicionado", { fonte: food.source });
		setMeals((current) =>
			mapMeal(current, mealId, (meal) => ({
				...meal,
				items: [...meal.items, result.data],
			})),
		);
		setAddingTo(null);
		return true;
	}

	// --- Arrastar e soltar ----------------------------------------------------

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	/**
	 * Lixeira tem prioridade (ponteiro em cima dela). Fora dela, prefere a linha
	 * sob o ponteiro; sobre o card mas fora das linhas, a própria refeição (vai
	 * pro fim). Sem nada sob o ponteiro (ex.: teclado), o mais próximo.
	 */
	const collisionDetection: CollisionDetection = (args) => {
		const trash = args.droppableContainers.filter((c) => c.id === TRASH_ID);
		const others = args.droppableContainers.filter((c) => c.id !== TRASH_ID);

		const overTrash = pointerWithin({ ...args, droppableContainers: trash });
		if (overTrash.length > 0) return overTrash;

		const hits = pointerWithin({ ...args, droppableContainers: others });
		if (hits.length > 0) {
			const itemHits = hits.filter((hit) => !mealIds.has(String(hit.id)));
			return itemHits.length > 0 ? itemHits : hits;
		}
		return closestCenter({ ...args, droppableContainers: others });
	};

	/** Refeição de destino: o id é de uma refeição ou de um item dentro dela. */
	function targetMealId(overId: UniqueIdentifier) {
		const id = String(overId);
		if (mealIds.has(id)) return id;
		return findMealOfItem(mealsRef.current, id)?.id;
	}

	function handleDragStart({ active }: DragStartEvent) {
		dragSnapshot.current = mealsRef.current;
		setActiveItemId(String(active.id));
	}

	function handleDragOver({ active, over }: DragOverEvent) {
		if (!over || over.id === TRASH_ID) return;
		const itemId = String(active.id);
		const from = findMealOfItem(mealsRef.current, itemId);
		const toId = targetMealId(over.id);
		if (!from || !toId || from.id === toId) return;

		// Troca de refeição durante o arrasto: entra na posição do item sob o
		// ponteiro (ou no fim, se estiver sobre o card).
		const to = mealsRef.current.find((meal) => meal.id === toId);
		const overIndex =
			to?.items.findIndex((item) => item.id === String(over.id)) ?? -1;
		setMeals(
			moveItemTo(
				mealsRef.current,
				itemId,
				toId,
				overIndex >= 0 ? overIndex : (to?.items.length ?? 0),
			),
		);
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		setActiveItemId(null);
		const itemId = String(active.id);
		const snapshot = dragSnapshot.current;

		if (!over) {
			setMeals(snapshot);
			return;
		}

		if (over.id === TRASH_ID) {
			setMeals(snapshot);
			removeItem(itemId, snapshot);
			return;
		}

		// Reordenar dentro da mesma refeição (a troca entre refeições já
		// aconteceu no onDragOver).
		const meal = findMealOfItem(mealsRef.current, itemId);
		const overIndex =
			meal?.items.findIndex((item) => item.id === String(over.id)) ?? -1;
		if (meal && overIndex >= 0) {
			setMeals(moveItemTo(mealsRef.current, itemId, meal.id, overIndex));
		}

		const layout = changedLayouts(snapshot, mealsRef.current);
		if (layout.length === 0) return;
		optimistic(
			() => mealsRef.current,
			() => placeItemsAction(layout),
			snapshot,
		);
	}

	function handleDragCancel() {
		setActiveItemId(null);
		setMeals(dragSnapshot.current);
	}

	const nameOf = (id: UniqueIdentifier) =>
		findItem(String(id))?.food.name ?? "alimento";
	const placeOf = (id: UniqueIdentifier) => {
		if (id === TRASH_ID) return "a lixeira";
		const mealId = targetMealId(id);
		return mealIds.has(String(mealId))
			? (findMeal(mealId ?? null)?.name ?? "a refeição")
			: "a refeição";
	};
	const announcements: Announcements = {
		onDragStart: ({ active }) =>
			`Arrastando ${nameOf(active.id)}. Use as setas pra mover e espaço pra soltar.`,
		onDragOver: ({ active, over }) =>
			over
				? `${nameOf(active.id)} sobre ${placeOf(over.id)}.`
				: `${nameOf(active.id)} fora das refeições.`,
		onDragEnd: ({ active, over }) =>
			over
				? over.id === TRASH_ID
					? `${nameOf(active.id)} removido.`
					: `${nameOf(active.id)} movido para ${placeOf(over.id)}.`
				: `${nameOf(active.id)} voltou ao lugar.`,
		onDragCancel: ({ active }) =>
			`Arrasto cancelado. ${nameOf(active.id)} voltou ao lugar.`,
	};

	return (
		<PricesProvider prices={userPrices}>
			<div className="flex flex-col gap-6">
				<div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
					{/* Ligado = Visualizar (só leitura); desligado = Editar. */}
					{/* biome-ignore lint/a11y/noLabelWithoutControl: o controle é o Switch (Base UI) dentro do label */}
					<label className="flex h-9 cursor-pointer items-center gap-2 rounded-4xl px-3 font-medium text-sm transition-colors hover:bg-muted">
						<Eye className="size-4 text-muted-foreground" aria-hidden />
						Visualizar
						<Switch
							checked={preview}
							onCheckedChange={(checked) =>
								setMode(checked ? "visualizar" : "editar")
							}
						/>
					</label>
					{/* Ações da dieta inteira (PDF, lista de compras, compartilhar,
				    resetar). */}
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="outline"
									size="icon"
									aria-label="Opções da dieta"
								/>
							}
						>
							<EllipsisVertical />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-auto">
							{/* O PDF sai da impressão do navegador ("Salvar como PDF"):
						    texto selecionável, sem biblioteca extra. */}
							<DropdownMenuItem onClick={handleExport}>
								<FileDown />
								Exportar PDF
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => router.push("/dieta/lista-de-compras")}
							>
								<ShoppingCart />
								Lista de compras
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setSharing(true)}>
								<Share />
								Compartilhar dieta
							</DropdownMenuItem>
							{meals.length > 1 && (
								<DropdownMenuItem onClick={() => setReorderingMeals(true)}>
									<ArrowUpDown />
									Reordenar refeições
								</DropdownMenuItem>
							)}
							{beta && (
								<DropdownMenuItem
									onClick={() => router.push("/dieta/importar")}
								>
									<Sparkles />
									Importar dieta (beta)
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onClick={() => setConfirmingReset(true)}
							>
								<RotateCcw />
								Resetar dieta
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Celular: resumo no topo e 1 coluna. Tablet: resumo e meta lado a
			    lado no topo, 2 colunas. ≥ lg: coluna lateral fixa à direita (como
			    a legenda da planilha) e a grade à esquerda em 2 colunas. */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start print:flex print:flex-col print:items-stretch print:gap-4">
					<div className="md:hidden print:hidden">
						<DietSummaryCompact
							summary={summary}
							targets={targets}
							proteinCounting={proteinCounting}
							expanded={summaryOpen}
							onToggle={toggleSummary}
						/>
					</div>
					<aside
						ref={asideRef}
						style={{ top: asideTop }}
						className={cn(
							"grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start lg:sticky lg:order-last lg:grid-cols-1 print:static print:order-last print:break-inside-avoid print:grid-cols-2 print:[print-color-adjust:exact]",
							!summaryOpen && "max-md:not-print:hidden",
						)}
					>
						<DietSummaryCard
							summary={summary}
							tdee={tdee}
							water={water}
							micros={micros}
						/>
						{targets ? (
							<GoalProgress
								summary={summary}
								targets={targets}
								proteinCounting={proteinCounting}
							/>
						) : (
							<p className="rounded-3xl bg-card p-4 text-muted-foreground text-sm md:p-5">
								Defina sua meta na aba Meta para comparar o planejado com ela.
							</p>
						)}
					</aside>

					{preview ? (
						<DietPreview
							meals={meals}
							proteinCounting={proteinCounting}
							printable
							mealActions={(meal) => (
								<MealMenu meal={meal} {...menuFor(meal)} />
							)}
						/>
					) : (
						<DndContext
							id={dndId}
							sensors={sensors}
							collisionDetection={collisionDetection}
							accessibility={{
								announcements,
								screenReaderInstructions: {
									draggable:
										"Pra mover este alimento, aperte espaço, use as setas e aperte espaço de novo pra soltar. Esc cancela.",
								},
							}}
							onDragStart={handleDragStart}
							onDragOver={handleDragOver}
							onDragEnd={handleDragEnd}
							onDragCancel={handleDragCancel}
						>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
								{meals.map((meal) => (
									<MealCard
										proteinCounting={proteinCounting}
										key={meal.id}
										meal={meal}
										onAddFood={() => setAddingTo(meal.id)}
										onEditItem={setEditingItemId}
										{...menuFor(meal)}
									/>
								))}
								<button
									type="button"
									disabled={addingMeal}
									onClick={handleAddMeal}
									className="flex min-h-32 items-center justify-center gap-2 rounded-3xl border-2 border-border border-dashed font-medium text-primary text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
								>
									{addingMeal ? (
										<Loader2Icon className="size-4 animate-spin" />
									) : (
										<Plus className="size-4" />
									)}
									Adicionar refeição
								</button>
							</div>

							<DragOverlay dropAnimation={null}>
								{activeItem && <DraggedItem item={activeItem} />}
							</DragOverlay>
							<TrashZone visible={activeItem !== null} />
						</DndContext>
					)}
				</div>

				<ShareDietSheet open={sharing} onOpenChange={setSharing} />
				<MealRecipeSheet
					meal={meals.find((meal) => meal.id === recipeMealId) ?? null}
					onOpenChange={(open) => !open && setRecipeMealId(null)}
					onSaved={(mealId) =>
						setSavedRecipes((counts) => ({
							...counts,
							[mealId]: (counts[mealId] ?? 0) + 1,
						}))
					}
				/>

				<ReorderMealsSheet
					open={reorderingMeals}
					onOpenChange={setReorderingMeals}
					meals={meals}
					onReorder={reorderMeals}
				/>

				<MealFillSheet
					meal={meals.find((meal) => meal.id === fillMealId) ?? null}
					onOpenChange={(open) => !open && setFillMealId(null)}
					onAdd={applyMealFill}
				/>
				<MealVariationSheet
					meal={meals.find((meal) => meal.id === variationMealId) ?? null}
					onOpenChange={(open) => !open && setVariationMealId(null)}
					onUse={applyVariation}
				/>

				<AddFoodSheet
					meal={findMeal(addingTo)}
					onOpenChange={(open) => !open && setAddingTo(null)}
					onAdd={handleAddFood}
				/>

				<ItemSheet
					item={editingItem}
					meals={meals}
					onOpenChange={(open) => !open && setEditingItemId(null)}
					onStale={() => {
						setEditingItemId(null);
						handleError({ ok: false, error: "", stale: true });
					}}
					onQuantityChange={(itemId, quantity) =>
						setMeals((current) =>
							current.map((meal) => ({
								...meal,
								items: meal.items.map((item) =>
									item.id === itemId ? { ...item, quantity } : item,
								),
							})),
						)
					}
					onReplace={replaceItem}
					cheaperSwap={beta}
					onCopy={copyItem}
					onAddOption={addOption}
					onRemoveOption={removeOption}
					onSwapOption={swapOption}
					onDelete={(itemId) => {
						setEditingItemId(null);
						removeItem(itemId);
					}}
				/>

				<MealEditSheet
					meal={findMeal(editingMeal?.id ?? null)}
					focus={editingMeal?.focus ?? "name"}
					onOpenChange={(open) => !open && setEditingMeal(null)}
					onSave={(data) => {
						const mealId = editingMeal?.id;
						if (!mealId) return;
						setEditingMeal(null);
						optimistic(
							(current) =>
								mapMeal(current, mealId, (meal) => ({ ...meal, ...data })),
							() => updateMealAction(mealId, data),
						);
					}}
				/>

				<AlertDialog
					open={deletingMealId !== null}
					onOpenChange={(open) => !open && setDeletingMealId(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Remover {findMeal(deletingMealId)?.name}?
							</AlertDialogTitle>
							<AlertDialogDescription>
								A refeição e os alimentos dela saem do seu plano.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancelar</AlertDialogCancel>
							<Button
								variant="destructive"
								onClick={() => {
									const mealId = deletingMealId;
									setDeletingMealId(null);
									if (!mealId) return;
									optimistic(
										(current) => current.filter((meal) => meal.id !== mealId),
										() => deleteMealAction(mealId),
									);
								}}
							>
								Remover
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<AlertDialog
					open={confirmingReset}
					onOpenChange={(open) =>
						!open && !resetting && setConfirmingReset(false)
					}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Resetar a dieta?</AlertDialogTitle>
							<AlertDialogDescription>
								Todas as refeições e alimentos do plano serão apagados e a dieta
								volta a ter 3 refeições em branco. Isso não pode ser desfeito.
								Seus alimentos cadastrados, TMB e meta continuam como estão.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={resetting}>
								Cancelar
							</AlertDialogCancel>
							<Button
								variant="destructive"
								disabled={resetting}
								onClick={handleReset}
							>
								{resetting && (
									<Loader2Icon
										data-icon="inline-start"
										className="animate-spin"
									/>
								)}
								Resetar dieta
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</PricesProvider>
	);
}

// Cópia flutuante do alimento sob o dedo/cursor durante o arrasto.
function DraggedItem({ item }: { item: DietItem }) {
	return (
		<div className="flex cursor-grabbing items-center gap-2 rounded-2xl bg-card px-3 py-2.5 ring-2 ring-primary/40">
			<GripVertical className="size-4 shrink-0 text-muted-foreground" />
			<div className="flex min-w-0 flex-col">
				<span className="truncate font-medium text-sm">{item.food.name}</span>
				<span className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs">
					{formatNumber(item.quantity, 1)} {UNIT_LABELS[item.food.unit].short}
					<MacroLine macros={macrosFor(item.food, item.quantity)} />
				</span>
			</div>
		</div>
	);
}
