const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");
const SOURCE_FILE = path.join(ROOT, "build-your-own-x", "README.md");
const PORT = Number(process.env.PORT || 3000);

const dayTemplates = [
  ["定义终点", "写下成果合同，并做一次不准备的基线尝试", "成果合同 · 基线记录", "L1"],
  ["拆解地图", "拆解参考样本，标记必须掌握的 A 类技术", "技术地图 · 3 个参考", "L1"],
  ["做出废稿", "不看完整课程，直接完成第一个粗糙版本", "能运行的 V0", "L1"],
  ["修复瓶颈", "只学习当前最大障碍对应的一项技术", "一处关键修复", "L2"],
  ["叠加技术", "整合第二项核心技术，减少一个明显错误", "作品 V0.2", "L2"],
  ["跑通闭环", "让输入、核心流程和输出第一次完整连通", "端到端流程", "L2"],
  ["第一次交付", "把 V1 交给一个真实的人，收集具体反馈", "V1 · 外部反馈", "L3"],
  ["只修最大缺陷", "根据反馈，只处理影响交付的最大问题", "缺陷修复记录", "L3"],
  ["脱离教程", "不看教程，重新制作最关键的部分", "独立重做结果", "L3"],
  ["迁移情境", "用同一技术解决一个不同但相邻的问题", "一次迁移练习", "L4"],
  ["限时重做", "在时间盒内完成核心流程，记录错误和用时", "用时 · 错误率", "L4"],
  ["真实评审", "邀请目标用户使用，观察而不是解释", "第二轮反馈", "L4"],
  ["最终彩排", "按交付标准完整模拟，冻结非必要功能", "最终候选版本", "L5"],
  ["发布与复盘", "正式展示成果，用证据判断是否达标", "最终成果 · 复盘", "L5"]
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "");
}

function parseProjects() {
  const markdown = fs.readFileSync(SOURCE_FILE, "utf8");
  const lines = markdown.split(/\r?\n/);
  const projects = [];
  let category = "";
  for (const line of lines) {
    const heading = line.match(/^#### Build your own `(.+)`/);
    if (heading) {
      category = heading[1];
      continue;
    }
    if (!category) continue;
    const item = line.match(/^\* \[\*\*(.+?)\*\*:?\s*\]\((.+?)\)|^\* \[\*\*(.+?)\*\*:?\s*(.+?)\]\((.+?)\)/);
    // Most entries use: * [**Language**: _Title_](url)
    const standard = line.match(/^\*\s+\[\*\*(.+?)\*\*:\s+(.+?)\]\((https?:\/\/[^)]+)\)(.*)$/);
    if (!standard) continue;
    const language = standard[1].trim();
    const title = standard[2].replace(/^[_*]+|[_*]+$/g, "").trim();
    const url = standard[3];
    const suffix = standard[4] || "";
    projects.push({
      id: `${slugify(category)}-${projects.length + 1}`,
      category,
      language,
      title,
      url,
      format: suffix.includes("[video]") ? "视频" : "图文",
      featured: /Redis|React|Shell|Database|Ray Tracing|Blockchain|Game|Git|Docker|Regex/i.test(title)
    });
  }
  return projects;
}

const projects = parseProjects();
const categories = [...new Set(projects.map((p) => p.category))].sort();
const languages = [...new Set(projects.map((p) => p.language))].sort();

function emptyState() {
  return { sprint: null, updatedAt: new Date().toISOString() };
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return emptyState();
  }
}

function writeState(state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const next = { ...state, updatedAt: new Date().toISOString() };
  const temp = `${STATE_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(next, null, 2));
  fs.renameSync(temp, STATE_FILE);
  return next;
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("请求内容过大"));
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error("JSON 格式无效")); }
    });
    req.on("error", reject);
  });
}

function makeDays() {
  return dayTemplates.map(([theme, task, evidence, level], index) => ({
    day: index + 1, theme, task, evidence, level, completed: false,
    minutes: 0, artifact: "", obstacle: "", recall: ""
  }));
}

async function api(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/meta") {
    return json(res, 200, {
      projectCount: projects.length, categories, languages,
      principles: ["成果优先", "先做后学", "定向补缺", "渐进超负荷", "真实反馈", "教学巩固"]
    });
  }

  if (req.method === "GET" && url.pathname === "/api/projects") {
    const search = (url.searchParams.get("search") || "").toLowerCase();
    const category = url.searchParams.get("category") || "";
    const language = url.searchParams.get("language") || "";
    const featured = url.searchParams.get("featured") === "true";
    const limit = Math.min(Number(url.searchParams.get("limit") || 60), 200);
    const filtered = projects.filter((p) =>
      (!search || `${p.title} ${p.category} ${p.language}`.toLowerCase().includes(search)) &&
      (!category || p.category === category) &&
      (!language || p.language === language) &&
      (!featured || p.featured)
    ).slice(0, limit);
    return json(res, 200, { projects: filtered, total: filtered.length });
  }

  if (req.method === "GET" && url.pathname === "/api/sprint") {
    return json(res, 200, readState());
  }

  if (req.method === "POST" && url.pathname === "/api/sprint") {
    const body = await readBody(req);
    if (!body.title || !body.audience || !Array.isArray(body.criteria) || body.criteria.filter(Boolean).length < 1) {
      return json(res, 422, { error: "请填写成果、使用者和至少一条验收标准" });
    }
    const selected = projects.find((p) => p.id === body.projectId);
    const sprint = {
      id: `sprint-${Date.now()}`,
      title: String(body.title).slice(0, 120),
      audience: String(body.audience).slice(0, 80),
      criteria: body.criteria.filter(Boolean).slice(0, 3).map((v) => String(v).slice(0, 120)),
      dailyMinutes: Math.max(30, Math.min(Number(body.dailyMinutes) || 90, 240)),
      startDate: new Date().toISOString(),
      project: selected || null,
      currentDay: 1,
      streak: 0,
      days: makeDays()
    };
    return json(res, 201, writeState({ sprint }).sprint);
  }

  const dayMatch = url.pathname.match(/^\/api\/sprint\/days\/(\d+)$/);
  if (req.method === "PATCH" && dayMatch) {
    const dayNumber = Number(dayMatch[1]);
    const body = await readBody(req);
    const state = readState();
    if (!state.sprint) return json(res, 404, { error: "尚未创建冲刺" });
    const day = state.sprint.days.find((d) => d.day === dayNumber);
    if (!day) return json(res, 404, { error: "日期不存在" });
    const allowed = ["completed", "minutes", "artifact", "obstacle", "recall"];
    for (const key of allowed) {
      if (key in body) day[key] = key === "completed" ? Boolean(body[key]) :
        key === "minutes" ? Math.max(0, Math.min(Number(body[key]) || 0, 600)) :
        String(body[key]).slice(0, 1000);
    }
    const firstIncomplete = state.sprint.days.find((d) => !d.completed);
    state.sprint.currentDay = firstIncomplete ? firstIncomplete.day : 14;
    let streak = 0;
    for (const item of state.sprint.days) {
      if (!item.completed) break;
      streak += 1;
    }
    state.sprint.streak = streak;
    return json(res, 200, writeState(state).sprint);
  }

  if (req.method === "DELETE" && url.pathname === "/api/sprint") {
    writeState(emptyState());
    res.writeHead(204);
    return res.end();
  }

  return json(res, 404, { error: "接口不存在" });
}

function staticFile(req, res, url) {
  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestPath}`);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); return res.end("Forbidden");
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404); return res.end("Not found");
    }
    const ext = path.extname(filePath);
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };
    res.writeHead(200, { "Content-Type": `${types[ext] || "application/octet-stream"}; charset=utf-8` });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) await api(req, res, url);
    else staticFile(req, res, url);
  } catch (error) {
    json(res, 500, { error: error.message || "服务器错误" });
  }
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`In2Weeks 已启动：http://localhost:${PORT}`));
}

module.exports = { server, parseProjects, makeDays };
