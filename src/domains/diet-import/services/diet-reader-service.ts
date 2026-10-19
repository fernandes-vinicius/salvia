import "server-only";

import { generateText, NoObjectGeneratedError, Output } from "ai";

import {
	type ExtractedDiet,
	extractedDietSchema,
} from "~/domains/diet-import/schemas/diet-import-schema";
import {
	AI_NOT_CONFIGURED,
	AI_RATE_LIMITED,
	getAiModel,
	isRateLimited,
} from "~/shared/lib/ai";

const INSTRUCTIONS = `Você lê dietas (plano alimentar) feitas por nutricionistas, enviadas como PDF ou foto, e transcreve as refeições num formato estruturado.

Regras:
- Transcreva só o que está no documento, na ordem. Não invente, não corrija nem "melhore" a dieta: ela é do nutricionista.
- Cada alimento é um item. Substituições ("ou", "opções", "substituir por") entram em "options" do item a que se referem, não como itens novos.
- Ignore dados pessoais (nome do paciente, do profissional, CRN, telefone), orientações gerais e textos que não sejam alimentos.
- Água, chás e café sem açúcar podem ficar de fora.
- Se o documento não for uma dieta, devolva "meals" vazio.`;

export type ReadDietResult =
	| { ok: true; diet: ExtractedDiet }
	| { ok: false; error: string };

export interface DietDocument {
	data: Uint8Array;
	mediaType: string;
}

/** Manda os arquivos pro Gemini e devolve as refeições lidas. */
export async function readDietDocuments(
	documents: DietDocument[],
): Promise<ReadDietResult> {
	const model = getAiModel();
	if (!model) return { ok: false, error: AI_NOT_CONFIGURED };

	try {
		const { output } = await generateText({
			model,
			instructions: INSTRUCTIONS,
			output: Output.object({ schema: extractedDietSchema }),
			messages: [
				{
					role: "user",
					content: [
						{ type: "text", text: "Transcreva esta dieta." },
						...documents.map((document) => ({
							type: "file" as const,
							mediaType: document.mediaType,
							data: document.data,
						})),
					],
				},
			],
		});
		return { ok: true, diet: output };
	} catch (error) {
		console.error("[diet-import] falha ao ler a dieta", error);
		if (isRateLimited(error)) return { ok: false, error: AI_RATE_LIMITED };
		if (NoObjectGeneratedError.isInstance(error)) {
			return {
				ok: false,
				error:
					"Não consegui entender o documento. Tente uma foto mais nítida ou o PDF.",
			};
		}
		return {
			ok: false,
			error: "Não foi possível ler a dieta agora. Tente de novo.",
		};
	}
}
