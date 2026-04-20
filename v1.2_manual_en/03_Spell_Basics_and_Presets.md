---
title: 03. Spell Basics and Presets
tags: [black-mirror, manual, magic, preset, v1.2, english]
created: 2026-04-19
order: 3
language: en
---

# 03. Spell Basics and Presets

> What a "spell" is, and how to use the five built-in ones.

---

## What is a spell?

In Black Mirror Board, a **spell** is a custom command you can invoke from the terminal.

### How spells differ from regular commands

| | Regular command | Spell |
|---|---|---|
| Example | `save` / `load` / `dark` / `help` | `scatter` / `biwako-blue` / `fetch-img` |
| Defined by | The app itself | Individual JS snippets |
| Add / remove | Not possible | Freely (`register` / `forget`) |
| Shareable | No | Yes — as JSON |

In other words, **a spell is a JSON-expressible command**. This is the defining feature of Black Mirror Board.

---

## The five built-in presets

### 1. `$ scatter` — random scatter

Randomize the positions of selected objects.

**How to use**

```
1. Select multiple objects (Shift+click or marquee drag)
2. Type scatter → Enter
3. They're redistributed randomly
```

**Use case**: breaking out of default layouts during brainstorming, prototyping random compositions.

---

### 2. `$ grid-3x3` — order on demand

Place a 3×3 grid of squares at the view center.

**How to use**

```
Type grid-3x3 → Enter
```

**Use case**: wireframe scaffolding, thumbnail grids, mockup bases.

---

### 3. `$ biwako-blue` — the silent tint

Retint every stroke on the canvas cobalt blue (`#0044CC`).

**How to use**

```
Type biwako-blue → Enter
```

**Use case**: switching from monochrome draft to colored finish with one command. Cmd+Z reverts.

---

### 4. `$ fetch-img` — image summoning (v1.2)

Fetch and place images by keyword.

**How to use**

```
fetch-img                  → default "biwako" × 1
fetch-img mountain         → "mountain" × 1
fetch-img mountain 6       → 6 images · auto 3×2 grid
fetch-img tokyo night 9    → "tokyo night" × 9 · 3×3 grid
```

**Spec**

- API: Lorem Flickr (free, no key)
- Max 25 images
- Color returned by default (use `$ monoclo` for grayscale)
- Auto grid: `cols = ceil(√n)`

**Use case**: mood boards, reference collections, visual brainstorming prompts.

---

### 5. `$ monoclo` — grayscale (v1.2)

Grayscale the selected image(s).

**How to use**

```
1. Select one or more images
2. Type monoclo → Enter
3. They turn grayscale
4. Cmd+Z to revert
```

**Spec**

- Only acts on **images** (shapes and pen strokes are ignored)
- Filter: grayscale(100%) contrast(110%) brightness(95%)
- Persisted: reload-safe

**Use case**: unifying a mixed-color mood board in a single step.

---

### 6. `$ svg` — vector export (v1.2)

Export the selection as an editable SVG. The file opens directly in Illustrator / Figma / Inkscape with each object as an independent layer or path.

**How to use**

```
1. Select the objects to export (pen, text, shapes, images — mixed is fine)
2. Type svg → Enter
3. Saved as BM_CANVAS_YYYYMMDD_HHMM.svg (iOS opens the share sheet)
4. If nothing is selected, the whole canvas is exported
```

**Spec**

- All 7 object types supported: circle / square / triangle / arrow / text / pen stroke / image
- Mapping:
  - circle → `<ellipse>`
  - square → `<rect>`
  - triangle → `<polygon>`
  - arrow → `<line>` + tip `<polygon>`
  - text → `<text dominant-baseline="hanging">`
  - pen stroke → `<path d="M ... Q ...">` (closed paths end with `Z` + fill)
  - image → `<image href="...">` (dataURL preferred; URL-only images depend on origin availability)
- Rotation: wrapped in `<g transform="rotate(deg cx cy)">`
- Colors: resolved at export time from the current theme (`resolveFill()` / `getStrokeColor()`)
- viewBox: target-object bounding box + 20px padding
- Filename: `BM_CANVAS_YYYYMMDD_HHMM.svg`

**Caveats**

- **Exporting from DARK mode produces light-colored strokes.** They'll look invisible on a white canvas — switch to `light` / `gray` mode first, or set your viewer's background to dark
- `fetch-img` images that failed CORS persistence are linked by URL (not embedded) → they rely on the origin being reachable
- Text font is set to `Courier New, monospace`. Illustrator / Figma will let you substitute freely

**Use case**

- Handoff to Illustrator / Figma for finishing
- High-resolution vector assets for decks / print
- Logo / icon drafts polished in pro tools

---

## Composing presets — example flows

### Mood board

```
1. fetch-img ocean 9       → 9 ocean photos in a 3×3
2. Click unwanted ones → Del
3. Marquee-select remaining
4. monoclo                 → unify in grayscale
5. T to add commentary
6. export                  → save as PNG
```

### Layout exploration

```
1. grid-3x3                → baseline 3×3 skeleton
2. Customize each cell manually (pen, shape, text)
3. biwako-blue             → tint cobalt for variant
4. Cmd+Z to explore color variants
```

---

## Presets can't be deleted

```
forget scatter
→ forget: "scatter" is a preset
```

Presets are permanent. Only user-authored spells (shown as `[ user ]`) can be removed with `forget`.

---

## Can presets be overwritten?

**No**. When a same-named spell is pasted or dropped, the preset is protected and the incoming one is **registered under a renamed key**:

```
[preset] $scatter                 (remains)
[ user ] $scatter_2026-04-19      (the import)
```

Even explicit `register` can't clobber a preset.

---

## Next steps

- Write your own spells → [[04_Authoring_Spells_BM_API|04. Authoring Spells]]
- Have AI write them for you → [[05_AI_Assisted_Spells|05. AI Guide]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
