// Compartilhar receita salva: link público `/r/:token` + mensagem pronta
// (WhatsApp usa o negrito com asteriscos).

export function recipeShareUrl(siteUrl: string, token: string) {
	return `${siteUrl.replace(/\/$/, "")}/r/${token}`;
}

export function recipeShareMessage(
	recipe: { title: string; minutes: number },
	url: string,
) {
	return `Olha essa receita que eu fiz com o que já estava na minha dieta: *${recipe.title}* (${recipe.minutes} min)\n${url}`;
}

export function whatsappShareUrl(message: string) {
	return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
