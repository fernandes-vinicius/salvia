import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocument, LegalSection } from "~/domains/legal";
import { APP_NAME, SUPPORT_EMAIL } from "~/shared/lib/app-config";

export const metadata: Metadata = {
	title: "Política de privacidade",
	description: `Quais dados o ${APP_NAME} coleta, por que, onde ficam guardados e como exercer seus direitos pela LGPD.`,
	alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
	return (
		<LegalDocument
			title="Política de privacidade"
			intro={
				<p>
					Esta política explica quais dados pessoais o {APP_NAME} trata, pra quê
					e quais são os seus direitos, conforme a Lei Geral de Proteção de
					Dados (Lei nº 13.709/2018, LGPD). Resumo: coletamos só o necessário
					pro app funcionar, não vendemos seus dados e você pode apagar tudo
					quando quiser.
				</p>
			}
		>
			<LegalSection title="1. Quem é o responsável">
				<p>
					O controlador dos dados é o responsável pelo {APP_NAME}, que pode ser
					contatado em <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
					Esse é também o canal do encarregado de dados (DPO) pra qualquer
					pedido sobre os seus dados.
				</p>
			</LegalSection>

			<LegalSection title="2. Quais dados coletamos">
				<ul>
					<li>
						<strong>Conta:</strong> nome, e-mail e foto da sua conta Google,
						recebidos quando você entra. Não temos acesso à sua senha.
					</li>
					<li>
						<strong>Dados de saúde e corpo:</strong> sexo, idade, peso, altura,
						rotina de atividade e treinos, objetivo, metas de calorias e macros,
						dieta, alimentos cadastrados, medidas corporais e o check-in das
						refeições (se você comeu, comeu a opção ou furou cada refeição do
						dia), além dos preços de mercado que você salvar na lista de
						compras.
					</li>
					<li>
						<strong>Sessão e segurança:</strong> endereço IP e navegador usados
						no login, guardados junto da sessão pra mantê-la segura.
					</li>
					<li>
						<strong>Uso do app:</strong> os dias em que você abriu o app (só a
						data, sem o que você fez), pra medir se o app está sendo útil ao
						longo das semanas.
					</li>
					<li>
						<strong>Sugestões que você envia:</strong> o tipo (ideia, problema
						ou outro), a mensagem e a página do app em que você estava, quando
						você usa “Enviar sugestão”. Elas ficam ligadas à sua conta (nome e
						e-mail), pra podermos responder.
					</li>
					<li>
						<strong>Estatísticas de visita:</strong> páginas visitadas, de onde
						veio o acesso, país, navegador e tipo de aparelho, de forma anônima
						e agregada, sem cookies e sem identificar você.
					</li>
					<li>
						<strong>Como você usa o site e o app:</strong> cliques, rolagem,
						páginas e ações (por exemplo, “salvou a meta” ou “gerou uma
						receita”), além de gravações da navegação pra entendermos onde a
						tela confunde. Nas páginas públicas isso é anônimo; dentro do app,
						fica ligado à sua conta (id, nome e e-mail). Nas gravações, os
						campos de formulário e todos os textos do app (dieta, peso, medidas)
						aparecem mascarados. Não usamos isso pra publicidade.
					</li>
					<li>
						<strong>Preferências no aparelho:</strong> tema (claro ou escuro) e
						os valores digitados nas calculadoras ficam só no armazenamento
						local do seu navegador.
					</li>
				</ul>
				<p>
					As calculadoras públicas funcionam inteiramente no seu navegador: o
					que você digita nelas não é enviado ao servidor, a menos que você
					entre no app.
				</p>
			</LegalSection>

			<LegalSection title="3. Pra que usamos">
				<ul>
					<li>
						Calcular seu gasto calórico, suas metas e os totais da sua dieta.
					</li>
					<li>
						Guardar seu plano e seu histórico pra você acessar de qualquer
						aparelho.
					</li>
					<li>Identificar você e proteger a sua conta.</li>
					<li>
						Sugerir ajustes na sua meta a partir das pesagens que você registra
						(o ajuste só é aplicado se você confirmar).
					</li>
					<li>
						Entender, em números agregados, quais páginas e recursos são usados,
						pra melhorar o app.
					</li>
					<li>Responder seus pedidos de suporte.</li>
					<li>
						Ler suas sugestões e relatos de problema pra decidir o que melhorar
						no app.
					</li>
				</ul>
				<p>
					Não usamos seus dados pra publicidade, não vendemos e não
					compartilhamos com anunciantes.
				</p>
			</LegalSection>

			<LegalSection title="4. Base legal">
				<p>
					Peso, medidas e dieta são dados pessoais sensíveis (dados referentes à
					saúde). Tratamos esses dados com base no seu{" "}
					<strong>consentimento</strong> (art. 11, I, da LGPD), dado ao entrar
					no app e informar esses dados com essa finalidade. Os dados da conta e
					de sessão são tratados pra executar o serviço que você pediu (art. 7º,
					V) e por segurança (legítimo interesse, art. 7º, IX).
				</p>
				<p>
					Você pode retirar o consentimento a qualquer momento excluindo sua
					conta (veja o item 7).
				</p>
			</LegalSection>

			<LegalSection title="5. Com quem os dados são compartilhados">
				<p>
					Só com os fornecedores que fazem o app funcionar, que tratam os dados
					em nosso nome e apenas pra isso:
				</p>
				<ul>
					<li>
						<strong>Google</strong>: login (autenticação da sua conta Google).
					</li>
					<li>
						<strong>Vercel</strong>: hospedagem do site, com servidores em São
						Paulo, e estatísticas anônimas de visita (Vercel Web Analytics).
					</li>
					<li>
						<strong>Neon</strong>: banco de dados, hospedado em São Paulo (AWS
						sa-east-1).
					</li>
					<li>
						<strong>Microsoft (Clarity)</strong>: mapa de cliques e gravações
						anônimas das páginas públicas (página inicial, calculadoras e links
						compartilhados).
					</li>
					<li>
						<strong>PostHog</strong>: estatísticas de uso do app (funil,
						retenção) e gravações com textos mascarados.
					</li>
					<li>
						<strong>Google (Gemini)</strong>: nos recursos com IA, ainda em
						teste, lê o arquivo da dieta que você envia e sugere receitas a
						partir das suas refeições. O arquivo não fica guardado no app.
					</li>
					<li>
						<strong>Unsplash</strong>: fotos ilustrativas das receitas,
						carregadas direto do Unsplash (que recebe o endereço IP do seu
						aparelho ao exibir a foto).
					</li>
				</ul>
				<p>
					Essas empresas têm sede fora do Brasil, o que pode envolver
					transferência internacional de dados, feita com as garantias previstas
					no art. 33 da LGPD (cláusulas contratuais dos próprios fornecedores).
					Também podemos compartilhar dados se uma lei ou ordem judicial exigir.
				</p>
				<p>
					Se você criar um link em “Compartilhar dieta”, quem tiver o link vê as
					refeições, os alimentos e as quantidades da sua dieta atual, sem seu
					nome, e-mail ou medidas. Você pode gerar um link novo ou desativá-lo a
					qualquer momento.
				</p>
			</LegalSection>

			<LegalSection title="6. Por quanto tempo guardamos">
				<p>
					Enquanto sua conta existir. Ao excluir a conta, apagamos na hora
					perfil, metas, dieta, alimentos, medidas e sessões. Cópias de
					segurança do banco de dados são sobrescritas automaticamente em até 30
					dias.
				</p>
			</LegalSection>

			<LegalSection title="7. Seus direitos">
				<p>Pela LGPD (art. 18), você pode a qualquer momento:</p>
				<ul>
					<li>
						Confirmar e acessar seus dados: tudo o que guardamos aparece nas
						telas do app.
					</li>
					<li>
						Corrigir dados: edite direto no app (TMB, Meta, Dieta e Medidas).
					</li>
					<li>
						Excluir sua conta e todos os dados: em{" "}
						<Link href="/configuracoes">Configurações</Link> → Excluir conta.
					</li>
					<li>
						Pedir uma cópia dos dados (portabilidade), informações sobre o
						compartilhamento ou revisar o consentimento: escreva pra{" "}
						<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Respondemos
						em até 15 dias.
					</li>
				</ul>
				<p>
					Você também pode reclamar à Autoridade Nacional de Proteção de Dados
					(ANPD).
				</p>
			</LegalSection>

			<LegalSection title="8. Segurança">
				<p>
					A conexão é sempre criptografada (HTTPS), o login é feito pelo Google,
					cada pessoa só acessa os próprios dados e o banco fica em fornecedor
					com criptografia em repouso. Nenhum sistema é 100% seguro; se
					acontecer um incidente que traga risco a você, avisaremos você e a
					ANPD.
				</p>
			</LegalSection>

			<LegalSection title="9. Cookies">
				<p>
					Dentro do app, usamos só o cookie de sessão, necessário pra manter
					você conectado; as estatísticas de uso (PostHog) ficam no
					armazenamento local do navegador, sem cookies. O Microsoft Clarity,
					nas páginas públicas, roda no modo sem cookies. Não usamos cookies de
					publicidade.
				</p>
			</LegalSection>

			<LegalSection title="10. Menores de idade">
				<p>
					O {APP_NAME} é destinado a maiores de 18 anos. Menores só devem usar
					com o consentimento e o acompanhamento dos pais ou responsáveis.
				</p>
			</LegalSection>

			<LegalSection title="11. Mudanças nesta política">
				<p>
					Se mudarmos algo importante, avisaremos no app antes de a mudança
					valer. A data no topo indica a última revisão. Veja também os{" "}
					<Link href="/termos">Termos de uso</Link>.
				</p>
			</LegalSection>
		</LegalDocument>
	);
}
