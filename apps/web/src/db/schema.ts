import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  date,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["learner", "coach", "admin"]);
export const projectDifficulty = pgEnum("project_difficulty", ["beginner", "intermediate", "advanced"]);
export const projectStatus = pgEnum("project_status", ["draft", "published", "archived"]);
export const sourceFormat = pgEnum("source_format", ["article", "video", "course", "repository"]);
export const sprintStatus = pgEnum("sprint_status", ["draft", "active", "paused", "completed", "abandoned"]);
export const sprintVisibility = pgEnum("sprint_visibility", ["private", "unlisted", "public"]);
export const verificationMethod = pgEnum("verification_method", ["test", "demo", "review", "other"]);
export const dayLevel = pgEnum("day_level", ["L1", "L2", "L3", "L4", "L5"]);
export const dayStatus = pgEnum("day_status", ["locked", "available", "completed", "skipped"]);
export const artifactKind = pgEnum("artifact_kind", ["file", "link", "github", "text", "image"]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  role: userRole("role").notNull().default("learner"),
  timezone: text("timezone").notNull().default("Asia/Shanghai"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => [
  primaryKey({ columns: [table.provider, table.providerAccountId] }),
  index("accounts_user_id_idx").on(table.userId),
]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
}, (table) => [index("sessions_user_id_idx").on(table.userId)]);

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
}, (table) => [primaryKey({ columns: [table.identifier, table.token] })]);

export const rateLimits = pgTable("rate_limits", {
  action: text("action").notNull(),
  identifierHash: text("identifier_hash").notNull(),
  windowStart: timestamp("window_start", { mode: "date", withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(1),
}, (table) => [
  primaryKey({ columns: [table.action, table.identifierHash, table.windowStart] }),
  index("rate_limits_window_start_idx").on(table.windowStart),
  check("rate_limits_attempts_check", sql`${table.attempts} > 0`),
]);

export const authenticators = pgTable("authenticators", {
  credentialID: text("credential_id").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerAccountId: text("provider_account_id").notNull(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credential_device_type").notNull(),
  credentialBackedUp: boolean("credential_backed_up").notNull(),
  transports: text("transports"),
}, (table) => [primaryKey({ columns: [table.userId, table.credentialID] })]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  category: text("category").notNull(),
  difficulty: projectDifficulty("difficulty").notNull().default("intermediate"),
  status: projectStatus("status").notNull().default("published"),
  searchText: text("search_text").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("projects_slug_unique").on(table.slug),
  index("projects_category_idx").on(table.category),
  index("projects_status_idx").on(table.status),
]);

export const projectSources = pgTable("project_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceKey: text("source_key").notNull(),
  url: text("url").notNull(),
  language: text("language").notNull(),
  format: sourceFormat("format").notNull().default("article"),
  sourceRepo: text("source_repo").notNull(),
  sourcePath: text("source_path").notNull(),
  contentHash: text("content_hash").notNull(),
  active: boolean("active").notNull().default(true),
  importedAt: timestamp("imported_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  lastCheckedAt: timestamp("last_checked_at", { mode: "date", withTimezone: true }),
}, (table) => [
  uniqueIndex("project_sources_source_key_unique").on(table.sourceKey),
  index("project_sources_project_id_idx").on(table.projectId),
  index("project_sources_language_idx").on(table.language),
]);

export const sprints = pgTable("sprints", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  audience: text("audience").notNull(),
  dailyMinutes: integer("daily_minutes").notNull().default(90),
  startDate: date("start_date", { mode: "string" }).notNull(),
  status: sprintStatus("status").notNull().default("active"),
  visibility: sprintVisibility("visibility").notNull().default("private"),
  currentDay: integer("current_day").notNull().default(1),
  excludedScope: jsonb("excluded_scope").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("sprints_user_status_idx").on(table.userId, table.status),
  index("sprints_project_id_idx").on(table.projectId),
  check("sprints_daily_minutes_check", sql`${table.dailyMinutes} between 30 and 240`),
  check("sprints_current_day_check", sql`${table.currentDay} between 1 and 14`),
  uniqueIndex("sprints_one_active_per_user_unique")
    .on(table.userId)
    .where(sql`${table.status} = 'active'`),
]);

export const sprintCriteria = pgTable("sprint_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  sprintId: uuid("sprint_id").notNull().references(() => sprints.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  text: text("text").notNull(),
  verification: verificationMethod("verification").notNull().default("other"),
}, (table) => [
  uniqueIndex("sprint_criteria_position_unique").on(table.sprintId, table.position),
  index("sprint_criteria_sprint_id_idx").on(table.sprintId),
  check("sprint_criteria_position_check", sql`${table.position} between 1 and 3`),
  check("sprint_criteria_text_check", sql`char_length(trim(${table.text})) between 3 and 120`),
]);

export const sprintDays = pgTable("sprint_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  sprintId: uuid("sprint_id").notNull().references(() => sprints.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  theme: text("theme").notNull(),
  task: text("task").notNull(),
  evidenceRequirement: text("evidence_requirement").notNull(),
  level: dayLevel("level").notNull(),
  status: dayStatus("status").notNull().default("locked"),
  minutes: integer("minutes").notNull().default(0),
  artifactSummary: text("artifact_summary").notNull().default(""),
  obstacle: text("obstacle").notNull().default(""),
  recall: text("recall").notNull().default(""),
  nextAction: text("next_action").notNull().default(""),
  completedAt: timestamp("completed_at", { mode: "date", withTimezone: true }),
}, (table) => [
  uniqueIndex("sprint_days_number_unique").on(table.sprintId, table.dayNumber),
  index("sprint_days_sprint_status_idx").on(table.sprintId, table.status),
  check("sprint_days_number_check", sql`${table.dayNumber} between 1 and 14`),
  check("sprint_days_minutes_check", sql`${table.minutes} between 0 and 600`),
]);

export const artifacts = pgTable("artifacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  sprintId: uuid("sprint_id").notNull().references(() => sprints.id, { onDelete: "cascade" }),
  sprintDayId: uuid("sprint_day_id").references(() => sprintDays.id, { onDelete: "set null" }),
  kind: artifactKind("kind").notNull(),
  title: text("title").notNull(),
  url: text("url"),
  metadata: jsonb("metadata").$type<Record<string, string | number | boolean>>().notNull().default({}),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("artifacts_sprint_id_idx").on(table.sprintId),
  index("artifacts_sprint_day_id_idx").on(table.sprintDayId),
]);

export type Project = typeof projects.$inferSelect;
export type ProjectSource = typeof projectSources.$inferSelect;
export type Sprint = typeof sprints.$inferSelect;
export type SprintDay = typeof sprintDays.$inferSelect;
