export type GeneratedDay = {
  dayNumber: number;
  theme: string;
  task: string;
  evidenceRequirement: string;
  level: "L1" | "L2" | "L3" | "L4" | "L5";
  status: "available" | "locked";
};

const templates: Array<Omit<GeneratedDay, "dayNumber" | "status">> = [
  { theme: "定义终点", task: "签下成果合同，并做一次不准备的基线尝试", evidenceRequirement: "成果合同与基线记录", level: "L1" },
  { theme: "拆解地图", task: "拆解三个参考样本，标记必须掌握的 A 类技术", evidenceRequirement: "技术地图与参考样本", level: "L1" },
  { theme: "做出废稿", task: "不看完整课程，直接完成第一个粗糙版本", evidenceRequirement: "一个可以运行或展示的 V0", level: "L1" },
  { theme: "修复瓶颈", task: "只学习当前最大障碍对应的一项技术", evidenceRequirement: "一个失败案例变为通过", level: "L2" },
  { theme: "叠加技术", task: "整合第二项核心技术，减少一个明显错误", evidenceRequirement: "作品 V0.2 与变化说明", level: "L2" },
  { theme: "跑通闭环", task: "让输入、核心流程和输出第一次完整连通", evidenceRequirement: "端到端运行证据", level: "L2" },
  { theme: "第一次交付", task: "把 V1 交给一个真实的人并收集具体反馈", evidenceRequirement: "V1 链接与至少一条反馈", level: "L3" },
  { theme: "只修最大缺陷", task: "根据反馈，只处理最影响交付的问题", evidenceRequirement: "缺陷修复前后对比", level: "L3" },
  { theme: "脱离教程", task: "不看教程，重新制作最关键的部分", evidenceRequirement: "独立重做结果", level: "L3" },
  { theme: "迁移情境", task: "用同一技术解决一个不同但相邻的问题", evidenceRequirement: "一次迁移练习", level: "L4" },
  { theme: "限时重做", task: "在时间盒内完成核心流程并记录错误", evidenceRequirement: "用时与错误率记录", level: "L4" },
  { theme: "真实评审", task: "邀请目标用户使用，观察而不是解释", evidenceRequirement: "第二轮真实反馈", level: "L4" },
  { theme: "最终彩排", task: "按验收标准完整模拟，冻结非必要功能", evidenceRequirement: "最终候选版本", level: "L5" },
  { theme: "发布与复盘", task: "正式展示成果，用证据判断每条标准", evidenceRequirement: "最终作品与复盘", level: "L5" },
];

export function generateFourteenDayPlan(): GeneratedDay[] {
  return templates.map((template, index) => ({
    ...template,
    dayNumber: index + 1,
    status: index === 0 ? "available" : "locked",
  }));
}
