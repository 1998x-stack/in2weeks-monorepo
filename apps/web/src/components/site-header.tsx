import Link from "next/link";
import { Suspense } from "react";

import { AuthStatus } from "./auth-status";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/"><span className="brand-mark">14</span><span>In2Weeks</span></Link>
      <nav aria-label="主导航">
        <Link href="/today">今日</Link>
        <Link href="/explore">项目库</Link>
        <Link href="/method">方法</Link>
      </nav>
      <Suspense fallback={<span className="auth-placeholder">正在检查账户…</span>}>
        <AuthStatus />
      </Suspense>
    </header>
  );
}
