import Link from "next/link";

export default function NotFound() {
  return <main className="center-page"><div className="eyebrow"><span />404 / NOT FOUND</div><h1>这个成果还不存在。</h1><Link className="button" href="/explore">回到项目库 <span>→</span></Link></main>;
}
