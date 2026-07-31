"use client";

import { useActionState } from "react";

import { completeSprintDay } from "@/modules/sprints/actions";
import { initialCheckinState } from "@/modules/sprints/checkin";

export function DailyCheckinForm({
  day,
}: {
  day: { id: string; dayNumber: number; minutes: number };
}) {
  const action = completeSprintDay.bind(null, day.id);
  const [state, formAction, pending] = useActionState(action, initialCheckinState);

  return (
    <form action={formAction} className="checkin-form">
      <div className="panel-label"><span>每日收工</span><span>2 MIN</span></div>
      <div className="checkin-row">
        <label htmlFor="minutes">实际制作时间</label>
        <div className="minute-input">
          <input defaultValue={day.minutes || 60} id="minutes" max={600} min={0} name="minutes" type="number" />
          <span>分钟</span>
        </div>
      </div>
      <FieldError errors={state.errors?.minutes} />
      <label htmlFor="artifactSummary">今天完成了什么</label>
      <textarea id="artifactSummary" maxLength={500} name="artifactSummary" placeholder="一个具体文件、链接、测试结果或可演示变化" required rows={3} />
      <FieldError errors={state.errors?.artifactSummary} />
      <label htmlFor="artifactUrl">作品链接（可选）</label>
      <input id="artifactUrl" name="artifactUrl" placeholder="https://github.com/… 或在线演示地址" type="url" />
      <FieldError errors={state.errors?.artifactUrl} />
      <label htmlFor="obstacle">最大的障碍</label>
      <textarea id="obstacle" maxLength={500} name="obstacle" placeholder="只写最影响交付的一个问题" rows={2} />
      <FieldError errors={state.errors?.obstacle} />
      <label htmlFor="recall">闭卷回忆：真正学会了什么</label>
      <textarea id="recall" maxLength={1000} name="recall" placeholder="它解决什么问题？下次如何独立复现？" required rows={3} />
      <FieldError errors={state.errors?.recall} />
      <label htmlFor="nextAction">明天打开项目后的第一个动作</label>
      <input id="nextAction" maxLength={300} name="nextAction" placeholder="例如：先补上失败的边界测试" />
      <FieldError errors={state.errors?.nextAction} />
      <p aria-live="polite" className={`form-message ${state.ok ? "success" : ""}`}>{state.message}</p>
      <button className="button button-wide" disabled={pending || state.ok} type="submit">
        {pending ? "正在保存…" : state.ok ? "今天已完成 ✓" : `完成第 ${day.dayNumber} 天`} <span>→</span>
      </button>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="field-error">{errors.join("；")}</p> : null;
}
