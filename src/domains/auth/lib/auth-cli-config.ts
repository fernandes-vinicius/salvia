import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzle } from "drizzle-orm/node-postgres";

// Config usada só pelo CLI do Better Auth (`bun run auth:generate`) pra gerar
// o schema do Drizzle. O CLI não resolve imports `server-only` (nem
// transitivos), então aqui não dá pra reaproveitar `auth.ts`: o banco é um
// mock e as credenciais são vazias. Mantenha `plugins` e campos extras de
// user/session em sincronia com `auth.ts`.
export const auth = betterAuth({
	database: drizzleAdapter(drizzle.mock(), { provider: "pg" }),
	socialProviders: { google: { clientId: "", clientSecret: "" } },
	plugins: [nextCookies()],
});
