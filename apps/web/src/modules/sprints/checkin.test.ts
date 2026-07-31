import { describe, expect, it } from "vitest";

import { checkinSchema } from "./checkin";

const validCheckin = {
  minutes: "90",
  artifactSummary: "完成一个可以运行的解析器",
  artifactUrl: "https://example.com/demo",
  obstacle: "",
  recall: "我能解释解析过程并独立复现",
  nextAction: "补充边界测试",
};

describe("checkinSchema", () => {
  it("接受受限的有效收工记录", () => {
    const result = checkinSchema.parse(validCheckin);
    expect(result.minutes).toBe(90);
    expect(result.artifactUrl).toBe(validCheckin.artifactUrl);
  });

  it.each(["javascript:alert(1)", "ftp://example.com/file", "not-a-url"])(
    "拒绝非 HTTP(S) 作品地址：%s",
    (artifactUrl) => {
      expect(checkinSchema.safeParse({ ...validCheckin, artifactUrl }).success).toBe(false);
    },
  );

  it("拒绝超长文本，避免无界写入", () => {
    const result = checkinSchema.safeParse({
      ...validCheckin,
      artifactSummary: "a".repeat(501),
      recall: "b".repeat(1_001),
    });
    expect(result.success).toBe(false);
  });
});
