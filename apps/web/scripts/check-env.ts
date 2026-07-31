const required = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"] as const;
const missing: string[] = required.filter((name) => !process.env[name]?.trim());
const githubReady = Boolean(process.env.GITHUB_ID?.trim() && process.env.GITHUB_SECRET?.trim());
const emailReady = Boolean(process.env.EMAIL_SERVER?.trim() && process.env.EMAIL_FROM?.trim());

if (!githubReady && !emailReady) {
  missing.push("GITHUB_ID+GITHUB_SECRET or EMAIL_SERVER+EMAIL_FROM");
}

if (missing.length) {
  console.error(`生产环境缺少配置：${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  const methods = [githubReady && "github", emailReady && "email"].filter(Boolean);
  console.log(`Environment OK: auth=${methods.join("+")}`);
}
