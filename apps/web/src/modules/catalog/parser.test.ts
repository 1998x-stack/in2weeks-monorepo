import { describe, expect, it } from "vitest";

import { parseBuildYourOwnX, slugify } from "./parser";

describe("build-your-own-x parser", () => {
  it("parses categories, language, title and video format", () => {
    const markdown = [
      "#### Build your own `Database`",
      "* [**C++**: _Build Your Own Redis_](https://example.com/redis)",
      "* [**Go**: _Build a Tiny DB_](https://example.com/db) [video]",
    ].join("\n");
    const result = parseBuildYourOwnX(markdown);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ category: "Database", language: "C++", title: "Build Your Own Redis", format: "article" });
    expect(result[1].format).toBe("video");
  });

  it("creates stable URL-based keys and safe slugs", () => {
    expect(slugify("Front-end Framework / Library")).toBe("front-end-framework-library");
    const markdown = "#### Build your own `Shell`\n* [**C**: _A Shell_](https://example.com/shell)";
    expect(parseBuildYourOwnX(markdown)[0].sourceKey).toHaveLength(64);
  });
});
