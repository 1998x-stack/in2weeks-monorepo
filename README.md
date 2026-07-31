# In2Weeks

<p align="center">
  <strong>Outcome-focused 14-day skill sprints.</strong><br>
  Pick a real project. Start building. Learn what you're missing.<br>
  Get feedback. Rebuild. Deliver on day 14.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#commands">Commands</a> •
  <a href="#design-philosophy">Philosophy</a>
</p>

---

**In2Weeks** turns Dan Koe's *You Can Learn Anything in Two Weeks* method into a structured product. It's not a course platform, not a todo app, not a habit tracker — it's a **delivery operating system** for real projects.

Instead of "finish the course first, then apply," In2Weeks flips the sequence:

> **Decide on a concrete outcome → Start building → Expose knowledge gaps → Learn what's directly needed → Apply → Get feedback → Iterate → Deliver.**

---

## Features

- **Outcome Contract** — Define your project, audience, and observable success criteria before writing a single line
- **14-Day Roadmap** — L1 (imitate) through L5 (independent delivery), with structured daily checkpoints
- **Daily Check-in** — Record hours worked, output produced, biggest obstacle, and recall notes each day
- **Artifact Log** — Accumulate learning evidence every day; unlocks the next day only after check-in
- **Project Catalog** — Dynamic project library sourced from curated build tutorials, with language/filter/search
- **Plan Intelligence** — Diagnoses fuzzy goals, over-scoped targets, and unobservable criteria before sprint starts
- **One Active Sprint** — Single-sprint focus enforced; pause, resume, or abandon as needed
- **Day 14 Auto-Complete** — Sprint automatically ends on completion; history preserved for review

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 17+ (or Docker Compose)

### Setup

```bash
# Clone the repo
git clone https://github.com/1998x-stack/in2weeks-monorepo.git
cd in2weeks-monorepo

# Configure environment
cp apps/web/.env.example apps/web/.env.local

# Start infrastructure
docker compose up -d postgres mailpit

# Install dependencies
npm --prefix apps/web install --legacy-peer-deps

# Set up database
npm run db:migrate

# Import project catalog
npm run content:import

# Start dev server
npm run dev
```

The app will be at **`http://localhost:3000`** — browse projects, start a sprint, and deliver by day 14.

Mailpit runs at **`http://localhost:8025`** for email-based auth during local development.

> **No database?** The app degrades gracefully: featured projects are visible, but login, full catalog, sprints, and user data require PostgreSQL.

### Authentication

- **Email magic link** — works out of the box locally via Mailpit
- **GitHub OAuth** — requires creating a GitHub OAuth app and adding `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` to `.env.local`

---

## Architecture

In2Weeks is a **modular monolith**: a single Next.js app backed by PostgreSQL.

```
┌─────────────────────────────────────────────┐
│                Next.js App                   │
│  App Router │ React Server Components        │
├─────────────────────────────────────────────┤
│  API Layer                                   │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Auth    │ │  Sprint  │ │  Catalog     │  │
│  │(NextAuth)│ │ Endpoints│ │  Endpoints   │  │
│  └─────────┘ └──────────┘ └──────────────┘  │
├─────────────────────────────────────────────┤
│  Business Logic (Modules)                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│  │ Sprints│ │ Checkin│ │Contract│ │Plan  │ │
│  └────────┘ └────────┘ └────────┘ └──────┘ │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Catalog  │ │ Feature  │ │ Repository   │ │
│  └─────────┘ └──────────┘ └──────────────┘ │
├─────────────────────────────────────────────┤
│  Database (Drizzle ORM + PostgreSQL)         │
└─────────────────────────────────────────────┘
```

### Design Principles

- **Parse, don't validate** — data shapes enforced at the boundary, not checked everywhere
- **Isolated modules** — each domain has its own folder with clear import boundaries
- **Rate-limited** — all stateful operations pass through a PostgreSQL-backed rate limiter
- **Graceful degradation** — read features work without a database; writes require it

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL 17 |
| **ORM** | Drizzle ORM with SQL migrations |
| **Auth** | NextAuth v5 (GitHub OAuth + Email Magic Link) |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Linting** | ESLint + TypeScript strict mode |
| **Styling** | PostCSS + custom CSS, responsive |
| **Infrastructure** | Docker Compose (dev), GitHub Actions (CI) |

---

## Project Structure

```
apps/web/                  Next.js application
├── src/
│   ├── app/               App Router pages & API routes
│   │   ├── api/           API endpoints
│   │   ├── sprints/       Sprint workspace
│   │   ├── today/         Daily check-in
│   │   ├── explore/       Project catalog
│   │   ├── method/        Methodology
│   │   └── sign-in/       Authentication
│   ├── components/        Shared React components
│   ├── db/                Drizzle schema + client
│   ├── lib/               Auth, rate-limit, session
│   └── modules/           Domain modules (sprints, catalog)
├── drizzle/               SQL migrations
├── e2e/                   Playwright tests
├── scripts/               Dev scripts
├── build-your-own-x/      Curated project content
├── docs/                  Design docs
├── public/                Legacy prototype
└── server.js              Legacy API server
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript strict check |
| `npm run test` | Unit + integration tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run db:generate` | Create SQL migration from schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run content:import` | Idempotent project catalog import |
| `npm run smoke:sprint` | Database e2e smoke test |
| `npm run check:env` | Pre-deploy auth & DB check |
| `npm run legacy:start` | Start original prototype |

---

## Design

- **[Product & Technical Design](./DESIGN.md)** — Current prototype design
- **[V2 Product Proposal](./docs/IN2WEEKS_V2_DESIGN.md)** — Full multi-user production plan
- **[Review & Fix Log](./docs/REVIEW_2026-07-31.md)** — Audit trail

### Visual Direction

Workbook + creator tool aesthetic: warm paper backgrounds, deep ink text, fluorescent accents, monospace figures — deliberately avoiding edtech's blue-purple gradients and gamification.

---

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  <sub>Built for people who ship, not just learn.</sub>
</p>
