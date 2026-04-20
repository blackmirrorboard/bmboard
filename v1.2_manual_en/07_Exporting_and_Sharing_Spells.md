---
title: 07. Exporting and Sharing Spells
tags: [black-mirror, manual, export, share, v1.2, english]
created: 2026-04-19
order: 7
language: en
---

# 07. Exporting and Sharing Spells

> The complete guide to shipping spells and canvases to other people — or your future self.

---

## Ways to export

Pick by intent:

| Intent | Command | Output |
|---|---|---|
| Post a single spell to SNS | `share <name>` | Clipboard |
| Package a few spells into a file | `export magic` | File (`.json`) |
| Archive the whole workspace | `export data` | File (`.json`) |
| Export the drawing as an image | `export` | File (`.png`) |
| Export the drawing as a vector | `$ svg` | File (`.svg`) |

---

## 1. `share` — single spell to clipboard

### Syntax

```
share <spell-name>
```

### Example

```
share grain
```

→ Clipboard now holds:

```json
{
  "command": "grain",
  "action": "for(let i=0;i<120;i++){...}"
}
```

### Typical uses

- Post to X (formerly Twitter)
- Drop in a Discord "magic" channel
- Share with a team on Slack
- Archive in a notes app

### On the receiving side

Just paste it into the terminal — registration happens automatically. No Enter required.

---

## 2. `export magic` — spell picker (interactive)

### Syntax

```
export magic
```

→ A modal opens:

```
◼ EXPORT SPELLS
Select spells to export → EXPORT SELECTED

[SELECT ALL] [USER ONLY] [CLEAR]              3 selected

☐ [preset] $biwako-blue
☐ [preset] $fetch-img
☐ [preset] $grid-3x3
☑ [ user ] $grain
☐ [preset] $monoclo
☐ [preset] $scatter
☑ [ user ] $random-circles
☑ [ user ] $my-scatter

                        [CANCEL] [EXPORT SELECTED]
```

### Buttons

| Button | Effect |
|---|---|
| **SELECT ALL** | Check everything |
| **USER ONLY** | Check user spells, skip presets (**most common**) |
| **CLEAR** | Uncheck all |
| **EXPORT SELECTED** | Save as file |
| **CANCEL** | Abort |

### Output filename

```
BM_PROJECT_20260419_1530_SPELLS.json
```

Shape:

```json
{
  "format": "blackmirror.spells",
  "version": "1.2",
  "exportedAt": "2026-04-19T...",
  "commands": [
    { "command": "grain", "action": "..." },
    { "command": "random-circles", "action": "..." }
  ]
}
```

### Typical uses

- Distribute a curated spell kit to friends
- Back up before switching machines
- Share a team's internal spell library

---

## 3. `export data` — whole-workspace bundle

### Syntax

```
export data
```

→ A modal opens:

```
◼ EXPORT DATA
Choose what to include → EXPORT BUNDLE

[✓] include canvas
    12 object(s) in current board

[✓] include user spells
    4 spell(s) registered by you

[ ] include preset spells
    5 preset(s) — recipient already has these, usually off

                        [CANCEL] [EXPORT BUNDLE]
```

### Format selection (automatic)

| Selection | Output format | Filename |
|---|---|---|
| Canvas included | `blackmirror.bundle` | `*_BUNDLE.json` |
| Canvas excluded (spells only) | `blackmirror.spells` | `*_SPELLS.json` |

### Typical uses

- Full workspace backup
- Migrating to another machine
- Handing over a base file for collaboration

---

## 4. `export` — transparent PNG

### Syntax

```
export
```

Or press `X`.

### Behavior

- **With selection**: export only the selected objects
- **Without selection**: export everything
- Transparent background PNG
- Browser's save-as dialog appears

### Typical uses

- Drop into Figma / Photoshop / Illustrator
- Paste into presentations
- Post to SNS

---

## 4.5 `$ svg` — editable vector SVG (new in v1.2)

### How to use

```
svg
```

Or `$ svg`.

### Behavior

- **With selection** — export only the selected objects
- **Without selection** — export the whole canvas
- Filename: `BM_CANVAS_YYYYMMDD_HHMM.svg`
- On iOS the share sheet opens

### Object → SVG element mapping

| Type | SVG element |
|---|---|
| Circle (`circle`) | `<ellipse cx cy rx ry>` |
| Square (`square`) | `<rect x y width height>` |
| Triangle (`triangle`) | `<polygon points="...">` |
| Arrow (`arrow`) | `<line>` + tip `<polygon>` |
| Text (`text`) | `<text dominant-baseline="hanging">` |
| Pen stroke (`stroke`) | `<path d="M ... Q ...">` (closed paths end with `Z` + fill) |
| Image (`image`) | `<image href="...">` |

- Rotation wraps in `<g transform="rotate(deg cx cy)">`
- Colors are emitted as the resolved theme color (via `resolveFill()`)
- viewBox = target bounding box + 20px padding

### Use cases

- Polishing in Illustrator / Figma / Inkscape
- High-resolution vector assets for print (posters, cards)
- Resolution-free assets for decks / slides
- Sketching logos or icons → refining in pro tools

### Caveats

- **Exporting from DARK mode produces light-colored strokes.** Invisible on white viewers — switch to `light` / `gray` first, or darken the receiving background
- `fetch-img` images that failed CORS persistence are URL-linked, not embedded → may not load offline
- Text font is set to `Courier New, monospace`. Substitute freely in Illustrator / Figma

### Example flow

```
1. Press S (Select tool)
2. Marquee-drag multiple objects
3. Type svg into the terminal → Enter
4. BM_CANVAS_20260420_1930.svg downloads
5. Open in Illustrator → each object is an editable layer
```

---

## 5. Non-interactive variants

Skip the modal when you want a one-shot:

| Command | Behavior |
|---|---|
| `export-spells` | All user spells in one file |
| `export-spells grain paint-red` | Only the named spells |
| `export-all` | Canvas + every spell (presets included) |

---

## 6. SNS-sharing flow

### Post a single spell to X / Discord

```
1. share <name>              → JSON on clipboard
2. Paste into X / Discord
3. Recipients paste into their terminal
```

### Template post

```
New spell: "grain" 🔮
Drop it on your board and you get a film-grain texture.

{"command":"grain","action":"for(let i=0;i<120;i++){...}"}

#blackmirror
```

---

## 7. File-based distribution

### Through Google Drive / iCloud

```
1. export magic → download SPELLS.json
2. Upload to Drive
3. Share URL with the team
4. Each teammate downloads → drops onto their board
```

### Through GitHub

```
1. Commit the .json file to a repo
2. Explain in README
3. Others download from the raw URL → drop
```

A community repo is tentatively planned.

---

## 8. Naming conventions (for shareability)

| ❌ Weak | ✅ Stronger |
|---|---|
| `test1` | `grain-120` |
| `new` | `random-circles-5` |
| `mine` | `my-scatter-wider` |

**A short, descriptive English word** wins. Recipients should be able to guess what it does from `list`.

---

## 9. Gotchas

### CORS-broken images

Images from `fetch-img` that fail `toDataURL()` due to CORS **don't ride in the bundle** — only URLs are stored. Whether they display on the recipient's machine depends on Lorem Flickr's availability.

→ For images that must be preserved, upload from your own machine with the `I` key — those are stored as dataURLs.

### File sizes

| Content | Size |
|---|---|
| One spell (~500 char action) | ~1 KB |
| Ten spells | 5–10 KB |
| Canvas (100 shapes) | 20–50 KB |
| Canvas (with 5 images) | 500 KB – several MB |

Image-laden bundles get big fast — be intentional.

---

## 10. iOS export

On iPhone / iPad, `export-all`, `export-spells`, and `export data` all open the **share sheet**:

- AirDrop to a Mac
- Save to iCloud Drive
- Send via Messages / Mail
- Upload to Drive / Dropbox

---

## Next steps

- How to import others' spells → [[08_Importing_Spells|08. Importing Spells]]
- Troubleshooting → [[09_Troubleshooting_FAQ|09. FAQ]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
