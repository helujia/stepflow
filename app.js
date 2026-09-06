const tasks = [
  {
    id: 'review', order: '01', title: '完成实习活动复盘', project: '实习项目', progress: 65,
    time: 20, deadline: '今天截止', level: '优先处理', levelTone: 'rose',
    normal: '整理活动结果，写出 3 点经验与 1 个待改进问题。',
    minimum: '先写下最关键的 3 个事实，形成可继续编辑的草稿。',
    gain: '+8% 项目进度', bridge: '在文末写一句：下次活动最先调整什么？'
  },
  {
    id: 'interview', order: '02', title: '完成访谈提纲', project: '毕业论文', progress: 18,
    time: 35, deadline: '还剩 9 天', level: '高认知', levelTone: 'ai', risk: '按当前速度可能晚 2 天',
    normal: '围绕研究问题，完成 8–10 个主问题和必要追问。',
    minimum: '只列出 5 个核心问题，不润色、不补追问。',
    gain: '+3% 项目进度', bridge: '标记一个最难回答的问题，明天从它开始。'
  },
  {
    id: 'notes', order: '03', title: '整理 AI 课程笔记', project: '个人学习', progress: 32,
    time: 25, deadline: '无硬性截止', level: '轻量收尾', levelTone: 'sage',
    normal: '合并本周笔记，提炼 5 条可复用的方法。',
    minimum: '只给零散笔记加上标题，并归入 3 个主题。',
    gain: '+5% 学习进度', bridge: '留下一条最想实践的方法。'
  }
];

const poolItems = [
  { title: '联系两位访谈对象', project: '毕业论文', note: 'AI 建议：先发一版简短邀请，不必等提纲完全定稿', time: '15 分钟', deadline: '本周' },
  { title: '更新作品集项目描述', project: '求职准备', note: 'AI 已识别：可以拆成“选案例”和“改文案”两步', time: '35 分钟', deadline: '9 月 12 日' },
  { title: '预约年度体检', project: '个人事务', note: '低认知任务，适合放在精力较低的时段', time: '10 分钟', deadline: '无截止' },
  { title: '规划中秋短途行程', project: '生活计划', note: '信息仍不足：需要先确认同行人和预算范围', time: '待估算', deadline: '待确认' }
];

const state = {
  page: 'today', completed: new Set(), selectedTask: null, mode: 'normal',
  timer: null, secondsLeft: 0, totalSeconds: 0, paused: false
};

const icon = (name, cls = 'h-4 w-4') => `<i data-lucide="${name}" class="${cls}"></i>`;

function renderCurrentDate() {
  const now = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateLabel = document.querySelector('#today-date');
  if (dateLabel) {
    dateLabel.textContent = `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 星期${weekdays[now.getDay()]}`;
  }
}

function hydrateIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
}

function renderTasks() {
  const list = document.querySelector('#task-list');
  list.innerHTML = tasks.map(task => {
    const done = state.completed.has(task.id);
    const badge = task.levelTone === 'rose'
      ? 'bg-rose-soft text-rose'
      : task.levelTone === 'ai' ? 'bg-ai-soft text-ai-dark' : 'bg-sage-soft text-sage-dark';
    return `
      <article class="group rounded-[24px] border ${done ? 'border-sage/25 bg-sage-soft/45' : 'border-line bg-white/75'} p-5 shadow-hush transition hover:-translate-y-0.5 hover:shadow-lift sm:p-6">
        <div class="flex gap-4 sm:gap-5">
          <span class="pt-1 font-mono text-xs tracking-widest ${done ? 'text-sage' : 'text-muted'}">${task.order}</span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-[17px] font-semibold ${done ? 'text-sub line-through decoration-sage/50' : ''}">${task.title}</h3>
                  <span class="rounded-full ${badge} px-2.5 py-1 text-[11px] font-medium">${task.level}</span>
                </div>
                <p class="mt-1.5 text-sm text-muted">${task.project} · 当前 ${task.progress}%</p>
              </div>
              ${done ? `<span class="inline-flex items-center gap-1.5 self-start rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white">${icon('check','h-3.5 w-3.5')}已完成</span>` : `<button class="inline-flex items-center gap-2 self-start rounded-full bg-sage px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-dark" data-action="task-detail" data-task="${task.id}">开始这一步 ${icon('arrow-right','h-3.5 w-3.5')}</button>`}
            </div>
            <p class="mt-4 text-[14px] leading-6 text-sub">${task.minimum}</p>
            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-sub">${icon('clock','h-3.5 w-3.5')}${task.time} 分钟</span>
              <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-sub">${icon('calendar-days','h-3.5 w-3.5')}${task.deadline}</span>
              ${task.risk ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-rose-soft px-3 py-1.5 text-rose">${icon('triangle-alert','h-3.5 w-3.5')}${task.risk}</span>` : ''}
            </div>
          </div>
        </div>
      </article>`;
  }).join('');
  document.querySelector('#completion-count').textContent = `${state.completed.size} / ${tasks.length} 完成`;
  hydrateIcons();
}

function renderPool() {
  document.querySelector('#pool-list').innerHTML = poolItems.map((item, index) => `
    <article class="rounded-[22px] border border-line bg-white/70 p-5 transition hover:border-sage/35 hover:bg-white">
      <div class="flex items-start justify-between gap-3">
        <div><span class="text-xs font-medium text-sage">${item.project}</span><h3 class="mt-2 font-semibold">${item.title}</h3></div>
        <button class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-sage-soft hover:text-sage-dark" data-action="estimate" data-pool="${index}" aria-label="查看 AI 估算">${icon('sparkles','h-4 w-4')}</button>
      </div>
      <p class="mt-3 text-sm leading-6 text-sub">${item.note}</p>
      <div class="mt-4 flex flex-wrap gap-2 text-xs text-muted"><span class="rounded-full bg-mist px-2.5 py-1">${item.time}</span><span class="rounded-full bg-mist px-2.5 py-1">${item.deadline}</span></div>
    </article>`).join('');
  hydrateIcons();
}

function showPage(page) {
  state.page = page;
  document.querySelectorAll('[data-page-panel]').forEach(panel => {
    panel.classList.toggle('hidden', panel.dataset.pagePanel !== page);
    if (panel.dataset.pagePanel === page) {
      panel.classList.remove('page-enter'); void panel.offsetWidth; panel.classList.add('page-enter');
    }
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const active = btn.dataset.page === page;
    btn.className = `nav-btn rounded-full px-5 py-2 text-sm font-medium transition ${active ? 'bg-sage text-white shadow-sm' : 'text-sub hover:text-ink'}`;
  });
  document.querySelector('#mobile-nav').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(content, size = 'max-w-lg') {
  document.body.classList.add('overflow-hidden');
  document.querySelector('#modal-root').innerHTML = `
    <div class="fade-enter fixed inset-0 z-[60] flex items-end justify-center bg-[#1f302b]/25 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" data-action="backdrop">
      <section class="modal-enter soft-scrollbar max-h-[92vh] w-full ${size} overflow-y-auto rounded-t-[28px] border border-line bg-paper shadow-2xl sm:rounded-[28px]" role="dialog" aria-modal="true">
        ${content}
      </section>
    </div>`;
  hydrateIcons();
}

function closeModal() {
  stopTimer();
  document.body.classList.remove('overflow-hidden');
  document.querySelector('#modal-root').innerHTML = '';
}

function modalHeader(kicker, title, subtitle = '') {
  return `<div class="flex items-start justify-between gap-4 border-b border-line/70 px-6 py-5">
    <div><p class="text-xs font-semibold tracking-[.14em] text-sage">${kicker}</p><h2 class="mt-1.5 text-xl font-semibold tracking-tight">${title}</h2>${subtitle ? `<p class="mt-2 text-sm leading-6 text-sub">${subtitle}</p>` : ''}</div>
    <button class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-mist hover:text-ink" data-action="close-modal" aria-label="关闭">${icon('x','h-4 w-4')}</button>
  </div>`;
}

function showTaskDetail(taskId) {
  const task = tasks.find(item => item.id === taskId);
  state.selectedTask = task;
  state.mode = 'normal';
  openModal(`${modalHeader('当前这一步', task.title, `${task.project} · AI 建议先选一个你真正做得动的版本`)}
    <div class="space-y-3 p-6">
      <button class="mode-option w-full rounded-2xl border-2 border-sage bg-sage-soft/65 p-4 text-left" data-action="choose-mode" data-mode="normal">
        <div class="flex items-center justify-between gap-3"><span class="font-semibold">正常版本 · ${task.time} 分钟</span><span class="mode-check text-sage">${icon('circle-check','h-5 w-5')}</span></div>
        <p class="mt-2 text-sm leading-6 text-sub">${task.normal}</p>
      </button>
      <button class="mode-option w-full rounded-2xl border-2 border-line bg-white p-4 text-left" data-action="choose-mode" data-mode="minimum">
        <div class="flex items-center justify-between gap-3"><span class="font-semibold">最低可行版本 · ${Math.max(8, Math.round(task.time * .45))} 分钟</span><span class="mode-check text-muted">${icon('circle','h-5 w-5')}</span></div>
        <p class="mt-2 text-sm leading-6 text-sub">${task.minimum}</p>
      </button>
      <div class="rounded-2xl bg-ai-soft/65 p-4 text-sm leading-6 text-ai-dark"><strong>AI 提醒：</strong>选择最低版本不算退步，它的作用是保住连续性。</div>
      <button class="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-sage py-3.5 text-sm font-semibold text-white transition hover:bg-sage-dark" data-action="start-focus">进入专注 ${icon('arrow-right')}</button>
    </div>`);
}

function startFocus() {
  const task = state.selectedTask;
  const minutes = state.mode === 'normal' ? task.time : Math.max(8, Math.round(task.time * .45));
  state.totalSeconds = minutes * 60;
  state.secondsLeft = state.totalSeconds;
  state.paused = false;
  renderTimerModal();
  state.timer = window.setInterval(() => {
    if (!state.paused && state.secondsLeft > 0) {
      state.secondsLeft -= 1;
      updateTimerUI();
    }
  }, 1000);
}

function renderTimerModal() {
  const task = state.selectedTask;
  openModal(`<div class="p-6 sm:p-8">
    <div class="flex items-center justify-between"><span class="rounded-full bg-sage-soft px-3 py-1.5 text-xs font-medium text-sage-dark">专注中 · ${state.mode === 'normal' ? '正常版本' : '最低版本'}</span><button class="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-mist" data-action="close-modal">${icon('x')}</button></div>
    <div class="mt-8 text-center"><p class="text-sm text-muted">此刻只做这一件事</p><h2 class="mt-2 text-xl font-semibold">${task.title}</h2></div>
    <div class="timer-ring mx-auto mt-8 grid h-48 w-48 place-items-center rounded-full p-2 shadow-hush" id="timer-ring"><div class="grid h-full w-full place-items-center rounded-full bg-paper"><div class="text-center"><p id="timer-text" class="font-mono text-4xl font-semibold tracking-tight">00:00</p><p class="mt-2 text-xs text-muted">剩余时间</p></div></div></div>
    <p class="mx-auto mt-7 max-w-sm text-center text-sm leading-6 text-sub">${state.mode === 'normal' ? task.normal : task.minimum}</p>
    <div class="mt-7 grid grid-cols-2 gap-3"><button class="rounded-full border border-line py-3 text-sm font-medium text-sub hover:bg-mist" data-action="toggle-timer"><span id="pause-label">暂停一下</span></button><button class="rounded-full bg-sage py-3 text-sm font-semibold text-white hover:bg-sage-dark" data-action="complete-task">标记完成</button></div>
  </div>`);
  updateTimerUI();
}

function updateTimerUI() {
  const minutes = Math.floor(state.secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (state.secondsLeft % 60).toString().padStart(2, '0');
  const text = document.querySelector('#timer-text');
  const ring = document.querySelector('#timer-ring');
  if (text) text.textContent = `${minutes}:${seconds}`;
  if (ring) ring.style.setProperty('--timer-progress', `${(1 - state.secondsLeft / state.totalSeconds) * 100}%`);
}

function stopTimer() {
  if (state.timer) window.clearInterval(state.timer);
  state.timer = null;
}

function completeTask() {
  stopTimer();
  const task = state.selectedTask;
  state.completed.add(task.id);
  renderTasks();
  openModal(`<div class="p-7 text-center sm:p-9">
    <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage text-white">${icon('check','h-7 w-7')}</span>
    <p class="mt-5 text-sm font-medium text-sage">真实推进已记录</p><h2 class="mt-2 text-2xl font-semibold">这一步完成了</h2>
    <p class="mt-3 text-sm leading-7 text-sub">${task.gain}。${state.mode === 'minimum' ? '最低版本已经守住了今天的连续性。' : '你完成了今天设定的正常版本。'}</p>
    <div class="mt-6 rounded-2xl bg-ai-soft/70 p-4 text-left"><p class="text-xs font-semibold tracking-wider text-ai-dark">2 分钟衔接</p><p class="mt-2 text-sm leading-6 text-[#586f7b]">${task.bridge}</p></div>
    <div class="mt-6"><p class="mb-3 text-xs text-muted">先休息多久？</p><div class="grid grid-cols-2 gap-3"><button class="rounded-full border border-line py-3 text-sm font-medium text-sub hover:bg-mist" data-action="rest" data-minutes="5">休息 5 分钟</button><button class="rounded-full border border-line py-3 text-sm font-medium text-sub hover:bg-mist" data-action="rest" data-minutes="10">休息 10 分钟</button></div></div>
    <button class="mt-4 w-full rounded-full bg-sage py-3.5 text-sm font-semibold text-white hover:bg-sage-dark" data-action="close-modal">回到今日</button>
    <p class="mt-4 text-xs text-muted">今天未完成的部分不会自动变成明天的任务债。</p>
  </div>`);
}

function toast(message) {
  const root = document.querySelector('#toast-root');
  root.innerHTML = `<div class="fade-enter rounded-full bg-ink px-5 py-3 text-sm text-white shadow-xl">${message}</div>`;
  window.setTimeout(() => { root.innerHTML = ''; }, 2400);
}

function dailyStateModal() {
  openModal(`${modalHeader('调整今日容量', '今天的状态怎么样？', '只用于重新估算今天，不会改变长期目标。')}
    <div class="space-y-6 p-6">
      <div><p class="mb-3 text-sm font-semibold">今天能处理多难的任务？</p><div class="choice-row grid grid-cols-3 gap-2" data-choice><button class="choice rounded-xl border border-line py-2.5 text-sm text-sub">轻量</button><button class="choice rounded-xl border border-sage bg-sage-soft py-2.5 text-sm font-medium text-sage-dark">适中</button><button class="choice rounded-xl border border-line py-2.5 text-sm text-sub">困难</button></div></div>
      <div><p class="mb-3 text-sm font-semibold">今天大约有多少可用时间？</p><div class="choice-row grid grid-cols-3 gap-2" data-choice><button class="choice rounded-xl border border-line py-2.5 text-sm text-sub">30 分钟</button><button class="choice rounded-xl border border-sage bg-sage-soft py-2.5 text-sm font-medium text-sage-dark">1–2 小时</button><button class="choice rounded-xl border border-line py-2.5 text-sm text-sub">2 小时以上</button></div></div>
      <div><p class="mb-3 text-sm font-semibold">此刻的精力？</p><div class="choice-row grid grid-cols-3 gap-2" data-choice><button class="choice rounded-xl border border-line py-2.5 text-sm text-sub">很低</button><button class="choice rounded-xl border border-sage bg-sage-soft py-2.5 text-sm font-medium text-sage-dark">一般</button><button class="choice rounded-xl border border-line py-2.5 text-sm text-sub">充足</button></div></div>
      <button class="w-full rounded-full bg-sage py-3.5 text-sm font-semibold text-white hover:bg-sage-dark" data-action="save-state">重新安排今天</button>
    </div>`);
}

function reasonModal() {
  openModal(`${modalHeader('AI 排序依据', '为什么这样安排', '建议来自任务状态，不是对你意志力的判断。')}
    <div class="space-y-4 p-6">
      <div class="flex gap-3 rounded-2xl bg-rose-soft/75 p-4"><span class="mt-0.5 text-rose">${icon('calendar-clock')}</span><div><p class="text-sm font-semibold">截止压力</p><p class="mt-1 text-sm leading-6 text-sub">实习复盘今天截止，先收尾能消除即时风险。</p></div></div>
      <div class="flex gap-3 rounded-2xl bg-ai-soft/70 p-4"><span class="mt-0.5 text-ai-dark">${icon('brain')}</span><div><p class="text-sm font-semibold">认知窗口</p><p class="mt-1 text-sm leading-6 text-sub">访谈提纲需要更完整的注意力，所以放在第二段，不被杂事切碎。</p></div></div>
      <div class="flex gap-3 rounded-2xl bg-sage-soft/70 p-4"><span class="mt-0.5 text-sage-dark">${icon('shield-check')}</span><div><p class="text-sm font-semibold">容量保护</p><p class="mt-1 text-sm leading-6 text-sub">今天只安排约 80 分钟，保留余量，未完成部分不滚成任务债。</p></div></div>
      <button class="w-full rounded-full border border-line py-3 text-sm font-medium text-ai-dark hover:bg-ai-soft" data-action="disagree">我不同意这个安排</button>
    </div>`);
}

function disagreeModal() {
  openModal(`${modalHeader('校准，而不是争辩', '哪里与你的判断不一致？', 'AI 会说明依据，也会保留你的最终决定。')}
    <div class="p-6"><div class="space-y-2" data-choice><button class="choice w-full rounded-2xl border border-line p-4 text-left text-sm hover:bg-mist">我今天没有这么多时间</button><button class="choice w-full rounded-2xl border border-line p-4 text-left text-sm hover:bg-mist">顺序不符合我的实际情况</button><button class="choice w-full rounded-2xl border border-line p-4 text-left text-sm hover:bg-mist">其中一项并不重要</button><button class="choice w-full rounded-2xl border border-line p-4 text-left text-sm hover:bg-mist">我只是想按自己的方式来</button></div><div class="mt-5 grid grid-cols-2 gap-3"><button class="rounded-full border border-line py-3 text-sm font-medium text-sub" data-action="close-modal">保留原安排</button><button class="rounded-full bg-sage py-3 text-sm font-semibold text-white" data-action="adjust-plan">按我的判断调整</button></div></div>`);
}

function tempModal() {
  openModal(`${modalHeader('临时任务', '突然多了一件事？', '先告诉我是什么。分析影响后，由你确认是否改变今天。')}
    <div class="p-6"><textarea id="temp-input" class="min-h-28 w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 placeholder:text-muted focus:border-sage/60" placeholder="例如：下午 4 点前，需要帮同事检查一份 10 页的方案……"></textarea><button class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-sage py-3.5 text-sm font-semibold text-white hover:bg-sage-dark" data-action="temp-analyze">分析对今天的影响 ${icon('arrow-right')}</button></div>`);
}

function tempImpactModal() {
  const value = document.querySelector('#temp-input')?.value.trim() || '处理刚刚新增的临时事项';
  openModal(`${modalHeader('变更提议', '加入它，会发生什么？', '这只是提议，尚未修改你的今日计划。')}
    <div class="p-6"><div class="rounded-2xl border border-line bg-white p-4"><p class="text-xs font-medium text-muted">新任务</p><p class="mt-2 text-sm font-semibold">${escapeHtml(value)}</p><p class="mt-2 text-xs text-ai-dark">AI 初步估算 · 约 25 分钟 · 中等认知</p></div><div class="my-4 flex justify-center text-muted">${icon('arrow-down')}</div><div class="rounded-2xl bg-amber/10 p-4 text-sm leading-6 text-[#7b643f]"><strong>影响：</strong>若今天加入，建议将“整理 AI 课程笔记”移出今日。论文任务保持不变，预计总时长增加 5 分钟。</div><div class="mt-5 grid grid-cols-2 gap-3"><button class="rounded-full border border-line py-3 text-sm font-medium text-sub" data-action="close-modal">暂不加入</button><button class="rounded-full bg-sage py-3 text-sm font-semibold text-white" data-action="temp-confirm">确认调整</button></div></div>`);
}

function reviewModal() {
  openModal(`${modalHeader('晚间复盘', '今天实际发生了什么？', '不追责。只记录事实，让明天的建议更贴近你。')}
    <div class="space-y-6 p-6"><div><p class="mb-3 text-sm font-semibold">如果有任务没完成，主要是因为：</p><div class="flex flex-wrap gap-2" data-choice><button class="choice rounded-full border border-line px-4 py-2 text-sm text-sub">时间被打断</button><button class="choice rounded-full border border-line px-4 py-2 text-sm text-sub">低估了难度</button><button class="choice rounded-full border border-line px-4 py-2 text-sm text-sub">精力不足</button><button class="choice rounded-full border border-line px-4 py-2 text-sm text-sub">优先级变化</button></div></div><div class="rounded-2xl bg-ai-soft/70 p-4"><p class="text-xs font-semibold tracking-wider text-ai-dark">AI 给明天的建议</p><p class="mt-2 text-sm leading-6 text-[#586f7b]">保留论文提纲，但把正常版本从 35 分钟降到 25 分钟。今天没做完的笔记不会自动顺延。</p></div><button class="w-full rounded-full bg-sage py-3.5 text-sm font-semibold text-white" data-action="save-review">结束今天</button></div>`);
}

function parseTaskModal() {
  const input = document.querySelector('#capture-input').value.trim();
  if (!input) { toast('先写下一件脑中的任务'); return; }
  openModal(`${modalHeader('AI 初步拆解', '我先这样理解', '请确认后再加入任务池。')}
    <div class="p-6"><div class="space-y-3 rounded-2xl bg-ai-soft/65 p-5 text-sm"><div><span class="text-muted">任务：</span><strong>${escapeHtml(input)}</strong></div><div><span class="text-muted">建议下一步：</span>先产出一个可发送的粗略版本</div><div><span class="text-muted">预计：</span>30 分钟 · 中等认知</div><div><span class="text-muted">截止：</span>信息不足，需要你补充</div></div><div class="mt-5 grid grid-cols-2 gap-3"><button class="rounded-full border border-line py-3 text-sm font-medium text-sub" data-action="close-modal">再改一下</button><button class="rounded-full bg-sage py-3 text-sm font-semibold text-white" data-action="accept-parsed">确认加入</button></div></div>`);
}

function estimateModal(index) {
  const item = poolItems[index];
  openModal(`${modalHeader('估算依据', item.title, 'AI 的时间估算可以被纠正。')}
    <div class="p-6"><p class="text-sm leading-7 text-sub">当前估算为 <strong class="text-ink">${item.time}</strong>，主要参考任务类型、文字量和你近两周相似任务的实际耗时。现在还没有改变任何计划。</p><div class="mt-5 rounded-2xl bg-mist p-4 text-sm text-sub">如果你认为估算不准，可以直接输入自己的时间；后续 AI 会同时保留两个判断。</div><button class="mt-5 w-full rounded-full border border-line py-3 text-sm font-medium text-ai-dark" data-action="challenge-estimate">这个估算不对</button></div>`);
}

function progressEstimateModal() {
  openModal(`${modalHeader('进度分歧', 'AI 估算 18%，你估计 15%', '进度不是标准答案，我们保留两种口径。')}
    <div class="p-6"><div class="grid grid-cols-2 gap-3"><div class="rounded-2xl bg-ai-soft p-4 text-center"><p class="text-xs text-ai-dark">AI 估算</p><p class="mt-2 text-2xl font-semibold text-ai-dark">18%</p><p class="mt-2 text-xs leading-5 text-sub">按已完成节点加权</p></div><div class="rounded-2xl bg-sage-soft p-4 text-center"><p class="text-xs text-sage-dark">你的判断</p><p class="mt-2 text-2xl font-semibold text-sage-dark">15%</p><p class="mt-2 text-xs leading-5 text-sub">按整体完成感受</p></div></div><p class="mt-5 text-sm leading-7 text-sub">差异主要来自“确定研究问题”这一节点的权重。后续建议仍以实际里程碑为准，不会因为百分比差异催促你。</p><button class="mt-5 w-full rounded-full bg-sage py-3 text-sm font-semibold text-white" data-action="close-modal">保留两种判断</button></div>`);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) {
    const choice = event.target.closest('.choice');
    if (choice) {
      const group = choice.closest('[data-choice]');
      group?.querySelectorAll('.choice').forEach(item => item.className = item.className.replace(/border-sage|bg-sage-soft|font-medium|text-sage-dark/g, '').replace('border-line', 'border-line'));
      choice.classList.add('border-sage', 'bg-sage-soft', 'font-medium', 'text-sage-dark');
    }
    return;
  }

  const actions = {
    nav: () => showPage(button.dataset.page),
    'mobile-menu': () => document.querySelector('#mobile-nav').classList.toggle('hidden'),
    temp: tempModal,
    'daily-state': dailyStateModal,
    reason: reasonModal,
    disagree: disagreeModal,
    'task-detail': () => showTaskDetail(button.dataset.task),
    'close-modal': closeModal,
    'choose-mode': () => {
      state.mode = button.dataset.mode;
      document.querySelectorAll('.mode-option').forEach(option => {
        const active = option.dataset.mode === state.mode;
        option.classList.toggle('border-sage', active); option.classList.toggle('bg-sage-soft/65', active);
        option.classList.toggle('border-line', !active); option.classList.toggle('bg-white', !active);
        option.querySelector('.mode-check').innerHTML = active ? icon('circle-check','h-5 w-5') : icon('circle','h-5 w-5');
        option.querySelector('.mode-check').className = `mode-check ${active ? 'text-sage' : 'text-muted'}`;
      }); hydrateIcons();
    },
    'start-focus': startFocus,
    'toggle-timer': () => { state.paused = !state.paused; document.querySelector('#pause-label').textContent = state.paused ? '继续专注' : '暂停一下'; },
    'complete-task': completeTask,
    rest: () => { closeModal(); toast(`已留出 ${button.dataset.minutes} 分钟休息，不急着开始下一项`); },
    review: reviewModal,
    'save-review': () => { closeModal(); toast('今天已收尾，未完成的部分不会成为任务债'); },
    'save-state': () => { closeModal(); toast('已按当前状态重新压缩今日计划'); },
    'adjust-plan': () => { closeModal(); toast('已记录你的判断，今日顺序暂时按你选择调整'); },
    'temp-analyze': tempImpactModal,
    'temp-confirm': () => { closeModal(); toast('已加入临时任务，并移出低优先级事项'); },
    'parse-task': parseTaskModal,
    'accept-parsed': () => { document.querySelector('#capture-input').value = ''; closeModal(); toast('任务已加入任务池，尚未挤进今日计划'); },
    estimate: () => estimateModal(Number(button.dataset.pool)),
    'challenge-estimate': () => { closeModal(); toast('已保留你的质疑，下一次会同时显示两种估算'); },
    'progress-estimate': progressEstimateModal,
    backdrop: () => { if (event.target === button) closeModal(); }
  };
  actions[button.dataset.action]?.();
});

document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

renderTasks();
renderPool();
renderCurrentDate();
showPage('today');
hydrateIcons();
window.setInterval(renderCurrentDate, 60 * 1000);

if (document.modelContext?.registerTool) {
  document.modelContext.registerTool({
    name: 'open_temporary_task',
    description: '打开 StepFlow 临时任务输入窗口，让用户确认后再调整今天的计划。',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => { tempModal(); return { content: [{ type: 'text', text: '已打开临时任务窗口。' }] }; }
  });
}

// Lightweight live reload for the local static preview server.
const previewFiles = ['./index.html', './app.js'];
const previewSignatures = new Map();
async function watchPreviewFiles() {
  try {
    for (const file of previewFiles) {
      const response = await fetch(file, { method: 'HEAD', cache: 'no-store' });
      const signature = `${response.headers.get('last-modified')}-${response.headers.get('content-length')}`;
      if (previewSignatures.has(file) && previewSignatures.get(file) !== signature) {
        window.location.reload();
        return;
      }
      previewSignatures.set(file, signature);
    }
  } catch {
    // The preview may be briefly unavailable while the local server restarts.
  }
}
window.setInterval(watchPreviewFiles, 1200);
watchPreviewFiles();
