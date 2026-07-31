import type { Metadata } from "next";
import Link from "next/link";

import { SprintDashboard } from "@/components/sprint-dashboard";
import { requireUser } from "@/lib/session";
import { getActiveSprintForUser, listInactiveSprintsForUser } from "@/modules/sprints/repository";

export const metadata: Metadata = { title: "今日" };

export default async function TodayPage() {
  const user = await requireUser();
  const sprint = await getActiveSprintForUser(user.id);
  if (sprint) return <SprintDashboard sprint={sprint} />;
  const previousSprints = await listInactiveSprintsForUser(user.id);

  return (
    <main className="page">
      <div className="dashboard-head">
        <div><div className="eyebrow"><span />Welcome, {user.name || "maker"}</div><h1>今天只推进<br />一个可见结果。</h1></div>
        <span className="day-pill">NO ACTIVE SPRINT</span>
      </div>
      <section className="empty-sprint">
        <span className="empty-number">00</span>
        <div><h2>还没有进行中的冲刺</h2><p>先选一个项目，再把目标缩到每天 90 分钟可以推进的范围。</p><Link className="button" href="/explore">浏览项目库 <span>→</span></Link></div>
      </section>
      {previousSprints.length ? (
        <section className="previous-sprints">
          <div className="timeline-head"><h2>历史冲刺</h2><span className="muted">{previousSprints.length} 次</span></div>
          {previousSprints.map((item) => (
            <Link href={`/sprints/${item.id}`} key={item.id}>
              <div><b>{item.title}</b><small>更新于 {item.updatedAt.toLocaleDateString("zh-CN")}</small></div>
              <span>{item.status} · DAY {item.currentDay}</span>
            </Link>
          ))}
        </section>
      ) : null}
    </main>
  );
}
