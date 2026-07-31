import { createHash } from "node:crypto";

import { lt, sql } from "drizzle-orm";

import { db } from "@/db/connection";
import { rateLimits } from "@/db/schema";

type RateLimitRule = {
  action: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  in2weeksRateLimitCleanupAt?: number;
};

async function cleanupExpiredWindows() {
  const now = Date.now();
  if (now - (globalForRateLimit.in2weeksRateLimitCleanupAt ?? 0) < 60 * 60 * 1_000) return;
  globalForRateLimit.in2weeksRateLimitCleanupAt = now;
  await db.delete(rateLimits).where(lt(
    rateLimits.windowStart,
    new Date(now - 48 * 60 * 60 * 1_000),
  ));
}

export async function consumeRateLimit({
  action,
  identifier,
  limit,
  windowMs,
}: RateLimitRule) {
  await cleanupExpiredWindows();
  const identifierHash = createHash("sha256")
    .update(`${action}:${identifier.trim().toLowerCase()}`)
    .digest("hex");
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const [counter] = await db.insert(rateLimits).values({
    action,
    identifierHash,
    windowStart,
  }).onConflictDoUpdate({
    target: [rateLimits.action, rateLimits.identifierHash, rateLimits.windowStart],
    set: { attempts: sql`${rateLimits.attempts} + 1` },
  }).returning({ attempts: rateLimits.attempts });

  return {
    allowed: counter.attempts <= limit,
    remaining: Math.max(0, limit - counter.attempts),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((windowStart.getTime() + windowMs - Date.now()) / 1_000),
    ),
  };
}
