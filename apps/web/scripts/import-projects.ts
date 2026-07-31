import { readFile } from "node:fs/promises";
import path from "node:path";

import { eq } from "drizzle-orm";

import { closeDbConnection, db } from "../src/db/connection";
import { projectSources, projects } from "../src/db/schema";
import { parseBuildYourOwnX } from "../src/modules/catalog/parser";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL 未配置，无法导入项目");

  const sourcePath = process.argv[2] ?? path.resolve(process.cwd(), "../../build-your-own-x/README.md");
  const parsed = parseBuildYourOwnX(await readFile(sourcePath, "utf8"));
  let created = 0;
  let updated = 0;

  for (const item of parsed) {
    const [existingSource] = await db.select({
      id: projectSources.id,
      projectId: projectSources.projectId,
    }).from(projectSources).where(eq(projectSources.sourceKey, item.sourceKey)).limit(1);

    if (existingSource) {
      await db.update(projectSources).set({
        url: item.url,
        language: item.language,
        format: item.format,
        contentHash: item.contentHash,
        active: true,
        importedAt: new Date(),
      }).where(eq(projectSources.id, existingSource.id));
      await db.update(projects).set({
        title: item.title,
        category: item.category,
        searchText: item.searchText,
        updatedAt: new Date(),
      }).where(eq(projects.id, existingSource.projectId));
      updated += 1;
      continue;
    }

    const [project] = await db.insert(projects).values({
      slug: item.slug,
      title: item.title,
      category: item.category,
      summary: `从零构建 ${item.title}，用真实作品验证理解。`,
      searchText: item.searchText,
    }).returning({ id: projects.id });

    await db.insert(projectSources).values({
      projectId: project.id,
      sourceKey: item.sourceKey,
      url: item.url,
      language: item.language,
      format: item.format,
      sourceRepo: "codecrafters-io/build-your-own-x",
      sourcePath: "README.md",
      contentHash: item.contentHash,
    });
    created += 1;
  }

  console.log(`项目同步完成：新增 ${created}，更新 ${updated}，总计 ${parsed.length}`);
  await closeDbConnection();
}

main().catch(async (error) => {
  console.error(error);
  await closeDbConnection();
  process.exitCode = 1;
});
