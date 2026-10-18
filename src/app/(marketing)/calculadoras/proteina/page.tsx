import type { Metadata } from "next";
import Link from "next/link";

import { CalculatorPage } from "~/domains/calculators/components/calculator-page";
import { ProteinCalculator } from "~/domains/calculators/components/protein-calculator";

const DESCRIPTION =
	"Quanto de proteína por dia você precisa pra ganhar massa ou perder peso? Calcule em g/kg pelo seu peso e veja quanto de frango, ovo ou whey dá isso por refeição.";

export const metadata: Metadata = {
	title: "Quanto de proteína por dia? Calculadora para quem treina",
	description: DESCRIPTION,
	alternates: { canonical: "/calculadoras/proteina" },
};

const FAQ = [
	{
		question: "Quanto de proteína por dia pra ganhar massa?",
		answer:
			"Para quem treina, a faixa com mais respaldo nos estudos é de 1,6 a 2,2 g por kg de peso por dia. Acima disso, o ganho extra de músculo é pequeno.",
	},
	{
		question: "Pra perder peso precisa de mais proteína?",
		answer:
			"Sim, vale ficar perto do topo da faixa (cerca de 2,2 g/kg). Com menos calorias, a proteína alta ajuda a preservar a massa muscular e dá mais saciedade.",
	},
	{
		question: "Preciso de whey?",
		answer:
			"Não. Whey é só comida prática: 30 g dão cerca de 24 g de proteína. Frango, ovo, carne, peixe e laticínios batem a meta do mesmo jeito.",
	},
	{
		question: "Proteína demais faz mal?",
		answer:
			"Pra pessoas saudáveis, as quantidades da faixa recomendada são consideradas seguras. Quem tem doença renal ou outra condição de saúde deve seguir a orientação do médico ou nutricionista.",
	},
];

export default function ProteinCalculatorPage() {
	return (
		<CalculatorPage
			path="/calculadoras/proteina"
			name="Proteína por dia"
			title="Quanto de proteína por dia você precisa?"
			description={DESCRIPTION}
			intro={
				<p>
					Coloque seu peso e o objetivo pra ver a proteína do dia, quanto dá por
					refeição e o que isso significa em frango, ovo ou whey.
				</p>
			}
			calculator={<ProteinCalculator />}
			faq={FAQ}
		>
			<h2>De onde vem esse número</h2>
			<p>
				A recomendação para quem faz musculação fica entre{" "}
				<strong>1,6 e 2,2 g de proteína por kg</strong> de peso por dia. Usamos:
			</p>
			<ul>
				<li>
					<strong>2,2 g/kg</strong> pra perder peso, pra não perder músculo
					comendo menos;
				</li>
				<li>
					<strong>2,0 g/kg</strong> pra ganhar massa;
				</li>
				<li>
					<strong>1,8 g/kg</strong> pra manter.
				</li>
			</ul>
			<p>
				Dividir em 3 a 5 refeições ao longo do dia ajuda a aproveitar melhor e
				facilita bater a meta sem pratos gigantes.
			</p>
			<h3>Os equivalentes</h3>
			<p>
				Os valores de frango e ovo são da Tabela Brasileira de Composição de
				Alimentos (TACO): peito de frango grelhado tem cerca de 32 g de proteína
				a cada 100 g, e um ovo médio, cerca de 6,5 g. Para o whey, consideramos
				80% de proteína.
			</p>
			<p>
				Proteína é um macro só. Pra ter também as calorias, o carboidrato e a
				gordura, use a{" "}
				<Link href="/calculadoras/macros">calculadora de macros</Link>.
			</p>
		</CalculatorPage>
	);
}
