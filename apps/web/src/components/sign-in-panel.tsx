"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function SignInPanel({
  callbackUrl,
  emailEnabled,
  githubEnabled,
}: {
  callbackUrl: string;
  emailEnabled: boolean;
  githubEnabled: boolean;
}) {
  const [pending, setPending] = useState<"github" | "email" | null>(null);
  const [message, setMessage] = useState("");

  async function emailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "");
    setPending("email");
    setMessage("");
    const result = await signIn("email", { email, callbackUrl, redirect: false });
    setPending(null);
    setMessage(result?.error ? "邮件发送失败，请检查地址或稍后重试。" : "登录链接已发送，请在 15 分钟内查收邮件。");
  }

  return (
    <div className="signin-panel">
      {githubEnabled ? (
        <>
          <button className="oauth-button" disabled={pending !== null} onClick={() => {
            setPending("github");
            void signIn("github", { callbackUrl });
          }} type="button">
            <span className="github-dot">GH</span>
            {pending === "github" ? "正在前往 GitHub…" : "使用 GitHub 继续"}
          </button>
          {emailEnabled ? <div className="divider"><span>或使用邮箱</span></div> : null}
        </>
      ) : null}
      {emailEnabled ? (
        <form onSubmit={emailSignIn}>
          <label htmlFor="email">邮箱地址</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required />
          <button className="button button-wide" disabled={pending !== null} type="submit">
            {pending === "email" ? "正在发送…" : "发送登录链接"} <span>→</span>
          </button>
        </form>
      ) : null}
      {!emailEnabled && !githubEnabled ? <p className="auth-error">登录服务尚未配置，请联系管理员。</p> : null}
      <p aria-live="polite" className="form-message">{message}</p>
    </div>
  );
}
