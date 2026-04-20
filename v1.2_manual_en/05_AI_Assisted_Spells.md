---
title: 05. AI-Assisted Spells
tags: [black-mirror, manual, ai, claude, chatgpt, prompt, v1.2, english]
created: 2026-04-19
order: 5
language: en
---

# 05. AI-Assisted Spells

> Ask Claude / ChatGPT to generate a spell JSON for you.
> **This guide is designed to be copy-pasted directly to an AI.**

---

## Why delegate to AI?

- No JavaScript required on your side
- Complex spells can be requested in natural language
- Reliability increases once you teach the AI the common pitfalls

But **AIs don't know the BM API out of the box**, so you must hand them the context up front.

---

## Prompt template (copy-paste this)

Hand the block below to an AI and you'll get working spell JSON back most of the time.

````
You are a Black Mirror Board spell author.
Return exactly one JSON object matching the shape below. Return nothing else.

## Output shape

{
  "command": "spell-name (a-z 0-9 _ -, 30 chars max)",
  "action": "javascript source, single string"
}

## BM API (the only functions available inside action)

Lookup:
- BM.getSelected()              selected objects
- BM.all()                      every object on the canvas
- BM.getById(id)                lookup by id
- BM.find(fn)                   filter by predicate

Mutation:
- BM.create(type, props?)       spawn an object (type ∈ 5 values below)
- BM.update(obj|id, patch)      bulk-patch attributes
- BM.translate(obj, dx, dy)     move
- BM.setStroke(obj, color)      stroke color
- BM.setFill(obj, color)        fill color
- BM.remove(obj)                delete
- BM.clear()                    wipe canvas

State:
- BM.viewCenter()               { x, y }
- BM.rand(min, max)             uniform random
- BM.getMode()                  theme name
- BM.setMode(mode)              switch theme

Rendering:
- BM.redraw()                   repaint (call after any mutation)
- BM.save()                     commit to undo history
- BM.log(msg, cls?)             terminal print (cls: 't-ok'/'t-err'/'t-dim')

## BM.create types — only 5

- circle    { cx, cy, rx, ry }
- square    { x, y, w, h }     ← NOTE: 'rect' does NOT exist
- triangle  { x, y, w, h }
- arrow     { x1, y1, x2, y2 }
- text      { x, y, text, fontSize }

## Forbidden (will break)

- BM.create('rect', ...)        ← use 'square'
- document.*                    ← DOM direct access discouraged
- window.*                      ← same
- fetch() / XMLHttpRequest      ← usable but CORS-bound
- import / require              ← no module system
- external libraries            ← only BM API
- async/await                   ← action runs synchronously

## Style rules

- Declare with const / let (avoid var)
- End with BM.redraw() after any mutation
- Call BM.save() on meaningful changes so Cmd+Z works
- For selection-required spells, guard empty selection:
    if (!sel.length) { BM.log('select first', 't-err'); return; }
- Print a success message at the end for feedback

## Request

(describe the spell you want, one or two sentences)
Example: "a spell that gathers selected objects at the view center."
````

Replace the last "Request" line with what you actually want.

---

## Example interaction

**You:**
```
Request: gather selected objects at the view center
```

**AI (expected):**
```json
{
  "command": "center-all",
  "action": "const sel=BM.getSelected();if(!sel.length){BM.log('select first','t-err');return}const vc=BM.viewCenter();for(const o of sel){if(o.data.cx!==undefined){o.data.cx=vc.x;o.data.cy=vc.y}else if(o.data.x!==undefined){o.data.x=vc.x-(o.data.w||0)/2;o.data.y=vc.y-(o.data.h||0)/2}}BM.redraw();BM.save();BM.log('centered '+sel.length+' object(s)')"
}
```

**Register:**
Copy that JSON and paste into the terminal — auto-registered.

---

## Common failure modes

### 1. AI uses `rect`

```
"action": "BM.create('rect', {x:0, y:0, w:100, h:100})"
```

→ **Error**: `BM.create: unknown type "rect"`

**Fix**: tell the AI "rect doesn't exist — use 'square'".

### 2. AI forgets `BM.redraw()`

Data changed, screen doesn't update.

**Fix**: remind it "always call BM.redraw() after mutations".

### 3. AI imports a library

```
"action": "import lodash from 'lodash'; ..."
```

→ won't run.

**Fix**: re-emphasize "BM API only, no external libraries".

### 4. AI uses async/await

```
"action": "const img = await fetch(...); ..."
```

→ action is sync; the await does nothing useful.

**Fix**: "rewrite with `.then()` chains — action is synchronous".

---

## Request-writing tips

### ✅ Good

```
A spell that fills only selected circles with red.
```

→ Specific, clear target, single behavior.

### ✅ Even better

```
A spell that fills only selected circles with red.
Ignore non-circle objects.
Error "no circle selected" if nothing circle-shaped is in the selection.
```

→ Edge case (empty selection) specified.

### ❌ Ambiguous

```
make the circles red
```

→ All circles? Selection only? Fill or stroke?

### ❌ Out of scope

```
a spell that embeds a YouTube video
```

→ Video embedding is not supported by `BM.create`. Check [[06_Capabilities_and_Limits|06. Capabilities and Limits]] before asking.

---

## Short form (for AI without a system prompt)

When you can't paste the full template:

````
Make a Black Mirror Board spell as JSON:
{"command":"NAME","action":"JS"}

Available API (nothing else):
BM.getSelected() / BM.all() / BM.create(type, props) / BM.translate(o,dx,dy) /
BM.setStroke(o,color) / BM.setFill(o,color) / BM.remove(o) / BM.clear() /
BM.viewCenter() / BM.rand(min,max) / BM.log(msg,cls?) / BM.redraw() / BM.save() /
BM.setMode(mode) / BM.getMode()

BM.create types (only 5):
circle / square / triangle / arrow / text
(no 'rect')

Always end with BM.redraw(). No async/await. No external libs.

Request: (what you want)
````

---

## Verification loop

After you get a JSON from the AI, **always verify**:

```
1. Paste the JSON into the terminal
2. Confirm "[OK] spell acquired — run: $<name>"
3. Run $ <name>
4. Check it behaves as intended
5. If it errors → copy the error message back to the AI
```

### Returning errors to the AI

Copy the full error straight in:

```
This errored:
[grain] runtime error: BM.create: unknown type "rect"

Please fix and re-emit the JSON.
```

The AI usually corrects it in one round.

---

## Grow a spell incrementally

1. Ask for the smallest working version
2. Verify
3. "Add a guard for empty selection"
4. "Add random color"
5. …continue one increment at a time

**Keep it working at every step.** Big-bang complexity fails more often than it succeeds.

---

## Next steps

- Know the limits → [[06_Capabilities_and_Limits|06. Capabilities and Limits]]
- Share your spells → [[07_Exporting_and_Sharing_Spells|07. Export]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
