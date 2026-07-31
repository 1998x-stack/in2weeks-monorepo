import type { Metadata } from "next";
import Link from "next/link";

import { listProjects } from "@/modules/catalog/repository";

export const metadata: Metadata = { title: "项目库" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; language?: string }>;
}) {
  const filters = await searchParams;
  const projects = await listProjects({
    search: filters.q,
    category: filters.category,
    language: filters.language,
    limit: 72,
  });
  const categories = [...new Set(projects.map((project) => project.category))].sort();
  const languages = [...new Set(projects.map((project) => project.language))].sort();

  return (
    <main className="page">
      <div className="section-head">
        <div><div className="eyebrow"><span />Build your own X</div><h1>挑一个，<br />亲手造出来。</h1></div>
        <p className="muted">每个教程只是作品起点。先把它缩成 14 天可交付范围，再开始动手。</p>
      </div>
      <form className="filters">
        <input defaultValue={filters.q} name="q" placeholder="搜索 Redis、React、Shell…" type="search" />
        <select defaultValue={filters.category} name="category">
          <option value="">全部类别</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <select defaultValue={filters.language} name="language">
          <option value="">全部语言</option>
          {languages.map((language) => <option key={language}>{language}</option>)}
        </select>
        <button className="button button-small" type="submit">筛选</button>
      </form>
      <p className="project-count">找到 {projects.length} 个项目 · 数据库未配置时显示精选样例</p>
      <section className="project-grid">
        {projects.map((project, index) => (
          <article className={`project-card tint-${index % 4}`} key={`${project.id}-${project.language}`}>
            <div className="project-meta"><span>{project.category}</span><span>{project.format === "video" ? "视频" : "图文"}</span></div>
            <h2>{project.title}</h2>
            <p>{project.language} · {project.difficulty}</p>
            <div className="card-actions">
              <Link className="primary-link" href={`/projects/${project.slug}`}>查看 14 天方案</Link>
              <a href={project.url} rel="noreferrer" target="_blank">原教程 ↗</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
