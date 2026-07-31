"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { projects, sprintCriteria, sprintDays, sprints } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { consumeRateLimit } from "@/lib/rate-limit";

import { contractSchema, type ContractActionState, scopeWarnings } from "./contract";
import { checkinSchema, type CheckinActionState } from "./checkin";
import { completeAvailableSprintDay } from "./mutations";
import { generateFourteenDayPlan } from "./plan";

function localDate(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function createSprint(
  _previous: ContractActionState,
  formData: FormData,
): Promise<ContractActionState> {
  const user = await requireUser();
  const rate = await consumeRateLimit({
    action: "create-sprint",
    identifier: user.id,
    limit: 5,
    windowMs: 60 * 60 * 1_000,
  });
  if (!rate.allowed) {
    return { ok: false, message: `操作过于频繁，请在 ${rate.retryAfterSeconds} 秒后重试。` };
  }
  const criteria = formData.getAll("criteria").map(String).filter(Boolean);
  const excludedScope = String(formData.get("excludedScope") || "")
    .split(/[\n,，]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const parsed = contractSchema.safeParse({
    projectSlug: formData.get("projectSlug"),
    title: formData.get("title"),
    audience: formData.get("audience"),
    dailyMinutes: formData.get("dailyMinutes"),
    criteria,
    excludedScope,
    scopeConfirmed: formData.get("scopeConfirmed") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "成果合同还需要补充。",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const warnings = scopeWarnings(parsed.data.title, parsed.data.criteria);
  if (warnings.length && !parsed.data.scopeConfirmed) {
    return { ok: false, message: "这个范围可能无法验收，请修改或确认继续。", warnings };
  }

  const [project] = await db.select({ id: projects.id }).from(projects)
    .where(and(eq(projects.slug, parsed.data.projectSlug), eq(projects.status, "published")))
    .limit(1);
  if (!project) return { ok: false, message: "项目不存在或尚未发布。" };

  const [active] = await db.select({ id: sprints.id }).from(sprints)
    .where(and(eq(sprints.userId, user.id), eq(sprints.status, "active")))
    .limit(1);
  if (active) return { ok: false, message: "你已经有一个进行中的冲刺，请先完成或暂停它。" };

  let sprintId: string;
  try {
    sprintId = await db.transaction(async (transaction) => {
      const [sprint] = await transaction.insert(sprints).values({
        userId: user.id,
        projectId: project.id,
        title: parsed.data.title,
        audience: parsed.data.audience,
        dailyMinutes: parsed.data.dailyMinutes,
        startDate: localDate(user.timezone),
        excludedScope: parsed.data.excludedScope,
      }).returning({ id: sprints.id });

      await transaction.insert(sprintCriteria).values(parsed.data.criteria.map((text, index) => ({
        sprintId: sprint.id,
        position: index + 1,
        text,
        verification: "other" as const,
      })));
      await transaction.insert(sprintDays).values(generateFourteenDayPlan().map((day) => ({
        sprintId: sprint.id,
        ...day,
      })));
      return sprint.id;
    });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, message: "你已经有一个进行中的冲刺，请刷新页面后继续。" };
    }
    throw error;
  }

  revalidatePath("/today");
  redirect(`/sprints/${sprintId}`);
}

const allowedStatusTransitions = {
  active: ["paused", "abandoned"],
  paused: ["active", "abandoned"],
} as const;

export async function changeSprintStatus(
  sprintId: string,
  targetStatus: "active" | "paused" | "abandoned",
) {
  const user = await requireUser();
  const rate = await consumeRateLimit({
    action: "change-sprint-status",
    identifier: user.id,
    limit: 20,
    windowMs: 60 * 60 * 1_000,
  });
  if (!rate.allowed) redirect(`/sprints/${sprintId}?error=rate-limit`);

  const [sprint] = await db.select({ status: sprints.status }).from(sprints)
    .where(and(eq(sprints.id, sprintId), eq(sprints.userId, user.id)))
    .limit(1);
  if (!sprint) redirect("/today");

  const allowed = sprint.status === "active" || sprint.status === "paused"
    ? allowedStatusTransitions[sprint.status].includes(targetStatus as never)
    : false;
  if (!allowed) redirect(`/sprints/${sprintId}?error=invalid-transition`);

  try {
    await db.update(sprints).set({
      status: targetStatus,
      updatedAt: new Date(),
    }).where(and(eq(sprints.id, sprintId), eq(sprints.userId, user.id)));
  } catch (error) {
    const databaseError = error as { code?: string; cause?: { code?: string } };
    if (databaseError.code === "23505" || databaseError.cause?.code === "23505") {
      redirect(`/sprints/${sprintId}?error=active-sprint`);
    }
    throw error;
  }

  revalidatePath("/today");
  revalidatePath(`/sprints/${sprintId}`);
  redirect(targetStatus === "abandoned" ? "/today" : `/sprints/${sprintId}`);
}

export async function completeSprintDay(
  dayId: string,
  _previous: CheckinActionState,
  formData: FormData,
): Promise<CheckinActionState> {
  const user = await requireUser();
  const rate = await consumeRateLimit({
    action: "complete-sprint-day",
    identifier: user.id,
    limit: 30,
    windowMs: 60 * 60 * 1_000,
  });
  if (!rate.allowed) {
    return { ok: false, message: `提交过于频繁，请在 ${rate.retryAfterSeconds} 秒后重试。` };
  }
  const parsed = checkinSchema.safeParse({
    minutes: formData.get("minutes"),
    artifactSummary: String(formData.get("artifactSummary") || "").trim(),
    artifactUrl: String(formData.get("artifactUrl") || "").trim(),
    obstacle: String(formData.get("obstacle") || "").trim(),
    recall: String(formData.get("recall") || "").trim(),
    nextAction: String(formData.get("nextAction") || "").trim(),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "收工记录还不完整。",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const values = parsed.data;

  const completed = await completeAvailableSprintDay({
    dayId,
    userId: user.id,
    values,
  });
  if (!completed) return { ok: false, message: "这一天已经完成，请刷新页面查看最新进度。" };

  revalidatePath("/today");
  revalidatePath(`/sprints/${completed.sprintId}`);
  return { ok: true, message: `第 ${completed.dayNumber} 天已留下行动证据。` };
}
