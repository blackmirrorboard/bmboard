---
title: 04. 自作魔法の作り方・BM API
tags: [black-mirror, manual, magic, api, register, v1.2]
created: 2026-04-19
order: 4
---

# 04. 自作魔法の作り方・BM API

> 自分だけの魔法を作って登録する方法。BM API の完全リファレンス付き。

---

## 魔法の仕組み

魔法は「**JavaScript のコード片**」を「**名前付きで保存**」したもの。
ターミナルから名前で呼び出すと、コードが実行される。

### 魔法の最小構成

```
register hello BM.log('hello world!')
```

→ `$ hello` と打つと `[BM] hello world!` がターミナルに出る。

---

## `register` コマンドの使い方

### 書式

```
register <名前> <JavaScriptコード>
```

### 名前のルール

- 英数字・ハイフン・アンダースコアのみ（`a-z0-9_-`）
- 先頭は英数字
- 最大30文字
- 大文字小文字は区別せず小文字化される
- preset と同名は不可（別名にリネームされる）

### 有効な名前の例

```
✅ hello
✅ my-scatter
✅ paint_red
✅ grid4x4
```

### 無効な名前の例

```
❌ 魔法            （日本語）
❌ -start         （先頭ハイフン）
❌ my scatter     （スペース含む）
❌ very-long-name-that-exceeds-thirty-chars   （30文字超）
```

---

## BM API リファレンス

魔法の中から呼び出せる関数群。これ以外は使えないと思ってください。

### 参照・検索系

| API | 戻り値 | 説明 |
|---|---|---|
| `BM.getSelected()` | オブジェクト配列 | 選択中のオブジェクト（複数対応） |
| `BM.all()` | オブジェクト配列 | キャンバス上の全オブジェクト |
| `BM.getById(id)` | オブジェクト or null | ID で検索 |
| `BM.find(fn)` | オブジェクト配列 | 条件関数で検索 |

### 生成・変更系

| API | 説明 |
|---|---|
| `BM.create(type, props?)` | 新規オブジェクト生成（対応5種・下記） |
| `BM.update(obj\|id, patch)` | 既存オブジェクトの属性を一括更新 |
| `BM.translate(obj, dx, dy)` | 移動 |
| `BM.setStroke(obj, color)` | 線の色を変更（例: `'#FF0000'`） |
| `BM.setFill(obj, color)` | 塗りの色を変更 |
| `BM.remove(obj)` | 削除 |
| `BM.clear()` | 全削除 |

### 状態系

| API | 戻り値 | 説明 |
|---|---|---|
| `BM.viewCenter()` | `{x, y}` | 現在のビュー中心座標 |
| `BM.rand(min, max)` | 数値 | 乱数 |
| `BM.getMode()` | 文字列 | 現在のテーマ（`'dark'`/`'light'`/`'gray'`） |
| `BM.setMode(mode)` | — | テーマ切替 |

### 描画・永続化系

| API | 説明 |
|---|---|
| `BM.redraw()` | キャンバス再描画（**変更後は必ず呼ぶ**） |
| `BM.save()` | Undo 履歴に保存（**重要な変更後は呼ぶ**） |
| `BM.log(msg, cls?)` | ターミナルに出力（`cls`: `'t-ok'` / `'t-err'` / `'t-dim'`） |

### 書き出し系

| API | 説明 |
|---|---|
| `BM.exportSvg(objs?)` | 対象オブジェクトを編集可能 SVG として書き出し（v1.2 新規） |

**`BM.exportSvg` の挙動**

- 引数に配列を渡すと、その配列を対象に書き出し
- 引数を省略すると、選択中オブジェクト → 無ければキャンバス全体を自動選択
- 出力: `BM_CANVAS_YYYYMMDD_HHMM.svg` として保存
- Illustrator / Figma / Inkscape で編集可能

```js
// 選択オブジェクトだけ書き出し
BM.exportSvg();

// 円だけ書き出し
BM.exportSvg(BM.find(o => o.type === 'circle'));

// テキストだけ書き出し
BM.exportSvg(BM.find(o => o.type === 'text'));
```

---

## `BM.create` で作れるオブジェクト

**5種類のみ**。それ以外のタイプはエラーになる。

| type | 必須プロパティ | 例 |
|---|---|---|
| `circle` | `cx, cy, rx, ry` | `BM.create('circle', {cx:100, cy:100, rx:50, ry:50})` |
| `square` | `x, y, w, h` | `BM.create('square', {x:0, y:0, w:100, h:100})` |
| `triangle` | `x, y, w, h` | `BM.create('triangle', {x:0, y:0, w:100, h:80})` |
| `arrow` | `x1, y1, x2, y2` | `BM.create('arrow', {x1:0, y1:0, x2:100, y2:0})` |
| `text` | `x, y, text, fontSize` | `BM.create('text', {x:0, y:0, text:'hello', fontSize:20})` |

### ⚠️ 重要：`rect` は無い

四角は `square` を使う。`BM.create('rect', ...)` はエラー：

```
[magic-name] runtime error: BM.create: unknown type "rect"
```

よくある落とし穴。AI に書かせると間違えがち（詳細は [[05_AIに魔法を作らせるガイド|05]]）。

---

## 自作魔法の例（初級〜中級）

### 例1：全オブジェクトを赤くする

```
register paint-red for(const o of BM.all()){BM.setStroke(o,'#FF0000')}BM.redraw();BM.log('painted red!')
```

### 例2：ランダムな円を5個生成

```
register random-circles for(let i=0;i<5;i++){const vc=BM.viewCenter();BM.create('circle',{cx:vc.x+BM.rand(-200,200),cy:vc.y+BM.rand(-200,200),rx:BM.rand(20,60),ry:BM.rand(20,60)})}BM.redraw();BM.log('5 circles spawned')
```

### 例3：選択中を2倍に拡大

```
register scale-up const sel=BM.getSelected();if(!sel.length){BM.log('select first','t-err');return}for(const o of sel){if(o.data.rx){o.data.rx*=2;o.data.ry*=2}if(o.data.w){o.data.w*=2;o.data.h*=2}}BM.redraw();BM.save();BM.log('scaled up '+sel.length+' object(s)')
```

### 例4：フィルムグレイン質感

```
register grain for(let i=0;i<120;i++){const vc=BM.viewCenter();const s=BM.rand(1,3);BM.create('square',{x:vc.x+BM.rand(-400,400),y:vc.y+BM.rand(-300,300),w:s,h:s,fill:null})}BM.redraw();BM.save();BM.log('grain applied — 120 particles')
```

### 例5：選択を右に100px移動

```
register nudge-right const sel=BM.getSelected();for(const o of sel){BM.translate(o,100,0)}BM.redraw();BM.save();BM.log('nudged right')
```

### 例6：全消去（危険だが Cmd+Z で戻せる）

```
register nuke BM.clear();BM.redraw();BM.save();BM.log('everything is gone.')
```

---

## 魔法の書き方の定石

### 必ず `BM.redraw()` を最後に呼ぶ

データを変更しても、再描画しないと画面に反映されない。

```
const o = BM.create('circle', {cx:0, cy:0, rx:50, ry:50});
// BM.redraw() がないと画面に出ない
BM.redraw();
```

### 重要な変更後は `BM.save()` で Undo 履歴に保存

これを呼ばないと Cmd+Z で戻せない。

```
BM.translate(obj, 100, 0);
BM.redraw();
BM.save();   // ← Cmd+Z 対応
```

### エラーメッセージは `'t-err'` で赤く

```
if (!sel.length) { BM.log('select first', 't-err'); return; }
```

### 成功ログで手応えを出す

```
BM.log('done — ' + count + ' object(s) affected');
```

---

## JSON 形式でシェア可能

`register` で作った魔法は、`share <名前>` でクリップボードに JSON コピーできる：

```json
{
  "command": "paint-red",
  "action": "for(const o of BM.all()){BM.setStroke(o,'#FF0000')}BM.redraw();BM.log('painted red!')"
}
```

この JSON を SNS に貼れば、受け取った人はターミナルにペーストするだけで登録完了。

---

## 次のステップ

- AI（Claude / ChatGPT）に魔法を作らせる → [[05_AIに魔法を作らせるガイド|05. AI ガイド]]
- できる・できないの境界を知る → [[06_できることできないこと一覧|06. できる・できない]]
- 書き出して配布 → [[07_魔法の書き出しと共有|07. 書き出し]]
- 目次に戻る → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
