"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	Flame,
	House,
	type LucideIcon,
	Salad,
	Target,
} from "~/shared/components/icons";
import { cn } from "~/shared/lib/utils";

interface Tab {
	href: "/" | "/tmb" | "/meta" | "/dieta";
	label: string;
	icon: LucideIcon;
}

const tabs: Tab[] = [
	{ href: "/", label: "Início", icon: House },
	{ href: "/tmb", label: "TMB", icon: Flame },
	{ href: "/meta", label: "Meta", icon: Target },
	{ href: "/dieta", label: "Dieta", icon: Salad },
];

function isTabActive(pathname: string | null, href: Tab["href"]) {
	if (!pathname) return false;
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

// Barra de abas flutuante (estilo app mobile), igual no desktop. Sem sombra:
// separa do conteúdo por superfície translúcida + blur e um ring sutil.
export function TabBar() {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Navegação principal"
			// `w-max`: com `left-1/2` o elemento fixo só teria metade da tela
			// de largura disponível e espremeria os rótulos.
			className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-40 w-max -translate-x-1/2"
		>
			<ul className="flex items-center gap-1 rounded-full bg-card/85 p-1.5 ring-1 ring-foreground/10 backdrop-blur-md">
				{tabs.map((tab) => (
					<li key={tab.href}>
						<TabLink tab={tab} active={isTabActive(pathname, tab.href)} />
					</li>
				))}
			</ul>
		</nav>
	);
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
	const Icon = tab.icon;

	return (
		<Link
			href={tab.href}
			aria-current={active ? "page" : undefined}
			aria-label={tab.label}
			data-active={active || undefined}
			className={cn(
				"group/tab flex h-11 items-center rounded-full px-3.5 text-muted-foreground outline-none transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
				"data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary",
			)}
		>
			<Icon className="size-5 shrink-0" aria-hidden />
			{/* O rótulo só aparece na aba ativa: a coluna do grid anima de 0fr
			    pra 1fr, então a pílula "abre" suavemente ao trocar de aba. */}
			<span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-200 ease-out group-data-active/tab:grid-cols-[1fr] motion-reduce:transition-none">
				<span className="overflow-hidden whitespace-nowrap font-medium text-sm">
					<span className="pl-2">{tab.label}</span>
				</span>
			</span>
		</Link>
	);
}

// Fallback do Suspense: mesma barra, sem aba ativa (usePathname pode
// suspender em rotas com params dinâmicos sob Cache Components).
export function TabBarFallback() {
	return (
		<div
			aria-hidden
			className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-40 h-14 w-56 -translate-x-1/2 rounded-full bg-card/85 ring-1 ring-foreground/10 backdrop-blur-md"
		/>
	);
}
