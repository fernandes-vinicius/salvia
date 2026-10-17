import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Checagem otimista: só verifica se o cookie de sessão existe (sem banco,
// porque o proxy roda em toda navegação e prefetch). A validação real fica
// no DAL (`getCurrentUser`). Usuário logado em `/login` é tratado no client
// (`RedirectIfAuthenticated`) pra não gerar loop com cookie expirado.
// `/` é a landing pública; com sessão, vai direto pro app.
function isPublicPath(pathname: string) {
	if (pathname === "/" || pathname === "/login") return true;
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
		"/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
	],
};
