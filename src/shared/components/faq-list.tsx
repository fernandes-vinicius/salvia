import { ChevronDown } from "~/shared/components/icons";

export interface FaqItem {
	question: string;
	answer: string;
}

// Perguntas abertas/fechadas com <details> (funciona sem JS). Mesmo texto vai
// pro JSON-LD FAQPage da página.
export function FaqList({ items }: { items: FaqItem[] }) {
	return (
		<div className="flex flex-col gap-3">
			{items.map(({ question, answer }) => (
				<details
					key={question}
					className="group rounded-3xl bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
				>
					<summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium outline-none focus-visible:underline">
						{question}
						<ChevronDown
							className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
							aria-hidden
						/>
					</summary>
					<p className="text-pretty pt-3 text-muted-foreground text-sm">
						{answer}
					</p>
				</details>
			))}
		</div>
	);
}

/** Bloco FAQPage do schema.org a partir das mesmas perguntas. */
export function faqStructuredData(items: FaqItem[]) {
	return {
		"@type": "FAQPage",
		mainEntity: items.map(({ question, answer }) => ({
			"@type": "Question",
			name: question,
			acceptedAnswer: { "@type": "Answer", text: answer },
		})),
	};
}
