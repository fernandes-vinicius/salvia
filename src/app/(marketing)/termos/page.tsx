import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocument, LegalSection } from "~/domains/legal";
import { APP_NAME, SUPPORT_EMAIL } from "~/shared/lib/app-config";

export const metadata: Metadata = {
	title: "Termos de uso",
	description: `Regras de uso do ${APP_NAME}: o que o app faz, o que não faz e as responsabilidades de cada um.`,
	alternates: { canonical: "/termos" },
};

export default function TermsPage() {
	return (
		<LegalDocument
			title="Termos de uso"
			intro={
				<p>
					Ao usar o {APP_NAME}, você concorda com estes termos. Leia com
					atenção, principalmente o item 2: o {APP_NAME} é uma ferramenta de
					cálculo e organização, não um serviço de nutrição.
				</p>
			}
		>
			<LegalSection title="1. O que é o serviço">
				<p>
					O {APP_NAME} é um aplicativo web que ajuda você a estimar seu gasto
					calórico, definir metas de calorias e macronutrientes e organizar a
					sua própria dieta, com base em dados que você informa e na Tabela
					Brasileira de Composição de Alimentos (TACO/Unicamp).
				</p>
			</LegalSection>

			<LegalSection title="2. Não é orientação nutricional nem médica">
				<p>
					<strong>
						O {APP_NAME} não substitui nutricionista, médico ou outro
						profissional de saúde, e não faz prescrição dietética.
					</strong>{" "}
					Os resultados são estimativas feitas por fórmulas populacionais (como
					Mifflin-St Jeor) e podem não refletir o seu caso. As metas são
					definidas por você, e as dietas prontas são modelos de exemplo, com
					quantidades recalculadas a partir das metas que você escolheu.
				</p>
				<ul>
					<li>
						Procure um profissional antes de mudar a alimentação se você tem
						alguma doença, está grávida ou amamentando, tem ou teve transtorno
						alimentar, usa medicamentos ou tem menos de 18 anos.
					</li>
					<li>
						Pare e procure ajuda se sentir qualquer sintoma fora do normal.
					</li>
					<li>
						Você é responsável pelas decisões que toma sobre a sua alimentação.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="3. Sua conta">
				<p>
					O acesso é pela sua conta Google. Você é responsável por manter essa
					conta segura e pelos dados que cadastra. O uso é pessoal e destinado a
					maiores de 18 anos.
				</p>
			</LegalSection>

			<LegalSection title="4. Uso permitido">
				<p>Você concorda em não:</p>
				<ul>
					<li>
						Tentar acessar dados de outras pessoas ou burlar a segurança do app.
					</li>
					<li>
						Usar robôs, extrair dados em massa ou sobrecarregar o serviço.
					</li>
					<li>Copiar, revender ou redistribuir o app ou partes dele.</li>
				</ul>
			</LegalSection>

			<LegalSection title="5. Dados dos alimentos">
				<p>
					Os valores nutricionais vêm da TACO e dos rótulos que você cadastra.
					Fazemos o possível pra mantê-los corretos, mas podem existir
					diferenças em relação ao alimento que você consome (marca, preparo,
					variedade).
				</p>
			</LegalSection>

			<LegalSection title="6. Disponibilidade e mudanças">
				<p>
					O serviço é oferecido como está. Podemos melhorar, mudar ou
					descontinuar recursos, e podem ocorrer interrupções. Se no futuro
					houver planos pagos, as condições serão apresentadas antes de qualquer
					cobrança, e nada será cobrado sem a sua confirmação.
				</p>
			</LegalSection>

			<LegalSection title="7. Limitação de responsabilidade">
				<p>
					Na extensão permitida pela lei, o {APP_NAME} não se responsabiliza por
					resultados de saúde, estéticos ou de desempenho, nem por danos
					decorrentes de decisões tomadas com base nas estimativas do app. Nada
					aqui afasta direitos garantidos pelo Código de Defesa do Consumidor.
				</p>
			</LegalSection>

			<LegalSection title="8. Privacidade">
				<p>
					O tratamento dos seus dados segue a{" "}
					<Link href="/privacidade">Política de privacidade</Link>.
				</p>
			</LegalSection>

			<LegalSection title="9. Encerramento">
				<p>
					Você pode excluir sua conta a qualquer momento em Configurações.
					Podemos suspender contas que violem estes termos.
				</p>
			</LegalSection>

			<LegalSection title="10. Lei e contato">
				<p>
					Estes termos seguem as leis brasileiras. Dúvidas:{" "}
					<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
				</p>
			</LegalSection>
		</LegalDocument>
	);
}
