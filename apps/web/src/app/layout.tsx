import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "In2Weeks — 用作品学会一项技能",
    template: "%s · In2Weeks",
  },
  description: "用 14 天完成一个真实作品。先做、补缺、反馈、重建。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="noise" />
        <SiteHeader />
        {children}
        <footer>
          <div className="brand"><span className="brand-mark">14</span><span>In2Weeks</span></div>
          <p>不要先学完。先做出第一个版本。</p>
          <span>Outcome-first learning.</span>
        </footer>
      </body>
    </html>
  );
}
