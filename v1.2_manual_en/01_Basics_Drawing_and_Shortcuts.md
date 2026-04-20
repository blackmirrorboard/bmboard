---
title: 01. Basics — Drawing and Shortcuts
tags: [black-mirror, manual, basics, v1.2, english]
created: 2026-04-19
order: 1
language: en
---

# 01. Basics — Drawing and Shortcuts

> Every mouse and keyboard gesture in one page. Once you know these, the tool feels like pen-on-paper.

---

## Tools

Pick from the bottom toolbar or with a keyboard shortcut:

| Key | Tool | Purpose |
|---|---|---|
| **S** | Select | Pick up, move, transform objects |
| **P** | Pen | Freehand drawing |
| **N** | Path | Click anchors to build a curve |
| **E** | Eraser | Click to delete an object |
| **C** | Circle | Drag to draw a circle |
| **G** | Triangle | Drag to draw a triangle |
| **Q** | Square | Drag to draw a square |
| **A** | Arrow | Drag to draw an arrow |
| **T** | Text | Click to place text |

---

## Line width

| Key | Width |
|---|---|
| **1** | Thin (1.5px) |
| **2** | Medium (2.5px) |
| **3** | Thick (4px) |

---

## Select and edit

### Selecting

| Action | Effect |
|---|---|
| Click | Single select |
| Shift + Click | Toggle add / remove from selection |
| Drag (with Select tool) | Marquee select (rectangular) |
| Esc | Deselect all |

### Editing

| Action | Effect |
|---|---|
| Drag | Move |
| Drag corner handle | Resize |
| Drag top handle | Rotate |
| **Del** / **Backspace** | Delete |
| **Cmd+Z** / **Ctrl+Z** | Undo |
| **Cmd+Shift+Z** | Redo |

---

## Canvas navigation

| Action | Effect |
|---|---|
| **Space + drag** | Pan |
| Mouse wheel | Zoom |
| Pinch in / out (touch) | Zoom |
| 2-finger drag (touch) | Pan |

---

## Themes

Type a theme name in the terminal:

```
dark     → black background · white strokes
light    → white background · black strokes
gray     → studio theme (pebble ground · cobalt accent)
```

---

## Images

| Action | Effect |
|---|---|
| **I** key | Upload an image from your machine |
| `fetch-img` in terminal | Search by keyword and place |
| Drag image | Move |
| Corner handle | Resize |

---

## Export

| Action | Effect |
|---|---|
| **X** key | Export selection as a transparent PNG |
| `export` in terminal | Same |
| `export data` in terminal | Bundle the whole workspace as JSON |

---

## Mobile

### Touch gestures

- **Tap** — select or start drawing
- **Long press** — right-click equivalent (context menu)
- **2-finger tap** — deselect
- **Pinch** — zoom
- **2-finger drag** — pan

### Mobile toolbar

A compact toolbar appears at the bottom. Keyboard shortcuts don't apply on mobile — use the toolbar instead.

---

## Common flows

### Rough sketch

```
1. P    → Pen, draw freely
2. E    → Eraser for corrections
3. X    → Export as PNG
```

### Mood board

```
1. Terminal: fetch-img mountain 6
  → 6 mountain images placed in a grid
2. Click an image you don't like → Del to remove
3. T to add text → "mountain mood draft"
4. export → save as PNG
```

### Layout experiment

```
1. Q to draw a few squares
2. S → Cmd+A to select all
3. Terminal: scatter
  → they fly apart randomly
4. Keep it, or Cmd+Z to revert
```

---

## Next steps

- Deeper into the terminal → [[02_Terminal_Command_Reference|02. Terminal Command Reference]]
- Spells → [[03_Spell_Basics_and_Presets|03. Spell Basics]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
