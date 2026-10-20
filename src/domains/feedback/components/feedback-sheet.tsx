"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { sendFeedbackAction } from "~/domains/feedback/actions/feedback-actions";
import {
	type FeedbackKind,
	feedbackSchema,
} from "~/domains/feedback/schemas/feedback-schema";
import { BottomSheetContent } from "~/shared/components/bottom-sheet";
import { ChoiceCard } from "~/shared/components/choice-card";
import {
	Bug,
	Heart,
	Lightbulb,
	Loader2Icon,
	type LucideIcon,
} from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/shared/components/ui/field";
import { RadioGroup } from "~/shared/components/ui/radio-group";
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/shared/components/ui/sheet";
import { Textarea } from "~/shared/components/ui/textarea";
import { analytics } from "~/shared/lib/analytics/analytics";
import { formatNumber } from "~/shared/lib/format";

const MAX_LENGTH = 1000;

const KINDS: {
	value: FeedbackKind;
	icon: LucideIcon;
	title: string;
	placeholder: string;
}[] = [
	{
		value: "feature",
		icon: Lightbulb,
		title: "Ideia de recurso",
		placeholder: "Ex.: queria ver quanto custa minha dieta por semana.",
	},
	{
		value: "problem",
		icon: Bug,
		title: "Algo não funciona",
		placeholder: "O que você fez e o que aconteceu?",
	},
	{
		value: "other",
		icon: Heart,
		title: "Elogio ou outro",
		placeholder: "Pode falar o que quiser.",
	},
];

interface FeedbackSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// "Enviar sugestão" do menu do perfil: tipo + mensagem, salvos no banco
// (lidos com `bun run feedback`). Guarda a página de onde veio.
export function FeedbackSheet({ open, onOpenChange }: FeedbackSheetProps) {
	const pathname = usePathname();
	const [kind, setKind] = useState<FeedbackKind>("feature");
	const [message, setMessage] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	const current = KINDS.find((option) => option.value === kind) ?? KINDS[0];

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		const parsed = feedbackSchema.safeParse({ kind, message, page: pathname });
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Mensagem inválida.");
			return;
		}

		setPending(true);
		const result = await sendFeedbackAction(parsed.data);
		setPending(false);
		if (!result.ok) {
			toast.error(result.error);
			return;
		}
		analytics.track("sugestao_enviada", { tipo: parsed.data.kind });
		toast.success("Recebemos sua mensagem. Obrigado por ajudar o app!");
		setMessage("");
		setError(null);
		onOpenChange(false);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<BottomSheetContent>
				<SheetHeader className="text-center">
					<SheetTitle>Enviar sugestão</SheetTitle>
					<SheetDescription>
						Ideias, problemas ou elogios: tudo é lido e ajuda a decidir o que
						vem a seguir.
					</SheetDescription>
				</SheetHeader>
				<form
					onSubmit={handleSubmit}
					className="flex flex-1 flex-col gap-5 overflow-y-auto p-4"
				>
					<RadioGroup
						aria-label="Tipo de mensagem"
						value={kind}
						onValueChange={(next) => setKind(next as FeedbackKind)}
						className="grid-cols-1 gap-2 sm:grid-cols-3"
					>
						{KINDS.map((option) => (
							<ChoiceCard
								key={option.value}
								value={option.value}
								icon={option.icon}
								title={option.title}
								hideIndicator
							/>
						))}
					</RadioGroup>

					<Field>
						<FieldLabel htmlFor="feedback-message">Mensagem</FieldLabel>
						<Textarea
							id="feedback-message"
							value={message}
							maxLength={MAX_LENGTH}
							placeholder={current.placeholder}
							aria-invalid={error !== null}
							onChange={(event) => {
								setMessage(event.target.value);
								if (error) setError(null);
							}}
						/>
						<div className="flex justify-between gap-3 text-muted-foreground text-xs">
							<FieldError errors={error ? [{ message: error }] : undefined} />
							<span className="ml-auto tabular-nums">
								{formatNumber(message.length)}/{formatNumber(MAX_LENGTH)}
							</span>
						</div>
					</Field>

					<Button type="submit" disabled={pending}>
						{pending && (
							<Loader2Icon data-icon="inline-start" className="animate-spin" />
						)}
						Enviar
					</Button>
				</form>
			</BottomSheetContent>
		</Sheet>
	);
}
