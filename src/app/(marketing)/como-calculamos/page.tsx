import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocument, LegalSection } from "~/domains/legal";
import { APP_NAME } from "~/shared/lib/app-config";

export const metadata: Metadata = {
	title: "Como calculamos",
	description: `As fórmulas e referências que o ${APP_NAME} usa pra estimar gasto calórico, metas de macros, ajuste pelo peso, água e fibras.`,
	alternates: { canonical: "/como-calculamos" },
};

// Transparência: as contas do app, em linguagem simples, com as mesmas
// constantes do código (`profile/utils/energy.ts`, `goal/utils/goal.ts`,
// `goal/utils/calibration.ts`, `calculators/utils/water.ts`).
export default function HowWeCalculatePage() {
	return (
		<LegalDocument
			title="Como calculamos"
			intro={
				<p>
					Todas as contas do {APP_NAME} são estimativas feitas com fórmulas
					usadas por nutricionistas e pesquisadores. Elas dão um bom ponto de
					partida, e o app ajusta pelo seu peso real com o tempo. Nada aqui
					substitui a avaliação de um profissional.
				</p>
			}
		>
			<LegalSection title="1. Taxa metabólica basal (TMB)">
				<p>
					É o que o corpo gasta em repouso absoluto. Usamos{" "}
					<strong>Mifflin-St Jeor</strong> (padrão, a mais precisa pra maioria
					das pessoas) ou <strong>Harris-Benedict</strong> (a clássica, que
					costuma dar um pouco mais), escolhida em Configurações:
				</p>
				<ul>
					<li>
						<strong>Mifflin-St Jeor:</strong> 10 × peso (kg) + 6,25 × altura
						(cm) − 5 × idade + 5 (homens) ou − 161 (mulheres).
					</li>
					<li>
						<strong>Harris-Benedict (1919):</strong> homens 66,47 + 13,75 × peso
						+ 5 × altura − 6,8 × idade; mulheres 655,1 + 9,563 × peso + 1,85 ×
						altura − 4,676 × idade.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="2. Gasto do dia (método fatorial)">
				<p>
					Em vez de um fator de atividade único (1,2 a 1,9, que costuma
					superestimar quem treina e passa o dia sentado), somamos as partes:
				</p>
				<ul>
					<li>
						<strong>Dia a dia (sem treino):</strong> TMB × um fator de 1,1
						(sedentário) a 1,3 (trabalho físico pesado), escolhido por uma
						descrição da sua rotina.
					</li>
					<li>
						<strong>Musculação e cardio:</strong> (MET − 1) × peso × horas de
						treino por semana ÷ 7. O MET é a intensidade de cada atividade
						(musculação de 3,5 a 7,5; cardio de 5 a 10); tiramos 1 porque o
						repouso daquele tempo já está na TMB.
					</li>
					<li>
						<strong>Digestão:</strong> mais 10% do total (efeito térmico dos
						alimentos).
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="3. Meta de calorias e macros">
				<ul>
					<li>
						<strong>Calorias:</strong> o gasto do dia mais o ritmo escolhido.
						Pra perder peso, 250, 500 ou 750 kcal a menos por dia; pra ganhar
						massa, 250 ou 500 a mais (ou um valor seu). O app estima a mudança
						por semana considerando que 7.700 kcal ≈ 1 kg.
					</li>
					<li>
						<strong>Proteína e gordura:</strong> em gramas por kg de peso.
						Sugestões: proteína 2,2 g/kg pra perder peso, 1,8 pra manter e 2,0
						pra ganhar massa (dentro da faixa de 1,6 a 2,2 g/kg dos estudos);
						gordura de 0,9 a 1 g/kg. Por padrão a proteína é a{" "}
						<strong>total</strong> (animal + vegetal); em Configurações dá pra
						contar só a animal.
					</li>
					<li>
						<strong>Carboidrato:</strong> o que sobra das calorias, ÷ 4 (cada
						grama de proteína ou carboidrato tem 4 kcal; de gordura, 9). Se
						preferir, você fixa o carboidrato em g/kg.
					</li>
					<li>
						<strong>Avisos:</strong> quando a meta fica abaixo da TMB ou o
						carboidrato fica muito baixo (menos de 1 g/kg).
					</li>
					<li>
						<strong>Dicas "Por que isso importa?":</strong> ritmo de 0,5% a 1%
						do peso por semana pra perder e de 0,1% a 0,5% pra ganhar; proteína
						de 1,6 a 2,2 g/kg (ISSN); gordura de 0,6 a 1,0 g/kg, sem descer de
						0,5 g/kg nem de 20% das calorias; carboidrato de 3 a 5 g/kg pra quem
						treina até cerca de 1 hora por dia e de 5 a 7 g/kg acima disso
						(ACSM). Fora da faixa, a dica vira "Vale conferir", sem bloquear
						nada.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="4. Ajuste pelo seu peso real">
				<p>
					Fórmulas são médias. Com pelo menos 3 pesagens em 14 dias (olhando as
					últimas 6 semanas), o app calcula a tendência do peso e compara com o
					ritmo esperado da meta. A diferença vira kcal por dia, em passos de
					50, no máximo 300 de cada vez e 800 no total; diferenças menores que
					100 kcal contam como "no ritmo". O ajuste nunca é automático: você
					decide se aplica.
				</p>
				<p>
					Com check-in em pelo menos 5 dias do período, o app também confere
					quanto da dieta você seguiu. Abaixo de 80% das refeições, ele não
					sugere mudar a meta: o peso fora do ritmo pode ser da dieta não
					seguida, não da conta.
				</p>
				<p>
					<strong>Revisões:</strong> no dia 15 e no dia 30 da dieta (depois, a
					cada 30 dias), o Início mostra o peso desde o começo, a adesão e a
					sugestão do ajuste, também em gramas de carboidrato (kcal ÷ 4; arroz
					cozido com 28 g de carboidrato em 100 g). A contagem recomeça quando
					você muda o objetivo ou o ritmo.
				</p>
			</LegalSection>

			<LegalSection title="5. Alimentos, fibras e água">
				<ul>
					<li>
						<strong>Alimentos:</strong> Tabela Brasileira de Composição de
						Alimentos (TACO/Unicamp), por 100 g, mais os que você cadastra pelo
						rótulo. Alguns itens que a TACO não mediu usam valores do USDA
						(leite integral e desnatado líquidos) ou de um produto igual da
						própria TACO (iogurte de abacaxi, com os valores do de morango).
						Medidas caseiras (colher, concha, fatia) são médias do IBGE e
						aparecem sempre com "≈".
					</li>
					<li>
						<strong>Fibras:</strong> pelo menos 25 g por dia (OMS) ou 14 g a
						cada 1.000 kcal, o que for maior.
					</li>
					<li>
						<strong>Sódio e ferro:</strong> somados pela TACO (e pelo sódio dos
						seus alimentos, se o rótulo foi copiado), sem contar o sal de
						cozinha. Aviso acima de 2.000 mg de sódio por dia (OMS) e abaixo do
						ferro recomendado (IOM): 8 mg pra homens e pra mulheres depois dos
						50 anos, 18 mg pra mulheres de 19 a 50, 11 e 15 mg pra meninos e
						meninas adolescentes.
					</li>
					<li>
						<strong>Água:</strong> mínimo de 35 ml por kg; recomendado de 40 ml
						por kg mais o suor do treino (cerca de 0,5 L por hora). Detalhes na{" "}
						<Link href="/calculadoras/agua">calculadora de água</Link>.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="6. Calculadoras">
				<p>
					As <Link href="/calculadoras">calculadoras públicas</Link> usam as
					mesmas contas do app. O IMC segue as faixas da OMS, e o percentual de
					gordura é estimado pelo método da Marinha dos EUA (pescoço, cintura e,
					nas mulheres, quadril). Cada página explica a fórmula.
				</p>
			</LegalSection>

			<LegalSection title="7. Limites">
				<p>
					São estimativas pra adultos saudáveis. Gestantes, lactantes, menores
					de idade, pessoas com doenças (como diabetes ou doença renal) ou com
					objetivos competitivos precisam de acompanhamento profissional. Veja
					também os <Link href="/termos">Termos de uso</Link>.
				</p>
			</LegalSection>
		</LegalDocument>
	);
}
