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
import { extractArray } from './lib/extract.mjs';
import { CSS, HERO_CSS, ANIM_CSS, ANIM_JS, heroTiles, head, nav, footer, LANG_JS, FILTER_JS, esc } from './lib/page.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'usage.html');
const CHECK = process.argv.includes('--check');

const doc = extractArray(fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8'), 'var USAGE_DOC');
const total = doc.reduce((n, c) => n + c.items.length, 0);

/* 説明文には <b> <small> <code> だけ入っている＝そのまま通す */
const keep = s => String(s);
/* キー欄は "|" 区切り。⚠️これは「どれでも同じ」＝並列（help / ? / man）であって同時押しではない */
const chips = k => String(k).split('|').map(x => `<kbd>${esc(x.trim())}</kbd>`).join('<i>/</i>');

const catChips = doc.map(c =>
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
${head({
  title: 'BM BOARD — 使い方 / Usage',
  desc: `BM BOARD の使い方。覚えるのは ⌘K ひとつ。鉛筆で書く、紙を裏返す、消しカスを払う、魔法を作って配る——全${total}項目を${doc.length}のまとまりで。日本語 / English。`,
  url: 'https://bmboard.studio/usage.html',
  ogTitle: 'BM BOARD — 使い方 / Usage',
  ogDesc: `覚えるのは ⌘K ひとつ。BM BOARD でできること全${total}項目。`,
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'BM BOARD の使い方',
    inLanguage: ['ja', 'en'],
    url: 'https://bmboard.studio/usage.html',
    about: { '@type': 'SoftwareApplication', name: 'BM BOARD', alternateName: ['Black Mirror Board', 'BMBOARD'], url: 'https://bmboard.studio/' },
    author: { '@type': 'Person', name: '木下 貴博', url: 'https://kinoshita.studio/' },
  },
})}
<style>${CSS}${HERO_CSS}${ANIM_CSS}</style>
</head>
<body>
<div class="glow"><i></i><i></i></div>

${nav('usage.html')}

<main class="shell">
  <header class="head hero tight">
${heroTiles(doc.map(c => c.icon))}
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
${catChips}
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
      <a href="commands.html"><span class="ja">コマンド一覧</span><span class="en">Command reference</span></a>
      <a href="spell-spec.html"><span class="ja">魔法の書式</span><span class="en">Spell format</span></a>
      <a href="story.html"><span class="ja">つくった理由</span><span class="en">Story</span></a>
      <a href="app.html"><span class="ja">とにかく触る →</span><span class="en">Just open it →</span></a>
    </div>
  </div>
</main>

${footer()}

<script>${ANIM_JS}
${LANG_JS}
${FILTER_JS}
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
