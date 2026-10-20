import type { Metadata } from "next";
import Link from "next/link";

import { BodyFatCalculator } from "~/domains/calculators/components/body-fat-calculator";
import { CalculatorPage } from "~/domains/calculators/components/calculator-page";

const DESCRIPTION =
	"Estime seu percentual de gordura corporal com uma fita métrica: pescoço, cintura e quadril, pelo método da Marinha dos EUA. Veja quantos kg são gordura e quantos são massa magra.";

export const metadata: Metadata = {
	title: "Calculadora de percentual de gordura corporal (com fita métrica)",
	description: DESCRIPTION,
	keywords: [
		"percentual de gordura",
		"gordura corporal",
		"massa magra",
		"método da marinha",
		"bf",
	],
	alternates: { canonical: "/calculadoras/gordura-corporal" },
};

const FAQ = [
	{
		question: "Quão precisa é essa estimativa?",
		answer:
			"O método da Marinha dos EUA costuma errar 3 a 4 pontos pra mais ou pra menos em relação a exames como o DEXA. Serve bem pra acompanhar a sua evolução: medindo sempre do mesmo jeito, a tendência é confiável.",
	},
	{
		question: "Qual é um bom percentual de gordura?",
		answer:
			"Pelas faixas do American Council on Exercise, homens em forma ficam entre 14% e 17% e mulheres entre 21% e 24%. A média da população adulta é de 18% a 24% nos homens e de 25% a 31% nas mulheres.",
	},
	{
		question: "Como medir pescoço, cintura e quadril?",
		answer:
			"Com fita métrica justa, sem apertar a pele, de manhã e em jejum. Pescoço: logo abaixo do pomo de adão. Cintura: na altura do umbigo, com a barriga relaxada. Quadril: na parte mais larga do bumbum.",
	},
	{
		question: "É melhor que o IMC?",
		answer:
			"Pra quem treina, sim: o IMC não separa músculo de gordura, e o percentual de gordura separa (mesmo sendo uma estimativa). O ideal é olhar os dois junto com a cintura.",
	},
];

export default function BodyFatCalculatorPage() {
	return (
		<CalculatorPage
			path="/calculadoras/gordura-corporal"
			name="Percentual de gordura"
			title="Qual é o seu percentual de gordura? Estime com uma fita métrica"
			description={DESCRIPTION}
			intro={
				<p>
					Coloque peso, altura e as medidas de pescoço e cintura (e quadril, pra
					mulheres) pra ver o percentual de gordura estimado, a faixa e quanto
					do seu peso é massa magra.
				</p>
			}
			calculator={<BodyFatCalculator />}
			faq={FAQ}
		>
			<h2>Como calculamos</h2>
			<p>
				Usamos a fórmula da Marinha dos EUA (Hodgdon e Beckett), que estima a
				gordura pela diferença entre as medidas e a altura:
			</p>
			<ul>
				<li>
					<strong>Homens:</strong> 495 ÷ (1,0324 − 0,19077 × log(cintura −
					pescoço) + 0,15456 × log(altura)) − 450
				</li>
				<li>
					<strong>Mulheres:</strong> 495 ÷ (1,29579 − 0,35004 × log(cintura +
					quadril − pescoço) + 0,221 × log(altura)) − 450
				</li>
			</ul>
			<p>
				Medidas em centímetros. A gordura em kg é o peso × o percentual, e a
				massa magra (músculo, ossos, água e órgãos) é o resto. As faixas são as
				do American Council on Exercise (ACE).
			</p>
			<h3>Pra que serve na dieta</h3>
			<p>
				Saber a massa magra ajuda a entender o que a balança mostra: perder peso
				mantendo a massa magra é perder gordura. Pra isso, a{" "}
				<Link href="/calculadoras/proteina">proteína do dia</Link> e o{" "}
				<Link href="/calculadoras/macros">déficit certo</Link> fazem a
				diferença. Compare também com o{" "}
				<Link href="/calculadoras/imc">seu IMC</Link>.
			</p>
			<p>
				É uma estimativa e não substitui exames como bioimpedância ou DEXA, nem
				a avaliação de um profissional.
			</p>
		</CalculatorPage>
	);
}
