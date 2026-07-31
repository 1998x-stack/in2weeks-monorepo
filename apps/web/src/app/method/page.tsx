export default function MethodPage() {
  const loop = ["明确成果", "立刻制作", "暴露缺口", "定向学习", "立即应用", "获得反馈"];
  return (
    <main className="page">
      <section className="method-hero">
        <div className="eyebrow"><span />The In2Weeks method</div>
        <h1 className="display">学习不是输入。<br /><span className="marker">学习是改变作品。</span></h1>
        <p className="muted">传统学习从知识目录出发，14 天冲刺从最终成果倒推。</p>
      </section>
      <section className="loop">
        {loop.map((item, index) => <div key={item}><span>0{index + 1}</span><b>{item}{index < 5 ? " →" : ""}</b></div>)}
      </section>
    </main>
  );
}
