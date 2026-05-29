import { useState, useRef, useEffect } from "react";
import {
  Plus, Search, Check, ArrowLeft, X, MessageCircle, TrendingUp,
  LayoutGrid, Feather, Zap, Clock, Pin, CornerDownRight, ChevronDown,
  ChevronRight, Inbox, GripVertical, AlignLeft, List,
  AlertCircle, BookOpen, FolderOpen, Folder, Trash2, Settings, Sun, Moon,
  Calendar
} from "lucide-react";
import { buildExportMarkdown } from "./export.js";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
  textarea, input, select, button { font-family: "DM Sans", sans-serif; outline: none; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn { from { opacity:0; transform:translateY(16px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
  .t-card { transition: background 0.18s, border-color 0.18s, transform 0.18s; }
  .t-card:hover { background: #1C1A15 !important; border-color: rgba(255,255,255,0.11) !important; transform: translateY(-1px); }
  .s-item { transition: background 0.13s; border-radius: 8px; }
  .s-item:hover { background: rgba(255,255,255,0.04) !important; }
  .s-item.on { background: rgba(200,165,100,0.09) !important; }
  .ghost { transition: background 0.13s; }
  .ghost:hover { background: rgba(255,255,255,0.05) !important; }
  .e-row { transition: background 0.1s; border-radius: 8px; }
  .e-row:hover { background: rgba(255,255,255,0.025) !important; }
  .e-row:hover .row-actions { opacity: 1 !important; }
  .chk { transition: all 0.14s; }
  .chk:hover { border-color: rgba(255,255,255,0.28) !important; }
  .gold-btn { transition: all 0.15s; }
  .gold-btn:hover { opacity: 0.88 !important; }
  .type-pick { transition: all 0.16s; }
  .type-pick:hover { border-color: rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.03) !important; }
  .add-new:hover { border-color: rgba(255,255,255,0.18) !important; background: rgba(255,255,255,0.02) !important; }
  .attn-card { transition: background 0.16s, border-color 0.16s; cursor: pointer; }
  .attn-card:hover { background: #1C1A15 !important; border-color: rgba(255,255,255,0.12) !important; }
  .drag-over { border-color: rgba(200,165,100,0.4) !important; background: rgba(200,165,100,0.04) !important; }
  .subtype-toggle { transition: all 0.13s; }
  .subtype-toggle:hover { background: rgba(255,255,255,0.06) !important; }
  .move-select { appearance: none; -webkit-appearance: none; }
  .sub-card { transition: background 0.15s, border-color 0.15s; cursor: pointer; }
  .sub-card:hover { background: #1C1A15 !important; border-color: rgba(255,255,255,0.11) !important; }
  .crumb { transition: color 0.12s; cursor: pointer; }
  .crumb:hover { color: #EDE6D6 !important; }
  .collapse-btn { transition: background 0.12s; }
  .collapse-btn:hover { background: rgba(255,255,255,0.06) !important; }
  .thread-dragging { opacity: 0.35; }
  .drop-inside { background: rgba(200,165,100,0.07) !important; outline: 1px solid rgba(200,165,100,0.35) !important; border-radius: 8px; }
  .root-drop { transition: all 0.15s; border-radius: 7px; }
  .root-drop.active { background: rgba(200,165,100,0.07) !important; border-color: rgba(200,165,100,0.3) !important; }
  .reply-branch { border-left: 1.5px solid rgba(106,157,192,0.18); margin-left: 20px; padding-left: 16px; }

  /* ── Light-mode overrides ─────────────────────────────────── */
  .theme-light ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15) !important; }
  .theme-light .t-card:hover    { background: #F3ECDB !important; border-color: rgba(0,0,0,0.10) !important; }
  .theme-light .s-item:hover    { background: rgba(0,0,0,0.04) !important; }
  .theme-light .s-item.on       { background: rgba(156,126,64,0.13) !important; }
  .theme-light .ghost:hover     { background: rgba(0,0,0,0.05) !important; }
  .theme-light .e-row:hover     { background: rgba(0,0,0,0.025) !important; }
  .theme-light .chk:hover       { border-color: rgba(0,0,0,0.32) !important; }
  .theme-light .type-pick:hover { border-color: rgba(0,0,0,0.18) !important; background: rgba(0,0,0,0.03) !important; }
  .theme-light .add-new:hover   { border-color: rgba(0,0,0,0.22) !important; background: rgba(0,0,0,0.02) !important; }
  .theme-light .attn-card:hover { background: #F3ECDB !important; border-color: rgba(0,0,0,0.12) !important; }
  .theme-light .subtype-toggle:hover { background: rgba(0,0,0,0.05) !important; }
  .theme-light .sub-card:hover  { background: #F3ECDB !important; border-color: rgba(0,0,0,0.11) !important; }
  .theme-light .crumb:hover     { color: #2A2520 !important; }
  .theme-light .collapse-btn:hover { background: rgba(0,0,0,0.06) !important; }

  /* ── Compact density (sidebar only) ───────────────────────── */
  .density-compact .s-item        { padding-top: 5px !important; padding-bottom: 5px !important; }
  .density-compact .sb-title-row  { font-size: 12px !important; }
  .density-compact .sb-meta-row   { display: none !important; }
`;

const PALETTES = {
  dark: {
    bg: "#0B0A08", sb: "#0E0D0A", surf: "#151310", surf2: "#1C1A15",
    border: "rgba(255,255,255,0.07)", text: "#EDE6D6",
    text2: "#7A7264", text3: "#474038",
    entryText: "#C8C0AE",
    chkBorder: "rgba(255,255,255,0.18)",
    gold: "#C8A564", goldDim: "rgba(200,165,100,0.1)", goldBorder: "rgba(200,165,100,0.22)",
  },
  light: {
    bg: "#FDFAF3", sb: "#F5EFE2", surf: "#FFFFFF", surf2: "#FAF6EC",
    border: "rgba(0,0,0,0.09)", text: "#2A2520",
    text2: "#6B6356", text3: "#A39A87",
    entryText: "#3A322B",
    chkBorder: "rgba(60,46,28,0.45)",
    gold: "#9C7E40", goldDim: "rgba(156,126,64,0.10)", goldBorder: "rgba(156,126,64,0.28)",
  },
};

// `C` is read by every component during render. We reassign it at the top of
// the `Loom` render based on the active theme, so subsequent child renders see
// the right palette. Safe because React renders happen synchronously top-down.
let C = PALETTES.dark;

const TYPES = {
  question: { label: "Question", color: "#6A9DC0", bg: "rgba(106,157,192,0.1)",  border: "rgba(106,157,192,0.2)",  icon: MessageCircle, desc: "Open-ended reflections you sit with over time" },
  progress:  { label: "Progress",  color: "#7BAE82", bg: "rgba(123,174,130,0.1)", border: "rgba(123,174,130,0.2)", icon: TrendingUp,    desc: "Ongoing logs -- gym, habits, routines" },
  board:     { label: "Board",     color: "#C08A6A", bg: "rgba(192,138,106,0.1)", border: "rgba(192,138,106,0.2)", icon: LayoutGrid,    desc: "Action items and task tracking" },
  capture:   { label: "Capture",   color: "#9E84BF", bg: "rgba(158,132,191,0.1)", border: "rgba(158,132,191,0.2)", icon: Feather,       desc: "Quick notes, ideas, loose thoughts" },
};

// The inbox thread is required by the app (special "inbox" view).
// All other threads start empty -- users create their own.
const SEED = [
  {
    id: "inbox", type: "capture", title: "Inbox", special: "inbox", parentId: null,
    createdAt: "Today", updatedAt: "Today",
    entries: [],
  },
];

// ── helpers ──────────────────────────────────────────────────
function getChildren(threads, parentId) {
  return threads.filter(t => t.parentId === parentId && t.id !== "inbox");
}

function isDescendantOf(threads, threadId, ancestorId) {
  let cur = threads.find(t => t.id === threadId);
  while (cur && cur.parentId) {
    if (cur.parentId === ancestorId) return true;
    cur = threads.find(t => t.id === cur.parentId);
  }
  return false;
}

function buildAncestors(threads, threadId) {
  const path = [];
  let cur = threads.find(t => t.id === threadId);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId ? threads.find(t => t.id === cur.parentId) : null;
  }
  return path;
}

// `iso` is a "YYYY-MM-DD" string (date-only, no timezone).
function dueDayDiff(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function formatDue(iso) {
  const diff = dueDayDiff(iso);
  if (diff === null) return null;
  if (diff === 0)  return "Today";
  if (diff === 1)  return "Tomorrow";
  if (diff === -1) return "Yesterday";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Local YYYY-MM-DD (avoids UTC drift from toISOString)
function localISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoFromTs(ts) {
  if (typeof ts !== "number") return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ts);
  return localISO(d);
}

// Days from today → positive = past, negative = future. Derives from the
// authoritative dateISO when present (so it tracks the real calendar),
// otherwise falls back to the legacy ts snapshot.
function entryDayDiff(entry) {
  if (entry?.dateISO) {
    const diff = dueDayDiff(entry.dateISO);
    return diff === null ? 0 : -diff;
  }
  return typeof entry?.ts === "number" ? entry.ts : 0;
}

function displayEntryDate(entry) {
  if (entry?.dateISO) return formatDue(entry.dateISO);
  return entry?.date || "";
}

// ─────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────
const DEFAULT_PREFS = {
  density: "comfortable",      // "comfortable" | "compact"
  startupView: "home",         // "home" | "timeline" | "inbox" | "last"
  showDoneByDefault: false,    // initial value of ThreadView's showDone
};

function loadInitialPrefs() {
  try {
    const raw = localStorage.getItem("loom-prefs");
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function Loom() {
  const [threads, setThreads]         = useState(SEED);
  const [prefs, setPrefs]             = useState(loadInitialPrefs);
  const [view, setView]               = useState(() => {
    if (prefs.startupView === "last") {
      try { return localStorage.getItem("loom-last-view") || "home"; }
      catch { return "home"; }
    }
    return prefs.startupView || "home";
  });
  const [showNew, setShowNew]         = useState(null);   // null | parentId string (null means root)
  const [newTitle, setNewTitle]       = useState("");
  const [newType, setNewType]         = useState("question");
  const [search, setSearch]           = useState("");
  const [collapsed, setCollapsed]     = useState(new Set());
  const [dragState, setDragState]     = useState({ dragging: null, target: null });
  const [selectedThreadIds, setSelectedThreadIds] = useState(() => new Set());
  const [selectedEntryIds, setSelectedEntryIds]   = useState(() => new Set());
  const [theme, setTheme]             = useState(() => {
    try { return localStorage.getItem("loom-theme") === "light" ? "light" : "dark"; }
    catch { return "dark"; }
  });
  const [showSettings, setShowSettings] = useState(false);

  // Make the active palette visible to every child component (read at render time).
  C = PALETTES[theme] || PALETTES.dark;

  useEffect(() => {
    try { localStorage.setItem("loom-theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem("loom-prefs", JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  useEffect(() => {
    try { localStorage.setItem("loom-last-view", view); } catch {}
  }, [view]);
  // ── Data persistence via Electron IPC ──────────────────────
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (window.loomAPI) {
      window.loomAPI.loadData().then(data => {
        if (data && Array.isArray(data.threads) && data.threads.length > 0) {
          setThreads(data.threads);
        }
        if (data?.theme === "dark" || data?.theme === "light") {
          setTheme(data.theme);
        }
        if (data?.prefs && typeof data.prefs === "object") {
          setPrefs(p => ({ ...p, ...data.prefs }));
        }
        setDataLoaded(true);
      }).catch(() => setDataLoaded(true));
    } else {
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (dataLoaded && window.loomAPI) {
      window.loomAPI.saveData({ threads, theme, prefs });
    }
  }, [threads, theme, prefs, dataLoaded]);
  // target shape: { id: string, position: "before"|"after"|"inside"|"root" }

  const current     = threads.find(t => t.id === view);
  const inboxThread = threads.find(t => t.id === "inbox");
  const inboxCount  = inboxThread ? inboxThread.entries.length : 0;

  const go = (id) => { if (id !== view) setView(id); };

  const toggleCollapse = (id) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startThreadDrag = (id) => setDragState({ dragging: id, target: null });

  const updateDropTarget = (e, id, position) => {
    e.preventDefault();
    setDragState(s => {
      if (s.target?.id === id && s.target?.position === position) return s;
      return { ...s, target: { id, position } };
    });
  };

  const handleThreadDrop = () => {
    const { dragging, target } = dragState;
    setDragState({ dragging: null, target: null });
    if (!dragging || !target) return;
    if (dragging === target.id) return;
    if (target.position !== "root" && isDescendantOf(threads, target.id, dragging)) return;

    if (target.position === "root") {
      setThreads(p => p.map(t => t.id === dragging ? { ...t, parentId: null } : t));
      return;
    }
    if (target.position === "inside") {
      if (target.id === dragging) return;
      setThreads(p => p.map(t => t.id === dragging ? { ...t, parentId: target.id } : t));
      return;
    }
    // "before" or "after": reorder at the same level as target
    const targetThread = threads.find(t => t.id === target.id);
    const newParentId = targetThread ? targetThread.parentId : null;
    setThreads(prev => {
      let arr = prev.map(t => t.id === dragging ? { ...t, parentId: newParentId } : t);
      const fromIdx = arr.findIndex(t => t.id === dragging);
      const [moved] = arr.splice(fromIdx, 1);
      const toIdx   = arr.findIndex(t => t.id === target.id);
      arr.splice(target.position === "before" ? toIdx : toIdx + 1, 0, moved);
      return arr;
    });
  };

  const createThread = () => {
    if (!newTitle.trim()) return;
    const parentId = showNew === "root" ? null : showNew;
    const t = {
      id: Date.now().toString(), title: newTitle.trim(), type: newType,
      parentId, entries: [], createdAt: "Today", updatedAt: "Today",
    };
    setThreads(p => [...p, t]);
    setShowNew(null); setNewTitle("");
    go(t.id);
  };

  const addEntry = (tid, text, subtype, parentEntryId) => {
    if (!text.trim()) return;
    const e = { id: Date.now().toString(), text: text.trim(), dateISO: localISO(new Date()), date: "Today", ts: 0, checked: false, pinned: false, subtype: subtype || "entry", parentEntryId: parentEntryId || null };
    setThreads(p => p.map(t => t.id === tid ? { ...t, entries: [...t.entries, e], updatedAt: "Today" } : t));
  };

  const updateEntry = (tid, eid, text) => {
    if (!text.trim()) return;
    setThreads(p => p.map(t => t.id === tid
      ? { ...t, entries: t.entries.map(e => e.id === eid ? { ...e, text: text.trim() } : e) } : t));
  };

  const toggleCheck = (tid, eid) => {
    setThreads(p => p.map(t => t.id === tid
      ? { ...t, entries: t.entries.map(e => e.id === eid ? { ...e, checked: !e.checked } : e) } : t));
  };

  const pinEntry = (tid, eid) => {
    setThreads(p => p.map(t => t.id === tid
      ? { ...t, entries: t.entries.map(e => e.id === eid ? { ...e, pinned: !e.pinned } : e) } : t));
  };

  const setDueDate = (tid, eid, dueDate) => {
    setThreads(p => p.map(t => t.id === tid
      ? { ...t, entries: t.entries.map(e => e.id === eid ? { ...e, dueDate: dueDate || null } : e) } : t));
  };

  const setEntryDate = (tid, eid, iso) => {
    if (!iso) return;
    setThreads(p => p.map(t => t.id === tid
      ? { ...t, entries: t.entries.map(e => e.id === eid ? { ...e, dateISO: iso } : e) } : t));
  };

  const deleteEntry = (tid, eid) => {
    setThreads(p => p.map(t => t.id === tid ? { ...t, entries: t.entries.filter(e => e.id !== eid) } : t));
  };

  const moveEntry = (fromTid, eid, toTid) => {
    let moved = null;
    setThreads(p => {
      const from = p.find(t => t.id === fromTid);
      moved = from?.entries.find(e => e.id === eid);
      if (!moved) return p;
      return p.map(t => {
        if (t.id === fromTid) return { ...t, entries: t.entries.filter(e => e.id !== eid) };
        if (t.id === toTid)   return { ...t, entries: [...t.entries, { ...moved, pinned: false }], updatedAt: "Today" };
        return t;
      });
    });
  };

  const reorderEntries = (tid, newEntries) => {
    setThreads(p => p.map(t => t.id === tid ? { ...t, entries: newEntries } : t));
  };

  const renameThread = (tid, title) => {
    const trimmed = (title || "").trim();
    if (!trimmed) return;
    setThreads(p => p.map(t => t.id === tid ? { ...t, title: trimmed } : t));
  };

  const deleteThread = (tid) => {
    if (tid === "inbox") return;
    setThreads(prev => {
      const target = prev.find(t => t.id === tid);
      if (!target) return prev;
      // Reparent direct children up one level so we don't cascade-delete content
      return prev
        .filter(t => t.id !== tid)
        .map(t => t.parentId === tid ? { ...t, parentId: target.parentId } : t);
    });
    if (view === tid) go("home");
  };

  const toggleThreadSelection = (id) => {
    if (id === "inbox") return;
    setSelectedThreadIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleEntrySelection = (id) => {
    setSelectedEntryIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => {
    if (selectedThreadIds.size) setSelectedThreadIds(new Set());
    if (selectedEntryIds.size) setSelectedEntryIds(new Set());
  };

  const deleteSelected = () => {
    const tids = new Set([...selectedThreadIds].filter(id => id !== "inbox"));
    const eids = selectedEntryIds;
    if (tids.size === 0 && eids.size === 0) return;
    setThreads(prev => {
      const parentOf = new Map(prev.map(t => [t.id, t.parentId]));
      const liftedParent = (pid) => {
        let p = pid;
        while (p && tids.has(p)) p = parentOf.get(p) ?? null;
        return p;
      };
      return prev
        .filter(t => !tids.has(t.id))
        .map(t => ({
          ...t,
          parentId: tids.has(t.parentId) ? liftedParent(t.parentId) : t.parentId,
          entries: eids.size ? t.entries.filter(e => !eids.has(e.id)) : t.entries,
        }));
    });
    if (tids.has(view)) go("home");
    setSelectedThreadIds(new Set());
    setSelectedEntryIds(new Set());
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const inField = tag === "input" || tag === "textarea" || e.target?.isContentEditable;

      if (e.key === "Escape") {
        if (selectedThreadIds.size === 0 && selectedEntryIds.size === 0) return;
        if (inField) return;
        clearSelection();
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (inField || e.metaKey || e.ctrlKey || e.altKey) return;
        if (view === "home" || view === "timeline") return;
        const t = threads.find(th => th.id === view);
        if (!t) return;
        const hasKids = getChildren(threads, view).length > 0;
        if (!hasKids) return;
        const isOpen = !collapsed.has(view);
        if (e.key === "ArrowRight" && !isOpen) {
          e.preventDefault();
          toggleCollapse(view);
        } else if (e.key === "ArrowLeft" && isOpen) {
          e.preventDefault();
          toggleCollapse(view);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedThreadIds, selectedEntryIds, view, threads, collapsed]);

  const filtered = threads.filter(t => t.id === "inbox" || !search || t.title.toLowerCase().includes(search.toLowerCase()));
  const rootThreads = filtered.filter(t => t.id !== "inbox" && !t.parentId);

  const ops = { addEntry, updateEntry, toggleCheck, pinEntry, setDueDate, setEntryDate, deleteEntry, moveEntry, reorderEntries, renameThread, deleteThread };
  const selection = { selectedThreadIds, selectedEntryIds, toggleThreadSelection, toggleEntrySelection, clearSelection };
  const selectionCount = selectedThreadIds.size + selectedEntryIds.size;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: G }} />
      <div className={`theme-${theme} density-${prefs.density}`} style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text, overflow: "hidden" }}>
        <Sidebar
          threads={threads} filtered={filtered} rootThreads={rootThreads}
          view={view} go={go} search={search} setSearch={setSearch}
          setShowNew={setShowNew} inboxCount={inboxCount}
          collapsed={collapsed} toggleCollapse={toggleCollapse}
          dragState={dragState}
          startThreadDrag={startThreadDrag}
          updateDropTarget={updateDropTarget}
          handleThreadDrop={handleThreadDrop}
          openSettings={() => setShowSettings(true)}
          selectedThreadIds={selectedThreadIds}
          toggleThreadSelection={toggleThreadSelection}
          clearSelection={clearSelection}
        />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {view === "home"     && <HomeView     threads={threads} rootThreads={rootThreads} go={go} setShowNew={setShowNew} addEntry={addEntry} />}
          {view === "timeline" && <TimelineView threads={threads} go={go} />}
          {current && view !== "home" && view !== "timeline" && (
            <ThreadView
              key={current.id} thread={current} threads={threads} go={go}
              setShowNew={setShowNew}
              showDoneDefault={prefs.showDoneByDefault}
              {...ops}
              {...selection}
            />
          )}
        </main>
        {selectionCount > 0 && (
          <SelectionBar
            threadCount={selectedThreadIds.size}
            entryCount={selectedEntryIds.size}
            onDelete={deleteSelected}
            onClear={clearSelection}
          />
        )}
        {showNew !== null && (
          <NewModal
            title={newTitle} setTitle={setNewTitle}
            type={newType} setType={setNewType}
            parentId={showNew === "root" ? null : showNew}
            parentThread={showNew && showNew !== "root" ? threads.find(t => t.id === showNew) : null}
            onCreate={createThread} onClose={() => setShowNew(null)}
          />
        )}
        {showSettings && (
          <SettingsModal
            theme={theme}
            setTheme={setTheme}
            prefs={prefs}
            setPrefs={setPrefs}
            threads={threads}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// SELECTION BAR (floating, appears when items are multi-selected)
// ─────────────────────────────────────────────────────────────
function SelectionBar({ threadCount, entryCount, onDelete, onClear }) {
  const parts = [];
  if (threadCount) parts.push(`${threadCount} thread${threadCount > 1 ? "s" : ""}`);
  if (entryCount)  parts.push(`${entryCount} entr${entryCount > 1 ? "ies" : "y"}`);
  const label = parts.join(" + ") + " selected";
  const confirm = () => {
    const msg = `Delete ${label}? Sub-threads of any deleted thread move up one level.`;
    if (window.confirm(msg)) onDelete();
  };
  return (
    <div
      style={{
        position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)",
        background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: "10px 14px", display: "flex", alignItems: "center", gap: 14,
        boxShadow: "0 12px 32px rgba(0,0,0,0.45)", zIndex: 300,
        animation: "fadeUp 0.2s ease both",
      }}
    >
      <span style={{ fontSize: 12.5, color: C.text2 }}>{label}</span>
      <button
        onClick={confirm}
        className="gold-btn"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(220,90,90,0.14)", border: "1px solid rgba(220,90,90,0.32)",
          borderRadius: 8, color: "#E08A8A", padding: "6px 12px",
          fontSize: 12, fontWeight: 500, cursor: "pointer",
        }}
      >
        <Trash2 size={12} /> Delete
      </button>
      <button
        onClick={onClear}
        className="ghost"
        style={{
          background: "transparent", border: "none", color: C.text3,
          fontSize: 12, cursor: "pointer", padding: "6px 8px", borderRadius: 6,
        }}
      >
        Clear
      </button>
      <span style={{ fontSize: 10.5, color: C.text3, marginLeft: 2 }}>Esc</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS MODAL
// ─────────────────────────────────────────────────────────────
function SettingsSection({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 10, fontSize: 10.5, color: C.text3, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function SettingsRow({ label, hint, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "10px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 9 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: C.text3, lineHeight: 1.4 }}>{hint}</span>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SegSelect({ value, onChange, options }) {
  return (
    <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.18)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 2 }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "5px 10px",
              fontSize: 11.5, fontWeight: 500,
              background: active ? C.goldDim : "transparent",
              color: active ? C.gold : C.text2,
              border: active ? `1px solid ${C.goldBorder}` : "1px solid transparent",
              borderRadius: 6, cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      style={{
        width: 36, height: 20, borderRadius: 999,
        background: checked ? C.gold : "rgba(255,255,255,0.10)",
        border: `1px solid ${checked ? C.goldBorder : C.border}`,
        position: "relative", cursor: "pointer", padding: 0,
        transition: "background 0.16s, border-color 0.16s",
      }}
    >
      <span style={{
        position: "absolute", top: 1, left: checked ? 17 : 1,
        width: 16, height: 16, borderRadius: "50%",
        background: checked ? "#1A1610" : C.text,
        transition: "left 0.16s",
      }} />
    </button>
  );
}

function ActionButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="ghost"
      style={{
        padding: "6px 12px", fontSize: 12, fontWeight: 500,
        background: "transparent", color: C.text,
        border: `1px solid ${C.border}`, borderRadius: 7,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// Recursively collect a thread and all its descendants, in any order.
function collectSubtreeIds(threads, rootId) {
  const out = new Set([rootId]);
  const walk = (pid) => {
    for (const t of threads) {
      if (t.parentId === pid) {
        out.add(t.id);
        walk(t.id);
      }
    }
  };
  walk(rootId);
  return out;
}

function ExportPickerNode({ thread, threads, depth, selectedIds, onToggle }) {
  const cfg = TYPES[thread.type] || TYPES.capture;
  const Icon = cfg.icon;
  const children = getChildren(threads, thread.id);
  const isChecked = selectedIds.has(thread.id);
  const meta = thread.type === "board"
    ? `${thread.entries.filter(e => e.checked).length}/${thread.entries.length}`
    : `${thread.entries.length}`;

  return (
    <>
      <label
        className="ghost"
        style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "7px 10px", marginLeft: depth * 16,
          cursor: "pointer", borderRadius: 7,
          opacity: isChecked ? 1 : 0.65,
        }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={e => onToggle(thread.id, e.target.checked)}
          style={{ width: 14, height: 14, accentColor: C.gold, cursor: "pointer", flexShrink: 0, margin: 0 }}
        />
        <Icon size={11} color={isChecked ? cfg.color : C.text3} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: isChecked ? C.text : C.text2, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {thread.title}
        </span>
        <span style={{ fontSize: 10.5, color: C.text3, flexShrink: 0 }}>{meta}</span>
      </label>
      {children.map(child => (
        <ExportPickerNode
          key={child.id} thread={child} threads={threads} depth={depth + 1}
          selectedIds={selectedIds} onToggle={onToggle}
        />
      ))}
    </>
  );
}

function ExportPickerModal({ threads, onClose }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(threads.map(t => t.id)));
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const flash = (text, error = false) => {
    setMsg({ text, error });
    setTimeout(() => setMsg(null), 2200);
  };

  // Toggling a thread cascades to all its descendants. We don't auto-uncheck
  // ancestors when a child is unticked — users may want most of a subtree.
  const onToggle = (id, checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const subtree = collectSubtreeIds(threads, id);
      for (const tid of subtree) {
        if (checked) next.add(tid); else next.delete(tid);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(threads.map(t => t.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleCopy = async () => {
    try {
      const md = buildExportMarkdown(threads, { selectedIds });
      await navigator.clipboard.writeText(md);
      flash("Copied");
    } catch (e) {
      console.error("Copy failed:", e);
      flash("Copy failed", true);
    }
  };

  const handleSave = async () => {
    if (!window.loomAPI?.exportMarkdown) return;
    const md = buildExportMarkdown(threads, { selectedIds });
    const res = await window.loomAPI.exportMarkdown(md);
    if (res?.ok) flash("Saved");
    else if (res?.canceled) setMsg(null);
    else flash("Save failed", true);
  };

  const inbox = threads.find(t => t.id === "inbox");
  const roots = threads.filter(t => t.parentId == null && t.id !== "inbox");
  const ordered = inbox ? [inbox, ...roots] : roots;
  const selectedCount = selectedIds.size;
  const total = threads.length;
  const nothingSelected = selectedCount === 0;

  return (
    <div
      onClick={e => { e.stopPropagation(); onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(6,5,4,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 260, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 540, maxWidth: "92vw", maxHeight: "86vh", display: "flex", flexDirection: "column", background: C.surf, border: `1px solid ${C.border}`, borderRadius: 14, animation: "slideIn 0.22s ease both", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div style={{ padding: "22px 24px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontFamily: "'Cormorant', serif", fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em" }}>Export for LLM</div>
            <button onClick={onClose} className="ghost" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text3, padding: 6, borderRadius: 6, display: "flex" }}>
              <X size={15} />
            </button>
          </div>
          <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.5 }}>
            Pick which threads to include. Selecting a thread also picks its sub-threads.
          </div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <ActionButton onClick={selectAll}>Select all</ActionButton>
            <ActionButton onClick={deselectAll}>Deselect all</ActionButton>
            <span style={{ marginLeft: "auto", fontSize: 11, color: C.text3 }}>
              {selectedCount} of {total} selected
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px 14px", minHeight: 120 }}>
          {ordered.length === 0
            ? <div style={{ padding: 24, textAlign: "center", color: C.text3, fontSize: 12 }}>No threads yet.</div>
            : ordered.map(t => (
                <ExportPickerNode
                  key={t.id} thread={t} threads={threads} depth={0}
                  selectedIds={selectedIds} onToggle={onToggle}
                />
              ))
          }
        </div>

        <div style={{ padding: "12px 24px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {msg && <span style={{ fontSize: 11, color: msg.error ? "#E08A8A" : C.gold }}>{msg.text}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={handleCopy}
              disabled={nothingSelected}
              className="ghost"
              style={{
                padding: "6px 12px", fontSize: 12, fontWeight: 500,
                background: "transparent", color: nothingSelected ? C.text3 : C.text,
                border: `1px solid ${C.border}`, borderRadius: 7,
                cursor: nothingSelected ? "not-allowed" : "pointer",
                opacity: nothingSelected ? 0.5 : 1,
              }}
            >
              Copy
            </button>
            <button
              onClick={handleSave}
              disabled={nothingSelected}
              className="gold-btn"
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500,
                background: nothingSelected ? "transparent" : C.goldDim,
                color: nothingSelected ? C.text3 : C.gold,
                border: `1px solid ${nothingSelected ? C.border : C.goldBorder}`,
                borderRadius: 7,
                cursor: nothingSelected ? "not-allowed" : "pointer",
                opacity: nothingSelected ? 0.5 : 1,
              }}
            >
              Save .md…
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ theme, setTheme, prefs, setPrefs, threads, onClose }) {
  const [exportMsg, setExportMsg] = useState(null);
  const [showLlmPicker, setShowLlmPicker] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      // Let the picker swallow Escape when it's open
      if (e.key === "Escape" && !showLlmPicker) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, showLlmPicker]);

  const setPref = (key, value) => setPrefs(p => ({ ...p, [key]: value }));

  const handleExport = async () => {
    if (!window.loomAPI?.exportData) return;
    const res = await window.loomAPI.exportData();
    if (res?.ok) setExportMsg("Saved");
    else if (res?.canceled) setExportMsg(null);
    else setExportMsg("Export failed");
    if (res?.ok) setTimeout(() => setExportMsg(null), 2200);
  };

  const handleReveal = () => {
    if (window.loomAPI?.revealDataFile) window.loomAPI.revealDataFile();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(6,5,4,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 250, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 500, maxWidth: "92vw", maxHeight: "86vh", overflowY: "auto", background: C.surf, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px 18px", animation: "slideIn 0.22s ease both", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Cormorant', serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em" }}>Settings</div>
          <button onClick={onClose} className="ghost" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text3, padding: 6, borderRadius: 6, display: "flex" }}>
            <X size={15} />
          </button>
        </div>

        <SettingsSection label="Appearance">
          <SettingsRow label="Theme" hint="Warm dark cream or warm light paper">
            <SegSelect
              value={theme}
              onChange={setTheme}
              options={[
                { value: "dark",  label: "Dark"  },
                { value: "light", label: "Light" },
              ]}
            />
          </SettingsRow>

          <SettingsRow label="Sidebar density" hint="Comfortable shows entry counts; compact hides them">
            <SegSelect
              value={prefs.density}
              onChange={(v) => setPref("density", v)}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact",     label: "Compact"     },
              ]}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection label="Behavior">
          <SettingsRow label="Startup view" hint="What Loom opens to when you launch it">
            <SegSelect
              value={prefs.startupView}
              onChange={(v) => setPref("startupView", v)}
              options={[
                { value: "home",     label: "Home"     },
                { value: "timeline", label: "Timeline" },
                { value: "inbox",    label: "Inbox"    },
                { value: "last",     label: "Last"     },
              ]}
            />
          </SettingsRow>

          <SettingsRow label="Show completed entries by default" hint="When opening a board, expand the completed section automatically">
            <ToggleSwitch
              checked={prefs.showDoneByDefault}
              onChange={(v) => setPref("showDoneByDefault", v)}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection label="Data">
          <SettingsRow label="Export for LLM" hint="Pick threads and copy or save a markdown digest — paste into ChatGPT/Claude to ask questions about your Loom">
            <ActionButton onClick={() => setShowLlmPicker(true)}>Export…</ActionButton>
          </SettingsRow>

          <SettingsRow label="Export to JSON" hint="Save a backup copy of all your threads and entries">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {exportMsg && <span style={{ fontSize: 11, color: exportMsg === "Saved" ? C.gold : "#E08A8A" }}>{exportMsg}</span>}
              <ActionButton onClick={handleExport}>Export…</ActionButton>
            </div>
          </SettingsRow>

          <SettingsRow label="Data file" hint="Loom stores everything in a single local file">
            <ActionButton onClick={handleReveal}>Reveal in Finder</ActionButton>
          </SettingsRow>
        </SettingsSection>
      </div>

      {showLlmPicker && (
        <ExportPickerModal
          threads={threads}
          onClose={() => setShowLlmPicker(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────
function Sidebar({ threads, filtered, rootThreads, view, go, search, setSearch, setShowNew, inboxCount, collapsed, toggleCollapse, dragState, startThreadDrag, updateDropTarget, handleThreadDrop, openSettings, selectedThreadIds, toggleThreadSelection, clearSelection }) {
  const isDragging    = !!dragState.dragging;
  const isRootTarget  = dragState.target?.position === "root";

  return (
    <div style={{ width: 256, minWidth: 256, background: C.sb, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ padding: "56px 22px 18px", flexShrink: 0, WebkitAppRegion: "drag" }}>
        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 24, fontWeight: 400, letterSpacing: "0.01em", WebkitAppRegion: "no-drag" }}>Loom</div>
        <div style={{ fontSize: 10.5, color: C.text3, marginTop: 2, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, WebkitAppRegion: "no-drag" }}>Your threads</div>
      </div>

      <div style={{ padding: "0 14px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "7px 12px" }}>
          <Search size={12} color={C.text3} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter threads..." style={{ background: "transparent", border: "none", color: C.text, fontSize: 12.5, flex: 1 }} />
        </div>
      </div>

      <div style={{ padding: "2px 10px 0", flexShrink: 0 }}>
        <SbItem icon={Zap}   label="Home"     active={view === "home"}     onClick={() => go("home")} />
        <SbItem icon={Clock} label="Timeline" active={view === "timeline"} onClick={() => go("timeline")} />
        <SbItem icon={Inbox} label="Inbox"    active={view === "inbox"}    onClick={() => go("inbox")} badge={inboxCount} badgeColor="#9E84BF" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px 8px" }}>
        {/* Root-level drop zone — visible when dragging, lets you eject a thread from any parent */}
        <div
          className={`root-drop ${isDragging && isRootTarget ? "active" : ""}`}
          style={{
            fontSize: 9.5, color: isDragging ? (isRootTarget ? C.gold : C.text3) : C.text3,
            letterSpacing: "0.09em", textTransform: "uppercase",
            padding: "10px 10px 6px", fontWeight: 500,
            border: isDragging ? `1px dashed ${isRootTarget ? "rgba(200,165,100,0.4)" : "rgba(255,255,255,0.08)"}` : "1px solid transparent",
            marginBottom: isDragging ? 6 : 0,
          }}
          onDragOver={e => { e.preventDefault(); setDragState && updateDropTarget(e, "root-zone", "root"); }}
          onDrop={handleThreadDrop}
        >
          {isDragging ? "Drop here to make root thread" : "Threads"}
        </div>

        {rootThreads.map(t => (
          <SbThreadTree
            key={t.id} thread={t} allThreads={filtered} view={view} go={go} depth={0}
            collapsed={collapsed} toggleCollapse={toggleCollapse}
            dragState={dragState} startThreadDrag={startThreadDrag}
            updateDropTarget={updateDropTarget} handleThreadDrop={handleThreadDrop}
            selectedThreadIds={selectedThreadIds}
            toggleThreadSelection={toggleThreadSelection}
            clearSelection={clearSelection}
          />
        ))}
      </div>

      <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setShowNew("root")} className="gold-btn" style={{ flex: 1, padding: "10px 12px", background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 9, color: C.gold, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontWeight: 500 }}>
          <Plus size={13} /> New Thread
        </button>
        <button onClick={openSettings} className="ghost" title="Settings" style={{ padding: "9px 10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 9, color: C.text2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}

function SbItem({ icon: Icon, label, active, onClick, badge, badgeColor }) {
  return (
    <div className={`s-item ${active ? "on" : ""}`} onClick={onClick} style={{ padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, marginBottom: 1, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Icon size={12} color={active ? C.gold : C.text3} />
        <span style={{ fontSize: 12.5, color: active ? C.text : C.text2, fontWeight: active ? 500 : 400 }}>{label}</span>
      </div>
      {badge > 0 && <span style={{ fontSize: 10, background: "rgba(158,132,191,0.15)", color: badgeColor || C.gold, padding: "2px 7px", borderRadius: 10, fontWeight: 500 }}>{badge}</span>}
    </div>
  );
}

function SbThreadTree({ thread, allThreads, view, go, depth, collapsed, toggleCollapse, dragState, startThreadDrag, updateDropTarget, handleThreadDrop, selectedThreadIds, toggleThreadSelection, clearSelection }) {
  const cfg      = TYPES[thread.type];
  const Icon     = cfg.icon;
  const on       = view === thread.id;
  const children = getChildren(allThreads, thread.id);
  const hasKids  = children.length > 0;
  const isOpen   = !collapsed.has(thread.id);
  const done     = thread.type === "board" ? thread.entries.filter(e => e.checked).length : null;

  const isDraggingThis = dragState.dragging === thread.id;
  const target         = dragState.target;
  const isDropBefore   = target?.id === thread.id && target.position === "before";
  const isDropAfter    = target?.id === thread.id && target.position === "after";
  const isDropInside   = target?.id === thread.id && target.position === "inside";
  const isSelected     = selectedThreadIds?.has(thread.id);

  const handleRowClick = (e) => {
    e.stopPropagation();
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleThreadSelection(thread.id);
      return;
    }
    clearSelection?.();
    go(thread.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientY - rect.top) / rect.height;
    const position = pct < 0.28 ? "before" : pct > 0.72 ? "after" : "inside";
    updateDropTarget(e, thread.id, position);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Drop-before indicator */}
      {isDropBefore && (
        <div style={{ position: "absolute", top: 0, left: depth * 14, right: 0, height: 2, background: C.gold, borderRadius: 1, zIndex: 20, pointerEvents: "none" }} />
      )}

      <div
        draggable
        onDragStart={e => { e.stopPropagation(); startThreadDrag(thread.id); }}
        onDragOver={handleDragOver}
        onDrop={e => { e.stopPropagation(); handleThreadDrop(); }}
        onDragEnd={() => { /* cleared by handleThreadDrop or onDrop */ }}
        className={`s-item ${on ? "on" : ""} ${isDropInside ? "drop-inside" : ""} ${isDraggingThis ? "thread-dragging" : ""} ${isSelected ? "selected" : ""}`}
        style={{
          padding: "8px 10px", cursor: "grab", display: "flex", alignItems: "flex-start",
          gap: 0, marginBottom: 1, marginLeft: depth * 14, position: "relative",
          userSelect: "none",
          ...(isSelected ? { background: "rgba(200,165,100,0.14)", outline: `1px solid ${C.goldBorder}` } : null),
        }}
      >
        {depth > 0 && (
          <div style={{ position: "absolute", left: -10, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        )}

        {hasKids ? (
          <button
            className="collapse-btn"
            onClick={e => { e.stopPropagation(); toggleCollapse(thread.id); }}
            aria-label={isOpen ? "Collapse" : "Expand"}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              width: 22, height: 22, marginLeft: -4, marginRight: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 5, flexShrink: 0,
            }}
          >
            {isOpen ? <ChevronDown size={11} color={C.text3} /> : <ChevronRight size={11} color={C.text3} />}
          </button>
        ) : (
          <div style={{ width: 20, flexShrink: 0 }} />
        )}

        <div onClick={handleRowClick} style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
          <Icon size={11} color={on ? cfg.color : (isDropInside ? C.gold : C.text3)} style={{ marginTop: 3, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-title-row" style={{ fontSize: 12.5, color: on ? C.text : (isDropInside ? C.gold : C.text2), fontWeight: on ? 500 : 400, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thread.title}</div>
            <div className="sb-meta-row" style={{ fontSize: 10, color: isDropInside ? "rgba(200,165,100,0.6)" : C.text3, marginTop: 1 }}>
              {isDropInside
                ? "Move inside this thread"
                : done !== null
                  ? `${done}/${thread.entries.length} done`
                  : `${thread.entries.length} entries`}
              {!isDropInside && hasKids && ` · ${children.length} sub`}
            </div>
          </div>
        </div>
      </div>

      {/* Drop-after indicator */}
      {isDropAfter && (
        <div style={{ position: "absolute", bottom: 0, left: depth * 14, right: 0, height: 2, background: C.gold, borderRadius: 1, zIndex: 20, pointerEvents: "none" }} />
      )}

      {hasKids && isOpen && (
        <div style={{ borderLeft: `1px solid rgba(255,255,255,0.05)`, marginLeft: depth * 14 + 18 }}>
          {children.map(child => (
            <SbThreadTree
              key={child.id} thread={child} allThreads={allThreads} view={view} go={go} depth={depth + 1}
              collapsed={collapsed} toggleCollapse={toggleCollapse}
              dragState={dragState} startThreadDrag={startThreadDrag}
              updateDropTarget={updateDropTarget} handleThreadDrop={handleThreadDrop}
              selectedThreadIds={selectedThreadIds}
              toggleThreadSelection={toggleThreadSelection}
              clearSelection={clearSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME VIEW
// ─────────────────────────────────────────────────────────────
function HomeView({ threads, rootThreads, go, setShowNew, addEntry }) {
  const [capture, setCapture] = useState("");
  const hrs     = new Date().getHours();
  const greet   = hrs < 12 ? "Good morning" : hrs < 17 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const doCapture = () => {
    if (!capture.trim()) return;
    addEntry("inbox", capture, "entry");
    setCapture("");
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "52px 64px 64px" }}>
      <div style={{ animation: "fadeUp 0.45s ease both", marginBottom: 44 }}>
        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 46, fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.015em" }}>{greet}.</div>
        <div style={{ fontSize: 12.5, color: C.text3, marginTop: 8 }}>{dateStr}</div>
      </div>

      <SmartSurface threads={rootThreads} go={go} />

      <div style={{ animation: "fadeUp 0.45s 0.08s ease both", marginBottom: 56 }}>
        <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 26px" }}>
          <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>Quick Capture</div>
          <textarea value={capture} onChange={e => setCapture(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doCapture(); } }}
            placeholder="Capture a thought -- goes straight to Inbox for triage later..."
            rows={3} style={{ width: "100%", background: "transparent", border: "none", color: C.text, fontSize: 15, lineHeight: 1.75, resize: "none", fontWeight: 300 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 12, color: C.text3 }}>Enter to capture · Shift+Enter for new line</span>
            <button onClick={doCapture} className="gold-btn" style={{ background: capture.trim() ? C.gold : C.goldDim, border: "none", borderRadius: 8, color: capture.trim() ? "#0B0A08" : C.text3, fontSize: 12.5, padding: "8px 18px", cursor: capture.trim() ? "pointer" : "default", fontWeight: 500 }}>Capture</button>
          </div>
        </div>
      </div>

      <div style={{ animation: "fadeUp 0.45s 0.16s ease both" }}>
        <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20, fontWeight: 500 }}>All Threads</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))", gap: 14 }}>
          {rootThreads.map((t, i) => <ThreadCard key={t.id} thread={t} threads={threads} go={go} i={i} />)}
          <div className="add-new t-card" onClick={() => setShowNew("root")} style={{ border: "1.5px dashed rgba(255,255,255,0.09)", borderRadius: 16, padding: "26px 24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 130, color: C.text3, transition: "all 0.2s" }}>
            <Plus size={18} strokeWidth={1.5} />
            <span style={{ fontSize: 12.5 }}>New Thread</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmartSurface({ threads, go }) {
  const items = [];
  threads.filter(t => t.type === "board").forEach(t => {
    const pending = t.entries.filter(e => !e.checked);
    if (pending.length > 0) {
      const pinned = pending.filter(e => e.pinned);
      items.push({ kind: "action", thread: t, pending: pending.length, topTask: (pinned[0] || pending[0]).text });
    }
  });
  threads.filter(t => t.type === "question").forEach(t => {
    if (t.entries.length > 0) items.push({ kind: "reflection", thread: t, last: t.entries[t.entries.length - 1].text });
  });
  if (items.length === 0) return null;
  return (
    <div style={{ animation: "fadeUp 0.45s 0.04s ease both", marginBottom: 48 }}>
      <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>Needs Attention</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} className="attn-card" onClick={() => go(item.thread.id)} style={{ display: "flex", alignItems: "center", gap: 14, background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: TYPES[item.kind === "action" ? "board" : "question"].bg, border: `1px solid ${TYPES[item.kind === "action" ? "board" : "question"].border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {item.kind === "action" ? <AlertCircle size={15} color={TYPES.board.color} /> : <BookOpen size={15} color={TYPES.question.color} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: item.kind === "action" ? TYPES.board.color : TYPES.question.color, fontWeight: 500, marginBottom: 3 }}>
                {item.kind === "action" ? `${item.pending} task${item.pending > 1 ? "s" : ""} pending in ${item.thread.title}` : `Open reflection: ${item.thread.title}`}
              </div>
              <div style={{ fontSize: 12.5, color: C.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.kind === "action" ? item.topTask : item.last}</div>
            </div>
            <ChevronRight size={14} color={C.text3} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreadCard({ thread, threads, go, i }) {
  const cfg      = TYPES[thread.type];
  const Icon     = cfg.icon;
  const last     = thread.entries[thread.entries.length - 1];
  const done     = thread.type === "board" ? thread.entries.filter(e => e.checked).length : null;
  const total    = thread.entries.length;
  const children = getChildren(threads, thread.id);
  return (
    <div className="t-card" onClick={() => go(thread.id)} style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 24px", cursor: "pointer", animation: `fadeUp 0.24s ${Math.min(i, 5) * 0.02}s ease both` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "4px 10px" }}>
          <Icon size={10} color={cfg.color} />
          <span style={{ fontSize: 10, color: cfg.color, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{cfg.label}</span>
        </div>
        <span style={{ fontSize: 10.5, color: C.text3 }}>{done !== null ? `${done}/${total} done` : `${total} entries`}</span>
      </div>
      <div style={{ fontFamily: "'Cormorant', serif", fontSize: 17.5, lineHeight: 1.38, marginBottom: children.length > 0 ? 12 : 16 }}>{thread.title}</div>
      {children.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {children.slice(0, 3).map(c => {
            const cc = TYPES[c.type];
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 5, background: cc.bg, border: `1px solid ${cc.border}`, borderRadius: 5, padding: "3px 8px" }}>
                <FolderOpen size={9} color={cc.color} />
                <span style={{ fontSize: 10, color: cc.color, fontWeight: 500 }}>{c.title.length > 20 ? c.title.slice(0, 20) + "..." : c.title}</span>
              </div>
            );
          })}
          {children.length > 3 && <span style={{ fontSize: 10, color: C.text3, padding: "3px 6px" }}>+{children.length - 3} more</span>}
        </div>
      )}
      {last && <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{last.text}</div>}
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        {done !== null && total > 0 && (
          <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: cfg.color, opacity: 0.7 }} />
          </div>
        )}
        {done === null && <div style={{ flex: 1 }} />}
        <span style={{ fontSize: 10, color: C.text3 }}>{thread.updatedAt}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TIMELINE VIEW
// ─────────────────────────────────────────────────────────────
function TimelineView({ threads, go }) {
  const allEntries = [];
  threads.filter(t => t.id !== "inbox").forEach(t => {
    t.entries.forEach(e => allEntries.push({ ...e, threadId: t.id, threadTitle: t.title, threadType: t.type }));
  });
  allEntries.sort((a, b) => entryDayDiff(a) - entryDayDiff(b));
  const groups = {};
  allEntries.forEach(e => {
    const key = displayEntryDate(e) || "Undated";
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "52px 64px 64px" }}>
      <div style={{ animation: "fadeUp 0.4s ease both", marginBottom: 44 }}>
        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 36, fontWeight: 300, letterSpacing: "-0.01em" }}>Timeline</div>
        <div style={{ fontSize: 12.5, color: C.text3, marginTop: 6 }}>Every entry, across all threads, in order.</div>
      </div>
      <div style={{ animation: "fadeUp 0.4s 0.08s ease both" }}>
        {Object.entries(groups).map(([day, entries]) => (
          <div key={day} style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>{day}</div>
            {entries.map((e, i) => {
              const cfg = TYPES[e.threadType];
              const Icon = cfg.icon;
              return (
                <div key={e.id} className="e-row" onClick={() => go(e.threadId)} style={{ display: "flex", gap: 14, padding: "13px 8px", alignItems: "flex-start", cursor: "pointer", animation: `fadeUp 0.2s ${Math.min(i, 6) * 0.012}s ease both` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Icon size={11} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, color: cfg.color, fontWeight: 500, marginBottom: 4 }}>{e.threadTitle}</div>
                    <div style={{ fontSize: 13.5, color: e.subtype === "note" ? C.text3 : C.entryText, lineHeight: 1.65, fontStyle: e.subtype === "note" ? "italic" : "normal", fontWeight: 300 }}>{e.text}</div>
                  </div>
                  <ChevronRight size={12} color={C.text3} style={{ marginTop: 6, flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// THREAD VIEW
// ─────────────────────────────────────────────────────────────
function ThreadView({ thread, threads, go, setShowNew, addEntry, updateEntry, toggleCheck, pinEntry, setDueDate, setEntryDate, deleteEntry, moveEntry, reorderEntries, renameThread, deleteThread, selectedEntryIds, toggleEntrySelection, showDoneDefault = false }) {
  const cfg      = TYPES[thread.type];
  const Icon     = cfg.icon;
  const isBoard  = thread.type === "board";
  const isInbox  = thread.id === "inbox";
  const taRef    = useRef(null);
  const [entryText, setEntryText]       = useState("");
  const [editingId, setEditingId]       = useState(null);
  const [replyingTo, setReplyingTo]     = useState(null);
  const [entrySubtype, setEntrySubtype] = useState("entry");
  const [showDone, setShowDone]         = useState(showDoneDefault);
  const [dragId, setDragId]             = useState(null);
  const [dropId, setDropId]             = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(thread.title);

  useEffect(() => { setTitleDraft(thread.title); setEditingTitle(false); }, [thread.id, thread.title]);

  const commitTitle = () => {
    const next = titleDraft.trim();
    if (next && next !== thread.title) renameThread(thread.id, next);
    else setTitleDraft(thread.title);
    setEditingTitle(false);
  };

  const handleDeleteThread = () => {
    if (thread.id === "inbox") return;
    const kidCount = getChildren(threads, thread.id).length;
    const msg = kidCount > 0
      ? `Delete "${thread.title}"? Its ${kidCount} sub-thread${kidCount > 1 ? "s" : ""} will move up one level.`
      : `Delete "${thread.title}"? This can't be undone.`;
    if (window.confirm(msg)) deleteThread(thread.id);
  };

  const done      = isBoard ? thread.entries.filter(e => e.checked).length : null;
  const total     = thread.entries.length;
  const children  = getChildren(threads, thread.id);
  const ancestors = buildAncestors(threads, thread.id);
  const otherThreads = threads.filter(t => t.id !== "inbox" && t.id !== thread.id);

  // Build children-of map for reply tree
  const childrenOf = {};
  thread.entries.forEach(e => {
    if (e.parentEntryId) {
      if (!childrenOf[e.parentEntryId]) childrenOf[e.parentEntryId] = [];
      childrenOf[e.parentEntryId].push(e);
    }
  });

  const handleAdd = () => {
    if (!entryText.trim()) return;
    addEntry(thread.id, entryText, entrySubtype, replyingTo?.id || null);
    setEntryText(""); setReplyingTo(null);
    taRef.current?.focus();
  };

  const handleDrop = (targetId) => {
    if (!dragId || !targetId || dragId === targetId) { setDragId(null); setDropId(null); return; }
    const entries = [...thread.entries];
    const from = entries.findIndex(e => e.id === dragId);
    const to   = entries.findIndex(e => e.id === targetId);
    const [moved] = entries.splice(from, 1);
    entries.splice(to, 0, moved);
    reorderEntries(thread.id, entries);
    setDragId(null); setDropId(null);
  };

  const placeholder = isInbox ? "Add to inbox..." : {
    question: replyingTo ? "Write your response..." : "Add a reflection or new angle...",
    progress: "Log a new entry -- what happened, what you noticed...",
    board:    "Add a new task...",
    capture:  "Capture a note or idea...",
  }[thread.type];

  let activeEntries = thread.entries.filter(e => !e.parentEntryId);
  let doneEntries   = [];
  if (isBoard) {
    const pinned   = activeEntries.filter(e => e.pinned && !e.checked);
    const unpinned = activeEntries.filter(e => !e.pinned && !e.checked);
    activeEntries  = [...pinned, ...unpinned];
    doneEntries    = thread.entries.filter(e => e.checked && !e.parentEntryId);
  }

  const sharedEntryProps = {
    type: thread.type, cfg, threadId: thread.id,
    toggleCheck, pinEntry, setDueDate, setEntryDate, deleteEntry, updateEntry,
    editingId, setEditingId,
    onReply: (entry) => { setReplyingTo(entry); setTimeout(() => taRef.current?.focus(), 0); },
    isBoard, isInbox, otherThreads, moveEntry,
    childrenOf,
    selectedEntryIds, toggleEntrySelection,
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", animation: "fadeUp 0.38s ease both" }}>
      {/* Header */}
      <div style={{ padding: "28px 64px 24px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          <span className="crumb" onClick={() => go("home")} style={{ fontSize: 12, color: C.text3 }}>Home</span>
          {ancestors.map((anc, i) => (
            <span key={anc.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ChevronRight size={10} color={C.text3} />
              {i < ancestors.length - 1
                ? <span className="crumb" onClick={() => go(anc.id)} style={{ fontSize: 12, color: C.text3 }}>{anc.title.length > 28 ? anc.title.slice(0, 28) + "..." : anc.title}</span>
                : <span style={{ fontSize: 12, color: C.text2, fontWeight: 500 }}>{anc.title.length > 28 ? anc.title.slice(0, 28) + "..." : anc.title}</span>
              }
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 11, padding: 11, marginTop: 3, flexShrink: 0 }}>
            <Icon size={18} color={cfg.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {editingTitle && !isInbox ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); commitTitle(); }
                    if (e.key === "Escape") { setTitleDraft(thread.title); setEditingTitle(false); }
                  }}
                  style={{
                    flex: 1, fontFamily: "'Cormorant', serif", fontSize: 30, fontWeight: 400,
                    lineHeight: 1.2, letterSpacing: "-0.01em",
                    background: "transparent", color: C.text,
                    border: "none", borderBottom: `1px solid ${C.goldBorder}`,
                    padding: "0 0 2px",
                  }}
                />
              ) : (
                <h1
                  onClick={() => !isInbox && setEditingTitle(true)}
                  title={!isInbox ? "Click to rename" : undefined}
                  style={{
                    flex: 1, fontFamily: "'Cormorant', serif", fontSize: 30, fontWeight: 400,
                    lineHeight: 1.2, letterSpacing: "-0.01em",
                    cursor: isInbox ? "default" : "text",
                  }}
                >{thread.title}</h1>
              )}
              {!isInbox && !editingTitle && (
                <button
                  onClick={handleDeleteThread}
                  title="Delete thread"
                  className="ghost"
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: C.text3, padding: 6, borderRadius: 6, display: "flex",
                    alignItems: "center", flexShrink: 0,
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: cfg.color, background: cfg.bg, padding: "3px 9px", borderRadius: 5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{isInbox ? "Inbox" : cfg.label}</span>
              <span style={{ fontSize: 11.5, color: C.text3 }}>{done !== null ? `${done} of ${total} done` : `${total} entries`}</span>
              {children.length > 0 && <span style={{ fontSize: 11.5, color: C.text3 }}>{children.length} sub-thread{children.length > 1 ? "s" : ""}</span>}
              {done !== null && total > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 60, height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: cfg.color, opacity: 0.75 }} />
                  </div>
                  <span style={{ fontSize: 10.5, color: C.text3 }}>{Math.round((done / total) * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 64px" }}>
        {(children.length > 0 || !isInbox) && (
          <SubThreadSection children={children} parentThread={thread} go={go} setShowNew={setShowNew} />
        )}
        {thread.entries.length === 0 && children.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: C.text3, fontSize: 14 }}>
            {isInbox ? "Your inbox is clear." : "No entries yet. Add the first one below."}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          {activeEntries.map((e, i) => (
            <EntryTreeNode
              key={e.id} entry={e} i={i} depth={0}
              draggable={isBoard} dragId={dragId} dropId={dropId}
              onDragStart={() => setDragId(e.id)}
              onDragOver={(ev) => { ev.preventDefault(); setDropId(e.id); }}
              onDrop={() => handleDrop(e.id)}
              onDragEnd={() => { setDragId(null); setDropId(null); }}
              {...sharedEntryProps}
            />
          ))}
        </div>

        {isBoard && doneEntries.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <button onClick={() => setShowDone(d => !d)} className="ghost" style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "none", color: C.text3, fontSize: 12, cursor: "pointer", padding: "6px 8px", borderRadius: 7, marginBottom: 8 }}>
              {showDone ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              {doneEntries.length} completed
            </button>
            {showDone && (
              <div style={{ opacity: 0.6 }}>
                {doneEntries.map((e, i) => (
                  <EntryTreeNode key={e.id} entry={e} i={i} depth={0} draggable={false} dragId={null} dropId={null} onDragStart={() => {}} onDragOver={() => {}} onDrop={() => {}} onDragEnd={() => {}} {...sharedEntryProps} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "20px 64px 32px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        {replyingTo && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 12px", background: `${cfg.color}0D`, border: `1px solid ${cfg.color}20`, borderRadius: 8 }}>
            <CornerDownRight size={12} color={cfg.color} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: C.text2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ color: cfg.color, fontWeight: 500 }}>Replying to: </span>{replyingTo.text}
            </div>
            <button onClick={() => setReplyingTo(null)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 2 }}><X size={11} color={C.text3} /></button>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button className="subtype-toggle" onClick={() => setEntrySubtype("entry")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, border: `1px solid ${entrySubtype === "entry" ? cfg.color + "50" : C.border}`, background: entrySubtype === "entry" ? cfg.bg : "transparent", cursor: "pointer", color: entrySubtype === "entry" ? cfg.color : C.text3, fontSize: 11, fontWeight: 500 }}>
            <List size={10} /> Entry
          </button>
          <button className="subtype-toggle" onClick={() => setEntrySubtype("note")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, border: `1px solid ${entrySubtype === "note" ? "rgba(255,255,255,0.2)" : C.border}`, background: entrySubtype === "note" ? "rgba(255,255,255,0.05)" : "transparent", cursor: "pointer", color: entrySubtype === "note" ? C.text2 : C.text3, fontSize: 11, fontWeight: 500 }}>
            <AlignLeft size={10} /> Note
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
          <textarea ref={taRef} value={entryText} onChange={e => setEntryText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
            placeholder={placeholder} rows={2}
            style={{ flex: 1, background: C.surf, border: `1px solid ${replyingTo ? cfg.color + "30" : C.border}`, borderRadius: 12, color: C.text, fontSize: 14, padding: "14px 18px", resize: "none", lineHeight: 1.65, fontWeight: 300, fontStyle: entrySubtype === "note" ? "italic" : "normal", transition: "border-color 0.2s" }}
          />
          <button onClick={handleAdd} className="gold-btn" style={{ background: entryText.trim() ? C.gold : C.goldDim, border: "none", borderRadius: 12, color: entryText.trim() ? "#0B0A08" : C.text3, padding: "0 26px", cursor: entryText.trim() ? "pointer" : "default", fontWeight: 500, fontSize: 13.5, flexShrink: 0 }}>
            {replyingTo ? "Reply" : "Add"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 8, paddingLeft: 2 }}>Enter to add · Shift+Enter for new line</div>
      </div>
    </div>
  );
}

// ─── SUB-THREADS SECTION ───
function SubThreadSection({ children, parentThread, go, setShowNew }) {
  if (children.length === 0) {
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
          <button onClick={() => setShowNew(parentThread.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px dashed rgba(255,255,255,0.1)`, borderRadius: 8, color: C.text3, fontSize: 12, padding: "7px 14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
            <Plus size={11} /> Add sub-thread
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500 }}>Sub-threads</div>
        <button onClick={() => setShowNew(parentThread.id)} className="ghost" style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: C.text3, fontSize: 11.5, padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          <Plus size={11} /> New
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {children.map((child, i) => {
          const cfg  = TYPES[child.type];
          const Icon = cfg.icon;
          const done = child.type === "board" ? child.entries.filter(e => e.checked).length : null;
          return (
            <div key={child.id} className="sub-card" onClick={() => go(child.id)} style={{ background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", animation: `fadeUp 0.22s ${Math.min(i, 5) * 0.02}s ease both` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={11} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{child.title}</div>
                </div>
                <ChevronRight size={12} color={C.text3} flexShrink={0} />
              </div>
              <div style={{ fontSize: 11, color: C.text3 }}>
                {done !== null ? `${done}/${child.entries.length} done` : `${child.entries.length} entries`}
              </div>
              {done !== null && child.entries.length > 0 && (
                <div style={{ marginTop: 8, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(done / child.entries.length) * 100}%`, background: cfg.color, opacity: 0.7 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ENTRY TREE NODE (recursive) ───
function EntryTreeNode({ entry, depth, i, childrenOf, draggable: isDraggable, dragId, dropId, onDragStart, onDragOver, onDrop, onDragEnd, ...rowProps }) {
  const replies = childrenOf[entry.id] || [];
  const lineColor = rowProps.cfg.color;
  return (
    <div>
      <EntryRow
        entry={entry} depth={depth} i={i}
        draggable={isDraggable && depth === 0} dragId={dragId} dropId={dropId}
        onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
        {...rowProps}
      />
      {replies.length > 0 && (
        <div style={{ marginLeft: 28, paddingLeft: 16, borderLeft: `1.5px solid ${lineColor}22`, marginBottom: 2 }}>
          {replies.map((r, ri) => (
            <EntryTreeNode
              key={r.id} entry={r} depth={depth + 1} i={ri}
              childrenOf={childrenOf}
              draggable={false} dragId={null} dropId={null}
              onDragStart={() => {}} onDragOver={() => {}} onDrop={() => {}} onDragEnd={() => {}}
              {...rowProps}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ENTRY ROW ───
function EntryRow({ entry, type, cfg, threadId, toggleCheck, pinEntry, setDueDate, setEntryDate, deleteEntry, updateEntry, editingId, setEditingId, onReply, isBoard, isInbox, otherThreads, moveEntry, draggable: isDraggable, dragId, dropId, onDragStart, onDragOver, onDrop, onDragEnd, i, selectedEntryIds, toggleEntrySelection }) {
  const [editText, setEditText] = useState(entry.text);
  const editRef  = useRef(null);
  const dateInputRef = useRef(null);
  const entryDateInputRef = useRef(null);
  const isEditing  = editingId === entry.id;
  const isDragOver = dropId === entry.id && dragId !== entry.id;
  const isNote     = entry.subtype === "note";
  const isSelected = selectedEntryIds?.has(entry.id);
  const dueDiff    = dueDayDiff(entry.dueDate);
  const dueColor   = entry.checked
    ? C.text3
    : dueDiff !== null && dueDiff < 0 ? "#D67878"
    : dueDiff === 0 ? C.gold
    : C.text2;

  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try { el.showPicker(); return; } catch {}
    }
    el.focus();
    el.click();
  };

  const openEntryDatePicker = (e) => {
    e?.stopPropagation();
    const el = entryDateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try { el.showPicker(); return; } catch {}
    }
    el.focus();
    el.click();
  };

  const entryDateValue = entry.dateISO || isoFromTs(entry.ts) || "";

  const isInteractiveTarget = (target) =>
    !!target?.closest?.("button, textarea, input, select, a");

  const handleRowMouseDown = (e) => {
    if ((e.shiftKey || e.metaKey || e.ctrlKey) && !isInteractiveTarget(e.target) && !isEditing) {
      e.preventDefault(); // suppress text selection
    }
  };

  const handleRowClick = (e) => {
    if (!(e.shiftKey || e.metaKey || e.ctrlKey)) return;
    if (isInteractiveTarget(e.target) || isEditing) return;
    e.stopPropagation();
    toggleEntrySelection?.(entry.id);
  };

  useEffect(() => { if (isEditing) editRef.current?.focus(); }, [isEditing]);

  const saveEdit   = () => { updateEntry(threadId, entry.id, editText); setEditingId(null); };
  const cancelEdit = () => { setEditText(entry.text); setEditingId(null); };

  const beginEdit = (e) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) return;
    if (isEditing) return;
    e.stopPropagation();
    setEditText(entry.text);
    setEditingId(entry.id);
  };

  return (
    <div className={`e-row ${isDragOver ? "drag-over" : ""} ${isSelected ? "selected" : ""}`}
      draggable={isDraggable && !isEditing}
      onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
      onMouseDown={handleRowMouseDown}
      onClick={handleRowClick}
      style={{
        display: "flex", gap: 12, padding: "14px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        alignItems: "flex-start", position: "relative",
        animation: `fadeUp 0.18s ${Math.min(i, 6) * 0.012}s ease both`,
        ...(isSelected ? { background: "rgba(200,165,100,0.10)", outline: `1px solid ${C.goldBorder}`, borderRadius: 8 } : null),
      }}
    >
      {isDraggable && !isEditing && (
        <div style={{ color: C.text3, opacity: 0.3, cursor: "grab", flexShrink: 0, marginTop: 3 }}>
          <GripVertical size={13} />
        </div>
      )}
      {isBoard ? (
        <button className="chk" onClick={() => toggleCheck(threadId, entry.id)} style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${entry.checked ? cfg.color : C.chkBorder}`, background: entry.checked ? cfg.bg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 3, transition: "all 0.14s" }}>
          {entry.checked && <Check size={9} color={cfg.color} strokeWidth={2.5} />}
        </button>
      ) : (
        <div style={{ width: isNote ? 0 : 5, height: isNote ? 0 : 5, borderRadius: "50%", background: cfg.color, opacity: 0.55, flexShrink: 0, marginTop: isNote ? 0 : 9 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <div>
            <textarea ref={editRef} value={editText} onChange={e => setEditText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === "Escape") cancelEdit(); }}
              style={{ width: "100%", background: C.surf2, border: `1px solid ${cfg.color}44`, borderRadius: 8, color: C.text, fontSize: 13.5, padding: "10px 12px", resize: "none", lineHeight: 1.65, fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}
              rows={3}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={saveEdit} style={{ fontSize: 11.5, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Save</button>
              <button onClick={cancelEdit} style={{ fontSize: 11.5, color: C.text3, background: "transparent", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div onClick={beginEdit} title="Click to edit" style={{ fontSize: 13.5, color: entry.checked ? C.text3 : (isNote ? C.text2 : C.entryText), lineHeight: 1.72, textDecoration: entry.checked ? "line-through" : "none", fontWeight: 300, fontStyle: isNote ? "italic" : "normal", cursor: "text" }}>{entry.text}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <span
                  onClick={openEntryDatePicker}
                  title="Click to change date"
                  style={{ fontSize: 10.5, color: C.text3, cursor: "pointer", padding: "1px 2px", borderRadius: 3 }}
                >{displayEntryDate(entry)}</span>
                <input
                  ref={entryDateInputRef}
                  type="date"
                  value={entryDateValue}
                  onChange={(e) => e.target.value && setEntryDate(threadId, entry.id, e.target.value)}
                  style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 0, opacity: 0, pointerEvents: "none" }}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </span>
              {isNote && <span style={{ fontSize: 10, color: C.text3, background: "rgba(255,255,255,0.04)", padding: "1px 7px", borderRadius: 4 }}>note</span>}
              {entry.pinned && <span style={{ fontSize: 10, color: C.gold, display: "flex", alignItems: "center", gap: 3 }}><Pin size={9} /> pinned</span>}
              {entry.dueDate && (
                <span
                  onClick={openDatePicker}
                  title="Click to change due date"
                  style={{ fontSize: 10, color: dueColor, display: "inline-flex", alignItems: "center", gap: 4, background: `${dueColor}14`, border: `1px solid ${dueColor}33`, padding: "1px 6px 1px 7px", borderRadius: 10, cursor: "pointer" }}
                >
                  <Calendar size={9} /> {formatDue(entry.dueDate)}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDueDate(threadId, entry.id, null); }}
                    title="Clear due date"
                    style={{ background: "transparent", border: "none", padding: 0, marginLeft: 2, color: dueColor, cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <X size={9} />
                  </button>
                </span>
              )}
            </div>
          </>
        )}
        {isInbox && !isEditing && (
          <div style={{ marginTop: 10 }}>
            <select className="move-select" onChange={e => { if (e.target.value) { moveEntry(threadId, entry.id, e.target.value); e.target.value = ""; } }}
              style={{ background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text2, fontSize: 11.5, padding: "5px 10px", cursor: "pointer" }}>
              <option value="">Move to thread...</option>
              {otherThreads.map(t => <option key={t.id} value={t.id}>{t.title.length > 40 ? t.title.slice(0, 40) + "..." : t.title}</option>)}
            </select>
          </div>
        )}
      </div>
      {!isEditing && (
        <div className="row-actions" style={{ display: "flex", alignItems: "center", gap: 2, opacity: 0, flexShrink: 0, marginTop: 1 }}>
          {onReply && (
            <button className="ghost" onClick={() => onReply(entry)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}>
              <CornerDownRight size={12} color={C.text3} />
            </button>
          )}
          {isBoard && (
            <button className="ghost" onClick={() => pinEntry(threadId, entry.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}>
              <Pin size={12} color={entry.pinned ? C.gold : C.text3} />
            </button>
          )}
          {isBoard && (
            <span style={{ position: "relative", display: "inline-flex" }}>
              <button
                className="ghost"
                onClick={openDatePicker}
                title={entry.dueDate ? `Due ${formatDue(entry.dueDate)}` : "Set due date"}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}
              >
                <Calendar size={12} color={entry.dueDate ? (dueDiff !== null && dueDiff < 0 && !entry.checked ? "#D67878" : C.gold) : C.text3} />
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={entry.dueDate || ""}
                onChange={(e) => setDueDate(threadId, entry.id, e.target.value || null)}
                style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", width: "100%", height: "100%" }}
                tabIndex={-1}
                aria-hidden="true"
              />
            </span>
          )}
          <button className="ghost" onClick={() => deleteEntry(threadId, entry.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}>
            <X size={12} color={C.text3} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NEW THREAD MODAL
// ─────────────────────────────────────────────────────────────
function NewModal({ title, setTitle, type, setType, parentId, parentThread, onCreate, onClose }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const parentCfg = parentThread ? TYPES[parentThread.type] : null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,5,4,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#161410", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "36px", width: 440, animation: "slideIn 0.22s ease both", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: parentThread ? 16 : 30 }}>
          <div style={{ fontFamily: "'Cormorant', serif", fontSize: 24, fontWeight: 400 }}>{parentThread ? "New Sub-thread" : "New Thread"}</div>
          <button className="ghost" onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 7, display: "flex" }}>
            <X size={15} color={C.text2} />
          </button>
        </div>
        {parentThread && parentCfg && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "8px 12px", background: parentCfg.bg, border: `1px solid ${parentCfg.border}`, borderRadius: 8 }}>
            <ChevronRight size={11} color={parentCfg.color} />
            <span style={{ fontSize: 12, color: parentCfg.color, fontWeight: 500 }}>Inside: {parentThread.title.length > 36 ? parentThread.title.slice(0, 36) + "..." : parentThread.title}</span>
          </div>
        )}
        <input ref={ref} value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && onCreate()}
          placeholder="Give this thread a title..."
          style={{ width: "100%", background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14.5, padding: "13px 16px", marginBottom: 24, fontWeight: 300 }} />
        <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>Thread Type</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 30 }}>
          {Object.entries(TYPES).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const on   = type === key;
            return (
              <div key={key} className="type-pick" onClick={() => setType(key)} style={{ display: "flex", flexDirection: "column", gap: 7, padding: "14px 15px", borderRadius: 11, border: `1px solid ${on ? cfg.color + "50" : C.border}`, background: on ? cfg.bg : "transparent", cursor: "pointer", transition: "all 0.16s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={13} color={on ? cfg.color : C.text3} />
                  <span style={{ fontSize: 13, color: on ? cfg.color : C.text2, fontWeight: on ? 500 : 400 }}>{cfg.label}</span>
                </div>
                <div style={{ fontSize: 11, color: on ? cfg.color + "AA" : C.text3, lineHeight: 1.4 }}>{cfg.desc}</div>
              </div>
            );
          })}
        </div>
        <button onClick={onCreate} className="gold-btn" style={{ width: "100%", background: C.gold, border: "none", borderRadius: 11, color: "#0B0A08", fontSize: 14, padding: "14px", fontWeight: 600, cursor: "pointer" }}>
          {parentThread ? "Create Sub-thread" : "Create Thread"}
        </button>
      </div>
    </div>
  );
}
