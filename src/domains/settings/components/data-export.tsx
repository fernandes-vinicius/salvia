"use client";

import { FormSection } from "~/shared/components/form-section";
import { Download } from "~/shared/components/icons";
import { Button } from "~/shared/components/ui/button";
import { analytics } from "~/shared/lib/analytics/analytics";

// "Baixar meus dados": o arquivo sai da rota `/configuracoes/meus-dados`
// (JSON com perfil, meta, dieta, alimentos, medidas, check-ins e receitas).
export function DataExport() {
	return (
		<FormSection
			title="Seus dados"
			description="Baixe tudo o que o app guarda sobre você: perfil, meta, dieta, alimentos, medidas, check-ins e receitas, num arquivo JSON."
		>
			<div>
				<Button
					variant="outline"
					nativeButton={false}
					onClick={() => analytics.track("dados_baixados")}
					render={
						// biome-ignore lint/a11y/useAnchorContent: o texto vem como filho do Button
						<a href="/configuracoes/meus-dados" download />
					}
				>
					<Download data-icon="inline-start" />
					Baixar meus dados
				</Button>
			</div>
		</FormSection>
	);
}
