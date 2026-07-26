/**
 * app.html の中の配列リテラルを取り出す。
 * ⚠️正規表現では取れない（中に ] や引用符やコメントが入る）。
 *    括弧の釣り合いで端を探し、文字列の中の括弧は数えない。
 */
export function extractArray(src, decl) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error(`app.html に ${decl} が見つからない`);
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
  if (end < 0) throw new Error(`${decl} の終わりが見つからない`);
  return new Function('return ' + src.slice(start, end))();
}
