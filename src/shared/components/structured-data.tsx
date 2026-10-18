// Dados estruturados (schema.org, JSON-LD) estáticos do próprio código.
// Ajudam a busca a entender a página e podem gerar resultados enriquecidos.
export function StructuredData({ data }: { data: object }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático do próprio código, com `<` escapado
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data).replace(/</g, "\\u003c"),
			}}
		/>
	);
}
