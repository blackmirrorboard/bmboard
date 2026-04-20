---
title: 02. Terminal Command Reference
tags: [black-mirror, manual, terminal, commands, v1.2, english]
created: 2026-04-19
order: 2
language: en
---

# 02. Terminal Command Reference

> The complete list of commands available in Black Mirror Board v1.2.

---

## Using the terminal

Type next to the `❯` prompt at the bottom → press **Enter** to execute.

### Basics

| Key | Effect |
|---|---|
| `↑` / `↓` | Command history recall |
| Enter | Execute |
| Esc | Cancel input |
| Tab (desktop) | Theme switch menu, etc. |

### Input variants

All three of these are **the same command**:

```
scatter
$ scatter
$scatter
```

The leading `$` is decoration — works with or without it.

---

## 1. Theme switching

| Command | Effect |
|---|---|
| `dark` | Black background · white strokes |
| `light` | White background · black strokes |
| `gray` | Studio theme (pebble + cobalt) |

---

## 2. Project storage (in-browser)

| Command | Effect |
|---|---|
| `save <name>` | Snapshot the current canvas to IndexedDB |
| `ls` | List saved snapshots |
| `load <name>` | Restore a snapshot |

### Example

```
save draft-01     → snapshot the current state as "draft-01"
ls                → list your snapshots
load draft-01     → restore "draft-01"
```

Snapshots survive reloads but not a full browser-data wipe. For hard backups, use `export data`.

---

## 3. Spells (presets)

Built-in spells shipped by default:

| Command | Effect |
|---|---|
| `$ scatter` | Scatter selected objects randomly |
| `$ grid-3x3` | Place a 3×3 grid of squares |
| `$ biwako-blue` | Retint every stroke cobalt (`#0044CC`) |
| `$ fetch-img <keyword> <n>` | Search and place n images |
| `$ monoclo` | Grayscale the selected image(s) |
| `$ svg` | Export selection as an editable SVG |

### `fetch-img` details

```
fetch-img                  → "biwako", 1 image (default)
fetch-img mountain         → "mountain", 1 image
fetch-img mountain 6       → 6 images in a 3×2 grid
fetch-img tokyo night 9    → "tokyo night", 9 images
```

Max 25 per invocation. Images come from Lorem Flickr (no API key).

### `monoclo` details

1. Select one or more images
2. Type `monoclo` → Enter
3. Images turn grayscale (Cmd+Z reverts)

---

## 4. Spell management

| Command | Effect |
|---|---|
| `list` | List all registered spells (preset / user marked) |
| `register <name> <js>` | Create a new spell |
| `alias <new>=<old>` | Duplicate a spell under a new name |
| `forget <name>` | Delete a user spell (presets are protected) |
| `share <name>` | Copy a spell's JSON to the clipboard |

How to write your own → [[04_Authoring_Spells_BM_API|04. Authoring Spells]]

---

## 5. Export

| Command | Effect |
|---|---|
| `export` | Selection → transparent PNG |
| `$ svg` | Selection → editable vector SVG (Illustrator / Figma compatible) |
| `export magic` | Spell-picker modal (checkboxes) |
| `export data` | Bundle export modal (canvas / user / preset toggles) |
| `export-spells` | All user spells as a file (non-interactive) |
| `export-spells a b c` | Only the named spells (non-interactive) |
| `export-all` | Canvas + every spell as a bundle (non-interactive) |
| `share <name>` | Single spell → clipboard |

Deep dive → [[07_Exporting_and_Sharing_Spells|07. Exporting and Sharing]]

---

## 6. Import

No explicit import command. Both paths are auto-detected:

- **Paste JSON into the terminal** → registered automatically
- **Drop a file onto the board** → format auto-detected and registered

Deep dive → [[08_Importing_Spells|08. Importing Spells]]

---

## 7. Terminal operations

| Command | Effect |
|---|---|
| `clear` / `flush` | Clear the terminal log |
| `help` / `?` | Print a quick reference |
| `usage` / `man` / `docs` | Summon the usage overlay |
| `objects` | Dump info on every object currently on the canvas |
| `test-parse <anything>` | Debug: show how the parser tokenized input |

---

## 8. Easter eggs

| Command | Effect |
|---|---|
| `youtube` | YouTube-style ASCII flourish |

---

## Alphabetical cheat sheet

```
alias         duplicate a spell by a new name
clear         wipe the terminal log
dark          dark theme
docs          summon usage overlay
export        PNG export
export-all    bundle export
export data   interactive bundle dialog
export magic  spell picker modal
export-spells spells package
fetch-img     image search and placement
flush         wipe the terminal log
forget        remove a user spell
gray          studio theme
grid-3x3      3×3 grid preset
help          help reference
light         light theme
list          spells inventory
load          restore a project
ls            list projects
man           summon usage overlay
monoclo       grayscale images
objects       dump canvas objects
register      register a spell
save          snapshot project
scatter       scatter preset
share         copy spell JSON
svg           export selection as SVG
usage         summon usage overlay
youtube       easter egg
biwako-blue   cobalt preset
```

---

## Next steps

- Presets in depth → [[03_Spell_Basics_and_Presets|03. Spell Basics]]
- Write your own → [[04_Authoring_Spells_BM_API|04. Authoring Spells]]
- Back to index → [[INDEX]]

---

*99letters studio · Black Mirror Board v1.2 · 2026-04-19*
