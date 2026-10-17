import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "~/shared/db/schema";
import { getEnv } from "~/shared/lib/env";

// Reaproveita o pool entre hot reloads do dev server; sem isso cada reload
// abre um pool novo e esgota as conexões do Postgres local.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
	globalForDb.pool ?? new Pool({ connectionString: getEnv().DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle({ client: pool, schema });
