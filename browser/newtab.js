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

// ── theme (light / dark — applied ASAP to minimise flash) ──
const THEME_KEY = 'bm-browser.theme.v1';
let theme = (localStorage.getItem(THEME_KEY) === 'light') ? 'light' : 'dark';
function applyTheme() {
  document.body.classList.toggle('light', theme === 'light');
  const b = document.getElementById('th-btn');
  if (b) b.textContent = (theme === 'light') ? '☾' : '☀';   // shows the mode you'd switch TO
}
function setTheme(t) { theme = (t === 'light') ? 'light' : 'dark'; try { localStorage.setItem(THEME_KEY, theme); } catch (_) {} applyTheme(); }
function toggleTheme() { setTheme(theme === 'light' ? 'dark' : 'light'); }
applyTheme();

// ── background picker (selectable patterns + custom image URL) ──
const BG_KEY = 'bm-browser.bg.v1';
const BG_VEIL_KEY = 'bm-browser.bgVeil.v1';   // user-adjustable darkness of the overlay on image backgrounds
const BG_OPTIONS = [
  { id: 'none', label: 'なし' }, { id: 'grid', label: 'グリッド' },
  { id: 'stars', label: '星空' }, { id: 'glow', label: 'グロウ' },
  { id: 'mtn-aerial', label: '山（空撮）' }, { id: 'mtn-snow', label: '雪山' },
  { id: 'custom', label: '画像' },
];
// ids applyBg() recognizes as built-in backgrounds (patterns + bundled photos)
const BG_PATTERNS = ['grid', 'stars', 'glow', 'mtn-aerial', 'mtn-snow'];
// A Google Drive / Dropbox *share* link points at an HTML page, not the image —
// so `background-image: url(...)` shows nothing. Convert common share links to a
// direct image URL (same trick Atelier uses for image blocks).
function _bgDirectUrl(u) {
  u = (u || '').trim();
  let m = u.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (m) return 'https://lh3.googleusercontent.com/d/' + m[1] + '=w2000';
  m = u.match(/[?&]id=([^&]+)/);
  if (m && u.indexOf('drive.google.com') !== -1) return 'https://lh3.googleusercontent.com/d/' + m[1] + '=w2000';
  if (u.indexOf('dropbox.com') !== -1) {
    u = u.replace('dl.dropboxusercontent.com', 'www.dropbox.com');
    if (/[?&](dl|raw)=/.test(u)) u = u.replace(/([?&])(?:dl|raw)=[^&#]*/, '$1raw=1');
    else u += (u.indexOf('?') !== -1 ? '&' : '?') + 'raw=1';
    return u;
  }
  return u;
}
let bgSetting = localStorage.getItem(BG_KEY) || 'none';
function applyBg() {
  Array.from(document.body.classList).forEach((c) => { if (c.indexOf('bg-') === 0 || c === 'has-bg') document.body.classList.remove(c); });
  document.body.style.removeProperty('--custom-bg');
  document.body.style.backgroundImage = '';
  if (bgSetting && bgSetting.indexOf('custom:') === 0) {
    document.body.classList.add('bg-custom', 'has-bg');
    document.body.style.setProperty('--custom-bg', 'url("' + _bgDirectUrl(bgSetting.slice(7)).replace(/["\\\n]/g, '') + '")');
  } else if (BG_PATTERNS.includes(bgSetting)) {
    document.body.classList.add('bg-' + bgSetting, 'has-bg');
  }
}
function setBg(v) { bgSetting = v || 'none'; try { localStorage.setItem(BG_KEY, bgSetting); } catch (_) {} applyBg(); }
// overlay darkness on image backgrounds — 0..1, unset = theme default (.52 dark / .6 light, from CSS)
let bgVeil = parseFloat(localStorage.getItem(BG_VEIL_KEY));
function applyBgVeil() {
  if (isNaN(bgVeil)) document.body.style.removeProperty('--bg-veil');
  else document.body.style.setProperty('--bg-veil', String(bgVeil));
}
function setBgVeil(v) { bgVeil = parseFloat(v); try { localStorage.setItem(BG_VEIL_KEY, String(bgVeil)); } catch (_) {} applyBgVeil(); }
function _bgVeilDefault() { return document.body.classList.contains('light') ? 0.6 : 0.52; }
applyBg(); applyBgVeil();
function openBgModal() {
  const ov = document.createElement('div'); ov.className = 'wg-ov';
  const card = document.createElement('div'); card.className = 'wg-card';
  const isCustom = bgSetting.indexOf('custom:') === 0;
  const tiles = () => BG_OPTIONS.map((o) => {
    const active = (o.id === 'custom') ? isCustom : (bgSetting === o.id);
    const pv = (o.id === 'none') ? 'pv-none' : (o.id === 'custom') ? 'pv-custom' : 'pv-' + o.id;
    return `<div class="bg-tile${active ? ' on' : ''}" data-bg="${o.id}"><div class="bg-pv ${pv}"></div><span class="bg-lbl">${esc(o.label)}</span></div>`;
  }).join('');
  card.innerHTML =
    `<div class="wg-h">◼ BACKGROUND</div>` +
    `<div class="wg-sub">背景を選ぶ。昔のサイトみたいに。</div>` +
    `<div class="bg-tiles">${tiles()}</div>` +
    `<div class="bg-custom-row"><span class="bg-cl">画像URL</span><input class="bg-url" id="bg-url" type="text" placeholder="https://… の画像URL" value="${esc(isCustom ? bgSetting.slice(7) : '')}"><button class="bg-set" id="bg-set">使う</button></div>` +
    `<div class="bg-veil-row"><span class="bg-cl">背景の暗さ</span><input type="range" id="bg-veil" min="0" max="0.85" step="0.05" value="${isNaN(bgVeil) ? _bgVeilDefault() : bgVeil}"><span class="bg-vv" id="bg-veil-v">${Math.round((isNaN(bgVeil) ? _bgVeilDefault() : bgVeil) * 100)}</span></div>` +
    `<div class="wg-foot"><button class="wg-done">done</button></div>`;
  ov.appendChild(card); document.body.appendChild(ov);
  const close = () => { try { document.body.removeChild(ov); } catch (_) {} };
  const useUrl = () => { const u = (card.querySelector('#bg-url').value || '').trim(); if (u) { setBg('custom:' + u); close(); } };
  const wireTiles = () => card.querySelectorAll('.bg-tile').forEach((t) => t.addEventListener('click', () => {
    if (t.dataset.bg === 'custom') { card.querySelector('#bg-url').focus(); return; }
    setBg(t.dataset.bg);
    card.querySelector('.bg-tiles').innerHTML = tiles(); wireTiles();
  }));
  wireTiles();
  card.querySelector('#bg-set').addEventListener('click', useUrl);
  card.querySelector('#bg-url').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); useUrl(); } });
  card.querySelector('#bg-veil').addEventListener('input', (e) => { setBgVeil(e.target.value); card.querySelector('#bg-veil-v').textContent = Math.round(parseFloat(e.target.value) * 100); });
  card.querySelector('.wg-done').addEventListener('click', close);
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
}

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
const WIDGET_DEFS = {
  location:  { title: '現在地',      icon: '⌖', desc: '現在地ON/OFF — 天気・時計・ニュース・相場が連動' },
  cta:       { title: 'side panel', icon: '▤', desc: 'BMBoard をサイドパネルで開く（⌘⇧Y）' },
  bookmarks: { title: 'bookmarks',  icon: '▦', desc: '編集できるブックマーク（chips / ascii）' },
  memo:      { title: 'memo',       icon: '✎', desc: '自動保存のスクラッチパッド' },
  prompt:    { title: 'command',    icon: '›', desc: 'コマンド / URL / 検索' },
  news:      { title: 'news',       icon: '◷', desc: 'ニュース（HN / Yahoo / NHK · 1行 / 一覧）' },
  weather:   { title: 'weather',    icon: '☁', desc: '天気（ASCII アイコン + 気温 + 最高/最低）' },
  markets:   { title: 'markets',    icon: '₿', desc: '相場ティッカー（BTC/ETH/SOL · 24h% + 7日 ASCII チャート）' },
  clock:     { title: 'clock',      icon: '⏱', desc: '時計（クリックで small / large / ascii）' },
  radio:     { title: 'ラジオ',      icon: '◉', desc: 'インターネットラジオ（SomaFM）+ ASCII スペクトラム' },
  pet:       { title: 'にこちゃん',  icon: '◡', desc: 'たまごっち風 — 時間帯で表情が変わる（クリックで mini / compact / full）' },
};
const WIDGET_ORDER_DEFAULT = ['location', 'cta', 'prompt', 'bookmarks', 'radio', 'news', 'memo', 'weather', 'markets', 'clock', 'pet'];
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
  stackEl.querySelectorAll('.w-handle').forEach((h) => { h.draggable = false; });   // drag is pointer-event based, not native DnD
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
// reorder a widget by one step, skipping hidden neighbours (works on touch — drag doesn't)
function moveWidget(id, delta) {
  const ord = widgetState.order.slice();
  const i = ord.indexOf(id); if (i < 0) return;
  let j = i + delta;
  while (j >= 0 && j < ord.length && widgetState.hidden.has(ord[j])) j += delta;
  if (j < 0 || j >= ord.length) return;
  [ord[i], ord[j]] = [ord[j], ord[i]];
  widgetState.order = ord; saveWidgets(); applyWidgets();
}

// ── widgets modal: pick which widgets to show ──
function openWidgetModal() {
  const ov = document.createElement('div'); ov.className = 'wg-ov';
  const card = document.createElement('div'); card.className = 'wg-card';
  const rowsHTML = () => widgetState.order.map((id) => {
    const d = WIDGET_DEFS[id]; if (!d) return '';
    const on = !widgetState.hidden.has(id);
    return `<div class="wg-row${on ? ' on' : ''}" data-id="${id}">
      <span class="wg-ck">${on ? '☑' : '☐'}</span>
      <span class="wg-ic">${esc(d.icon || '◦')}</span>
      <span class="wg-tx"><span class="wg-tt">${esc(d.title)}</span><span class="wg-de">${esc(d.desc || '')}</span></span>
    </div>`;
  }).join('');
  card.innerHTML =
    `<div class="wg-h">◼ WIDGETS</div>` +
    `<div class="wg-sub">表示するウィジェットを選ぶ。<br>並べ替えは <b style="color:var(--green-bright)">✎ edit</b> に入って ⠿ ドラッグ（PC）or ↑↓ ボタン（モバイルも）。</div>` +
    `<div class="wg-rows">${rowsHTML()}</div>` +
    `<div class="wg-foot"><button class="wg-done">done</button></div>`;
  ov.appendChild(card); document.body.appendChild(ov);
  const close = () => { try { document.body.removeChild(ov); } catch (_) {} };
  const wireRows = () => card.querySelectorAll('.wg-row').forEach((r) => r.addEventListener('click', () => {
    const id = r.dataset.id;
    if (widgetState.hidden.has(id)) widgetState.hidden.delete(id); else widgetState.hidden.add(id);
    saveWidgets(); applyWidgets();
    card.querySelector('.wg-rows').innerHTML = rowsHTML(); wireRows();
  }));
  wireRows();
  card.querySelector('.wg-done').addEventListener('click', close);
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
}

// hide / reorder wiring (once — widgets are static, edit mode just moves them).
// Drag-to-reorder uses Pointer Events so it works on mouse AND touch (HTML5 DnD
// doesn't do touch). The ⠿ handle is the grip. ↑↓ buttons stay as a precise/
// accessible alternative.
let dragWid = null, dragEl = null, dragStartY = 0, dragTarget = null, dragAfter = false;
function _clearDropMarks() { stackEl.querySelectorAll('.widget').forEach((x) => x.classList.remove('drop-before', 'drop-after')); }
stackEl.querySelectorAll('.widget').forEach((w) => {
  const id = w.dataset.wid;
  const bar = w.querySelector('.w-bar');
  const hideBtn = w.querySelector('.w-hide');
  if (bar && hideBtn) {
    const up = document.createElement('button'); up.className = 'w-up'; up.title = 'up'; up.textContent = '↑';
    const dn = document.createElement('button'); dn.className = 'w-down'; dn.title = 'down'; dn.textContent = '↓';
    bar.insertBefore(up, hideBtn); bar.insertBefore(dn, hideBtn);
    up.addEventListener('click', () => moveWidget(id, -1));
    dn.addEventListener('click', () => moveWidget(id, +1));
  }
  if (hideBtn) hideBtn.addEventListener('click', () => { widgetState.hidden.add(id); saveWidgets(); applyWidgets(); });

  const handle = w.querySelector('.w-handle');
  if (!handle) return;
  handle.addEventListener('pointerdown', (e) => {
    if (!editMode || (e.button != null && e.button > 0)) return;
    e.preventDefault();
    try { handle.setPointerCapture(e.pointerId); } catch (_) {}
    dragWid = id; dragEl = w; dragStartY = e.clientY; dragTarget = null; dragAfter = false;
    w.classList.add('dragging'); w.style.pointerEvents = 'none';
    document.body.classList.add('w-dragging');
  });
  handle.addEventListener('pointermove', (e) => {
    if (dragWid !== id) return;
    e.preventDefault();
    w.style.transform = 'translateY(' + (e.clientY - dragStartY) + 'px)';
    _clearDropMarks();
    const over = document.elementFromPoint(e.clientX, e.clientY);
    const tw = (over && over.closest) ? over.closest('.widget') : null;
    if (tw && tw !== w && tw.parentElement === stackEl && tw.style.display !== 'none') {
      const r = tw.getBoundingClientRect(); const after = e.clientY > r.top + r.height / 2;
      tw.classList.toggle('drop-after', after); tw.classList.toggle('drop-before', !after);
      dragTarget = tw.dataset.wid; dragAfter = after;
    } else { dragTarget = null; }
  });
  const endDrag = (e) => {
    if (dragWid !== id) return;
    try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
    w.classList.remove('dragging'); w.style.transform = ''; w.style.pointerEvents = '';
    document.body.classList.remove('w-dragging'); _clearDropMarks();
    if (dragTarget && dragTarget !== dragWid) {
      const ord = widgetState.order.filter((x) => x !== dragWid);
      let idx = ord.indexOf(dragTarget); if (dragAfter) idx += 1;
      ord.splice(Math.max(0, idx), 0, dragWid);
      widgetState.order = ord; saveWidgets();
    }
    dragWid = null; dragEl = null; dragTarget = null;
    applyWidgets();
  };
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);
});
editBtn.addEventListener('click', toggleEdit);
document.getElementById('wg-btn')?.addEventListener('click', openWidgetModal);
document.getElementById('th-btn')?.addEventListener('click', toggleTheme);
document.getElementById('bg-btn')?.addEventListener('click', openBgModal);

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
  ':':['     ','  █  ','     ','  █  ','     '], '.':['     ','     ','     ','     ','  █  '], ' ':['     ','     ','     ','     ','     '],
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
    case 'widgets': case 'wg': openWidgetModal(); return;
    case 'light': setTheme('light'); return;
    case 'dark': setTheme('dark'); return;
    case 'theme': toggleTheme(); return;
    case 'bg': case 'background': openBgModal(); return;
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

// ── widget: news (selectable source — HN / Yahoo!ニュース / NHK) ──────────
// In the extension, host_permissions:<all_urls> lets us fetch any feed directly.
// On the standalone web page, RSS feeds aren't CORS-friendly → go via a proxy.
const IS_EXTENSION = (typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id);
const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';   // reliable free CORS proxy for the standalone web build
const NEWS_SOURCES = {
  hn:     { label: 'HN',     type: 'hn',  url: 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20' },
  google: { label: 'Google', type: 'rss', url: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja' },
  nhk:    { label: 'NHK',    type: 'rss', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml' },
};
// 現在地ON → the Google source follows the detected country (per-user "今いる国" のニュース)
const CC_LANG = { JP:'ja', US:'en', GB:'en', CA:'en', AU:'en', NZ:'en', IE:'en', IN:'en', SG:'en', PH:'en', ZA:'en', FR:'fr', DE:'de', AT:'de', CH:'de', ES:'es', MX:'es-419', AR:'es-419', CL:'es-419', CO:'es-419', IT:'it', NL:'nl', BE:'nl', PT:'pt-PT', BR:'pt-BR', SE:'sv', NO:'no', DK:'da', FI:'fi', PL:'pl', CZ:'cs', RU:'ru', UA:'uk', TR:'tr', GR:'el', KR:'ko', CN:'zh-CN', TW:'zh-TW', HK:'zh-HK', TH:'th', ID:'id', VN:'vi', MY:'ms', AE:'ar', SA:'ar', EG:'ar', IL:'he' };
function googleNewsUrl() {
  let cc = ''; try { cc = geoCC(); } catch (_) {}
  if (cc) { const lang = CC_LANG[cc] || 'en'; return `https://news.google.com/rss?hl=${lang}&gl=${cc}&ceid=${cc}:${lang}`; }
  return NEWS_SOURCES.google.url;
}
const NEWS_VIEW_KEY = 'bm-browser.newsView.v1', NEWS_SOURCE_KEY = 'bm-browser.newsSource.v1';
let newsItems = [];
let newsView   = (localStorage.getItem(NEWS_VIEW_KEY) === 'list') ? 'list' : 'ticker';
let newsSource = NEWS_SOURCES[localStorage.getItem(NEWS_SOURCE_KEY)] ? localStorage.getItem(NEWS_SOURCE_KEY) : 'hn';
function newsCacheKey() {
  // geoCC() reads wxLoc, which is declared later (weather section) → still in the TDZ
  // when this runs from the news init block. Guard so the init doesn't throw.
  let cc = ''; try { cc = geoCC(); } catch (_) {}
  return 'bm-browser.news.v1.' + newsSource + ((newsSource === 'google' && cc) ? '.' + cc : '');
}
function loadNewsCache() { const c = lsGet(newsCacheKey()); if (c && Array.isArray(c.items) && c.items.length) { newsItems = c.items; return c.fetchedAt || 0; } newsItems = []; return 0; }
function saveNewsCache() { lsSet(newsCacheKey(), { items: newsItems, fetchedAt: Date.now() }); }
function newsUrl(it) { return it.url || (it.objectID ? `https://news.ycombinator.com/item?id=${it.objectID}` : '#'); }
function parseRss(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  let nodes = Array.from(doc.querySelectorAll('item'));
  if (!nodes.length) nodes = Array.from(doc.querySelectorAll('entry'));   // Atom
  return nodes.slice(0, 26).map((n) => {
    const t = (n.querySelector('title')?.textContent || '').trim();
    const lEl = n.querySelector('link');
    const u = (lEl && (lEl.getAttribute('href') || lEl.textContent || '')).trim();
    return { title: t, url: u, points: 0 };
  }).filter((x) => x.title && x.url);
}
function renderNews(msg) {
  const body = document.getElementById('news-body'); if (!body) return;
  document.querySelectorAll('#news-view [data-nv]').forEach((s) => s.classList.toggle('active', s.dataset.nv === newsView));
  document.querySelectorAll('#news-src [data-ns]').forEach((s) => s.classList.toggle('active', s.dataset.ns === newsSource));
  if (msg || !newsItems.length) { body.innerHTML = `<div class="news-msg">${esc(msg || 'no news yet — ↻')}</div>`; return; }
  if (newsView === 'list') {
    body.innerHTML = `<div class="news-list">` + newsItems.map((it) =>
      `<a class="nl-item" href="${esc(newsUrl(it))}" title="${esc(it.title || '')}"><span class="nl-t">${esc(it.title || '?')}</span>${it.points ? `<span class="nl-pt">▲${it.points}</span>` : ''}</a>`
    ).join('') + `</div>`;
  } else {
    const seq = newsItems.map((it) =>
      `<a class="tk-item" href="${esc(newsUrl(it))}" title="${esc(it.title || '')}">${esc(it.title || '?')}${it.points ? `<span class="pt">▲${it.points}</span>` : ''}</a><span class="tk-sep">·</span>`
    ).join('');
    body.innerHTML = `<div class="ticker"><div class="ticker-track">${seq + seq}</div></div>`;   // doubled → seamless loop
  }
}
function setNewsView(v) { newsView = (v === 'list') ? 'list' : 'ticker'; try { localStorage.setItem(NEWS_VIEW_KEY, newsView); } catch (_) {} renderNews(); }
function setNewsSource(s) {
  if (!NEWS_SOURCES[s] || s === newsSource) return;
  newsSource = s; try { localStorage.setItem(NEWS_SOURCE_KEY, s); } catch (_) {}
  loadNewsCache(); renderNews(); fetchNews();   // show that source's cache, then refresh
}
async function fetchNews() {
  const src = NEWS_SOURCES[newsSource] || NEWS_SOURCES.hn;
  if (!newsItems.length) renderNews('loading ' + src.label + ' …');
  try {
    const feedUrl = (newsSource === 'google') ? googleNewsUrl() : src.url;
    const target = (src.type === 'rss' && !IS_EXTENSION) ? CORS_PROXY + encodeURIComponent(feedUrl) : feedUrl;
    const res = await fetch(target, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    let items;
    if (src.type === 'hn') {
      const data = await res.json();
      items = (Array.isArray(data.hits) ? data.hits : []).filter((h) => h.title).map((h) => ({ title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, points: h.points || 0, objectID: h.objectID }));
    } else {
      items = parseRss(await res.text());
    }
    if (!items.length) throw new Error('empty feed');
    newsItems = items; saveNewsCache(); renderNews();
  } catch (e) {
    console.warn('[bmbrowser] news fetch:', e);
    if (!newsItems.length) renderNews(src.label + ' を取得できませんでした — ↻'); else renderNews();
  }
}
{
  const cachedAt = loadNewsCache();
  renderNews();                                                  // show cached headlines instantly
  if (Date.now() - cachedAt > 15 * 60 * 1000) fetchNews();       // refresh in background if stale (>15 min)
  document.getElementById('news-refresh')?.addEventListener('click', fetchNews);
  document.querySelectorAll('#news-view [data-nv]').forEach((s) => s.addEventListener('click', () => setNewsView(s.dataset.nv)));
  document.querySelectorAll('#news-src [data-ns]').forEach((s) => s.addEventListener('click', () => setNewsSource(s.dataset.ns)));
  setInterval(fetchNews, 20 * 60 * 1000);                        // and periodically while the tab stays open
}

// ── widget: weather + "現在地ON" (Open-Meteo — CORS-friendly, free, no key) ──
// Default = 大津・滋賀. Turning on 現在地 (geolocation) links place name + country
// + timezone (the clock) + forecast — all follow wherever you are.
const WX_KEY = 'bm-browser.weather.v1';
const GEO_KEY = 'bm-browser.geo.v1';   // { on, lat, lon, name, cc, tz }
const WX_DEFAULT_LOC = { lat: 35.0045, lon: 135.8686, name: '大津・滋賀', cc: 'JP', tz: 'Asia/Tokyo', geo: false };
function loadGeo() { const g = lsGet(GEO_KEY); return (g && g.on && g.lat != null && g.lon != null) ? g : null; }
let wxLoc = (() => { const g = loadGeo(); return g ? { lat: g.lat, lon: g.lon, name: g.name || '現在地', cc: g.cc || '', tz: g.tz || 'auto', geo: true } : { ...WX_DEFAULT_LOC }; })();
let clockTz = (wxLoc.geo && wxLoc.tz && wxLoc.tz !== 'auto') ? wxLoc.tz : null;   // null = browser-local
function geoCC() { return (wxLoc.geo && wxLoc.cc) ? String(wxLoc.cc).toUpperCase() : ''; }
function wxUrl() {
  const tz = wxLoc.geo ? 'auto' : encodeURIComponent(wxLoc.tz || 'Asia/Tokyo');
  return `https://api.open-meteo.com/v1/forecast?latitude=${wxLoc.lat}&longitude=${wxLoc.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=${tz}&forecast_days=1`;
}
async function reverseGeocode(lat, lon) {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ja`);
    if (!r.ok) return null;
    const d = await r.json();
    const city = d.city || d.locality || d.principalSubdivision || '';
    const country = d.countryName || '';
    const name = [city, country].filter(Boolean).join(' · ') || null;
    return { name, cc: (d.countryCode || '').toUpperCase() };
  } catch (_) { return null; }
}
function _geoBtnState() {
  const b = document.getElementById('wx-geo'); if (b) b.classList.toggle('active', !!wxLoc.geo);
  const hd = document.getElementById('wx-loc-hd'); if (hd) hd.textContent = wxLoc.name || '—';
  if (typeof renderLocation === 'function') renderLocation();
  // mkCurrency() reads MK_CUR (a const declared later in the markets section) — on the
  // very first render that const is still in the TDZ, so guard it. renderMarkets() sets
  // #mk-cur correctly once the markets section initialises.
  try { const mc = document.getElementById('mk-cur'); if (mc) mc.textContent = mkCurrency().toUpperCase(); } catch (_) {}
}
function _refreshGeoLinked() {   // re-pull weather/news/markets/clock after the location changes
  if (typeof tick === 'function') tick();
  fetchWeather();
  if (typeof fetchNews === 'function') { loadNewsCache(); renderNews(); fetchNews(); }
  if (typeof fetchMarkets === 'function') { mkItems = []; fetchMarkets(); }
}
function geoOff() {
  lsSet(GEO_KEY, { on: false });
  wxLoc = { ...WX_DEFAULT_LOC }; clockTz = null; wxData = null;
  _geoBtnState(); renderWeather('現在地OFF — 大津・滋賀に戻しました'); _refreshGeoLinked();
}
function geoOn() {
  if (!navigator.geolocation) { renderWeather('この環境では現在地を使えません'); setTimeout(() => renderWeather(), 2500); return; }
  renderWeather('現在地を取得中…（許可が必要です）');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = +pos.coords.latitude.toFixed(4), lon = +pos.coords.longitude.toFixed(4);
    const rg = (await reverseGeocode(lat, lon)) || {};
    const name = rg.name || '現在地', cc = rg.cc || '';
    wxLoc = { lat, lon, name, cc, tz: 'auto', geo: true }; clockTz = null; wxData = null;
    lsSet(GEO_KEY, { on: true, lat, lon, name, cc, tz: 'auto' });
    _geoBtnState(); renderWeather('天気を取得中…'); _refreshGeoLinked();   // weather also pulls the IANA tz → clock
  }, (err) => {
    console.warn('[bmbrowser] geolocation:', err);
    renderWeather(err && err.code === 1 ? '現在地の許可がありません' : '現在地を取得できませんでした');
    setTimeout(() => renderWeather(), 2800);
  }, { timeout: 9000, maximumAge: 10 * 60 * 1000 });
}
function toggleGeo() { wxLoc.geo ? geoOff() : geoOn(); }
function renderLocation() {
  const el = document.getElementById('loc-w'); if (!el) return;
  if (wxLoc.geo) {
    el.innerHTML = `<span class="loc-mark on">⌖</span><span class="loc-name">${esc(wxLoc.name)}</span><button class="loc-btn off" id="loc-toggle">現在地 OFF</button>`;
  } else {
    el.innerHTML = `<span class="loc-mark">·</span><span class="loc-name">${esc(WX_DEFAULT_LOC.name)} <span class="loc-def">（既定）</span></span><button class="loc-btn on" id="loc-toggle">⌖ 現在地 ON</button>`;
  }
  el.querySelector('#loc-toggle')?.addEventListener('click', toggleGeo);
}
renderLocation();
const WX_ART = {
  clear:  ['  \\|/  ', '--(o)--', '  /|\\  '],
  partly: [' \\|/.-.', '-o-(  )', '   (__)'],
  cloudy: ['  .-.  ', ' (   ) ', '(_____)'],
  fog:    [' ~~~~~ ', '  ~~~  ', ' ~~~~~ '],
  rain:   ['  .-.  ', ' (   ) ', " '  '  "],
  snow:   ['  .-.  ', ' (   ) ', ' * * * '],
  storm:  ['  .-.  ', ' (   ) ', "  /'/  "],
};
const WX_LABEL = { clear: '☀ 晴れ', partly: '⛅ 晴れときどき曇り', cloudy: '☁ くもり', fog: '🌫 霧', rain: '☂ 雨', snow: '❄ 雪', storm: '⚡ 雷雨' };
function wxCat(code) {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 95) return 'storm';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 86)) return 'rain';
  return 'cloudy';
}
const WX_SIZE_KEY = 'bm-browser.weatherSize.v1';
let weatherSize = ['s', 'm', 'l'].includes(localStorage.getItem(WX_SIZE_KEY)) ? localStorage.getItem(WX_SIZE_KEY) : 'm';
function setWeatherSize(s) { if (!['s', 'm', 'l'].includes(s)) return; weatherSize = s; try { localStorage.setItem(WX_SIZE_KEY, s); } catch (_) {} renderWeather(); }
let wxData = null;
function loadWxCache() { const c = lsGet(WX_KEY); if (c && c.data) { wxData = c.data; return c.fetchedAt || 0; } return 0; }
function saveWxCache() { lsSet(WX_KEY, { data: wxData, fetchedAt: Date.now() }); }
function renderWeather(msg) {
  const body = document.getElementById('wx-body'); if (!body) return;
  document.querySelectorAll('#wx-size [data-sz]').forEach((s) => s.classList.toggle('active', s.dataset.sz === weatherSize));
  _geoBtnState();
  if (msg || !wxData) { body.className = ''; body.innerHTML = `<div class="wx-msg">${esc(msg || 'no data yet — ↻')}</div>`; return; }
  body.className = 'wx-body sz-' + weatherSize;
  const cat = wxCat(wxData.code);
  const r = (n) => Math.round(Number(n));
  body.innerHTML =
    `<div class="wx-row"><pre class="wx-art">${esc((WX_ART[cat] || WX_ART.cloudy).join('\n'))}</pre>` +
    `<div class="wx-tx"><span class="wx-now">${r(wxData.temp)}°</span> <span class="wx-lbl">${esc(WX_LABEL[cat] || '')}</span><br>` +
    `<span class="wx-hl">H ${r(wxData.max)}° / L ${r(wxData.min)}°</span> <span class="wx-loc">· ${esc(wxLoc.name)}${wxLoc.geo ? ' ⌖' : ''}</span></div></div>`;
}
async function fetchWeather() {
  if (!wxData) renderWeather('loading weather…');
  try {
    const res = await fetch(wxUrl(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    const cur = d.current || {}, dly = d.daily || {};
    if (cur.temperature_2m == null) throw new Error('no data');
    wxData = { temp: cur.temperature_2m, code: (cur.weather_code != null ? cur.weather_code : (dly.weather_code && dly.weather_code[0]) || 3), max: (dly.temperature_2m_max && dly.temperature_2m_max[0]), min: (dly.temperature_2m_min && dly.temperature_2m_min[0]) };
    // when on 現在地, Open-Meteo's `timezone=auto` echoes back the IANA tz — link the clock to it
    if (wxLoc.geo && typeof d.timezone === 'string' && d.timezone && d.timezone !== 'auto') {
      wxLoc.tz = d.timezone; clockTz = d.timezone;
      lsSet(GEO_KEY, { on: true, lat: wxLoc.lat, lon: wxLoc.lon, name: wxLoc.name, tz: d.timezone });
      if (typeof tick === 'function') tick();
    }
    saveWxCache(); renderWeather();
  } catch (e) {
    console.warn('[bmbrowser] weather fetch:', e);
    if (!wxData) renderWeather('天気を取得できませんでした — ↻'); else renderWeather();
  }
}
{
  const at = loadWxCache();
  renderWeather();
  if (Date.now() - at > 30 * 60 * 1000) fetchWeather();
  document.getElementById('wx-refresh')?.addEventListener('click', fetchWeather);
  document.getElementById('wx-geo')?.addEventListener('click', toggleGeo);
  document.querySelectorAll('#wx-size [data-sz]').forEach((s) => s.addEventListener('click', () => setWeatherSize(s.dataset.sz)));
  setInterval(fetchWeather, 30 * 60 * 1000);
}

// ── widget: markets (crypto ticker via CoinGecko — CORS-friendly, free, no key) ──
// 現在地ON → priced in the local currency (per-user "今いる国" の通貨で表示)
const MK_KEY = 'bm-browser.markets.v1';
const MK_CUR = { JP:'jpy', US:'usd', GB:'gbp', CA:'cad', AU:'aud', NZ:'nzd', CH:'chf', SE:'sek', NO:'nok', DK:'dkk', PL:'pln', CZ:'czk', RU:'rub', UA:'uah', TR:'try', KR:'krw', CN:'cny', TW:'twd', HK:'hkd', SG:'sgd', TH:'thb', ID:'idr', VN:'vnd', MY:'myr', PH:'php', IN:'inr', BR:'brl', MX:'mxn', AR:'ars', CL:'clp', ZA:'zar', AE:'aed', SA:'sar', IL:'ils',
  FR:'eur', DE:'eur', ES:'eur', IT:'eur', NL:'eur', BE:'eur', AT:'eur', IE:'eur', PT:'eur', GR:'eur', FI:'eur' };
function mkCurrency() { const cc = geoCC(); return (cc && MK_CUR[cc]) ? MK_CUR[cc] : 'jpy'; }
function mkUrl() { return `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${mkCurrency()}&ids=bitcoin,ethereum,solana&sparkline=true&price_change_percentage=24h`; }
function fmtCur(n, cur) {
  cur = (cur || 'jpy').toUpperCase();
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0)); }
  catch (_) { return (cur === 'JPY' ? '¥' : cur + ' ') + Math.round(Number(n) || 0).toLocaleString(); }
}
const SPARK_CHARS = '▁▂▃▄▅▆▇█';
let mkItems = [];
function mkCacheKey() { return MK_KEY + '.' + mkCurrency(); }
function loadMkCache() { const c = lsGet(mkCacheKey()); if (c && Array.isArray(c.items) && c.items.length) { mkItems = c.items; return c.fetchedAt || 0; } mkItems = []; return 0; }
function saveMkCache() { lsSet(mkCacheKey(), { items: mkItems, fetchedAt: Date.now() }); }
function sparkline(arr, width) {
  if (!Array.isArray(arr) || arr.length < 2) return '';
  width = width || 32;
  const out = [];
  for (let i = 0; i < width; i++) {
    const a = Math.floor(i * arr.length / width), b = Math.max(a + 1, Math.floor((i + 1) * arr.length / width));
    let s = 0, n = 0; for (let j = a; j < b && j < arr.length; j++) { s += arr[j]; n++; }
    out.push(n ? s / n : arr[Math.min(a, arr.length - 1)]);
  }
  const lo = Math.min(...out), hi = Math.max(...out), range = (hi - lo) || 1;
  return out.map((v) => SPARK_CHARS[Math.min(7, Math.max(0, Math.round((v - lo) / range * 7)))]).join('');
}
function fmtJPY(n) { return '¥' + Math.round(Number(n) || 0).toLocaleString('ja-JP'); }
const MK_SIZE_KEY = 'bm-browser.marketsSize.v1';
let marketsSize = ['s', 'm', 'l'].includes(localStorage.getItem(MK_SIZE_KEY)) ? localStorage.getItem(MK_SIZE_KEY) : 'm';
function setMarketsSize(s) { if (!['s', 'm', 'l'].includes(s)) return; marketsSize = s; try { localStorage.setItem(MK_SIZE_KEY, s); } catch (_) {} renderMarkets(); }
function renderMarkets(msg) {
  const body = document.getElementById('mk-body'); if (!body) return;
  document.querySelectorAll('#mk-size [data-sz]').forEach((s) => s.classList.toggle('active', s.dataset.sz === marketsSize));
  if (msg || !mkItems.length) { body.className = ''; body.innerHTML = `<div class="mk-msg">${esc(msg || 'no data yet — ↻')}</div>`; return; }
  body.className = 'mk-body sz-' + marketsSize;
  const cur = mkCurrency();
  body.innerHTML = mkItems.map((it) => {
    const ch = (typeof it.ch === 'number') ? it.ch : 0;
    const chStr = (ch >= 0 ? '▲' : '▼') + Math.abs(ch).toFixed(1) + '%';
    return `<div class="mk-row"><span class="mk-sym">${esc(String(it.sym || '').toUpperCase())}</span><span class="mk-px">${esc(fmtCur(it.px, cur))}</span><span class="mk-ch ${ch >= 0 ? 'up' : 'down'}">${esc(chStr)}</span><span class="mk-spark" title="7日">${esc(sparkline(it.spark, 28))}</span></div>`;
  }).join('');
  const mc = document.getElementById('mk-cur'); if (mc) mc.textContent = cur.toUpperCase();
}
async function fetchMarkets() {
  if (!mkItems.length) renderMarkets('loading markets…');
  try {
    const res = await fetch(mkUrl(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error('empty');
    mkItems = data.map((c) => ({
      sym: c.symbol,
      px: c.current_price,
      ch: (c.price_change_percentage_24h_in_currency != null ? c.price_change_percentage_24h_in_currency : c.price_change_percentage_24h) || 0,
      spark: (c.sparkline_in_7d && Array.isArray(c.sparkline_in_7d.price)) ? c.sparkline_in_7d.price : [],
    }));
    saveMkCache(); renderMarkets();
  } catch (e) {
    console.warn('[bmbrowser] markets fetch:', e);
    if (!mkItems.length) renderMarkets('markets を取得できませんでした — ↻'); else renderMarkets();
  }
}
{
  const at = loadMkCache();
  renderMarkets();
  if (Date.now() - at > 10 * 60 * 1000) fetchMarkets();
  document.getElementById('mk-refresh')?.addEventListener('click', fetchMarkets);
  document.querySelectorAll('#mk-size [data-sz]').forEach((s) => s.addEventListener('click', () => setMarketsSize(s.dataset.sz)));
  setInterval(fetchMarkets, 12 * 60 * 1000);
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

// ── clock (click the clock to cycle styles: small → large → ascii) ───────
const CLOCK_STYLE_KEY = 'bm-browser.clockStyle.v1';
const CLOCK_STYLES = ['small', 'large', 'ascii'];
let clockStyle = CLOCK_STYLES.includes(localStorage.getItem(CLOCK_STYLE_KEY)) ? localStorage.getItem(CLOCK_STYLE_KEY) : 'small';
function bigDigits(s) {
  const ph = ['     ', '     ', '     ', '     ', '     '];
  const out = [];
  for (let i = 0; i < 5; i++) out.push(String(s).split('').map((c) => (ASCII_FONT[c] || ph)[i]).join(' '));
  return out.join('\n');
}
function tick() {
  const el = document.getElementById('clock'); if (!el) return;
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const p = (n) => String(n).padStart(2, '0');
  let date, time, suffix = '';
  if (clockTz) {   // 現在地ON → show that location's wall clock (linked to weather + place)
    try {
      const now = new Date();
      const num = new Intl.DateTimeFormat('en-GB', { timeZone: clockTz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
      const g = (t) => (num.find(x => x.type === t) || {}).value || '';
      const wd = new Intl.DateTimeFormat('ja-JP', { timeZone: clockTz, weekday: 'short' }).format(now);
      date = `${g('year')}.${g('month')}.${g('day')} ${wd}`;
      time = `${g('hour')}:${g('minute')}`;
      suffix = ' ⌖';
    } catch (_) { clockTz = null; }
  }
  if (!clockTz) {
    const d = new Date();
    date = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${days[d.getDay()]}`;
    time = `${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  el.className = 'clock-w s-' + clockStyle;
  if (clockStyle === 'large')      el.innerHTML = `<span class="ct">${esc(time)}</span><span class="cd">${esc(date + suffix)}</span>`;
  else if (clockStyle === 'ascii') el.innerHTML = `<span class="ca">${esc(bigDigits(time))}</span><span class="cd">${esc(date + suffix)}</span>`;
  else                             el.textContent = `${date}${suffix} · ${time}`;
}
function cycleClock() { clockStyle = CLOCK_STYLES[(CLOCK_STYLES.indexOf(clockStyle) + 1) % CLOCK_STYLES.length]; try { localStorage.setItem(CLOCK_STYLE_KEY, clockStyle); } catch (_) {} tick(); }
document.getElementById('clock')?.addEventListener('click', cycleClock);
tick(); setInterval(tick, 15_000);

// ── にこちゃん pet (BMBoard smiley — たまごっち風) — mood by time of day, blinks, fidgets ──
const PET_MODE_KEY = 'bm-browser.petMode.v1';
const PET_MODES = ['mini', 'compact', 'full'];
let petMode = PET_MODES.includes(localStorage.getItem(PET_MODE_KEY)) ? localStorage.getItem(PET_MODE_KEY) : 'compact';
let petBlink = false, petGrin = false, petHop = false, petSpark = 0, petPose = false, petPoseUntil = 0;
const PET_SPARKS = ['✦', '✧', '＊', '✺', '·', '✦', '＊', '✧'];
// big-reaction poses (a grin/burst — pet hops + glows). Lots of variety, incl. wide full-body ones.
const PET_GRINS = [
  { k: '\\( ＾▽＾ )/',         say: 'にこっ♪' },
  { k: '\\( ◕▽◕ )/',         say: 'わーい！' },
  { k: '( ＞ω＜ )',            say: 'えへへ' },
  { k: '\\( ＾ｗ＾ )/',         say: 'やっほー' },
  { k: '( ✧▽✧ )',            say: 'きらーん' },
  { k: 'ᕕ( ◕▿◕ )ᕗ',         say: 'るんるん' },
  { k: 'ᕦ( ◕▿◕ )ᕤ',         say: 'ふんっ！' },
  { k: '୧( ◕▽◕ )୨',         say: 'いえーい' },
  { k: '٩( ＾◡＾ )۶',         say: 'ばんざーい' },
  { k: '╰( ◕▿◕ )╯',         say: 'やったー' },
  { k: '⤜( ◕▿◕ )⤏',         say: 'びよーん' },
  { k: '(づ｡◕‿‿◕｡)づ',       say: 'ぎゅー' },
  { k: '( ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',    say: 'まほう！' },
  { k: 'ヽ(°〇°)ﾉ',            say: 'わお！' },
];
// idle "fidget" poses (shown briefly now and then — keeps the pet alive, たまごっち感)
const PET_IDLES = [
  { k: '( ◕ω◕ )',     say: '' },
  { k: '( ・ω・ )',     say: 'ふんふん' },
  { k: '( ´-` )',      say: 'ぼーっ' },
  { k: '( ◞・౪・)',    say: 'ふぅ' },
  { k: 'ᕙ( ⇀‸↼‶ )ᕗ',  say: 'むむ' },
  { k: '( ´◔ ‸◔` )',  say: 'んん？' },
  { k: '( ˃ ᵕ ˂ )',   say: 'てへ' },
  { k: 'ʕ•ᴥ•ʔ',       say: 'くまさん' },
  { k: '( ✿◕‿◕ )',    say: '' },
  { k: '( ⌐■_■ )',     say: 'クール' },
  { k: '~( ˘▾˘~)',    say: 'おどる' },
  { k: '(~˘▾˘)~',     say: 'ゆらゆら' },
  { k: 'ヽ( ◕▿◕ )ノ',   say: '' },
  { k: '( ◕▿◕ )ノ゛',   say: 'やぁ' },
  { k: '( ๑˃ᴗ˂ )ﻭ',   say: 'がんばろ' },
  { k: '( ˙꒳​˙ )',    say: '' },
];
let petGrinCur = PET_GRINS[0], petPoseCur = PET_IDLES[0];
function _petMood() {
  const h = new Date().getHours();
  if (h >= 23 || h < 5)  return { k: '( ˘ω˘ )',  say: 'すやすや…' };
  if (h < 9)             return { k: '( ◕▿◕ )',  say: 'おはよう！' };
  if (h < 12)            return { k: '( ´◡` )',  say: '今日もやろ' };
  if (h < 17)            return { k: '( •ᴗ• )',  say: '' };
  if (h < 20)            return { k: '( ◠‿◠ )',  say: 'おつかれさま' };
  return                        { k: '( ーωー )', say: 'そろそろ夜だね' };
}
function _petFace() {
  if (petGrin) return petGrinCur;
  if (petPose) return petPoseCur;
  const m = _petMood();
  if (petBlink) return { k: '( ーᴗー )', say: m.say };   // eyes closed
  return m;
}
function petRender() {
  const el = document.getElementById('pet'); if (!el) return;
  el.className = 'pet-w m-' + petMode + (petHop ? ' pet-hop' : '') + (petGrin ? ' pet-glee' : '');
  const f = _petFace();
  if (petMode === 'mini') {
    el.textContent = f.k;
  } else if (petMode === 'compact') {
    el.innerHTML = esc(f.k) + (f.say ? `<span class="ps">${esc(f.say)}</span>` : '');
  } else {
    el.innerHTML = `<span class="pspark">${esc(PET_SPARKS[petSpark % PET_SPARKS.length])}</span>` +
                   `<span class="pk">${esc(f.k)}</span>` +
                   `<span class="ps">${esc(f.say || '　')}</span>`;
  }
}
function petTick() {
  petSpark++;
  if (petPose && Date.now() > petPoseUntil) { petPose = false; petRender(); }
  if (petGrin || petPose) { if (petMode === 'full') petRender(); return; }
  const r = Math.random();
  if (r < 0.10) {                                    // big grin — random pose, hops, glows, then settles
    petGrinCur = PET_GRINS[Math.floor(Math.random() * PET_GRINS.length)];
    petGrin = true; petHop = true; petRender();
    setTimeout(() => { petHop = false; petRender(); }, 520);
    setTimeout(() => { petGrin = false; petRender(); }, 1750);
    return;
  }
  if (r < 0.27) {                                    // brief idle fidget pose
    petPoseCur = PET_IDLES[Math.floor(Math.random() * PET_IDLES.length)];
    petPose = true; petPoseUntil = Date.now() + 3000 + Math.random() * 2400; petRender(); return;
  }
  if (r < 0.48) { petBlink = true; petRender(); setTimeout(() => { petBlink = false; petRender(); }, 160); return; }
  if (petMode === 'full') petRender();               // keep the sparkle moving
}
function cyclePet() { petMode = PET_MODES[(PET_MODES.indexOf(petMode) + 1) % PET_MODES.length]; try { localStorage.setItem(PET_MODE_KEY, petMode); } catch (_) {} petRender(); }
document.getElementById('pet')?.addEventListener('click', cyclePet);
petRender(); setInterval(petTick, 2200);

// ── ラジオ (internet radio — SomaFM — + fake ASCII spectrum) ──────────────
// No autoplay on load (browsers block it); starts stopped, ▶ to play. We only
// persist the chosen station index.
const RADIO_KEY = 'bm-browser.radio.v1';
const RADIO_STATIONS = [
  { name: 'SomaFM · Groove Salad',  url: 'https://ice.somafm.com/groovesalad-128-mp3' },
  { name: 'SomaFM · Drone Zone',    url: 'https://ice.somafm.com/dronezone-128-mp3' },
  { name: 'SomaFM · Lush',          url: 'https://ice.somafm.com/lush-128-mp3' },
  { name: 'SomaFM · DEF CON Radio', url: 'https://ice.somafm.com/defcon-128-mp3' },
  { name: 'SomaFM · Space Station', url: 'https://ice.somafm.com/spacestation-128-mp3' },
  { name: 'SomaFM · Beat Blender',  url: 'https://ice.somafm.com/beatblender-128-mp3' },
];
const RADIO_LV = '▁▂▃▄▅▆▇█';
const RADIO_SIZE_KEY = 'bm-browser.radioSize.v1';
const RADIO_BARS_N = { s: 14, m: 26, l: 40 };
let radioSize = ['s', 'm', 'l'].includes(localStorage.getItem(RADIO_SIZE_KEY)) ? localStorage.getItem(RADIO_SIZE_KEY) : 'm';
function _radioN() { return RADIO_BARS_N[radioSize] || 26; }
function setRadioSize(s) { if (!['s', 'm', 'l'].includes(s)) return; radioSize = s; try { localStorage.setItem(RADIO_SIZE_KEY, s); } catch (_) {} radioBars = '─'.repeat(_radioN()); radioRender(); }
let radioIdx = (() => { const s = lsGet(RADIO_KEY); const i = (s && Number.isInteger(s.i)) ? s.i : 0; return (i >= 0 && i < RADIO_STATIONS.length) ? i : 0; })();
let radioAudio = null, radioPlaying = false, radioAnim = 0, radioBars = '─'.repeat(RADIO_BARS_N.m);
function _radioStation() { return RADIO_STATIONS[radioIdx] || RADIO_STATIONS[0]; }
function radioRender(msg) {
  const hd = document.getElementById('radio-hd'), body = document.getElementById('radio-body');
  if (hd) hd.innerHTML = `<span class="rd-mark">${radioPlaying ? '◉' : '○'}</span><span class="rd-name">${esc(_radioStation().name)}</span>` +
    `<span class="sz-tg" id="rd-size"><span data-sz="s">小</span><span class="sep">·</span><span data-sz="m">中</span><span class="sep">·</span><span data-sz="l">大</span></span>` +
    `<span class="rd-ctl rd-prev" title="前の局">‹</span><span class="rd-ctl rd-play" title="${radioPlaying ? '止める' : '再生'}">${radioPlaying ? '❚❚' : '▶'}</span><span class="rd-ctl rd-next" title="次の局">›</span>`;
  if (body) {
    if (msg) body.innerHTML = `<div class="rd-msg">${esc(msg)}</div>`;
    else if (radioPlaying) body.innerHTML = `<pre class="rd-bars sz-${radioSize} on">${esc(radioBars)}</pre>`;
    else body.innerHTML = `<button type="button" class="rd-btn sz-${radioSize}" id="rd-btn" title="クリックでラジオ再生">▶ ▷ ▷　ラジオを聴く　◁ ◁ ◀</button>`;
    body.querySelector('#rd-btn')?.addEventListener('click', radioPlay);
  }
  if (hd) {
    hd.querySelectorAll('#rd-size [data-sz]').forEach((s) => { s.classList.toggle('active', s.dataset.sz === radioSize); s.addEventListener('click', () => setRadioSize(s.dataset.sz)); });
    hd.querySelector('.rd-prev')?.addEventListener('click', () => radioStep(-1));
    hd.querySelector('.rd-next')?.addEventListener('click', () => radioStep(1));
    hd.querySelector('.rd-play')?.addEventListener('click', radioToggle);
  }
}
function radioPlay() {
  try { if (radioAudio) { radioAudio.pause(); radioAudio.src = ''; } } catch (_) {}
  radioAudio = new Audio();
  radioAudio.src = _radioStation().url;
  radioAudio.addEventListener('playing', () => { radioPlaying = true; radioRender(); });
  radioAudio.addEventListener('pause',   () => { radioPlaying = false; radioRender(); });
  radioAudio.addEventListener('error',   () => { radioPlaying = false; radioRender('受信できませんでした — ›で別の局を'); });
  radioRender('接続中…');
  radioAudio.play().catch((e) => { console.warn('[bmbrowser] radio:', e); radioPlaying = false; radioRender('再生できませんでした'); });
}
function radioStop() {
  try { if (radioAudio) { radioAudio.pause(); radioAudio.src = ''; } } catch (_) {}
  radioAudio = null; radioPlaying = false; radioRender();
}
function radioToggle() { radioPlaying ? radioStop() : radioPlay(); }
function radioStep(d) {
  radioIdx = (radioIdx + d + RADIO_STATIONS.length) % RADIO_STATIONS.length;
  lsSet(RADIO_KEY, { i: radioIdx });
  if (radioPlaying) radioPlay(); else radioRender();
}
function radioTick() {
  if (!radioPlaying) return;
  radioAnim++;
  const n = _radioN(), arr = [];
  for (let i = 0; i < n; i++) {
    const base = 0.32 + 0.42 * Math.abs(Math.sin(radioAnim * 0.55 + i * 0.7));
    const v = Math.max(0, Math.min(7, Math.round((base + (Math.random() - 0.5) * 0.5) * 7)));
    arr.push(RADIO_LV[v]);
  }
  radioBars = arr.join('');
  const bars = document.querySelector('#radio-body .rd-bars');
  if (bars) bars.textContent = radioBars;
}
radioRender(); setInterval(radioTick, 130);

// ── "boss mode" easter egg — Ctrl+` fills the screen with fake work ──────
const bossEl = document.getElementById('boss');
let bossTimer = null, bossLines = [];
const FAKE_LINES = [
  '$ npm run build',
  'webpack 5.91.0 compiled successfully in 1342 ms',
  '  ├─ src/widgets/news.ts        4.2 kB',
  '  ├─ src/widgets/clock.ts       2.8 kB',
  '  └─ src/core/stack.ts          7.1 kB',
  '[hmr] updated modules: ./src/widgets/news.ts',
  'const items = hits.filter(h => h.title).map(h => ({ title: h.title, url: h.url ?? itemUrl(h.objectID) }));',
  'if (!cache.has(key)) cache.set(key, await compute(key, { signal: ctrl.signal }));',
  'export function applyOrder(order) { for (const id of order) container.appendChild(byId(id)); }',
  '// TODO: debounce the resize observer — fires ~40x/s during drag',
  '$ git add -p && git commit -m "feat(widgets): drag-to-reorder + persist"',
  '[main 9f3a2c1] feat(widgets): drag-to-reorder + persist',
  ' 4 files changed, 218 insertions(+), 31 deletions(-)',
  '$ npm test -- --watch=false',
  'PASS  tests/stack.spec.ts  (1.2 s)',
  'PASS  tests/bookmarks.spec.ts  (0.8 s)',
  'PASS  tests/news.spec.ts  (1.4 s)',
  'Test Suites: 6 passed, 6 total',
  'Tests:       54 passed, 54 total',
  'Coverage:    91.3% statements · 88.7% branches · 90.1% functions',
  'const reduced = data.reduce((acc, x) => ((acc[x.k] ??= []).push(x), acc), {});',
  'await Promise.allSettled(urls.map(u => fetch(u).then(r => r.json())));',
  'console.debug(`[render] ${order.length} widgets in ${(performance.now()-t0).toFixed(1)}ms`);',
  '$ tsc --noEmit',
  'Found 0 errors. Watching for file changes.',
  '$ docker compose up -d',
  ' ✔ Container app-1    Started',
  ' ✔ Container redis-1  Started',
  '$ curl -s https://api.internal/health | jq .status',
  '"ok"',
  '$ rsync -avz --delete ./dist/ deploy@host:/srv/app/',
  'sending incremental file list',
  'sent 1,204,882 bytes  received 91 bytes  802,648.67 bytes/sec  total size 4,981,210',
  '$ git push origin main',
  'To github.com:internal/app.git',
  '   9f3a2c1..a71b3e0  main -> main',
  'const memo = useMemo(() => heavyTransform(input), [input]);',
  'return <Stack onReorder={persist}>{widgets.map(renderWidget)}</Stack>;',
  'eslint --fix src/  →  ✔ no problems',
];
function bossPick() {
  const s = FAKE_LINES[(Math.random() * FAKE_LINES.length) | 0];
  let cls = '';
  if (/(PASS\b|✔|✓|compiled successfully|Found 0 errors|passed,|Coverage:|"ok"|no problems|->\s*main)/.test(s)) cls = 'ok';
  else if (/^(\$ |\[hmr\]|\s{2}[├└]|sending |sent |To github)/.test(s)) cls = 'dim';
  return cls ? `<span class="${cls}">${esc(s)}</span>` : esc(s);
}
function bossRender() {
  const pre = bossEl && bossEl.querySelector('pre');
  if (pre) pre.innerHTML = bossLines.join('\n') + '\n<span class="cur">▌</span>';
}
function bossTick() {
  bossLines.push(bossPick());
  if (bossLines.length > 600) bossLines.splice(0, bossLines.length - 600);
  bossRender();
}
function bossActive() { return bossEl && bossEl.classList.contains('on'); }
function bossOn() {
  if (!bossEl) return;
  if (!bossEl.querySelector('pre')) bossEl.innerHTML = '<pre></pre><span class="hint2">press any key to dismiss</span>';
  bossEl.classList.add('on'); bossEl.setAttribute('aria-hidden', 'false');
  bossLines = []; for (let i = 0; i < 70; i++) bossLines.push(bossPick());   // prefill — "already in progress"
  bossRender();
  clearInterval(bossTimer); bossTimer = setInterval(bossTick, 75);
}
function bossOff() {
  if (!bossEl) return;
  bossEl.classList.remove('on'); bossEl.setAttribute('aria-hidden', 'true');
  clearInterval(bossTimer); bossTimer = null;
}
document.addEventListener('keydown', (e) => {
  if (bossActive()) { e.preventDefault(); e.stopPropagation(); bossOff(); return; }
  // boss key: Ctrl+.  (period — layout-independent) OR Ctrl+`  (the classic)
  if (e.ctrlKey && !e.metaKey && !e.altKey && (e.code === 'Period' || e.key === '.' || e.code === 'Backquote' || e.key === '`')) {
    e.preventDefault(); bossOn();
  }
}, true);   // capture — works even when an input/textarea has focus
if (bossEl) bossEl.addEventListener('click', bossOff);

try { cmd.focus({ preventScroll: true }); } catch (_) { try { cmd.focus(); } catch (__) {} }
