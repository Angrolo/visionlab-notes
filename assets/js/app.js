/* VisionLab Notes. Read AGENTS.md before making changes. No build step required. */
(() => {
  'use strict';
  const app = document.querySelector('#app');
  const menu = document.querySelector('#category-menu');
  let db = null;
  let activeCategory = 'all';
  let searchText = '';
  const articleCache = new Map();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const q = value => encodeURIComponent(value);
  const category = id => db.categories.find(c => c.id === id);
  const badge = c => `<span class="chip" data-tone="${esc(c.tone)}">${esc(c.icon)} ${esc(c.label)}</span>`;
  const route = () => decodeURIComponent(location.hash || '#/');
  const byCategory = id => db.articles.filter(a => a.category === id).length;

  async function init() {
    try {
      const response = await fetch('content/index.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      db = await response.json();
      document.querySelector('#all-count').textContent = db.articles.length;
      menu.innerHTML = db.categories.map(c => `<a href="#/?category=${q(c.id)}" class="side-link" data-category="${esc(c.id)}"><span class="side-icon" aria-hidden="true">${esc(c.icon)}</span><span>${esc(c.label)}</span><span class="side-count">${byCategory(c.id)}</span></a>`).join('');
      window.addEventListener('hashchange', render);
      render();
    } catch (error) {
      app.innerHTML = `<div class="error-state"><h2>筆記載入失敗</h2><p>請確認使用 http://localhost 或 GitHub Pages 開啟網站，而不是直接用 file:// 開啟 index.html。</p><p>錯誤：${esc(error.message)}</p><a href="./">重新載入</a></div>`;
    }
  }

  function setSidebar() {
    document.querySelectorAll('[data-category]').forEach(node => {
      const isActive = node.dataset.category === activeCategory;
      node.classList.toggle('active', isActive);
      if (isActive) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });
  }

  function card(article, index) {
    const c = category(article.category);
    return `<a href="#/article/${q(article.slug)}" class="article-card" aria-label="閱讀：${esc(article.title)}">
      <div class="card-top">${badge(c)}<span class="card-index">NO. ${String(index + 1).padStart(2,'0')}</span></div>
      <h3>${esc(article.title)}</h3><p class="card-desc">${esc(article.summary)}</p>
      <div class="card-bottom"><div class="card-meta"><span>◷ ${esc(article.minutes)} 分鐘</span><span>✦ ${esc(article.level)}</span></div><span class="card-arrow">↗</span></div>
    </a>`;
  }

  function home() {
    const params = new URLSearchParams((route().split('?')[1] || ''));
    const requested = params.get('category') || 'all';
    const nextCategory = requested === 'all' || category(requested) ? requested : 'all';
    if (nextCategory !== activeCategory) searchText = '';
    activeCategory = nextCategory;
    setSidebar();
    const filtered = db.articles.filter(a => activeCategory === 'all' || a.category === activeCategory);
    app.innerHTML = `
      <section class="hero" aria-label="網站介紹"><div class="hero-copy"><div class="hero-badge">BUILD YOUR VISION, ONE NOTE AT A TIME</div>
      <h1>讓影像辨識，<br><em>從概念走向實作。</em></h1>
      <p>用有系統的知識筆記，拆解 YOLO 模型、資料標註與瑕疵偵測。每一次學習，都有跡可循。</p>
      <a class="hero-btn" href="#notes">開始探索筆記 <span>↗</span></a></div>
      <div class="hero-art"><img src="assets/img/vision-demo.svg" alt="以邊界框標示物件的影像辨識示意圖"></div></section>
      <section class="stats-grid" aria-label="知識庫概況"><div class="stat"><div class="stat-icon">▤</div><div><strong>${db.articles.length.toString().padStart(2,'0')}</strong><p>主題筆記</p></div></div>
      <div class="stat"><div class="stat-icon">◈</div><div><strong>${db.categories.length.toString().padStart(2,'0')}</strong><p>學習分類</p></div></div>
      <div class="stat"><div class="stat-icon">✳</div><div><strong>∞</strong><p>持續擴充</p></div></div></section>
      <section id="notes"><div class="section-header"><div><span class="eyebrow">EXPLORE THE LIBRARY</span><h2>精選學習筆記</h2></div><p>依照主題找到適合你的下一步</p></div>
      <div class="toolbar"><div class="filter-tabs" id="filters"><button class="filter-btn${activeCategory === 'all' ? ' selected' : ''}" data-filter="all" type="button">全部內容</button>
      ${db.categories.map(c => `<button class="filter-btn${activeCategory === c.id ? ' selected' : ''}" data-filter="${esc(c.id)}" type="button">${esc(c.label)}</button>`).join('')}</div>
      <label class="search-wrap"><input id="site-search" type="search" placeholder="搜尋筆記關鍵字…" aria-label="搜尋筆記" value="${esc(searchText)}"></label></div>
      <div id="cards" class="article-grid"></div></section>
      <section class="about-panel" id="about"><div><span class="eyebrow">A SYSTEM THAT GROWS</span><h3>不只是網站，更是一套能持續擴充的規則。</h3><p>每篇文章使用相同資料結構，交由共用程式自動產生頁面。搭配 AGENTS.md 的開發規範，AI 能快速新增主題、維持風格，並降低後續維護成本。</p></div><div class="about-symbol" aria-hidden="true">✳</div></section>`;
    document.querySelector('#site-search').addEventListener('input', evt => { searchText = evt.target.value; updateCards(); });
    document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
      const next = b.dataset.filter;
      location.hash = next === 'all' ? '#/' : `#/?category=${q(next)}`;
      if (next === activeCategory) { activeCategory = next; updateCards(); }
    }));
    function updateCards() {
      const term = searchText.trim().toLocaleLowerCase('zh-Hant');
      const items = filtered.filter(a => !term || `${a.title} ${a.summary} ${category(a.category).label}`.toLocaleLowerCase('zh-Hant').includes(term));
      document.querySelector('#cards').innerHTML = items.length ? items.map(a => card(a, db.articles.indexOf(a))).join('') : '<div class="empty-state" style="grid-column:1/-1"><strong>還沒有找到相符筆記</strong><p>試試不同關鍵字，或切換分類。</p></div>';
    }
    updateCards();
    document.title = 'VisionLab Notes｜YOLO 影像辨識知識庫';
  }

  function sectionHtml(section, idx) {
    switch (section.type) {
      case 'heading': return `<h2 id="section-${idx}">${esc(section.text)}</h2>`;
      case 'paragraph': return `<p>${esc(section.text)}</p>`;
      case 'list': return `<ul>${section.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
      case 'checklist': return `<ul class="checklist">${section.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
      case 'callout': return `<aside class="callout"><strong>${esc(section.title)}</strong><p>${esc(section.text)}</p></aside>`;
      case 'code': return `<div class="code-label">${esc(section.language)}</div><pre><code>${esc(section.code)}</code></pre>`;
      default: return '';
    }
  }

  async function detail(slug) {
    const a = db.articles.find(item => item.slug === slug);
    if (!a) { app.innerHTML = '<div class="error-state"><h2>找不到這篇筆記</h2><p>文章可能已移動或尚未建立。</p><a href="#/">返回首頁</a></div>'; return; }
    activeCategory = a.category;
    setSidebar();
    app.innerHTML = '<div class="loading-state"><span class="spinner"></span><p>正在開啟筆記…</p></div>';
    try {
      if (!articleCache.has(slug)) {
        const response = await fetch(`content/articles/${q(slug)}.json`, {cache:'no-cache'});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        articleCache.set(slug, await response.json());
      }
      if (route() !== `#/article/${slug}`) return;
      const data = articleCache.get(slug);
      const c = category(a.category);
      const headings = data.sections.map((s,i) => ({...s,i})).filter(s => s.type === 'heading');
      const next = db.articles[(db.articles.indexOf(a) + 1) % db.articles.length];
      app.innerHTML = `<nav class="breadcrumb" aria-label="麵包屑"><a href="#/">首頁</a><span>›</span><a href="#/?category=${q(c.id)}">${esc(c.label)}</a><span>›</span><span>文章閱讀</span></nav>
       <article><header class="article-head">${badge(c)}<h1>${esc(a.title)}</h1><p>${esc(a.summary)}</p>
       <div class="detail-meta"><span>◷ 閱讀時間 ${esc(a.minutes)} 分鐘</span><span>✦ ${esc(a.level)}</span><span>▦ 更新日期 ${esc(a.updated)}</span></div></header>
       <div class="detail-layout"><div class="article-body">${data.sections.map(sectionHtml).join('')}</div><aside class="toc" aria-label="文章目錄"><p class="toc-title">本篇目錄</p>${headings.map(h => `<a href="#section-${h.i}" data-toc="${h.i}">${esc(h.text)}</a>`).join('')}</aside></div>
       </article><div class="detail-bottom"><a class="back-btn" href="#/">← 回到筆記列表</a><a class="next-btn" href="#/article/${q(next.slug)}">下一篇：${esc(next.title)} ↗</a></div>`;
      // TOC links scroll to headings without breaking the hash router.
      app.querySelectorAll('[data-toc]').forEach(link => link.addEventListener('click', e => {
        e.preventDefault();
        document.getElementById(`section-${link.dataset.toc}`)?.scrollIntoView({behavior:'smooth',block:'start'});
      }));
      document.title = `${a.title}｜VisionLab Notes`;
    } catch (error) {
      app.innerHTML = `<div class="error-state"><h2>文章載入失敗</h2><p>${esc(error.message)}</p><a href="#/">返回首頁</a></div>`;
    }
  }

  function render() {
    if (!db) return;
    const path = route();
    if (path === '#about' || path === '#notes') {
      home();
      requestAnimationFrame(() => document.getElementById(path.slice(1))?.scrollIntoView({behavior:'smooth',block:'start'}));
      return;
    }
    if (path.startsWith('#/article/')) detail(path.slice('#/article/'.length).split('?')[0]);
    else home();
    window.scrollTo({top:0,behavior:'instant'});
  }
  init();
})();
