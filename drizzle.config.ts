import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/shared/db/schema",
	out: "./drizzle",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: drizzle-kit roda via `bun run`, que carrega o .env
		url: process.env.DATABASE_URL!,
	},
});
