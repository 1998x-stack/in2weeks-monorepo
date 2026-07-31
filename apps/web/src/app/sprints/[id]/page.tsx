import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SprintDashboard } from "@/components/sprint-dashboard";
import { requireUser } from "@/lib/session";
import { getSprintForUser } from "@/modules/sprints/repository";

export const metadata: Metadata = { title: "冲刺工作台" };

export default async function SprintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { error } = await searchParams;
  const sprint = await getSprintForUser(id, user.id);
  if (!sprint) notFound();
  const message = {
    "rate-limit": "操作过于频繁，请稍后再试。",
    "invalid-transition": "当前冲刺状态不允许这个操作。",
    "active-sprint": "已有另一个进行中的冲刺，请先暂停或完成它。",
  }[error ?? ""];
  return <SprintDashboard message={message} sprint={sprint} />;
}
