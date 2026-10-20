import type { Metadata } from "next";
import Link from "next/link";

import { BmiCalculator } from "~/domains/calculators/components/bmi-calculator";
import { CalculatorPage } from "~/domains/calculators/components/calculator-page";

const DESCRIPTION =
	"Calcule seu IMC (índice de massa corporal) pelo peso e pela altura, veja em que faixa você está e qual é o peso saudável pra sua altura. Grátis e sem cadastro.";

export const metadata: Metadata = {
	title: "Calculadora de IMC: índice de massa corporal e peso ideal",
	description: DESCRIPTION,
	keywords: ["imc", "índice de massa corporal", "peso ideal", "obesidade"],
	alternates: { canonical: "/calculadoras/imc" },
};

const FAQ = [
	{
		question: "Como se calcula o IMC?",
		answer:
			"Divida o peso (kg) pela altura (m) ao quadrado. Pra 75 kg e 1,75 m: 75 ÷ (1,75 × 1,75) = 24,5.",
	},
	{
		question: "Qual é o IMC ideal?",
		answer:
			"Pela Organização Mundial da Saúde, de 18,5 a 24,9 é a faixa de peso adequado. Abaixo disso é abaixo do peso; de 25 a 29,9, sobrepeso; a partir de 30, obesidade.",
	},
	{
		question: "O IMC serve pra quem treina?",
		answer:
			"Serve como referência geral, mas tem um limite: ele não separa músculo de gordura. Quem tem muita massa muscular pode dar sobrepeso sem ter gordura sobrando. Pra quem treina, o percentual de gordura e a medida da cintura dizem mais.",
	},
	{
		question: "Vale pra crianças, idosos e gestantes?",
		answer:
			"Não com essas faixas. Crianças e adolescentes usam curvas por idade, e idosos e gestantes têm referências próprias. Nesses casos, siga a orientação de um profissional de saúde.",
	},
];

export default function BmiCalculatorPage() {
	return (
		<CalculatorPage
			path="/calculadoras/imc"
			name="IMC"
			title="Calculadora de IMC: em que faixa está o seu peso?"
			description={DESCRIPTION}
			intro={
				<p>
					Coloque seu peso e sua altura pra ver o IMC, a faixa da OMS e o peso
					considerado saudável pra sua altura.
				</p>
			}
			calculator={<BmiCalculator />}
			faq={FAQ}
		>
			<h2>Como calculamos</h2>
			<p>
				IMC = peso (kg) ÷ altura (m)². As faixas são as da Organização Mundial
				da Saúde (OMS) pra adultos:
			</p>
			<ul>
				<li>
					<strong>Abaixo de 18,5:</strong> abaixo do peso
				</li>
				<li>
					<strong>18,5 a 24,9:</strong> peso adequado
				</li>
				<li>
					<strong>25 a 29,9:</strong> sobrepeso
				</li>
				<li>
					<strong>30 a 34,9:</strong> obesidade grau I;{" "}
					<strong>35 a 39,9:</strong> grau II; <strong>40 ou mais:</strong> grau
					III
				</li>
			</ul>
			<p>O peso saudável pra sua altura é o que dá IMC entre 18,5 e 24,9.</p>
			<h3>O limite do IMC</h3>
			<p>
				O IMC olha só peso e altura, então não sabe o que é músculo e o que é
				gordura. Pra quem treina, veja também a{" "}
				<Link href="/calculadoras/gordura-corporal">
					calculadora de percentual de gordura
				</Link>
				. E pra montar a dieta do seu objetivo, comece pela{" "}
				<Link href="/calculadoras/tmb">calculadora de gasto calórico</Link>.
			</p>
			<p>
				A calculadora é uma ferramenta de estimativa e não substitui a avaliação
				de um médico ou nutricionista.
			</p>
		</CalculatorPage>
	);
}
