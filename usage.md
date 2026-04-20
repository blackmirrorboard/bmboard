<!-- On case-insensitive filesystems (macOS APFS default), this file is
     served as both `usage.md` and `USAGE.md` — same inode, same content. -->

# ◼ BLACK MIRROR BOARD — USAGE

**Version 1.2 — 99letters studio — 2026-04-16**
**Bilingual manual · 日本語 × English**

---

## 1. Welcome to Black Mirror Board

### 🇯🇵 日本語

Black Mirror Board は、**デザイナーの「直感」を、エンジニアの「コマンド」で増幅する**ための無限キャンバスです。

- 図形を描けば、ターミナルがそれに応えて言葉を返す
- 打鍵ではなく描画で、世界を構築していく
- 個人の小さな呪文（コマンド）を SNS で共有し合い、**他人の魔法を自分の道具にできる**

コードを書かない美学と、コマンドを打つ快感が交わる場所。それが Black Mirror です。

### 🇬🇧 English

Black Mirror Board is an infinite canvas that **amplifies a designer's intuition with an engineer's command layer.**

- Draw a shape, and the terminal answers back in words.
- Build the world by gesture — not only by keystroke.
- Share your tiny spells (custom commands) over SNS and **turn someone else's magic into your own tool.**

It's where the aesthetic of *"I don't write code"* meets the thrill of *"I speak to the machine."*

---

## 2. Basic Controls / 基本操作

### Drawing / 描画

| Action                 | How / やり方                                   |
| ---------------------- | ---------------------------------------------- |
| 🇯🇵 図形を描く         | ツールバーから形を選び、キャンバスをドラッグ   |
| 🇬🇧 Draw a shape       | Pick a tool, then drag on the canvas.          |
| 🇯🇵 フリーハンド       | `P` キーで Pen、始点近くでリリース → 自動クローズ |
| 🇬🇧 Freehand           | `P` for Pen. Release near the start to auto-close. |
| 🇯🇵 テキスト入力       | `T` キー → キャンバスをクリック → Enter で確定  |
| 🇬🇧 Text                | `T`, click, type, Enter to commit.             |

### Zoom / ズーム

| Action              | Desktop                 | Mobile / Trackpad        |
| ------------------- | ----------------------- | ------------------------ |
| Zoom in / out       | Scroll wheel            | Pinch                    |
| Reset view to 100%  | Double-click            | Double-tap               |

### Pan / パン

| Action              | Desktop                 | Mobile / Trackpad        |
| ------------------- | ----------------------- | ------------------------ |
| Pan canvas          | Hold `Space` + drag     | 2-finger drag            |
| Temporary grab      | Middle-button drag      | —                        |

### Move, Rotate, Resize / 移動・回転・リサイズ

```
S  →  Select tool
   · Click an object or within 8px of its outline to grab it.
   · Drag to move.
   · Drag the ○ handle above the bounding box to rotate.
   · Drag any of the 8 □ anchors to resize.

Modifier keys while resizing:
   Shift         Lock aspect ratio (corner handles).
   Alt / Option  Anchor to the center (symmetric scale).
   Shift + Alt   Both.

Images are aspect-locked on corners by default —
Shift releases the lock, so photos never warp accidentally.
```

### Marquee Selection / 範囲選択

```
Drag on empty canvas  →  dashed selection rectangle.
Any object that the marquee grazes (AABB intersection)  → selected.
After release, drag any selected object to move the whole group.
Group supports rotation + resize just like a single object.
Del / Backspace  → delete all selected.
Esc              → deselect all.
```

---

## 3. The Terminal Interface / ターミナル

### 🇯🇵 単なるログではない

Black Mirror のターミナルは「環境音としてのログ」と「入力受付の対話型プロンプト」の二重構造です。入力欄は常に右下にあり、キーボードに触れればいつでもコマンドが打てます。

### 🇬🇧 Not just a log

The terminal is two things at once: an ambient log that hums with system activity, **and** an interactive prompt that accepts commands. The input is always pinned at the bottom-right.

### History & recall / 履歴の呼び出し

| Key            | Action                                            |
| -------------- | ------------------------------------------------- |
| `Enter`        | Execute the current input.                        |
| `↑`            | Recall the previous command.                      |
| `↓`            | Return toward the draft / forward through history. |
| `Esc`          | If the USAGE overlay is open, close it first.     |

History is stored in `localStorage` (up to 80 entries) — **survives reload.**

### Built-in commands / 組込みコマンド

```
help                    →  in-terminal cheat sheet (hacker layout)
usage / man / docs      →  summon the USAGE overlay
clear / flush           →  wipe terminal output
light / dark / gray     →  switch canvas theme
list                    →  list every registered command
forget <name>           →  remove a user-registered command
```

---

## 4. Custom Commands / カスタムコマンドの魔法

### 🇯🇵 核心: 魔法は持ち運べる

Black Mirror の最大の遊びは、「誰かが作ったコマンドを、SNS 経由で手に入れて、自分のボードで使える」ことです。

### 🇬🇧 The point: magic is portable

The single most interesting thing about Black Mirror is that **commands travel**. Someone writes a spell, posts it on SNS, and with a single paste your board inherits it.

### 4.1 Importing a spell / 魔法を拾う

🇯🇵 **3 ステップ：**
1. X / Discord / Slack などで以下のような JSON を見つける。
2. ターミナル入力欄にペーストする。
3. 自動で `$<name>` として登録される。

🇬🇧 **Three steps:**
1. Spot a JSON payload like the one below on social media.
2. Paste it directly into the terminal input.
3. It's auto-registered as `$<name>`.

```json
{
  "command": "scatter",
  "action": "const sel = BM.getSelected();\nfor (const o of sel) BM.translate(o, BM.rand(-400,400), BM.rand(-300,300));\nBM.log('scattered ' + sel.length);"
}
```

Terminal response / ターミナルの応答:

```
paste > [JSON payload intercepted]
→ schema check... { command, action } ✓
→ binding $scatter → sandboxed function...
→ persisting to local storage...
[OK] spell acquired — run: $scatter
```

### 4.2 Exporting a spell / 魔法を放つ

```
share <name>
```

🇯🇵 指定したコマンドの JSON 定義をクリップボードにコピーします。そのまま SNS に貼れば、誰でも拾える呪文として世界に放流できます。

🇬🇧 Copies the command's JSON definition to your clipboard. Paste it on SNS and you've just released a spell into the wild.

```
[CLIPBOARD] Copied to clipboard. Paste this on SNS!
───────────────────────────────────────────
{
  "command": "scatter",
  "action": "..."
}
───────────────────────────────────────────
```

### 4.3 Writing your own / 自作する

```
register <name> <javascript action>
```

```
register pulse
  const sel = BM.getSelected();
  for (const o of sel) o.data.rotation = (o.data.rotation || 0) + Math.PI / 8;
```

Inside the action, the **`BM` global** is your interface:

| Method                        | What it does                             |
| ----------------------------- | ---------------------------------------- |
| `BM.getSelected()`            | selected object(s) as an array           |
| `BM.all()`                    | every object on the board                |
| `BM.create(type, props?)`     | spawn `circle` / `square` / `triangle` / `arrow` / `text` |
| `BM.translate(obj, dx, dy)`   | nudge an object                          |
| `BM.setStroke(obj, color)`    | per-object line color                    |
| `BM.setFill(obj, color)`      | per-object fill                          |
| `BM.remove(obj)`              | delete an object                         |
| `BM.viewCenter()`             | `{ x, y }` — current view center (world coords) |
| `BM.rand(min, max)`           | uniform random number                    |
| `BM.log(msg)`                 | print `[BM] msg` to terminal             |
| `BM.setMode('light'/'dark'/'gray')` | switch theme programmatically      |

### 4.4 Aliasing / 別名

```
alias ripple = scatter
```

🇯🇵 既存コマンドを別の名前で複製します。呪文に自分の名前をつけたい時に。

🇬🇧 Duplicates an existing spell under a new name. Brand the magic with your own naming.

---

## 5. Tutorial — Your First Command / 最初の一手

### 🇯🇵 まずは呪文を撃ってみよう

1. 画面上に適当な図形を **3〜5 個** 描いてください（鉛筆でも矩形でも OK）。
2. ターミナル入力欄に以下を打ち、`Enter`：
   ```
   biwako-blue
   ```
   → 全ての線が `#0044CC`（琵琶湖の静寂を思わせる青）に変わります。
3. 次に、Select ツールで全部まとめて選択（範囲ドラッグ）。
4. ターミナルで：
   ```
   scatter
   ```
   → 選択したオブジェクトがランダムに散らばります。
5. 気が向いたら：
   ```
   grid-3x3
   ```
   → ビュー中心に 3×3 のマスが整列配置されます。

**これで、あなたは3つの呪文を既に使ったことになります。**

### 🇬🇧 Cast your first spell

1. Draw **3–5 objects** anywhere on the canvas (pen strokes or squares, both work).
2. Type the following into the terminal and press `Enter`:
   ```
   biwako-blue
   ```
   → Every stroke turns to `#0044CC` — the blue of Lake Biwa's silence.
3. With Select, marquee-drag to grab all objects.
4. In the terminal:
   ```
   scatter
   ```
   → The selected objects fling themselves into random positions.
5. When you're ready:
   ```
   grid-3x3
   ```
   → A crisp 3×3 grid snaps into existence at the view center.

**You've just cast three spells. Now make your own.**

### Next steps / 次の一歩

- Type `$ usage` to summon the full manual overlay any time.
- Type `$ help` for a terminal-native cheat sheet (hacker layout).
- Write your own: `register <name> <js>` → `share <name>` → paste to SNS.

---

## Keyboard reference / キーボード完全版

```
TOOLS                               THEMES
────────────────────────────────   ────────────────────────────────
S   Select                          dark   Void theme
P   Pen                             light  Surface theme
N   Path (anchor-by-click)          gray   Studio theme
E   Eraser
C   Circle                          COMMANDS
G   Triangle                        ────────────────────────────────
Q   Square                          help      terminal cheat sheet
A   Arrow                           usage     overlay manual
T   Text                            list      list registered spells
I   Upload image                    register  create a new spell
X   Export transparent PNG          share     copy spell JSON
                                    alias     duplicate as new name
WIDTH                               forget    remove a user spell
────────────────────────────────    clear     flush terminal
1   Thin                            ↑ / ↓     command history
2   Medium
3   Thick                           RESIZE MODIFIERS
                                    ────────────────────────────────
GLOBAL                              Shift     lock aspect ratio
────────────────────────────────    Alt/Opt   scale from center
Space     Hold to pan               Shift+Alt both at once
Ctrl+Z    Undo
Ctrl+Y    Redo
Del       Delete selected
Esc       Dismiss / deselect
```

---

## Persistence / 永続性

🇯🇵 以下は **すべてローカル保存**（サーバーなし・アカウントなし）：

🇬🇧 All of the following lives **locally** (no server, no account):

- Custom commands → `localStorage` key `bm.customCommands.v1`
- Terminal history → `localStorage` key `bm.termHistory.v1`
- Canvas project  → `SAVE ↓` button exports a single `.json` file (includes base64 images + terminal log)

Reload is safe. Close the tab and come back — your spells are still there.

---

## Contact / フィードバック

```
feedback   →  kinoshita.studio@gmail.com
              subject: Black Mirror Feedback
              (tap the logo in-app to open the form)

instagram  →  @tkinoshita99
              instagram.com/tkinoshita99/
```

---

*Draw to Build. — 99letters studio / 2026-04-16*
