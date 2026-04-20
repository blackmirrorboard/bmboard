---
title: 06. Capabilities and Limits
tags: [black-mirror, manual, capabilities, limits, v1.2, english]
created: 2026-04-19
order: 6
language: en
---

# 06. Capabilities and Limits

> A single-page answer to "can a spell do X?"
> **Purpose: knowing the edges up front saves you from failing halfway through.**

---

## 🟢 Can do (works reliably)

### Object manipulation

| Goal | How |
|---|---|
| Create a shape | `BM.create(type, props)` — only 5 types |
| Transform an existing shape | `BM.update(obj, {...})` |
| Move a shape | `BM.translate(obj, dx, dy)` |
| Change stroke color | `BM.setStroke(obj, '#RRGGBB')` |
| Change fill color | `BM.setFill(obj, '#RRGGBB')` |
| Delete a shape | `BM.remove(obj)` |
| Delete all | `BM.clear()` |
| Get selection | `BM.getSelected()` |
| Get everything | `BM.all()` |
| Filter by predicate | `BM.find(o => o.type === 'circle')` |

### Randomness

| Goal | How |
|---|---|
| Random number in range | `BM.rand(min, max)` |
| Random scattering | use `BM.rand` on coordinates |
| Random hex color | `'#' + Math.floor(Math.random()*0xFFFFFF).toString(16)` |

### Theme operations

| Goal | How |
|---|---|
| Read current theme | `BM.getMode()` — `'dark'` / `'light'` / `'gray'` |
| Switch theme | `BM.setMode('dark')` |

### Terminal output

| Goal | How |
|---|---|
| Log a success | `BM.log('done')` or `BM.log('ok', 't-ok')` |
| Log an error | `BM.log('failed', 't-err')` |
| Dim log | `BM.log('info', 't-dim')` |

### Async patterns (like `fetch-img`)

| Goal | How |
|---|---|
| Load an image and place it | `new Image()` + `img.onload = () => {...}` |
| Fetch data from an external API | `fetch(url).then(r => r.json()).then(...)` — CORS applies |
| Delay an action | `setTimeout(() => {...}, 1000)` |

---

## 🟡 Possible but with caveats

### External API calls

| Goal | Caveat |
|---|---|
| Fetch images | **Without CORS headers, the browser blocks the request** |
| JSON API calls | Same. `Access-Control-Allow-Origin: *` required |
| Known-good APIs | Lorem Flickr / JSONPlaceholder / public RSS feeds |
| Known-bad APIs | OpenSky (origin-limited), Twitter (auth-gated), etc. |

### Canvas-side image processing

| Goal | Caveat |
|---|---|
| Apply a filter to an image (`$ monoclo`) | Must load with `crossOrigin='anonymous'` |
| Persist via dataURL | CORS-blocked images error out of `toDataURL()` |
| Fallback path | Reference the source URL (won't ride in export bundles) |

### Large-scale object generation

| Goal | Caveat |
|---|---|
| Create 1000+ shapes at once | Works, but noticeable slowdown |
| 10000+ | Can freeze the browser. Call `BM.redraw()` **once** after the loop |
| Comfort zone | 500–1000 shapes |

### Long-running spells

| Goal | Caveat |
|---|---|
| Animations (`setInterval`) | Works. You must provide a stop condition. |
| Infinite loops | Will slow the browser. Always terminate. |

---

## 🔴 Can't do (errors or no-ops)

### `BM.create` restrictions

| ❌ Invalid | ✅ Instead |
|---|---|
| `BM.create('rect', ...)` | `BM.create('square', ...)` |
| `BM.create('ellipse', ...)` | `BM.create('circle', ...)` with rx ≠ ry |
| `BM.create('line', ...)` | `BM.create('arrow', ...)` |
| `BM.create('polygon', ...)` | (Not supported — approximate with multiple shapes) |
| `BM.create('path', ...)` | (Not supported — use the Pen tool) |
| `BM.create('image', {src:...})` | (Not recommended — prefer `fetch-img` or `I` key) |

### JavaScript limits

| ❌ Not available | Why |
|---|---|
| `import` / `require` | No module system |
| `async/await` at the top of `action` | action is executed synchronously |
| External libraries (jQuery, Lodash, React, …) | None are loaded |
| Server communication | No server exists |
| Filesystem access (`fs.readFile`) | Browser environment only |
| Node.js APIs | Browser environment only |

### DOM operations

| Can / can't | Details |
|---|---|
| ✅ `document.createElement` | Works, but not recommended (outside spell scope) |
| ✅ `new Image()` | Required for image loading |
| ⚠️ `document.getElementById` | Works but fragile — depends on internal markup |
| ❌ Rewriting the whole page | Risks breaking the board |

### Persistence

| Can / can't | Details |
|---|---|
| ✅ Auto-save via IndexedDB | `BM.save()` commits to undo history |
| ✅ Named projects (`save`/`load`) | Explicit user actions |
| ❌ Writing to another domain's storage | Security-forbidden |
| ❌ Uploading to a server | No server |

---

## 📋 Object type matrix

What `BM.all()` returns, and what you can do with each:

| type | Read | Create | Move | Color | Delete |
|---|---|---|---|---|---|
| `circle` | ✅ | ✅ (create) | ✅ | ✅ | ✅ |
| `square` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `triangle` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `arrow` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `text` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `stroke` (pen) | ✅ | ❌ (user-drawn only) | ✅ | ✅ (v1.2 fix) | ✅ |
| `image` | ✅ | ❌ (via `fetch-img` or `I`) | ✅ | — | ✅ |

### `obj.data` property reference

Readable / writable attributes per type:

```
circle:   { cx, cy, rx, ry, rotation, fill, stroke, strokeOff }
square:   { x, y, w, h, rotation, fill, stroke, strokeOff }
triangle: { x, y, w, h, rotation, fill, stroke, strokeOff }
arrow:    { x1, y1, x2, y2, rotation }
text:     { x, y, text, fontSize, rotation, fill, stroke }
stroke:   { pts: [{x,y}, ...], lw, closed, fill, stroke, strokeOff }
image:    { x, y, w, h, src (dataURL or URL) }
```

---

## 💡 Common use cases and feasibility

| Goal | Possible? | Notes |
|---|---|---|
| Duplicate selection | ✅ | Re-create with same props |
| Grid layouts | ✅ | Loop `BM.create` |
| Randomize colors | ✅ | `BM.setStroke` + random color |
| Keyword image search | ✅ | Lorem Flickr (CORS OK) |
| Film-grain texture | ✅ | Scatter tiny squares |
| Rotate an object | ✅ | Set `obj.data.rotation` to a radian value |
| Animation | ⚠️ | `setInterval` works. Include a stop condition. |
| Play a sound | ⚠️ | `new Audio().play()` — user gesture required |
| PDF export | ❌ | No such feature (PNG / SVG yes) |
| GIF animation export | ❌ | No feature |
| SVG export | ✅ | `$ svg` handles it (new in v1.2, Illustrator/Figma compatible) |
| Video embed | ❌ | No `video` support in image type |
| Realtime co-editing | ❌ | No server (by design) |
| Cloud sync | ❌ | Local only (`export data` for manual backup) |

---

## 🧭 Decision flowchart

```
What are you trying to do?
  │
  ├─ Transform existing objects?
  │     └→ BM.getSelected / BM.all / BM.find to fetch them,
  │         then BM.update / BM.setStroke / BM.setFill / BM.translate
  │
  ├─ Create something new?
  │     └→ BM.create(type, props)  — only 5 valid types
  │
  ├─ Work with images?
  │     └→ Read how fetch-img is implemented (in app source)
  │
  ├─ Fetch external data?
  │     └→ Check CORS, then fetch()
  │
  └─ Something else
        └→ Cross-check against "🔴 Can't do" above
```

---

## Next steps

- Export and share → [[07_Exporting_and_Sharing_Spells|07. Export]]
- Import others' spells → [[08_Importing_Spells|08. Import]]
- Troubleshooting → [[09_Troubleshooting_FAQ|09. FAQ]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
