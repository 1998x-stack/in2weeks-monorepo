const app = document.querySelector("#app");
const sprintDialog = document.querySelector("#sprintDialog");
const checkinDialog = document.querySelector("#checkinDialog");
const sprintForm = document.querySelector("#sprintForm");
const checkinForm = document.querySelector("#checkinForm");
let state = { sprint: null };
let meta = { categories: [], languages: [], projectCount: 0 };
let selectedProject = null;

const api = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
};

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[c]));

function toast(message) {
  const element = document.querySelector("#toast");
  element.textContent = message;
  element.classList.add("show");
  setTimeout(() => element.classList.remove("show"), 2200);
}

function openSprint(project = null) {
  selectedProject = project;
  document.querySelector("#projectId").value = project?.id || "";
  document.querySelector("#dialogProject").textContent = project ? `项目起点：${project.category} · ${project.language} · ${project.title}` : "";
  document.querySelector("#sprintTitle").value = project ? `一个可运行的「${project.title.replace(/^Build(ing)? (a |your own )?/i, "")}」` : "";
  sprintDialog.showModal();
}

function landing() {
  return `
    <section class="page">
      <div class="hero">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> Outcome-first learning system</div>
          <h1 class="display">别再准备。<br><span class="marker">两周做出来。</span></h1>
          <p class="muted">选一个真实作品，先动手，再学习刚好够解决下一个障碍的知识。14 天后，你带走的不是一页课程进度，而是一个能展示、能使用的成果。</p>
          <div class="hero-actions">
            <button class="button" data-start>定义我的成果 <span>→</span></button>
            <div class="micro-proof"><span class="avatars"><i></i><i></i><i></i></span><span>${meta.projectCount}+ 个<br>从零构建项目</span></div>
          </div>
        </div>
        <div class="sprint-preview" aria-label="14 天冲刺预览">
          <div class="preview-accent"></div>
          <div class="preview-card">
            <div class="preview-top"><span>SPRINT / 01</span><span>DAY 03 OF 14</span></div>
            <h3>从零构建一个<br>迷你 Redis</h3>
            <p>成果不是“学会数据库”，而是让 SET / GET 真正跑起来。</p>
            <div class="day-stack">
              <div class="mini-day"><span>01</span><div><p>定义终点</p><small>成果合同</small></div><b>✓</b></div>
              <div class="mini-day"><span>02</span><div><p>拆解地图</p><small>A 类技术清单</small></div><b>✓</b></div>
              <div class="mini-day current"><span>03</span><div><p>做出废稿</p><small>第一个可运行版本</small></div><b>→</b></div>
            </div>
            <div class="preview-foot"><div><strong>03</strong><span>连续行动天数</span></div><div class="ring"></div></div>
          </div>
        </div>
      </div>
      <div class="manifesto">
        <article><small>01 / START</small><h3>从成果开始</h3><p>把“学编程”缩成“做出能读写数据的小程序”。具体成果会自动切掉无关知识。</p></article>
        <article><small>02 / BUILD</small><h3>先尝试，再搜索</h3><p>真实障碍决定今天学什么。每一个知识点，都要在 15 分钟内用进作品。</p></article>
        <article><small>03 / PROVE</small><h3>用证据结束</h3><p>文件、演示、真实反馈和独立复现，才是“学会”的证据，不是看完教程。</p></article>
      </div>
    </section>`;
}

function dashboard() {
  const sprint = state.sprint;
  const day = sprint.days.find((d) => d.day === sprint.currentDay) || sprint.days[13];
  const completed = sprint.days.filter((d) => d.completed).length;
  const minutes = sprint.days.reduce((sum, d) => sum + (d.minutes || 0), 0);
  return `
    <section class="page">
      <div class="dashboard-head">
        <div>
          <div class="eyebrow"><span></span> Active sprint</div>
          <h1>${escapeHtml(sprint.title)}</h1>
          <p class="muted">交付给 ${escapeHtml(sprint.audience)} · 每日 ${sprint.dailyMinutes} 分钟</p>
        </div>
        <div class="day-number">DAY ${String(sprint.currentDay).padStart(2,"0")} / 14</div>
      </div>
      <div class="dashboard-grid">
        <section class="panel today-panel">
          <div class="panel-label"><span>今天唯一的推进</span><span class="level">${day.level}</span></div>
          <h2>${escapeHtml(day.theme)}</h2>
          <p class="task-text">${escapeHtml(day.task)}</p>
          <div class="evidence-box"><small>今天必须留下的证据</small><p>${escapeHtml(day.evidence)}</p></div>
          <div class="focus-steps">
            <div><span>00—15</span><b>闭卷尝试</b></div>
            <div><span>15—40</span><b>定向补缺</b></div>
            <div><span>40—90</span><b>立即应用</b></div>
          </div>
          <button class="button" data-checkin="${day.day}">${day.completed ? "更新今天的记录" : "完成今天"} <span>→</span></button>
        </section>
        <aside>
          <section class="panel contract-panel">
            <div class="panel-label"><span>成果合同</span><span>已签署</span></div>
            <h3>第 14 天的承诺</h3>
            <blockquote>我将完成「${escapeHtml(sprint.title)}」，交给 ${escapeHtml(sprint.audience)} 使用。</blockquote>
            <ul class="criteria">${sprint.criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </section>
          <section class="panel stats-panel" style="margin-top:18px">
            <div class="panel-label"><span>行动证据</span><span>${Math.round(completed / 14 * 100)}%</span></div>
            <div class="stats-row">
              <div class="stat"><strong>${completed}</strong><span>完成天数</span></div>
              <div class="stat"><strong>${sprint.streak}</strong><span>连续推进</span></div>
              <div class="stat"><strong>${minutes}</strong><span>制作分钟</span></div>
            </div>
          </section>
        </aside>
        <section class="panel timeline">
          <div class="timeline-head"><h2>14 天路线</h2><span class="muted">难度从模仿 L1 逐步升到独立交付 L5</span></div>
          <div class="timeline-days">
            ${sprint.days.map((d) => `<button class="day-tile ${d.completed ? "completed" : ""} ${d.day === sprint.currentDay ? "current" : ""}" data-checkin="${d.day}"><span>${String(d.day).padStart(2,"0")}</span><b>${escapeHtml(d.theme)}</b></button>`).join("")}
          </div>
        </section>
      </div>
    </section>`;
}

async function projectsPage() {
  app.innerHTML = `<section class="page"><div class="empty">正在整理项目库…</div></section>`;
  const data = await api("/api/projects?featured=true&limit=60");
  app.innerHTML = `
    <section class="page">
      <div class="section-head">
        <div><div class="eyebrow"><span></span> Build your own X</div><h1>挑一个，<br>亲手造出来。</h1></div>
        <p class="muted">这里没有需要“学完”的大领域。每个教程都是一个作品起点，再由你把它缩成 14 天可交付的范围。</p>
      </div>
      <div class="filters">
        <input id="search" type="search" placeholder="搜索 Redis、React、Shell…">
        <select id="category"><option value="">全部类别</option>${meta.categories.map((v) => `<option>${escapeHtml(v)}</option>`).join("")}</select>
        <select id="language"><option value="">全部语言</option>${meta.languages.map((v) => `<option>${escapeHtml(v)}</option>`).join("")}</select>
      </div>
      <div class="project-count" id="projectCount">精选 ${data.projects.length} 个项目 · 来源于本地 build-your-own-x</div>
      <div class="project-grid" id="projectGrid">${projectCards(data.projects)}</div>
    </section>`;
  bindProjectFilters();
}

function projectCards(projects) {
  const tints = ["#cceedd", "#f6cdb5", "#d9ff43", "#cbd9f3"];
  if (!projects.length) return `<div class="empty">没有找到匹配项目，试试更宽的关键词。</div>`;
  return projects.map((p, i) => `
    <article class="project-card" style="--tint:${tints[i % tints.length]}">
      <div class="project-meta"><span>${escapeHtml(p.category)}</span><span>${escapeHtml(p.format)}</span></div>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.language)} · 从零构建</p>
      <div class="card-actions">
        <button data-project='${escapeHtml(JSON.stringify(p))}'>用它开始冲刺</button>
        <a href="${escapeHtml(p.url)}" target="_blank" rel="noreferrer">查看原教程 ↗</a>
      </div>
    </article>`).join("");
}

function bindProjectFilters() {
  const search = document.querySelector("#search");
  const category = document.querySelector("#category");
  const language = document.querySelector("#language");
  let timer;
  const load = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const query = new URLSearchParams({ search: search.value, category: category.value, language: language.value, limit: "90" });
      const data = await api(`/api/projects?${query}`);
      document.querySelector("#projectGrid").innerHTML = projectCards(data.projects);
      document.querySelector("#projectCount").textContent = `找到 ${data.projects.length} 个项目 · 来源于本地 build-your-own-x`;
    }, 180);
  };
  search.addEventListener("input", load);
  category.addEventListener("change", load);
  language.addEventListener("change", load);
}

function methodPage() {
  return `
    <section class="page">
      <div class="method-hero">
        <div class="eyebrow"><span></span> The In2Weeks method</div>
        <h1 class="display">学习不是输入。<br><span class="marker">学习是改变作品。</span></h1>
        <p class="muted">传统学习从知识目录出发，14 天冲刺从最终成果倒推。你只学会解决眼前问题的技术，并立刻把它变成可见进度。</p>
      </div>
      <div class="loop">
        ${["明确成果","立刻制作","暴露缺口","定向学习","立即应用","获得反馈"].map((v,i) => `<div><span>0${i+1}</span><b>${v}${i < 5 ? " →" : ""}</b></div>`).join("")}
      </div>
      <div class="method-grid">
        <article class="method-card"><span>01 / OUTCOME</span><h3>把大技能缩成一个成果</h3><p>不要写“两周学会 Python”，写“两周做出一个读取 Excel 并生成图表的小程序”。它必须可交付、可验证、可拆解、有反馈。</p></article>
        <article class="method-card"><span>02 / ATTEMPT</span><h3>失败后再搜索</h3><p>每天先闭卷尝试 15 分钟。失败不是偏离学习，而是帮你定位最值得学习的那个知识缺口。</p></article>
        <article class="method-card"><span>03 / LOAD</span><h3>每天只提高一点难度</h3><p>从跟随模仿 L1，到改写、重建、迁移，最后在时间限制内独立完成 L5。不要永远停留在教程里。</p></article>
        <article class="method-card"><span>04 / PROOF</span><h3>用作品证据代替熟悉感</h3><p>“看懂了”只是识别。两周至少要做到不看教程独立复现，理想状态是能迁移到新问题并向别人解释。</p></article>
      </div>
    </section>`;
}

async function render() {
  const route = location.hash.replace("#", "") || "home";
  document.querySelectorAll("[data-nav]").forEach((el) => el.classList.toggle("active", el.dataset.nav === route));
  if (route === "projects") return projectsPage();
  if (route === "method") app.innerHTML = methodPage();
  else app.innerHTML = state.sprint ? dashboard() : landing();
}

document.addEventListener("click", (event) => {
  const start = event.target.closest("[data-start]");
  const projectButton = event.target.closest("[data-project]");
  const checkin = event.target.closest("[data-checkin]");
  const close = event.target.closest(".dialog-close");
  if (start) openSprint();
  if (projectButton) openSprint(JSON.parse(projectButton.dataset.project));
  if (checkin) {
    const dayNumber = Number(checkin.dataset.checkin);
    const day = state.sprint.days.find((d) => d.day === dayNumber);
    checkinForm.elements.day.value = dayNumber;
    checkinForm.elements.minutes.value = day.minutes || 60;
    checkinForm.elements.artifact.value = day.artifact || "";
    checkinForm.elements.obstacle.value = day.obstacle || "";
    checkinForm.elements.recall.value = day.recall || "";
    document.querySelector("#checkinTitle").textContent = `第 ${dayNumber} 天 · ${day.theme}`;
    checkinDialog.showModal();
  }
  if (close) close.closest("dialog").close();
});

document.querySelector("#headerCta").addEventListener("click", () => state.sprint ? location.hash = "home" : openSprint());
window.addEventListener("hashchange", render);

sprintForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(sprintForm);
  try {
    const sprint = await api("/api/sprint", {
      method: "POST",
      body: JSON.stringify({
        projectId: form.get("projectId"), title: form.get("title"), audience: form.get("audience"),
        dailyMinutes: form.get("dailyMinutes"), criteria: form.getAll("criterion")
      })
    });
    state.sprint = sprint;
    sprintDialog.close();
    sprintForm.reset();
    location.hash = "home";
    render();
    toast("成果合同已签下。现在，做第一版。");
  } catch (error) {
    document.querySelector("#formError").textContent = error.message;
  }
});

checkinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(checkinForm);
  const day = Number(form.get("day"));
  try {
    state.sprint = await api(`/api/sprint/days/${day}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed: true, minutes: form.get("minutes"), artifact: form.get("artifact"),
        obstacle: form.get("obstacle"), recall: form.get("recall")
      })
    });
    checkinDialog.close();
    render();
    toast(`第 ${day} 天已留下行动证据`);
  } catch (error) { toast(error.message); }
});

Promise.all([api("/api/meta"), api("/api/sprint")]).then(([metaData, sprintState]) => {
  meta = metaData;
  state = sprintState;
  render();
}).catch((error) => {
  app.innerHTML = `<section class="page"><div class="empty">${escapeHtml(error.message)}</div></section>`;
});
