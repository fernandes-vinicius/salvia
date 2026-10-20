import {
	Beef,
	Droplet,
	Flame,
	PersonStanding,
	Scale,
	Target,
} from "~/shared/components/icons";

/** Calculadoras públicas (índice, sitemap e links internos). */
export const CALCULATORS = [
	{
		href: "/calculadoras/tmb",
		icon: Flame,
		title: "TMB e gasto calórico",
		description:
			"Quantas calorias seu corpo gasta em repouso e no dia todo, com treino e rotina.",
	},
	{
		href: "/calculadoras/macros",
		icon: Target,
		title: "Macros para perder peso ou ganhar massa",
		description:
			"Calorias da meta e gramas de proteína, carboidrato e gordura em g/kg.",
	},
	{
		href: "/calculadoras/proteina",
		icon: Beef,
		title: "Proteína por dia",
		description:
			"Quanto de proteína você precisa e quanto de frango, ovo ou whey isso dá.",
	},
	{
		href: "/calculadoras/agua",
		icon: Droplet,
		title: "Água por dia",
		description:
			"O mínimo e o recomendado pra quem treina, pelo peso, treino e calor.",
	},
	{
		href: "/calculadoras/imc",
		icon: Scale,
		title: "IMC e peso saudável",
		description:
			"Seu índice de massa corporal, a faixa da OMS e o peso saudável pra sua altura.",
	},
	{
		href: "/calculadoras/gordura-corporal",
		icon: PersonStanding,
		title: "Percentual de gordura",
		description:
			"Estime a gordura corporal com fita métrica e veja quanto é massa magra.",
	},
] as const;
