/**
 * サイトの共通の顔（ナビ・footer・配色・言語切替）を1箇所に置く。
 *
 * ⭐なぜ共通化したか：
 *   ページごとに手書きしていた結果、usage は 2026-06 で止まり、commands / story /
 *   dev-log は 2026-05 のデザインのままトップだけが刷新されて、顔がバラバラになった。
 *   ⚠️ナビを足したい時に「全ページを探して直す」状態が、そもそもの事故の温床。
 *
 * ⚠️トップページ index.html はKVの都合で独自CSSのまま。ナビの項目だけ手で合わせる。
 */

/* ⭐上部ナビ＝Raycast型（中央にページを並べる）。ここが全ページの導線の正。
   増やす時はこの配列に1行足すだけ。 */
export const NAV = [
  { href: 'usage.html',      ja: '使い方',       en: 'Usage' },
  { href: 'commands.html',   ja: 'コマンド',     en: 'Commands' },
  { href: 'store.html',      ja: 'STORE',        en: 'STORE' },
  { href: 'spell-spec.html', ja: '魔法の書式',   en: 'Spell format' },
  { href: 'story.html',      ja: 'つくった理由', en: 'Story' },
  { href: 'dev-log.html',    ja: '開発ログ',     en: 'Dev log' },
  { href: 'browser/',        ja: 'BM Browser',   en: 'BM Browser' },
];

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const CSS = `
/* ⭐トップページと同じ顔（システムフォント・暗い地・SF Monoのチップ）。
   ⚠️Webフォントは読まない＝外部依存ゼロ。BM BOARD本体の思想と揃える。 */
:root{
  --ink:#08080a; --ink2:#0e0e12; --fg:#f2f0ec;
  --dim:rgba(242,240,236,.56); --dim2:rgba(242,240,236,.34);
  --line:rgba(255,255,255,.09);
  --blue:#0a12e0;
  --mono:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace;
  --sans:-apple-system,BlinkMacSystemFont,'Helvetica Neue','Hiragino Sans','Noto Sans JP',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;scroll-padding-top:150px}
body{background:var(--ink);color:var(--fg);font-family:var(--sans);line-height:1.8;
  letter-spacing:.01em;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
.shell{max-width:1160px;margin:0 auto;padding:0 26px}

/* 背景の光。⚠️読む頁なので動かさない（動く光は目が滑る） */
.glow{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.glow i{position:absolute;display:block;border-radius:50%;filter:blur(80px);opacity:.20}
.glow i:nth-child(1){width:52vw;height:52vw;left:-16vw;top:-14vh;background:#4a3aff}
.glow i:nth-child(2){width:48vw;height:48vw;right:-14vw;top:52vh;background:#2a6cff}
main,nav,footer{position:relative;z-index:1}

nav{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:16px;
  padding:13px 26px;background:rgba(8,8,10,.74);
  -webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
/* ⚠️ドロップダウンの位置の基準。sticky でも absolute の親になる */
.brand{display:flex;align-items:center;gap:12px;font-family:var(--mono);font-size:15px;
  letter-spacing:.16em;font-weight:700;flex:none}
.brand img{width:27px;height:27px;filter:invert(1)}
.pages{display:flex;align-items:center;gap:2px;flex:1;min-width:0;overflow-x:auto;
  scrollbar-width:none}
.pages::-webkit-scrollbar{display:none}
.pages a{font-size:13.5px;color:var(--dim);padding:8px 13px;border-radius:9px;white-space:nowrap}
.pages a:hover{color:var(--fg);background:rgba(255,255,255,.06)}
.pages a.on{color:var(--fg);background:rgba(255,255,255,.09)}
.lang{display:flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;
  font-family:var(--mono);font-size:11px;flex:none}
.lang button{background:transparent;border:0;color:var(--dim2);padding:6px 11px;cursor:pointer;font:inherit}
.lang button.on{background:var(--fg);color:var(--ink)}
.navcta{font-size:13px;font-weight:500;padding:9px 20px;border-radius:9px;
  background:var(--fg);color:var(--ink);flex:none}
.burger{display:none;flex:none;width:38px;height:38px;border-radius:10px;cursor:pointer;
  align-items:center;justify-content:center;flex-direction:column;gap:5px;
  background:rgba(255,255,255,.05);border:1px solid var(--line)}
.burger span{display:block;width:16px;height:1.5px;background:var(--fg);border-radius:2px;
  transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .18s}
body.menu-open .burger span:nth-child(1){transform:translateY(3.25px) rotate(45deg)}
body.menu-open .burger span:nth-child(2){transform:translateY(-3.25px) rotate(-45deg)}

header.head{padding:78px 0 30px}
h1{font-size:clamp(30px,5vw,54px);font-weight:700;letter-spacing:-.02em;line-height:1.2}
.sub{margin-top:16px;font-size:15px;color:var(--dim);max-width:660px}
.sub b{color:var(--fg);font-weight:600}
.count{margin-top:22px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:var(--dim2)}

.tools{position:sticky;top:60px;z-index:20;padding:14px 0 12px;margin-top:22px;
  background:linear-gradient(180deg,rgba(8,8,10,.96),rgba(8,8,10,.80));
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
#q{width:100%;max-width:420px;font:inherit;font-size:14px;color:var(--fg);
  background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:11px;padding:12px 16px}
#q::placeholder{color:var(--dim2)}
#q:focus{outline:none;border-color:rgba(255,255,255,.28)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.chip{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:var(--dim);
  border:1px solid var(--line);border-radius:999px;padding:7px 14px;background:rgba(255,255,255,.03)}
.chip:hover{color:var(--fg);border-color:rgba(255,255,255,.24)}
.chip .i{font-size:13px}

.cat{padding:46px 0 8px;border-top:1px solid var(--line);margin-top:34px}
.cat h2{display:flex;align-items:center;gap:12px;font-size:24px;font-weight:700;letter-spacing:-.01em}
.cat h2 .i{font-size:20px}
.note{margin-top:10px;color:var(--dim);font-size:14px}
.rows{margin-top:24px;display:grid;gap:2px}
.row{display:grid;grid-template-columns:230px 1fr;gap:22px;align-items:baseline;
  padding:14px 16px;border-radius:11px}
.row:hover{background:rgba(255,255,255,.035)}
.key{display:flex;flex-wrap:wrap;align-items:center;gap:5px}
kbd{font-family:var(--mono);font-size:12px;color:var(--fg);white-space:nowrap;
  background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:7px;padding:4px 9px}
.key i{font-style:normal;color:var(--dim2);font-size:11px}
.key .arg{font-family:var(--mono);font-size:11.5px;color:var(--dim2)}
.desc{font-size:14.5px}
.desc small{display:block;margin-top:5px;font-size:12.5px;color:var(--dim);line-height:1.75}
.desc b{font-weight:600}
code{font-family:var(--mono);font-size:.9em;background:rgba(255,255,255,.07);
  border:1px solid var(--line);border-radius:6px;padding:2px 6px}

.card{margin-top:44px;border:1px solid var(--line);border-radius:16px;padding:28px 26px;
  background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.015))}
.card h3{font-size:17px;font-weight:700}
.card p{margin-top:10px;font-size:14px;color:var(--dim)}
.card .warn{color:#ffd9a8}
.more{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
.more a{font-size:13.5px;border:1px solid var(--line);border-radius:10px;padding:10px 18px;
  background:rgba(255,255,255,.04)}
.more a:hover{background:rgba(255,255,255,.09)}

.empty{display:none;padding:40px 16px;color:var(--dim);font-size:14px}
body.searching .cat{border-top:0;padding-top:0;margin-top:18px}
body.searching .note,body.searching .tools .chips{display:none}

footer{margin-top:90px;padding:34px 0 60px;border-top:1px solid var(--line)}
.frow{display:flex;flex-wrap:wrap;align-items:center;gap:18px;font-size:12.5px;color:var(--dim)}
.frow a:hover{color:var(--fg)}
.fnote{margin-top:16px;font-size:11.5px;color:var(--dim2)}

.en{display:none}
body.lang-en .ja{display:none}
body.lang-en .en{display:inline}

@media(max-width:900px){
  .shell{padding:0 20px}
  nav{padding:11px 16px;gap:10px;flex-wrap:wrap}
  .pages{order:3;width:100%;flex-basis:100%;margin:0 -16px;padding:0 16px 2px}
  .pages a{font-size:12.5px;padding:7px 11px}
  html{scroll-padding-top:120px}
  header.head{padding:52px 0 24px}
  .row{grid-template-columns:1fr;gap:8px;padding:14px 12px}
  .cat{padding-top:36px}

  /* ⭐スマホでは貼り付くものを減らす（木下指摘・2026-07-27）。
     ⚠️ナビ2段＋検索＋カテゴリが全部 sticky だと画面の半分近くが常時ふさがり、
       中身が数行しか見えていなかった。
     ・絞り込み欄は一緒に流れる（上に戻れば出てくる）
     ・ページ列はハンバーガーの中へ（開いた時だけ出る） */
  .tools{position:static;background:none;-webkit-backdrop-filter:none;backdrop-filter:none;
    padding:12px 0 4px;margin-top:14px}
  nav{flex-wrap:nowrap;gap:8px}
  .burger{display:flex}
  .navcta{padding:8px 14px;font-size:12.5px}
  .brand{font-size:13px;gap:9px}
  .brand img{width:23px;height:23px}
  .pages{position:absolute;left:0;right:0;top:100%;display:none;flex-direction:column;
    align-items:stretch;gap:0;padding:6px;margin:0;overflow:visible;
    background:rgba(10,10,13,.96);border-bottom:1px solid var(--line);
    -webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
    box-shadow:0 24px 48px rgba(0,0,0,.5)}
  body.menu-open .pages{display:flex}
  .pages a{font-size:15px;padding:13px 14px;border-radius:10px}
  .pages a.on{background:rgba(255,255,255,.09)}
}
`;

export function head({ title, desc, url, ogTitle, ogDesc, jsonld }) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<!-- ⚠️このファイルは自動生成です。直接編集しても次の生成で消えます。
     生成元は app.html の中のデータ。項目を足すならそちらに1行足す。 -->
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(ogTitle || title)}">
<meta property="og:description" content="${esc(ogDesc || desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://bmboard.studio/og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="BM BOARD">
<meta property="og:locale" content="ja_JP">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle || title)}">
<meta name="twitter:image" content="https://bmboard.studio/og-image.png">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#08080a">
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>`;
}

export function nav(current) {
  const links = NAV.map(n =>
    `    <a href="${n.href}"${n.href === current ? ' class="on"' : ''}>` +
    (n.ja === n.en ? esc(n.ja) : `<span class="ja">${esc(n.ja)}</span><span class="en">${esc(n.en)}</span>`) +
    `</a>`).join('\n');
  return `<nav>
  <a class="brand" href="index.html"><img src="logo.png" alt=""><span>BM BOARD</span></a>
  <div class="pages">
${links}
  </div>
  <div class="lang">
    <button type="button" data-lang="ja" class="on">JP</button>
    <button type="button" data-lang="en">EN</button>
  </div>
  <a class="navcta" href="app.html"><span class="ja">開く</span><span class="en">Open</span></a>
  <!-- ⭐スマホはページ列を畳んでハンバーガーに（木下・2026-07-27）。
       ⚠️2段に並べると常時2行ぶん場所を取り、中身が数行しか見えなかった -->
  <button class="burger" type="button" id="burger" aria-label="メニュー" aria-expanded="false">
    <span></span><span></span>
  </button>
</nav>`;
}

export function footer() {
  const links = NAV.map(n =>
    `    <a href="${n.href}">` +
    (n.ja === n.en ? esc(n.ja) : `<span class="ja">${esc(n.ja)}</span><span class="en">${esc(n.en)}</span>`) +
    `</a>`).join('\n');
  return `<footer class="shell">
  <div class="frow">
    <span class="brand" style="font-size:12px"><img src="logo.png" alt="" style="width:18px;height:18px"><span>BM BOARD</span></span>
    <span style="flex:1"></span>
    <a href="index.html"><span class="ja">トップ</span><span class="en">Home</span></a>
${links}
  </div>
  <p class="fnote">
    <span class="ja">BM BOARD は Black Mirror Board の略。つくっているのは <a href="https://kinoshita.studio/">kinoshita studio</a>。</span>
    <span class="en">BM BOARD is short for Black Mirror Board. Made by <a href="https://kinoshita.studio/">kinoshita studio</a>.</span>
  </p>
</footer>`;
}

/* 言語＝トップページと同じ鍵。頁をまたいでも選択が残る */
export const LANG_JS = `
/* ⭐スマホのメニュー開閉。⚠️開いたまま迷子にならないよう、リンクを押す・外を触る・Esc・
   画面を広げる のどれでも閉じる */
(() => {
  const b = document.getElementById('burger');
  if (!b) return;
  const set = v => { document.body.classList.toggle('menu-open', v); b.setAttribute('aria-expanded', v ? 'true' : 'false'); };
  b.addEventListener('click', e => { e.stopPropagation(); set(!document.body.classList.contains('menu-open')); });
  document.querySelectorAll('.pages a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('click', e => { if (!e.target.closest('nav')) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width:901px)').addEventListener('change', () => set(false));
})();

const KEY = 'bm_site_lang';
function setLang(l){
  document.body.classList.toggle('lang-en', l === 'en');
  document.documentElement.lang = l;
  document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  try { localStorage.setItem(KEY, l); } catch (_) {}
}
document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
try { setLang(localStorage.getItem(KEY) || ((navigator.language || '').startsWith('ja') ? 'ja' : 'en')); } catch (_) { setLang('ja'); }`;

/* 絞り込み＝打った言葉で行を残すだけ。検索用の文字列は生成時に data-s へ入れてある */
export const FILTER_JS = `
const q = document.getElementById('q'), empty = document.getElementById('empty');
if (q) {
  q.addEventListener('input', () => {
    const v = q.value.trim().toLowerCase();
    document.body.classList.toggle('searching', !!v);
    let hit = 0;
    document.querySelectorAll('.cat').forEach(cat => {
      let n = 0;
      cat.querySelectorAll('.row').forEach(r => {
        const on = !v || r.dataset.s.includes(v);
        r.style.display = on ? '' : 'none';
        if (on) n++;
      });
      cat.style.display = n ? '' : 'none';
      hit += n;
    });
    if (empty) empty.style.display = hit ? 'none' : 'block';
  });
  addEventListener('keydown', e => {
    if ((e.key === '/' && e.target !== q) || ((e.metaKey || e.ctrlKey) && e.key === 'k')) { e.preventDefault(); q.focus(); }
  });
}`;
