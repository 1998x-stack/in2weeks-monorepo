"use client";

import { useActionState } from "react";

import { createSprint } from "@/modules/sprints/actions";
import { initialContractState } from "@/modules/sprints/contract";

export function ContractForm({
  project,
}: {
  project: { slug: string; title: string; language: string };
}) {
  const [state, formAction, pending] = useActionState(createSprint, initialContractState);

  return (
    <form action={formAction} className="contract-form">
      <input name="projectSlug" type="hidden" value={project.slug} />
      <div className="contract-project">
        <span>项目起点</span>
        <strong>{project.title}</strong>
        <small>{project.language}</small>
      </div>

      <label htmlFor="title">第 14 天，我将完成</label>
      <input
        aria-describedby="title-error"
        defaultValue={`一个可运行的「${project.title}」最小版本`}
        id="title"
        maxLength={120}
        name="title"
        required
      />
      <FieldError id="title-error" errors={state.errors?.title} />

      <div className="contract-row">
        <div>
          <label htmlFor="audience">交给谁使用或评审</label>
          <input id="audience" maxLength={80} name="audience" placeholder="一位开发者朋友" required />
          <FieldError errors={state.errors?.audience} />
        </div>
        <div>
          <label htmlFor="dailyMinutes">每日投入</label>
          <select defaultValue="90" id="dailyMinutes" name="dailyMinutes">
            <option value="60">60 分钟</option>
            <option value="90">90 分钟</option>
            <option value="120">120 分钟</option>
          </select>
        </div>
      </div>

      <fieldset>
        <legend>怎样才算完成？最多三条</legend>
        <input name="criteria" placeholder="例如：通过 10 个测试" required />
        <input name="criteria" placeholder="例如：可以从命令行独立运行" />
        <input name="criteria" placeholder="例如：获得两位使用者反馈" />
      </fieldset>
      <FieldError errors={state.errors?.criteria} />

      <label htmlFor="excludedScope">这次明确不做什么</label>
      <textarea
        id="excludedScope"
        name="excludedScope"
        placeholder={"每行一项，例如：\n集群部署\n完整协议兼容\n性能极限优化"}
        rows={4}
      />

      {state.warnings?.length ? (
        <div className="scope-warning">
          <strong>先检查一下范围</strong>
          <ul>{state.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          <label className="confirm-scope">
            <input name="scopeConfirmed" type="checkbox" />
            我已缩小范围，仍然按这个成果开始
          </label>
        </div>
      ) : null}

      <p aria-live="polite" className="form-message">{state.message}</p>
      <button className="button button-wide" disabled={pending} type="submit">
        {pending ? "正在生成 14 天计划…" : "签下合同，生成 14 天计划"} <span>→</span>
      </button>
    </form>
  );
}

function FieldError({ id, errors }: { id?: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error" id={id}>{errors.join("；")}</p>;
}
