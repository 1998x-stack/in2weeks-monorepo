import assert from "node:assert/strict";

import { and, count, eq } from "drizzle-orm";

import { closeDbConnection, db } from "../src/db/connection";
import {
  artifacts,
  projects,
  rateLimits,
  sprintCriteria,
  sprintDays,
  sprints,
  users,
} from "../src/db/schema";
import { generateFourteenDayPlan } from "../src/modules/sprints/plan";
import { completeAvailableSprintDay } from "../src/modules/sprints/mutations";
import { consumeRateLimit } from "../src/lib/rate-limit";

async function main() {
  const testEmail = `phase2-smoke-${Date.now()}@in2weeks.local`;
  const [user] = await db.insert(users).values({ email: testEmail, name: "Phase 2 Smoke" }).returning({ id: users.id });

  try {
    const [project] = await db.select({ id: projects.id }).from(projects).limit(1);
    assert.ok(project, "项目库必须至少有一个项目");

    const sprintId = await db.transaction(async (transaction) => {
      const [sprint] = await transaction.insert(sprints).values({
        userId: user.id,
        projectId: project.id,
        title: "一个通过十个测试的迷你系统",
        audience: "一位真实评审者",
        dailyMinutes: 90,
        startDate: new Date().toISOString().slice(0, 10),
        excludedScope: ["集群", "性能极限优化"],
      }).returning({ id: sprints.id });

      await transaction.insert(sprintCriteria).values([
        { sprintId: sprint.id, position: 1, text: "通过十个测试", verification: "test" },
        { sprintId: sprint.id, position: 2, text: "可以独立运行", verification: "demo" },
      ]);
      await transaction.insert(sprintDays).values(generateFourteenDayPlan().map((day) => ({ sprintId: sprint.id, ...day })));
      return sprint.id;
    });

    const [dayCount] = await db.select({ value: count() }).from(sprintDays).where(eq(sprintDays.sprintId, sprintId));
    assert.equal(dayCount.value, 14);

    const [dayOne] = await db.select().from(sprintDays)
      .where(and(eq(sprintDays.sprintId, sprintId), eq(sprintDays.dayNumber, 1)))
      .limit(1);
    assert.equal(dayOne.status, "available");

    const checkin = {
      minutes: 75,
      artifactSummary: "成果合同和基线记录",
      artifactUrl: "",
      obstacle: "",
      recall: "具体成果会限制学习边界",
      nextAction: "开始拆解参考作品",
    };
    const concurrentResults = await Promise.all([
      completeAvailableSprintDay({ dayId: dayOne.id, userId: user.id, values: checkin }),
      completeAvailableSprintDay({ dayId: dayOne.id, userId: user.id, values: checkin }),
    ]);
    assert.equal(concurrentResults.filter(Boolean).length, 1, "并发提交只能有一次成功");

    const [updated] = await db.select({ currentDay: sprints.currentDay }).from(sprints).where(eq(sprints.id, sprintId));
    assert.equal(updated.currentDay, 2);
    const [evidenceCount] = await db.select({ value: count() }).from(artifacts)
      .where(eq(artifacts.sprintDayId, dayOne.id));
    assert.equal(evidenceCount.value, 1, "并发提交只能生成一条证据");

    const [dayTwo] = await db.select().from(sprintDays)
      .where(and(eq(sprintDays.sprintId, sprintId), eq(sprintDays.dayNumber, 2)))
      .limit(1);
    assert.equal(dayTwo.status, "available");

    await assert.rejects(
      db.insert(sprints).values({
        userId: user.id,
        projectId: project.id,
        title: "非法分钟数不应写入",
        audience: "数据库约束测试",
        dailyMinutes: 10,
        startDate: new Date().toISOString().slice(0, 10),
        status: "draft",
      }),
      (error: unknown) => {
        const databaseError = error as { code?: string; cause?: { code?: string } };
        return databaseError.code === "23514" || databaseError.cause?.code === "23514";
      },
      "数据库应拒绝越界的每日分钟数",
    );

    const rateAction = `smoke-rate-${Date.now()}`;
    const rateResults = await Promise.all(Array.from({ length: 5 }, () => consumeRateLimit({
      action: rateAction,
      identifier: user.id,
      limit: 2,
      windowMs: 60_000,
    })));
    assert.equal(rateResults.filter((result) => result.allowed).length, 2, "共享限流必须原子计数");
    await db.delete(rateLimits).where(eq(rateLimits.action, rateAction));
    console.log("Phase 2 smoke passed: contract → 14 days → atomic day 1 evidence → day 2 unlocked");
  } finally {
    await db.delete(users).where(eq(users.id, user.id));
    await closeDbConnection();
  }
}

main().catch(async (error) => {
  console.error(error);
  await closeDbConnection();
  process.exitCode = 1;
});
