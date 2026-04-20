<div align="center">

```
 ██████╗ ███╗   ███╗
 ██╔══██╗████╗ ████║     BLACK MIRROR BOARD
 ██████╔╝██╔████╔██║     ─────────────────────────────
 ██╔══██╗██║╚██╔╝██║     draw · speak · cast
 ██████╔╝██║ ╚═╝ ██║     v1.2 · 99letters studio · 2026
 ╚═════╝ ╚═╝     ╚═╝     updated: 2026-04-19
```

![stack](https://img.shields.io/badge/stack-vanilla_JS-000?style=flat-square)
![deps](https://img.shields.io/badge/deps-zero-000?style=flat-square)
![canvas](https://img.shields.io/badge/canvas-HTML5-000?style=flat-square)
![themes](https://img.shields.io/badge/themes-light_%7C_dark_%7C_gray-000?style=flat-square)
![spells](https://img.shields.io/badge/spells-JSON_portable-000?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-000?style=flat-square)

</div>

---

A terminal-driven infinite canvas. One HTML file. No dependencies. No build.
Every draw action speaks back through a live shell. Every command is a spell —
JSON-portable, shareable, remixable. **v1.2 ships 2026-04-19.**

```
open projects/black_mirror/app.html
```

That's the install.

---

## What's new in v1.2

```
FETCH-IMG (refresh) keyword-based image summoning via Lorem Flickr
                    `fetch-img mountain 6` → 6 photos · auto 3×2 grid
                    color by default · mono by opt-in via $ monoclo
                    no API key · up to 25 images per call

MONOCLO (new)       `monoclo` → grayscale the selected image(s)
                    undo-safe · dataURL persisted · bundle-safe
                    shape/stroke objects ignored

EXPORT UX           export              → selection as transparent PNG
                    export magic        → picker modal (per-spell checkboxes)
                    export data         → bundle dialog (canvas/user/preset toggles)
                    share <name>        → single spell to clipboard

IMPORT UX           drag-and-drop .json anywhere on board
                    auto-detects 4 payload shapes (single / array / spells / bundle)
                    collision-safe: same name → renamed `<name>_2026-04-19`
                    presets protected · identical actions skipped

BUNDLE DIALOG       incoming bundle shows an overwrite / add / cancel modal
                    merge mode re-IDs incoming objects to avoid collisions

STROKE-COLOR FIX    per-object `obj.data.stroke` now honored by pencil strokes
                    `$ biwako-blue` finally tints freehand lines too
```

---

## Philosophy

**Intuition over syntax.** Draw a shape. The terminal answers.

**Subtractive.** One file. Zero deps. Zero build. If it doesn't need to exist, it doesn't.

**Local-first.** No cloud. No auth. Export is PNG or JSON. Your file, your disk.

**Portable spells.** Any command you invent is a JSON payload. Paste it on SNS, someone pastes it into their board, and your magic runs on their canvas.

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
```

Full BM API and authoring guide → see `usage.html`.

---

## Features

```
CANVAS           infinite pan · 0.15× → 8× zoom · Retina-ready
                 pointer events unified across mouse / touch / pen
                 DPR-scaled ctx.setTransform · 60fps redraws

SELECT · MOVE    click body or within 8px of line · drag to move
                 hover glow · cursor: move / nwse-resize / ns-resize
                 marquee: dashed box · intersection-aware

EDIT             8-handle bbox · per-vertex anchors on pen/triangle/path
                 rotation ring above the bbox (Illustrator feel)
                 Shift lock-aspect · Alt center-pin · Shift+Alt both
                 0.5× / 1× / 1.5× / 2× snap milestones

PEN → PATH       freehand → RDP simplify on lift (≤ ~12 anchors)
                 dense pts kept internally for smooth curves
                 auto-close: draw back to origin → blue snap ring

FILL + LINE      fill: none / black / grey / white
                 line: on / off (no outline, closed shapes only)
                 per-object stroke color overrides theme color

THEMES           light : surface #FAFAF8 · ink #0c0c0c
                 dark  : void    #000000 · ink #F0EDE6
                 gray  : pebble  #DCDBD5 · ink #1600A2
                 swap via terminal: `light` | `dark` | `gray`

IMAGES           upload from disk (I key) · dropped photos
                 fetch-img <kw> <n> summons color photos
                 monoclo retroactively grayscales any selected image

SPELLS           register <name> <js>   create a spell
                 share <name>           copy JSON to clipboard
                 alias <new>=<old>      duplicate under a new name
                 forget <name>          delete a user spell
                 list                   inventory (preset / user)

IMPORT           paste JSON → auto-register · D&D .json file → same
                 4 payload shapes recognized automatically
                 name collisions → <name>_2026-04-19 auto-rename

EXPORT           X key or `export`       → transparent PNG (selection-aware)
                 `export magic`          → spell picker modal
                 `export data`           → bundle dialog (canvas/user/preset)
                 `share <name>`          → single spell to clipboard

PERSISTENCE      IndexedDB (projects + spells) · localStorage (history)
                 `save <name>` / `ls` / `load <name>` for named snapshots

UNDO · REDO      Cmd+Z · Cmd+Shift+Z · 60-state history

PAN · ZOOM       Space+drag · pinch · scroll-wheel · double-tap reset

TERMINAL         typewriter queue · syntax highlight · ambient daemon
                 history recall (↑↓) · paste auto-detects JSON payloads
```

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
> export-all           non-interactive full bundle
> export-spells [...]  non-interactive spell package
> fetch-img <kw> <n>   summon n images by keyword
> monoclo              grayscale selected image(s)
> scatter              scatter selected objects
> grid-3x3             place a 3×3 grid
> biwako-blue          retint all strokes
> youtube              (try it)
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

## Quick start

```sh
# no install. open directly:
open projects/black_mirror/app.html

# or serve locally:
python -m http.server 8000
# → http://localhost:8000/projects/black_mirror/app.html
```

---

## Stack

```
render       HTML5 Canvas · ctx.setTransform · devicePixelRatio
input        Pointer Events · setPointerCapture · multi-touch pinch
geometry     RDP simplification · bezier smoothing · segment-distance
             ray-cast point-in-polygon for closed-fill hit-test
theming      CSS custom properties · body.bm-{light|dark|gray}
             resolveFill() — channel-invert + cobalt retint
resize       single resizeBoxWithMods(anchorId, ob, nx, ny, shift, alt)
persistence  IndexedDB (projects + commands) · localStorage (history)
import       FileReader · drag-and-drop · paste interception
             4-shape JSON router · collision-safe rename
export       offscreen canvas → toDataURL · blob download
             iOS Web Share API for native share-sheet flow
audio        Web Audio API · oscillator · mechanical key feel
```

---

## Files

```
black_mirror/
├── app.html        ← the entire engine · one file · all v1.2 features
├── logo.png        ← studio mark
├── README.md       ← you are here
├── overview.html   ← team persona viewer
├── usage.html      ← user manual (v1.2)
├── usage.md        ← markdown mirror (legacy)
├── ux.md           ← UX research perspective
├── designer.md     ← design perspective
└── marketer.md     ← market perspective
```

---

## Deploy

GitHub Pages. No build. No CI. No config.

```
99letters.github.io/projects/black_mirror/app.html
```

Push. Done.

---

## Contact

```
feedback   →  kinoshita.studio@gmail.com
              subject: Black Mirror Feedback
              (tap the logo in-app to open the form)

instagram  →  @tkinoshita99
              instagram.com/tkinoshita99/

dev log    →  /md.html  — retrospective from v0.1 → v1.2
```

---

<div align="center">

*Draw · Speak · Cast. — 99letters / 2026-04-19*

</div>
