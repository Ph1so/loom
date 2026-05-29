# AGENTS.md

Context for agents and contributors working in this repo. Read this first.

## What Loom is

A single-user, macOS-only desktop journal organized around **threads** rather than a flat note feed. Every entry lives inside a thread, and threads themselves nest into a tree. The app is part journal, part lightweight task manager, and part inbox.

There are four thread types, and the type changes what the thread is *for* rather than how it stores data:

| Type       | Purpose                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `question` | Open-ended reflections you revisit over time. Entries are introspective. |
| `progress` | Append-only logs (workouts, habits, routines).                           |
| `board`    | Tasks. Entries have `checked` and can be `pinned`; shows X/Y done.       |
| `capture`  | Quick, low-friction notes. The special **Inbox** is a `capture`.         |

The **Inbox** (`id: "inbox"`) is a hard-coded singleton thread. It's always pinned in the sidebar, filtered out of parent/child traversal, and can't be deleted. Entries in the Inbox can be moved into any other thread.

What makes Loom different from a flat notes app: you are always writing *into* a typed thread, threads can nest into a hierarchy, and entries within a thread can have one-level reply chains via `parentEntryId`.

## Repo layout

```
loom/
├── AGENTS.md                # this file
├── README.md
├── install.sh               # build + install to /Applications
├── package.json             # duplicates loom-desktop/package.json (see Gotchas)
├── loom-icon.png
└── loom-desktop/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── electron/
    │   ├── main.js          # Electron main process (window, IPC, file I/O)
    │   └── preload.js       # contextBridge exposing window.loomAPI
    ├── src/
    │   ├── main.jsx         # React entry
    │   └── App.jsx          # the entire UI (~1500 lines, intentional)
    └── assets/              # app icon
```

`App.jsx` is one large file by choice — the app is small enough that keeping everything colocated is easier to reason about than splitting it. Don't split it without a real reason.

## Dev workflow

All commands run from `loom-desktop/` (or from the root — both `package.json` files are identical, see Gotchas).

```bash
cd loom-desktop
npm install                  # one-time
npm run dev                  # vite on :5173 + electron pointing at it
npm run build                # vite build + electron-builder (.app, no DMG)
npm run build:dmg            # same, but produces a DMG
```

From the repo root, `./install.sh` runs `npm run build`, quits any running Loom, then copies the built `.app` to `/Applications` and strips the quarantine xattr. Use it to dogfood a real install.

Hot reload covers anything in [src/](loom-desktop/src/). Changes to [electron/main.js](loom-desktop/loom-desktop/electron/main.js) or [electron/preload.js](loom-desktop/loom-desktop/electron/preload.js) require restarting the Electron process.

## Architecture

Standard Electron two-process split:

- **Main process** ([electron/main.js](loom-desktop/electron/main.js)) — owns the `BrowserWindow`, the menu, and file I/O. Reads/writes one JSON file. Reads the saved theme synchronously at window-create time so the window background doesn't flash the wrong color on launch ([main.js:10-18, 45-53](loom-desktop/electron/main.js#L10-L53)).
- **Preload** ([electron/preload.js](loom-desktop/electron/preload.js)) — exposes exactly two methods on `window.loomAPI`:
  ```js
  loomAPI.loadData()       // → { threads, theme } | null
  loomAPI.saveData(data)   // → true | false
  ```
  Nothing else crosses the bridge. `nodeIntegration: false`, `contextIsolation: true`.
- **Renderer** ([src/App.jsx](loom-desktop/src/App.jsx)) — React SPA. All UI state lives in the root `Loom` component.

### Persistence

- **Location**: `~/Library/Application Support/Loom/loom-data.json` (via Electron's `app.getPath("userData")`).
- **Shape**: `{ threads: Thread[], theme: "dark" | "light" }`.
- **Save trigger**: a `useEffect` watching `[threads, theme]` calls `loomAPI.saveData` on every change — **no debouncing**. Fine at current scale; revisit if typing latency shows up with thousands of entries.
- **Theme is also mirrored to `localStorage`** so the initial render picks the right palette before the IPC `loadData` resolves.

### External links

`webContents.setWindowOpenHandler` routes any `window.open` / `target="_blank"` through `shell.openExternal` and denies in-app navigation ([main.js:71-74](loom-desktop/electron/main.js#L71-L74)). Don't undo this — it's the only thing keeping a renderer-side XSS from being able to navigate the window off the app.

## Data model

```ts
type ThreadType = "question" | "progress" | "board" | "capture";

interface Thread {
  id: string;              // timestamp-based, except the literal "inbox"
  title: string;
  type: ThreadType;
  parentId: string | null; // null = root-level
  entries: Entry[];        // order in the array IS the sort order
  createdAt: string;       // cosmetic ("Today", "May 21") — not an ISO timestamp
  updatedAt: string;       // cosmetic
  special?: "inbox";       // only on the inbox thread
}

interface Entry {
  id: string;
  text: string;
  subtype: "entry" | "note";   // notes render dimmer/italic
  dateISO?: string;             // "YYYY-MM-DD", local time (authoritative)
  date?: string;                // cosmetic label ("Today")
  ts?: number;                  // LEGACY: days-ago offset; only read if dateISO absent
  checked?: boolean;            // board only
  pinned?: boolean;             // board only
  dueDate?: string;             // board only, "YYYY-MM-DD"
  parentEntryId?: string;       // one-level reply threading within a thread
}
```

### Invariants worth knowing

- `id: "inbox"` is a magic string. It's filtered out of `getChildren` and `rootThreads` so it never appears in the thread tree, only in the dedicated Inbox sidebar slot.
- `dateISO` is authoritative. `ts` is a legacy field — `entryDayDiff` and `displayEntryDate` only fall back to it when `dateISO` is missing. New code should write `dateISO` only.
- `dateISO` is computed via a local `localISO()` helper, **not** `toISOString()`, to avoid timezone drift around midnight.
- Reply threading is **one level**. An entry can have `parentEntryId`; replies to replies are not supported by the renderer.
- Entry order is array order. Reordering is array manipulation, not a sort-key update.

## UI structure

Top-level component is `Loom` in [App.jsx](loom-desktop/src/App.jsx). It owns: `threads`, `view`, `theme`, selection sets, drag state, modal visibility.

Main views (selected via `view` state):
- **Home** — greeting, quick-capture box (writes to Inbox), "Needs Attention" surface, grid of root threads.
- **Timeline** — every entry from every thread (except Inbox) flattened and grouped by `dateISO`.
- **Inbox** — the special inbox thread, with a per-entry "move to thread" dropdown.
- **Thread** — single-thread view: entries, nested sub-threads, footer input.

Supporting components: `Sidebar` (thread tree, drag/drop reparenting), `NewModal` (create thread, pick type, optional parent), `SettingsModal` (theme toggle), `SelectionBar` (floating bulk-action bar when one or more threads/entries are selected).

### The `C` palette trick

There's a module-level `let C = PALETTES.dark` that every component reads at render time. At the top of the `Loom` render, `C` is reassigned to the palette matching the current theme. This works because React renders are synchronous and top-down within a single pass, so every child sees the correct `C`. The comment at [App.jsx:91-93](loom-desktop/src/App.jsx#L91-L93) calls this out explicitly.

This is unusual. It avoids threading `theme` as a prop or wiring a context through ~30 components. If you refactor it into a `ThemeContext`, expect a meaningful diff. Don't "fix" it incidentally.

## Gotchas

1. **Two identical `package.json` files.** Root and `loom-desktop/` are byte-identical. The root copy exists so `electron-builder` can be invoked from either location and so the install script paths line up. Don't update one without updating the other; ideally consolidate someday.
2. **No debouncing on saves.** Every state change writes the full JSON to disk. Acceptable now; not acceptable forever.
3. **`createdAt` / `updatedAt` are display strings, not timestamps.** They're set once and never updated. Sorting by "real" creation time is not currently possible without a schema change.
4. **The Inbox is load-bearing.** Many code paths assume a thread with `id: "inbox"` exists. `SEED` in [App.jsx](loom-desktop/src/App.jsx) seeds it on first launch. Don't remove it.
5. **Mac-only assumptions.** `titleBarStyle: "hiddenInset"`, `trafficLightPosition`, the `.icns` asset, the data path under `Library/Application Support`, and `install.sh` all assume macOS. Porting to Windows/Linux is doable but not free.
6. **Theme lives in two places.** Authoritative copy is in `loom-data.json`; a mirror in `localStorage` exists so the very first paint isn't wrong. Keep them in sync if you touch the theme code.
7. **`SEED` ships empty.** First launch shows an empty Inbox and no other threads. The repo's public history previously contained personal seed data — keep it empty.

## When changing things

- UI tweaks → [src/App.jsx](loom-desktop/src/App.jsx). Test in `npm run dev`.
- Persistence / IPC → [electron/main.js](loom-desktop/electron/main.js) and [electron/preload.js](loom-desktop/electron/preload.js). Restart Electron after changes; the dev server alone won't pick them up.
- Schema changes → update the `Thread` / `Entry` shape, add a migration in the `loadData` path (currently there is none — first migration will need to invent the pattern), and remember `dateISO` is authoritative.
- Adding a new thread type → extend the `TYPES` map in [App.jsx](loom-desktop/src/App.jsx) and make sure the Home, Timeline, and Thread views handle it. Type strings are stored in the JSON file, so renaming an existing type is a migration.
