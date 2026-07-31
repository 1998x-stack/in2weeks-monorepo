import { z } from "zod";

export const checkinSchema = z.object({
  minutes: z.coerce.number().int("请输入整数分钟").min(0).max(600),
  artifactSummary: z.string().trim().min(3, "请留下一个具体完成物").max(500, "完成物说明不能超过 500 字"),
  artifactUrl: z.union([
    z.literal(""),
    z.url("请输入有效链接")
      .refine((value) => /^https?:\/\//i.test(value), "只接受 HTTP 或 HTTPS 链接"),
  ]),
  obstacle: z.string().trim().max(500, "障碍说明不能超过 500 字"),
  recall: z.string().trim().min(3, "请用自己的话写下今天学会的技术").max(1_000, "回忆不能超过 1000 字"),
  nextAction: z.string().trim().max(300, "下一步不能超过 300 字"),
});

export type CheckinValues = z.infer<typeof checkinSchema>;

export type CheckinActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export const initialCheckinState: CheckinActionState = { ok: false, message: "" };
