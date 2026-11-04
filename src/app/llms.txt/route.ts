import { llmsText } from "~/domains/landing/utils/llms-text";
import { AI_IS_OPEN } from "~/shared/lib/ai-launch";
import { SITE_URL } from "~/shared/lib/app-config";

export function GET() {
	return new Response(llmsText(SITE_URL, AI_IS_OPEN), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
