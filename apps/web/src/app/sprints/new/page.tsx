import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContractForm } from "@/components/contract-form";
import { requireUser } from "@/lib/session";
import { getProjectBySlug } from "@/modules/catalog/repository";

export const metadata: Metadata = { title: "创建成果合同" };

export default async function NewSprintPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  await requireUser();
  const { project: slug } = await searchParams;
  if (!slug) notFound();
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className="page contract-page">
      <div className="contract-heading">
        <div className="eyebrow"><span />Outcome contract</div>
        <h1>第 14 天，<br />你要拿出什么？</h1>
        <p className="muted">不要写“掌握一门技术”。写下一个真实的人可以打开、运行或评审的作品。</p>
      </div>
      <ContractForm project={project} />
    </main>
  );
}
