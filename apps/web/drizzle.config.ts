import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://in2weeks:in2weeks@localhost:5432/in2weeks",
  },
  strict: true,
  verbose: true,
});
