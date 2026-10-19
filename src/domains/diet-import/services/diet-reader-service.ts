import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { APICallError, generateText, NoObjectGeneratedError, Output } from "ai";

import {
	type ExtractedDiet,
	extractedDietSchema,
} from "~/domains/diet-import/schemas/diet-import-schema";
import { getEnv } from "~/shared/lib/env";

const DEFAULT_MODEL = "gemini-3.1-flash-lite";

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
	const { GEMINI_API_KEY, GEMINI_MODEL } = getEnv();
	if (!GEMINI_API_KEY) {
		return {
			ok: false,
			error: "A leitura com IA não está configurada (falta GEMINI_API_KEY).",
		};
	}
	const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });

	try {
		const { output } = await generateText({
			model: google(GEMINI_MODEL || DEFAULT_MODEL),
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
		if (APICallError.isInstance(error) && error.statusCode === 429) {
			return {
				ok: false,
				error: "Muitas leituras agora. Espere um minuto e tente de novo.",
			};
		}
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
