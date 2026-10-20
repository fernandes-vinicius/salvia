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
			</LegalSection>

			<LegalSection title="5. Alimentos, fibras e água">
				<ul>
					<li>
						<strong>Alimentos:</strong> Tabela Brasileira de Composição de
						Alimentos (TACO/Unicamp), por 100 g, mais os que você cadastra pelo
						rótulo. Alguns itens que a TACO não mediu (como o leite integral
						líquido) usam valores do USDA. Medidas caseiras (colher, concha,
						fatia) são médias do IBGE e aparecem sempre com "≈".
					</li>
					<li>
						<strong>Fibras:</strong> pelo menos 25 g por dia (OMS) ou 14 g a
						cada 1.000 kcal, o que for maior.
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
