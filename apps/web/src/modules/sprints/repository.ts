import "server-only";

import { and, asc, desc, eq, ne } from "drizzle-orm";

import { db } from "@/db/client";
import { artifacts, sprintCriteria, sprintDays, sprints } from "@/db/schema";

export async function getActiveSprintForUser(userId: string) {
  const [sprint] = await db.select().from(sprints)
    .where(and(eq(sprints.userId, userId), eq(sprints.status, "active")))
    .limit(1);
  if (!sprint) return null;

  const [criteria, days, evidence] = await Promise.all([
    db.select().from(sprintCriteria).where(eq(sprintCriteria.sprintId, sprint.id)).orderBy(asc(sprintCriteria.position)),
    db.select().from(sprintDays).where(eq(sprintDays.sprintId, sprint.id)).orderBy(asc(sprintDays.dayNumber)),
    db.select().from(artifacts).where(eq(artifacts.sprintId, sprint.id)).orderBy(asc(artifacts.createdAt)),
  ]);
  return { ...sprint, criteria, days, artifacts: evidence };
}

export async function getSprintForUser(sprintId: string, userId: string) {
  const [sprint] = await db.select().from(sprints)
    .where(and(eq(sprints.id, sprintId), eq(sprints.userId, userId)))
    .limit(1);
  if (!sprint) return null;

  const [criteria, days, evidence] = await Promise.all([
    db.select().from(sprintCriteria).where(eq(sprintCriteria.sprintId, sprint.id)).orderBy(asc(sprintCriteria.position)),
    db.select().from(sprintDays).where(eq(sprintDays.sprintId, sprint.id)).orderBy(asc(sprintDays.dayNumber)),
    db.select().from(artifacts).where(eq(artifacts.sprintId, sprint.id)).orderBy(asc(artifacts.createdAt)),
  ]);
  return { ...sprint, criteria, days, artifacts: evidence };
}

export async function listInactiveSprintsForUser(userId: string, limit = 8) {
  return db.select({
    id: sprints.id,
    title: sprints.title,
    status: sprints.status,
    currentDay: sprints.currentDay,
    updatedAt: sprints.updatedAt,
  }).from(sprints)
    .where(and(eq(sprints.userId, userId), ne(sprints.status, "active")))
    .orderBy(desc(sprints.updatedAt))
    .limit(Math.min(limit, 20));
}

export type SprintWithPlan = NonNullable<Awaited<ReturnType<typeof getActiveSprintForUser>>>;
