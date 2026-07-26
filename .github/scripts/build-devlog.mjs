#!/usr/bin/env node
/**
 * dev-log.html を .github/data/dev-log.json から生成する。
 *
 * ⚠️旧 dev-log.html は v1.3（2026-06-15）で止まっていて、その後の
 *   紙と鉛筆・⌘K・魔法/STORE・公開・サイト刷新が1行も入っていなかった。
 *   本文はデータ（JSON）に移し、ページは共通の顔で組み直す。
 *
 * ⭐エントリを足す時は .github/data/dev-log.json に1つ足して、これを実行する。
 * ⚠️このログは書いた言語のまま出す（英語で書いた過去のエントリを機械的に訳したりしない）。
 *
 * 使い方:
 *   node .github/scripts/build-devlog.mjs          # 生成
 *   node .github/scripts/build-devlog.mjs --check  # ズレていたら落とす（CI用）
 */
import fs from 'node:fs';
import path from 'node:path';
import { CSS, head, nav, footer, LANG_JS } from './lib/page.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dev-log.html');
const DATA = path.join(ROOT, '.github/data/dev-log.json');
const CHECK = process.argv.includes('--check');

const entries = JSON.parse(fs.readFileSync(DATA, 'utf8'));

/* 日付の先頭にある YYYY-MM-DD で新しい順に並べる（同日は元の順を保つ） */
const key = e => (String(e.date).match(/\d{4}-\d{2}-\d{2}/) || ['0000-00-00'])[0];
const sorted = entries.map((e, i) => ({ e, i })).sort((a, b) =>
  key(b.e).localeCompare(key(a.e)) || b.i - a.i).map(x => x.e);

/* ⭐日英の出し分け。⚠️片方しか無いエントリは、その言語のまま両方で出す
   （無い言語を空にすると、切り替えた瞬間に記録が消えて見える＝入口が死ぬのと同じ） */
const bi = v => {
  if (v && typeof v === 'object') {
    const ja = v.ja || v.en || '', en = v.en || v.ja || '';
    return `<span class="ja">${ja}</span><span class="en">${en}</span>`;
  }
  return String(v == null ? '' : v);
};

const list = sorted.map(e => `
    <article class="entry">
      <div class="meta">
        <span class="tag">${bi(e.tag)}</span>
        <span class="when">${e.date}</span>
      </div>
      <h2>${bi(e.title)}</h2>
      <ul>
${e.items.map(it => `        <li>${bi(it)}</li>`).join('\n')}
      </ul>
    </article>`).join('\n');

const html = `<!doctype html>
<html lang="ja">
<head>
${head({
  title: 'BM BOARD — 開発ログ / Dev log',
  desc: `BM BOARD の開発記録。v0.1 のプロトタイプから今日まで、${entries.length}回分の作業と、そこで踏んだ問題の記録。`,
  url: 'https://bmboard.studio/dev-log.html',
  ogTitle: 'BM BOARD — 開発ログ',
  ogDesc: `v0.1 から今日まで、${entries.length}回分の記録。`,
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'BM BOARD 開発ログ',
    inLanguage: ['ja', 'en'],
    url: 'https://bmboard.studio/dev-log.html',
    about: { '@type': 'SoftwareApplication', name: 'BM BOARD', alternateName: ['Black Mirror Board', 'BMBOARD'], url: 'https://bmboard.studio/' },
    author: { '@type': 'Person', name: '木下 貴博', url: 'https://kinoshita.studio/' },
  },
})}
<style>${CSS}
/* この頁だけ：時系列の記録 */
.entry{padding:40px 0;border-top:1px solid var(--line);max-width:820px}
.entry:first-of-type{border-top:0}
.entry .meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:12px;
  font-family:var(--mono);font-size:11px;letter-spacing:.08em}
.entry .tag{color:var(--fg);background:rgba(255,255,255,.07);
  border:1px solid var(--line);border-radius:999px;padding:4px 11px}
.entry .when{color:var(--dim2)}
.entry h2{margin-top:14px;font-size:clamp(19px,2.4vw,25px);font-weight:700;letter-spacing:-.01em;line-height:1.5}
.entry ul{margin-top:16px;padding-left:0;list-style:none}
.entry li{position:relative;padding-left:20px;margin-top:10px;font-size:14.5px;line-height:1.95;color:var(--dim)}
.entry li::before{content:'';position:absolute;left:4px;top:.85em;width:5px;height:1px;background:var(--dim2)}
.entry li b{color:var(--fg);font-weight:600}
</style>
</head>
<body>
<div class="glow"><i></i><i></i></div>

${nav('dev-log.html')}

<main class="shell">
  <header class="head">
    <h1><span class="ja">開発ログ</span><span class="en">Dev log</span></h1>
    <p class="sub">
      <span class="ja">v0.1 のプロトタイプから今日まで。何を作ったかと、そこで踏んだ問題の記録。</span>
      <span class="en">From the v0.1 prototype to today — what got built, and what broke on the way.</span>
    </p>
    <p class="count">${entries.length} entries &nbsp;·&nbsp; 2026-04-08 → ${key(sorted[0])}</p>
  </header>

${list}

  <div class="card">
    <h3><span class="ja">今どうなっているか</span><span class="en">Where it is now</span></h3>
    <p><span class="ja">記録より、動いているものの方が速い。ブラウザで開いて確かめてほしい。</span>
       <span class="en">The running thing is faster than the log. Open it and see.</span></p>
    <div class="more">
      <a href="app.html"><span class="ja">ブラウザで開く →</span><span class="en">Open in browser →</span></a>
      <a href="usage.html"><span class="ja">使い方</span><span class="en">How to use</span></a>
      <a href="story.html"><span class="ja">つくった理由</span><span class="en">Story</span></a>
    </div>
  </div>
</main>

${footer()}

<script>${LANG_JS}
</script>
</body>
</html>
`;

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== html) {
    console.error('dev-log.html が .github/data/dev-log.json とズレています。'
      + '\n→ node .github/scripts/build-devlog.mjs を実行して、生成物をコミットしてください。');
    process.exit(1);
  }
  console.log(`dev-log.html OK（${entries.length}エントリ）`);
} else {
  fs.writeFileSync(OUT, html);
  console.log(`dev-log.html を生成しました（${entries.length}エントリ / ${(html.length / 1024).toFixed(0)}KB）`);
}
