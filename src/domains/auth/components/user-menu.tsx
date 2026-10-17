"use client";

import { useRouter } from "next/navigation";

import { authClient } from "~/domains/auth/lib/auth-client";
import type { User } from "~/domains/auth/types/user-types";
import { LogOut } from "~/shared/components/icons";
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

export function UserMenu({ user }: { user: User }) {
	const router = useRouter();

	async function handleSignOut() {
		await authClient.signOut();
		router.replace("/login");
	}

	return (
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
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex flex-col">
						<span className="font-medium text-foreground">{user.name}</span>
						<span className="font-normal text-muted-foreground text-xs">
							{user.email}
						</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut}>
					<LogOut />
					Sair
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
