import "server-only";

import { and, asc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db/client";
import { projectSources, projects } from "@/db/schema";

import { featuredProjects } from "./featured";

export type CatalogProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  language: string;
  format: "article" | "video" | "course" | "repository";
  url: string;
  summary: string;
};

type CatalogFilters = { search?: string; category?: string; language?: string; limit?: number };

function filterFeatured(filters: CatalogFilters) {
  const search = filters.search?.toLowerCase();
  return featuredProjects.filter((project) =>
    (!search || `${project.title} ${project.category} ${project.language}`.toLowerCase().includes(search)) &&
    (!filters.category || project.category === filters.category) &&
    (!filters.language || project.language === filters.language)
  ).slice(0, filters.limit ?? 60);
}

export async function listProjects(filters: CatalogFilters = {}): Promise<CatalogProject[]> {
  if (!process.env.DATABASE_URL) return filterFeatured(filters);

  const conditions = [
    eq(projects.status, "published"),
    eq(projectSources.active, true),
  ];
  if (filters.search) {
    const query = `%${filters.search.trim()}%`;
    conditions.push(or(
      ilike(projects.title, query),
      ilike(projects.category, query),
      ilike(projectSources.language, query),
    )!);
  }
  if (filters.category) conditions.push(eq(projects.category, filters.category));
  if (filters.language) conditions.push(eq(projectSources.language, filters.language));

  return db.select({
    id: projects.id,
    slug: projects.slug,
    title: projects.title,
    category: projects.category,
    difficulty: projects.difficulty,
    language: projectSources.language,
    format: projectSources.format,
    url: projectSources.url,
    summary: projects.summary,
  }).from(projects)
    .innerJoin(projectSources, eq(projectSources.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(asc(projects.title))
    .limit(Math.min(filters.limit ?? 60, 100));
}

export async function getProjectBySlug(slug: string): Promise<CatalogProject | null> {
  if (!process.env.DATABASE_URL) return featuredProjects.find((project) => project.slug === slug) ?? null;

  const [project] = await db.select({
    id: projects.id,
    slug: projects.slug,
    title: projects.title,
    category: projects.category,
    difficulty: projects.difficulty,
    language: projectSources.language,
    format: projectSources.format,
    url: projectSources.url,
    summary: projects.summary,
  }).from(projects)
    .innerJoin(projectSources, eq(projectSources.projectId, projects.id))
    .where(and(
      eq(projects.slug, slug),
      eq(projects.status, "published"),
      eq(projectSources.active, true),
    ))
    .limit(1);

  return project ?? null;
}
