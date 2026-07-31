import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { artifacts, sprintDays, sprints } from "@/db/schema";

import type { CheckinValues } from "./checkin";

export async function completeAvailableSprintDay({
  dayId,
  userId,
  values,
}: {
  dayId: string;
  userId: string;
  values: CheckinValues;
}) {
  return db.transaction(async (transaction) => {
    const [ownedDay] = await transaction.select({
      id: sprintDays.id,
      sprintId: sprintDays.sprintId,
      dayNumber: sprintDays.dayNumber,
    }).from(sprintDays)
      .innerJoin(sprints, eq(sprints.id, sprintDays.sprintId))
      .where(and(
        eq(sprintDays.id, dayId),
        eq(sprintDays.status, "available"),
        eq(sprints.userId, userId),
        eq(sprints.status, "active"),
      ))
      .limit(1);
    if (!ownedDay) return null;

    // Claim the available day atomically so retries cannot create two artifacts.
    const [claimedDay] = await transaction.update(sprintDays).set({
      minutes: values.minutes,
      artifactSummary: values.artifactSummary,
      obstacle: values.obstacle,
      recall: values.recall,
      nextAction: values.nextAction,
      status: "completed",
      completedAt: new Date(),
    }).where(and(
      eq(sprintDays.id, ownedDay.id),
      eq(sprintDays.status, "available"),
    )).returning({ id: sprintDays.id });
    if (!claimedDay) return null;

    await transaction.insert(artifacts).values({
      sprintId: ownedDay.sprintId,
      sprintDayId: ownedDay.id,
      kind: values.artifactUrl ? "link" : "text",
      title: `第 ${ownedDay.dayNumber} 天完成物`,
      url: values.artifactUrl || null,
      metadata: { summary: values.artifactSummary },
    });

    const remaining = await transaction.select({
      id: sprintDays.id,
      dayNumber: sprintDays.dayNumber,
    }).from(sprintDays)
      .where(and(eq(sprintDays.sprintId, ownedDay.sprintId), eq(sprintDays.status, "locked")))
      .orderBy(asc(sprintDays.dayNumber));
    const next = remaining.find((day) => day.dayNumber > ownedDay.dayNumber);

    if (next) {
      await transaction.update(sprintDays).set({ status: "available" }).where(eq(sprintDays.id, next.id));
      await transaction.update(sprints).set({
        currentDay: next.dayNumber,
        updatedAt: new Date(),
      }).where(eq(sprints.id, ownedDay.sprintId));
    } else {
      await transaction.update(sprints).set({
        status: "completed",
        currentDay: 14,
        updatedAt: new Date(),
      }).where(eq(sprints.id, ownedDay.sprintId));
    }

    return { sprintId: ownedDay.sprintId, dayNumber: ownedDay.dayNumber };
  });
}
