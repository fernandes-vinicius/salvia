"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "~/domains/auth/lib/auth-client";
import type { User } from "~/domains/auth/types/user-types";
import { FeedbackSheet } from "~/domains/feedback";
import {
	ChefHat,
	LogOut,
	MessageSquarePlus,
	Ruler,
	Salad,
} from "~/shared/components/icons";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "~/shared/components/ui/avatar";
import { Button } from "~/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";

function getInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export function UserMenu({
	user,
	beta = false,
}: {
	user: User;
	/** Recursos em beta liberados (`BETA_EMAILS`), ex.: Minhas receitas. */
	beta?: boolean;
}) {
	const router = useRouter();
	const [feedbackOpen, setFeedbackOpen] = useState(false);

	async function handleSignOut() {
		await authClient.signOut();
		router.replace("/login");
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							variant="ghost"
							size="icon-sm"
							className="rounded-full"
							aria-label="Menu da conta"
						/>
					}
				>
					<Avatar size="sm">
						{user.image && <AvatarImage src={user.image} alt={user.name} />}
						<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>
				{/* Por padrão o menu tem a largura do gatilho (o avatar); aqui ele
			    acompanha o conteúdo, até caber na tela. */}
				<DropdownMenuContent
					align="end"
					className="w-auto max-w-[min(20rem,calc(100vw-2rem))]"
				>
					<DropdownMenuGroup>
						<DropdownMenuLabel className="flex min-w-0 flex-col">
							<span className="truncate font-medium text-foreground">
								{user.name}
							</span>
							<span
								className="truncate font-normal text-muted-foreground text-xs"
								title={user.email}
							>
								{user.email}
							</span>
						</DropdownMenuLabel>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => router.push("/medidas")}>
						<Ruler />
						Minhas medidas
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/alimentos")}>
						<Salad />
						Meus alimentos
					</DropdownMenuItem>
					{beta && (
						<DropdownMenuItem onClick={() => router.push("/receitas")}>
							<ChefHat />
							Minhas receitas
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
						<MessageSquarePlus />
						Enviar sugestão
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleSignOut}>
						<LogOut />
						Sair
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<FeedbackSheet open={feedbackOpen} onOpenChange={setFeedbackOpen} />
		</>
	);
}
