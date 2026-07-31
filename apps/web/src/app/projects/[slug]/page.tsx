import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectBySlug } from "@/modules/catalog/repository";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return { title: project?.title ?? "项目不存在" };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className="page project-detail">
      <div className="eyebrow"><span />{project.category} · {project.language}</div>
      <div className="project-hero">
        <div>
          <h1>{project.title}</h1>
          <p className="muted">{project.summary}</p>
          <div className="hero-actions">
            <Link
              className="button"
              href={{
                pathname: "/sign-in",
                query: { callbackUrl: `/sprints/new?project=${project.slug}` },
              }}
            >
              以此开始冲刺 <span>→</span>
            </Link>
            <a className="button button-ghost" href={project.url} rel="noreferrer" target="_blank">查看原教程 ↗</a>
          </div>
        </div>
        <aside className="scope-card">
          <small>建议范围 / 14 DAYS</small>
          <h2>先做最小可交付版本</h2>
          <ul><li>一个可以独立运行的核心流程</li><li>至少 10 个可重复验证的测试</li><li>一次 3 分钟无稿演示</li></ul>
        </aside>
      </div>
      <div className="scope-grid">
        <article><span>01</span><h3>成果证据</h3><p>代码或文件、运行演示、验收测试和外部反馈。</p></article>
        <article><span>02</span><h3>A 类技术</h3><p>只列出缺少就无法完成核心流程的技术，最多五项。</p></article>
        <article><span>03</span><h3>本次不做</h3><p>性能极限、完整兼容、复杂部署和锦上添花功能。</p></article>
      </div>
    </main>
  );
}
