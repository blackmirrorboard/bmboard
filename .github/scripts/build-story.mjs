#!/usr/bin/env node
/**
 * story.html（つくった理由・名前の由来）を生成する。
 *
 * ⭐本文はこのファイルが正。手で story.html を書き換えると次の生成で消える。
 *   ⚠️旧 story.html は v1.2 の頃の話のまま止まっていた（499KB・$sakura 記法・
 *     「Terminal Magic」など、今と違う名前と数字が残っていた）。
 *
 * ⚠️名前の由来は「黒い鏡」までしか書かない。にこちゃんが何者かは書かない
 *   （木下：謎は謎でいい）。影響元の作品名・製品名も公開ファイルには書かない。
 *
 * 使い方:
 *   node .github/scripts/build-story.mjs          # 生成
 *   node .github/scripts/build-story.mjs --check  # ズレていたら落とす（CI用）
 */
import fs from 'node:fs';
import path from 'node:path';
import { CSS, head, nav, footer, LANG_JS } from './lib/page.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'story.html');
const CHECK = process.argv.includes('--check');

/* 節＝[小見出し, 日本語, English]。増やす時はここに1つ足す */
const SECTIONS = [
  ['01',
   { h: '名前の話', p: `電源を落としたディスプレイは、<b>黒い鏡</b>になる。そこに映るのは、部屋と、自分の顔だ。<br><br>
     BM BOARD＝<b>Black Mirror Board</b>。何かを映すための板ではなく、<b>こちらを映し返す板</b>という意味で付けた。
     画面の前に座って、考えていることをそのまま出す場所。<br><br>
     ——にこちゃんが誰なのかは、書かない。` },
   { h: 'About the name', p: `A display with the power off becomes a <b>black mirror</b>. What you see in it is the room, and your own face.<br><br>
     BM BOARD is short for <b>Black Mirror Board</b> — named not for what it shows you, but for the fact that <b>it reflects you back</b>.
     A place to sit in front of and put down what you are actually thinking.<br><br>
     — Who the smiley is, I am not going to say.` }],

  ['02',
   { h: '手で書く。キーで動かす。', p: `紙の手ざわりと、キーの速さは、ふつう別の道具に分かれている。
     紙に書けば速く考えられるが、直せない。デジタルは直せるが、手が動く前に道具を選ばされる。<br><br>
     BM BOARD は、その2つを<b>同じ面に置いた</b>。鉛筆で書きなぐる。整えたくなったら <b>⌘K</b> を押して言葉を打つ。
     覚えるのはそれだけでいい。` },
   { h: 'Write by hand. Move at speed.', p: `The feel of paper and the speed of a keyboard usually live in different tools.
     Paper lets you think fast but never lets you undo. Digital lets you undo, but makes you pick a tool before your hand can move.<br><br>
     BM BOARD puts both <b>on the same surface</b>. Scribble in pencil. When you want to tidy up, hit <b>⌘K</b> and type.
     That is the only thing to remember.` }],

  ['03',
   { h: '消せないから、書きなぐれる', p: `鉛筆は、1本の線では引けない。何度もしゃしゃっと引いて、だんだん形になる。
     1本で決めるのはペンや筆の作法で、鉛筆のそれではない。<br><br>
     だから描き味は<b>黒鉛の粒を連打する</b>方式にした。消しゴムは消しカスを出し、払わないと残る。
     紙は裏返せて、裏に書くと表がうっすら透ける。<br><br>
     効率のためではない。<b>不可逆なものの前でしか出てこない線</b>があるからだ。` },
   { h: 'You scribble because it does not erase cleanly', p: `A pencil line is never one stroke. You scratch at it again and again until a shape appears.
     Committing in a single stroke is what pens and brushes do — not pencils.<br><br>
     So the stroke is built by <b>stamping grains of graphite</b> along the path. The eraser leaves crumbs, and they stay until you sweep them.
     The sheet flips over, and what is on the front bleeds faintly through.<br><br>
     None of this is for efficiency. Some lines only appear <b>in front of something you cannot undo</b>.` }],

  ['04',
   { h: '道具は、自分で足せる', p: `よく使う形や動きは「<b>魔法</b>」として名前を付けて保存できる。選んで名前を付けるだけのものも、
     コードで書いた動きのあるものも作れる。<br><br>
     作った魔法は<b>1つのJSONとして書き出して、人に配れる</b>。他の人が作ったものは STORE から入れられる。
     サーバーは無い。審査を通ったものが一覧のファイルに載るだけだ。<br><br>
     道具が育つ速さを、作者の想像力に縛られないようにしたかった。` },
   { h: 'You can add your own tools', p: `Shapes and motions you use often can be saved as a <b>spell</b> with a name — either a plain arrangement you selected,
     or something animated that you wrote in code.<br><br>
     A spell exports as <b>a single JSON file you can hand to someone</b>, and spells other people made can be installed from the STORE.
     There is no server; reviewed entries simply land in a list file.<br><br>
     The point is that how fast the tool grows should not be capped by the imagination of its author.` }],

  ['05',
   { h: '1ファイル、アカウント不要', p: `本体は <code>app.html</code> という<b>1つのファイル</b>（今は約17,000行）。ビルドもフレームワークも使っていない。
     読み込む外部ライブラリはゼロ——読むのは、板に置ける日本語フォントだけ。<br><br>
     アカウント登録は無い。描いたものは<b>あなたの端末の中</b>に残る。オフラインでも開く。<br><br>
     依存はいつか裏切る。ブラウザが標準で持っているものだけで組めば、10年後も同じように開く。` },
   { h: 'One file, no account', p: `The whole thing is <b>a single file</b> called <code>app.html</code> — around 17,000 lines today. No build step, no framework.
     Zero external libraries; the only thing it fetches is the Japanese fonts you can place on the board.<br><br>
     There is no sign-up. What you draw stays <b>on your device</b>, and it opens offline.<br><br>
     Dependencies betray you eventually. Built only from what the browser already ships, it will still open the same way in ten years.` }],

  ['06',
   { h: 'つくっている人', p: `滋賀・琵琶湖のそばで、<b>kinoshita studio</b>（木下貴博）が一人で作っている。
     UI/UXデザインとアートディレクションを本業にしながら、自分が毎日使う道具として書き続けているもの。<br><br>
     直したい所は、たいてい自分が今日つまずいた所だ。` },
   { h: 'Who makes it', p: `Made by one person — <b>kinoshita studio</b> (Takahiro Kinoshita), by Lake Biwa in Shiga, Japan.
     A designer and art director by trade, writing this as the tool he uses every day.<br><br>
     Whatever gets fixed next is usually whatever tripped him up today.` }],
];

const sections = SECTIONS.map(([n, ja, en]) => `
    <section class="chap">
      <p class="num">— ${n}</p>
      <h2><span class="ja">${ja.h}</span><span class="en">${en.h}</span></h2>
      <div class="body"><span class="ja">${ja.p}</span><span class="en">${en.p}</span></div>
    </section>`).join('\n');

const html = `<!doctype html>
<html lang="ja">
<head>
${head({
  title: 'BM BOARD — つくった理由 / Story',
  desc: 'BM BOARD（Black Mirror Board）をつくった理由と、名前の由来。紙の手ざわりと ⌘K の速さを同じ面に置くまで。滋賀・琵琶湖の kinoshita studio による個人開発。',
  url: 'https://bmboard.studio/story.html',
  ogTitle: 'BM BOARD — つくった理由',
  ogDesc: '電源を落とした画面は黒い鏡になる。名前の由来と、紙と鉛筆をデジタルに持ち込んだ理由。',
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'BM BOARD をつくった理由',
    inLanguage: ['ja', 'en'],
    url: 'https://bmboard.studio/story.html',
    about: { '@type': 'SoftwareApplication', name: 'BM BOARD', alternateName: ['Black Mirror Board', 'BMBOARD'], url: 'https://bmboard.studio/' },
    author: { '@type': 'Person', name: '木下 貴博', alternateName: 'Takahiro Kinoshita', url: 'https://kinoshita.studio/' },
    publisher: { '@type': 'Organization', name: 'kinoshita studio', url: 'https://kinoshita.studio/' },
  },
})}
<style>${CSS}
/* この頁だけ：読み物のための組み */
.chap{padding:54px 0;border-top:1px solid var(--line);max-width:720px}
.chap:first-of-type{border-top:0}
.num{font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--dim2)}
.chap h2{margin-top:14px;font-size:clamp(22px,3.4vw,32px);font-weight:700;letter-spacing:-.015em;line-height:1.4}
.chap .body{margin-top:20px;font-size:15.5px;line-height:2.05;color:var(--dim)}
.chap .body b{color:var(--fg);font-weight:600}
.mark{margin:70px 0 0;padding:34px 0 0;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:11.5px;letter-spacing:.1em;color:var(--dim2)}
</style>
</head>
<body>
<div class="glow"><i></i><i></i></div>

${nav('story.html')}

<main class="shell">
  <header class="head">
    <h1><span class="ja">つくった理由</span><span class="en">Story</span></h1>
    <p class="sub">
      <span class="ja">名前の由来と、紙と鉛筆をデジタルに持ち込んだ理由。</span>
      <span class="en">Where the name came from, and why paper and pencil ended up here.</span>
    </p>
  </header>

${sections}

  <p class="mark">BM BOARD = Black Mirror Board &nbsp;·&nbsp; kinoshita studio &nbsp;·&nbsp; Shiga, Japan</p>

  <div class="card">
    <h3><span class="ja">触ってみる</span><span class="en">Try it</span></h3>
    <p><span class="ja">読むより速い。ブラウザで開いて、鉛筆で1本引いてみてほしい。</span>
       <span class="en">Faster than reading about it — open it and draw one line.</span></p>
    <div class="more">
      <a href="app.html"><span class="ja">ブラウザで開く →</span><span class="en">Open in browser →</span></a>
      <a href="usage.html"><span class="ja">使い方</span><span class="en">How to use</span></a>
      <a href="https://kinoshita.studio/">kinoshita studio →</a>
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
    console.error('story.html が build-story.mjs とズレています。'
      + '\n→ node .github/scripts/build-story.mjs を実行して、生成物をコミットしてください。');
    process.exit(1);
  }
  console.log(`story.html OK（${SECTIONS.length}節）`);
} else {
  fs.writeFileSync(OUT, html);
  console.log(`story.html を生成しました（${SECTIONS.length}節 / ${(html.length / 1024).toFixed(0)}KB）`);
}
