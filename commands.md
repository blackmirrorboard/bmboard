# ◼ BLACK MIRROR BOARD — COMMAND REFERENCE

> kinoshita studio · v1.2 · 2026-04-22
> Your personal spellbook. Use this file on its own, or open `commands.html` for a clickable version.

Every command below is typed into the **terminal pane** (right side on PC, bottom on mobile).
Enter to fire. History via **↑ / ↓**. `clear` wipes the terminal; `help` prints an in-terminal summary.

---

## Table of Contents

1. [Themes](#themes)
2. [Canvas Control](#canvas-control)
3. [Camera / Black Mirror wipe](#camera)
4. [Project Persistence (save / ls / load)](#project-persistence)
5. [Export (SVG / PNG / Bundles)](#export)
6. [Spellbook (register / alias / forget / list)](#spellbook)
7. [Preset Spells](#preset-spells)
8. [Image Brainstorm (`make-img`)](#image-brainstorm)
9. [Share](#share)
10. [Help / Usage / Docs](#help)
11. [Easter Eggs](#easter-eggs)
12. [Ideas to extend](#ideas)
13. [Keyboard Shortcuts (quick ref)](#shortcuts)
14. [The BM API (for spell authors)](#bm-api)

---

## <a id="themes"></a>1. Themes

Three palettes, one keystroke each.

| Command | Effect |
|---|---|
| `light` / `light mode` | Paper ground `#FAFAF8` / ink `#0c0c0c`. The default. |
| `dark` / `dark mode` | Void `#000000` / phosphor `#F0EDE6`. CRT aesthetic. |
| `gray` / `grey` / `gray mode` | Pebble `#DCDBD5` / cobalt `#1600A2`. Kinoshita studio palette. |

- Theme change **cascades**: canvas, toolbar, popovers, swatches, header.
- Object fills store canonical light-mode colors and are translated at render time — nothing is ever destructively inverted.

---

## <a id="canvas-control"></a>2. Canvas Control

| Command | Effect |
|---|---|
| `clear` | Clears the terminal output only. |
| `flush` | Same as `clear` — alias. |
| `sticky` | Drop a 200×200 yellow post-it at the view center. Empty — double-click to type. |
| `sticky <text>` | Same, but pre-filled with `<text>`. |
| `volume on` / `volume off` | Toggle audio (click + timer beep + chime). Persisted in localStorage. |
| `mute` / `unmute` | Shorthand for `volume off` / `volume on`. |
| `volume` / `volume status` | Show current audio state. |
| `bgm` / `bgm on` / `bgm 1 on` | Start ambient BGM track 1 (lofi YouTube stream, hidden iframe). |
| `bgm 2 on` / `bgm 3 on` | Switch to track 2 (synthwave) / track 3 (ambient piano). |
| `bgm off` | Stop BGM. |
| `bgm status` | Show current BGM track. |

**Sticky behavior** — Miro-style post-it:
- **Double-click** (PC) / **double-tap** (touch) the note to enter edit mode.
- Type freely; **font size auto-shrinks** as the text grows so it always fits.
- `Enter` = newline, `Esc` or `Cmd+Enter` or click outside = commit.
- Resize by the corner / edge handles like any other shape — text re-fits automatically.

Canvas objects are **not** deleted by `clear` / `flush`; use `CLEAR` from the header or `Cmd+A` + Del to wipe the board.

---

## <a id="camera"></a>3. Camera / Black Mirror wipe

A PIP of your webcam, self-mirrored and CRT-tinted, draggable anywhere.

| Command | Effect |
|---|---|
| `Black Mirror` | Request `getUserMedia`, dock the wipe in the top-right. 220×165 on PC, 128×170 on mobile. Red REC blinker + `◼ BLACK MIRROR` label in `mix-blend-mode: difference`. |
| `Black Mirror on` | Alias of above. |
| `Black Mirror off` | Release all tracks, remove the wipe. |

**Drag the wipe** by its frame to reposition. **×** on hover closes it.
Useful for screen-recordings, quick YouTube Live broadcasts, or just seeing yourself while you draw.

---

## <a id="project-persistence"></a>4. Project Persistence

Everything lives in **IndexedDB** on your device. No server, no cloud.

| Command | Effect |
|---|---|
| `save <name>` | Snapshot the canvas + view (scale, tx, ty) under `<name>`. |
| `ls` | List all saved snapshots with timestamp and object count. |
| `load <name>` | Restore that snapshot. Also resets the selection. |

**Naming rule:** `[a-zA-Z0-9][a-zA-Z0-9_\-. ]{0,40}` — letters, digits, space, `_`, `-`, `.`.

```
> save biwako-study
→ serializing...
→ 23 object(s)
[SUCCESS] Snapshot 'biwako-study' committed.
```

---

## <a id="export"></a>5. Export (SVG / PNG / Bundles)

| Command | Effect |
|---|---|
| `$svg` | Export selected objects (or all if nothing selected) as a native SVG file — editable in Figma / Illustrator / Inkscape. |
| `export` | Export the current project as a `.json` file. |
| `export-all` | Export project **+ all registered spells** as one `.json` bundle. |
| `export-spells` | Export **only the spells** (no canvas data). Add `<name> <name>` to pick specific spells, else exports all user spells. |
| Header `SAVE` button | Same as `export` (opens save dialog). |
| Header `OPEN` button | Import a `.json` file back into the board. |

SVG export handles every primitive type:
- `circle` → `<ellipse>`
- `square`  → `<rect>`
- `triangle` → `<polygon>`
- `arrow` → `<line>` + `<polygon>` head
- `text` → `<text dominant-baseline="hanging">`
- `stroke` → `<path M ... Q ...>`
- `image` → `<image>`
- rotation wraps as `<g transform="rotate(θ cx cy)">`

PNG export: select objects, then use **X** keyboard shortcut for transparent-PNG export (3× DPR capped).

---

## <a id="spellbook"></a>6. Spellbook

Spells = JSON-portable command bindings. Paste, remix, share.

| Command | Effect |
|---|---|
| `list` | Show every registered command with `[preset]` or `[ user ]` tag. |
| `register <name> <js>` | Compile and save a new spell. `<js>` is JavaScript with `args` (string) + the `BM` API available. |
| `alias <new>=<existing>` | Duplicate an existing spell under a new name. |
| `forget <name>` | Remove a user spell. Presets can't be forgotten. |
| `unregister <name>` | Alias of `forget`. |
| paste JSON into terminal | Installs a spell from a JSON payload. Shape: `{ "command": "name", "action": "js source" }`. |

**Example**
```
> register hi BM.log('hello from my first spell!')
→ compiling...
→ persisting...
[OK] $hi — try it now.

> $hi
→ executing action...
hello from my first spell!
```

Custom spells persist in **IndexedDB** keyed by name.

---

## <a id="preset-spells"></a>7. Preset Spells

Shipped with the app. Run with `$<name>`. All are remixable — paste your variant and it overrides.

### `$scatter`
Randomize positions of the selected objects within ±400px (x) / ±300px (y).
```
select some shapes → $scatter
```

### `$grid-3x3`
Place nine 80×80 squares in a 3×3 grid at the current view center.

### `$sticky-3x3`
Place nine 140×140 yellow sticky notes in a 3×3 grid at the current view center. Double-click a note to edit.

### `$sakura`
Toggle: starts an infinite loop of 🌸 petals falling on the canvas. Run `$sakura` again to stop. Petals remain after stop — use `clear` or Cmd+A → Del to wipe.

### `$rain`
Toggle: starts an infinite loop of `|` rain drops falling on the canvas. Faster and denser than `$sakura`. Run `$rain` again to stop. Drops remain after stop.

### `$biwako-blue`
Retint every object's stroke (and fill where present) to `#0044CC` — "Biwako Silence" palette.

### `$svg`
Export the selection (or everything) as SVG. See [Export](#export).

### `$monoclo`
Grayscale the selected image(s) via an offscreen canvas filter (`grayscale(100%) contrast(110%) brightness(95%)`). Rewrites the image's `data:` URL in place.

### `$make-img <keyword> [count]`
See [Image Brainstorm](#image-brainstorm). `$fetch-img` is kept as a backward-compat alias.

---

## <a id="image-brainstorm"></a>8. Image Brainstorm (`$make-img`)

Non-stop mood-board builder. `$fetch-img` is the legacy alias and still works.

| Form | Effect |
|---|---|
| `$make-img` | 1 image for keyword `biwako`. |
| `$make-img <keyword>` | 1 image for `<keyword>`. |
| `$make-img <keyword> <n>` | Up to 25 images scattered across the canvas. |

Images are placed with random rotation and margin — the canvas becomes a self-writing mood-board. Source is a public image feed; CORS-safe drops are raster-baked, blocked sources return a placeholder.

---

## <a id="share"></a>9. Share

Two flavours.

### Share a spell
```
> share <spell-name>
```
Copies the spell's JSON to the clipboard. Paste into Slack / X / a gist / your friend's DM. They paste it into their terminal, it installs.

### Share the whole canvas as a URL
```
> share
```
Opens the Share modal:
- **Copy URL** — gzips the canvas via `CompressionStream`, base64-urls it, copies a link. Recipient opens the URL → the board rehydrates. Up to ~1 MB of state fits comfortably.
- **Open in New Tab** — preview the rehydrated URL.
- **Download .json** — file-based handoff.

---

## <a id="help"></a>10. Help / Usage / Docs

| Command | Effect |
|---|---|
| `help` / `?` | In-terminal quick reference card. |
| `usage` / `man` / `docs` | Open the full USAGE panel (esc to dismiss). |

---

## <a id="easter-eggs"></a>11. Easter Eggs

| Command | Effect |
|---|---|
| `youtube` / `yt` / `youtube.com` | Triggers the YouTube easter egg animation. |
| `test-parse <text>` | Echo the parsed tokens — used during spell authoring to verify the parser. |
| `objects` | Print the raw objects array (diagnostics). |

---

## <a id="ideas"></a>12. Ideas to extend

Drop these into `register <name> <js>` or paste a JSON spell payload. Prompt an LLM with the [BM API](#bm-api) + a sentence of intent and it'll hand you runnable JS.

**Layout / arrangement**
- `align left | right | top | bottom | center-x | center-y` — align selected objects to a common edge
- `distribute-h` / `distribute-v` — equal spacing across the selection
- `group` / `ungroup` — virtual group (single transform target)
- `bring-front` / `send-back` / `raise` / `lower` — z-order swaps
- `flip-h` / `flip-v` / `mirror <axis>` — flip the selection

**Visual / color**
- `palette <name>` — apply a named palette (e.g. `biwako`, `ink-brush`, `crt`)
- `sepia` / `noir` / `neon` — image filters (extends `$monoclo`)
- `duotone <hex1> <hex2>` — two-color image mapping
- `grain <amount>` — sprinkle pixel grain across selected images

**Input / creation**
- `random-shape [n]` — N random primitives
- ~~`sticky <text>` — post-it style annotation~~ — **shipped**, see [§ 2. Canvas Control](#canvas-control)
- `checkbox <text>` — interactive tickbox object
- `callout <text>` — arrow + label combo

**Productivity**
- `timer <min>` — pomodoro countdown in the PIP slot
- `metronome <bpm>` — tiny tick overlay
- `count` — show per-type object stats
- `search <keyword>` — highlight objects whose text or tag matches
- `mute-colors` / `revive-colors` — toggle all fills to grey

**External / cloud**
- `speak <text>` — Web Speech API TTS
- `hear` — speech-to-text input for drawings (voice label)
- `ai <prompt>` — send canvas + prompt to an LLM for suggestions
- `spotify <playlist>` — embed a small playlist widget in the corner

**Structure**
- `layer new <name>` / `layer hide <name>` — named layers
- `breakpoint` — freeze the current state into history (for replay)
- `replay` — replay the stroke history as an animation
- `diff <snapshot>` — compare current canvas to a saved snapshot

Every one of these is **a JSON away**. The BM API is tiny — see below.

---

## <a id="shortcuts"></a>13. Keyboard Shortcuts (quick ref)

| Key | Action |
|---|---|
| `S` | select |
| `P` | pen (freehand) |
| `N` | path (bezier) |
| `E` | eraser |
| `C` | circle |
| `G` | triangle |
| `Q` | square |
| `A` | arrow |
| `T` | text |
| `1` / `2` / `3` | stroke width 1 / 2 / 3 |
| `Space` (hold) + drag | pan the view |
| `X` | export selection (or all) as PNG |
| `Ctrl/Cmd + Z` | undo |
| `Ctrl/Cmd + Y` / `Ctrl/Cmd + Shift + Z` | redo |
| `Ctrl/Cmd + A` | select all objects on the board |
| `Ctrl/Cmd + C` | copy selected object(s) |
| `Ctrl/Cmd + X` | cut selected object(s) |
| `Ctrl/Cmd + V` | paste (offset 20px so duplicates don't stack) |
| `Ctrl/Cmd + D` | duplicate selected object(s) in place |
| `Del` / `Backspace` | delete selected (not during text edit) |
| `Shift` (during drag) | aspect-lock resize |
| `Alt` (during drag) | resize from the opposite anchor |
| `Esc` | cancel the current gesture / exit text edit |

**Mobile / Touch gestures**

| Gesture | Action |
|---|---|
| Tap | select object |
| Drag selected object | move |
| Double-tap a `text` or `sticky` | enter edit mode |
| **Long-press (≈500 ms) on selected object** | duplicate (mobile equivalent of Cmd+D) |
| Two-finger pinch / drag | zoom & pan |

---

## <a id="bm-api"></a>14. The BM API (for spell authors)

Your spell's JavaScript runs with two locals: `args` (the text after the command) and `BM` (this object).

```js
BM.all()                 // array of every object on the canvas
BM.getSelected()         // array of currently-selected objects
BM.redraw()              // mark dirty, re-render
BM.save()                // commit to IndexedDB
BM.log(msg, cls?)        // print to the terminal (cls: 't-ok' | 't-err' | 't-dim')
BM.create(type, data)    // new object: type = 'circle' | 'square' | 'triangle' | 'arrow' | 'text' | 'image' | 'stroke'
BM.translate(obj, dx, dy)
BM.viewCenter()          // { x, y } in world coords
BM.rand(a, b)            // random float in [a, b)
BM.exportSvg(targets?)   // same as $svg (default: selection or all)
```

A complete spell is simply:

```json
{
  "command": "spread",
  "action": "const sel = BM.getSelected(); if (!sel.length) { BM.log('select first.', 't-err'); return; } for (const o of sel) BM.translate(o, BM.rand(-600, 600), 0); BM.log('spread ' + sel.length + ' object(s) horizontally.');"
}
```

Paste that JSON into the terminal and `$spread` is registered forever.

---

*Draw to Build. — kinoshita studio / 2026-04-22*
