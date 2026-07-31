const test = require("node:test");
const assert = require("node:assert/strict");
const { parseProjects, makeDays } = require("../server");

test("从本地 README 解析出足够多的构建项目", () => {
  const projects = parseProjects();
  assert.ok(projects.length > 100);
  assert.ok(projects.some((project) => project.category === "Database"));
  assert.ok(projects.every((project) => project.title && project.url && project.language));
});

test("生成完整的 14 天渐进计划", () => {
  const days = makeDays();
  assert.equal(days.length, 14);
  assert.equal(days[0].level, "L1");
  assert.equal(days[13].level, "L5");
  assert.ok(days.every((day, index) => day.day === index + 1));
});
