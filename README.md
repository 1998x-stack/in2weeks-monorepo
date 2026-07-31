# In2Weeks

In2Weeks 是一个以成果为中心的 14 天技能冲刺产品：选择真实作品，先做、补缺、反馈、重建，并在第 14 天正式交付。

## 当前结构

```text
apps/web/            Next.js + TypeScript 生产版
build-your-own-x/    本地项目内容来源
docs/                产品与技术设计
public/ + server.js  无依赖交互原型（保留为基线）
```

## 生产版快速开始

要求：

- Node.js 20+
- PostgreSQL 17+
- Docker Compose（推荐）

```bash
cp apps/web/.env.example apps/web/.env.local
docker compose up -d postgres mailpit
npm --prefix apps/web install --legacy-peer-deps
npm run db:migrate
npm run content:import
npm run dev
```

访问：

- 网站：`http://localhost:3000`
- Mailpit：`http://localhost:8025`

如暂时没有 PostgreSQL，网站仍可启动并展示精选项目；登录、完整项目库和用户数据需要数据库。

GitHub 登录需要创建 OAuth App，并将 Client ID/Secret 写入 `apps/web/.env.local`。邮箱登录在本地通过 Mailpit 接收。

## 常用命令

```bash
npm run dev             # 生产版开发服务器
npm run build           # 生产构建
npm run lint            # ESLint
npm run test            # 原型 + 生产版测试
npm run test:e2e        # Playwright 真实浏览器核心流程
npm run db:generate     # 根据 schema 生成 SQL 迁移
npm run db:migrate      # 执行迁移
npm run content:import  # 幂等同步本地项目库
npm run smoke:sprint    # 数据库端到端验证合同和每日推进
npm run check:env       # 上线前检查认证和数据库配置
npm run legacy:start    # 启动原始无依赖原型
```

运行服务后，`GET /api/health` 会检查应用及数据库状态，可供容器编排和监控系统探测。

## Phase 1 已实现

- Next.js App Router、TypeScript、响应式 UI；
- PostgreSQL + Drizzle Schema 和 SQL 迁移；
- 稳定版 NextAuth、GitHub OAuth 和邮箱魔法链接；
- 服务端会话与受保护的今日页面；
- `build-your-own-x` 解析、去重、幂等导入；
- 数据库搜索与无数据库精选降级；
- 项目详情和创建成果合同入口；
- Docker、CI、Lint、Vitest 和生产构建。

## Phase 2 已实现

- 成果合同表单与服务端 Zod 校验；
- 模糊目标、过大范围和不可观察标准诊断；
- Sprint、验收标准、14 天计划和文本证据模型；
- 从 L1 模仿到 L5 独立交付的计划生成；
- 用户同一时间只能有一个进行中冲刺；
- 今日工作台、合同、统计和 14 天路线；
- 每日制作时间、完成物、障碍、主动回忆和明日动作；
- 完成当天后写入 Artifact、解锁下一天；
- 第 14 天完成后自动结束冲刺；
- 暂停、恢复、放弃、历史冲刺和 Artifact 证据历史；
- PostgreSQL 共享限流覆盖邮箱登录、创建、打卡和状态操作；
- CSP 与基础浏览器安全响应头；
- 数据库 Smoke Test 覆盖并发提交、业务约束和共享限流；
- Playwright 覆盖合同创建、打卡、暂停恢复、第 14 天完成态和移动端布局；
- CI 自动启动 PostgreSQL，执行迁移、内容导入、数据库测试、构建及浏览器 E2E。

## 设计资料

- [当前原型设计](./DESIGN.md)
- [V2 生产化产品与技术方案](./docs/IN2WEEKS_V2_DESIGN.md)
- [全面审查与修复记录](./docs/REVIEW_2026-07-31.md)
