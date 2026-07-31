import Link from "next/link";

import { getCurrentSession } from "@/lib/session";

export async function AuthStatus() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return <Link className="button button-small" href="/sign-in">登录开始 <span>↗</span></Link>;
  }
  return (
    <Link className="user-chip" href="/today">
      <span>{session.user.name?.slice(0, 1) || session.user.email?.slice(0, 1) || "I"}</span>
      <b>{session.user.name || "我的冲刺"}</b>
    </Link>
  );
}
