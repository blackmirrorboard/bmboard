#!/usr/bin/env node
/**
 * commands.html を app.html の OMNI_CMDS から生成する。
 *
 * ⭐usage.html と同じ理由：手書きの一覧は必ず本体から遅れる。
 *   実際、旧 commands.html は 2026-05-08 で止まっていた（本体は毎日動いている）。
 *
 * 使い方:
 *   node .github/scripts/build-commands.mjs          # 生成
 *   node .github/scripts/build-commands.mjs --check  # ズレていたら落とす（CI用）
 *
 * ⚠️app.html は読むだけ。書き込まない。
 */
import fs from 'node:fs';
import path from 'node:path';
import { extractArray } from './lib/extract.mjs';
import { CSS, head, nav, footer, LANG_JS, FILTER_JS, esc } from './lib/page.mjs';

const ROOT = process.cwd();
const APP = path.join(ROOT, 'app.html');
const OUT = path.join(ROOT, 'commands.html');
const CHECK = process.argv.includes('--check');
const src = fs.readFileSync(APP, 'utf8');

/* 1行の object リテラルを取り出す（カテゴリ名の対訳） */
function extractObject(decl) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error(`${decl} が見つからない`);
  const s = src.indexOf('{', i), e = src.indexOf('};', s);
  return new Function('return ' + src.slice(s, e + 1))();
}

const CMDS = extractArray(src, 'const OMNI_CMDS = [');
const CATS = extractObject('const OMNI_CATS =');
const CATS_EN = extractObject('const OMNI_CATS_EN =');
const ICON = extractObject('const CAT_ICON =');

/* ⭐一覧に出さないもの：言語切替やフォーム行はコマンドではない */
const list = CMDS.filter(c => !c._lang && !c._form && c.cmd);
const subTotal = list.reduce((n, c) => n + ((c.subs || []).length), 0);

/* カテゴリ順＝OMNI_CMDS の登場順（アプリのパレットと同じ並び） */
const order = [];
const groups = {};
list.forEach(c => { if (!groups[c.cat]) { groups[c.cat] = []; order.push(c.cat); } groups[c.cat].push(c); });

const chips = order.map(cat =>
  `      <a class="chip" href="#c-${cat}"><span class="i">${ICON[cat] || '·'}</span><span class="ja">${esc(CATS[cat] || cat)}</span><span class="en">${esc(CATS_EN[cat] || cat)}</span></a>`
).join('\n');

const rowOf = c => {
  const needArg = !!(c.args && !c.argsOpt);
  const searchKey = esc([c.cmd, c.hint, c.hintEn, c.kw, (c.subs || []).map(s => s.join(' ')).join(' ')].join(' ').toLowerCase());
  const subs = (c.subs || []).length
    ? `<small class="subs">${(c.subs || []).map(([a, ja, en]) =>
        `<span class="ja">${esc(c.cmd)} ${esc(a)} — ${esc(ja)}</span><span class="en">${esc(c.cmd)} ${esc(a)} — ${esc(en)}</span>`).join('<br>')}</small>`
    : '';
  return `        <div class="row" data-s="${searchKey}">
          <div class="key"><kbd>${esc(c.cmd)}</kbd>${needArg ? '<span class="arg" title="このコマンドは、名前のあとに言葉や数字を打つ必要があります"><span class="ja">＋打ち込みが要る</span><span class="en">+ needs typing</span></span>' : ''}</div>
          <div class="desc"><span class="ja">${esc(c.hint || '')}</span><span class="en">${esc(c.hintEn || c.hint || '')}</span>${subs}</div>
        </div>`;
};

const sections = order.map(cat => `
    <section class="cat" id="c-${cat}">
      <h2><span class="i">${ICON[cat] || '·'}</span><span class="ja">${esc(CATS[cat] || cat)}</span><span class="en">${esc(CATS_EN[cat] || cat)}</span></h2>
      <div class="rows">
${groups[cat].map(rowOf).join('\n')}
      </div>
    </section>`).join('\n');

const html = `<!doctype html>
<html lang="ja">
<head>
${head({
  title: 'BM BOARD — コマンド / Commands',
  desc: `BM BOARD の全コマンド ${list.length}個（サブコマンド ${subTotal}個）。⌘K を押して名前を打つだけ。日本語 / English。`,
  url: 'https://bmboard.studio/commands.html',
  ogTitle: 'BM BOARD — コマンド一覧',
  ogDesc: `⌘K で呼べる ${list.length} のコマンド。`,
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'BM BOARD のコマンド一覧',
    inLanguage: ['ja', 'en'],
    url: 'https://bmboard.studio/commands.html',
    about: { '@type': 'SoftwareApplication', name: 'BM BOARD', alternateName: ['Black Mirror Board', 'BMBOARD'], url: 'https://bmboard.studio/' },
    author: { '@type': 'Person', name: '木下 貴博', url: 'https://kinoshita.studio/' },
  },
})}
<style>${CSS}
/* この頁だけ：サブコマンドと「打ち込みが要る」バッジ */
.legend{margin-top:26px;padding:20px 22px;border:1px solid var(--line);border-radius:14px;
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.012));
  font-size:13.5px;line-height:1.95;color:var(--dim)}
.legend p+p{margin-top:10px}
.legend b{color:var(--fg);font-weight:600}
.subs{color:var(--dim2);line-height:1.9}
.arg{font-size:11px;color:#ff9d7a;white-space:nowrap;cursor:help}
</style>
</head>
<body>
<div class="glow"><i></i><i></i></div>

${nav('commands.html')}

<main class="shell">
  <header class="head">
    <h1><span class="ja">コマンド</span><span class="en">Commands</span></h1>
    <p class="sub">
      <span class="ja"><b>⌘K</b> を押して、名前を打つ。<br>覚える必要はない——思いついた言葉で引くと候補が出る。</span>
      <span class="en">Hit <b>⌘K</b> and type the name.<br>No need to memorize — type what comes to mind and it shows up.</span>
    </p>
    <p class="count">${order.length} groups &nbsp;·&nbsp; ${list.length} commands &nbsp;·&nbsp; ${subTotal} subcommands</p>
  </header>

  <div class="legend">
    <p>
      <span class="ja"><b>＋打ち込みが要る</b> ＝ コマンド名だけでは動かず、そのあとに言葉や数字を続けて打つもの。
        たとえば <code>calc</code> は <code>calc 12*8</code>、<code>t</code> は <code>t アイデア</code> のように使う。
        ⌘K でこのコマンドを選ぶと、打ち込みを待つ状態になる。</span>
      <span class="en"><b>+ needs typing</b> means the name alone does nothing — you type a word or number after it.
        <code>calc</code> becomes <code>calc 12*8</code>; <code>t</code> becomes <code>t idea</code>.
        Picking it in ⌘K puts you in a "waiting for input" state.</span>
    </p>
    <p>
      <span class="ja"><b>下の小さい行</b>（<code>board a4</code> など）はサブコマンド。打ち込みの代わりに、そのまま選んで実行できる。</span>
      <span class="en">The <b>small lines underneath</b> (like <code>board a4</code>) are subcommands — pick one instead of typing.</span>
    </p>
  </div>

  <div class="tools">
    <input id="q" type="search" autocomplete="off" placeholder="絞り込む — flip / spell / export …">
    <div class="chips">
${chips}
    </div>
  </div>

  <div id="list">
${sections}
    <p class="empty" id="empty"><span class="ja">見つからない。別の言葉で打ってみて。</span><span class="en">Nothing found — try another word.</span></p>
  </div>

  <div class="card">
    <h3><span class="ja">1キーで順番に送る</span><span class="en">Cycle with one key</span></h3>
    <p>
      <span class="ja">ショートカットは1つのコマンドにしか付かない。だから状態が3つ以上あるものは、<code>board next</code> <code>grade</code> <code>theme</code> <code>drawmode</code> <code>crumb next</code> で<b>順番に送れる</b>ようにしてある。狙って飛びたいときは <code>board a4</code> のように直接。</span>
      <span class="en">A shortcut can only point at one command, so anything with three or more states can be cycled: <code>board next</code>, <code>grade</code>, <code>theme</code>, <code>drawmode</code>, <code>crumb next</code>. To jump straight to one, name it — <code>board a4</code>.</span>
    </p>
  </div>

  <div class="card">
    <h3><span class="ja">自分のキーを決める・自分の呼び名を付ける</span><span class="en">Your keys, your names</span></h3>
    <p>
      <span class="ja"><code>⌘,</code> → コマンド から、どのコマンドにも好きなキーを割り当てられる。「呼び名」を付ければ、自分の言葉（例：アトリエ）で引ける。<br>⚠️<b>＋打ち込みが要る</b>コマンドにキーを付けても、押した時に<b>打ち込み待ちになるだけ</b>。すぐ動かしたいならサブコマンド（<code>board a4</code> など）の側に付ける。</span>
      <span class="en">Open <code>⌘,</code> → Commands to bind any key, or give a command your own name so you can find it your way.<br>⚠️Binding a key to a <b>+ needs typing</b> command only opens the palette and waits — bind a subcommand (<code>board a4</code>) instead.</span>
    </p>
    <div class="more">
      <a href="usage.html"><span class="ja">使い方</span><span class="en">How to use</span></a>
      <a href="spell-spec.html"><span class="ja">魔法の書式</span><span class="en">Spell format</span></a>
      <a href="app.html"><span class="ja">とにかく触る →</span><span class="en">Just open it →</span></a>
    </div>
  </div>

  <div class="card">
    <h3><span class="ja">ここに無いもの</span><span class="en">Not on this list</span></h3>
    <p>
      <span class="ja">自分で作った<b>魔法・スニペット・連鎖・リンク</b>も ⌘K に並ぶ。それは人によって違うので、この一覧には出てこない。</span>
      <span class="en">Your own <b>spells, snippets, chains and links</b> also live in ⌘K. Those differ per person, so they are not listed here.</span>
    </p>
  </div>
</main>

${footer()}

<script>${LANG_JS}
${FILTER_JS}
</script>
</body>
</html>
`;

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== html) {
    console.error('commands.html が OMNI_CMDS とズレています。'
      + '\n→ node .github/scripts/build-commands.mjs を実行して、生成物をコミットしてください。');
    process.exit(1);
  }
  console.log(`commands.html OK（${list.length}コマンド / ${subTotal}サブ）`);
} else {
  fs.writeFileSync(OUT, html);
  console.log(`commands.html を生成しました（${order.length}まとまり / ${list.length}コマンド / ${subTotal}サブ / ${(html.length / 1024).toFixed(0)}KB）`);
}
