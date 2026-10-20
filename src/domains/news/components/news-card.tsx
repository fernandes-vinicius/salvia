import { NewsLink } from "~/domains/news/components/news-link";
import { NEWS_SOURCE, type NewsItem } from "~/domains/news/utils/news";
import { ExternalLink } from "~/shared/components/icons";
import { APP_NAME } from "~/shared/lib/app-config";

interface NewsCardProps {
	items: NewsItem[];
}

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
	day: "numeric",
	month: "short",
	timeZone: "America/Sao_Paulo",
});

// Manchetes do blog Hipertrofia.org no Início: só título, data e uma linha
// de resumo, abrindo o artigo no site deles (regras em `news/utils/news.ts`).
export function NewsCard({ items }: NewsCardProps) {
	if (items.length === 0) return null;

	return (
		<section
			aria-labelledby="manchetes"
			className="flex flex-col gap-3 rounded-3xl bg-card p-4 md:p-5"
		>
			<header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
				<h2 id="manchetes" className="font-heading font-semibold">
					Para ler
				</h2>
				<NewsLink
					href={NEWS_SOURCE.url}
					event={{ fonte: NEWS_SOURCE.name, artigo: "blog", posicao: 0 }}
					className="text-muted-foreground text-xs underline-offset-2 hover:underline"
				>
					Do blog {NEWS_SOURCE.name}
				</NewsLink>
			</header>
			<ul className="flex flex-col divide-y divide-border">
				{items.map((item, index) => (
					<li key={item.id}>
						<NewsLink
							href={item.url}
							event={{
								fonte: NEWS_SOURCE.name,
								artigo: item.title,
								posicao: index + 1,
							}}
							className="group flex flex-col gap-1 rounded-xl py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
						>
							<span className="flex items-start justify-between gap-3">
								<span className="text-pretty font-medium text-sm group-hover:underline group-hover:underline-offset-2">
									{item.title}
								</span>
								<ExternalLink
									className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
									aria-hidden
								/>
							</span>
							{item.excerpt && (
								<span className="line-clamp-2 text-pretty text-muted-foreground text-xs">
									{item.excerpt}
								</span>
							)}
							<time
								dateTime={item.publishedAt}
								className="text-muted-foreground text-xs tabular-nums"
							>
								{dateFormat.format(new Date(item.publishedAt))}
							</time>
						</NewsLink>
					</li>
				))}
			</ul>
			<p className="text-muted-foreground text-xs">
				Abre no site deles. O {APP_NAME} não tem vínculo com o blog.
			</p>
		</section>
	);
}
