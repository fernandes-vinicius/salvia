import { DIET_TEMPLATES } from "~/domains/diet-templates/data/templates";
import { Eye } from "~/shared/components/icons";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";

// Os cards de "Dietas prontas" do Início, com os modelos de verdade. Na
// landing não há metas da pessoa, então mostra só o formato de cada modelo.
export function SampleTemplates() {
	return (
		<ul className="flex flex-col gap-3">
			{DIET_TEMPLATES.map((template) => (
				<li
					key={template.id}
					className="flex flex-col gap-3 rounded-3xl bg-card p-4"
				>
					<div className="flex items-start justify-between gap-3">
						<p className="font-heading font-semibold">{template.name}</p>
						<Badge variant="secondary">{template.tag}</Badge>
					</div>
					<p className="text-pretty text-muted-foreground text-sm">
						{template.description}
					</p>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-muted-foreground text-xs">
							{template.meals.length} refeições · nas suas metas
						</p>
						<div className="flex flex-wrap gap-2">
							<Button size="sm" variant="secondary" tabIndex={-1}>
								<Eye data-icon="inline-start" />
								Visualizar
							</Button>
							<Button size="sm" tabIndex={-1}>
								Usar
							</Button>
						</div>
					</div>
				</li>
			))}
		</ul>
	);
}
