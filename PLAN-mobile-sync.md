# Plan: Mobile access + cross-device sync for Loom

Goal: use Loom on a phone as well as the Mac desktop, with the journal ("memory")
synced between them. Single user. This document is the implementation plan plus a
**bulletproofing log** — the edge cases found by adversarially reviewing the plan
against the actual code, and how the plan addresses each.

Status: PLANNING. No code written yet.

---

## 1. Verified starting point (facts checked against the code)

- `src/App.jsx` is **3,908 lines** of plain React (no desktop-native code in the render tree).
- The persistence seam is tiny. The renderer touches data through these `window.loomAPI` calls only:
  - `loadData()` — [App.jsx:493](loom-desktop/src/App.jsx#L493)
  - `saveData({ threads, theme, prefs, forms })` — [App.jsx:517](loom-desktop/src/App.jsx#L517)
  - `onDataChanged(cb)` refresh — [App.jsx:525-526](loom-desktop/src/App.jsx#L525-L526)
  - `exportMarkdown` [1423], `exportData` [1575], `revealDataFile` [1583] — desktop file dialogs
- The journal blob shape is **`{ threads, theme, prefs, forms }`** — note `forms`, a recurring-forms
  feature that is NOT in the CLAUDE.md data model but IS persisted.
- **24 `setThreads` call sites**, but none touch persistence directly — they all funnel into the
  single `saveData` effect ([App.jsx:515-519](loom-desktop/src/App.jsx#L515-L519)). Repoint one
  function, not 24.
- Four main-process-owned files today: `loom-data.json` (journal), `widget-config.json`,
  `llm-config.json` (**Anthropic API key — must never reach a browser**), `llm-memory.json`
  (LLM thread-memory profiles, separate file).
- localStorage mirrors: `loom-theme`, `loom-prefs`, `loom-last-view` — per-device first-paint caches
  ([App.jsx:425-486](loom-desktop/src/App.jsx#L425-L486)).
- LLM IPC handlers (`llm-suggest-sort`, `llm-review-journal`, `llm-build-memory`) receive `threads`
  as a **payload from the renderer** and use the main-process API key. They do not read the data
  file. ⇒ these features are structurally desktop-only on the web without a server proxy.
- Vite has **two rollup inputs** (main `index.html` + `widget.html`) — the web build must ship only main.

---

## 2. Target architecture

One new module, `src/storage.js`, presents the app's existing `load / save / subscribe` shape with
two backends. Both desktop and phone become clients of a cloud source-of-truth; desktop keeps its
local file as an offline backup. Supabase code lives in ONE file used by both platforms (the Electron
renderer makes network calls just like a browser), so the app is not forked.

```
App.jsx ──► storage.js ──┬──► window.loomAPI  (Electron only: local-file cache/backup)
                         └──► Supabase client  (cloud: source of truth + realtime)
```

**What syncs:** `threads`, `forms`, and `llm-memory.json` (read-only enrichment).
**What stays device-local (NOT synced):** `theme`, `prefs`, `last-view` (localStorage per device),
`widget-config.json` (desktop-only), `llm-config.json` (API key — desktop-only, never leaves the Mac).

---

## 3. Phase plan with line estimates

| # | Phase | Files | Net LOC | Effort |
|---|-------|-------|---------|--------|
| 0 | Backend + schema (blob-in-one-row) + RLS | Supabase SQL, `.env` | ~50 | few hrs |
| 1 | `storage.js` abstraction + wire App.jsx | new `src/storage.js`, `App.jsx` (~20 lines) | ~220 | ~1 day |
| 2 | Electron local-cache + widget→cloud push | `electron/main.js` | ~70 | ½ day |
| 3 | Single-user auth / login (web) + session persist | new `src/Login.jsx` | ~90 | ½ day |
| 4 | Web build target + web export fallbacks | `vite.config.js`, `App.jsx` | ~60 | ½ day |
| 5 | Responsive layout + touch + PWA | `App.jsx`, `manifest`, SW config | ~450–650 | 3–5 days |
| — | **v1 subtotal (usable synced phone app, last-write-wins)** | | **~950–1,150** | **~1.5–2 wks** |
| 6 | (opt) Per-record data model — kills offline clobber | schema, `storage.js`, migration | ~300–500 | 3–5 days |
| 7 | (opt) LLM features on phone via Edge Function proxy | Supabase function | ~120 | 1 day |

---

## 4. Per-phase detail

### Phase 0 — Backend
Supabase project (free tier, single user). v1 schema is one row:
```sql
create table journal (
  id text primary key,          -- constant "main"
  data jsonb not null,          -- { threads, forms }
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table journal enable row level security;
create policy "owner" on journal
  for all to authenticated using (true) with check (true);  -- single-user: any authed = you
```
`.env` (the already-open `.env.example`) gains `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Phase 1 — `storage.js` (the load-bearing piece)
~180–220 LOC: detect platform; init Supabase client; `loadData()` (**cloud-first**, fall back to
local cache); `saveData()` (**debounced** cloud push + immediate local write); `subscribe()`
(Supabase realtime replaces `onDataChanged`). App.jsx edit is ~20 lines: swap the three data
touchpoints for `storage.*`. Ship it behind the current Electron path first so nothing breaks.

### Phase 2 — Electron side
`main.js` keeps writing `loom-data.json` as offline backup. Edge case: a widget quick-capture while
the main window is closed must still reach the cloud → ~40-LOC main-process Supabase push helper.
When the window is open, the existing broadcast→reload→save path carries it up.

### Phase 3 — Auth
Single Supabase account. Tiny email/password login for the web build (~60–90 LOC). Persist the
session so you sign in once per device.

### Phase 4 — Web build
Separate Vite build that ships only `index.html` (not the widget). Web fallbacks for the three
desktop file-dialog calls: `exportData`/`exportMarkdown` → browser `Blob` download; `revealDataFile`
→ hidden on web.

### Phase 5 — Mobile UI (the real UX work)
Sidebar tree → hamburger drawer on narrow screens; hover-only row actions → always-visible/long-press;
**drag-to-reorder → touch alternative** (HTML5 DnD doesn't fire on touch — needs pointer-events DnD
or up/down buttons; fiddliest bit); viewport meta + iOS safe-area insets + `dvh` for the iOS 100vh
bug; larger tap targets; `vite-plugin-pwa` manifest + service worker (shell-only cache, network-first
so Supabase calls bypass the SW).

### Phase 6 — Per-record model (recommended, deferrable)
Split blob into `threads` + `entries` tables so edits merge instead of last-write-wins. ~40 LOC
schema + ~60 LOC migration + `storage.js` save rewrite (~200–400). Or adopt a sync engine
(PowerSync / ElectricSQL / Legend-State) — less custom code, a dependency to learn.

### Phase 7 — LLM on phone (optional)
Move suggest/review/build-memory behind a Supabase Edge Function that holds the API key server-side,
so the phone can call them. Desktop can keep using its local key or switch to the proxy.

---

## 5. Bulletproofing log

### Iteration 1 — data correctness & sync semantics
- **Whole-blob last-write-wins clobber.** Edit phone offline, edit desktop, phone syncs last →
  desktop's changes lost. *Mitigation v1:* `revision` counter — refuse to overwrite if the remote
  revision is newer than the base you loaded; surface a "reload, remote is newer" prompt. *Real fix:*
  Phase 6 per-record model.
- **Initial-load race / SEED clobber.** A fresh device (empty localStorage) seeds an Inbox on boot;
  the `dataLoaded` gate prevents saving before load. With cloud added, a fresh phone must fetch cloud
  BEFORE any save, or its empty/seeded state overwrites real data. *Mitigation:* `storage.loadData()`
  resolves cloud-first; only seed if BOTH cloud and local are empty; extend the `dataLoaded` gate to
  wait on the cloud fetch.
- **No debounce on saves.** The save effect fires on every `threads/forms` change ⇒ a cloud write
  per keystroke-ish edit. *Mitigation:* debounce cloud pushes (~800ms) in `storage.js`; keep local
  writes immediate.
- **theme/prefs are dual-stored and would sync unwantedly.** *Resolution:* exclude
  `theme`/`prefs`/`last-view` from cloud sync (keep them in localStorage per device); sync only
  `{ threads, forms }`. This also shrinks the conflict surface.
- **`forms` almost got dropped.** It's in the blob but absent from CLAUDE.md's data model.
  *Resolution:* explicitly include `forms` in the synced payload.

### Iteration 2 — security & auth
- **Public anon key.** The anon key is embedded in the web bundle. *Resolution:* RLS is mandatory —
  the anon key alone must grant zero data access; only an authenticated session (your one account)
  can read/write. Policy in Phase 0.
- **API key must never reach the browser.** LLM features stay desktop-only in v1 (they already run in
  the main process). Phone support = optional Phase 7 Edge Function proxy. The generated
  `llm-memory.json` may sync read-only, but *building* it requires the key ⇒ desktop-only action.
- **Electron session storage.** Persist the Supabase refresh token; for a single-user personal app,
  renderer localStorage persistence is acceptable — note it, revisit with `safeStorage` if desired.
- **External-link hardening.** Keep the existing `setWindowOpenHandler` on Electron; the web build
  gets `rel="noopener"` on any `target="_blank"`.

### Iteration 3 — platform, build & mobile UX
- **Two Vite inputs.** Web build must exclude `widget.html`. *Resolution:* Phase 4 separate build
  target.
- **Unguarded `window.loomAPI` calls.** e.g. [App.jsx:493](loom-desktop/src/App.jsx#L493) is
  unguarded; on web `loomAPI` is undefined. *Resolution:* all data access goes through `storage.js`,
  which platform-detects; audited desktop-only calls (`exportData`/`exportMarkdown`/`revealDataFile`)
  get web fallbacks or are hidden (Phase 4).
- **Quick Capture widget is desktop-only.** On phone the Home quick-capture box covers it; an
  optional PWA share-target could add capture-from-share later.
- **Service worker staleness.** SW must cache the app shell only and go network-first for data so it
  never serves stale Supabase responses. Standard `vite-plugin-pwa` config.
- **iOS PWA limits.** No reliable background sync; limited/again-gated push; storage eviction risk.
  The existing forms-due "notification" is in-app (fine). Real push notifications are out of scope.
- **Touch drag-and-drop.** HTML5 DnD doesn't fire on touch — reordering needs a pointer-events
  implementation or explicit up/down controls. This is the single biggest UX chunk in Phase 5.
- **iOS layout gotchas.** Use `dvh` (100vh is wrong on iOS Safari) and `env(safe-area-inset-*)`.

---

## 6. Open decisions (need a call before building)

1. **Sync robustness now or later?** Ship v1 last-write-wins (fast, fine for one careful user) and
   defer Phase 6, or build per-record from the start?
2. **Mobile shell:** PWA (cheapest, reuses App.jsx — recommended) vs. Capacitor (App Store + native
   APIs) vs. React Native (best feel, rewrites the UI).
3. **LLM on phone:** desktop-only for now (recommended v1), or build the Edge Function proxy (Phase 7)?
4. **Backend:** Supabase (assumed here) vs. Firebase vs. self-hosted PocketBase.

---

## 7. Bottom line

- **~950–1,150 net new lines for a usable, synced phone app (v1).** Only ~20 lines touch existing
  `App.jsx` logic; the rest is new files (`storage.js`, `Login.jsx`, PWA config) + the responsive pass.
- **+300–500 lines / +3–5 days** to make sync bulletproof against offline multi-device edits (Phase 6).
- **Being single-user removes the hardest ~40%** — no real auth system, no multi-tenancy, no access
  control; LWW is tolerable precisely because you're the only writer.
- The biggest single chunk is not the sync — it's the responsive/touch UI pass on a 3,900-line
  desktop-oriented component (Phase 5).
