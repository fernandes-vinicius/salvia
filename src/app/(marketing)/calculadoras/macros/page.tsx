import type { Metadata } from "next";
import Link from "next/link";

import { CalculatorPage } from "~/domains/calculators/components/calculator-page";
import { MacroCalculator } from "~/domains/calculators/components/macro-calculator";

const DESCRIPTION =
	"Calcule grátis seus macros pra perder peso, manter ou ganhar massa: calorias por dia e gramas de proteína, carboidrato e gordura em g/kg, a partir do seu gasto calórico.";

export const metadata: Metadata = {
	title: "Calculadora de macros para perder peso ou ganhar massa",
	description: DESCRIPTION,
	alternates: { canonical: "/calculadoras/macros" },
};

const FAQ = [
	{
		question: "Quantas calorias cortar pra perder peso?",
		answer:
			"Comer cerca de 500 kcal a menos do que você gasta por dia leva a perder perto de 0,5 kg por semana, ritmo que a maioria consegue manter sem perder muito músculo. Cortes maiores aceleram, mas ficam mais difíceis de sustentar.",
	},
	{
		question: "Quanto comer a mais pra ganhar massa?",
		answer:
			"Entre 250 e 500 kcal acima do gasto. Comendo só um pouco a mais, você ganha músculo com menos gordura; acima disso, o ganho extra tende a ser gordura.",
	},
	{
		question: 'Por que a proteína aqui é "animal"?',
		answer:
			"É como muita gente que treina conta: a meta em g/kg é da proteína animal (mais completa em aminoácidos), e a proteína vegetal de arroz, feijão e pão entra no total sem inflar a conta. No app, a dieta mostra as duas separadas.",
	},
	{
		question: "O carboidrato não aparece pra escolher. Por quê?",
		answer:
			"Por padrão ele é o que sobra: depois de fixar proteína e gordura em g/kg, as calorias restantes viram carboidrato. Se preferir, dá pra fixar o carboidrato em g/kg também.",
	},
];

export default function MacroCalculatorPage() {
	return (
		<CalculatorPage
			path="/calculadoras/macros"
			name="Macros"
			title="Calculadora de macros para perder peso, manter ou ganhar massa"
			description={DESCRIPTION}
			intro={
				<p>
					Em dois passos: primeiro o quanto você gasta por dia, depois o
					objetivo. Saem as calorias da meta e os gramas de proteína,
					carboidrato e gordura, do jeito que se conta na academia: em g por kg
					de peso.
				</p>
			}
			calculator={<MacroCalculator />}
			faq={FAQ}
		>
			<h2>Como os macros são divididos</h2>
			<p>
				A meta de calorias é o seu <strong>gasto diário</strong> mais o ajuste
				do objetivo (a menos pra perder peso, a mais pra ganhar massa). Os
				macros partem dela:
			</p>
			<ul>
				<li>
					<strong>Proteína</strong>: 2,2 g/kg pra perder peso, 1,8 g/kg pra
					manter e 2,0 g/kg pra ganhar massa (4 kcal por grama).
				</li>
				<li>
					<strong>Gordura</strong>: 0,9 a 1,0 g/kg, o suficiente pra saúde
					hormonal (9 kcal por grama).
				</li>
				<li>
					<strong>Carboidrato</strong>: o que sobra das calorias, que abastece o
					treino (4 kcal por grama).
				</li>
			</ul>
			<p>
				Você pode mudar qualquer um desses valores; a calculadora avisa se a
				meta ficar abaixo da TMB ou se sobrar pouco carboidrato.
			</p>
			<h3>Bater os macros na prática</h3>
			<p>
				Saber os números é a parte fácil. O trabalho é montar refeições que
				fechem a conta todo dia. No <Link href="/login">app</Link>, você monta a
				dieta com a tabela TACO e vê na hora quanto falta de cada macro, ou
				começa por um modelo pronto recalculado pras suas metas.
			</p>
		</CalculatorPage>
	);
}
