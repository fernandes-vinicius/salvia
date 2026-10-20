import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Checagem otimista: só verifica se o cookie de sessão existe (sem banco,
// porque o proxy roda em toda navegação e prefetch). A validação real fica
// no DAL (`getCurrentUser`). Usuário logado em `/login` é tratado no client
// (`RedirectIfAuthenticated`) pra não gerar loop com cookie expirado.
// `/` é a landing pública; com sessão, vai direto pro app. Termos,
// privacidade, calculadoras, dietas e receitas compartilhadas (`/d/:token`,
// `/r/:token`) são públicos com ou sem sessão.
const PUBLIC_PATHS = new Set(["/", "/login", "/termos", "/privacidade"]);

function isPublicPath(pathname: string) {
	if (PUBLIC_PATHS.has(pathname)) return true;
	// Calculadoras abertas (porta de entrada pela busca).
	if (pathname === "/calculadoras" || pathname.startsWith("/calculadoras/")) {
		return true;
	}
	// Dieta e receita compartilhadas por link (só leitura, sem dados pessoais).
	if (pathname.startsWith("/d/") || pathname.startsWith("/r/")) return true;
	// Página offline do PWA (pré-cacheada pelo service worker).
	if (pathname === "/~offline") return true;
	return process.env.NODE_ENV !== "production" && pathname === "/design-system";
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const hasSession = getSessionCookie(request) !== null;

	if (pathname === "/" && hasSession) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (isPublicPath(pathname) || hasSession) {
		return NextResponse.next();
	}

	return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
	matcher: [
		"/((?!api/auth|ingest|_vercel|_next/static|_next/image|serwist/|manifest.webmanifest|opengraph-image|twitter-image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
	],
};
