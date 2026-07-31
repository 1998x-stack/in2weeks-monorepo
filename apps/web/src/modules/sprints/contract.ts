import { z } from "zod";

export const contractSchema = z.object({
  projectSlug: z.string().min(1),
  title: z.string().trim().min(6, "请把成果描述得更具体").max(120),
  audience: z.string().trim().min(2, "请填写一位真实使用者或评审者").max(80),
  dailyMinutes: z.coerce.number().int().min(30).max(240),
  criteria: z.array(z.string().trim().min(3).max(120)).min(1).max(3),
  excludedScope: z.array(z.string().trim().min(1).max(100)).max(8),
  scopeConfirmed: z.boolean(),
});

const vagueWords = ["学会", "掌握", "了解", "提高", "精通", "熟悉"];
const oversizedWords = ["完整", "全功能", "生产级", "企业级", "所有", "全部"];

export function scopeWarnings(title: string, criteria: string[]) {
  const warnings: string[] = [];
  const vague = vagueWords.find((word) => title.includes(word));
  const oversized = oversizedWords.find((word) => title.includes(word));
  if (vague) warnings.push(`“${vague}”无法直接验收，请改写成一个可以打开、运行或演示的作品。`);
  if (oversized) warnings.push(`“${oversized}”可能超过 14 天范围，建议删除非核心子系统。`);
  if (criteria.some((criterion) => /更好|专业|大量|基本/.test(criterion))) {
    warnings.push("验收标准中仍有不可观察的描述，请改成数量、正确率、用时或外部反馈。");
  }
  return warnings;
}

export type ContractActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
  warnings?: string[];
};

export const initialContractState: ContractActionState = { ok: false, message: "" };
