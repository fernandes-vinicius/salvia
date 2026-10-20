/**
 * Id do projeto do Microsoft Clarity, validado (vai dentro de um script
 * inline): só letras e números. Null = Clarity desligado.
 */
export function clarityProjectId(raw: string | undefined) {
	const id = raw?.trim() ?? "";
	return /^[a-z0-9]{4,32}$/i.test(id) ? id : null;
}
