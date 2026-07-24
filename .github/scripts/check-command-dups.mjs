/**
 * コマンド名の重複検出
 *
 * ⚠️なぜ要るか:
 *   app.html の runCommand は「巨大な if 連鎖の先勝ち」。同じ名前を後から足すと
 *   **前の実装がエラーも出さずに到達不能になる**。テストは「例外が出ない」しか見ないので素通りする。
 *   2026-07-24 の1日で3件やられた（align / board / dark）。
 *
 * 使い方:
 *   node .github/scripts/check-command-dups.mjs           # 重複があれば exit 1
 *   node .github/scripts/check-command-dups.mjs --list     # 全コマンドを出す
 *
 * 意図的に同名を2箇所置いている場合は ALLOW に理由つきで書く（書かないと落ちる）。
 */
import fs from 'node:fs';

const FILE = process.argv.find(a => a.endsWith('.html')) || 'app.html';

/* 意図的な重複＝引数の有無などで先行ハンドラが「譲る」作りになっているもの。
   足すときは必ず理由を書くこと。理由なく増やさない。 */
const ALLOW = {
  board: '引数ありならボードサイズ、引数なしなら「紙→黒板に戻す」。先行側が rest!=="" で判定して譲る',
  dark:  '数値引数なら鉛筆の濃さ、引数なしならテーマ切替。先行側が /^\\d/ で判定して譲る',
};

const src = fs.readFileSync(FILE, 'utf8');

// head === 'x' / head == 'x' を全部拾って行番号を持つ
const hits = new Map();
const lines = src.split('\n');
lines.forEach((line, i) => {
  // ⚠️分岐の「条件式」だけを数える。ハンドラ本体の中の head==='x'（三項演算子など）は
  //   分岐を増やさないので数えてはいけない（mute/unmute で誤検知した）。
  if (!/\bif\s*\(/.test(line)) return;
  for (const m of line.matchAll(/head\s*===?\s*'([^']{1,24})'/g)) {
    const name = m[1];
    if (!hits.has(name)) hits.set(name, []);
    // 同じ行に2回出るのは or 条件（head==='mute'||head==='unmute'）なので1回として数える
    const arr = hits.get(name);
    if (arr[arr.length - 1] !== i + 1) arr.push(i + 1);
  }
});

if (process.argv.includes('--list')) {
  console.log([...hits.keys()].sort().join('\n'));
  process.exit(0);
}

const dups = [...hits.entries()].filter(([, ls]) => ls.length > 1);
const bad  = dups.filter(([n]) => !ALLOW[n]);
const okd  = dups.filter(([n]) => ALLOW[n]);

console.log(`コマンド総数: ${hits.size}（${FILE}）`);
if (okd.length) {
  console.log('\n意図的な重複（許可済み）:');
  for (const [n, ls] of okd) console.log(`  ${n}  行 ${ls.join(', ')}\n    理由: ${ALLOW[n]}`);
}

if (!bad.length) {
  console.log('\n✅ 意図しない重複はありません');
  process.exit(0);
}

console.log('\n❌ 意図しない重複が見つかりました');
console.log('   先に一致した方だけが実行され、後ろの実装は到達不能になります。\n');
for (const [n, ls] of bad) {
  console.log(`  '${n}'  行 ${ls.join(', ')}`);
  for (const l of ls) console.log(`      ${l}: ${lines[l - 1].trim().slice(0, 110)}`);
}
console.log('\n直し方:');
console.log('  ・どちらかを消す（残す方は既存の完成度が高い方を選ぶ）');
console.log('  ・両方残すなら、先行ハンドラに「譲る条件」を書いて ALLOW に理由を追記する');
process.exit(1);
