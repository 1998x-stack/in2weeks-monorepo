import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://in2weeks:in2weeks@localhost:5432/in2weeks";

const globalForDb = globalThis as unknown as {
  in2weeksSql?: ReturnType<typeof postgres>;
};

const sql = globalForDb.in2weeksSql ?? postgres(connectionString, {
  max: process.env.NODE_ENV === "production" ? 10 : 1,
  prepare: false,
});

if (process.env.NODE_ENV !== "production") globalForDb.in2weeksSql = sql;

export const db = drizzle(sql, { schema });

export async function closeDbConnection() {
  await sql.end();
  globalForDb.in2weeksSql = undefined;
}
