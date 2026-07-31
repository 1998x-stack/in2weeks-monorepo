import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInPanel } from "@/components/sign-in-panel";
import { emailAuthEnabled, githubAuthEnabled } from "@/lib/auth";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "登录" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await getCurrentSession();
  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl?.startsWith("/") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : "/today";
  if (session?.user) redirect(callbackUrl);

  return (
    <main className="auth-page">
      <section className="auth-copy">
        <div className="eyebrow"><span />Your next 14 days</div>
        <h1>作品不会从<br />收藏夹里长出来。</h1>
        <p>登录后创建成果合同，系统只在你遇到真实障碍时建议学习内容。</p>
      </section>
      <section className="auth-card">
        <small>登录或创建账户</small><h2>开始下一次冲刺</h2>
        {params.error && <p className="auth-error">登录没有完成，请重新尝试。</p>}
        <SignInPanel
          callbackUrl={callbackUrl}
          emailEnabled={emailAuthEnabled}
          githubEnabled={githubAuthEnabled}
        />
        <p className="legal">继续即表示你同意只用真实作品衡量进度。</p>
      </section>
    </main>
  );
}
