import { createHash } from "node:crypto";

export type ParsedProjectSource = {
  sourceKey: string;
  slug: string;
  title: string;
  category: string;
  language: string;
  url: string;
  format: "article" | "video";
  searchText: string;
  contentHash: string;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function parseBuildYourOwnX(markdown: string): ParsedProjectSource[] {
  const projects: ParsedProjectSource[] = [];
  let category = "";

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (heading) {
      const headingText = heading[1].trim();
      const buildCategory = headingText.match(/^Build your own `(.+)`$/);
      category = buildCategory?.[1].trim()
        ?? (headingText === "Uncategorized" ? "Uncategorized" : "");
      continue;
    }
    if (!category) continue;

    const item = line.match(/^\*\s+\[\*\*(.+?)\*\*:\s+(.+?)\]\((https?:\/\/[^)]+)\)(.*)$/);
    if (!item) continue;

    const language = item[1].trim();
    const title = item[2].replace(/^[_*]+|[_*]+$/g, "").trim();
    const url = item[3].trim();
    const format = item[4].includes("[video]") ? "video" : "article";
    const sourceKey = createHash("sha256").update(url).digest("hex");

    projects.push({
      sourceKey,
      slug: `${slugify(`${category}-${title}`)}-${sourceKey.slice(0, 7)}`,
      title,
      category,
      language,
      url,
      format,
      searchText: `${title} ${category} ${language}`.toLowerCase(),
      contentHash: createHash("sha256").update(line).digest("hex"),
    });
  }

  return projects;
}
