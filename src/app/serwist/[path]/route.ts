import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// Serve o service worker compilado de `src/app/sw.ts` em /serwist/sw.js (com
// `Service-Worker-Allowed: /`, então o escopo é o site todo). A revisão
// versiona a página offline pré-cacheada: na Vercel vem do commit do deploy.
const revision =
	process.env.VERCEL_GIT_COMMIT_SHA ||
	spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout ||
	crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
	createSerwistRoute({
		additionalPrecacheEntries: [{ url: "/~offline", revision }],
		swSrc: "src/app/sw.ts",
		useNativeEsbuild: true,
	});
