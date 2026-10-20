import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NewsCard } from "~/domains/news/components/news-card";

// Manchetes mockadas (as de verdade vêm da API do WordPress, no servidor).
const meta = {
	title: "App/Manchetes do blog",
	component: NewsCard,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Últimas manchetes do blog Hipertrofia.org no Início: só título, data e uma linha de resumo, com link pro artigo no site deles (termos de uso: sem texto completo, sem imagens, sem sugerir parceria). Sem manchetes, o card não aparece.",
			},
		},
	},
	args: {
		items: [
			{
				id: 1,
				title:
					"4 suplementos para usar nos dias de descanso e acelerar a recuperação muscular",
				excerpt:
					"Nos dias sem treino o corpo se recupera e cresce. Veja o que a ciência diz sobre o que realmente ajuda nessa fase",
				publishedAt: "2026-10-14T10:39:45Z",
				url: "https://www.hipertrofia.org/blog/",
			},
			{
				id: 2,
				title: "Como a musculação faz os músculos crescerem?",
				excerpt:
					"O que acontece no músculo depois do treino, do estímulo à adaptação.",
				publishedAt: "2026-08-09T00:22:25Z",
				url: "https://www.hipertrofia.org/blog/",
			},
		],
	},
	render: (args) => (
		<div className="max-w-xl">
			<NewsCard {...args} />
		</div>
	),
} satisfies Meta<typeof NewsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Manchetes: Story = {};
