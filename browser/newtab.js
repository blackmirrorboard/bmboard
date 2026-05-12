// BMBrowser — new-tab launcher.
// The page is a vertical stack of widgets. In "edit" mode you can drag widgets
// to reorder them (handle ⠿), hide/re-add them, and edit bookmarks (↑↓✎✕).
// Everything the user customises lives in localStorage.

const APPS = {
  bmboard: 'https://bmboard.studio/app.html',
  atelier: 'https://atelistudio.com/',
  kodoco:  'https://kodoco.jp/',
  studio:  'https://99letters.github.io/',
};

// ── side panel ────────────────────────────────────────────
// Works both as the extension's new tab (real side panel) AND as a plain web
// page (e.g. served at bmboard.studio/browser/ — mobile, any browser). When
// there's no chrome.sidePanel, the CTA just opens BMBoard directly.
const HAS_SIDE_PANEL = (typeof chrome !== 'undefined' && chrome.sidePanel && typeof chrome.sidePanel.open === 'function');
let currentWindowId = null;
if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.getCurrent) {
  try { chrome.windows.getCurrent().then((w) => { currentWindowId = w?.id ?? null; }).catch(() => {}); } catch (_) {}
}
function openBoardPanel() {
  if (HAS_SIDE_PANEL) {
    try { chrome.sidePanel.open(currentWindowId != null ? { windowId: currentWindowId } : {}).catch((e) => { console.warn('[bmbrowser] sidePanel.open:', e); go(APPS.bmboard); }); }
    catch (e) { console.warn('[bmbrowser] sidePanel:', e); go(APPS.bmboard); }
  } else {
    go(APPS.bmboard);
  }
}

// ── helpers ───────────────────────────────────────────────
function go(url) { window.location.href = url; }
function looksLikeUrl(s) {
  if (/\s/.test(s)) return false;
  if (/^https?:\/\//i.test(s)) return true;
  if (/^localhost(:\d+)?(\/|$)/i.test(s)) return true;
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/.*)?$/i.test(s);
}
function normalizeUrl(u) { u = String(u).trim(); return /^https?:\/\//i.test(u) ? u : 'https://' + u; }
function search(q) { go('https://www.google.com/search?q=' + encodeURIComponent(q)); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }

// ── bookmarks + view state ────────────────────────────────
const BM_KEY = 'bm-browser.bookmarks.v1', VIEW_KEY = 'bm-browser.bookmarkView.v1';
const BM_DEFAULTS = [
  { label: 'BMBoard',  url: APPS.bmboard, icon: '▮' },
  { label: 'Ateli.er', url: APPS.atelier, icon: '✿' },
  { label: 'KODOCO',   url: APPS.kodoco,  icon: '◷' },
];
let bookmarks = (() => { const a = lsGet(BM_KEY); return Array.isArray(a) ? a.filter(b => b && b.url) : BM_DEFAULTS.map(b => ({ ...b })); })();
let bmView = (localStorage.getItem(VIEW_KEY) === 'ascii') ? 'ascii' : 'chips';
function saveBookmarks() { lsSet(BM_KEY, bookmarks); }
function saveView() { try { localStorage.setItem(VIEW_KEY, bmView); } catch (_) {} }

// ── widget state ──────────────────────────────────────────
const WIDGET_DEFS = { cta: { title: 'side panel' }, bookmarks: { title: 'bookmarks' }, memo: { title: 'memo' }, prompt: { title: 'command' }, news: { title: 'news' }, clock: { title: 'clock' } };
const WIDGET_ORDER_DEFAULT = ['cta', 'bookmarks', 'memo', 'prompt', 'news', 'clock'];
const WIDGETS_KEY = 'bm-browser.widgets.v1';
function loadWidgets() {
  const w = lsGet(WIDGETS_KEY) || {};
  const order = Array.isArray(w.order) ? w.order.filter(id => WIDGET_DEFS[id]) : [];
  for (const id of WIDGET_ORDER_DEFAULT) if (!order.includes(id)) order.push(id);   // new built-ins go to the end
  const hidden = new Set(Array.isArray(w.hidden) ? w.hidden.filter(id => WIDGET_DEFS[id]) : []);
  return { order, hidden };
}
function saveWidgets() { lsSet(WIDGETS_KEY, { order: widgetState.order, hidden: [...widgetState.hidden] }); }
let widgetState = loadWidgets();
let editMode = false;

const stackEl = document.getElementById('stack');
const editBtn = document.getElementById('edit-btn');
function widgetEl(id) { return stackEl.querySelector(`.widget[data-wid="${id}"]`); }

function applyWidgets() {
  for (const id of widgetState.order) {
    const el = widgetEl(id); if (!el) continue;
    stackEl.appendChild(el);                                       // re-append in order → reorder
    el.style.display = widgetState.hidden.has(id) ? 'none' : '';
  }
  document.body.classList.toggle('editing', editMode);
  editBtn.classList.toggle('active', editMode);
  editBtn.textContent = editMode ? '✓ done' : '✎ edit';
  stackEl.querySelectorAll('.w-handle').forEach((h) => { h.draggable = editMode; });
  renderAddBar();
  renderBookmarks();
}

function renderAddBar() {
  const bar = document.getElementById('add-bar');
  bar.innerHTML = '';
  if (!editMode) return;
  const label = document.createElement('span'); label.className = 'ab-label'; label.textContent = 'add widget:'; bar.appendChild(label);
  const hidden = widgetState.order.filter(id => widgetState.hidden.has(id));
  if (!hidden.length) { const e = document.createElement('span'); e.className = 'ab-empty'; e.textContent = '(all shown)'; bar.appendChild(e); return; }
  for (const id of hidden) {
    const b = document.createElement('span'); b.className = 'add-w'; b.textContent = '＋ ' + (WIDGET_DEFS[id]?.title || id);
    b.addEventListener('click', () => { widgetState.hidden.delete(id); saveWidgets(); applyWidgets(); });
    bar.appendChild(b);
  }
}

function toggleEdit() { editMode = !editMode; applyWidgets(); }

// hide buttons + drag wiring (once — widgets are static, edit mode just moves them)
stackEl.querySelectorAll('.widget').forEach((w) => {
  const id = w.dataset.wid;
  const hideBtn = w.querySelector('.w-hide');
  if (hideBtn) hideBtn.addEventListener('click', () => { widgetState.hidden.add(id); saveWidgets(); applyWidgets(); });

  const handle = w.querySelector('.w-handle');
  if (handle) {
    handle.addEventListener('dragstart', (e) => {
      if (!editMode) { e.preventDefault(); return; }
      draggedWid = id; w.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', id); } catch (_) {}
      try { e.dataTransfer.setDragImage(w, 12, 12); } catch (_) {}
    });
    handle.addEventListener('dragend', () => {
      w.classList.remove('dragging');
      stackEl.querySelectorAll('.widget').forEach((x) => x.classList.remove('drop-before', 'drop-after'));
      draggedWid = null;
    });
  }
  w.addEventListener('dragover', (e) => {
    if (!editMode || !draggedWid || w.dataset.wid === draggedWid) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    const r = w.getBoundingClientRect(); const after = e.clientY > r.top + r.height / 2;
    w.classList.toggle('drop-after', after); w.classList.toggle('drop-before', !after);
  });
  w.addEventListener('dragleave', () => { w.classList.remove('drop-before', 'drop-after'); });
  w.addEventListener('drop', (e) => {
    if (!editMode || !draggedWid || w.dataset.wid === draggedWid) return;
    e.preventDefault();
    const r = w.getBoundingClientRect(); const after = e.clientY > r.top + r.height / 2;
    const ord = widgetState.order.filter(x => x !== draggedWid);
    let idx = ord.indexOf(w.dataset.wid); if (after) idx += 1;
    ord.splice(Math.max(0, idx), 0, draggedWid);
    widgetState.order = ord; saveWidgets();
    w.classList.remove('drop-before', 'drop-after');
    applyWidgets();
  });
});
let draggedWid = null;
editBtn.addEventListener('click', toggleEdit);

// ── ASCII art (5-row block font A–Z/0–9 + the BMBoard smiley) ─────────────
const ASCII_FONT = {
  A:[' ███ ','█   █','█████','█   █','█   █'], B:['████ ','█   █','████ ','█   █','████ '],
  C:[' ████','█    ','█    ','█    ',' ████'], D:['████ ','█   █','█   █','█   █','████ '],
  E:['█████','█    ','████ ','█    ','█████'], F:['█████','█    ','████ ','█    ','█    '],
  G:[' ████','█    ','█  ██','█   █',' ████'], H:['█   █','█   █','█████','█   █','█   █'],
  I:['█████','  █  ','  █  ','  █  ','█████'], J:['█████','   █ ','   █ ','█  █ ',' ██  '],
  K:['█   █','█  █ ','███  ','█  █ ','█   █'], L:['█    ','█    ','█    ','█    ','█████'],
  M:['█   █','██ ██','█ █ █','█   █','█   █'], N:['█   █','██  █','█ █ █','█  ██','█   █'],
  O:[' ███ ','█   █','█   █','█   █',' ███ '], P:['████ ','█   █','████ ','█    ','█    '],
  Q:[' ███ ','█   █','█ █ █','█  █ ',' ██ █'], R:['████ ','█   █','████ ','█  █ ','█   █'],
  S:[' ████','█    ',' ███ ','    █','████ '], T:['█████','  █  ','  █  ','  █  ','  █  '],
  U:['█   █','█   █','█   █','█   █',' ███ '], V:['█   █','█   █','█   █',' █ █ ','  █  '],
  W:['█   █','█   █','█ █ █','██ ██','█   █'], X:['█   █',' █ █ ','  █  ',' █ █ ','█   █'],
  Y:['█   █',' █ █ ','  █  ','  █  ','  █  '], Z:['█████','   █ ','  █  ',' █   ','█████'],
  0:[' ███ ','█  ██','█ █ █','██  █',' ███ '], 1:['  █  ',' ██  ','  █  ','  █  ','█████'],
  2:[' ███ ','█   █','   █ ','  █  ','█████'], 3:['████ ','    █','  ██ ','    █','████ '],
  4:['   █ ','  ██ ',' █ █ ','█████','   █ '], 5:['█████','█    ','████ ','    █','████ '],
  6:[' ████','█    ','████ ','█   █',' ███ '], 7:['█████','   █ ','  █  ',' █   ','█    '],
  8:[' ███ ','█   █',' ███ ','█   █',' ███ '], 9:[' ███ ','█   █',' ████','    █','███  '],
};
const SMILEY_ART = ['╭─────────╮', '│  ▲   ▲  │', '│         │', '│ ╲     ╱ │', '│  ╲___╱  │', '╰─────────╯'].join('\n');
function letterArt(ch) {
  const g = ASCII_FONT[String(ch).toUpperCase()];
  return g ? g.join('\n') : ['┌───┐', `│ ${ch} │`, '└───┘'].join('\n');
}
function bookmarkArt(b) {
  const url = (b.url || '').toLowerCase();
  if (/bmboard\.studio/.test(url) || /^bmboard$/i.test((b.label || '').replace(/[^a-z]/gi, ''))) return SMILEY_ART;
  const ch = ((b.label || b.url || '?').trim()[0]) || '?';
  return letterArt(ch);
}

// ── bookmark mutations ────────────────────────────────────
function moveBookmark(i, d) { const j = i + d; if (j < 0 || j >= bookmarks.length) return; [bookmarks[i], bookmarks[j]] = [bookmarks[j], bookmarks[i]]; saveBookmarks(); renderBookmarks(); }
function removeBookmark(i) { bookmarks.splice(i, 1); saveBookmarks(); renderBookmarks(); }
function editBookmark(i) {
  const b = bookmarks[i];
  const label = (window.prompt('name:', b.label || '') || '').trim(); if (!label) return;
  let url = (window.prompt('url:', b.url || '') || '').trim(); if (!url) return;
  b.label = label.slice(0, 40); b.url = normalizeUrl(url);
  saveBookmarks(); renderBookmarks();
}
function addBookmark() {
  const label = (window.prompt('bookmark name:') || '').trim(); if (!label) return;
  let url = (window.prompt('url (https:// は省略可):') || '').trim(); if (!url) return;
  bookmarks.push({ label: label.slice(0, 40), url: normalizeUrl(url), icon: '◦' });
  saveBookmarks(); renderBookmarks();
}

// ── render bookmarks ──────────────────────────────────────
function renderBookmarks() {
  const wrap = document.getElementById('bm');
  wrap.className = 'bm' + (bmView === 'ascii' ? ' ascii' : '');
  wrap.innerHTML = '';
  document.querySelectorAll('#bm-view [data-view]').forEach((s) => s.classList.toggle('active', s.dataset.view === bmView));
  if (!bookmarks.length) { const e = document.createElement('div'); e.className = 'bm-empty'; e.textContent = 'no bookmarks — ＋ add で追加'; wrap.appendChild(e); return; }

  const ctlsHTML = editMode
    ? `<button class="ctl up" title="up">↑</button><button class="ctl down" title="down">↓</button><button class="ctl ed" title="edit">✎</button><button class="ctl x" title="remove">✕</button>`
    : `<button class="x solo ctl" title="remove">✕</button>`;

  bookmarks.forEach((b, i) => {
    let el;
    if (bmView === 'ascii') {
      el = document.createElement('a'); el.className = 'aa-card'; el.href = b.url; el.title = b.url;
      el.style.animationDelay = (i * 60) + 'ms';
      el.innerHTML =
        `<pre class="aa">${esc(bookmarkArt(b))}</pre>` +
        `<span class="aa-name">${esc(b.label || b.url)}</span>` +
        (editMode ? `<span class="aa-ctls">${ctlsHTML}</span>` : `<button class="x solo ctl" title="remove">✕</button>`);
    } else {
      el = document.createElement('a'); el.className = 'bk'; el.href = b.url; el.title = b.url;
      el.innerHTML = `<span class="i">${esc(b.icon || '◦')}</span><span class="l">${esc(b.label || b.url)}</span>${ctlsHTML}`;
    }
    el.addEventListener('click', (ev) => {
      const t = ev.target.closest('.ctl');
      if (t) {
        ev.preventDefault();
        if (t.classList.contains('up')) moveBookmark(i, -1);
        else if (t.classList.contains('down')) moveBookmark(i, 1);
        else if (t.classList.contains('ed')) editBookmark(i);
        else if (t.classList.contains('x')) removeBookmark(i);
        return;
      }
      ev.preventDefault(); go(b.url);
    });
    wrap.appendChild(el);
  });
}

function setView(v) { bmView = (v === 'ascii') ? 'ascii' : 'chips'; saveView(); renderBookmarks(); }

// ── command prompt ────────────────────────────────────────
function runCommand(raw) {
  const input = raw.trim(); if (!input) return;
  const [verb, ...rest] = input.split(/\s+/);
  const v = verb.toLowerCase(); const arg = rest.join(' ');
  switch (v) {
    case 'board': case 'panel': case 'bp': case 'side': openBoardPanel(); return;
    case 'bm': case 'bmb': case 'bmboard': case 'blackboard': go(APPS.bmboard); return;
    case 'at': case 'atelier': case 'atelistudio': go(APPS.atelier); return;
    case 'ko': case 'kodoco': go(APPS.kodoco); return;
    case 'studio': case 'home': case 'index': case '99letters': go(APPS.studio); return;
    case 'add': case 'bookmark': addBookmark(); return;
    case 'edit': toggleEdit(); return;
    case 'ascii': case 'chips': setView(v); return;
    case 'view': setView(bmView === 'ascii' ? 'chips' : 'ascii'); return;
    case 'help': case '?': case 'h': document.getElementById('help').classList.toggle('show'); return;
    case 'g': case 's': case 'search': if (arg) search(arg); return;
  }
  if (looksLikeUrl(input)) { go(normalizeUrl(input)); return; }
  search(input);
}

// ── wire up ───────────────────────────────────────────────
document.getElementById('open-panel').addEventListener('click', openBoardPanel);
document.getElementById('bm-add').addEventListener('click', addBookmark);
document.querySelectorAll('#bm-view [data-view]').forEach((s) => s.addEventListener('click', () => setView(s.dataset.view)));

const cmd = document.getElementById('cmd');
cmd.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  { e.preventDefault(); runCommand(cmd.value); cmd.value = ''; }
  if (e.key === 'Escape') { cmd.value = ''; document.getElementById('help').classList.remove('show'); }
});

// ── widget: memo (scratchpad, auto-saved to localStorage) ──
const MEMO_KEY = 'bm-browser.memo.v1';
const memoTa = document.getElementById('memo-ta');
if (memoTa) {
  try { memoTa.value = localStorage.getItem(MEMO_KEY) || ''; } catch (_) {}
  memoTa.addEventListener('input', () => { try { localStorage.setItem(MEMO_KEY, memoTa.value); } catch (_) {} });
}

// ── widget: news ticker (Hacker News front page — CORS-friendly, hacker vibe) ──
const NEWS_KEY = 'bm-browser.news.v1';
const NEWS_URL = 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=18';
let newsItems = [];
function loadNewsCache() { const c = lsGet(NEWS_KEY); if (c && Array.isArray(c.items) && c.items.length) { newsItems = c.items; return c.fetchedAt || 0; } return 0; }
function saveNewsCache() { lsSet(NEWS_KEY, { items: newsItems, fetchedAt: Date.now() }); }
function renderNews(msg) {
  const track = document.getElementById('ticker-track'); if (!track) return;
  if (msg) { track.style.animation = 'none'; track.innerHTML = `<span class="tk-msg">${esc(msg)}</span>`; return; }
  if (!newsItems.length) { track.style.animation = 'none'; track.innerHTML = `<span class="tk-msg">no news yet — ↻</span>`; return; }
  const seq = newsItems.map((it) => {
    const url = it.url || `https://news.ycombinator.com/item?id=${it.objectID || ''}`;
    return `<a class="tk-item" href="${esc(url)}" title="${esc(it.title || '')}">${esc(it.title || '?')}${it.points ? `<span class="pt">▲${it.points}</span>` : ''}</a><span class="tk-sep">·</span>`;
  }).join('');
  track.style.animation = '';        // back to the CSS-defined scroll
  track.innerHTML = seq + seq;       // doubled → seamless loop with translateX(-50%)
}
async function fetchNews() {
  if (!newsItems.length) renderNews('loading news…');
  try {
    const res = await fetch(NEWS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const hits = Array.isArray(data.hits) ? data.hits : [];
    const items = hits.filter((h) => h.title).map((h) => ({ title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, points: h.points || 0, objectID: h.objectID }));
    if (!items.length) throw new Error('empty feed');
    newsItems = items; saveNewsCache(); renderNews();
  } catch (e) {
    console.warn('[bmbrowser] news fetch:', e);
    if (!newsItems.length) renderNews('news unavailable — ↻ で再試行'); else renderNews();
  }
}
{
  const cachedAt = loadNewsCache();
  renderNews();                                                  // show cached headlines instantly
  if (Date.now() - cachedAt > 15 * 60 * 1000) fetchNews();       // refresh in background if stale (>15 min)
  document.getElementById('news-refresh')?.addEventListener('click', fetchNews);
  setInterval(fetchNews, 20 * 60 * 1000);                        // and periodically while the tab stays open
}

// standalone web page (no side panel): re-label the CTA accordingly
if (!HAS_SIDE_PANEL) {
  const cta = document.getElementById('open-panel');
  if (cta) {
    const t1 = cta.querySelector('.t1'), t2 = cta.querySelector('.t2'), kbd = cta.querySelector('.kbd'), ico = cta.querySelector('.ico');
    if (t1) t1.textContent = 'open BMBoard';
    if (t2) t2.textContent = '無限キャンバスの黒板を開く';
    if (kbd) kbd.textContent = '→';
    if (ico) ico.textContent = '▮';
    cta.title = 'open BMBoard';
  }
  const wt = document.querySelector('.widget[data-wid="cta"] .w-title');
  if (wt) wt.textContent = 'BMBoard';
}

applyWidgets();   // initial layout (also renders bookmarks)

// ── clock ─────────────────────────────────────────────────
function tick() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const el = document.getElementById('clock');
  if (el) el.textContent = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${days[d.getDay()]} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
tick(); setInterval(tick, 15_000);

try { cmd.focus({ preventScroll: true }); } catch (_) { try { cmd.focus(); } catch (__) {} }
