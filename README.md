```
 ██████╗ ███╗   ███╗
 ██╔══██╗████╗ ████║     BLACK MIRROR BOARD
 ██████╔╝██╔████╔██║     ─────────────────────────────
 ██╔══██╗██║╚██╔╝██║     draw · speak · cast
 ██████╔╝██║ ╚═╝ ██║     v1.2 · kinoshita studio · 2026
 ╚═════╝ ╚═╝     ╚═╝     updated: 2026-05-01
```

<p align="center">
  <img src="https://img.shields.io/badge/stack-vanilla_JS-000?style=flat-square" alt="stack">
  <img src="https://img.shields.io/badge/deps-zero-000?style=flat-square" alt="deps">
  <img src="https://img.shields.io/badge/canvas-HTML5-000?style=flat-square" alt="canvas">
  <img src="https://img.shields.io/badge/themes-light_%7C_dark_%7C_gray-000?style=flat-square" alt="themes">
  <img src="https://img.shields.io/badge/spells-JSON_portable-000?style=flat-square" alt="spells">
  <img src="https://img.shields.io/badge/license-MIT-000?style=flat-square" alt="license">
</p>

<p align="center">
  <a href="#-english"><b>English</b></a> · <a href="#-日本語"><b>日本語</b></a>
</p>

<p align="center">
  🌐 <a href="https://bmboard.studio/">bmboard.studio</a> &nbsp;·&nbsp;
  🎨 <a href="https://bmboard.studio/app">launch the board</a> &nbsp;·&nbsp;
  📖 <a href="https://bmboard.studio/commands.html">commands</a> &nbsp;·&nbsp;
  ✨ <a href="https://bmboard.studio/commands.html#first-spell">spell guide</a> &nbsp;·&nbsp;
  📓 <a href="https://bmboard.studio/dev-log.html">dev log</a>
</p>

---

# 🇬🇧 English

> A terminal-driven infinite canvas. One HTML file. No dependencies. No build.
> Every draw action speaks back through a live shell. Every command is a spell —
> JSON-portable, shareable, remixable.

```
open app.html
```

That's the install. Or visit the live build:

```
https://bmboard.studio/app
```

---

## Quick start

```sh
# no install. open directly:
open app.html

# or serve locally:
python -m http.server 8000
# → http://localhost:8000/app.html
```

---

## Philosophy

**Intuition over syntax.** Draw a shape. The terminal answers.

**Subtractive.** One file. Zero deps. Zero build. If it doesn't need to exist, it doesn't.

**Local-first.** No cloud. No auth. Export is PNG or JSON. Your file, your disk.

**Portable spells.** Any command you invent is a JSON payload. Paste it on SNS, someone pastes it into their board, and your magic runs on their canvas.

---

## What's new in v1.2

```
FETCH-IMG (refresh) keyword-based image summoning via Lorem Flickr
                    `fetch-img mountain 6` → 6 photos · auto 3×2 grid
                    color by default · mono by opt-in via $ monoclo
                    no API key · up to 25 images per call

MONOCLO (new)       `monoclo` → grayscale the selected image(s)
                    undo-safe · dataURL persisted · bundle-safe

SVG EXPORT (new)    `$ svg` → selection (or all) as editable vector SVG
                    opens in Illustrator / Figma / Inkscape as layered shapes

BLACK MIRROR (new)  `Black Mirror` → selfie camera wipe in top-right
                    `Black Mirror off` → stops camera, dismisses wipe

SHARE URL (new)     `share` (no args) → canvas state → shareable URL
                    gzip + base64url encoded in URL hash
                    images auto-stripped · ~2–8 KB typical size
```

---

## Shape → command

```
○  circle      git init / npm create / python -m http.server
◎  double      docker run / kubectl apply -f
△  triangle    git checkout -b / if [ condition ]
□  square      docker build / terraform plan
→  arrow       curl | jq / grep | sort | uniq
T  text        stdin echo / raw injection
✎  pen         freehand path — close loop to fill like a shape
🖼  image       drop any photo · or summon one with fetch-img
```

---

## Preset spells (built-in)

```
$ scatter        scatter selected objects randomly
$ grid-3x3       place a 3×3 grid at view center
$ biwako-blue    retint every stroke to #0044CC
$ fetch-img      summon images from Lorem Flickr by keyword
$ monoclo        grayscale the selected image(s)
$ svg            export selection as editable SVG
```

Full BM API and authoring guide → see [`commands.html`](https://bmboard.studio/commands.html#first-spell) or `usage.html`.

---

## Terminal commands

```
> help                 terminal cheat sheet
> clear                flush output
> light / dark / gray  theme switch
> save <name>          snapshot canvas to IndexedDB
> ls                   list saved snapshots
> load <name>          restore snapshot
> list                 list registered spells
> register <n> <js>    create a spell
> alias <new>=<old>    duplicate a spell
> share <name>         copy spell JSON to clipboard
> forget <name>        delete a user spell
> export               selection → transparent PNG
> export magic         spell picker modal
> export data          bundle export modal
> svg                  selection → editable vector SVG
> share                canvas → shareable URL (modal, no args)
> Black Mirror         selfie camera wipe
> Black Mirror off     dismiss the camera wipe
> fetch-img <kw> <n>   summon n images by keyword
> monoclo              grayscale selected image(s)
> scatter              scatter selected objects
> grid-3x3             place a 3×3 grid
> biwako-blue          retint all strokes
```

---

## Writing your own spell

```
register paint-red for(const o of BM.all()){BM.setStroke(o,'#FF0000')}BM.redraw();BM.log('painted red!')
```

Then `$ paint-red` retints everything red.

Available BM API (action-scoped):

```
BM.getSelected()          selected object(s)
BM.all()                  all objects
BM.getById(id)            lookup by id
BM.find(fn)               filter by predicate
BM.create(type, props?)   spawn circle | square | triangle | arrow | text
BM.update(obj|id, patch)  bulk-update data attributes
BM.translate(obj, dx, dy) nudge
BM.setStroke(obj, color)  per-object line color
BM.setFill(obj, color)    per-object fill
BM.remove(obj)            delete
BM.clear()                wipe canvas
BM.viewCenter()           { x, y }
BM.rand(min, max)         uniform random
BM.getMode() / setMode()  read / swap theme
BM.redraw()               repaint (call after mutations)
BM.save()                 commit to undo history
BM.log(msg, cls?)         terminal output
```

**Note:** `BM.create('rect', ...)` is not supported — use `'square'`. Only the five types listed above are valid.

---

## Keyboard

```
S          select          1 2 3      line width
P          pen             Space      pan (hold)
N          path            Shift      lock aspect (while resizing)
E          eraser          Alt        center-pin (while resizing)
C          circle          X          export transparent PNG
G          triangle        I          upload image
Q          square          Del        delete selected
A          arrow           Cmd+Z      undo
T          text            Cmd+⇧Z     redo
                           Esc        deselect · cancel
```

---

## Stack

```
render       HTML5 Canvas · ctx.setTransform · devicePixelRatio
input        Pointer Events · setPointerCapture · multi-touch pinch
geometry     RDP simplification · bezier smoothing · segment-distance
theming      CSS custom properties · body.bm-{light|dark|gray}
persistence  IndexedDB (projects + commands) · localStorage (history)
import       FileReader · drag-and-drop · paste interception
export       offscreen canvas → toDataURL · blob download
             iOS Web Share API for native share-sheet flow
audio        Web Audio API · oscillator · mechanical key feel
```

---

## Files

```
black_mirror/
├── app.html             ← the entire engine · one file · all v1.2 features
├── index.html           ← marketing landing
├── commands.html        ← command reference + Quick Start + spell guide
├── usage.html           ← user manual (v1.2)
├── overview.html        ← team-perspective viewer
├── dev-log.html         ← retrospective v0.1 → v1.2+
├── logo.png             ← studio mark (smiley)
├── apple-touch-icon.png ← iPhone home-screen icon (180×180)
├── favicon.ico          ← favicon (multi-size)
├── favicon-16x16.png    ← favicon (16×16 PNG)
├── favicon-32x32.png    ← favicon (32×32 PNG)
├── icon-192.png         ← PWA icon (192×192)
├── icon-512.png         ← PWA icon (512×512)
├── og-image.png         ← OGP card (1200×630)
├── manifest.json        ← PWA / iOS home-screen manifest
├── CNAME                ← custom domain (bmboard.studio)
├── README.md            ← you are here
├── v1.2_manual_ja/      ← full Japanese manual (INDEX + 00–09)
└── v1.2_manual_en/      ← full English manual (INDEX + 00–09)
```

---

## Deploy

GitHub Pages + custom domain. No build. No CI. No config.

```
https://bmboard.studio/app
```

Push. Done.

---

## Contact

```
feedback   →  blackmirror.board@gmail.com
              subject: Black Mirror Board Feedback

x          →  @bmboards              x.com/bmboards
instagram  →  @bmboard.official      instagram.com/bmboard.official

dev log    →  bmboard.studio/dev-log.html — retrospective v0.1 → v1.2+
```

---

# 🇯🇵 日本語

> ターミナルで操る無限キャンバス。HTML 1 ファイル、依存ゼロ、ビルドなし。
> すべての描画にシェルが応え、すべてのコマンドが「魔法」になる —
> 魔法は JSON で持ち運べて、共有できて、再構成できる。

```
open app.html
```

これがインストール。または公開ビルドへ：

```
https://bmboard.studio/app
```

---

## クイックスタート

```sh
# インストール不要。直接開く：
open app.html

# またはローカルでサーブ：
python -m http.server 8000
# → http://localhost:8000/app.html
```

---

## 哲学

**構文より直感。** 図形を描けば、ターミナルが応える。

**引き算の美学。** 1 ファイル、依存ゼロ、ビルドなし。要らないものは存在しない。

**ローカルファースト。** クラウドなし、認証なし。書き出しは PNG か JSON。あなたのファイル、あなたのディスク。

**持ち運べる魔法。** あなたが作ったコマンドは JSON。SNS にペースト、誰かが受け取って自分のボードに貼れば、あなたの魔法が彼らのキャンバスで動く。

---

## v1.2 で追加されたこと

```
FETCH-IMG (改良)    キーワードで画像召喚（Lorem Flickr 経由）
                    `fetch-img mountain 6` → 写真 6 枚を 3×2 で自動配置
                    既定はカラー、`$ monoclo` でモノクロ化
                    API キー不要、最大 25 枚/コール

MONOCLO (新)        `monoclo` → 選択中の画像をグレースケール化
                    Undo 対応・dataURL 保存・bundle 安全

SVG エクスポート(新) `$ svg` → 選択中（または全部）を編集可能な SVG として出力
                    Illustrator / Figma / Inkscape でレイヤー付きで開ける

BLACK MIRROR (新)   `Black Mirror` → 右上にセルフィー・カメラのワイプ
                    `Black Mirror off` → カメラ停止、ワイプ消去

SHARE URL (新)      `share`（引数なし）→ キャンバス状態 → 共有可能 URL
                    gzip + base64url で URL ハッシュにエンコード
                    画像は自動除外、~2-8 KB 程度
```

---

## 図形 → コマンド

```
○  円         git init / npm create / python -m http.server
◎  二重円     docker run / kubectl apply -f
△  三角       git checkout -b / if [ condition ]
□  四角       docker build / terraform plan
→  矢印       curl | jq / grep | sort | uniq
T  テキスト   stdin echo / raw injection
✎  ペン       フリーハンド — 始点に戻すと自動で閉じて塗れる
🖼  画像       写真を D&D / fetch-img でキーワード召喚
```

---

## プリセット魔法（最初から入ってる）

```
$ scatter        選択中の物をランダム位置に散らす
$ grid-3x3       ビュー中央に 3×3 のグリッドを配置
$ biwako-blue    すべての線を琵琶湖ブルー(#0044CC)に
$ fetch-img      Lorem Flickr からキーワードで画像召喚
$ monoclo        選択中の画像をグレースケール化
$ svg            選択中を編集可能な SVG として書き出し
```

詳しい BM API と魔法の作り方 → [`commands.html`](https://bmboard.studio/commands.html#first-spell) または `usage.html`。

---

## ターミナルコマンド

```
> help                 ターミナルのチートシート
> clear                出力をクリア
> light / dark / gray  テーマ切替
> save <name>          キャンバスを IndexedDB にスナップショット保存
> ls                   保存済スナップショット一覧
> load <name>          スナップショットを復元
> list                 登録済の魔法一覧
> register <n> <js>    魔法を登録
> alias <new>=<old>    魔法を別名で複製
> share <name>         魔法 JSON をクリップボードへ
> forget <name>        ユーザー魔法を削除
> export               選択範囲 → 透過 PNG 書き出し
> export magic         魔法ピッカーモーダル
> export data          バンドル書き出しモーダル
> svg                  選択範囲 → 編集可能 SVG
> share                キャンバス → 共有可能 URL（モーダル）
> Black Mirror         セルフィー・カメラのワイプ
> Black Mirror off     カメラ停止
> fetch-img <kw> <n>   キーワードで n 枚の画像召喚
> monoclo              選択画像をグレースケール
> scatter              選択中をランダム配置
> grid-3x3             3×3 グリッド配置
> biwako-blue          全線を琵琶湖ブルーに
```

---

## 自分で魔法を作る

```
register paint-red for(const o of BM.all()){BM.setStroke(o,'#FF0000')}BM.redraw();BM.log('painted red!')
```

これで `$ paint-red` を打つと、すべての線が赤くなります。

利用可能な BM API：

```
BM.getSelected()          選択中の物
BM.all()                  全オブジェクト
BM.getById(id)            ID で取得
BM.find(fn)               条件で絞り込み
BM.create(type, props?)   生成 (circle | square | triangle | arrow | text)
BM.update(obj|id, patch)  data 属性を一括更新
BM.translate(obj, dx, dy) 平行移動
BM.setStroke(obj, color)  線の色を変更
BM.setFill(obj, color)    塗りの色を変更
BM.remove(obj)            削除
BM.clear()                キャンバスをクリア
BM.viewCenter()           ビューの中心 { x, y }
BM.rand(min, max)         一様乱数
BM.getMode() / setMode()  テーマ取得・設定
BM.redraw()               再描画（変更後に呼ぶ）
BM.save()                 Undo 履歴にコミット
BM.log(msg, cls?)         ターミナル出力
```

**注意:** `BM.create('rect', ...)` はサポートされていません。`'square'` を使ってください。上記 5 種類のみ有効。

---

## キーボード

```
S          選択         1 2 3      線の太さ
P          ペン         Space      パン（押し続け）
N          パス         Shift      アスペクト固定（リサイズ中）
E          消しゴム     Alt        中心固定（リサイズ中）
C          円           X          透過 PNG 書き出し
G          三角         I          画像アップロード
Q          四角         Del        選択中を削除
A          矢印         Cmd+Z      取消
T          テキスト     Cmd+⇧Z     やり直し
                        Esc        選択解除・キャンセル
```

---

## 連絡先

```
フィードバック  →  blackmirror.board@gmail.com
                   件名: Black Mirror Board Feedback

X              →  @bmboards            x.com/bmboards
Instagram      →  @bmboard.official    instagram.com/bmboard.official

開発ログ       →  bmboard.studio/dev-log.html
                   v0.1 → v1.2+ までの全工程
```

---

<p align="center">
  <em>Draw · Speak · Cast. — kinoshita studio / 2026-05-01</em>
</p>
