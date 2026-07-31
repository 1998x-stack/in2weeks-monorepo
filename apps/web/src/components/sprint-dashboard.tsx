import Link from "next/link";

import type { SprintWithPlan } from "@/modules/sprints/repository";
import { changeSprintStatus } from "@/modules/sprints/actions";

import { DailyCheckinForm } from "./daily-checkin-form";

export function SprintDashboard({
  sprint,
  message,
}: {
  sprint: SprintWithPlan;
  message?: string;
}) {
  const current = sprint.days.find((day) => day.dayNumber === sprint.currentDay) ?? sprint.days[13];
  const completed = sprint.days.filter((day) => day.status === "completed").length;
  const minutes = sprint.days.reduce((total, day) => total + day.minutes, 0);
  const isActive = sprint.status === "active";
  const statusLabel = {
    active: "Active sprint",
    paused: "Paused sprint",
    completed: "Completed sprint",
    abandoned: "Abandoned sprint",
    draft: "Draft sprint",
  }[sprint.status];

  return (
    <main className="page">
      <div className="dashboard-head">
        <div>
          <div className="eyebrow"><span />{statusLabel}</div>
          <h1>{sprint.title}</h1>
          <p className="muted">交付给 {sprint.audience} · 每日 {sprint.dailyMinutes} 分钟</p>
        </div>
        <span className="day-pill">DAY {String(sprint.currentDay).padStart(2, "0")} / 14</span>
      </div>
      {message ? <p className="dashboard-alert" role="alert">{message}</p> : null}
      {sprint.status === "active" || sprint.status === "paused" ? (
        <div className="sprint-actions">
          {sprint.status === "active" ? (
            <form action={changeSprintStatus.bind(null, sprint.id, "paused")}>
              <button className="text-button" type="submit">暂停冲刺</button>
            </form>
          ) : (
            <form action={changeSprintStatus.bind(null, sprint.id, "active")}>
              <button className="text-button" type="submit">恢复冲刺</button>
            </form>
          )}
          <form action={changeSprintStatus.bind(null, sprint.id, "abandoned")}>
            <button className="text-button danger" type="submit">放弃冲刺</button>
          </form>
        </div>
      ) : null}

      <div className="dashboard-grid">
        <section className="panel today-panel">
          <div className="panel-label"><span>今天唯一的推进</span><span className="level">{current.level}</span></div>
          <h2>{current.theme}</h2>
          <p className="task-text">{current.task}</p>
          <div className="evidence-box"><small>今天必须留下的证据</small><p>{current.evidenceRequirement}</p></div>
          <div className="focus-steps">
            <div><span>00—15</span><b>闭卷尝试</b></div>
            <div><span>15—40</span><b>定向补缺</b></div>
            <div><span>40—90</span><b>立即应用</b></div>
          </div>
          {isActive ? <Link className="button button-ghost" href="#checkin">完成制作后收工 ↓</Link> : null}
        </section>

        <aside>
          <section className="panel contract-panel">
            <div className="panel-label"><span>成果合同</span><span>已签署</span></div>
            <h3>第 14 天的承诺</h3>
            <blockquote>我将完成「{sprint.title}」，交给 {sprint.audience} 使用。</blockquote>
            <ul className="criteria">{sprint.criteria.map((item) => <li key={item.id}>{item.text}</li>)}</ul>
            {sprint.excludedScope.length ? (
              <details><summary>本次不做</summary><ul>{sprint.excludedScope.map((item) => <li key={item}>{item}</li>)}</ul></details>
            ) : null}
          </section>
          <section className="panel stats-panel">
            <div className="panel-label"><span>行动证据</span><span>{Math.round(completed / 14 * 100)}%</span></div>
            <div className="stats-row">
              <div className="stat"><strong>{completed}</strong><span>完成天数</span></div>
              <div className="stat"><strong>{minutes}</strong><span>制作分钟</span></div>
              <div className="stat"><strong>{14 - completed}</strong><span>剩余证据</span></div>
            </div>
          </section>
        </aside>

        <section className="panel timeline">
          <div className="timeline-head"><h2>14 天路线</h2><span className="muted">L1 模仿 → L5 独立交付</span></div>
          <div className="timeline-days">
            {sprint.days.map((day) => (
              <div className={`day-tile ${day.status} ${day.dayNumber === sprint.currentDay ? "current" : ""}`} key={day.id}>
                <span>{String(day.dayNumber).padStart(2, "0")}</span><b>{day.theme}</b>
              </div>
            ))}
          </div>
        </section>

        {sprint.artifacts.length ? (
          <section className="panel artifact-history">
            <div className="timeline-head"><h2>行动证据历史</h2><span className="muted">{sprint.artifacts.length} 条</span></div>
            <ol>
              {sprint.artifacts.map((artifact) => (
                <li key={artifact.id}>
                  <div><b>{artifact.title}</b><small>{artifact.createdAt.toLocaleString("zh-CN")}</small></div>
                  {artifact.url ? <a href={artifact.url} rel="noreferrer" target="_blank">打开证据 ↗</a> : <span>文本证据</span>}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {isActive ? (
          <section className="panel checkin-panel" id="checkin">
            <DailyCheckinForm day={current} />
          </section>
        ) : sprint.status === "completed" ? (
          <section className="panel checkin-panel">
            <div className="panel-label"><span>冲刺完成</span><span>14 / 14</span></div>
            <h2>作品已经留下，下一步是复盘与传播。</h2>
            <p className="muted">回看每天的行动证据，整理最终作品链接，并把成果交给合同中的评审者。</p>
          </section>
        ) : (
          <section className="panel checkin-panel">
            <div className="panel-label"><span>{sprint.status === "paused" ? "冲刺已暂停" : "冲刺已结束"}</span><span>{completed} / 14</span></div>
            <h2>{sprint.status === "paused" ? "进度和证据都已保留。" : "这次冲刺不会再接受新的打卡。"}</h2>
            <p className="muted">{sprint.status === "paused" ? "准备好后点击上方“恢复冲刺”，从当前天继续。" : "你仍然可以回看路线和已经留下的行动证据。"}</p>
          </section>
        )}
      </div>
    </main>
  );
}
