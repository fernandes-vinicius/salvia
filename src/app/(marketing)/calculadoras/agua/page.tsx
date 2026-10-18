import type { Metadata } from "next";
import Link from "next/link";

import { CalculatorPage } from "~/domains/calculators/components/calculator-page";
import { WaterCalculator } from "~/domains/calculators/components/water-calculator";

const DESCRIPTION =
	"Quantos litros de água por dia você precisa pra treinar e ganhar massa? Calcule o mínimo e o recomendado pelo seu peso, pelo tempo de treino e pelo calor, em litros e copos.";

export const metadata: Metadata = {
	title: "Quanta água beber por dia? Calculadora para quem treina",
	description: DESCRIPTION,
	keywords: ["hidratação", "hipertrofia", "água por dia", "ml por kg"],
	alternates: { canonical: "/calculadoras/agua" },
};

const FAQ = [
	{
		question: "Quantos litros de água por dia pra ganhar massa?",
		answer:
			"Uma base comum é de 35 ml por kg de peso no dia a dia; quem treina fica melhor perto de 40 ml por kg, mais o que perde de suor no treino (cerca de 0,5 a 1 litro por hora). Pra 75 kg com 1 hora de treino, dá uns 3,5 litros.",
	},
	{
		question: "Como saber se estou bebendo o suficiente?",
		answer:
			"O jeito mais simples é olhar a urina: amarelo-claro, quase transparente, indica boa hidratação; amarelo-escuro é sinal de que falta água. Sede forte e dor de cabeça no treino também são avisos.",
	},
	{
		question: "Água demais faz mal?",
		answer:
			"Pode fazer. Beber muito em pouco tempo dilui o sódio do sangue. Espalhe a água ao longo do dia e, no treino, não passe de cerca de 1 litro por hora. Quem tem doença renal ou cardíaca deve seguir a orientação do médico.",
	},
	{
		question: "Café, chá e suco contam?",
		answer:
			"Contam. Toda bebida soma, e até a comida entrega cerca de 20% da água do dia (frutas, verduras, arroz, feijão). O café em quantidade moderada não desidrata quem já está acostumado.",
	},
	{
		question: "Quem toma creatina precisa de mais água?",
		answer:
			"A creatina leva água pra dentro do músculo, então é comum caprichar na hidratação. Ficar perto do valor recomendado todos os dias, e não só nos de treino, costuma ser suficiente.",
	},
];

export default function WaterCalculatorPage() {
	return (
		<CalculatorPage
			path="/calculadoras/agua"
			name="Água por dia"
			title="Quanta água beber por dia pra treinar e ganhar massa?"
			description={DESCRIPTION}
			intro={
				<p>
					Coloque seu peso, quanto tempo você treina e o quanto sua pra ver o
					mínimo do dia e o recomendado pra quem treina, em litros, copos e
					garrafas.
				</p>
			}
			calculator={<WaterCalculator />}
			faq={FAQ}
		>
			<h2>Como calculamos</h2>
			<p>
				São estimativas pra adultos saudáveis, a partir do peso. Usamos dois
				números:
			</p>
			<ul>
				<li>
					<strong>Mínimo: 35 ml por kg</strong> de peso por dia, a base usual
					pra quem não treina naquele dia e está num clima ameno.
				</li>
				<li>
					<strong>Recomendado: 40 ml por kg</strong>, mais a reposição do suor
					do treino: cerca de 0,5 L por hora em clima ameno, 0,75 L no calor e 1
					L pra quem sua muito, e mais 0,5 L no dia quente.
				</li>
			</ul>
			<p>
				As referências são as da Autoridade Europeia de Segurança Alimentar
				(EFSA), que indica cerca de 2 litros de água por dia pra mulheres e 2,5
				pra homens, somando bebida e comida, e as do Colégio Americano de
				Medicina do Esporte (ACSM), que mostram perdas de suor de 0,3 a mais de
				2 litros por hora de exercício.
			</p>
			<h3>Hidratação e músculo</h3>
			<p>
				Perder só 2% do peso em suor já derruba a força e o rendimento no
				treino. Bebendo bem, você treina melhor, e é o treino com uma dieta bem
				montada que faz o músculo crescer. Pra fechar a conta da comida, use a{" "}
				<Link href="/calculadoras/proteina">calculadora de proteína</Link> e a{" "}
				<Link href="/calculadoras/macros">de macros</Link>.
			</p>
			<p>
				A calculadora é uma ferramenta de estimativa e não substitui a
				orientação de um médico ou nutricionista.
			</p>
		</CalculatorPage>
	);
}
