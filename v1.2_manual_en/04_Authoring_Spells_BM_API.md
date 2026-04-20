---
title: 04. Authoring Spells · BM API
tags: [black-mirror, manual, magic, api, register, v1.2, english]
created: 2026-04-19
order: 4
language: en
---

# 04. Authoring Spells · BM API

> How to author your own spell, plus a complete BM API reference.

---

## How spells work

A spell is **a chunk of JavaScript** saved **under a name**.
Typing the name in the terminal executes the code.

### Minimum spell

```
register hello BM.log('hello world!')
```

→ `$ hello` prints `[BM] hello world!` to the terminal.

---

## The `register` command

### Syntax

```
register <name> <javascript code>
```

### Naming rules

- Alphanumeric + hyphen + underscore only (`a-z0-9_-`)
- Must start with a letter or digit
- Max 30 chars
- Case-insensitive (auto-lowercased)
- Can't be the same as a preset (will be renamed on import)

### Valid names

```
✅ hello
✅ my-scatter
✅ paint_red
✅ grid4x4
```

### Invalid names

```
❌ 魔法             (non-ASCII)
❌ -start           (leading hyphen)
❌ my scatter       (contains space)
❌ very-long-name-that-exceeds-thirty-chars   (too long)
```

---

## BM API reference

The only functions available inside a spell's `action`.

### Lookup

| API | Returns | Purpose |
|---|---|---|
| `BM.getSelected()` | array of objects | Currently-selected objects |
| `BM.all()` | array of objects | Every object on the canvas |
| `BM.getById(id)` | object or null | Lookup by id |
| `BM.find(fn)` | array of objects | Filter by predicate |

### Mutation

| API | Purpose |
|---|---|
| `BM.create(type, props?)` | Create a new object (only 5 types — see below) |
| `BM.update(obj\|id, patch)` | Bulk-patch an object's attributes |
| `BM.translate(obj, dx, dy)` | Move |
| `BM.setStroke(obj, color)` | Change line color (e.g. `'#FF0000'`) |
| `BM.setFill(obj, color)` | Change fill color |
| `BM.remove(obj)` | Delete |
| `BM.clear()` | Clear the whole canvas |

### State

| API | Returns | Purpose |
|---|---|---|
| `BM.viewCenter()` | `{x, y}` | Current view center |
| `BM.rand(min, max)` | number | Uniform random |
| `BM.getMode()` | string | Current theme (`'dark'`/`'light'`/`'gray'`) |
| `BM.setMode(mode)` | — | Switch theme |

### Render & persistence

| API | Purpose |
|---|---|
| `BM.redraw()` | Repaint (**must be called after any mutation**) |
| `BM.save()` | Commit to undo history (**call after meaningful changes**) |
| `BM.log(msg, cls?)` | Print to terminal (`cls`: `'t-ok'` / `'t-err'` / `'t-dim'`) |

### Export

| API | Purpose |
|---|---|
| `BM.exportSvg(objs?)` | Export objects as an editable SVG (new in v1.2) |

**`BM.exportSvg` behavior**

- Pass an array → those objects are exported
- Pass nothing → selected objects if any, otherwise every canvas object
- Output: saved as `BM_CANVAS_YYYYMMDD_HHMM.svg`
- Opens directly in Illustrator / Figma / Inkscape

```js
// Export only the selection (default)
BM.exportSvg();

// Export just the circles
BM.exportSvg(BM.find(o => o.type === 'circle'));

// Export just the text objects
BM.exportSvg(BM.find(o => o.type === 'text'));
```

---

## `BM.create` types

**Only 5 types are valid**. Any other throws.

| type | Required props | Example |
|---|---|---|
| `circle` | `cx, cy, rx, ry` | `BM.create('circle', {cx:100, cy:100, rx:50, ry:50})` |
| `square` | `x, y, w, h` | `BM.create('square', {x:0, y:0, w:100, h:100})` |
| `triangle` | `x, y, w, h` | `BM.create('triangle', {x:0, y:0, w:100, h:80})` |
| `arrow` | `x1, y1, x2, y2` | `BM.create('arrow', {x1:0, y1:0, x2:100, y2:0})` |
| `text` | `x, y, text, fontSize` | `BM.create('text', {x:0, y:0, text:'hello', fontSize:20})` |

### ⚠️ Important: `rect` does not exist

Use `square`. `BM.create('rect', ...)` errors:

```
[magic-name] runtime error: BM.create: unknown type "rect"
```

A very common mistake — especially when an AI writes the spell (see [[05_AI_Assisted_Spells|05]]).

---

## Example spells (beginner → intermediate)

### 1. Paint everything red

```
register paint-red for(const o of BM.all()){BM.setStroke(o,'#FF0000')}BM.redraw();BM.log('painted red!')
```

### 2. Spawn 5 random circles

```
register random-circles for(let i=0;i<5;i++){const vc=BM.viewCenter();BM.create('circle',{cx:vc.x+BM.rand(-200,200),cy:vc.y+BM.rand(-200,200),rx:BM.rand(20,60),ry:BM.rand(20,60)})}BM.redraw();BM.log('5 circles spawned')
```

### 3. Double the selection's size

```
register scale-up const sel=BM.getSelected();if(!sel.length){BM.log('select first','t-err');return}for(const o of sel){if(o.data.rx){o.data.rx*=2;o.data.ry*=2}if(o.data.w){o.data.w*=2;o.data.h*=2}}BM.redraw();BM.save();BM.log('scaled up '+sel.length+' object(s)')
```

### 4. Film-grain texture

```
register grain for(let i=0;i<120;i++){const vc=BM.viewCenter();const s=BM.rand(1,3);BM.create('square',{x:vc.x+BM.rand(-400,400),y:vc.y+BM.rand(-300,300),w:s,h:s,fill:null})}BM.redraw();BM.save();BM.log('grain applied — 120 particles')
```

### 5. Nudge selection 100px right

```
register nudge-right const sel=BM.getSelected();for(const o of sel){BM.translate(o,100,0)}BM.redraw();BM.save();BM.log('nudged right')
```

### 6. Nuke everything (reversible with Cmd+Z)

```
register nuke BM.clear();BM.redraw();BM.save();BM.log('everything is gone.')
```

---

## Idioms

### Always call `BM.redraw()` last

Mutating data doesn't repaint — redraw explicitly.

```
const o = BM.create('circle', {cx:0, cy:0, rx:50, ry:50});
// Nothing shows up without this:
BM.redraw();
```

### Call `BM.save()` after meaningful mutations

Without it, Cmd+Z won't rewind.

```
BM.translate(obj, 100, 0);
BM.redraw();
BM.save();   // enables Cmd+Z
```

### Red errors with `'t-err'`

```
if (!sel.length) { BM.log('select first', 't-err'); return; }
```

### Give feedback on success

```
BM.log('done — ' + count + ' object(s) affected');
```

---

## Spells travel as JSON

Registered spells can be copied with `share <name>`:

```json
{
  "command": "paint-red",
  "action": "for(const o of BM.all()){BM.setStroke(o,'#FF0000')}BM.redraw();BM.log('painted red!')"
}
```

Paste that JSON onto social media — anyone can register it by pasting into their own terminal.

---

## Next steps

- Have AI author your spells → [[05_AI_Assisted_Spells|05. AI Guide]]
- Know the limits → [[06_Capabilities_and_Limits|06. Capabilities and Limits]]
- Export and share → [[07_Exporting_and_Sharing_Spells|07. Export]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
