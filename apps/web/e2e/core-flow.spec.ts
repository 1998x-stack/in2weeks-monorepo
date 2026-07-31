import { createHash, randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";
import { and, eq, lt } from "drizzle-orm";

import { db, closeDbConnection } from "../src/db/connection";
import { projects, rateLimits, sessions, sprintDays, sprints, users } from "../src/db/schema";

const userId = randomUUID();
const sessionToken = randomUUID();
let sprintId = "";
let projectSlug = "";

test.beforeAll(async () => {
  const [project] = await db.select({ slug: projects.slug }).from(projects).limit(1);
  expect(project, "E2E 需要已导入的项目库").toBeTruthy();
  projectSlug = project.slug;

  await db.insert(users).values({
    id: userId,
    email: `e2e-${userId}@in2weeks.local`,
    name: "E2E Maker",
  });
  await db.insert(sessions).values({
    sessionToken,
    userId,
    expires: new Date(Date.now() + 60 * 60 * 1_000),
  });
});

test.afterAll(async () => {
  await db.delete(users).where(eq(users.id, userId));
  for (const action of ["create-sprint", "complete-sprint-day", "change-sprint-status"]) {
    const identifierHash = createHash("sha256").update(`${action}:${userId}`).digest("hex");
    await db.delete(rateLimits).where(eq(rateLimits.identifierHash, identifierHash));
  }
  await closeDbConnection();
});

test("公共页、登录保护和健康检查可用", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /别再准备/ })).toBeVisible();

  await page.goto("/today");
  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=\/today$/);

  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ status: "ok", database: "up" });
  expect(health.headers()["cache-control"]).toBe("no-store");
  const home = await request.get("/");
  expect(home.headers()["content-security-policy"]).toContain("object-src 'none'");
});

test("登录会话可以创建合同、打卡、查看证据、暂停并恢复", async ({ context, page }) => {
  await context.addCookies([{
    name: "next-auth.session-token",
    value: sessionToken,
    domain: "127.0.0.1",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    expires: Math.floor(Date.now() / 1_000) + 3_600,
  }]);

  await page.goto(`/sprints/new?project=${projectSlug}`);
  await page.getByLabel("第 14 天，我将完成").fill("一个经过浏览器验证的迷你系统");
  await page.getByLabel("交给谁使用或评审").fill("一位真实评审者");
  await page.locator('input[name="criteria"]').first().fill("浏览器可以完成每日打卡");
  await page.getByRole("button", { name: /签下合同/ }).click();

  await expect(page).toHaveURL(/\/sprints\/[0-9a-f-]+$/);
  sprintId = page.url().split("/").at(-1)!;
  await expect(page.getByRole("heading", { name: "一个经过浏览器验证的迷你系统" })).toBeVisible();
  await page.getByLabel("实际制作时间").fill("75");
  await page.getByLabel("今天完成了什么").fill("浏览器端到端测试证据");
  await page.getByLabel("闭卷回忆：真正学会了什么").fill("我可以独立完成核心打卡流程");
  await page.getByRole("button", { name: /完成第 1 天/ }).click();

  await expect(page.getByText("第 1 天已留下行动证据。")).toBeVisible();
  await expect(page.getByText("DAY 02 / 14")).toBeVisible();
  await expect(page.getByText("第 1 天完成物")).toBeVisible();

  await page.getByRole("button", { name: "暂停冲刺" }).click();
  await expect(page).toHaveURL(new RegExp(`/sprints/${sprintId}$`));
  await expect(page.getByText("Paused sprint")).toBeVisible();
  await page.getByRole("button", { name: "恢复冲刺" }).click();
  await expect(page.getByText("Active sprint")).toBeVisible();
});

test("第 14 天完成后进入只读完成态", async ({ context, page }) => {
  await db.update(sprintDays).set({ status: "completed" }).where(and(
    eq(sprintDays.sprintId, sprintId),
    lt(sprintDays.dayNumber, 14),
  ));
  await db.update(sprintDays).set({ status: "available" }).where(and(
    eq(sprintDays.sprintId, sprintId),
    eq(sprintDays.dayNumber, 14),
  ));
  await db.update(sprints).set({ currentDay: 14 }).where(eq(sprints.id, sprintId));

  await context.addCookies([{
    name: "next-auth.session-token",
    value: sessionToken,
    domain: "127.0.0.1",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    expires: Math.floor(Date.now() / 1_000) + 3_600,
  }]);
  await page.goto(`/sprints/${sprintId}`);
  await page.getByLabel("今天完成了什么").fill("最终作品和复盘");
  await page.getByLabel("闭卷回忆：真正学会了什么").fill("我可以不依赖教程独立交付");
  await page.getByRole("button", { name: /完成第 14 天/ }).click();

  await expect(page.getByText("Completed sprint")).toBeVisible();
  await expect(page.getByRole("heading", { name: "作品已经留下，下一步是复盘与传播。" })).toBeVisible();
  await expect(page.getByRole("button", { name: /完成第 14 天/ })).toHaveCount(0);
});

test("移动端首页没有水平溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
