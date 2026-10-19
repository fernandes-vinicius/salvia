"use client";

import {
	formatMoney,
	formatPrice,
	type ItemPrice,
} from "~/domains/shopping/utils/prices";
import type {
	ShoppingGroup,
	ShoppingItem,
} from "~/domains/shopping/utils/shopping-list";
import { Pencil } from "~/shared/components/icons";
import { Checkbox } from "~/shared/components/ui/checkbox";
import { cn } from "~/shared/lib/utils";

interface ShoppingGroupsProps {
	groups: ShoppingGroup[];
	checked: Set<string>;
	onToggle: (key: string, value: boolean) => void;
	/** Com preços: custo de cada item e botão pra editar o preço. */
	prices?: ReadonlyMap<string, ItemPrice | null>;
	onEditPrice?: (item: ShoppingItem) => void;
	className?: string;
}

// Seções do mercado com os itens marcáveis. Usado na lista de compras e na
// landing (com a dieta de exemplo).
export function ShoppingGroups({
	groups,
	checked,
	onToggle,
	prices,
	onEditPrice,
	className,
}: ShoppingGroupsProps) {
	return (
		<div className={cn("grid gap-4 md:grid-cols-2 md:items-start", className)}>
			{groups.map((group) => (
				<section
					key={group.section}
					aria-label={group.section}
					className="flex flex-col gap-2 rounded-3xl bg-card p-4 md:p-5 print:break-inside-avoid print:border print:border-border"
				>
					<h2 className="font-heading font-semibold">{group.section}</h2>
					<ul className="flex flex-col divide-y divide-border">
						{group.items.map((item) => {
							const isChecked = checked.has(item.key);
							return (
								<li key={item.key}>
									{/* biome-ignore lint/a11y/noLabelWithoutControl: o controle é o Checkbox (Base UI) dentro do label */}
									<label className="flex cursor-pointer items-start gap-3 py-2.5">
										<Checkbox
											className="mt-0.5 print:hidden"
											checked={isChecked}
											onCheckedChange={(value) => onToggle(item.key, value)}
										/>
										<span
											className={cn(
												"flex flex-1 flex-col gap-0.5",
												isChecked && "text-muted-foreground line-through",
											)}
										>
											<span className="flex items-baseline justify-between gap-3">
												<span className="font-medium">{item.name}</span>
												<span className="shrink-0 font-heading font-semibold tabular-nums">
													{item.amount}
												</span>
											</span>
											{item.detail && (
												<span className="text-muted-foreground text-xs">
													{item.detail}
												</span>
											)}
										</span>
									</label>
									{prices && onEditPrice && (
										<PriceRow
											item={item}
											price={prices.get(item.key) ?? null}
											onEdit={() => onEditPrice(item)}
										/>
									)}
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}

// Custo do item no período + o preço usado (toque pra trocar pelo seu).
function PriceRow({
	item,
	price,
	onEdit,
}: {
	item: ShoppingItem;
	price: ItemPrice | null;
	onEdit: () => void;
}) {
	return (
		<div className="-mt-1.5 flex items-center justify-between gap-3 pb-2.5 pl-7 text-xs">
			<span className="text-muted-foreground tabular-nums">
				{price?.cost != null ? `≈ ${formatMoney(price.cost)}` : "sem preço"}
			</span>
			<button
				type="button"
				onClick={onEdit}
				aria-label={`Editar o preço de ${item.name}`}
				className="flex items-center gap-1 rounded-full px-2 py-0.5 text-primary tabular-nums outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 print:hidden"
			>
				{price ? (
					<>
						{formatPrice(price.price)}
						{price.source === "user" && (
							<span className="text-muted-foreground"> · seu preço</span>
						)}
					</>
				) : (
					"Definir preço"
				)}
				<Pencil className="size-3" aria-hidden />
			</button>
		</div>
	);
}
