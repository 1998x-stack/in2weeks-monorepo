import type { CatalogProject } from "./repository";

export const featuredProjects: CatalogProject[] = [
  { id: "featured-redis", slug: "database-build-your-own-redis", title: "Build Your Own Redis from Scratch", category: "Database", difficulty: "intermediate", language: "C++", format: "article", url: "https://build-your-own.org/redis", summary: "把范围缩到 SET / GET / DEL，理解协议解析与内存键值结构。" },
  { id: "featured-react", slug: "frontend-build-your-own-react", title: "Build your own React", category: "Front-end Framework / Library", difficulty: "intermediate", language: "JavaScript", format: "article", url: "https://pomb.us/build-your-own-react/", summary: "从 createElement 到 Fiber，把 UI 框架拆成可验证的小技术。" },
  { id: "featured-shell", slug: "shell-build-a-shell", title: "Build a Shell in C", category: "Shell", difficulty: "intermediate", language: "C", format: "article", url: "https://brennan.io/2015/01/16/write-a-shell-in-c/", summary: "实现读取、解析和执行命令的最小闭环。" },
  { id: "featured-raytracer", slug: "renderer-ray-tracing-weekend", title: "Ray Tracing in One Weekend", category: "3D Renderer", difficulty: "advanced", language: "C++", format: "article", url: "https://raytracing.github.io/books/RayTracingInOneWeekend.html", summary: "用一张最终渲染图验证向量、光线和材质组合。" },
  { id: "featured-database", slug: "database-sqlite-clone", title: "Let's Build a Simple Database", category: "Database", difficulty: "advanced", language: "C", format: "article", url: "https://cstack.github.io/db_tutorial/", summary: "从 REPL 开始，逐步做出可持久化的最小数据库。" },
  { id: "featured-git", slug: "git-write-yourself-a-git", title: "Write yourself a Git!", category: "Git", difficulty: "intermediate", language: "Python", format: "article", url: "https://wyag.thb.lt/", summary: "通过对象、引用和提交理解 Git，而不是只记命令。" },
];
