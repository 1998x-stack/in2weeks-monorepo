import Link from "next/link";

const previewDays = [
  ["01", "定义终点", "成果合同", "✓"],
  ["02", "拆解地图", "A 类技术清单", "✓"],
  ["03", "做出废稿", "第一个可运行版本", "→"],
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span />Outcome-first learning system</div>
          <h1 className="display">别再准备。<br /><span className="marker">两周做出来。</span></h1>
          <p className="muted">选一个真实作品，先动手，再学习刚好够解决下一个障碍的知识。14 天后，你带走的不是课程进度，而是一个能展示、能使用的成果。</p>
          <div className="hero-actions">
            <Link className="button" href="/explore">选择一个项目 <span>→</span></Link>
            <span className="micro-proof">359+ 个从零构建项目<br />来自开放技术社区</span>
          </div>
        </div>
        <div className="sprint-preview">
          <div className="preview-accent" />
          <div className="preview-card">
            <div className="preview-top"><span>SPRINT / 01</span><span>DAY 03 OF 14</span></div>
            <h2>从零构建一个<br />迷你 Redis</h2>
            <p>成果不是“学会数据库”，而是让 SET / GET 真正跑起来。</p>
            <div className="day-stack">
              {previewDays.map(([number, title, evidence, state], index) => (
                <div className={`mini-day ${index === 2 ? "current" : ""}`} key={number}>
                  <span>{number}</span><div><b>{title}</b><small>{evidence}</small></div><i>{state}</i>
                </div>
              ))}
            </div>
            <div className="preview-foot"><div><strong>03</strong><span>连续行动天数</span></div><div className="ring" /></div>
          </div>
        </div>
      </section>
      <section className="manifesto">
        <article><small>01 / START</small><h3>从成果开始</h3><p>把“学编程”缩成“做出一个能运行的小程序”。具体成果会自动切掉无关知识。</p></article>
        <article><small>02 / BUILD</small><h3>先尝试，再搜索</h3><p>真实障碍决定今天学什么。每个知识点都应在十五分钟内用进作品。</p></article>
        <article><small>03 / PROVE</small><h3>用证据结束</h3><p>文件、演示、真实反馈和独立复现，才是“学会”的证据。</p></article>
      </section>
    </main>
  );
}
