"use client";

import { toast } from "sonner";

import { Printer, Share } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { usePrintSetup } from "~/shared/hooks/use-print-setup";
import { analytics } from "~/shared/lib/analytics/analytics";

interface DayReportActionsProps {
	day: string;
	/** `dayReportText` montado no servidor. */
	text: string;
}

// "Baixar PDF" (impressão do navegador, já com o nome do arquivo) e
// "Compartilhar" (Web Share ou copia o texto pro WhatsApp).
export function DayReportActions({ day, text }: DayReportActionsProps) {
	usePrintSetup(`Sálvia - relatório do dia ${day}`);

	function print() {
		analytics.track("relatorio_dia_baixado", { forma: "pdf" });
		window.print();
	}

	async function share() {
		try {
			if (navigator.share) {
				await navigator.share({ title: "Relatório do dia", text });
			} else {
				await navigator.clipboard.writeText(text);
				toast.success("Resumo copiado. É só colar no WhatsApp.");
			}
			analytics.track("relatorio_dia_baixado", { forma: "texto" });
		} catch (error) {
			// Cancelar o compartilhamento não é erro.
			if (error instanceof DOMException && error.name === "AbortError") return;
			toast.error("Não foi possível compartilhar. Tente baixar o PDF.");
		}
	}

	return (
		<div className="flex flex-wrap gap-2 print:hidden">
			<Button onClick={print}>
				<Printer data-icon="inline-start" />
				Baixar PDF
			</Button>
			<Button variant="outline" onClick={share}>
				<Share data-icon="inline-start" />
				Compartilhar
			</Button>
		</div>
	);
}
