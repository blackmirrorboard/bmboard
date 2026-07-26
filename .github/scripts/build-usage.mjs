#!/usr/bin/env node
/**
 * usage.html を app.html の USAGE_DOC から生成する。
 *
 * ⭐なぜ生成にしたか：
 *   アプリの中の使い方（⌘K → usage）はデータ配列 USAGE_DOC で作り直したのに、
 *   公開ページ usage.html は別の手書きHTMLだった＝二重管理。
 *   結果、片方だけ育って公開ページが2ヶ月止まり、⌘K・鉛筆・flip・sweep が
 *   ひとつも載っていない状態になっていた（2026-07-26 発覚）。
 *   元データを1つにすれば、この種のズレは構造的に起きない。
 *
 * 使い方:
 *   node .github/scripts/build-usage.mjs          # 生成して書き出す
 *   node .github/scripts/build-usage.mjs --check  # ズレていたら落とす（CI用）
 *
 * ⚠️このスクリプトは app.html を読むだけ。app.html には一切書き込まない。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APP = path.join(ROOT, 'app.html');
const OUT = path.join(ROOT, 'usage.html');
const CHECK = process.argv.includes('--check');

/* ── USAGE_DOC を取り出す ──────────────────────────────
   ⚠️正規表現では取れない（中に ] や引用符が入る）。括弧の釣り合いで端を探し、
   文字列の中の括弧は数えない。 */
function extractUsageDoc(src) {
  const i = src.indexOf('var USAGE_DOC');
  if (i < 0) throw new Error('app.html に USAGE_DOC が見つからない');
  const start = src.indexOf('[', i);
  let depth = 0, quote = null, esc = false, end = -1;
  for (let k = start; k < src.length; k++) {
    const c = src[k];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (quote) { if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (!depth) { end = k + 1; break; } }
  }
  if (end < 0) throw new Error('USAGE_DOC の終わりが見つからない');
  return new Function('return ' + src.slice(start, end))();
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* 説明文には <b> <small> <code> だけ入っている＝そのまま通す */
const keep = s => String(s);

/* キー欄は "|" 区切り。⚠️これは「どれでも同じ」＝並列（help / ? / man）であって
   同時押しではない。以前 + でつないでいて意味が逆になっていた。 */
const chips = k => String(k).split('|').map(x => `<kbd>${esc(x.trim())}</kbd>`).join('<i>/</i>');

const doc = extractUsageDoc(fs.readFileSync(APP, 'utf8'));
const total = doc.reduce((n, c) => n + c.items.length, 0);

/* ── 生成 ───────────────────────────────────────────── */
const nav = doc.map(c =>
  `      <a class="chip" href="#${c.id}"><span class="i">${c.icon}</span><span class="ja">${esc(c.ja)}</span><span class="en">${esc(c.en)}</span></a>`
).join('\n');

const sections = doc.map(c => `
    <section class="cat" id="${c.id}">
      <h2><span class="i">${c.icon}</span><span class="ja">${esc(c.ja)}</span><span class="en">${esc(c.en)}</span></h2>
${c.noteJa || c.noteEn ? `      <p class="note"><span class="ja">${keep(c.noteJa || '')}</span><span class="en">${keep(c.noteEn || '')}</span></p>` : '      <!-- このまとまりに前書きは無い -->'}
      <div class="rows">
${c.items.map(([k, ja, en]) => `        <div class="row" data-s="${esc([k, String(ja).replace(/<[^>]+>/g, ' '), String(en).replace(/<[^>]+>/g, ' ')].join(' ').toLowerCase())}">
          <div class="key">${chips(k)}</div>
          <div class="desc"><span class="ja">${keep(ja)}</span><span class="en">${keep(en)}</span></div>
        </div>`).join('\n')}
      </div>
    </section>`).join('\n');

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>BM BOARD — 使い方 / Usage</title>
<!-- ⚠️このファイルは自動生成です。直接編集しても次の生成で消えます。
     元データ＝app.html の USAGE_DOC。項目を足すならそちらを1行足す。
     生成: node .github/scripts/build-usage.mjs -->
<meta name="description" content="BM BOARD の使い方。覚えるのは ⌘K ひとつ。鉛筆で書く、紙を裏返す、消しカスを払う、魔法を作って配る——全${total}項目を12のまとまりで。日本語 / English。">
<link rel="canonical" href="https://bmboard.studio/usage.html">
<meta property="og:title" content="BM BOARD — 使い方 / Usage">
<meta property="og:description" content="覚えるのは ⌘K ひとつ。BM BOARD でできること全${total}項目。">
<meta property="og:type" content="article">
<meta property="og:url" content="https://bmboard.studio/usage.html">
<meta property="og:image" content="https://bmboard.studio/og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="BM BOARD">
<meta property="og:locale" content="ja_JP">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BM BOARD — How to use">
<meta name="twitter:description" content="One shortcut to remember: ⌘K. Everything BM BOARD can do, in ${total} entries.">
<meta name="twitter:image" content="https://bmboard.studio/og-image.png">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#08080a">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "BM BOARD の使い方",
  "inLanguage": ["ja", "en"],
  "url": "https://bmboard.studio/usage.html",
  "about": { "@type": "SoftwareApplication", "name": "BM BOARD", "alternateName": ["Black Mirror Board", "BMBOARD"], "url": "https://bmboard.studio/" },
  "author": { "@type": "Person", "name": "木下 貴博", "url": "https://kinoshita.studio/" }
}
</script>
<style>
/* ⭐トップページと同じ顔（システムフォント・暗い地・SF Monoのチップ）。
   ⚠️Webフォントは読まない＝外部依存ゼロ。BMBoard本体の思想と揃える。 */
:root{
  --ink:#08080a; --ink2:#0e0e12; --fg:#f2f0ec;
  --dim:rgba(242,240,236,.56); --dim2:rgba(242,240,236,.34);
  --line:rgba(255,255,255,.09);
  --blue:#0a12e0;
  --mono:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace;
  --sans:-apple-system,BlinkMacSystemFont,'Helvetica Neue','Hiragino Sans','Noto Sans JP',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;scroll-padding-top:96px}
body{background:var(--ink);color:var(--fg);font-family:var(--sans);line-height:1.8;
  letter-spacing:.01em;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
.shell{max-width:1160px;margin:0 auto;padding:0 26px}

/* 背景の光（トップと同じ・動かさない＝読む頁なので静かに） */
.glow{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.glow i{position:absolute;display:block;border-radius:50%;filter:blur(80px);opacity:.20}
.glow i:nth-child(1){width:52vw;height:52vw;left:-16vw;top:-14vh;background:#4a3aff}
.glow i:nth-child(2){width:48vw;height:48vw;right:-14vw;top:52vh;background:#2a6cff}
main,nav,footer{position:relative;z-index:1}

nav{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:14px;
  padding:14px 26px;background:rgba(8,8,10,.72);
  -webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:12px;font-family:var(--mono);font-size:15px;
  letter-spacing:.16em;font-weight:700}
.brand img{width:27px;height:27px;filter:invert(1)}
.navsp{flex:1}
.lang{display:flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;
  font-family:var(--mono);font-size:11px}
.lang button{background:transparent;border:0;color:var(--dim2);padding:6px 11px;cursor:pointer;font:inherit}
.lang button.on{background:var(--fg);color:var(--ink)}
.navcta{font-size:13px;font-weight:500;padding:9px 20px;border-radius:9px;background:var(--fg);color:var(--ink)}

header.head{padding:86px 0 34px}
h1{font-size:clamp(30px,5vw,54px);font-weight:700;letter-spacing:-.02em;line-height:1.2}
.sub{margin-top:16px;font-size:15px;color:var(--dim);max-width:640px}
.sub b{color:var(--fg);font-weight:600}
.count{margin-top:22px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:var(--dim2)}

.tools{position:sticky;top:64px;z-index:20;padding:14px 0 12px;margin-top:26px;
  background:linear-gradient(180deg,rgba(8,8,10,.95),rgba(8,8,10,.78));
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

.en{display:none}
body.lang-en .ja{display:none}
body.lang-en .en{display:inline}
body.lang-en .desc .en{display:inline}

@media(max-width:820px){
  .shell{padding:0 20px}
  nav{padding:12px 20px}
  header.head{padding:60px 0 26px}
  .tools{top:60px}
  .row{grid-template-columns:1fr;gap:8px;padding:14px 12px}
  .cat{padding-top:36px}
}
</style>
</head>
<body>
<div class="glow"><i></i><i></i></div>

<nav>
  <a class="brand" href="index.html"><img src="logo.png" alt=""><span>BM BOARD</span></a>
  <span class="navsp"></span>
  <div class="lang">
    <button type="button" data-lang="ja" class="on">JP</button>
    <button type="button" data-lang="en">EN</button>
  </div>
  <a class="navcta" href="app.html"><span class="ja">開く</span><span class="en">Open</span></a>
</nav>

<main class="shell">
  <header class="head">
    <h1><span class="ja">使い方</span><span class="en">How to use</span></h1>
    <p class="sub">
      <span class="ja">覚えることはひとつだけ。<b>⌘K</b> を押して、やりたいことを打つ。<br>あとは全部、ここに書いてある通りに出てくる。</span>
      <span class="en">Only one thing to remember: hit <b>⌘K</b> and type what you want.<br>Everything below shows up from there.</span>
    </p>
    <p class="count">${doc.length} groups &nbsp;·&nbsp; ${total} entries &nbsp;·&nbsp; JP / EN</p>
  </header>

  <div class="tools">
    <input id="q" type="search" autocomplete="off" placeholder="絞り込む — flip / 魔法 / export …">
    <div class="chips">
${nav}
    </div>
  </div>

  <div id="list">
${sections}
    <p class="empty" id="empty"><span class="ja">見つからない。別の言葉で打ってみて。</span><span class="en">Nothing found — try another word.</span></p>
  </div>

  <div class="card">
    <h3 class="warn">⚠ <span class="ja">画像の保存について</span><span class="en">About saving images</span></h3>
    <p>
      <span class="ja"><b>画像は自動保存（ブラウザのローカル保存）に含まれません。</b>文字・図形・線は自動で残りますが、画像は容量の都合で入りません。画像を含む板を残すには <code>save</code> で <b>.json に書き出して</b>ください。</span>
      <span class="en"><b>Images are not included in autosave.</b> Text, shapes and strokes persist automatically, but images are too large for local storage. To keep a board with images, export it to <b>.json</b> with <code>save</code>.</span>
    </p>
  </div>

  <div class="card">
    <h3><span class="ja">もっと深く</span><span class="en">Going deeper</span></h3>
    <p><span class="ja">魔法を自分で書く／AIに書かせる時の書式は、専用の頁にまとめてあります。</span>
       <span class="en">The spell format — for writing your own or having an AI write them — has its own page.</span></p>
    <div class="more">
      <a href="spell-spec.html"><span class="ja">魔法の書式</span><span class="en">Spell format</span></a>
      <a href="commands.html"><span class="ja">コマンド一覧</span><span class="en">Command reference</span></a>
      <a href="story.html"><span class="ja">つくった理由</span><span class="en">Story</span></a>
      <a href="app.html"><span class="ja">とにかく触る →</span><span class="en">Just open it →</span></a>
    </div>
  </div>
</main>

<footer class="shell">
  <div class="frow">
    <span class="brand" style="font-size:12px"><img src="logo.png" alt="" style="width:18px;height:18px"><span>BM BOARD</span></span>
    <span class="navsp"></span>
    <a href="index.html"><span class="ja">トップ</span><span class="en">Home</span></a>
    <a href="commands.html"><span class="ja">コマンド</span><span class="en">Commands</span></a>
    <a href="story.html"><span class="ja">つくった理由</span><span class="en">Story</span></a>
    <a href="dev-log.html"><span class="ja">開発ログ</span><span class="en">Dev log</span></a>
    <a href="browser/">BM Browser</a>
  </div>
</footer>

<script>
/* 言語＝トップページと同じ鍵を使う（頁をまたいでも選択が残る） */
const KEY = 'bm_site_lang';
function setLang(l){
  document.body.classList.toggle('lang-en', l === 'en');
  document.documentElement.lang = l;
  document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  try { localStorage.setItem(KEY, l); } catch (_) {}
}
document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
try { setLang(localStorage.getItem(KEY) || ((navigator.language || '').startsWith('ja') ? 'ja' : 'en')); } catch (_) { setLang('ja'); }

/* 絞り込み＝打った言葉で行を残すだけ。⚠️検索用の文字列は生成時に data-s へ入れてある */
const q = document.getElementById('q'), empty = document.getElementById('empty');
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
  empty.style.display = hit ? 'none' : 'block';
});
/* ⌘K / / で検索欄へ（このページでは板は開かない） */
addEventListener('keydown', e => {
  if ((e.key === '/' && e.target !== q) || ((e.metaKey || e.ctrlKey) && e.key === 'k')) { e.preventDefault(); q.focus(); }
});
</script>
</body>
</html>
`;

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== html) {
    console.error('usage.html が USAGE_DOC とズレています。'
      + '\n→ node .github/scripts/build-usage.mjs を実行して、生成物をコミットしてください。');
    process.exit(1);
  }
  console.log(`usage.html OK（${doc.length}まとまり / ${total}項目）`);
} else {
  fs.writeFileSync(OUT, html);
  console.log(`usage.html を生成しました（${doc.length}まとまり / ${total}項目 / ${(html.length / 1024).toFixed(0)}KB）`);
}
