import { sql } from "drizzle-orm";

import { db } from "@/db/connection";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json(
      { status: "ok", database: "up", timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(JSON.stringify({
      event: "health_check_failed",
      message: error instanceof Error ? error.message : "unknown error",
      timestamp: new Date().toISOString(),
    }));
    return Response.json(
      { status: "unavailable", database: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
