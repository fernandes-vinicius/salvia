import { getCurrentUser } from "~/domains/auth/services/session-service";
import { exportUserData } from "~/domains/settings/services/data-export-service";
import { APP_NAME } from "~/shared/lib/app-config";
import { localDateString } from "~/shared/lib/dates";

// "Baixar meus dados" (Configurações): um JSON com tudo o que o app guarda
// da pessoa. Sem sessão, o DAL manda pro login.
export async function GET() {
	const user = await getCurrentUser();
	const data = await exportUserData(user.id);
	const slug = APP_NAME.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[^a-z0-9]+/g, "-");

	return new Response(JSON.stringify(data, null, 2), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Disposition": `attachment; filename="${slug}-meus-dados-${localDateString()}.json"`,
			"Cache-Control": "no-store",
		},
	});
}
