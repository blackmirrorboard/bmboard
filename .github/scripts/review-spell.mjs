/**
 * 魔法(spell)の自動一次審査
 *
 * Issue本文から JSON を取り出して機械チェックする。人が目視で見落とす部分を先に潰すのが目的で、
 * ここを通っても最終判断は人間がやる（自動マージはしない）。
 *
 * 単体でも動く:
 *   node .github/scripts/review-spell.mjs <issue本文が入ったファイル>
 * GitHub Actions からは環境変数 ISSUE_BODY で渡す。
 */
import fs from 'node:fs';
import path from 'node:path';

/* アプリ側 (app.html) と揃える ─────────────────────────────
   STORE_OP_TYPES と BM API はここと app.html の2箇所にある。
   片方だけ変えると審査と実際の動作がズレるので、変更時は必ず両方直すこと。 */
const OP_TYPES = ['square', 'sticky', 'text', 'circle', 'triangle', 'arrow'];
const BM_API = ['all', 'clear', 'create', 'exportSvg', 'find', 'getById', 'getMode', 'getSelected',
                'log', 'rand', 'redraw', 'remove', 'save', 'setFill', 'setMode', 'setStroke',
                'translate', 'update', 'viewCenter'];

/* 使われていたら止めるもの。ボードを描く以外のことをしようとしている合図 */
const BANNED = [
  [/\bfetch\s*\(/,                      'fetch（外部通信）'],
  [/\bXMLHttpRequest\b/,                'XMLHttpRequest（外部通信）'],
  [/\bWebSocket\b/,                     'WebSocket（外部通信）'],
  [/\bimport\s*\(/,                     'import()（外部コードの読み込み）'],
  [/\brequire\s*\(/,                    'require（外部コードの読み込み）'],
  [/\beval\s*\(/,                       'eval（任意コード実行）'],
  [/\bnew\s+Function\b/,                'new Function（任意コード実行）'],
  [/\bdocument\b/,                      'document（DOM直接操作）'],
  [/\bwindow\s*\[/,                     'window[...]（グローバルへの間接アクセス）'],
  [/\blocalStorage\b|\bsessionStorage\b/,'ストレージへの直接アクセス'],
  [/\bindexedDB\b/,                     'IndexedDB への直接アクセス'],
  [/\bpostMessage\b/,                   'postMessage'],
  [/\bnavigator\b/,                     'navigator'],
  [/\blocation\b/,                      'location（画面遷移）'],
  [/\bcookie\b/i,                        'cookie'],
  [/\bServiceWorker\b/i,                'ServiceWorker'],
  [/\batob\s*\(|\bbtoa\s*\(/,           'atob/btoa（難読化の疑い）'],
  [/\\x[0-9a-fA-F]{2}/,                 '\\xNN エスケープ（難読化の疑い）'],
  [/\\u00[0-9a-fA-F]{2}/,               '\\uNNNN エスケープ（難読化の疑い）'],
];

/* 止めはしないが人に見てほしいもの */
const WARN = [
  [/while\s*\(\s*(true|1)\s*\)/,        'while(true) — 無限ループの疑い'],
  [/for\s*\(\s*;\s*;\s*\)/,             'for(;;) — 無限ループの疑い'],
  [/setInterval\s*\(/,                  'setInterval — 止める手段があるか確認（window._<name>Id にidを持たせてトグルにする作法）'],
  [/setTimeout\s*\([^,]*,\s*\d{5,}\)/,  '非常に長い setTimeout'],
];

export function extractJson(body) {
  if (!body) return { json: null, raw: null, err: '本文が空です' };
  const cands = [];
  const fences = [...body.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map(m => m[1]);
  cands.push(...fences);
  const brace = body.match(/\{[\s\S]*\}/);
  if (brace) cands.push(brace[0]);
  for (const c of cands) {
    const t = (c || '').trim();
    if (!t.startsWith('{')) continue;
    try {
      const o = JSON.parse(t);
      if (o && typeof o === 'object') return { json: o, raw: t, err: null };
    } catch (e) {
      // 最後の候補で落ちたらそのエラーを返す
      if (c === cands[cands.length - 1]) return { json: null, raw: t, err: 'JSONとして読めません: ' + e.message };
    }
  }
  return { json: null, raw: null, err: 'JSONが見つかりません（```json のブロックに貼ってください）' };
}

export function review(spell, existingNames = []) {
  const errors = [], warns = [], notes = [];
  if (!spell || typeof spell !== 'object') return { ok: false, errors: ['JSONがオブジェクトではありません'], warns, notes, kind: '?' };

  const name = (spell.name || spell.command || '').trim();
  if (!name) errors.push('`name` がありません');
  else if (!/^[\p{L}\p{N}][\p{L}\p{N}_-]{0,30}$/u.test(name.toLowerCase()))
    errors.push(`\`name\` に使えない文字が入っています（空白・記号は不可）: \`${name}\``);
  if (existingNames.map(x => x.toLowerCase()).includes(name.toLowerCase()))
    errors.push(`\`name\` が既存の魔法と重複しています: \`${name}\``);

  if (!spell.icon) warns.push('`icon`（絵文字1つ）が未設定です');
  else if ([...String(spell.icon)].length > 4) warns.push('`icon` が長すぎます（絵文字1つを推奨）');
  if (!spell.desc) warns.push('`desc`（短い説明）が未設定です');
  if (!spell.author) warns.push('`author`（公開時に表示される作者名）が未設定です');

  const hasOps = Array.isArray(spell.ops) && spell.ops.length;
  const hasAct = typeof spell.action === 'string' && spell.action.trim();
  const hasObj = Array.isArray(spell.objects) && spell.objects.length;
  let kind = hasAct ? 'code' : (hasOps ? 'ops' : (hasObj ? 'objects' : '?'));

  if (!hasOps && !hasAct && !hasObj) errors.push('`ops` / `action` / `objects` のどれも入っていません');
  if (hasAct && hasOps) warns.push('`action` と `ops` の両方があります（`action` が優先されます）');

  if (hasOps) {
    spell.ops.forEach((o, i) => {
      if (!o || typeof o !== 'object') { errors.push(`ops[${i}] がオブジェクトではありません`); return; }
      if (!OP_TYPES.includes(o.type))
        errors.push(`ops[${i}].type \`${o.type}\` は許可されていません（使えるのは ${OP_TYPES.join(' / ')}）`);
    });
    if (spell.ops.length > 200) warns.push(`ops が ${spell.ops.length} 個あります（多すぎないか確認）`);
  }

  if (hasAct) {
    const src = String(spell.action);
    notes.push(`コードの長さ: ${src.length} 文字`);
    if (src.length > 8000) warns.push('コードが8000文字を超えています（長すぎないか確認）');
    for (const [re, label] of BANNED) if (re.test(src)) errors.push(`禁止: **${label}** を使っています`);
    for (const [re, label] of WARN)   if (re.test(src)) warns.push(label);
    // BM.xxx の xxx が API に無いもの
    const used = [...src.matchAll(/\bBM\s*\.\s*([a-zA-Z_$][\w$]*)/g)].map(m => m[1]);
    const unknown = [...new Set(used)].filter(x => !BM_API.includes(x));
    if (unknown.length) errors.push(`BM API に無いものを呼んでいます: ${unknown.map(x => '`BM.' + x + '`').join(', ')}`);
    if (used.length && !/BM\s*\.\s*redraw\s*\(/.test(src)) warns.push('`BM.redraw()` で終わっていないかもしれません（描いたものが反映されない場合があります）');
    if (/setInterval\s*\(/.test(src) && !/window\._[\w$]+Id/.test(src))
      warns.push('アニメを `window._<name>Id` に持たせてトグルにする作法になっていません（2回目の実行で止められません）');
    // 構文が通るか（実行はしない）
    try { new Function('BM', 'args', src); }
    catch (e) { errors.push('コードの構文エラー: ' + e.message); }
  }

  return { ok: errors.length === 0, errors, warns, notes, kind, name };
}

export function toComment(r, entry) {
  const L = [];
  L.push(r.ok ? '## ✅ 自動チェック: 通過' : '## ❌ 自動チェック: 修正が必要です');
  L.push('');
  L.push(`種類: **${r.kind === 'code' ? '⚡ コード魔法（実行時にJSが走ります）' : r.kind === 'ops' ? '図形（コードなし）' : r.kind}**`);
  if (r.name) L.push(`名前: \`${r.name}\``);
  L.push('');
  if (r.errors.length) { L.push('### 直してほしいところ'); r.errors.forEach(e => L.push(`- ❌ ${e}`)); L.push(''); }
  if (r.warns.length)  { L.push('### 確認したいところ');   r.warns.forEach(e => L.push(`- ⚠️ ${e}`));  L.push(''); }
  if (r.notes.length)  { L.push('<details><summary>詳細</summary>'); L.push(''); r.notes.forEach(e => L.push(`- ${e}`)); L.push(''); L.push('</details>'); L.push(''); }
  if (r.ok && entry) {
    L.push('### メンテナ向け — `store/catalog.json` の `spells` に追記する分');
    L.push('```json');
    L.push(JSON.stringify(entry, null, 2));
    L.push('```');
    L.push('');
  }
  L.push('---');
  L.push('これは自動チェックです。**通過しても最終判断は人が行います**（特にコード魔法は中身を読んでから公開します）。');
  return L.join('\n');
}

/* ── 実行 ───────────────────────────────────────────── */
const isMain = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (isMain) {
  const file = process.argv[2];
  const body = file ? fs.readFileSync(file, 'utf8') : (process.env.ISSUE_BODY || '');
  const author = process.env.ISSUE_AUTHOR || '';
  let existing = [];
  try {
    const cat = JSON.parse(fs.readFileSync('store/catalog.json', 'utf8'));
    existing = (cat.spells || cat).map(x => x.name).filter(Boolean);
  } catch (_) {}

  const { json, err } = extractJson(body);
  let out, ok;
  if (!json) {
    ok = false;
    out = ['## ❌ 自動チェック: JSONを読み取れませんでした', '', `- ${err}`, '',
           'アプリの **設定 → 魔法タブ → 📤** から出た JSON を、そのまま ```json のブロックに貼ってください。'].join('\n');
  } else {
    const r = review(json, existing);
    ok = r.ok;
    const entry = Object.assign({}, json);
    if (!entry.author && author) entry.author = author;
    delete entry.command;
    out = toComment(r, entry);
  }
  fs.writeFileSync(process.env.OUT_FILE || 'review-comment.md', out, 'utf8');
  console.log(out);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `passed=${ok ? 'true' : 'false'}\n`);
  }
}
