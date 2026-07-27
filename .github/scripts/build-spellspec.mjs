#!/usr/bin/env node
/**
 * spell-spec.html を生成する（魔法の書式）。
 *
 * ⚠️旧ページは日本語0文字・英字5,965字の英語オンリーで、デザインも 2026-05-08 のまま止まっていた。
 * ⭐方針＝B案（木下）：**散文だけ日本語、コード例・API名・禁止語・AI用プロンプトは英語のまま**。
 *   理由＝この頁の読者は「魔法を書く人」と「その人が使うAI」の2者で、
 *   後者に渡すプロンプトは英語のままの方が精度が出る。訳すと逆効果になる。
 *
 * コード例と表は `.github/data/spell-spec.json`（旧ページから機械的に抜き出したもの）が正。
 * ⚠️手で書き写さない＝転記ミスで動かない魔法を配ることになる。
 *
 * 使い方:
 *   node .github/scripts/build-spellspec.mjs          # 生成
 *   node .github/scripts/build-spellspec.mjs --check  # ズレていたら落とす（CI用）
 */
import fs from 'node:fs';
import path from 'node:path';
import { CSS, HERO_CSS, ANIM_CSS, ANIM_JS, heroTiles, head, nav, footer, LANG_JS, esc } from './lib/page.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'spell-spec.html');
const CHECK = process.argv.includes('--check');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, '.github/data/spell-spec.json'), 'utf8'));

const code = i => `<pre><code>${data.code[i]}</code></pre>`;
/* 表は旧ページの行をそのまま使う（API名と説明は英語が正） */
const table = (from, to, h1, h2) => `<table>
  <thead><tr><th>${h1}</th><th>${h2}</th></tr></thead>
  <tbody>
${data.rows.slice(from, to).map(([a, b]) => `    <tr><td><code>${a}</code></td><td>${b}</td></tr>`).join('\n')}
  </tbody>
</table>`;

const bi = (ja, en) => `<span class="ja">${ja}</span><span class="en">${en}</span>`;

const html = `<!doctype html>
<html lang="ja">
<head>
${head({
  title: 'BM BOARD — 魔法の書式 / Spell format',
  desc: '魔法（spell）を自分で書く・AIに書かせるための書式。1行のJSONで、ボードの上で動くものを作って配れます。日本語の説明つき。',
  url: 'https://bmboard.studio/spell-spec.html',
  ogTitle: 'BM BOARD — 魔法の書式',
  ogDesc: '1行のJSONで、ボードの上で動くものを作って配る。AIに書かせるためのプロンプトつき。',
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'BM BOARD の魔法の書式',
    inLanguage: ['ja', 'en'],
    url: 'https://bmboard.studio/spell-spec.html',
    about: { '@type': 'SoftwareApplication', name: 'BM BOARD', alternateName: ['Black Mirror Board', 'BMBOARD'], url: 'https://bmboard.studio/' },
    author: { '@type': 'Person', name: '木下 貴博', url: 'https://kinoshita.studio/' },
  },
})}
<style>${CSS}${HERO_CSS}${ANIM_CSS}
/* この頁だけ：仕様の組み */
.sec{padding:46px 0 8px;border-top:1px solid var(--line);margin-top:26px;max-width:860px}
.sec:first-of-type{border-top:0}
.sec h2{font-size:22px;font-weight:700;letter-spacing:-.01em}
.sec h3{margin-top:26px;font-size:15px;font-weight:700;color:var(--fg)}
.sec p{margin-top:12px;font-size:14.5px;line-height:1.95;color:var(--dim)}
.sec p b{color:var(--fg);font-weight:600}
.sec ul{margin-top:12px;padding-left:0;list-style:none}
.sec li{position:relative;padding-left:20px;margin-top:8px;font-size:14px;line-height:1.9;color:var(--dim)}
.sec li::before{content:'';position:absolute;left:4px;top:.85em;width:5px;height:1px;background:var(--dim2)}
.sec li b{color:var(--fg);font-weight:600}
pre{margin-top:14px;padding:16px 18px;border-radius:12px;overflow-x:auto;
  background:rgba(0,0,0,.45);border:1px solid var(--line);
  font-family:var(--mono);font-size:12.5px;line-height:1.7;color:#e8e6e0;white-space:pre-wrap;word-break:break-word}
pre code{background:none;border:0;padding:0;font-size:inherit;color:inherit}
table{width:100%;border-collapse:collapse;margin-top:14px;font-size:13px}
th,td{border:1px solid var(--line);padding:8px 11px;text-align:left;vertical-align:top;color:var(--dim)}
th{background:rgba(255,255,255,.05);color:var(--fg);font-weight:600}
td code{white-space:nowrap}
.warn{margin-top:16px;padding:16px 18px;border-radius:12px;font-size:13.5px;line-height:1.9;
  color:#ffd9a8;background:rgba(255,170,60,.08);border:1px solid rgba(255,190,110,.28)}
.warn code{background:rgba(0,0,0,.3);color:#ffe6c4}
</style>
</head>
<body>
<div class="glow"><i></i><i></i></div>

${nav('spell-spec.html')}

<main class="shell">
  <header class="head hero">
${heroTiles(['🪄', '📦', '⚡', '🧩', '🔮', '📤', '🛡', '🧪', '📖', '✨'])}
    <h1>${bi('魔法の書式', 'Spell format')}</h1>
    <p class="sub">
      ${bi('<b>1行のJSON</b>で、ボードの上で動くものを作れる。作ったものは書き出して人に配れる。<br>AIに書かせるためのプロンプトも用意してある。',
           'A spell is <b>one line of JSON</b> that makes something happen on the board — and it travels as text, so you can hand it to someone. A ready-made prompt for AI is included.')}
    </p>
    <p class="count">JSON · one line · no build step</p>
  </header>

  <section class="sec">
    <h2>${bi('まず動く例を1つ', '0. Lead with a working example')}</h2>
    <p>${bi('中央から🔥を15個ばらまいて、外へ飛ばしながら小さくして、最後に自分で片づける魔法。<b>これをコピーして、形を真似るのが一番早い。</b>',
            'A spell that scatters 15 🔥 from view center, animates them outward while shrinking, then cleans up after itself. <b>Copy this and match its shape.</b>')}</p>
    ${code(0)}
    <p>${bi('ここから読み取れること：', 'What this teaches you:')}</p>
    <ul>
      <li>${bi('<b>魔法は「command」と「action」の2つだけを持つ1行のJSON</b>。それ以外の項目は無い。', '<b>A spell is one line of JSON with exactly two keys: <code>command</code> and <code>action</code>.</b> Nothing else.')}</li>
      <li>${bi('<b><code>action</code> は JavaScript を文字列にしたもの</b>。<code>new Function("BM","args",action)</code> で実行される。', '<b><code>action</code> is a string of raw JS</b>, executed via <code>new Function("BM","args",action)</code>.')}</li>
      <li>${bi('よくある形＝<code>BM.create()</code> で置く → <code>setInterval</code> で動かす → 片づける → 毎回 <code>BM.redraw()</code> → <code>BM.log()</code> で結果を出す。', 'Typical pattern: <code>BM.create()</code> → <code>setInterval</code> → clean up → <code>BM.redraw()</code> after each change → <code>BM.log()</code> for status.')}</li>
    </ul>
  </section>

  <section class="sec">
    <h2>${bi('魔法には2種類ある', 'Two kinds of spell')}</h2>
    <p>${bi('この頁が説明しているのは<b>コードで書く魔法（action型）</b>。もう1つ、<b>図形を置くだけの魔法（ops型）</b>がある。ops型は置ける形が決まっていて（square / sticky / text / circle / triangle / arrow）、コードは一切実行されない。STOREでは<b>「図形を置くだけ」と「コードで動く」を分けて表示</b>していて、コード型は掲載前に審査を通している。',
            'This page describes the <b>code kind (action)</b>. There is also a <b>shapes-only kind (ops)</b>, limited to a fixed set of shapes (square / sticky / text / circle / triangle / arrow) with no code execution at all. The STORE labels the two separately, and code spells are reviewed before they are listed.')}</p>
    <p>${bi('選んだものを <code>spell 名前</code> で保存すると ops 型になる。動きを付けたいときだけ action 型を書く。',
            'Saving a selection with <code>spell name</code> produces an ops spell. Write an action spell only when you want motion.')}</p>
  </section>

  <section class="sec">
    <h2>${bi('書式', '1. The format')}</h2>
    ${code(1)}
    <ul>
      <li>${bi('<code>"command"</code> — 呼び出す名前。小文字・数字・ハイフン・アンダースコアで1〜31文字。登録すると、ターミナルや ⌘K からその名前で呼べる。', '<code>"command"</code> — the invocation name. Lowercase letters, digits, hyphens, underscores. 1–31 chars.')}</li>
      <li>${bi('<code>"action"</code> — <b>JavaScript を文字列にしたもの</b>。中身がそのまま関数の本体になる（構造化されたオブジェクトではない）。', '<code>"action"</code> — <b>raw JavaScript as a string</b>. The string IS the function body; it is NOT a structured object.')}</li>
    </ul>
    <p>${bi('<b>他の項目は無い。</b>1行で出力する（Markdownの囲みや前置きの文章は付けない）。', '<b>There are no other fields.</b> Output a single line — no Markdown fences, no leading prose.')}</p>
  </section>

  <section class="sec">
    <h2>${bi('使ってはいけない言葉', '2. Forbidden / hallucinated terms')}</h2>
    <p>${bi('⚠️次の語は<b>他のシステム（ゲームのプラグイン等）のもの</b>で、BM BOARD では意味を持たない。AIがよく混ぜてくるので、出てきたら書式から外れている合図。',
            '⚠️These belong to other systems (game plugins, RPG engines) and have <b>no meaning in BM BOARD</b>. If you find yourself reaching for any of them, you are off-spec.')}</p>
    <div class="warn">
      <code>internalName</code>, <code>displayName</code>, <code>description</code>, <code>icon</code>, <code>category</code>, <code>cost</code>, <code>mp</code>, <code>cooldown</code>, <code>actions</code> (as array), <code>PROJECTILE</code>, <code>particle</code>, <code>onHit</code>, <code>effect</code>, <code>range</code>, <code>power</code>, <code>type</code> (top-level), <code>magic create</code>, <code>/bmboard</code>, <code>/reload</code>, <code>plugins/</code>, <code>skills/</code>, <code>give</code>, server-side, mod, plugin, manifest
    </div>
  </section>

  <section class="sec">
    <h2>${bi('<code>action</code> の中で使える <code>BM.*</code>', '3. The <code>BM.*</code> API')}</h2>
    <p>${bi('⚠️ここに無いものは使えない。AIに書かせるときは、この表をそのまま渡すのが確実。', '⚠️Nothing outside this table is available. When prompting an AI, hand it this table verbatim.')}</p>
    ${table(0, 15, 'Symbol', 'Meaning')}
  </section>

  <section class="sec">
    <h2>${bi('置けるものと、その設定', '4. Object types and props')}</h2>
    ${table(15, 21, 'type', 'props')}
  </section>

  <section class="sec">
    <h2>${bi('もう少し例', '5. More working examples')}</h2>
    <h3>${bi('いちばん短いもの — 中央に黄色い付箋を置く', '5.1 Minimal — drop a yellow sticky at view center')}</h3>
    ${code(2)}
    <h3>${bi('同じ名前で始めて止める（トグル）', '5.2 Toggle pattern (start / stop on the same command)')}</h3>
    ${code(3)}
    <h3>${bi('選択中のものを使う — 選んだ全部の色を変える', '5.3 Use selection — recolor every selected object')}</h3>
    ${code(4)}
  </section>

  <section class="sec">
    <h2>${bi('登録のしかた', '6. How a spell is registered')}</h2>
    <ul>
      <li>${bi('<b>JSONをターミナルに貼る</b> — 自動で検出して登録される（Enterも要らない）。', '<b>Paste the JSON into the terminal</b> — auto-detected and registered, no Enter needed.')}</li>
      <li>${bi('<b><code>.json</code> ファイルをボードにドラッグ＆ドロップ</b> — 自動で取り込む。', '<b>Drop a <code>.json</code> file onto the canvas</b> — auto-imported.')}</li>
      <li>${bi('<b><code>register 名前 JS</code></b> — 名前とコードを1行で書いて登録する。', '<b><code>register &lt;name&gt; &lt;js&gt;</code></b> — name and raw JS on one line.')}</li>
      <li>${bi('設定 → 魔法の <b>✨「コードから作る」</b> — AI用のプロンプトをコピーして、返ってきたJSONを貼る。', 'Settings → Spells → <b>✨ "create from code"</b> — copy the AI prompt, paste the JSON that comes back.')}</li>
    </ul>
    <p>${bi('登録すると、⌘K に名前で並ぶ。<code>forget 名前</code> で消せる。',
            'Once registered it appears in ⌘K by name. Remove it with <code>forget &lt;name&gt;</code>.')}</p>
  </section>

  <section class="sec">
    <h2>${bi('AIに書かせるためのプロンプト（英語のまま使う）', '7. AI agent system prompt')}</h2>
    <p>${bi('⚠️<b>これは訳さずそのまま貼る。</b>API名や禁止語は英語が正なので、日本語に直すと精度が落ちる。最後の行だけ、作りたいものを日本語で書いてよい。',
            '⚠️Paste this as-is. The API names and banned terms are canonical in English. Describe what you want on the last line.')}</p>
    ${code(5)}
  </section>

  <section class="sec">
    <h2>${bi('配る', 'Sharing')}</h2>
    <p>${bi('作った魔法は<b>1つのJSONとして書き出して人に渡せる</b>。設定 → 魔法の <b>📤</b> から提出すると、自動の一次審査（禁止API・BM APIが実在するか・構文・名前の重複）を通って STORE の一覧に載る。サーバーは無く、費用もかからない。',
            'A spell exports as <b>a single JSON you can hand to someone</b>. Submitting it from Settings → Spells (<b>📤</b>) runs an automatic first review — banned APIs, whether each BM API actually exists, syntax, name collisions — and then it lands in the STORE list. No server, no cost.')}</p>
    <div class="more">
      <a href="store.html">${bi('STOREを見る', 'Browse the STORE')}</a>
      <a href="commands.html">${bi('コマンド一覧', 'Command reference')}</a>
      <a href="usage.html">${bi('使い方', 'How to use')}</a>
      <a href="app.html">${bi('板を開く →', 'Open the board →')}</a>
    </div>
  </section>

  <section class="sec">
    <h2>${bi('この頁の機械可読な写し', '8. Reference')}</h2>
    <ul>
      <li><a href="spell-spec.md"><code>spell-spec.md</code></a> — ${bi('Markdown版', 'Markdown mirror')}</li>
      <li><a href="llms.txt"><code>llms.txt</code></a> — ${bi('AI向けの索引', 'LLM index')}</li>
    </ul>
  </section>
</main>

${footer()}

<script>${ANIM_JS}
${LANG_JS}
</script>
</body>
</html>
`;

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== html) {
    console.error('spell-spec.html が生成物とズレています。'
      + '\n→ node .github/scripts/build-spellspec.mjs を実行して、生成物をコミットしてください。');
    process.exit(1);
  }
  console.log('spell-spec.html OK');
} else {
  fs.writeFileSync(OUT, html);
  console.log(`spell-spec.html を生成しました（${(html.length / 1024).toFixed(0)}KB）`);
}
