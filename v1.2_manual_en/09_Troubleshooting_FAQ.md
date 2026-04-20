---
title: 09. Troubleshooting FAQ
tags: [black-mirror, manual, faq, troubleshooting, v1.2, english]
created: 2026-04-19
order: 9
language: en
---

# 09. Troubleshooting FAQ

> Common problems and their fixes — check here first.

---

## Drawing

### Q. Can't draw

- Is the tool stuck on "Select" (`S`)? → Press `P` for Pen
- On mobile, is a browser gesture intercepting? → Avoid 2-finger moves while drawing

### Q. Color change doesn't apply to a selected stroke

Pre-v1.2 had a **pen-stroke color bug**. Fixed on 2026-04-19. Make sure you're using the current `app.html`.

### Q. My drawing disappeared

- Your browser may have cleared its data
- Private / incognito tabs don't persist anything
- Mitigation: run `save <name>` or `export data` periodically during work

---

## Terminal

### Q. `command not found`

- Check spelling
- Run `list` and verify the actual registered name
- Case is auto-lowercased, so case mismatches aren't the cause
- Watch for duplicated `$` (e.g. `$$scatter`)

### Q. The log says "executed" but nothing visible happens (e.g. `$ biwako-blue`)

- Your canvas may have **zero targets** — draw something first
- Targets may be off-screen — Space+drag to locate them
- Pre-v1.2 pen-stroke bug — upgrade to current

### Q. Arguments vanish from the display (e.g. `fetch-img sea` shows as just `fetch-img`)

A pre-v1.2 **display-only bug**. Fixed on 2026-04-19. Arguments were always processed correctly; only the echo was cosmetic. Current build is correct.

---

## Spells

### Q. `$ fetch-img` doesn't return images

Checklist:

1. Is it `[preset] $fetch-img` in `list`?
2. If it's `[ user ] $fetch-img`, `forget fetch-img` → reload
3. DevTools → Network: is Lorem Flickr returning 503?
4. Offline environments can't fetch images (external API)

### Q. My spell throws when I run it

Common errors:

| Error | Cause | Fix |
|---|---|---|
| `unknown type "rect"` | Used `BM.create('rect', ...)` | Switch to `square` |
| `BM.create is not a function` | Wrong argument shape | Check `BM.create(type, props)` |
| `Cannot read property 'x' of undefined` | Accessed a missing property | Null-check `BM.getById` result |
| `Unexpected token` | JSON syntax error | Check commas and quotes |

### Q. My imported spell got a `_2026-04-19` suffix

**That's the collision-safe rename behavior** — existing spells are protected.

- Delete the original with `forget <name>`
- Or point to the rename with `alias <name>=<name>_2026-04-19`

### Q. How do I delete a preset?

**You can't**. `forget scatter` returns `[scatter] is a preset`. Presets are permanent by design.

### Q. The AI-authored spell doesn't work

- Hand the AI [[06_Capabilities_and_Limits|06. Capabilities and Limits]] and retry
- Copy the error back to the AI verbatim
- Especially watch for `rect` → `square` and `async/await` → `.then()`

---

## Export / Import

### Q. `export` doesn't download a PNG

- Selection is empty and canvas is empty → draw first
- Browser download policy is blocking it → check browser settings
- Mobile Safari opens the share sheet instead of downloading

### Q. Drop does nothing

- Extension isn't `.json` → rename and retry
- JSON is malformed → open in a text editor and validate
- Multiple files dropped → only the first is processed

### Q. My canvas was wiped after a bundle import

You picked **OVERWRITE**. Try:

- `Cmd+Z` (Undo) may still work
- Otherwise, `load <last-saved-name>` to restore the last explicit snapshot

---

## Performance

### Q. Sluggish

Possible causes:

1. **Too many objects** → run `objects`. Split if >1000.
2. **Too many images** → embedded dataURLs are heavy
3. **Old browser** → upgrade Chrome / Safari
4. **Large board on mobile** → prefer desktop

### Q. `fetch-img` freezes when I ask for 20+ images

Likely Lorem Flickr rate limiting. Fetch in batches of 10.

---

## Persistence

### Q. Everything vanished when I closed the browser

- Normally IndexedDB keeps it
- Private / incognito doesn't persist
- Clearing site data wipes it
- Mitigation: `save <name>` + `export data` for safety

### Q. How do I mirror state across machines?

No server sync. Manual sync:

```
Source machine: export data → USER ONLY → save file
↓
Transfer (iCloud / Drive / USB)
↓
Destination:    drop file → OVERWRITE
```

---

## Camera wipe (Black Mirror command)

### Q. `Black Mirror` doesn't open the camera

Possible causes:

1. **You opened via `file://`** — browsers block camera API outside secure contexts. Run `python -m http.server` locally or deploy to GitHub Pages (HTTPS)
2. **Permission previously denied** — reset the site's camera permission in your browser settings
3. **No camera on device** → `[black mirror] no camera detected` is logged
4. **Browser too old** — requires Chrome 80+, Safari 12+, Firefox 90+

### Q. Camera allowed but the wipe is black

- A browser extension (ad-blocker, VPN) may be intercepting camera frames
- Another app (Zoom etc.) is hogging the camera — close it and retry
- `Black Mirror off` then `Black Mirror` to recycle

### Q. iPhone is stuck in landscape

The wipe works in any orientation. If it won't rotate, iOS orientation lock is on — toggle the lock off from Control Center.

---

## Share URL (`share` with no args)

### Q. `share` doesn't open the modal

- **Canvas is empty** → `[share] canvas is empty` is logged. Draw something first
- **Old Safari (≤16.3)** → `CompressionStream` unsupported. Upgrade to Safari 16.4+ / Chrome 80+

### Q. URL is too long and breaks on SNS

If you see the `⚠ LONG URL — MAY FAIL` warning (URL > 8 KB):

1. Delete unused objects and `share` again
2. Images are already auto-stripped; reduce shape count if still too long
3. Alternative: `export data` to make a bundle JSON and share the file via Drive/iCloud
4. Receivers can paste the full URL directly into the address bar (bypass SNS preview)

### Q. Opening a share URL wiped my canvas

`share` is a **snapshot-replace** — incoming canvas overwrites current. Recovery:
- `Cmd+Z` (Undo) may still work
- Or pre-save with `save <name>` → `load <name>` to restore

### Q. Images are missing in shared URL

By design: images (from `fetch-img` or `I`-key upload) are **auto-stripped** to keep URLs short. The modal shows `N IMAGE(S) STRIPPED`. For full fidelity, use `export data` and distribute the bundle.

---

## Mobile-specific

### Q. iPhone auto-zooms when I focus the input

A pre-v1.2 bug. Fixed on 2026-04-18 (input `font-size` raised to ≥16px). Current build is fine.

### Q. Long-press paste doesn't register a spell

Pre-v1.2 bug. Fixed on 2026-04-18 (setTimeout fallback added).

### Q. Can't draw with touch

- Confirm JavaScript is enabled in Safari
- Try a different browser (Chrome for iOS)

---

## AI-assisted authoring

### Q. The AI keeps using `rect`

**Very common**. Tell it:

```
"rect" doesn't exist in this environment.
Use "square": BM.create('square', {x:0, y:0, w:100, h:100}).
```

### Q. The AI uses async/await

Action is synchronous — `await` does nothing useful. Instruct it:

```
Don't use async/await. Use .then() chains.
```

### Q. The AI's spell JSON won't load

Check the JSON syntax:

- Double-quoted properly
- Inner `"` escaped as `\"`
- Newlines escaped as `\n` (or fold action into one line)

---

## When you're still stuck

### Bug reports

1. Open DevTools (F12) → Console for the actual error
2. Copy the message and reproduction steps
3. Report via GitHub Issues or SNS

### Feature requests

- Tag `#blackmirror` on SNS
- For "I can't build spell X" questions, check [[06_Capabilities_and_Limits|06]] first

---

## Next steps

- Back to index → [[INDEX]]
- Start over → [[00_What_is_Black_Mirror_Board|00. Intro]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
