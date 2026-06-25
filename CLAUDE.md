# CLAUDE.md

Guidance for Claude Code working in this repo. [AGENTS.md](AGENTS.md) is the longer-form
companion (concept and rationale); this file is the operational quick reference and reflects
the **current** code, including the Quick Capture widget, LLM/markdown export, and user
preferences — features added after AGENTS.md was last revised.

## What Loom is

A single-user, macOS-only desktop journal (Electron + React) organized around **threads**
instead of a flat note feed. Every entry lives inside a typed thread; threads nest into a tree.
Part journal, part lightweight task manager, part inbox.

Four thread types (the type changes what a thread is *for*, not how it stores data):

| Type       | Purpose                                                        |
| ---------- | ------------------------------------------------------------- |
| `question` | Open-ended reflections revisited over time.                   |
| `progress` | Append-only logs (workouts, habits, routines).                |
| `board`    | Tasks. Entries have `checked` / `pinned` / `dueDate`.         |
| `capture`  | Quick, low-friction notes. The **Inbox** is a `capture`.      |

The **Inbox** (`id: "inbox"`) is a hard-coded singleton: always present, filtered out of the
thread tree, can't be deleted, and is the destination for quick captures.

## Dev workflow

All commands run from `loom-desktop/` (the root `package.json` is a byte-identical duplicate — see Gotchas).

```bash
cd loom-desktop
npm install          # one-time
npm run dev          # vite on :5173 + electron (concurrently); hot-reloads src/
npm run build        # vite build + electron-builder --mac --dir → release/mac/Loom.app
npm run build:dmg    # same, but produces a DMG
```

From the repo root, `./install.sh` runs the build, quits any running Loom, copies the `.app`
to `/Applications`, and strips the quarantine xattr. Use it to dogfood a real install.

Hot reload covers [src/](loom-desktop/src/). Changes to [electron/main.js](loom-desktop/electron/main.js)
or [electron/preload.js](loom-desktop/electron/preload.js) require **restarting Electron** — the dev server won't pick them up.

## Repo layout

```
loom/
├── AGENTS.md, README.md, install.sh
├── package.json              # duplicate of loom-desktop/package.json (Gotcha #1)
└── loom-desktop/
    ├── index.html            # main window entry
    ├── widget.html           # Quick Capture widget entry (2nd Vite rollup input)
    ├── vite.config.js        # two inputs: main + widget
    ├── electron/
    │   ├── main.js           # main process: windows, IPC, file I/O, global hotkey, menu
    │   └── preload.js        # contextBridge → window.loomAPI
    └── src/
        ├── main.jsx          # React entry for the main window
        ├── App.jsx           # the entire main-window UI (~2200 lines, intentionally one file)
        ├── widget.jsx        # React entry for the widget window
        ├── QuickCaptureWidget.jsx  # the widget UI (owns no journal state)
        ├── export.js         # buildExportMarkdown() — LLM-friendly markdown export
        └── palette.js        # PALETTES { dark, light } shared by app + widget
```

`App.jsx` is one large file by design — keep it that way unless there's a real reason to split.

## Architecture

Electron two-process split, now with **two renderer windows**:

- **Main process** ([electron/main.js](loom-desktop/electron/main.js)) — owns both `BrowserWindow`s, the menu,
  the global hotkey, and all file I/O. Reads the saved theme synchronously at window-create time so the
  background doesn't flash the wrong color on launch.
- **Preload** ([electron/preload.js](loom-desktop/electron/preload.js)) — the only bridge. `window.loomAPI` exposes:
  - `loadData()` / `saveData(data)` — read/write the journal JSON.
  - `exportData()` — native save dialog, copies the raw JSON as a backup.
  - `exportMarkdown(md)` — native save dialog, writes an LLM-friendly `.md`.
  - `revealDataFile()` / `getDataPath()` — locate the data file in Finder.
  - `quickCapture(text)` / `getWidgetConfig()` / `setWidgetConfig(patch)` / `hideWidget()` — widget control.
  - `onDataChanged(cb)` — subscribe to `data-changed` broadcasts (returns an unsubscribe fn).

  `nodeIntegration: false`, `contextIsolation: true`. Nothing else crosses the bridge.
- **Renderers** — the main app ([src/App.jsx](loom-desktop/src/App.jsx)) and the widget
  ([src/QuickCaptureWidget.jsx](loom-desktop/src/QuickCaptureWidget.jsx)). Both are React SPAs.

### Persistence

- **Journal**: `~/Library/Application Support/Loom/loom-data.json`, shape `{ threads, theme, prefs }`.
  A `useEffect` watching `[threads, theme, prefs]` calls `saveData` on every change — **no debouncing** (gated by a `dataLoaded` flag so it doesn't clobber the file before the initial load resolves).
- **Widget config**: a *separate* file, `~/Library/Application Support/Loom/widget-config.json`,
  owned entirely by the main process. Kept out of `loom-data.json` because the renderer rewrites
  that blob wholesale and would erase keys it doesn't know about.
- **Mirrors in `localStorage`**: `theme` (so the first paint is correct before IPC resolves) and
  `prefs` (key `loom-prefs`).

### Multi-window sync

The widget never holds journal state. `loomAPI.quickCapture(text)` makes the **main process** the
single writer: it reads `loom-data.json`, appends one Inbox entry, writes it back, then
`broadcast("data-changed")`. The main app subscribes via `onDataChanged` and reloads. The main
process is the single writer for widget appends to avoid two renderers racing on the file.

### Quick Capture widget

Frameless, transparent, always-on-top (`layering: "float"`) or coverable (`"recede"`) window that
joins all Spaces incl. fullscreen. Toggled by a global hotkey (default `Alt+Space`, configurable).
Closing it only hides it (never quits the app). Bounds are persisted (debounced 400ms). If the app
was launched at login (hidden), the main window is skipped and only the widget appears.

### External links

`webContents.setWindowOpenHandler` routes any `window.open` / `target="_blank"` through
`shell.openExternal` and denies in-app navigation, on **both** windows. Don't undo this — it's what
stops a renderer-side XSS from navigating the window off the app.

## Data model

```ts
type ThreadType = "question" | "progress" | "board" | "capture";

interface Thread {
  id: string;              // timestamp-based, except the literal "inbox"
  title: string;
  description?: string;    // user-written blurb about the thread's intent (rendered, exported)
  type: ThreadType;
  parentId: string | null; // null = root-level
  entries: Entry[];        // array order IS the sort order
  displayMode?: "list" | "compact"; // per-thread entry layout in ThreadView; absent = "list"
  sortOrder?: "asc" | "desc";        // per-thread entry sort by date; absent = manual (array order, drag-reorderable)
  createdAt: string;       // cosmetic display string ("Today", "May 21") — NOT an ISO timestamp
  updatedAt: string;       // cosmetic
  special?: "inbox";       // only on the inbox thread
}

interface Entry {
  id: string;
  text: string;
  subtype: "entry" | "note";   // notes render dimmer/italic
  dateISO?: string;             // "YYYY-MM-DD" local time — AUTHORITATIVE
  date?: string;                // cosmetic label ("Today")
  ts?: number;                  // LEGACY days-ago offset; only read if dateISO absent
  checked?: boolean;            // board only
  pinned?: boolean;             // board only
  dueDate?: string;             // board only, "YYYY-MM-DD"
  parentEntryId?: string;       // one-level reply threading within a thread
}

interface Prefs {              // DEFAULT_PREFS in App.jsx
  density: "comfortable" | "compact";
  startupView: "home" | "timeline" | "inbox" | "last";
  showDoneByDefault: boolean;  // initial value of ThreadView's showDone toggle
}
```

### Invariants worth knowing

- `id: "inbox"` is a magic string — filtered out of `getChildren` and `rootThreads`, never in the tree.
- `dateISO` is authoritative; `ts` is legacy fallback only. Write `dateISO` only. It's computed via the
  local `localISO()` helper (NOT `toISOString()`) to avoid timezone drift around midnight. `main.js`
  has its own copy of `localISO` — keep them in sync.
- Reply threading is **one level**. Replies-to-replies aren't supported by the renderer.
- Entry order is array order. Reordering is array manipulation, not a sort-key change.

## UI structure ([src/App.jsx](loom-desktop/src/App.jsx))

Top-level component is `Loom`. It owns essentially all state: `threads`, `view`, `theme`, `prefs`,
selection sets, drag state, modal visibility. Views are selected by `view` state (a string that is
`"home"`/`"timeline"`/`"inbox"` or a thread id):

- **HomeView** — greeting, quick-capture box (writes to Inbox), `SmartSurface` ("needs attention"), grid of root `ThreadCard`s.
- **TimelineView** — every entry from every thread (except Inbox) flattened and grouped by `dateISO`.
- **Inbox** — the special inbox thread with a per-entry "move to thread" dropdown.
- **ThreadView** — single thread: entries (`EntryRow` / `EntryTreeNode`), nested `SubThreadSection`, footer input.

Supporting components: `Sidebar` + `SbThreadTree` (thread tree, drag/drop reparenting), `NewModal`
(create thread), `SettingsModal` (theme, prefs, exports, widget config), `ExportPickerModal` +
`ExportPickerNode` (select threads to export), `SelectionBar` (floating bulk-action bar).

### The `C` palette trick

`palette.js` exports `PALETTES`. `App.jsx` keeps a module-level `let C = PALETTES.dark` that every
component reads at render time; at the top of `Loom`'s render, `C` is reassigned to the current
theme's palette. Works because React renders synchronously top-down, so every child sees the right
`C`. This avoids threading `theme` through ~30 components. It's deliberate and unusual — don't
"fix" it into a context incidentally; that's a large diff. The widget reads `PALETTES` directly
(`PALETTES[theme]`) since it has no such tree.

## LLM / markdown export ([src/export.js](loom-desktop/src/export.js))

`buildExportMarkdown(threads, { selectedIds?, now? })` renders the journal as LLM-friendly markdown:
a schema preamble + stats, then one heading per thread (`##` root, deeper `#` for sub-threads),
entries as bullets, replies as nested `↳` bullets, board checkboxes, `📌` pins, `· due:…`, `*(note)*`
tags, descriptions as blockquotes. With `selectedIds`, children whose parent was excluded are
promoted to roots so nothing is silently dropped. Triggered from `SettingsModal` → `ExportPickerModal`,
which either copies to clipboard or calls `loomAPI.exportMarkdown`.

## Gotchas

1. **Two identical `package.json` files.** Root and `loom-desktop/` are byte-identical so `install.sh`
   paths line up and electron-builder works from either location. Update both, or consolidate someday.
2. **No debouncing on saves.** Every state change writes the full JSON. Fine at current scale.
3. **`createdAt` / `updatedAt` are display strings, not timestamps.** Set once, mostly not updated.
   Sorting by real creation time isn't possible without a schema change.
4. **The Inbox is load-bearing.** Many paths assume `id: "inbox"` exists; `quickCapture` recreates it
   if missing. `SEED` seeds it (and only it) on first launch. Don't remove it.
5. **`localISO` is duplicated** in `App.jsx` and `electron/main.js`. Keep them identical.
6. **Widget config lives in its own file** (`widget-config.json`), separate from the journal. Don't
   move widget settings into `loom-data.json` (renderer would erase them on the next save).
7. **No migration path yet.** `loadData` does no schema migration; the first migration will have to
   invent the pattern. `dateISO` is authoritative when you do.
8. **Mac-only assumptions.** `titleBarStyle: "hiddenInset"`, `trafficLightPosition`, the `.icns` asset,
   `setVisibleOnAllWorkspaces`, login-item handling, the `Library/Application Support` path, and
   `install.sh` all assume macOS.
9. **`SEED` ships empty** (Inbox only). Keep it empty — public history previously leaked personal seed data.

## When changing things

- Main-window UI → [src/App.jsx](loom-desktop/src/App.jsx). Test in `npm run dev`.
- Widget UI → [src/QuickCaptureWidget.jsx](loom-desktop/src/QuickCaptureWidget.jsx); shared colors in [src/palette.js](loom-desktop/src/palette.js).
- Persistence / IPC / windows / hotkey → [electron/main.js](loom-desktop/electron/main.js) + [electron/preload.js](loom-desktop/electron/preload.js). **Restart Electron** after changes.
- Export format → [src/export.js](loom-desktop/src/export.js).
- New thread type → extend `TYPES` in App.jsx and make Home, Timeline, ThreadView, and `export.js`
  (`TYPE_META`) handle it. Type strings are persisted, so renaming an existing type is a migration.
