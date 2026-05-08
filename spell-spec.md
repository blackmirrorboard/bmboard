# BMBoard Spell Format Specification

> Canonical spec for AI agents and humans authoring **Black Mirror Board** spells.
> URL: <https://bmboard.studio/spell-spec.md> · HTML mirror: <https://bmboard.studio/spell-spec.html>
> Last updated: 2026-05-08 (v1.2)

---

## 0. ⚡ Lead with a working example — copy this, study it, then read the rest

A spell that scatters 15 🔥 emoji from view center, animates them outward with shrinking, then auto-clears:

```json
{"command":"fire","action":"const N=15,vc=BM.viewCenter();const sparks=[];for(let i=0;i<N;i++){const s=BM.create('text',{x:vc.x,y:vc.y,text:'🔥',fontSize:20+Math.random()*20});sparks.push({o:s,vx:(Math.random()-0.5)*15,vy:(Math.random()-0.5)*15});}let f=0;const id=setInterval(()=>{if(f++>40){clearInterval(id);for(const s of sparks){const i=BM.all().indexOf(s.o);if(i>=0)BM.all().splice(i,1);}BM.redraw();BM.log('fire: extinguished.');return;}for(const s of sparks){s.o.data.x+=s.vx;s.o.data.y+=s.vy;s.o.data.fontSize*=0.92;}BM.redraw();},30);BM.log('fire: burst of 15 sparks.');"}
```

What this teaches you:

- **A spell is one line of JSON with exactly two keys: `command` and `action`.** Nothing else.
- **`action` is a string of raw JS** that gets executed via `new Function('BM','args',action)`.
- A typical spell pattern: `BM.create()` to spawn objects → `setInterval` for animation → `BM.all().splice()` to clean up → `BM.redraw()` after each mutation → `BM.log()` for status.

When you generate a new spell, your output should look structurally identical to the line above — different `command`, different JS body inside `action`, but the same shape.

---

## 1. The format

```json
{"command":"NAME","action":"JAVASCRIPT_CODE_AS_A_STRING"}
```

- `"command"` — the invocation name. Lowercase letters, digits, hyphens, underscores. 1–31 chars. After registration the user runs `$NAME` (or `NAME`) in the BMBoard terminal.
- `"action"` — **raw JavaScript code as a string**. BMBoard executes it via `new Function('BM','args',action)`. The string IS the code body; it is NOT a structured object.

There are **no other fields**. Output a single line, no Markdown fences, no leading prose.

## 2. Forbidden / hallucinated terms — DO NOT USE

These belong to other systems (Minecraft plugins, RPG engines, etc.) and have **no meaning in BMBoard**:

`internalName`, `displayName`, `description`, `icon`, `category`, `cost`, `mp`, `cooldown`, `actions` (as array of structured action objects), `PROJECTILE`, `particle`, `onHit`, `effect`, `range`, `power`, `type` (as a top-level field), `magic create`, `/bmboard`, `/reload`, `plugins/`, `skills/`, `give`, server-side, mod, plugin, manifest.

If you find yourself reaching for any of these, STOP — you are off-spec.

## 3. The `BM.*` API available inside `action`

| Symbol | Meaning |
|---|---|
| `BM.log(msg, cls?)` | Print to terminal. `cls` is `'t-ok'` / `'t-err'` / `'t-dim'` / undefined. |
| `BM.viewCenter()` | Returns `{x, y}` — current canvas view center in world coordinates. |
| `BM.create(type, props)` | Adds a new canvas object. Returns the object. |
| `BM.translate(obj, dx, dy)` | Move obj by delta. |
| `BM.update(idOrObj, patch)` | Patch obj's `data` with given properties. |
| `BM.remove(obj)` | Remove obj from canvas. |
| `BM.setStroke(obj, color)` | Set stroke color. |
| `BM.setFill(obj, color)` | Set fill color. |
| `BM.all()` | Array of all canvas objects (mutable — use `.splice` to remove). |
| `BM.getSelected()` | Array of currently-selected objects. |
| `BM.clear()` | Wipe all canvas objects. |
| `BM.redraw()` | Force a repaint. Call after every mutation. |
| `BM.save()` | Push a history snapshot for undo. |
| `BM.rand(min, max)` | Random number in `[min, max]`. |
| `args` | String passed at invocation. `$name foo bar` → `args === 'foo bar'`. |

## 4. Object types and `props`

| `type` | `props` |
|---|---|
| `circle` | `{cx, cy, rx, ry, rotation, fill, strokeOff}` |
| `square` | `{x, y, w, h, rotation, fill, strokeOff}` |
| `triangle` | `{x, y, w, h, rotation, fill, strokeOff}` or `{pts:[{x,y},{x,y},{x,y}], rotation, fill}` |
| `arrow` | `{x1, y1, x2, y2, rotation}` |
| `text` | `{x, y, text, fontSize, rotation}` |
| `sticky` | `{x, y, w, h, text, color, rotation}` (default `color: '#FFE873'`) |

Image objects (`type: 'image'`) exist but are not authored by spells; they come from upload/drop.
Stroke objects (`type: 'stroke'`) come from the pen tool, not from spells.

## 5. More working examples

### Minimal — drop a yellow sticky note at view center

```json
{"command":"hi","action":"const c=BM.viewCenter();BM.create('sticky',{x:c.x-100,y:c.y-100,w:200,h:200,text:'hello'});BM.redraw();BM.log('placed.');"}
```

### Toggle pattern (start / stop on the same command)

Stash the interval ID on `window` so a second invocation can stop it.

```json
{"command":"snowy","action":"if(window._snowyId){clearInterval(window._snowyId);window._snowyId=null;BM.log('stopped.');return;}let i=0;const c=BM.viewCenter();const items=[];for(let k=0;k<40;k++){const o=BM.create('text',{x:c.x+Math.random()*1200-600,y:c.y-400-Math.random()*200,text:'❄',fontSize:14+Math.random()*10});items.push({o,vy:0.5+Math.random()*1.2});}window._snowyId=setInterval(()=>{if(i++>10000){clearInterval(window._snowyId);window._snowyId=null;return;}for(const it of items){it.o.data.y+=it.vy;if(it.o.data.y>c.y+400){it.o.data.y=c.y-400;it.o.data.x=c.x+Math.random()*1200-600;}}BM.redraw();},30);BM.log('snowy: running. $snowy again to stop.');"}
```

### Use selection — recolor every selected object

```json
{"command":"red","action":"const sel=BM.getSelected();if(!sel.length){BM.log('select first','t-err');return;}for(const o of sel){BM.setStroke(o,'#FF0000');}BM.redraw();BM.log('recolored '+sel.length);"}
```

## 6. How a spell is registered

The BMBoard terminal accepts a spell three ways. **You (the spell author) only need to output the JSON** — the user picks a delivery method:

1. **Paste the JSON into the terminal** — auto-detected, registered, no Enter needed.
2. **Save as `.json` file and drag-drop onto the canvas** — auto-imported.
3. **Run `register <name> <js>`** in terminal — name and raw JS code on one line.

After registration, the user invokes with `$name` or just `name`.

## 7. AI agent system prompt (copy-paste-ready)

```
You are creating a "spell" for BMBoard, a single-page canvas web app.

OUTPUT FORMAT (mandatory, no exceptions):
{"command":"NAME","action":"JAVASCRIPT_CODE_AS_STRING"}

Output 1 line, no Markdown, no explanation, no code fences.

Reference example (study this shape — yours should look the same):
{"command":"fire","action":"const N=15,vc=BM.viewCenter();const sparks=[];for(let i=0;i<N;i++){const s=BM.create('text',{x:vc.x,y:vc.y,text:'🔥',fontSize:20+Math.random()*20});sparks.push({o:s,vx:(Math.random()-0.5)*15,vy:(Math.random()-0.5)*15});}let f=0;const id=setInterval(()=>{if(f++>40){clearInterval(id);for(const s of sparks){const i=BM.all().indexOf(s.o);if(i>=0)BM.all().splice(i,1);}BM.redraw();return;}for(const s of sparks){s.o.data.x+=s.vx;s.o.data.y+=s.vy;s.o.data.fontSize*=0.92;}BM.redraw();},30);"}

The action is RAW JS executed via `new Function('BM','args',action)`.
Available API:
- BM.log(msg, cls?)
- BM.viewCenter() → {x, y}
- BM.create(type, props)   // type: 'circle'|'square'|'triangle'|'arrow'|'text'|'sticky'
- BM.translate / update / remove
- BM.setStroke(obj, color), BM.setFill(obj, color)
- BM.all() / BM.getSelected() / BM.clear() / BM.redraw() / BM.save()
- BM.rand(min, max)
- args                     // string passed at call time

Object props:
- circle:   {cx, cy, rx, ry, rotation, fill}
- square:   {x, y, w, h, rotation, fill}
- triangle: {x, y, w, h, rotation, fill}
- arrow:    {x1, y1, x2, y2, rotation}
- text:     {x, y, text, fontSize, rotation}
- sticky:   {x, y, w, h, text, color, rotation}

NEVER use: internalName, displayName, description, icon, category, cost, cooldown,
mp, projectile, particle, onHit, range, power, type-as-top-level-field,
plugins, skills, magic create, /bmboard, /reload.
Those are not BMBoard.

Now create a spell: <DESCRIBE WHAT YOU WANT>
```

## 8. Reference

- Full docs: <https://bmboard.studio/usage.html>
- Command reference: <https://bmboard.studio/commands.html>
- This spec (HTML): <https://bmboard.studio/spell-spec.html>
- This spec (Markdown): <https://bmboard.studio/spell-spec.md>
- LLM index: <https://bmboard.studio/llms.txt>
