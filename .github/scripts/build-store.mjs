#!/usr/bin/env node
/**
 * store.html を store/catalog.json から生成する（魔法の一覧＝サイト側のSTORE）。
 *
 * ⭐アプリの中の STORE（⌘K → store）と同じ catalog.json を読む＝二重管理にしない。
 *   魔法を1つ足したら、アプリの一覧とこの頁が同時に増える。
 *
 * ⚠️ここは「入れたくなる」ための頁。実際のインストールはアプリの中で完結するので、
 *   この頁は "何ができるか" と "どう入れるか" だけを見せる（配布ファイルは置かない）。
 *
 * 使い方:
 *   node .github/scripts/build-store.mjs          # 生成
 *   node .github/scripts/build-store.mjs --check  # ズレていたら落とす（CI用）
 */
import fs from 'node:fs';
import path from 'node:path';
import { CSS, head, nav, footer, LANG_JS, FILTER_JS, esc } from './lib/page.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'store.html');
const CHECK = process.argv.includes('--check');

const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'store/catalog.json'), 'utf8'));
const spells = (cat.spells || cat).slice();

const isCode = s => !!s.action;
const featured = spells.filter(s => s.tag === 'featured');
const rest = spells.filter(s => s.tag !== 'featured');

/* opsから「何が置かれるか」を数えて見せる＝中身が想像できるようにする */
const opsSummary = s => {
  if (!Array.isArray(s.ops)) return null;
  const n = {};
  s.ops.forEach(o => { n[o.type] = (n[o.type] || 0) + 1; });
  const label = { square: '四角', sticky: '付箋', text: '文字', circle: '円', triangle: '三角', arrow: '矢印' };
  const labelEn = { square: 'squares', sticky: 'stickies', text: 'text', circle: 'circles', triangle: 'triangles', arrow: 'arrows' };
  return {
    ja: Object.entries(n).map(([k, v]) => `${label[k] || k}×${v}`).join(' · '),
    en: Object.entries(n).map(([k, v]) => `${v} ${labelEn[k] || k}`).join(' · '),
  };
};

const card = s => {
  const ops = opsSummary(s);
  const kind = isCode(s)
    ? '<span class="kind code"><span class="ja">コードで動く</span><span class="en">runs code</span></span>'
    : '<span class="kind safe"><span class="ja">図形を置くだけ</span><span class="en">shapes only</span></span>';
  const tag = s.tag === 'featured'
    ? '<span class="pill"><span class="ja">おすすめ</span><span class="en">Featured</span></span>'
    : '<span class="pill new"><span class="ja">新着</span><span class="en">New</span></span>';
  const search = esc([s.name, s.desc, s.author, s.tag, isCode(s) ? 'code js' : 'ops shapes'].join(' ').toLowerCase());
  return `        <article class="sp" data-s="${search}">
          <div class="ico">${esc(s.icon || '✦')}</div>
          <div class="txt">
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.desc || '')}</p>
            <div class="foot">
              ${tag}${kind}
              ${ops ? `<span class="ops"><span class="ja">${esc(ops.ja)}</span><span class="en">${esc(ops.en)}</span></span>` : ''}
              <span class="by">${esc(s.author || '')}</span>
            </div>
          </div>
        </article>`;
};

const html = `<!doctype html>
<html lang="ja">
<head>
${head({
  title: 'BM BOARD — STORE / 魔法をインストールする',
  desc: `BM BOARD の STORE。カンバン・SWOT・マインドマップのような図の型から、紙吹雪や花火のような動くものまで、${spells.length}個の「魔法」を板に入れられます。アカウント不要・無料。`,
  url: 'https://bmboard.studio/store.html',
  ogTitle: 'BM BOARD — STORE',
  ogDesc: `${spells.length}個の魔法を、⌘K から board に入れる。自分で作ったものを出すこともできる。`,
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'BM BOARD STORE',
    inLanguage: ['ja', 'en'],
    url: 'https://bmboard.studio/store.html',
    about: { '@type': 'SoftwareApplication', name: 'BM BOARD', alternateName: ['Black Mirror Board', 'BMBOARD'], url: 'https://bmboard.studio/' },
    hasPart: spells.map(s => ({ '@type': 'CreativeWork', name: s.name, description: s.desc, author: { '@type': 'Organization', name: s.author || 'kinoshita studio' } })),
  },
})}
<style>${CSS}
/* この頁だけ：STOREの棚 */
.hero{text-align:center;padding-top:44px}
.hero h1{font-size:clamp(46px,8vw,104px);letter-spacing:-.035em;line-height:1}
.hero .sub{margin-left:auto;margin-right:auto}
.hero .count{text-align:center}
.tiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(10px,1.6vw,20px);
  max-width:640px;margin:0 auto 34px;pointer-events:none}
.tile{aspect-ratio:1;display:grid;place-items:center;font-size:clamp(20px,3.2vw,30px);
  border-radius:clamp(12px,2vw,20px);border:1px solid rgba(255,255,255,.09);
  background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02));
  box-shadow:0 18px 40px rgba(0,0,0,.45)}
/* ⭐端に行くほど遠くにある＝ぼけて暗い。中央3枚だけがくっきり見える */
.tile.t0,.tile.t4,.tile.t5,.tile.t9{filter:blur(3px);opacity:.42}
.tile.t1,.tile.t8{filter:blur(1px);opacity:.72}
@media(max-width:560px){
  .tiles{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;max-width:none}
  .tile{border-radius:12px}
}
@media(prefers-reduced-motion:no-preference){
  .tile{animation:tileIn .7s cubic-bezier(.2,.8,.2,1) backwards}
  .tile.t1{animation-delay:.04s} .tile.t2{animation-delay:.08s} .tile.t3{animation-delay:.12s}
  .tile.t4{animation-delay:.16s} .tile.t5{animation-delay:.2s}  .tile.t6{animation-delay:.24s}
  .tile.t7{animation-delay:.28s} .tile.t8{animation-delay:.32s} .tile.t9{animation-delay:.36s}
  @keyframes tileIn{from{opacity:0;transform:translateY(10px) scale(.96)}}
}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;margin-top:26px}
.sp{display:flex;gap:16px;padding:20px;border:1px solid var(--line);border-radius:16px;
  background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012));
  transition:transform .2s cubic-bezier(.2,.8,.2,1),border-color .2s,background .2s}
.sp:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.22);
  background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.02))}
.sp .ico{flex:none;width:52px;height:52px;display:grid;place-items:center;font-size:26px;
  border-radius:14px;background:rgba(255,255,255,.06);border:1px solid var(--line)}
.sp h3{font-size:16px;font-weight:700;letter-spacing:-.01em}
.sp p{margin-top:6px;font-size:13.5px;color:var(--dim);line-height:1.8}
.sp .foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px;
  font-family:var(--mono);font-size:10.5px;letter-spacing:.04em}
.pill{color:#cfe0ff;background:rgba(90,120,255,.16);border:1px solid rgba(120,150,255,.3);
  border-radius:999px;padding:3px 9px}
.pill.new{color:var(--dim);background:rgba(255,255,255,.05);border-color:var(--line)}
.kind{border-radius:999px;padding:3px 9px;border:1px solid var(--line)}
.kind.safe{color:#a9e9c0;background:rgba(60,200,120,.10);border-color:rgba(90,220,150,.26)}
.kind.code{color:#ffd9a8;background:rgba(255,170,60,.10);border-color:rgba(255,190,110,.28)}
.ops,.by{color:var(--dim2)}
.by::before{content:'by ';opacity:.6}
.sec{margin-top:52px}
.sec h2{font-size:20px;font-weight:700;letter-spacing:-.01em}
.sec .lead{margin-top:8px;font-size:13.5px;color:var(--dim)}
.steps{counter-reset:s;margin-top:16px;display:grid;gap:10px}
.steps li{list-style:none;position:relative;padding-left:38px;font-size:14px;color:var(--dim);line-height:1.9}
.steps li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:.25em;
  width:24px;height:24px;display:grid;place-items:center;font-family:var(--mono);font-size:11px;
  color:var(--fg);background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:8px}
.steps b{color:var(--fg);font-weight:600}
</style>
</head>
<body>
<div class="glow"><i></i><i></i></div>

${nav('store.html')}

<main class="shell">
  <header class="head hero">
    <!-- ⭐アイコンを面に浮かべて、中央だけくっきり・端はぼかす＝奥行きで「棚」に見せる。
         ⚠️並べる絵は catalog.json の先頭10件から拾う（手で並べない＝増えたら自動で変わる） -->
    <div class="tiles" aria-hidden="true">
${spells.slice(0, 10).map((s, i) => `      <span class="tile t${i}">${esc(s.icon || '✦')}</span>`).join('\n')}
    </div>
    <h1>STORE</h1>
    <p class="sub">
      <span class="ja">板に<b>魔法</b>を入れる。図の型も、動くものも。<br>アカウントは要らない。入れたものは、あなたの端末の中に残る。</span>
      <span class="en">Add <b>spells</b> to your board — diagram templates and animated ones alike.<br>No account. What you install stays on your device.</span>
    </p>
    <p class="count">${spells.length} spells &nbsp;·&nbsp; free &nbsp;·&nbsp; no account</p>
  </header>

  <div class="tools">
    <input id="q" type="search" autocomplete="off" placeholder="絞り込む — カンバン / confetti / ops …">
  </div>

  <div id="list">
    <section class="cat" id="featured" style="border-top:0;padding-top:8px">
      <h2><span class="ja">おすすめ</span><span class="en">Featured</span></h2>
      <div class="grid rows">
${featured.map(card).join('\n')}
      </div>
    </section>

    <section class="cat" id="all">
      <h2><span class="ja">ぜんぶ</span><span class="en">All spells</span></h2>
      <div class="grid rows">
${rest.map(card).join('\n')}
      </div>
    </section>
    <p class="empty" id="empty"><span class="ja">見つからない。別の言葉で打ってみて。</span><span class="en">Nothing found — try another word.</span></p>
  </div>

  <section class="sec">
    <h2><span class="ja">入れ方</span><span class="en">How to install</span></h2>
    <p class="lead"><span class="ja">30秒。ログインもダウンロードもない。</span><span class="en">Thirty seconds. No login, no download.</span></p>
    <ol class="steps">
      <li><span class="ja">板を開く（<a href="app.html"><b>ブラウザで開く</b></a>）</span><span class="en">Open the board (<a href="app.html"><b>open in browser</b></a>)</span></li>
      <li><span class="ja"><b>⌘K</b> を押して <code>store</code> と打つ</span><span class="en">Hit <b>⌘K</b> and type <code>store</code></span></li>
      <li><span class="ja">欲しいものを選んで<b>インストール</b>。以後は ⌘K に名前で並ぶ</span><span class="en">Pick one and <b>install</b>. From then on it lives in ⌘K by name</span></li>
    </ol>
  </section>

  <section class="sec">
    <h2><span class="ja">安全のこと</span><span class="en">About safety</span></h2>
    <p class="lead">
      <span class="ja">魔法には2種類ある。<b>図形を置くだけ</b>のものは、置ける形が決まっているので何も実行されない。
      <b>コードで動く</b>ものは中身がJavaScriptなので、入れる前に必ずそう表示され、掲載前に審査を通している。</span>
      <span class="en">There are two kinds. <b>Shapes only</b> spells can just place a fixed set of shapes — nothing is executed.
      <b>Runs code</b> spells are JavaScript, so they are labeled before you install and reviewed before they are listed.</span>
    </p>
  </section>

  <div class="card">
    <h3><span class="ja">自分の魔法を出す</span><span class="en">Publish your own</span></h3>
    <p>
      <span class="ja">板で選んで <code>spell 名前</code>。設定→魔法の <b>📤</b> から提出すると、自動の一次審査を通って一覧に載る。サーバーは無く、費用もかからない。</span>
      <span class="en">Select something and run <code>spell name</code>. Submit it from Settings → Spells (<b>📤</b>); it passes an automatic first review and lands in this list. No server, no cost.</span>
    </p>
    <div class="more">
      <a href="app.html"><span class="ja">板を開く →</span><span class="en">Open the board →</span></a>
      <a href="spell-spec.html"><span class="ja">魔法の書式</span><span class="en">Spell format</span></a>
      <a href="usage.html"><span class="ja">使い方</span><span class="en">How to use</span></a>
    </div>
  </div>
</main>

${footer()}

<script>${LANG_JS}
${FILTER_JS}
/* ⚠️この頁の行は .sp（カード）なので、共通の絞り込みが見る .row と別。ここで橋渡しする */
document.querySelectorAll('.sp').forEach(el => el.classList.add('row'));
</script>
</body>
</html>
`;

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== html) {
    console.error('store.html が store/catalog.json とズレています。'
      + '\n→ node .github/scripts/build-store.mjs を実行して、生成物をコミットしてください。');
    process.exit(1);
  }
  console.log(`store.html OK（${spells.length}件）`);
} else {
  fs.writeFileSync(OUT, html);
  console.log(`store.html を生成しました（${spells.length}件 / ${(html.length / 1024).toFixed(0)}KB）`);
}
