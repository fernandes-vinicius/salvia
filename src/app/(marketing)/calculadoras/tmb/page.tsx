import type { Metadata } from "next";
import Link from "next/link";

import { BmrCalculator } from "~/domains/calculators/components/bmr-calculator";
import { CalculatorPage } from "~/domains/calculators/components/calculator-page";

const DESCRIPTION =
	"Calcule grátis sua taxa metabólica basal (TMB) e quantas calorias você gasta por dia, somando rotina, musculação e cardio. Fórmulas Mifflin-St Jeor e Harris-Benedict.";

export const metadata: Metadata = {
	title: "Calculadora de TMB e gasto calórico diário",
	description: DESCRIPTION,
	alternates: { canonical: "/calculadoras/tmb" },
};

const FAQ = [
	{
		question: "Qual a diferença entre TMB e gasto calórico diário?",
		answer:
			"A TMB é o que o corpo gasta em repouso absoluto, só pra se manter vivo. O gasto calórico diário (GCD, ou TDEE em inglês) soma a TMB com o movimento do dia a dia, os treinos e a digestão. É o GCD que serve de base pra montar a dieta.",
	},
	{
		question:
			"Qual fórmula é mais precisa, Mifflin-St Jeor ou Harris-Benedict?",
		answer:
			"Para a maioria das pessoas, a Mifflin-St Jeor erra menos e é a mais usada hoje. A Harris-Benedict original, de 1919, costuma dar valores um pouco mais altos. As duas são estimativas populacionais: use o resultado como ponto de partida e ajuste pelo seu peso ao longo das semanas.",
	},
	{
		question: "Por que aqui o treino é calculado à parte?",
		answer:
			"Os fatores de atividade clássicos (1,2 a 1,9) misturam rotina e treino num número só e costumam superestimar o gasto de quem treina. Aqui o dia a dia multiplica a TMB e cada treino soma pelas horas e pela intensidade (MET), o que evita contar o treino duas vezes.",
	},
	{
		question: "O resultado é exato?",
		answer:
			"Não, nenhuma fórmula é. A margem de erro costuma ser de 10% pra mais ou pra menos. Acompanhe seu peso por 2 a 3 semanas: se ele não se mover como esperado, ajuste as calorias.",
	},
];

export default function BmrCalculatorPage() {
	return (
		<CalculatorPage
			path="/calculadoras/tmb"
			name="TMB e gasto calórico"
			title="Calculadora de TMB e gasto calórico diário"
			description={DESCRIPTION}
			intro={
				<p>
					Descubra quantas calorias seu corpo gasta em repouso (TMB) e no dia
					inteiro, com rotina, musculação e cardio separados. Ajuste os valores
					e o resultado muda na hora.
				</p>
			}
			calculator={<BmrCalculator />}
			faq={FAQ}
		>
			<h2>Como o cálculo é feito</h2>
			<p>
				Primeiro estimamos a <strong>taxa metabólica basal</strong> com a
				fórmula de Mifflin-St Jeor:
			</p>
			<ul>
				<li>Homens: 10 × peso (kg) + 6,25 × altura (cm) − 5 × idade + 5</li>
				<li>Mulheres: 10 × peso (kg) + 6,25 × altura (cm) − 5 × idade − 161</li>
			</ul>
			<p>
				Depois somamos o resto do dia, pelo <strong>método fatorial</strong>:
			</p>
			<ul>
				<li>
					<strong>Dia a dia</strong>: a TMB multiplicada por um fator de 1,1
					(sedentário) a 1,3 (trabalho físico pesado), sem contar treino.
				</li>
				<li>
					<strong>Treinos</strong>: calorias pela intensidade (MET), pelo seu
					peso e pelo tempo de treino na semana, em média por dia.
				</li>
				<li>
					<strong>Digestão</strong>: cerca de 10% do total, gasto pra digerir a
					comida.
				</li>
			</ul>
			<h3>E agora?</h3>
			<p>
				Com o gasto em mãos, o próximo passo é a meta: comer um pouco menos pra
				perder gordura, o mesmo pra manter ou um pouco mais pra ganhar massa. A{" "}
				<Link href="/calculadoras/macros">calculadora de macros</Link> faz essa
				conta e divide as calorias em proteína, carboidrato e gordura.
			</p>
		</CalculatorPage>
	);
}
