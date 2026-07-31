import { describe, expect, it } from "vitest";

import { scopeWarnings } from "./contract";
import { generateFourteenDayPlan } from "./plan";

describe("14 day sprint domain", () => {
  it("generates a complete progressive plan", () => {
    const plan = generateFourteenDayPlan();
    expect(plan).toHaveLength(14);
    expect(plan[0]).toMatchObject({ dayNumber: 1, level: "L1", status: "available" });
    expect(plan[6].theme).toBe("第一次交付");
    expect(plan[13]).toMatchObject({ dayNumber: 14, level: "L5", status: "locked" });
  });

  it("detects vague and oversized outcomes", () => {
    expect(scopeWarnings("完整掌握数据库", ["做得更专业"])).toHaveLength(3);
    expect(scopeWarnings("实现支持 SET 和 GET 的内存数据库", ["通过十个测试"])).toEqual([]);
  });
});
