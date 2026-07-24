# BMBoard STORE

BMBoard の「魔法(spell)」カタログです。ここに魔法を足すだけで、アプリの **⌘K → `store`** に並びます。
バックエンド不要 — `catalog.json`（静的 JSON）をアプリが読み込むだけ。

The spell catalog for BMBoard. Add a spell here and it appears in the app's **⌘K → `store`**. No backend — the app just fetches this static `catalog.json`.

---

## 魔法の種類 / Two kinds of spell

### 1. 宣言的 (ops / objects) — コード無し・完全安全
図形やテキスト・付箋を置くだけ。`BM.create` の**白リスト型**のみ使えます。

```json
{
  "name": "kanban", "icon": "🗂", "desc": "To Do / Doing / Done", "author": "your name", "tag": "featured",
  "ops": [
    { "type": "square", "dx": -160, "dy": -190, "props": { "w": 320, "h": 420 } },
    { "type": "text",   "dx": -148, "dy": -224, "props": { "text": "Doing", "fontSize": 26 } }
  ]
}
```

- `type`: `square` / `sticky` / `text` / `circle` / `triangle` / `arrow`
- `dx,dy`: ビュー中心からの相対位置（square/sticky/text = 左上、circle = 中心）
- `arrow` は `props` の `x1,y1,x2,y2` が相対座標

### 2. コード (action / JS) — 動く魔法・**実行時にコードが走る**
sakura のような手続き的アニメ。`action` に JavaScript 本文を入れます。

```json
{
  "name": "confetti", "icon": "🎉", "desc": "紙吹雪", "author": "your name", "tag": "new",
  "action": "const vc=BM.viewCenter(); /* ... BM API のみ ... */"
}
```

⚠️ **コード魔法は実行時にコードが走ります。** レビュー（PR審査）を前提にキュレートします。
アニメにするときは `window._<name>Id` に interval id を持たせ、2回目の実行で停止できるトグルにしてください。

---

## 使える API（action 内） / Allowed API

`BM.create(type, props)` / `BM.viewCenter()` / `BM.rand(min,max)` / `BM.all()` / `BM.getSelected()`
`BM.translate(obj,dx,dy)` / `BM.setFill(obj,color)` / `BM.setStroke(obj,color)` / `BM.redraw()` / `BM.log(msg)`

`fetch` / DOM 直接操作 / 外部読み込みは**使わないでください**（審査で弾かれます）。

---

## 自動チェック / Automatic review

提出すると **すぐに自動チェックが走って結果がコメントされます**（`.github/workflows/spell-review.yml`）。
直すところがあれば `needs-changes` が付きます。本文を編集すれば再チェックされます。

Submitting triggers an **automatic check** that comments the result right away. If something needs fixing you'll get the `needs-changes` label — edit the issue body and it re-runs.

見ているもの / What it checks:
- JSON として読めるか・`name` が使える文字か・**既存の魔法と名前がかぶっていないか**
- 宣言的(`ops`)なら `type` が白リスト（`square` / `sticky` / `text` / `circle` / `triangle` / `arrow`）だけか
- コード(`action`)なら **禁止API**（`fetch` / `document` / `localStorage` / `eval` / `new Function` / `navigator` / `location` など）を使っていないか
- `BM.` で呼んでいるものが **BM API に実在するか**
- 構文が通るか（**実行はしません**）
- ⚠️ `setInterval` を使うなら `window._<name>Id` に id を持たせて**2回目の実行で止まるトグル**になっているか

⚠️ **通過しても自動では公開されません。** 最終判断は必ず人が行います（特にコード魔法は中身を読んでから）。
⚠️ **Passing does not publish it.** A human always makes the final call.

---

## 提出のしかた / How to submit

1. アプリで魔法を作る（**設定 → 魔法タブ → ✨ コードから作る**、または選択して `spell 名前`）
2. **📤** で JSON を出す（icon / desc / action / ops 全部入り）
3. **🐙 GitHubで公開申請**ボタン、または [Issue](https://github.com/blackmirrorboard/bmboard/issues/new?labels=spell-submission) から提出
4. メンテナが内容（コードは動作も）を確認 → `catalog.json` にマージ → 全ユーザーの STORE に反映

= Raycast と同じ **PR審査型**。サーバー不要・費用0・GitHub がログイン/本人性/審査を担います。
