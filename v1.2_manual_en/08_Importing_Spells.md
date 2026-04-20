---
title: 08. Importing Spells
tags: [black-mirror, manual, import, dnd, paste, v1.2, english]
created: 2026-04-19
order: 8
language: en
---

# 08. Importing Spells

> The complete guide to pulling other people's spells and bundles into your own board.

---

## Three import paths

| Path | Format | When to use |
|---|---|---|
| Paste into the terminal | JSON text, any shape | From SNS copy-paste |
| Drop a file onto the board | `.json` file | Downloaded files |
| `register` command | Hand-written JS | When writing a one-liner yourself |

---

## 1. Paste-based import

### Steps

1. Copy JSON from SNS or Discord
2. Paste into Black Mirror's terminal input (Cmd+V)
3. **No Enter required** — it auto-registers on paste

### Supported JSON shapes (4 variants)

| Shape | Example |
|---|---|
| Single spell | `{"command":"grain","action":"..."}` |
| Array of spells | `[{"command":"a",...},{"command":"b",...}]` |
| Spells package | `{"format":"blackmirror.spells","commands":[...]}` |
| Full bundle | `{"format":"blackmirror.bundle","project":...,"commands":[...]}` |

### Success log

```
paste > [JSON payload intercepted]
→ schema check... ✓
→ binding $grain...
[OK] spell acquired — run: $grain
```

### Paste on iOS

Long-press → Paste → auto-register. iOS compatibility issues are resolved in v1.2.

---

## 2. Drop-based import

### Steps

1. Grab a `.json` file from your desktop
2. Drag it onto the Black Mirror canvas
3. The full screen shows a dashed overlay: **◼ DROP JSON HERE**
4. Drop → format is auto-detected → registered

### Acceptance criteria

- Extension `.json` or MIME `application/json`
- Dropping multiple files → **only the first is processed**
- Otherwise: `[drop] "xxx" is not a JSON file.`

### Success log (spells package)

```
drop > [BM_SPELLS_20260419.json]
→ schema check... ✓
→ 3 spell(s) in payload
  [OK]     $my-scatter
  [RENAME] $grid → $grid_2026-04-19
  [SKIP]   $paint-red — identical
— 1 added · 1 renamed · 1 skipped
```

---

## 3. Auto-rename on collision

**If a same-named spell already exists, it's renamed with a date suffix**. Presets are never overwritten.

### Rename rules

| Situation | Result |
|---|---|
| Name free | Register as-is |
| Exists · **action identical** | Skip (duplicate guard) |
| Exists · action differs | Rename to `<name>_2026-04-19` |
| `_2026-04-19` also exists | Append `_2`, `_3`, … |
| Collides with preset | Always renamed — preset is immutable |

### Example

```
[incoming] {"command":"grid","action":"new code"}

Existing $grid stays as-is → incoming registered as $grid_2026-04-19
```

---

## 4. Bundle confirmation dialog

**Full bundles** (`blackmirror.bundle`, i.e. canvas-bearing) trigger a 3-way confirmation:

```
◼ BUNDLE DETECTED
incoming: 12 object(s), 3 spell(s)
current canvas: 5 object(s)

[O] OVERWRITE — replace current canvas with the bundle
[A] ADD       — merge bundle on top of current canvas
[C] CANCEL
```

| Button | Behavior |
|---|---|
| **OVERWRITE** | Erase current canvas, replace with bundle. View position restored too. |
| **ADD** | Keep current canvas, add bundle on top. Id collisions auto-renumbered. |
| **CANCEL** | Nothing happens (clicking outside the modal also cancels) |

Spells are auto-renamed regardless, so no collision there.

### Which one to pick?

| Situation | Recommendation |
|---|---|
| Open someone's workspace in full | **OVERWRITE** |
| Empty board receiving a bundle | Either (canvas is empty) |
| Overlay someone's art on your own | **ADD** |
| Made a mistake | **CANCEL** |

---

## 5. Paste flow in practice

### Pulling a spell from X

```
1. Friend posts:
   "Try this → {"command":"grain","action":"..."}"
2. Copy just the JSON
3. Paste into Black Mirror's terminal
4. Auto-registered
5. Run $ grain
```

### Bulk-importing from Slack

```
1. Copy JSON from the team's spell channel
2. Array form [{...},{...}] is OK
3. Paste once, many spells registered
```

---

## 6. Drop flow in practice

### Downloading from Drive

```
1. Download team_spells.json from Drive
2. From Downloads, drag onto the canvas
3. Auto-detected → multiple spells registered
4. Verify with list
```

### Syncing across machines

```
Mac:
1. export data (bundle)
2. Save to iCloud Drive

iPad:
3. Open Black Mirror in Safari
4. Drag the JSON from Files
5. Pick OVERWRITE to restore the workspace
```

---

## 7. Verifying imports

### List everything

```
list
```

→ Shows all registered spells, preset / user tagged.

### Inspect a single spell

```
share <name>
```

→ Copies its JSON to the clipboard; paste into a notes app to read.

---

## 8. Removing unwanted imports

### Delete a spell

```
forget <name>
```

Presets can't be deleted. Only user spells.

### Clean up renamed artifacts

```
forget grid_2026-04-19
```

Useful for decluttering date-suffixed imports later on.

---

## 9. Import limitations

### Local files only

**No direct URL import**. You must download first, then drop.

### Bundle size with images

Image-bearing bundles can be several MB (embedded dataURLs). Expect slower imports on mobile.

### Malformed JSON

Syntax errors and schema mismatches are rejected:

```
[drop] "xxx" — unrecognized JSON format.
```

Open the file in a text editor to debug.

---

## 10. Distributor's checklist

When you're the one sharing, make sure recipients have a smooth import:

- [ ] Verified on your own board first
- [ ] Spell name is descriptive
- [ ] No hidden CORS-limited API dependencies in `action`
- [ ] No invalid types like `BM.create('rect')`
- [ ] README / post explains usage
- [ ] Format suits the target audience (desktop vs mobile)

---

## Next steps

- Troubleshooting → [[09_Troubleshooting_FAQ|09. FAQ]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
