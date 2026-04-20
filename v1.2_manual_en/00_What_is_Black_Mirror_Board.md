---
title: 00. What is Black Mirror Board?
tags: [black-mirror, manual, introduction, v1.2, english]
created: 2026-04-19
order: 0
language: en
---

# 00. What is Black Mirror Board?

> Draw, speak, cast — a black board that works through three gestures.

---

## In one sentence

**"A blackboard you can draw on" + "a terminal you can type into" + "JSON-shareable spells"**
in a single browser app.

No download. No login. Open a URL — it just works.

---

## Screen layout

```
┌─────────────────────────────────────────┐
│ ◼ BLACK MIRROR                   ≡      │ ← header
├─────────────────────────────────────────┤
│                                         │
│                                         │
│                                         │
│           canvas                        │ ← where you draw
│       (black or white)                  │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ S P N E C G Q A T   1 2 3   X I         │ ← toolbar
├─────────────────────────────────────────┤
│  ❯ terminal input__                     │ ← where you type
│  [output log]                           │
└─────────────────────────────────────────┘
```

---

## Three core mechanics

### 1. Draw (the canvas)

- **Pen** — freehand line
- **Shapes** — circle / square / triangle / arrow / text
- **Color** — monochrome by default; per-object colors available
- **Editing** — select, move, resize, rotate, delete

### 2. Speak (the terminal)

Type a command in the bottom terminal — **the canvas reacts**. Examples:

```
dark              → switch to dark theme
biwako-blue       → retint every stroke cobalt
scatter           → scatter selected objects randomly
fetch-img sea 4   → search "sea", place 4 images as a 2×2 grid
```

### 3. Spells (custom commands)

Beyond built-ins, **you can register your own spells**:

```
register hello BM.log('hello world!')
```

→ Now typing `$ hello` prints `hello world!` to the terminal.

**Spells are JSON. That means anyone can share them**. This is the core of Black Mirror Board.

---

## What's it for?

### As a drawing tool

- Quick-sketching ideas
- Rough brainstorming diagrams
- Mood board assembly
- Flowcharts and schematics

### As an experiment playground

- Generating layout variations on impulse
- Composing random compositions
- Searching → arranging → monochroming images in a single command

### As a community tool

- Distribute your spells on SNS
- Import others' spells into your own board
- Have AI author spells and share them

---

## First 30 seconds

1. Click the pen icon (bottom-left) or press `P`
2. Draw something with your mouse
3. Type `biwako-blue` into the terminal and hit Enter
4. The stroke turns blue — you've cast your first spell

---

## Where is my data stored?

**Everything lives in the browser locally** (IndexedDB / localStorage).

- No account required
- Nothing is uploaded to a server
- No privacy concerns
- Caveat: **if you clear browser data, it's gone** — use `export data` for hard backups

---

## Next steps

- Controls → [[01_Basics_Drawing_and_Shortcuts|01. Basics]]
- Terminal → [[02_Terminal_Command_Reference|02. Terminal Command Reference]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
