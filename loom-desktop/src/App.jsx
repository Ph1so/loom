import { useState, useRef, useEffect } from "react";
import {
  Plus, Search, Check, ArrowLeft, X, MessageCircle, TrendingUp,
  LayoutGrid, Feather, Zap, Clock, Pin, CornerDownRight, ChevronDown,
  ChevronRight, Inbox, GripVertical, AlignLeft, List,
  AlertCircle, BookOpen, FolderOpen, Folder, Trash2, Settings, Sun, Moon,
  Calendar, FolderInput, ArrowUp, ArrowDown, ClipboardList, FileText, Sparkles
} from "lucide-react";
import { buildExportMarkdown } from "./export.js";
import { PALETTES } from "./palette.js";

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
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes popIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
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

// `C` is read by every component during render. We reassign it at the top of
// the `Loom` render based on the active theme, so subsequent child renders see
// the right palette. Safe because React renders happen synchronously top-down.
let C = PALETTES.dark;

// ─────────────────────────────────────────────────────────────
// Themed confirm dialog (replaces the native window.confirm so the
// prompt matches Loom's aesthetic and honors light/dark mode). A single
// <ConfirmHost/> mounted in Loom listens for imperative loomConfirm()
// calls and resolves a promise with the user's choice.
// ─────────────────────────────────────────────────────────────
let confirmSetter = null;
function loomConfirm(opts) {
  const cfg = typeof opts === "string" ? { message: opts } : opts;
  return new Promise(resolve => {
    if (!confirmSetter) { resolve(window.confirm(cfg.message)); return; }
    confirmSetter({ ...cfg, resolve });
  });
}

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
    createdAt: nowISO(), updatedAt: nowISO(),
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

// Render an Electron accelerator string (e.g. "Alt+Space") with Mac glyphs.
function formatAccelerator(accel) {
  return accel
    .split("+")
    .map(part => ({
      CmdOrCtrl: "⌘", Cmd: "⌘", Command: "⌘", Ctrl: "⌃", Control: "⌃",
      Alt: "⌥", Option: "⌥", Shift: "⇧", Space: "Space",
    }[part] || part))
    .join(" ");
}

// Local YYYY-MM-DD (avoids UTC drift from toISOString)
function localISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─────────────────────────────────────────────────────────────
// FORMS — registries + scheduling/answer helpers
// ─────────────────────────────────────────────────────────────
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Question type registry. `hasOptions` → carries an options[] list;
// `isScale` → carries numeric min/max rendered as a rating row.
const QTYPES = {
  short_text:    { label: "Short text" },
  long_text:     { label: "Paragraph" },
  single_select: { label: "Multiple choice", hasOptions: true },
  multi_select:  { label: "Checkboxes",      hasOptions: true },
  number:        { label: "Number" },
  scale:         { label: "Rating scale",    isScale: true },
};

// How a submission's answers become entries.
const GROUPINGS = {
  "single":         { label: "One entry",      hint: "All answers in a single entry" },
  "parent-replies": { label: "Entry + replies", hint: "One entry; each answer a reply beneath it" },
  "per-question":   { label: "Per question",   hint: "Each answer its own entry — route individually" },
};

function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

// Is `now` at or past "HH:MM" local time today?
function isPastTimeToday(hhmm, now) {
  const [h, m] = String(hhmm || "00:00").split(":").map(Number);
  return now.getHours() * 60 + now.getMinutes() >= (h || 0) * 60 + (m || 0);
}

// The current occurrence key (an ISO date) for a scheduled form, or null when
// it isn't active yet (no schedule, or before the scheduled day/time). Compared
// against form.lastCompleted to decide due-ness. Reuses localISO as the key.
function formOccurrence(form, now = new Date()) {
  const s = form?.schedule;
  if (!s) return null;
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  if (s.cadence === "daily") {
    return isPastTimeToday(s.time, now) ? localISO(today) : null;
  }
  if (s.cadence === "weekly") {
    const days = (s.daysOfWeek && s.daysOfWeek.length) ? s.daysOfWeek : [0];
    for (let back = 0; back < 7; back++) {                 // most recent scheduled weekday <= today
      const d = new Date(today); d.setDate(d.getDate() - back);
      if (days.includes(d.getDay())) {
        if (back === 0 && !isPastTimeToday(s.time, now)) return null; // today, but before the time
        return localISO(d);
      }
    }
    return null;
  }
  if (s.cadence === "monthly") {
    const dom = Math.min(Math.max(1, s.dayOfMonth || 1), daysInMonth(today)); // clamp 31 → month length
    const scheduled = new Date(today.getFullYear(), today.getMonth(), dom);
    if (today < scheduled) return null;
    if (today.getTime() === scheduled.getTime() && !isPastTimeToday(s.time, now)) return null;
    return localISO(scheduled);
  }
  return null;
}

// Due = there's a current occurrence the user hasn't yet filled or skipped.
// Only the latest period is tracked (a missed occurrence doesn't stack).
function formIsDue(form, now = new Date()) {
  const occ = formOccurrence(form, now);
  return occ !== null && occ !== form.lastCompleted;
}

// Human summary of a schedule, e.g. "Weekly · Mon, Thu · 18:00".
function formScheduleSummary(form) {
  const s = form?.schedule;
  if (!s) return "No schedule — fill manually";
  const t = s.time || "09:00";
  if (s.cadence === "daily")  return `Daily · ${t}`;
  if (s.cadence === "weekly") {
    const days = (s.daysOfWeek && s.daysOfWeek.length) ? s.daysOfWeek : [0];
    return `Weekly · ${[...days].sort((a, b) => a - b).map(d => WEEKDAYS[d]).join(", ")} · ${t}`;
  }
  if (s.cadence === "monthly") return `Monthly · day ${Math.min(Math.max(1, s.dayOfMonth || 1), 31)} · ${t}`;
  return "No schedule";
}

// Is a question's answer present? Explicit so a numeric 0 counts as answered.
function isAnswered(q, val) {
  if (val === undefined || val === null) return false;
  if (q.type === "multi_select")          return Array.isArray(val) && val.length > 0;
  if (q.type === "number" || q.type === "scale") return val !== "" && !Number.isNaN(Number(val));
  return String(val).trim() !== "";
}

// Render an answer value to display text.
function formatAnswer(q, val) {
  if (q.type === "multi_select") return Array.isArray(val) ? val.join(", ") : "";
  return String(val ?? "").trim();
}

// One "Question: answer" line (or bare answer when labels are off).
function answerLine(form, q, val) {
  const a = formatAnswer(q, val);
  return form.includeQuestionLabel ? `${q.label}: ${a}` : a;
}

// Where a question's answer is written — per-question override (per-question
// grouping only) → form default → Inbox, skipping any deleted thread so an
// answer is never silently dropped.
function resolveQuestionThreadId(form, q, threads) {
  const exists = (id) => id && threads.some(t => t.id === id);
  const perQ = form.grouping === "per-question" ? q.threadId : null;
  if (exists(perQ)) return perQ;
  if (exists(form.defaultThreadId)) return form.defaultThreadId;
  return "inbox";
}

// A fresh, valid blank form for the editor's "new" state.
function blankForm() {
  return {
    id: null, title: "", description: "", questions: [],
    defaultThreadId: "inbox", grouping: "single", includeQuestionLabel: true,
    headerTemplate: "",
    schedule: { cadence: "weekly", daysOfWeek: [0], dayOfMonth: 1, time: "09:00" },
    lastCompleted: null,
  };
}

// Parse pasted multi-line text into entries, one per non-empty line.
// Understands markdown bullets/numbers and `- [x]` / `- [ ]` checkboxes.
function parseBulkEntries(raw) {
  return (raw || "").split(/\r?\n/).map(line => {
    let text = line.trim();
    if (!text) return null;
    let checked = false;
    const cb = text.match(/^(?:[-*•+]\s*)?\[([ xX])\]\s*(.*)$/);
    if (cb) {
      checked = cb[1].toLowerCase() === "x";
      text = cb[2].trim();
    } else {
      text = text.replace(/^([-*•+]|\d+[.)])\s+/, "").trim();
    }
    if (!text) return null;
    return { text, checked };
  }).filter(Boolean);
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

// Real wall-clock timestamp stored on threads (createdAt/updatedAt) and entries
// (createdAt). Replaces the old "Today" sentinel so temporal reasoning — in the
// app and in the LLM export — works against actual dates.
function nowISO() {
  return new Date().toISOString();
}

// Stamp a thread as just-modified. Used by every mutation so `updatedAt` is
// trustworthy (previously only a couple of paths set it).
function touchThread(t) {
  return { ...t, updatedAt: nowISO() };
}

// Given a set of entry ids, return that set plus every reply descendant (by
// parentEntryId). Used when deleting entries so replies don't get orphaned —
// orphans stay hidden in ThreadView but still surface in the flat Timeline.
function collectWithDescendants(entries, rootIds) {
  const childrenOf = {};
  entries.forEach(e => {
    if (e.parentEntryId) (childrenOf[e.parentEntryId] ||= []).push(e.id);
  });
  const doomed = new Set();
  const visit = (id) => {
    if (doomed.has(id)) return;
    doomed.add(id);
    (childrenOf[id] || []).forEach(visit);
  };
  rootIds.forEach(visit);
  return doomed;
}

// Compact, human display for a stored timestamp. Tolerates the legacy "Today"
// sentinel and any non-ISO leftovers so old data files keep rendering.
function formatTimestamp(value) {
  if (!value || typeof value !== "string") return "";
  if (value === "Today") return "Today";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const diff = dueDayDiff(localISO(d));
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff !== null && diff < 0 && diff > -7) return `${-diff}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Friendly text for the error codes the main process returns from LLM calls.
function llmErrorText(code) {
  switch (code) {
    case "no_key":
    case "disabled":     return "Turn on Smart Sort and add an API key in Settings.";
    case "bad_key":      return "That API key was rejected — check it in Settings.";
    case "rate_limited": return "Rate limited by Claude — try again in a moment.";
    case "empty":        return "Nothing to sort.";
    case "no_threads":   return "Create a thread first.";
    default:             return "Couldn't reach Claude. Try again.";
  }
}

// ─────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────
const DEFAULT_PREFS = {
  density: "comfortable",      // "comfortable" | "compact"
  startupView: "home",         // "home" | "timeline" | "inbox" | "last"
  showDoneByDefault: false,    // initial value of ThreadView's showDone
};

// Models offered for Smart Sort (must match the ids main.js/electron/llm.js accept).
const MODEL_OPTS = [
  { value: "claude-haiku-4-5", label: "Haiku" },
  { value: "claude-sonnet-5",  label: "Sonnet" },
  { value: "claude-opus-4-8",  label: "Opus" },
];

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
  const [newDescription, setNewDescription] = useState("");
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
  const [forms, setForms]             = useState([]);
  const [editingForm, setEditingForm] = useState(null);  // null | "new" | formId
  const [fillingForm, setFillingForm] = useState(null);  // null | formId
  const [llmConfig, setLlmConfig]     = useState(null);  // { hasKey, model, enabled } | null (never holds the key)
  const [showReview, setShowReview]   = useState(false); // journal-wide smart-sort review modal
  // Cached review results, kept at the root so closing the modal to poke around
  // in Loom and reopening it doesn't recompute. null = never run this session.
  const [reviewState, setReviewState] = useState(null);  // null | { status, items, errMsg, resolved }

  // Smart Sort readiness: the master switch is on AND a key is saved. Re-read
  // when Settings closes so toggling it there lights up the Inbox affordances.
  const refreshLlmConfig = () => window.loomAPI?.getLlmConfig?.().then(setLlmConfig).catch(() => {});
  useEffect(() => { refreshLlmConfig(); }, []);
  useEffect(() => { if (!showSettings) refreshLlmConfig(); }, [showSettings]);
  const smartSortReady = !!(llmConfig && llmConfig.enabled && llmConfig.hasKey);

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
          // Start with every thread collapsed on launch.
          setCollapsed(new Set(data.threads.map(t => t.id)));
        }
        if (data?.theme === "dark" || data?.theme === "light") {
          setTheme(data.theme);
        }
        if (data?.prefs && typeof data.prefs === "object") {
          setPrefs(p => ({ ...p, ...data.prefs }));
        }
        if (Array.isArray(data?.forms)) {
          setForms(data.forms);
        }
        setDataLoaded(true);
      }).catch(() => setDataLoaded(true));
    } else {
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (dataLoaded && window.loomAPI) {
      window.loomAPI.saveData({ threads, theme, prefs, forms });
    }
  }, [threads, theme, prefs, forms, dataLoaded]);

  // The widget captures into the data file directly (via the main process), then
  // broadcasts "data-changed". Reload threads so those captures appear live.
  useEffect(() => {
    if (!window.loomAPI?.onDataChanged) return;
    return window.loomAPI.onDataChanged(() => {
      window.loomAPI.loadData().then(data => {
        if (data && Array.isArray(data.threads)) setThreads(data.threads);
      }).catch(() => {});
    });
  }, []);

  // Keep the widget's theme in sync with the app so it always matches.
  useEffect(() => {
    window.loomAPI?.setWidgetConfig?.({ theme });
  }, [theme]);
  // target shape: { id: string, position: "before"|"after"|"inside"|"root" }

  const current     = threads.find(t => t.id === view);
  const inboxThread = threads.find(t => t.id === "inbox");
  const inboxCount  = inboxThread ? inboxThread.entries.length : 0;

  // Home red alert: overdue board tasks + forms due to be filled out.
  const overdueCount = threads
    .filter(t => t.type === "board" && t.id !== "inbox")
    .reduce((n, t) => n + t.entries.filter(e => {
      if (e.checked || e.subtype === "note" || !e.dueDate) return false;
      const diff = dueDayDiff(e.dueDate);
      return diff !== null && diff < 0;
    }).length, 0);
  const dueFormsCount = forms.filter(f => formIsDue(f)).length;
  const homeAlertCount = overdueCount + dueFormsCount;

  const go = (id) => { if (id !== view) setView(id); };

  const toggleCollapse = (id) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startThreadDrag = (id) => setDragState({ dragging: id, target: null });

  // Always reset on drag end so an aborted/cancelled drag (released over empty
  // space, outside the sidebar, or Esc) never leaves the UI stuck in "dragging"
  // mode. onDrop only fires over a valid target, so it can't be relied on alone.
  const endThreadDrag = () => setDragState({ dragging: null, target: null });

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
    const description = newDescription.trim();
    const t = {
      id: Date.now().toString(), title: newTitle.trim(), type: newType,
      parentId, entries: [], createdAt: nowISO(), updatedAt: nowISO(),
      ...(description ? { description } : {}),
    };
    setThreads(p => [...p, t]);
    setShowNew(null); setNewTitle(""); setNewDescription("");
    go(t.id);
  };

  const addEntry = (tid, text, subtype, parentEntryId) => {
    if (!text.trim()) return;
    const e = { id: Date.now().toString(), text: text.trim(), dateISO: localISO(new Date()), date: "Today", ts: 0, createdAt: nowISO(), checked: false, pinned: false, subtype: subtype || "entry", parentEntryId: parentEntryId || null };
    setThreads(p => p.map(t => t.id === tid ? touchThread({ ...t, entries: [...t.entries, e] }) : t));
  };

  // Bulk add: items = [{ text, checked }], one entry per item, single state write.
  const addEntries = (tid, items, subtype) => {
    const clean = (items || []).filter(it => it && it.text && it.text.trim());
    if (!clean.length) return;
    const base = Date.now();
    const dateISO = localISO(new Date());
    const created = nowISO();
    const newEntries = clean.map((it, i) => ({
      id: (base + i).toString(), text: it.text.trim(), dateISO, date: "Today", ts: 0,
      createdAt: created, checked: !!it.checked, pinned: false, subtype: subtype || "entry", parentEntryId: null,
    }));
    setThreads(p => p.map(t => t.id === tid ? touchThread({ ...t, entries: [...t.entries, ...newEntries] }) : t));
  };

  // ── Forms CRUD + submission ────────────────────────────────
  const createForm = (draft) => {
    const id = Date.now().toString();
    const ts = nowISO();
    setForms(prev => [...prev, { ...draft, id, lastCompleted: null, createdAt: ts, updatedAt: ts }]);
  };

  const updateForm = (id, draft) => {
    setForms(prev => prev.map(f => f.id === id ? { ...f, ...draft, id, updatedAt: nowISO() } : f));
  };

  const deleteForm = (id) => setForms(prev => prev.filter(f => f.id !== id));

  // Skip the current occurrence: mark it complete without writing entries.
  const skipForm = (form) => {
    const occ = formOccurrence(form, new Date()) || localISO(new Date());
    setForms(prev => prev.map(f => f.id === form.id ? { ...f, lastCompleted: occ } : f));
  };

  // Write a submission's answers as entries per the form's grouping in ONE
  // threads write, then mark the occurrence complete. A single monotonic id
  // counter guarantees a parent's id exists before its replies and that ids
  // never collide across destination threads.
  const submitFormResponse = (form, answers) => {
    const base = Date.now();
    let n = 0;
    const nextId  = () => (base + (n++)).toString();
    const dateISO = localISO(new Date());
    const created = nowISO();
    const mkEntry = (text, subtype, parentEntryId) => ({
      id: nextId(), text, dateISO, date: "Today", ts: 0, createdAt: created,
      checked: false, pinned: false, subtype: subtype || "entry", parentEntryId: parentEntryId || null,
    });

    const answered = form.questions.filter(q => isAnswered(q, answers[q.id]));
    const writes = []; // { threadId, entry } — built in question order

    if (form.grouping === "parent-replies") {
      const tid = resolveQuestionThreadId(form, {}, threads);
      const bodyQs  = answered.filter(q => q.placement === "body");
      const replyQs = answered.filter(q => q.placement !== "body");
      // Body questions write raw (a freeform journal paragraph); header prefixes if set.
      // Falls back to header/title when no body question is answered (back-compat).
      const bodyText = [form.headerTemplate?.trim(), ...bodyQs.map(q => formatAnswer(q, answers[q.id]))]
        .filter(Boolean).join("\n") || form.title || "Form response";
      const parent = mkEntry(bodyText, "entry", null);
      writes.push({ threadId: tid, entry: parent });
      // Group reply questions: questions sharing a non-empty replyGroup combine into ONE
      // reply (each a labeled line), positioned where the group first appears. Blank group
      // → its own reply.
      const groups = []; const byKey = new Map();
      replyQs.forEach(q => {
        const key = (q.replyGroup || "").trim();
        if (key && byKey.has(key)) byKey.get(key).push(q);
        else { const g = [q]; groups.push(g); if (key) byKey.set(key, g); }
      });
      groups.forEach(g => {
        const text = g.map(q => answerLine(form, q, answers[q.id])).join("\n");
        if (text.trim()) writes.push({ threadId: tid, entry: mkEntry(text, "entry", parent.id) });
      });
    } else if (form.grouping === "per-question") {
      answered.forEach(q => {
        const tid = resolveQuestionThreadId(form, q, threads);
        writes.push({ threadId: tid, entry: mkEntry(answerLine(form, q, answers[q.id]), q.subtype || "entry", null) });
      });
    } else { // "single"
      const body = [form.headerTemplate?.trim(), ...answered.map(q => answerLine(form, q, answers[q.id]))].filter(Boolean).join("\n");
      if (body) writes.push({ threadId: resolveQuestionThreadId(form, {}, threads), entry: mkEntry(body, "entry", null) });
    }

    if (writes.length) {
      const byThread = new Map();
      writes.forEach(w => {
        if (!byThread.has(w.threadId)) byThread.set(w.threadId, []);
        byThread.get(w.threadId).push(w.entry);
      });
      setThreads(prev => prev.map(t => {
        const adds = byThread.get(t.id);
        return adds && adds.length ? touchThread({ ...t, entries: [...t.entries, ...adds] }) : t;
      }));
    }

    const occ = formOccurrence(form, new Date()) || dateISO;
    setForms(prev => prev.map(f => f.id === form.id ? { ...f, lastCompleted: occ } : f));
  };

  const updateEntry = (tid, eid, text) => {
    if (!text.trim()) return;
    setThreads(p => p.map(t => t.id === tid
      ? touchThread({ ...t, entries: t.entries.map(e => e.id === eid ? { ...e, text: text.trim() } : e) }) : t));
  };

  const toggleCheck = (tid, eid) => {
    setThreads(p => p.map(t => t.id === tid
      ? touchThread({ ...t, entries: t.entries.map(e => e.id === eid ? { ...e, checked: !e.checked } : e) }) : t));
  };

  const pinEntry = (tid, eid) => {
    setThreads(p => p.map(t => t.id === tid
      ? touchThread({ ...t, entries: t.entries.map(e => e.id === eid ? { ...e, pinned: !e.pinned } : e) }) : t));
  };

  const setDueDate = (tid, eid, dueDate) => {
    setThreads(p => p.map(t => t.id === tid
      ? touchThread({ ...t, entries: t.entries.map(e => e.id === eid ? { ...e, dueDate: dueDate || null } : e) }) : t));
  };

  const setEntryDate = (tid, eid, iso) => {
    if (!iso) return;
    setThreads(p => p.map(t => t.id === tid
      ? touchThread({ ...t, entries: t.entries.map(e => e.id === eid ? { ...e, dateISO: iso } : e) }) : t));
  };

  const deleteEntry = (tid, eid) => {
    setThreads(p => p.map(t => {
      if (t.id !== tid) return t;
      // Cascade to reply descendants so no orphaned replies linger (they'd
      // stay hidden in ThreadView but still surface in the flat Timeline).
      const doomed = collectWithDescendants(t.entries, new Set([eid]));
      return touchThread({ ...t, entries: t.entries.filter(e => !doomed.has(e.id)) });
    }));
  };

  // Move a set of entries (plus their reply descendants) to another thread.
  // Replies whose parent isn't also moving become top-level entries in the destination.
  const moveEntriesTo = (eids, toTid) => {
    const ids = eids instanceof Set ? eids : new Set(eids);
    if (ids.size === 0 || !toTid) return;
    setThreads(prev => {
      if (!prev.some(t => t.id === toTid)) return prev;
      const collected = [];
      const stripped = prev.map(t => {
        if (t.id === toTid) return t; // destination handled after; moving within a thread is a no-op
        const childrenOf = {};
        t.entries.forEach(e => {
          if (e.parentEntryId) (childrenOf[e.parentEntryId] ||= []).push(e.id);
        });
        const toMove = new Set();
        const visit = (id) => {
          if (toMove.has(id)) return;
          toMove.add(id);
          (childrenOf[id] || []).forEach(visit);
        };
        t.entries.forEach(e => { if (ids.has(e.id)) visit(e.id); });
        if (toMove.size === 0) return t;
        t.entries.forEach(e => {
          if (!toMove.has(e.id)) return;
          const keepParent = e.parentEntryId && toMove.has(e.parentEntryId);
          collected.push({ ...e, pinned: false, parentEntryId: keepParent ? e.parentEntryId : null });
        });
        return touchThread({ ...t, entries: t.entries.filter(e => !toMove.has(e.id)) });
      });
      if (collected.length === 0) return prev;
      return stripped.map(t => t.id === toTid ? touchThread({ ...t, entries: [...t.entries, ...collected] }) : t);
    });
  };

  const moveEntry = (fromTid, eid, toTid) => moveEntriesTo(new Set([eid]), toTid);

  const moveSelectedEntries = (toTid) => {
    if (!toTid || selectedEntryIds.size === 0) return;
    moveEntriesTo(selectedEntryIds, toTid);
    setSelectedEntryIds(new Set());
  };

  const reorderEntries = (tid, newEntries) => {
    setThreads(p => p.map(t => t.id === tid ? touchThread({ ...t, entries: newEntries }) : t));
  };

  const renameThread = (tid, title) => {
    const trimmed = (title || "").trim();
    if (!trimmed) return;
    setThreads(p => p.map(t => t.id === tid ? touchThread({ ...t, title: trimmed }) : t));
  };

  const setThreadDescription = (tid, description) => {
    const trimmed = (description || "").trim();
    setThreads(p => p.map(t => {
      if (t.id !== tid) return t;
      if (!trimmed) {
        const { description: _drop, ...rest } = t;
        return touchThread(rest);
      }
      return touchThread({ ...t, description: trimmed });
    }));
  };

  const setThreadDisplayMode = (tid, mode) => {
    setThreads(p => p.map(t => {
      if (t.id !== tid) return t;
      if (!mode || mode === "list") {
        const { displayMode: _drop, ...rest } = t;
        return touchThread(rest);
      }
      return touchThread({ ...t, displayMode: mode });
    }));
  };

  // Per-thread entry sort: "manual" (array order, drag-reorderable) | "asc" | "desc" by date.
  const setThreadSortOrder = (tid, order) => {
    setThreads(p => p.map(t => {
      if (t.id !== tid) return t;
      if (order !== "asc" && order !== "desc") {
        const { sortOrder: _drop, ...rest } = t;
        return touchThread(rest);
      }
      return touchThread({ ...t, sortOrder: order });
    }));
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
        .map(t => {
          if (!eids.size) return { ...t, parentId: tids.has(t.parentId) ? liftedParent(t.parentId) : t.parentId };
          // Cascade to reply descendants so no orphaned replies linger.
          const doomed = collectWithDescendants(t.entries, eids);
          return {
            ...t,
            parentId: tids.has(t.parentId) ? liftedParent(t.parentId) : t.parentId,
            entries: t.entries.filter(e => !doomed.has(e.id)),
          };
        });
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

  const ops = { addEntry, addEntries, updateEntry, toggleCheck, pinEntry, setDueDate, setEntryDate, deleteEntry, moveEntry, reorderEntries, renameThread, setThreadDescription, setThreadDisplayMode, setThreadSortOrder, deleteThread };
  const selection = { selectedThreadIds, selectedEntryIds, toggleThreadSelection, toggleEntrySelection, clearSelection };
  const selectionCount = selectedThreadIds.size + selectedEntryIds.size;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: G }} />
      <div className={`theme-${theme} density-${prefs.density}`} style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text, overflow: "hidden" }}>
        <Sidebar
          threads={threads} filtered={filtered} rootThreads={rootThreads}
          view={view} go={go} search={search} setSearch={setSearch}
          setShowNew={setShowNew} inboxCount={inboxCount} homeAlertCount={homeAlertCount}
          collapsed={collapsed} toggleCollapse={toggleCollapse}
          dragState={dragState}
          startThreadDrag={startThreadDrag}
          endThreadDrag={endThreadDrag}
          updateDropTarget={updateDropTarget}
          handleThreadDrop={handleThreadDrop}
          openSettings={() => setShowSettings(true)}
          selectedThreadIds={selectedThreadIds}
          toggleThreadSelection={toggleThreadSelection}
          clearSelection={clearSelection}
        />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {view === "home"     && <HomeView     threads={threads} rootThreads={rootThreads} go={go} setShowNew={setShowNew} addEntry={addEntry} forms={forms} onFillForm={setFillingForm} onSkipForm={skipForm} smartSortReady={smartSortReady} onReview={() => setShowReview(true)} />}
          {view === "timeline" && <TimelineView threads={threads} go={go} />}
          {view === "forms"    && <FormsView    forms={forms} threads={threads} onNew={() => setEditingForm("new")} onEdit={setEditingForm} onFill={setFillingForm} onDelete={deleteForm} />}
          {current && view !== "home" && view !== "timeline" && view !== "forms" && (
            <ThreadView
              key={current.id} thread={current} threads={threads} go={go}
              setShowNew={setShowNew}
              showDoneDefault={prefs.showDoneByDefault}
              smartSortReady={smartSortReady}
              {...ops}
              {...selection}
            />
          )}
        </main>
        {selectionCount > 0 && (
          <SelectionBar
            threadCount={selectedThreadIds.size}
            entryCount={selectedEntryIds.size}
            threads={threads}
            onMoveEntries={moveSelectedEntries}
            onDelete={deleteSelected}
            onClear={clearSelection}
          />
        )}
        {showNew !== null && (
          <NewModal
            title={newTitle} setTitle={setNewTitle}
            description={newDescription} setDescription={setNewDescription}
            type={newType} setType={setNewType}
            parentId={showNew === "root" ? null : showNew}
            parentThread={showNew && showNew !== "root" ? threads.find(t => t.id === showNew) : null}
            onCreate={createThread} onClose={() => { setShowNew(null); setNewDescription(""); }}
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
        {showReview && (
          <ReviewModal
            threads={threads}
            onApply={(fromTid, entryId, toTid) => moveEntry(fromTid, entryId, toTid)}
            onClose={() => setShowReview(false)}
            state={reviewState}
            setState={setReviewState}
          />
        )}
        {editingForm && (
          <FormEditor
            form={editingForm === "new" ? null : forms.find(f => f.id === editingForm)}
            threads={threads}
            onSave={(draft) => { editingForm === "new" ? createForm(draft) : updateForm(editingForm, draft); setEditingForm(null); }}
            onClose={() => setEditingForm(null)}
          />
        )}
        {fillingForm && forms.find(f => f.id === fillingForm) && (
          <FormFill
            form={forms.find(f => f.id === fillingForm)}
            threads={threads}
            onSubmit={(answers) => { submitFormResponse(forms.find(f => f.id === fillingForm), answers); setFillingForm(null); }}
            onClose={() => setFillingForm(null)}
          />
        )}
        <ConfirmHost />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// SELECTION BAR (floating, appears when items are multi-selected)
// ─────────────────────────────────────────────────────────────
function SelectionBar({ threadCount, entryCount, threads = [], onMoveEntries, onDelete, onClear }) {
  const [moveOpen, setMoveOpen] = useState(false);
  const parts = [];
  if (threadCount) parts.push(`${threadCount} thread${threadCount > 1 ? "s" : ""}`);
  if (entryCount)  parts.push(`${entryCount} entr${entryCount > 1 ? "ies" : "y"}`);
  const label = parts.join(" + ") + " selected";
  const confirm = () => {
    loomConfirm({
      title: "Delete selection?",
      message: `Delete ${label}? Sub-threads of any deleted thread move up one level. This can't be undone.`,
    }).then(ok => { if (ok) onDelete(); });
  };
  return (
    <>
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
      {entryCount > 0 && (
        <button
          className="ghost"
          onClick={() => setMoveOpen(true)}
          title="Move selected entries to another thread"
          style={{ display: "flex", alignItems: "center", gap: 6, background: C.surf, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text2, fontSize: 12, padding: "6px 12px", cursor: "pointer" }}
        >
          <FolderInput size={12} /> Move to thread…
        </button>
      )}
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
    {moveOpen && (
      <MoveToThreadModal
        threads={threads}
        title="Move entries"
        subtitle={`Choose a destination for the ${entryCount} selected entr${entryCount > 1 ? "ies" : "y"}.`}
        onPick={(tid) => { onMoveEntries?.(tid); setMoveOpen(false); }}
        onClose={() => setMoveOpen(false)}
      />
    )}
    </>
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
        background: checked ? C.gold : C.overlayHi,
        border: `1px solid ${checked ? C.goldBorder : C.border}`,
        position: "relative", cursor: "pointer", padding: 0,
        transition: "background 0.16s, border-color 0.16s",
      }}
    >
      <span style={{
        position: "absolute", top: 1, left: checked ? 17 : 1,
        width: 16, height: 16, borderRadius: "50%",
        background: checked ? C.onGold : C.text,
        transition: "left 0.16s",
      }} />
    </button>
  );
}

function Spinner({ color = "currentColor", size = 13 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}`, borderTopColor: "transparent",
      animation: "spin 0.6s linear infinite", flexShrink: 0,
    }} />
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

// A single row in the move-to-thread tree picker. Mirrors the thread tree
// order shown everywhere else (array order via getChildren). The source thread
// is shown but disabled so its subtree stays reachable as a destination.
function MoveThreadNode({ thread, threads, depth, excludeId, onPick }) {
  const cfg = TYPES[thread.type] || TYPES.capture;
  const Icon = cfg.icon;
  const children = getChildren(threads, thread.id);
  const disabled = thread.id === excludeId;
  const boardTasks = thread.entries.filter(e => e.subtype !== "note");
  const meta = thread.type === "board"
    ? `${boardTasks.filter(e => e.checked).length}/${boardTasks.length}`
    : `${thread.entries.length}`;
  const title = thread.id === "inbox" ? "Inbox" : thread.title;

  return (
    <>
      <button
        className="ghost"
        disabled={disabled}
        onClick={() => { if (!disabled) onPick(thread.id); }}
        title={disabled ? "Entries are already in this thread" : `Move to ${title}`}
        style={{
          display: "flex", alignItems: "center", gap: 9, width: "100%",
          textAlign: "left", padding: "7px 10px", paddingLeft: 10 + depth * 16,
          background: "transparent", border: "none", borderRadius: 7,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <Icon size={11} color={cfg.color} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: C.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </span>
        <span style={{ fontSize: 10.5, color: C.text3, flexShrink: 0 }}>{meta}</span>
      </button>
      {children.map(child => (
        <MoveThreadNode
          key={child.id} thread={child} threads={threads} depth={depth + 1}
          excludeId={excludeId} onPick={onPick}
        />
      ))}
    </>
  );
}

// Tree-organized destination picker for moving entries between threads. Same
// hierarchy/ordering as the Sidebar and the LLM export picker.
function MoveToThreadModal({ threads, excludeId = null, title = "Move to thread", subtitle, onPick, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const inbox = threads.find(t => t.id === "inbox");
  const roots = threads.filter(t => t.parentId == null && t.id !== "inbox");
  const ordered = inbox ? [inbox, ...roots] : roots;

  return (
    <div
      onClick={e => { e.stopPropagation(); onClose(); }}
      style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 320, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 460, maxWidth: "92vw", maxHeight: "80vh", display: "flex", flexDirection: "column", background: C.surf, border: `1px solid ${C.border}`, borderRadius: 14, animation: "slideIn 0.22s ease both", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div style={{ padding: "20px 22px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: subtitle ? 6 : 0 }}>
            <div style={{ fontFamily: "'Cormorant', serif", fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em" }}>{title}</div>
            <button onClick={onClose} className="ghost" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text3, padding: 6, borderRadius: 6, display: "flex" }}>
              <X size={15} />
            </button>
          </div>
          {subtitle && <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.5 }}>{subtitle}</div>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px 14px", minHeight: 120 }}>
          {ordered.length === 0
            ? <div style={{ padding: 24, textAlign: "center", color: C.text3, fontSize: 12 }}>No threads yet.</div>
            : ordered.map(t => (
                <MoveThreadNode
                  key={t.id} thread={t} threads={threads} depth={0}
                  excludeId={excludeId} onPick={onPick}
                />
              ))
          }
        </div>
      </div>
    </div>
  );
}

function ExportPickerNode({ thread, threads, depth, selectedIds, onToggle }) {
  const cfg = TYPES[thread.type] || TYPES.capture;
  const Icon = cfg.icon;
  const children = getChildren(threads, thread.id);
  const isChecked = selectedIds.has(thread.id);
  const boardTasks = thread.entries.filter(e => e.subtype !== "note");
  const meta = thread.type === "board"
    ? `${boardTasks.filter(e => e.checked).length}/${boardTasks.length}`
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
      style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 260, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}
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
  const [widgetCfg, setWidgetCfg] = useState(null);
  const [llmCfg, setLlmCfg] = useState(null);          // { hasKey, model, enabled }
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [keyMsg, setKeyMsg] = useState(null);
  const [memStatus, setMemStatus] = useState(null);    // { generatedAt, count }
  const [memBusy, setMemBusy] = useState(false);
  const [memMsg, setMemMsg] = useState(null);

  useEffect(() => {
    window.loomAPI?.getWidgetConfig?.().then(cfg => setWidgetCfg(cfg)).catch(() => {});
    window.loomAPI?.getLlmConfig?.().then(cfg => setLlmCfg(cfg)).catch(() => {});
    window.loomAPI?.getMemoryStatus?.().then(s => setMemStatus(s)).catch(() => {});
  }, []);

  const setLlm = (patch) => {
    window.loomAPI?.setLlmConfig?.(patch).then(cfg => setLlmCfg(cfg)).catch(() => {});
  };
  const saveKey = () => {
    const k = apiKeyDraft.trim();
    if (!k) return;
    window.loomAPI?.setLlmConfig?.({ apiKey: k }).then(cfg => {
      setLlmCfg(cfg); setApiKeyDraft(""); setKeyMsg("Saved"); setTimeout(() => setKeyMsg(null), 2000);
    }).catch(() => {});
  };
  const clearKey = () => window.loomAPI?.setLlmConfig?.({ apiKey: "" }).then(cfg => setLlmCfg(cfg)).catch(() => {});
  const rebuildMemory = () => {
    setMemBusy(true); setMemMsg(null);
    window.loomAPI?.buildMemory?.({ threads }).then(res => {
      setMemBusy(false);
      if (res?.ok) {
        setMemStatus({ generatedAt: res.generatedAt, count: res.count });
        setMemMsg(`Built ${res.count} profile${res.count === 1 ? "" : "s"}`);
        setTimeout(() => setMemMsg(null), 2600);
      } else setMemMsg(llmErrorText(res?.error));
    }).catch(() => { setMemBusy(false); setMemMsg(llmErrorText()); });
  };

  // Optimistically update local state and push the change to the main process.
  const setWidget = (patch) => {
    setWidgetCfg(c => ({ ...c, ...patch }));
    window.loomAPI?.setWidgetConfig?.(patch);
  };

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
      style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 250, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}
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

        {widgetCfg && (
          <SettingsSection label="Quick Capture Widget">
            <SettingsRow label="Show widget on desktop" hint="A small always-available box for capturing thoughts straight to Inbox. Also summoned by the global shortcut.">
              <ToggleSwitch
                checked={!!widgetCfg.visible}
                onChange={(v) => setWidget({ visible: v })}
              />
            </SettingsRow>

            <SettingsRow label="Open widget on launch" hint="Automatically show the widget when Loom starts. Off by default — otherwise use the global shortcut to summon it.">
              <ToggleSwitch
                checked={!!widgetCfg.openOnLaunch}
                onChange={(v) => setWidget({ openOnLaunch: v })}
              />
            </SettingsRow>

            <SettingsRow label="Layering" hint="Float keeps it above other windows; Among windows lets it be covered like a desktop widget">
              <SegSelect
                value={widgetCfg.layering || "float"}
                onChange={(v) => setWidget({ layering: v })}
                options={[
                  { value: "float",  label: "Float on top"   },
                  { value: "recede", label: "Among windows" },
                ]}
              />
            </SettingsRow>

            <SettingsRow label="Launch at login" hint="Keep the widget available automatically when you log in">
              <ToggleSwitch
                checked={!!widgetCfg.launchAtLogin}
                onChange={(v) => setWidget({ launchAtLogin: v })}
              />
            </SettingsRow>

            <SettingsRow label="Global shortcut" hint="Press anywhere to summon and focus the widget">
              <span style={{ fontSize: 12, color: C.text2, fontWeight: 500, padding: "5px 11px", background: C.overlay, border: `1px solid ${C.border}`, borderRadius: 7 }}>
                {formatAccelerator(widgetCfg.hotkey || "Alt+Space")}
              </span>
            </SettingsRow>
          </SettingsSection>
        )}

        {llmCfg && (
          <SettingsSection label="Smart Sort (AI)">
            <SettingsRow label="Enable Smart Sort" hint="Let Claude suggest which thread a captured note belongs in. An entry's text is sent to Anthropic only when you run a suggestion.">
              <ToggleSwitch checked={!!llmCfg.enabled} onChange={(v) => setLlm({ enabled: v })} />
            </SettingsRow>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 9 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>Anthropic API key</span>
                <span style={{ fontSize: 11, color: C.text3, lineHeight: 1.4 }}>
                  Stored only on this Mac (never synced, never shown again). Get one at console.anthropic.com.
                  {llmCfg.hasUserKey
                    ? <span style={{ color: C.gold }}> Key saved.</span>
                    : llmCfg.usingDefaultKey
                      ? <span style={{ color: C.text2 }}> Using the default key from .env.</span>
                      : null}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="password"
                  value={apiKeyDraft}
                  onChange={(e) => setApiKeyDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveKey(); }}
                  placeholder={llmCfg.hasUserKey ? "Enter a new key to replace" : llmCfg.usingDefaultKey ? "Override the .env default…" : "sk-ant-…"}
                  style={{ flex: 1, minWidth: 0, background: C.overlay, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontSize: 12, padding: "7px 10px", fontFamily: "'DM Sans', sans-serif" }}
                />
                <button
                  onClick={saveKey}
                  disabled={!apiKeyDraft.trim()}
                  className="gold-btn"
                  style={{ background: apiKeyDraft.trim() ? C.gold : C.goldDim, border: "none", borderRadius: 7, color: apiKeyDraft.trim() ? C.onGold : C.text3, fontSize: 12, padding: "7px 14px", cursor: apiKeyDraft.trim() ? "pointer" : "default", fontWeight: 500, flexShrink: 0 }}
                >{keyMsg || "Save"}</button>
                {llmCfg.hasUserKey && <ActionButton onClick={clearKey}>Clear</ActionButton>}
              </div>
            </div>

            <SettingsRow label="Model" hint="Haiku is fast and cheap — the best fit for quick sorting.">
              <SegSelect value={llmCfg.model} onChange={(v) => setLlm({ model: v })} options={MODEL_OPTS} />
            </SettingsRow>

            <SettingsRow
              label="Thread memory"
              hint={
                memStatus?.count
                  ? `${memStatus.count} profile${memStatus.count === 1 ? "" : "s"} · built ${formatTimestamp(memStatus.generatedAt)}. Rebuild after adding or renaming threads.`
                  : "A compact summary of each thread so suggestions use fewer tokens. Optional — sorting still works from thread names."
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {memMsg && <span style={{ fontSize: 11, color: /^Built/.test(memMsg) ? C.gold : C.danger }}>{memMsg}</span>}
                {memBusy && <Spinner color={C.gold} size={13} />}
                <ActionButton onClick={rebuildMemory}>{memBusy ? "Building…" : (memStatus?.count ? "Rebuild" : "Build")}</ActionButton>
              </div>
            </SettingsRow>
          </SettingsSection>
        )}

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

// Journal-wide smart-sort review: asks Claude which entries would fit better in a
// different thread, then lets you apply each move one at a time (falling back to
// nothing if you skip). Display info is snapshotted at load time so applying a
// move — which mutates the live thread list — doesn't scramble the remaining rows.
//
// Results (and which suggestions you've applied/skipped) live in the parent via
// `state`/`setState`, so closing this modal to check something in Loom and
// reopening it reuses the last pass instead of recomputing. Use "Rescan" for a
// fresh pass after making changes.
function ReviewModal({ threads, onApply, onClose, state, setState }) {
  const status   = state?.status || "loading";
  const items    = state?.items || [];
  const errMsg   = state?.errMsg || null;
  const resolved = state?.resolved || {};

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Fetch a fresh pass. Snapshots entry text + thread titles so later applies
  // (which mutate the live thread list) don't scramble the rendered rows.
  const load = () => {
    setState({ status: "loading", items: [], errMsg: null, resolved: {} });
    const titleOf = (id) => (threads.find(t => t.id === id) || {}).title || (id === "inbox" ? "Inbox" : id);
    const textOf = (eid) => {
      for (const t of threads) {
        const e = (t.entries || []).find(x => x.id === eid);
        if (e) return e.text;
      }
      return "";
    };
    window.loomAPI?.reviewJournal?.({ threads }).then(res => {
      if (!res?.ok) { setState({ status: "error", items: [], errMsg: llmErrorText(res?.error), resolved: {} }); return; }
      const enriched = (res.suggestions || []).map(s => ({
        ...s,
        text: textOf(s.entryId),
        fromTitle: titleOf(s.fromThreadId),
        toTitle: titleOf(s.toThreadId),
      }));
      setState({ status: "ready", items: enriched, errMsg: null, resolved: {} });
    }).catch(() => setState({ status: "error", items: [], errMsg: llmErrorText(), resolved: {} }));
  };

  // Compute only if there's nothing cached (or a prior load was cut off mid-flight
  // by an earlier close). A cached "ready"/"error" result is reused as-is.
  useEffect(() => {
    if (!state || state.status === "loading") load();
  // Run once on mount; reuse cached results otherwise.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = (it) => { onApply(it.fromThreadId, it.entryId, it.toThreadId); setState(s => ({ ...s, resolved: { ...s.resolved, [it.entryId]: "applied" } })); };
  const skip   = (it) => setState(s => ({ ...s, resolved: { ...s.resolved, [it.entryId]: "skipped" } }));

  const pending = items.filter(it => !resolved[it.entryId]).length;

  return (
    <div
      onClick={e => { e.stopPropagation(); onClose(); }}
      style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 320, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 560, maxWidth: "92vw", maxHeight: "82vh", display: "flex", flexDirection: "column", background: C.surf, border: `1px solid ${C.border}`, borderRadius: 14, animation: "slideIn 0.22s ease both", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Sparkles size={16} color={C.gold} />
              <div style={{ fontFamily: "'Cormorant', serif", fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em" }}>Review placements</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {status !== "loading" && (
                <button onClick={load} className="ghost" title="Run a fresh pass over your entries" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, cursor: "pointer", color: C.text2, fontSize: 11.5, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                  <Sparkles size={11} /> Rescan
                </button>
              )}
              <button onClick={onClose} className="ghost" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text3, padding: 6, borderRadius: 6, display: "flex" }}>
                <X size={15} />
              </button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.5, marginTop: 6 }}>
            Entries Claude thinks would fit better in another thread. Apply the ones you agree with.
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 16px", minHeight: 140 }}>
          {status === "loading" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "40px 0", color: C.text3, fontSize: 13 }}>
              <Spinner color={C.gold} size={15} /> Looking through your entries…
            </div>
          )}
          {status === "error" && (
            <div style={{ padding: "40px 0", textAlign: "center", color: C.danger, fontSize: 13 }}>{errMsg}</div>
          )}
          {status === "ready" && items.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: C.text3, fontSize: 13.5 }}>Everything looks well-placed.</div>
          )}
          {status === "ready" && items.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(it => {
                const state = resolved[it.entryId];
                return (
                  <div key={it.entryId} style={{ background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", opacity: state ? 0.55 : 1 }}>
                    <div style={{ fontSize: 13, color: C.entryText, lineHeight: 1.55, marginBottom: 8, whiteSpace: "pre-wrap" }}>{it.text}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: C.text2, marginBottom: it.reason ? 6 : 10, flexWrap: "wrap" }}>
                      <span style={{ color: C.text3 }}>{it.fromTitle}</span>
                      <ChevronRight size={12} color={C.text3} />
                      <span style={{ color: C.gold, fontWeight: 600 }}>{it.toTitle}</span>
                    </div>
                    {it.reason && <div style={{ fontSize: 11.5, color: C.text3, lineHeight: 1.5, marginBottom: 10 }}>{it.reason}</div>}
                    {state ? (
                      <div style={{ fontSize: 11.5, color: state === "applied" ? C.gold : C.text3, display: "flex", alignItems: "center", gap: 5 }}>
                        {state === "applied" ? <><Check size={12} /> Moved to {it.toTitle}</> : "Skipped"}
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => accept(it)} className="gold-btn" style={{ background: C.gold, border: "none", borderRadius: 6, color: C.onGold, fontSize: 11.5, padding: "5px 13px", cursor: "pointer", fontWeight: 500 }}>Move</button>
                        <button onClick={() => skip(it)} className="ghost" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.text2, fontSize: 11.5, padding: "5px 13px", cursor: "pointer" }}>Skip</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {status === "ready" && items.length > 0 && (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11.5, color: C.text3 }}>{pending} of {items.length} pending</span>
            <ActionButton onClick={onClose}>Done</ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────
function Sidebar({ threads, filtered, rootThreads, view, go, search, setSearch, setShowNew, inboxCount, homeAlertCount, collapsed, toggleCollapse, dragState, startThreadDrag, endThreadDrag, updateDropTarget, handleThreadDrop, openSettings, selectedThreadIds, toggleThreadSelection, clearSelection }) {
  const isDragging    = !!dragState.dragging;
  const isRootTarget  = dragState.target?.position === "root";

  return (
    <div style={{ width: 256, minWidth: 256, background: C.sb, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ padding: "56px 22px 18px", flexShrink: 0, WebkitAppRegion: "drag" }}>
        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 24, fontWeight: 400, letterSpacing: "0.01em", WebkitAppRegion: "no-drag" }}>Loom</div>
        <div style={{ fontSize: 10.5, color: C.text3, marginTop: 2, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, WebkitAppRegion: "no-drag" }}>Your threads</div>
      </div>

      <div style={{ padding: "0 14px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.overlay, border: `1px solid ${C.border}`, borderRadius: 9, padding: "7px 12px" }}>
          <Search size={12} color={C.text3} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter threads..." style={{ background: "transparent", border: "none", color: C.text, fontSize: 12.5, flex: 1 }} />
        </div>
      </div>

      <div style={{ padding: "2px 10px 0", flexShrink: 0 }}>
        <SbItem icon={Zap}   label="Home"     active={view === "home"}     onClick={() => go("home")} badge={homeAlertCount} badgeColor="#D67878" badgeBg="rgba(214,120,120,0.16)" />
        <SbItem icon={Clock} label="Timeline" active={view === "timeline"} onClick={() => go("timeline")} />
        <SbItem icon={Inbox} label="Inbox"    active={view === "inbox"}    onClick={() => go("inbox")} badge={inboxCount} badgeColor="#9E84BF" />
        <SbItem icon={FileText} label="Forms" active={view === "forms"}    onClick={() => go("forms")} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px 8px" }}>
        {/* Root-level drop zone — visible when dragging, lets you eject a thread from any parent */}
        <div
          className={`root-drop ${isDragging && isRootTarget ? "active" : ""}`}
          style={{
            fontSize: 9.5, color: isDragging ? (isRootTarget ? C.gold : C.text3) : C.text3,
            letterSpacing: "0.09em", textTransform: "uppercase",
            padding: "10px 10px 6px", fontWeight: 500,
            border: isDragging ? `1px dashed ${isRootTarget ? "rgba(200,165,100,0.4)" : C.dashed}` : "1px solid transparent",
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
            dragState={dragState} startThreadDrag={startThreadDrag} endThreadDrag={endThreadDrag}
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

function SbItem({ icon: Icon, label, active, onClick, badge, badgeColor, badgeBg }) {
  return (
    <div className={`s-item ${active ? "on" : ""}`} onClick={onClick} style={{ padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, marginBottom: 1, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Icon size={12} color={active ? C.gold : C.text3} />
        <span style={{ fontSize: 12.5, color: active ? C.text : C.text2, fontWeight: active ? 500 : 400 }}>{label}</span>
      </div>
      {badge > 0 && <span style={{ fontSize: 10, background: badgeBg || "rgba(158,132,191,0.15)", color: badgeColor || C.gold, padding: "2px 7px", borderRadius: 10, fontWeight: 500 }}>{badge}</span>}
    </div>
  );
}

function SbThreadTree({ thread, allThreads, view, go, depth, collapsed, toggleCollapse, dragState, startThreadDrag, endThreadDrag, updateDropTarget, handleThreadDrop, selectedThreadIds, toggleThreadSelection, clearSelection }) {
  const cfg      = TYPES[thread.type];
  const Icon     = cfg.icon;
  const on       = view === thread.id;
  const children = getChildren(allThreads, thread.id);
  const hasKids  = children.length > 0;
  const isOpen   = !collapsed.has(thread.id);
  const done     = thread.type === "board" ? thread.entries.filter(e => e.checked).length : null;
  const taskTotal = thread.type === "board" ? thread.entries.filter(e => e.subtype !== "note").length : thread.entries.length;

  const isDraggingThis = dragState.dragging === thread.id;
  const target         = dragState.target;
  const isDropBefore   = target?.id === thread.id && target.position === "before";
  const isDropAfter    = target?.id === thread.id && target.position === "after";
  const isDropInside   = target?.id === thread.id && target.position === "inside";
  const isSelected     = selectedThreadIds?.has(thread.id);

  // Pointer position when the drag began, used to tell a real drag from the
  // browser starting a phantom drag on a click that had a few px of jitter.
  const dragOrigin = useRef(null);
  // Last real pointer position seen during the drag. `dragend` in Chromium
  // frequently reports (0,0), so we can't trust its coordinates directly.
  const dragLast = useRef(null);

  const handleRowClick = (e) => {
    e.stopPropagation();
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleThreadSelection(thread.id);
      return;
    }
    clearSelection?.();
    go(thread.id);
    // Reveal sub-threads on open. Only ever expand here — collapsing stays the
    // arrow's job, so clicking an already-open thread doesn't fold it shut.
    if (hasKids && !isOpen) toggleCollapse(thread.id);
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    dragLast.current = { x: e.clientX, y: e.clientY };
    startThreadDrag(thread.id);
  };

  const handleDrag = (e) => {
    // `drag` fires continuously while dragging. Chromium sprinkles in (0,0)
    // events, so only remember positions that look real — this is the reliable
    // record of where the pointer actually ended up.
    if (e.clientX || e.clientY) dragLast.current = { x: e.clientX, y: e.clientY };
  };

  const handleDragEnd = (e) => {
    endThreadDrag?.();
    // A draggable element makes Chromium suppress the trailing `click` whenever
    // the pointer moved even a few px between press and release (trackpad
    // jitter). Recover that swallowed click: if this "drag" never really moved,
    // treat it as a click so a single press reliably opens the thread.
    const origin = dragOrigin.current;
    const last   = dragLast.current;
    dragOrigin.current = null;
    dragLast.current = null;
    if (!origin) return;
    // `dragend`'s own coordinates are unreliable (Chromium routinely reports
    // (0,0)), which would make a still click look like a big move and swallow
    // it. Measure against the last real pointer position instead.
    const end = (e.clientX || e.clientY) ? { x: e.clientX, y: e.clientY } : (last || origin);
    const moved = Math.abs(end.x - origin.x) + Math.abs(end.y - origin.y);
    if (moved < 5) handleRowClick(e);
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
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragOver={handleDragOver}
        onDrop={e => { e.stopPropagation(); handleThreadDrop(); }}
        onDragEnd={handleDragEnd}
        className={`s-item ${on ? "on" : ""} ${isDropInside ? "drop-inside" : ""} ${isDraggingThis ? "thread-dragging" : ""} ${isSelected ? "selected" : ""}`}
        style={{
          padding: "8px 10px", cursor: "grab", display: "flex", alignItems: "flex-start",
          gap: 0, marginBottom: 1, marginLeft: depth * 14, position: "relative",
          userSelect: "none",
          ...(isSelected ? { background: "rgba(200,165,100,0.14)", outline: `1px solid ${C.goldBorder}` } : null),
        }}
      >
        {depth > 0 && (
          <div style={{ position: "absolute", left: -10, top: 0, bottom: 0, width: 1, background: C.divider, pointerEvents: "none" }} />
        )}

        {hasKids ? (
          <button
            className="collapse-btn"
            onClick={e => { e.stopPropagation(); toggleCollapse(thread.id); }}
            aria-label={isOpen ? "Collapse" : "Expand"}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              width: 22, height: 17, marginLeft: -4, marginRight: 2,
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
                  ? `${done}/${taskTotal} done`
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
        <div style={{ borderLeft: `1px solid ${C.divider}`, marginLeft: depth * 14 + 18 }}>
          {children.map(child => (
            <SbThreadTree
              key={child.id} thread={child} allThreads={allThreads} view={view} go={go} depth={depth + 1}
              collapsed={collapsed} toggleCollapse={toggleCollapse}
              dragState={dragState} startThreadDrag={startThreadDrag} endThreadDrag={endThreadDrag}
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
function HomeView({ threads, rootThreads, go, setShowNew, addEntry, forms, onFillForm, onSkipForm, smartSortReady = false, onReview }) {
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

      <FormsDue forms={forms} threads={threads} onFill={onFillForm} onSkip={onSkipForm} />

      <SmartSurface threads={rootThreads} allThreads={threads} go={go} />

      <div style={{ animation: "fadeUp 0.45s 0.08s ease both", marginBottom: 56 }}>
        <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500 }}>Quick Capture</div>
            {smartSortReady && (
              <button
                onClick={onReview}
                className="ghost"
                title="Ask Claude to find entries that belong in a different thread"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.goldBorder}`, borderRadius: 7, color: C.gold, fontSize: 11.5, padding: "5px 11px", cursor: "pointer" }}
              >
                <Sparkles size={12} /> Review placements
              </button>
            )}
          </div>
          <textarea value={capture} onChange={e => setCapture(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doCapture(); } }}
            placeholder="Capture a thought -- goes straight to Inbox for triage later..."
            rows={3} style={{ width: "100%", background: "transparent", border: "none", color: C.text, fontSize: 15, lineHeight: 1.75, resize: "none", fontWeight: 300 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.divider}` }}>
            <span style={{ fontSize: 12, color: C.text3 }}>Enter to capture · Shift+Enter for new line</span>
            <button onClick={doCapture} className="gold-btn" style={{ background: capture.trim() ? C.gold : C.goldDim, border: "none", borderRadius: 8, color: capture.trim() ? C.onGold : C.text3, fontSize: 12.5, padding: "8px 18px", cursor: capture.trim() ? "pointer" : "default", fontWeight: 500 }}>Capture</button>
          </div>
        </div>
      </div>

      <div style={{ animation: "fadeUp 0.45s 0.16s ease both" }}>
        <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20, fontWeight: 500 }}>All Threads</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))", gap: 14 }}>
          {rootThreads.map((t, i) => <ThreadCard key={t.id} thread={t} threads={threads} go={go} i={i} />)}
          <div className="add-new t-card" onClick={() => setShowNew("root")} style={{ border: `1.5px dashed ${C.dashed}`, borderRadius: 16, padding: "26px 24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 130, color: C.text3, transition: "all 0.2s" }}>
            <Plus size={18} strokeWidth={1.5} />
            <span style={{ fontSize: 12.5 }}>New Thread</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Passive nudge on Home: one gold card per form whose schedule has come due
// (and isn't filled/skipped for this occurrence). Fill opens the in-app form;
// "Skip this time" clears the occurrence without writing entries.
function FormsDue({ forms, threads, onFill, onSkip }) {
  const due = (forms || []).filter(f => formIsDue(f, new Date()));
  if (due.length === 0) return null;
  return (
    <div style={{ animation: "fadeUp 0.45s 0.02s ease both", marginBottom: 28, display: "flex", flexDirection: "column", gap: 8 }}>
      {due.map(f => (
        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, background: C.surf, border: `1px solid ${C.gold}`, borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: C.goldDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ClipboardList size={15} color={C.gold} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: C.gold, fontWeight: 500 }}>{f.title || "Untitled form"}</span>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: "#D67878", background: "rgba(214,120,120,0.16)", padding: "2px 7px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <AlertCircle size={9} color="#D67878" /> Needs attention
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: C.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formScheduleSummary(f)}</div>
          </div>
          <button onClick={() => onFill(f.id)} className="gold-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, border: "none", borderRadius: 8, color: C.onGold, fontSize: 12, padding: "8px 14px", cursor: "pointer", fontWeight: 500, flexShrink: 0 }}>
            <Check size={12} /> Fill out
          </button>
          <button onClick={() => onSkip(f)}
            style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text3, fontSize: 12, padding: "8px 14px", cursor: "pointer", fontWeight: 500, flexShrink: 0 }}>
            Skip this time
          </button>
        </div>
      ))}
    </div>
  );
}

// The integer steps of a scale question (min..max, capped for sanity).
function scaleValues(q) {
  const min = Number.isFinite(Number(q.min)) ? Number(q.min) : 1;
  const max = Number.isFinite(Number(q.max)) ? Number(q.max) : 5;
  const lo = Math.min(min, max), hi = Math.max(min, max);
  const out = [];
  for (let v = lo; v <= hi && out.length < 21; v++) out.push(v);
  return out;
}

// ─────────────────────────────────────────────────────────────
// FORMS VIEW — manage forms (list, new, edit, fill, delete)
// ─────────────────────────────────────────────────────────────
function FormsView({ forms, threads, onNew, onEdit, onFill, onDelete }) {
  const threadName = (id) => {
    const t = threads.find(t => t.id === id);
    return t ? (t.id === "inbox" ? "Inbox" : t.title) : null;
  };
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "52px 64px 64px" }}>
      <div style={{ animation: "fadeUp 0.4s ease both", marginBottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'Cormorant', serif", fontSize: 36, fontWeight: 300, letterSpacing: "-0.01em" }}>Forms</div>
          <div style={{ fontSize: 12.5, color: C.text3, marginTop: 6 }}>Recurring check-ins that write answers straight into your threads.</div>
        </div>
        <button onClick={onNew} className="gold-btn" style={{ display: "flex", alignItems: "center", gap: 7, background: C.gold, border: "none", borderRadius: 10, color: C.onGold, fontSize: 13, padding: "10px 16px", cursor: "pointer", fontWeight: 500, flexShrink: 0 }}>
          <Plus size={14} /> New form
        </button>
      </div>

      {forms.length === 0 ? (
        <div style={{ animation: "fadeUp 0.4s 0.06s ease both", border: `1.5px dashed ${C.dashed}`, borderRadius: 16, padding: "48px 24px", textAlign: "center", color: C.text3 }}>
          <ClipboardList size={26} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.7 }} />
          <div style={{ fontSize: 13.5, marginBottom: 6, color: C.text2 }}>No forms yet</div>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>Build a form to capture recurring reflections, habit logs, or check-ins.</div>
        </div>
      ) : (
        <div style={{ animation: "fadeUp 0.4s 0.06s ease both", display: "flex", flexDirection: "column", gap: 12 }}>
          {forms.map((f, i) => {
            const due = formIsDue(f, new Date());
            const target = threadName(f.defaultThreadId);
            return (
              <div key={f.id} style={{ background: C.surf, border: `1px solid ${due ? C.gold : C.border}`, borderRadius: 14, padding: "18px 22px", animation: `fadeUp 0.24s ${Math.min(i, 6) * 0.02}s ease both` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: C.goldDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ClipboardList size={16} color={C.gold} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'Cormorant', serif", fontSize: 19, lineHeight: 1.3 }}>{f.title || "Untitled form"}</span>
                      {due && <span style={{ fontSize: 9.5, color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 5, padding: "2px 6px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Due</span>}
                    </div>
                    <div style={{ fontSize: 12, color: C.text3, marginTop: 5, display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
                      <span>{f.questions.length} question{f.questions.length === 1 ? "" : "s"}</span>
                      <span>· {formScheduleSummary(f)}</span>
                      <span>· {target ? `→ ${target}` : "→ Inbox (thread deleted)"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => onFill(f.id)} className="gold-btn" style={{ background: C.gold, border: "none", borderRadius: 8, color: C.onGold, fontSize: 12, padding: "7px 14px", cursor: "pointer", fontWeight: 500 }}>Fill out</button>
                    <ActionButton onClick={() => onEdit(f.id)}>Edit</ActionButton>
                    <button onClick={() => { loomConfirm({ title: "Delete form?", message: `Delete "${f.title || "Untitled form"}"? This can't be undone.` }).then(ok => { if (ok) onDelete(f.id); }); }} className="ghost" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: "#D67878", padding: 7, cursor: "pointer", display: "flex" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORM FILL — answer a form; on submit it becomes thread entries
// ─────────────────────────────────────────────────────────────
function FormFill({ form, threads, onSubmit, onClose }) {
  const [answers, setAnswers] = useState({});
  const [err, setErr] = useState(null);
  const [submitState, setSubmitState] = useState("idle"); // idle | submitting | done
  const submitTimer = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && submitState === "idle") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitState]);

  useEffect(() => () => clearTimeout(submitTimer.current), []);

  const setAns = (qid, val) => setAnswers(a => ({ ...a, [qid]: val }));
  const toggleMulti = (qid, opt) => setAnswers(a => {
    const cur = Array.isArray(a[qid]) ? a[qid] : [];
    return { ...a, [qid]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] };
  });

  const submit = () => {
    if (submitState !== "idle") return;
    const missing = form.questions.find(q => q.required && !isAnswered(q, answers[q.id]));
    if (missing) { setErr(`"${missing.label || "Untitled question"}" is required.`); return; }
    setErr(null);
    // Hold on a "Submitting…" → "Submitted ✓" beat so the action reads clearly
    // before the modal disappears (it used to just vanish with no feedback).
    setSubmitState("submitting");
    submitTimer.current = setTimeout(() => {
      setSubmitState("done");
      submitTimer.current = setTimeout(() => onSubmit(answers), 550);
    }, 260);
  };

  const inputStyle = { width: "100%", background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, padding: "11px 14px", fontWeight: 300 };

  return (
    <div onClick={e => { e.stopPropagation(); onClose(); }} style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 250, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: "92vw", maxHeight: "86vh", display: "flex", flexDirection: "column", background: C.surf, border: `1px solid ${C.border}`, borderRadius: 14, animation: "slideIn 0.22s ease both", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "22px 24px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontFamily: "'Cormorant', serif", fontSize: 23, fontWeight: 400 }}>{form.title || "Untitled form"}</div>
            <button onClick={onClose} className="ghost" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text3, padding: 6, borderRadius: 6, display: "flex" }}><X size={15} /></button>
          </div>
          {form.description && <div style={{ fontSize: 12.5, color: C.text3, lineHeight: 1.5 }}>{form.description}</div>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {form.questions.length === 0 && <div style={{ color: C.text3, fontSize: 12.5, textAlign: "center", padding: 20 }}>This form has no questions.</div>}
          {form.questions.map(q => {
            const val = answers[q.id];
            return (
              <div key={q.id}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 8 }}>
                  {q.label || "Untitled question"}{q.required && <span style={{ color: "#D67878", marginLeft: 4 }}>*</span>}
                </div>
                {q.type === "short_text" && <input value={val || ""} onChange={e => setAns(q.id, e.target.value)} style={inputStyle} />}
                {q.type === "long_text" && <textarea value={val || ""} onChange={e => setAns(q.id, e.target.value)} rows={3} style={{ ...inputStyle, resize: "none", lineHeight: 1.55 }} />}
                {q.type === "number" && <input type="number" value={val ?? ""} onChange={e => setAns(q.id, e.target.value)} style={inputStyle} />}
                {q.type === "single_select" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {(q.options || []).map(opt => (
                      <label key={opt} className="ghost" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: `1px solid ${val === opt ? C.goldBorder : C.border}`, background: val === opt ? C.goldDim : "transparent", borderRadius: 9, cursor: "pointer", fontSize: 13, color: val === opt ? C.gold : C.text2 }}>
                        <input type="radio" name={q.id} checked={val === opt} onChange={() => setAns(q.id, opt)} style={{ accentColor: C.gold }} /> {opt}
                      </label>
                    ))}
                    {(q.options || []).length === 0 && <span style={{ fontSize: 12, color: C.text3 }}>No options.</span>}
                  </div>
                )}
                {q.type === "multi_select" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {(q.options || []).map(opt => {
                      const on = Array.isArray(val) && val.includes(opt);
                      return (
                        <label key={opt} className="ghost" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: `1px solid ${on ? C.goldBorder : C.border}`, background: on ? C.goldDim : "transparent", borderRadius: 9, cursor: "pointer", fontSize: 13, color: on ? C.gold : C.text2 }}>
                          <input type="checkbox" checked={on} onChange={() => toggleMulti(q.id, opt)} style={{ accentColor: C.gold }} /> {opt}
                        </label>
                      );
                    })}
                    {(q.options || []).length === 0 && <span style={{ fontSize: 12, color: C.text3 }}>No options.</span>}
                  </div>
                )}
                {q.type === "scale" && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {scaleValues(q).map(nv => {
                      const on = Number(val) === nv;
                      return <button key={nv} onClick={() => setAns(q.id, nv)} style={{ width: 40, height: 40, borderRadius: 9, border: `1px solid ${on ? C.goldBorder : C.border}`, background: on ? C.gold : "transparent", color: on ? C.onGold : C.text2, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{nv}</button>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: "12px 24px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {err && <span style={{ fontSize: 11.5, color: "#E08A8A" }}>{err}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {submitState === "idle" && <ActionButton onClick={onClose}>Cancel</ActionButton>}
            <button
              onClick={submit}
              disabled={submitState !== "idle"}
              className="gold-btn"
              style={{
                background: submitState === "done" ? C.gold : (submitState === "submitting" ? C.goldDim : C.gold),
                border: "none", borderRadius: 8, color: submitState === "submitting" ? C.gold : C.onGold,
                fontSize: 12.5, padding: "8px 18px", fontWeight: 500,
                cursor: submitState === "idle" ? "pointer" : "default",
                display: "flex", alignItems: "center", gap: 6, minWidth: 96, justifyContent: "center",
                transition: "background 0.2s ease, color 0.2s ease",
              }}
            >
              {submitState === "idle" && "Submit"}
              {submitState === "submitting" && (<><Spinner color={C.gold} /> Submitting…</>)}
              {submitState === "done" && (<><span style={{ display: "inline-flex", animation: "popIn 0.25s ease both" }}><Check size={13} strokeWidth={2.5} /></span> Submitted</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORM EDITOR — build/edit a form (local draft, committed on Save)
// ─────────────────────────────────────────────────────────────
function FormEditor({ form, threads, onSave, onClose }) {
  const [draft, setDraft] = useState(() => form ? JSON.parse(JSON.stringify(form)) : blankForm());
  const [err, setErr] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const patch = (p) => setDraft(d => ({ ...d, ...p }));
  const patchSchedule = (p) => setDraft(d => ({ ...d, schedule: { ...d.schedule, ...p } }));
  const setQ = (idx, p) => setDraft(d => ({ ...d, questions: d.questions.map((q, i) => i === idx ? { ...q, ...p } : q) }));
  const addQuestion = () => setDraft(d => ({ ...d, questions: [...d.questions, { id: (Date.now() + d.questions.length).toString(), type: "short_text", label: "", required: false, options: [], min: 1, max: 5, threadId: null, subtype: "entry", placement: "reply", replyGroup: "" }] }));
  const removeQ = (idx) => setDraft(d => ({ ...d, questions: d.questions.filter((_, i) => i !== idx) }));
  const moveQ = (idx, dir) => setDraft(d => {
    const qs = [...d.questions]; const j = idx + dir;
    if (j < 0 || j >= qs.length) return d;
    [qs[idx], qs[j]] = [qs[j], qs[idx]];
    return { ...d, questions: qs };
  });

  const save = () => {
    if (!draft.title.trim()) return setErr("Give the form a title.");
    if (draft.questions.length === 0) return setErr("Add at least one question.");
    for (const q of draft.questions) {
      if (!q.label.trim()) return setErr("Every question needs a label.");
      if (QTYPES[q.type].hasOptions && (q.options || []).filter(o => o.trim()).length === 0) return setErr(`"${q.label}" needs at least one option.`);
      if (q.type === "scale" && Number(q.max) <= Number(q.min)) return setErr(`"${q.label}" scale max must be greater than min.`);
    }
    const clean = {
      ...draft, title: draft.title.trim(),
      questions: draft.questions.map(q => ({ ...q, label: q.label.trim(), options: (q.options || []).map(o => o.trim()).filter(Boolean) })),
    };
    onSave(clean);
  };

  const threadOptions = [threads.find(t => t.id === "inbox"), ...threads.filter(t => t.id !== "inbox")].filter(Boolean);
  const selectStyle = { background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text2, fontSize: 12.5, padding: "7px 10px", cursor: "pointer" };
  const inputStyle = { width: "100%", background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 13.5, padding: "10px 13px", fontWeight: 300 };
  const perQuestion = draft.grouping === "per-question";

  return (
    <div onClick={e => { e.stopPropagation(); onClose(); }} style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 250, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 600, maxWidth: "94vw", maxHeight: "90vh", display: "flex", flexDirection: "column", background: C.surf, border: `1px solid ${C.border}`, borderRadius: 14, animation: "slideIn 0.22s ease both", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "20px 24px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Cormorant', serif", fontSize: 23, fontWeight: 400 }}>{form ? "Edit form" : "New form"}</div>
          <button onClick={onClose} className="ghost" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text3, padding: 6, borderRadius: 6, display: "flex" }}><X size={15} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          <input value={draft.title} onChange={e => patch({ title: e.target.value })} placeholder="Form title..." style={{ ...inputStyle, marginBottom: 10 }} />
          <textarea value={draft.description} onChange={e => patch({ description: e.target.value })} placeholder="Description (optional)..." rows={2} style={{ ...inputStyle, marginBottom: 18, resize: "none", fontStyle: "italic", lineHeight: 1.5 }} />

          <SettingsSection label="Answers → entries">
            <SettingsRow label="Default thread" hint="Where answers are written (per-question can override below)">
              <select value={draft.defaultThreadId} onChange={e => patch({ defaultThreadId: e.target.value })} className="move-select" style={selectStyle}>
                {threadOptions.map(t => <option key={t.id} value={t.id}>{t.id === "inbox" ? "Inbox" : t.title}</option>)}
              </select>
            </SettingsRow>
            <SettingsRow label="Format" hint={GROUPINGS[draft.grouping].hint}>
              <SegSelect value={draft.grouping} onChange={v => patch({ grouping: v })} options={Object.entries(GROUPINGS).map(([value, g]) => ({ value, label: g.label }))} />
            </SettingsRow>
            <SettingsRow label="Prefix answers with the question" hint='e.g. "Mood: 7" vs just "7"'>
              <ToggleSwitch checked={draft.includeQuestionLabel} onChange={v => patch({ includeQuestionLabel: v })} />
            </SettingsRow>
            {!perQuestion && (
              <SettingsRow label="Header line" hint={draft.grouping === "parent-replies" ? "Prefixes the body (or is the parent if no Body question)" : "First line of the entry"}>
                <input value={draft.headerTemplate || ""} onChange={e => patch({ headerTemplate: e.target.value })} placeholder={draft.title || "Form response"} style={{ ...selectStyle, color: C.text, width: 180 }} />
              </SettingsRow>
            )}
          </SettingsSection>

          <SettingsSection label="Reminder schedule">
            <SettingsRow label="Repeat" hint="When this form's card appears on Home">
              <SegSelect
                value={draft.schedule ? draft.schedule.cadence : "none"}
                onChange={v => v === "none"
                  ? patch({ schedule: null })
                  : patch({ schedule: { cadence: v, daysOfWeek: draft.schedule?.daysOfWeek || [0], dayOfMonth: draft.schedule?.dayOfMonth || 1, time: draft.schedule?.time || "09:00" } })}
                options={[{ value: "none", label: "Off" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }]}
              />
            </SettingsRow>
            {draft.schedule?.cadence === "weekly" && (
              <SettingsRow label="On days">
                <div style={{ display: "flex", gap: 4 }}>
                  {WEEKDAYS.map((wd, di) => {
                    const on = (draft.schedule.daysOfWeek || []).includes(di);
                    return <button key={di} title={wd} onClick={() => { const set = new Set(draft.schedule.daysOfWeek || []); set.has(di) ? set.delete(di) : set.add(di); patchSchedule({ daysOfWeek: [...set] }); }} style={{ width: 32, height: 30, borderRadius: 7, fontSize: 11, fontWeight: 500, border: `1px solid ${on ? C.goldBorder : C.border}`, background: on ? C.goldDim : "transparent", color: on ? C.gold : C.text3, cursor: "pointer" }}>{wd[0]}</button>;
                  })}
                </div>
              </SettingsRow>
            )}
            {draft.schedule?.cadence === "monthly" && (
              <SettingsRow label="Day of month" hint="1–31 (clamped to the month's length)">
                <input type="number" min={1} max={31} value={draft.schedule.dayOfMonth} onChange={e => patchSchedule({ dayOfMonth: Math.max(1, Math.min(31, Number(e.target.value) || 1)) })} style={{ ...selectStyle, color: C.text, width: 64 }} />
              </SettingsRow>
            )}
            {draft.schedule && (
              <SettingsRow label="Time of day" hint="It surfaces at/after this time">
                <input type="time" value={draft.schedule.time} onChange={e => patchSchedule({ time: e.target.value })} style={{ ...selectStyle, color: C.text }} />
              </SettingsRow>
            )}
          </SettingsSection>

          <div style={{ marginBottom: 10, fontSize: 10.5, color: C.text3, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>Questions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {draft.questions.map((q, idx) => (
              <QuestionEditor key={q.id} q={q} idx={idx} total={draft.questions.length} grouping={draft.grouping} threadOptions={threadOptions}
                onChange={(p) => setQ(idx, p)} onMove={(dir) => moveQ(idx, dir)} onRemove={() => removeQ(idx)} inputStyle={inputStyle} selectStyle={selectStyle} />
            ))}
          </div>
          <button onClick={addQuestion} className="ghost" style={{ marginTop: 10, width: "100%", border: `1.5px dashed ${C.dashed}`, borderRadius: 10, padding: "12px", color: C.text3, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent" }}>
            <Plus size={14} /> Add question
          </button>
        </div>

        <div style={{ padding: "12px 24px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {err && <span style={{ fontSize: 11.5, color: "#E08A8A" }}>{err}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <ActionButton onClick={onClose}>Cancel</ActionButton>
            <button onClick={save} className="gold-btn" style={{ background: C.gold, border: "none", borderRadius: 8, color: C.onGold, fontSize: 12.5, padding: "8px 18px", cursor: "pointer", fontWeight: 500 }}>{form ? "Save" : "Create form"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// One question row inside the FormEditor.
function QuestionEditor({ q, idx, total, grouping, threadOptions, onChange, onMove, onRemove, inputStyle, selectStyle }) {
  const cfg = QTYPES[q.type];
  const perQuestion  = grouping === "per-question";
  const parentReplies = grouping === "parent-replies";
  const isBody = q.placement === "body";
  const addOption    = () => onChange({ options: [...(q.options || []), ""] });
  const setOption    = (i, v) => onChange({ options: (q.options || []).map((o, oi) => oi === i ? v : o) });
  const removeOption = (i) => onChange({ options: (q.options || []).filter((_, oi) => oi !== i) });
  const iconBtn = (extra) => ({ background: "transparent", border: "none", padding: 4, display: "flex", ...extra });
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", background: C.surf2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: cfg.hasOptions || cfg.isScale ? 10 : 10 }}>
        <span style={{ fontSize: 11, color: C.text3, fontWeight: 600, width: 18, flexShrink: 0 }}>{idx + 1}.</span>
        <input value={q.label} onChange={e => onChange({ label: e.target.value })} placeholder="Question..." style={{ ...inputStyle, flex: 1, padding: "8px 11px" }} />
        <select value={q.type} onChange={e => onChange({ type: e.target.value })} className="move-select" style={selectStyle}>
          {Object.entries(QTYPES).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
        <button onClick={() => onMove(-1)} disabled={idx === 0} className="ghost" style={iconBtn({ cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? C.text3 : C.text2, opacity: idx === 0 ? 0.4 : 1 })}><ArrowUp size={13} /></button>
        <button onClick={() => onMove(1)} disabled={idx === total - 1} className="ghost" style={iconBtn({ cursor: idx === total - 1 ? "default" : "pointer", color: idx === total - 1 ? C.text3 : C.text2, opacity: idx === total - 1 ? 0.4 : 1 })}><ArrowDown size={13} /></button>
        <button onClick={onRemove} className="ghost" style={iconBtn({ cursor: "pointer", color: "#D67878" })}><X size={14} /></button>
      </div>

      {cfg.hasOptions && (
        <div style={{ paddingLeft: 26, marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {(q.options || []).map((opt, oi) => (
            <div key={oi} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: C.text3, fontSize: 12 }}>•</span>
              <input value={opt} onChange={e => setOption(oi, e.target.value)} placeholder={`Option ${oi + 1}`} style={{ ...inputStyle, flex: 1, padding: "6px 10px", fontSize: 12.5 }} />
              <button onClick={() => removeOption(oi)} className="ghost" style={iconBtn({ cursor: "pointer", color: C.text3 })}><X size={12} /></button>
            </div>
          ))}
          <button onClick={addOption} className="ghost" style={{ alignSelf: "flex-start", background: "transparent", border: "none", color: C.gold, fontSize: 12, cursor: "pointer", padding: "2px 4px" }}>+ Add option</button>
        </div>
      )}

      {cfg.isScale && (
        <div style={{ paddingLeft: 26, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 12, color: C.text3, display: "flex", alignItems: "center", gap: 6 }}>Min <input type="number" value={q.min ?? 1} onChange={e => onChange({ min: Number(e.target.value) })} style={{ ...selectStyle, color: C.text, width: 56 }} /></label>
          <label style={{ fontSize: 12, color: C.text3, display: "flex", alignItems: "center", gap: 6 }}>Max <input type="number" value={q.max ?? 5} onChange={e => onChange({ max: Number(e.target.value) })} style={{ ...selectStyle, color: C.text, width: 56 }} /></label>
        </div>
      )}

      <div style={{ paddingLeft: 26, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <label style={{ fontSize: 12, color: C.text2, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
          <input type="checkbox" checked={!!q.required} onChange={e => onChange({ required: e.target.checked })} style={{ accentColor: C.gold }} /> Required
        </label>
        {perQuestion && (
          <>
            <label style={{ fontSize: 12, color: C.text3, display: "flex", alignItems: "center", gap: 6 }}>
              Route to
              <select value={q.threadId || ""} onChange={e => onChange({ threadId: e.target.value || null })} className="move-select" style={selectStyle}>
                <option value="">(form default)</option>
                {threadOptions.map(t => <option key={t.id} value={t.id}>{t.id === "inbox" ? "Inbox" : t.title}</option>)}
              </select>
            </label>
            <SegSelect value={q.subtype || "entry"} onChange={v => onChange({ subtype: v })} options={[{ value: "entry", label: "Entry" }, { value: "note", label: "Note" }]} />
          </>
        )}
        {parentReplies && (
          <>
            <SegSelect value={isBody ? "body" : "reply"} onChange={v => onChange({ placement: v })} options={[{ value: "body", label: "Body" }, { value: "reply", label: "Reply" }]} />
            {!isBody && (
              <label style={{ fontSize: 12, color: C.text3, display: "flex", alignItems: "center", gap: 6 }} title="Questions sharing a group label combine into one reply">
                Group
                <input value={q.replyGroup || ""} onChange={e => onChange({ replyGroup: e.target.value })} placeholder="(own reply)" style={{ ...selectStyle, color: C.text, width: 110 }} />
              </label>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SmartSurface({ threads, allThreads, go }) {
  const items = [];
  // Overdue / due-soon board entries across ALL threads (time-sensitive → first).
  (allThreads || threads).filter(t => t.type === "board" && t.id !== "inbox").forEach(t => {
    t.entries.forEach(e => {
      if (e.checked || e.subtype === "note" || !e.dueDate) return;
      const diff = dueDayDiff(e.dueDate);
      if (diff === null || diff > 7) return; // only overdue or within a week
      items.push({ kind: "due", thread: t, entry: e, diff });
    });
  });
  items.sort((a, b) => a.diff - b.diff); // most overdue first (only due items present here)
  threads.filter(t => t.type === "board").forEach(t => {
    const pending = t.entries.filter(e => !e.checked && e.subtype !== "note");
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
        {items.map((item, i) => {
          if (item.kind === "due") {
            const overdue = item.diff < 0;
            const accent  = overdue ? "#D67878" : C.gold;
            return (
              <div key={i} className="attn-card" onClick={() => go(item.thread.id)} style={{ display: "flex", alignItems: "center", gap: 14, background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: TYPES.board.bg, border: `1px solid ${TYPES.board.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Calendar size={15} color={accent} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    {overdue && (
                      <span style={{ fontSize: 9.5, fontWeight: 600, color: "#D67878", background: "rgba(214,120,120,0.16)", padding: "2px 7px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <AlertCircle size={9} color="#D67878" /> Overdue
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: accent, fontWeight: 500 }}>
                      {overdue ? item.thread.title : `${item.diff === 0 ? "Due today" : formatDue(item.entry.dueDate)} · ${item.thread.title}`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.entry.text}</div>
                </div>
                <ChevronRight size={14} color={C.text3} />
              </div>
            );
          }
          return (
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
          );
        })}
      </div>
    </div>
  );
}

// Count overdue board tasks in a thread and all of its descendant threads, so a
// root card surfaces work buried in sub-threads too.
function overdueInSubtree(threads, thread) {
  let n = 0;
  if (thread.type === "board") {
    n += thread.entries.filter(e => {
      if (e.checked || e.subtype === "note" || !e.dueDate) return false;
      const diff = dueDayDiff(e.dueDate);
      return diff !== null && diff < 0;
    }).length;
  }
  for (const c of getChildren(threads, thread.id)) n += overdueInSubtree(threads, c);
  return n;
}

function ThreadCard({ thread, threads, go, i }) {
  const cfg      = TYPES[thread.type];
  const Icon     = cfg.icon;
  const last     = thread.entries[thread.entries.length - 1];
  const isBoardT = thread.type === "board";
  const done     = isBoardT ? thread.entries.filter(e => e.checked).length : null;
  const total    = isBoardT ? thread.entries.filter(e => e.subtype !== "note").length : thread.entries.length;
  const children = getChildren(threads, thread.id);
  const overdue  = overdueInSubtree(threads, thread);
  return (
    <div className="t-card" onClick={() => go(thread.id)} style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 24px", cursor: "pointer", animation: `fadeUp 0.24s ${Math.min(i, 5) * 0.02}s ease both` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "4px 10px" }}>
          <Icon size={10} color={cfg.color} />
          <span style={{ fontSize: 10, color: cfg.color, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{cfg.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {overdue > 0 && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "#D67878", background: "rgba(214,120,120,0.16)", padding: "2px 8px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertCircle size={10} color="#D67878" /> {overdue} overdue
            </span>
          )}
          <span style={{ fontSize: 10.5, color: C.text3 }}>{done !== null ? `${done}/${total} done` : `${total} entries`}</span>
        </div>
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
          <div style={{ flex: 1, height: 2, background: C.track, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: cfg.color, opacity: 0.7 }} />
          </div>
        )}
        {done === null && <div style={{ flex: 1 }} />}
        <span style={{ fontSize: 10, color: C.text3 }}>{formatTimestamp(thread.updatedAt)}</span>
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
                    <div style={{ fontSize: 13.5, color: e.subtype === "note" ? C.text3 : C.entryText, lineHeight: 1.65, fontStyle: e.subtype === "note" ? "italic" : "normal", fontWeight: 300, whiteSpace: "pre-wrap" }}>{e.text}</div>
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
// ─── DISPLAY MODE TOGGLE (per-thread entry layout) ───
function DisplayModeToggle({ mode, onChange, accent }) {
  const modes = [
    { key: "list",    icon: List,      label: "List view" },
    { key: "compact", icon: AlignLeft, label: "Compact view" },
  ];
  return (
    <div style={{ display: "flex", gap: 2, background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 2 }}>
      {modes.map(m => {
        const on = mode === m.key;
        const Icon = m.icon;
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            title={m.label}
            className="ghost"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "4px 9px", borderRadius: 6, border: "none", cursor: "pointer",
              background: on ? accent + "22" : "transparent",
              color: on ? accent : C.text3, transition: "all 0.15s",
            }}
          >
            <Icon size={12.5} />
          </button>
        );
      })}
    </div>
  );
}

// Sort entries by date. "manual" keeps array order (drag-reorderable); asc = oldest first, desc = newest first.
function SortOrderToggle({ order, onChange, accent }) {
  const opts = [
    { key: "manual", icon: GripVertical, label: "Manual order (drag to reorder)" },
    { key: "asc",    icon: ArrowUp,      label: "Oldest first" },
    { key: "desc",   icon: ArrowDown,    label: "Newest first" },
  ];
  const active = order === "asc" || order === "desc" ? order : "manual";
  return (
    <div style={{ display: "flex", gap: 2, background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 2 }}>
      {opts.map(o => {
        const on = active === o.key;
        const Icon = o.icon;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            title={o.label}
            className="ghost"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "4px 9px", borderRadius: 6, border: "none", cursor: "pointer",
              background: on ? accent + "22" : "transparent",
              color: on ? accent : C.text3, transition: "all 0.15s",
            }}
          >
            <Icon size={12.5} />
          </button>
        );
      })}
    </div>
  );
}

function ThreadView({ thread, threads, go, setShowNew, addEntry, addEntries, updateEntry, toggleCheck, pinEntry, setDueDate, setEntryDate, deleteEntry, moveEntry, reorderEntries, renameThread, setThreadDescription, setThreadDisplayMode, setThreadSortOrder, deleteThread, selectedEntryIds, toggleEntrySelection, showDoneDefault = false, smartSortReady = false }) {
  const cfg      = TYPES[thread.type];
  const Icon     = cfg.icon;
  const isBoard  = thread.type === "board";
  const isInbox  = thread.id === "inbox";
  const taRef    = useRef(null);
  const [entryText, setEntryText]       = useState("");
  const [editingId, setEditingId]       = useState(null);
  const [replyingTo, setReplyingTo]     = useState(null);
  const [entrySubtype, setEntrySubtype] = useState("entry");
  const [showBulk, setShowBulk]         = useState(false);
  const [showDone, setShowDone]         = useState(showDoneDefault);
  const [dragId, setDragId]             = useState(null);
  const [dropId, setDropId]             = useState(null);
  const [dropPos, setDropPos]           = useState("before"); // "before" | "after" the dropId row
  const [dropRoot, setDropRoot]         = useState(false);    // hovering the "eject to top level" zone
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(thread.title);
  const [editingDesc, setEditingDesc]   = useState(false);
  const [descDraft, setDescDraft]       = useState(thread.description || "");

  useEffect(() => { setTitleDraft(thread.title); setEditingTitle(false); }, [thread.id, thread.title]);
  useEffect(() => { setDescDraft(thread.description || ""); setEditingDesc(false); }, [thread.id, thread.description]);

  const commitTitle = () => {
    const next = titleDraft.trim();
    if (next && next !== thread.title) renameThread(thread.id, next);
    else setTitleDraft(thread.title);
    setEditingTitle(false);
  };

  const commitDescription = () => {
    const next = descDraft.trim();
    const prev = (thread.description || "").trim();
    if (next !== prev) setThreadDescription(thread.id, next);
    setEditingDesc(false);
  };

  const handleDeleteThread = () => {
    if (thread.id === "inbox") return;
    const kidCount = getChildren(threads, thread.id).length;
    const msg = kidCount > 0
      ? `Delete "${thread.title}"? Its ${kidCount} sub-thread${kidCount > 1 ? "s" : ""} will move up one level.`
      : `Delete "${thread.title}"? This can't be undone.`;
    loomConfirm({ title: "Delete thread?", message: msg }).then(ok => { if (ok) deleteThread(thread.id); });
  };

  const displayMode = thread.displayMode === "compact" ? "compact" : "list";   // per-thread: "list" | "compact"
  const sortOrder = thread.sortOrder === "asc" || thread.sortOrder === "desc" ? thread.sortOrder : null; // null = manual (array order)
  const listContainerStyle = { display: "flex", flexDirection: "column" };

  // Date sort: dateISO is authoritative; tie-break by id (creation order). reverse() of the
  // ascending sort yields desc with ties broken newest-first too.
  const byField = (field) => (a, b) => {
    const va = a[field] || "", vb = b[field] || "";
    if (va !== vb) return va < vb ? -1 : 1;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  };
  const sortBy = (arr, field) => {
    if (!sortOrder) return arr;                       // manual: keep array order
    const asc = [...arr].sort(byField(field));
    return sortOrder === "desc" ? asc.reverse() : asc;
  };

  const done      = isBoard ? thread.entries.filter(e => e.checked).length : null;
  const total     = isBoard ? thread.entries.filter(e => e.subtype !== "note").length : thread.entries.length;
  const children  = getChildren(threads, thread.id);
  const ancestors = buildAncestors(threads, thread.id);
  const otherThreads = threads.filter(t => t.id !== thread.id);

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

  const handleBulkAdd = (raw) => {
    const items = parseBulkEntries(raw);
    if (!items.length) return;
    addEntries(thread.id, items, entrySubtype);
    setShowBulk(false);
  };

  // Reorder is only allowed within a sibling group: two top-level entries, or two
  // replies of the same parent. Prevents a drag from silently re-parenting an entry.
  const sameSiblings = (aId, bId) => {
    const a = thread.entries.find(e => e.id === aId);
    const b = thread.entries.find(e => e.id === bId);
    return a && b && (a.parentEntryId || null) === (b.parentEntryId || null);
  };
  const canDropOn = (targetId) => !!dragId && dragId !== targetId && sameSiblings(dragId, targetId);
  const endDrag = () => { setDragId(null); setDropId(null); setDropRoot(false); };

  // The reply currently being dragged, if any — a top-level entry can't be "ejected".
  const draggedEntry  = dragId ? thread.entries.find(e => e.id === dragId) : null;
  const draggingReply = !!draggedEntry?.parentEntryId;

  const handleDrop = (targetId, pos) => {
    if (!canDropOn(targetId)) { endDrag(); return; }
    const entries = [...thread.entries];
    const [moved] = entries.splice(entries.findIndex(e => e.id === dragId), 1);
    // Recompute the target index AFTER removal, then land just before/after it.
    let to = entries.findIndex(e => e.id === targetId);
    if (pos === "after") to += 1;
    entries.splice(to, 0, moved);
    reorderEntries(thread.id, entries);
    endDrag();
  };

  // Eject a reply out of its parent so it becomes a top-level entry. Lands at the
  // end of the array (top-level entries render in array order under manual sort).
  const handleEjectToRoot = () => {
    if (!draggingReply) { endDrag(); return; }
    const entries = [...thread.entries];
    const [moved] = entries.splice(entries.findIndex(e => e.id === dragId), 1);
    entries.push({ ...moved, parentEntryId: null });
    reorderEntries(thread.id, entries);
    endDrag();
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
    const live = activeEntries.filter(e => !e.checked);
    if (sortOrder) {
      // Pinned float to the very top, then due-dated tasks, then the rest — each group
      // sorted by date (due-dated by their dueDate so the nearest deadline leads).
      const pinned = sortBy(live.filter(e => e.pinned), "dateISO");
      const due    = sortBy(live.filter(e => !e.pinned && e.dueDate), "dueDate");
      const rest   = sortBy(live.filter(e => !e.pinned && !e.dueDate), "dateISO");
      activeEntries = [...pinned, ...due, ...rest];
    } else {
      const pinned   = live.filter(e => e.pinned);
      const unpinned = live.filter(e => !e.pinned);
      activeEntries  = [...pinned, ...unpinned];
    }
    doneEntries = sortBy(thread.entries.filter(e => e.checked && !e.parentEntryId), "dateISO");
  } else {
    activeEntries = sortBy(activeEntries, "dateISO");
  }

  const sharedEntryProps = {
    type: thread.type, cfg, threadId: thread.id,
    toggleCheck, pinEntry, setDueDate, setEntryDate, deleteEntry, updateEntry,
    editingId, setEditingId,
    onReply: (entry) => { setReplyingTo(entry); setTimeout(() => taRef.current?.focus(), 0); },
    isBoard, isInbox, otherThreads, allThreads: threads, moveEntry,
    childrenOf, layout: displayMode,
    selectedEntryIds, toggleEntrySelection,
    smartSortReady,
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
                  <div style={{ width: 60, height: 2, background: C.track, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: cfg.color, opacity: 0.75 }} />
                  </div>
                  <span style={{ fontSize: 10.5, color: C.text3 }}>{Math.round((done / total) * 100)}%</span>
                </div>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <SortOrderToggle order={sortOrder} onChange={(o) => setThreadSortOrder(thread.id, o)} accent={cfg.color} />
                <DisplayModeToggle mode={displayMode} onChange={(m) => setThreadDisplayMode(thread.id, m)} accent={cfg.color} />
              </div>
            </div>
            {!isInbox && (editingDesc ? (
              <textarea
                autoFocus
                value={descDraft}
                onChange={e => setDescDraft(e.target.value)}
                onBlur={commitDescription}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commitDescription(); }
                  if (e.key === "Escape") { setDescDraft(thread.description || ""); setEditingDesc(false); }
                }}
                placeholder="Describe what this thread is for..."
                rows={3}
                style={{
                  display: "block", width: "100%", marginTop: 12,
                  background: C.surf, border: `1px solid ${C.goldBorder}`, borderRadius: 8,
                  color: C.text2, fontSize: 13, padding: "10px 12px",
                  fontFamily: "'DM Sans', sans-serif", fontStyle: "italic",
                  resize: "none", lineHeight: 1.55, fontWeight: 300,
                }}
              />
            ) : thread.description ? (
              <div
                onClick={() => setEditingDesc(true)}
                title="Click to edit description"
                style={{
                  marginTop: 12, fontSize: 13.5, color: C.text2, lineHeight: 1.55,
                  fontStyle: "italic", fontWeight: 300, cursor: "text",
                  whiteSpace: "pre-wrap",
                }}
              >{thread.description}</div>
            ) : (
              <button
                onClick={() => setEditingDesc(true)}
                className="ghost"
                style={{
                  marginTop: 10, background: "transparent", border: "none",
                  cursor: "pointer", color: C.text3, fontSize: 12,
                  padding: "2px 0", fontFamily: "'DM Sans', sans-serif",
                  fontStyle: "italic", textAlign: "left",
                }}
              >+ Add description</button>
            ))}
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

        {/* Eject-to-root zone — only while dragging a reply; drop here to pull it out
            of its parent and make it a top-level entry. */}
        {draggingReply && (
          <div
            className={`root-drop ${dropRoot ? "active" : ""}`}
            style={{
              padding: "9px 12px", fontSize: 11, textAlign: "center",
              color: dropRoot ? C.gold : C.text3,
              border: `1px dashed ${dropRoot ? "rgba(200,165,100,0.4)" : C.dashed}`,
              marginBottom: 10, cursor: "copy",
            }}
            onDragOver={e => { e.preventDefault(); setDropRoot(true); }}
            onDragLeave={() => setDropRoot(false)}
            onDrop={handleEjectToRoot}
          >
            Drop here to make a top-level entry
          </div>
        )}

        <div style={listContainerStyle}>
          {activeEntries.map((e, i) => (
            <EntryTreeNode
              key={e.id} entry={e} i={i} depth={0}
              canDrag={!sortOrder} dragId={dragId} dropId={dropId} dropPos={dropPos}
              onDragStartId={(id) => setDragId(id)}
              onDragOverId={(id, ev) => {
                ev.preventDefault();
                if (!canDropOn(id)) { setDropId(null); return; }
                const r = ev.currentTarget.getBoundingClientRect();
                setDropId(id);
                setDropPos(ev.clientY < r.top + r.height / 2 ? "before" : "after");
              }}
              onDropId={(id, ev) => {
                const r = ev.currentTarget.getBoundingClientRect();
                handleDrop(id, ev.clientY < r.top + r.height / 2 ? "before" : "after");
              }}
              onDragEnd={endDrag}
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
              <div style={{ opacity: 0.6, ...listContainerStyle }}>
                {doneEntries.map((e, i) => (
                  <EntryTreeNode key={e.id} entry={e} i={i} depth={0} canDrag={false} dragId={null} dropId={null} onDragStartId={() => {}} onDragOverId={() => {}} onDropId={() => {}} onDragEnd={() => {}} {...sharedEntryProps} />
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
          <button className="subtype-toggle" onClick={() => setEntrySubtype("note")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, border: `1px solid ${entrySubtype === "note" ? C.text3 : C.border}`, background: entrySubtype === "note" ? C.overlay : "transparent", cursor: "pointer", color: entrySubtype === "note" ? C.text2 : C.text3, fontSize: 11, fontWeight: 500 }}>
            <AlignLeft size={10} /> Note
          </button>
          <button className="subtype-toggle" onClick={() => setShowBulk(true)} title="Paste a list — one entry per line" style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", color: C.text3, fontSize: 11, fontWeight: 500, marginLeft: "auto" }}>
            <List size={10} /> Bulk add
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
          <textarea ref={taRef} value={entryText} onChange={e => setEntryText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
            placeholder={placeholder} rows={2}
            style={{ flex: 1, background: C.surf, border: `1px solid ${replyingTo ? cfg.color + "30" : C.border}`, borderRadius: 12, color: C.text, fontSize: 14, padding: "14px 18px", resize: "none", lineHeight: 1.65, fontWeight: 300, fontStyle: entrySubtype === "note" ? "italic" : "normal", transition: "border-color 0.2s" }}
          />
          <button onClick={handleAdd} className="gold-btn" style={{ background: entryText.trim() ? C.gold : C.goldDim, border: "none", borderRadius: 12, color: entryText.trim() ? C.onGold : C.text3, padding: "0 26px", cursor: entryText.trim() ? "pointer" : "default", fontWeight: 500, fontSize: 13.5, flexShrink: 0 }}>
            {replyingTo ? "Reply" : "Add"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 8, paddingLeft: 2 }}>Enter to add · Shift+Enter for new line</div>
      </div>
      {showBulk && (
        <BulkAddModal thread={thread} cfg={cfg} isBoard={isBoard} onAdd={handleBulkAdd} onClose={() => setShowBulk(false)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BULK ADD MODAL — paste a list, one entry per line
// ─────────────────────────────────────────────────────────────
function BulkAddModal({ thread, cfg, isBoard, onAdd, onClose }) {
  const ref = useRef(null);
  const [raw, setRaw] = useState("");
  useEffect(() => { ref.current?.focus(); }, []);
  const parsed  = parseBulkEntries(raw);
  const count   = parsed.length;
  const checked = parsed.filter(p => p.checked).length;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.modalSurf, border: `1px solid ${C.border}`, borderRadius: 18, padding: "32px", width: 520, animation: "slideIn 0.22s ease both", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Cormorant', serif", fontSize: 24, fontWeight: 400 }}>Bulk add</div>
          <button className="ghost" onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 7, display: "flex" }}>
            <X size={15} color={C.text2} />
          </button>
        </div>
        <div style={{ fontSize: 12.5, color: C.text3, marginBottom: 18, lineHeight: 1.5 }}>
          Paste a list into <span style={{ color: cfg.color, fontWeight: 500 }}>{thread.title.length > 30 ? thread.title.slice(0, 30) + "…" : thread.title}</span> — one entry per line.
          Bullets are stripped{isBoard ? "; " : "."}{isBoard && <><code style={{ fontSize: 11.5, color: C.text2 }}>- [x]</code> items are added as done.</>}
        </div>
        <textarea ref={ref} value={raw} onChange={e => setRaw(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onAdd(raw); } }}
          placeholder={"- [x] First thing\n- [ ] Second thing\n- Third thing"} rows={10}
          style={{ width: "100%", background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13.5, padding: "13px 16px", marginBottom: 16, fontWeight: 300, resize: "vertical", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: C.text3, flex: 1 }}>
            {count === 0 ? "Nothing to add yet" : `${count} ${count === 1 ? "entry" : "entries"}${isBoard && checked ? ` · ${checked} done` : ""}`}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text2, fontSize: 13, padding: "10px 18px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onAdd(raw)} disabled={count === 0} className="gold-btn" style={{ background: count ? C.gold : C.goldDim, border: "none", borderRadius: 10, color: count ? C.onGold : C.text3, fontSize: 13.5, padding: "10px 22px", fontWeight: 600, cursor: count ? "pointer" : "default" }}>
            Add {count || ""}
          </button>
        </div>
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
          <button onClick={() => setShowNew(parentThread.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px dashed ${C.dashed}`, borderRadius: 8, color: C.text3, fontSize: 12, padding: "7px 14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
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
          const childTotal = child.type === "board" ? child.entries.filter(e => e.subtype !== "note").length : child.entries.length;
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
                {done !== null ? `${done}/${childTotal} done` : `${child.entries.length} entries`}
              </div>
              {done !== null && childTotal > 0 && (
                <div style={{ marginTop: 8, height: 2, background: C.track, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(done / childTotal) * 100}%`, background: cfg.color, opacity: 0.7 }} />
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
function EntryTreeNode({ entry, depth, i, childrenOf, layout = "list", canDrag, dragId, dropId, dropPos, onDragStartId, onDragOverId, onDropId, onDragEnd, ...rowProps }) {
  const replies = childrenOf[entry.id] || [];
  const lineColor = rowProps.cfg.color;
  const [collapsed, setCollapsed] = useState(false);
  const dragProps = {
    canDrag, dragId, dropId, dropPos, onDragStartId, onDragOverId, onDropId, onDragEnd,
  };
  return (
    <div>
      <EntryRow
        entry={entry} depth={depth} i={i} layout={layout}
        draggable={canDrag} dragId={dragId} dropId={dropId} dropPos={dropPos}
        onDragStart={() => onDragStartId(entry.id)}
        onDragOver={(ev) => onDragOverId(entry.id, ev)}
        onDrop={(ev) => onDropId(entry.id, ev)}
        onDragEnd={onDragEnd}
        {...rowProps}
      />
      {replies.length > 0 && (
        <div style={{ marginLeft: 28 }}>
          <button
            className="ghost"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Show replies" : "Hide replies"}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: C.text3, fontSize: 11, padding: "3px 4px", borderRadius: 5, marginBottom: collapsed ? 4 : 2, fontFamily: "'DM Sans', sans-serif" }}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            {replies.length} {replies.length > 1 ? "replies" : "reply"}
          </button>
          {!collapsed && (
            <div style={{ paddingLeft: 16, borderLeft: `1.5px solid ${lineColor}22`, marginBottom: 2 }}>
              {replies.map((r, ri) => (
                <EntryTreeNode
                  key={r.id} entry={r} depth={depth + 1} i={ri}
                  childrenOf={childrenOf} layout={layout}
                  {...dragProps}
                  {...rowProps}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline result card for a single smart-sort suggestion (shown under an Inbox
// entry). Accepting moves the entry; "Choose manually" falls back to the
// existing thread picker; dismiss just clears the card.
function SortSuggestion({ suggestion, threads, onAccept, onReject, onDismiss }) {
  const target = suggestion?.threadId ? threads.find(t => t.id === suggestion.threadId) : null;
  const pct = Math.round((suggestion?.confidence || 0) * 100);
  const dismissBtn = (
    <button onClick={onDismiss} className="ghost" style={{ background: "transparent", border: "none", color: C.text3, fontSize: 11.5, padding: "5px 6px", cursor: "pointer" }}>Dismiss</button>
  );
  return (
    <div style={{ marginTop: 8, background: C.surf2, border: `1px solid ${C.goldBorder}`, borderRadius: 9, padding: "10px 12px", animation: "fadeIn 0.16s ease both" }}>
      {target ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <Sparkles size={12} color={C.gold} />
            <span style={{ fontSize: 12, color: C.text }}>Suggested: <strong style={{ color: C.gold, fontWeight: 600 }}>{target.title}</strong></span>
            {pct > 0 && <span style={{ fontSize: 10.5, color: C.text3 }}>{pct}% sure</span>}
          </div>
          {suggestion.reason && <div style={{ fontSize: 11.5, color: C.text2, lineHeight: 1.5, marginBottom: 9 }}>{suggestion.reason}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onAccept} className="gold-btn" style={{ background: C.gold, border: "none", borderRadius: 6, color: C.onGold, fontSize: 11.5, padding: "5px 12px", cursor: "pointer", fontWeight: 500 }}>Move here</button>
            <button onClick={onReject} className="ghost" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.text2, fontSize: 11.5, padding: "5px 12px", cursor: "pointer" }}>Choose manually</button>
            {dismissBtn}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11.5, color: C.text2 }}>No clear match — file it manually.</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onReject} className="ghost" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.text2, fontSize: 11.5, padding: "5px 12px", cursor: "pointer" }}>Choose thread…</button>
            {dismissBtn}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ENTRY ROW ───
function EntryRow({ entry, type, cfg, threadId, toggleCheck, pinEntry, setDueDate, setEntryDate, deleteEntry, updateEntry, editingId, setEditingId, onReply, isBoard, isInbox, otherThreads, allThreads = [], moveEntry, layout = "list", draggable: isDraggable, dragId, dropId, dropPos, onDragStart, onDragOver, onDrop, onDragEnd, i, selectedEntryIds, toggleEntrySelection, smartSortReady = false }) {
  const [editText, setEditText] = useState(entry.text);
  const [moveOpen, setMoveOpen] = useState(false);
  const [sortState, setSortState] = useState(null); // null | {status:"loading"} | {status:"error",msg} | {status:"done",suggestion}
  const editRef  = useRef(null);

  const runSmartSort = async () => {
    setSortState({ status: "loading" });
    try {
      const res = await window.loomAPI?.suggestSort?.({ entryText: entry.text, threads: allThreads });
      if (!res?.ok) { setSortState({ status: "error", msg: llmErrorText(res?.error) }); return; }
      setSortState({ status: "done", suggestion: res.suggestion });
    } catch {
      setSortState({ status: "error", msg: llmErrorText() });
    }
  };
  const dateInputRef = useRef(null);
  const entryDateInputRef = useRef(null);

  const isEditing  = editingId === entry.id;
  const isDropTarget = dropId === entry.id && dragId !== entry.id;   // show insertion line
  const isDragging   = dragId === entry.id;                          // this row is being dragged
  const isNote     = entry.subtype === "note";
  // Notes are plain text regardless of thread type — no checkbox/pin/due, even in a board.
  const isBoardEntry = isBoard && !isNote;
  const isCompact  = layout === "compact";
  // Compact hides the date/note meta line for plain entries; keep it where it carries info.
  const showMeta   = !isCompact || isBoardEntry || isNote || !!entry.dueDate || !!entry.pinned;
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
    <>
    <div className={`e-row ${isSelected ? "selected" : ""}`}
      draggable={isDraggable && !isEditing}
      onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
      onMouseDown={handleRowMouseDown}
      onClick={handleRowClick}
      style={{
        display: "flex", gap: isCompact ? 9 : 12,
        padding: isCompact ? "7px 8px" : "14px 8px",
        borderBottom: `1px solid ${C.divider}`,
        alignItems: "flex-start", position: "relative",
        animation: `fadeUp 0.18s ${Math.min(i, 6) * 0.012}s ease both`,
        opacity: isDragging ? 0.4 : 1,
        ...(isSelected ? { background: "rgba(200,165,100,0.10)", outline: `1px solid ${C.goldBorder}`, borderRadius: 8 } : null),
      }}
    >
      {isDropTarget && (
        <div style={{ position: "absolute", left: 0, right: 0, [dropPos === "after" ? "bottom" : "top"]: -1, height: 2, background: C.gold, borderRadius: 2, pointerEvents: "none", zIndex: 3 }}>
          <div style={{ position: "absolute", left: -2, top: -2, width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
        </div>
      )}
      {isDraggable && !isEditing && (
        <div style={{ color: C.text3, opacity: 0.3, cursor: "grab", flexShrink: 0, marginTop: 3 }}>
          <GripVertical size={13} />
        </div>
      )}
      {isBoardEntry ? (
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
            <div onClick={beginEdit} title="Click to edit" style={{ fontSize: 13.5, color: entry.checked ? C.text3 : (isNote ? C.text2 : C.entryText), lineHeight: isCompact ? 1.5 : 1.72, textDecoration: entry.checked ? "line-through" : "none", fontWeight: 300, fontStyle: isNote ? "italic" : "normal", cursor: "text", whiteSpace: "pre-wrap" }}>{entry.text}</div>
            {showMeta && (
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
              {isNote && <span style={{ fontSize: 10, color: C.text3, background: C.overlay, padding: "1px 7px", borderRadius: 4 }}>note</span>}
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
            )}
          </>
        )}
        {isInbox && !isEditing && otherThreads.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {smartSortReady && (
                <button
                  className="ghost"
                  onClick={runSmartSort}
                  disabled={sortState?.status === "loading"}
                  title="Suggest a thread with Claude"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 7, color: C.gold, fontSize: 11.5, padding: "5px 10px", cursor: sortState?.status === "loading" ? "default" : "pointer" }}
                >
                  {sortState?.status === "loading" ? <Spinner color={C.gold} size={11} /> : <Sparkles size={11} />} Smart sort
                </button>
              )}
              <button
                className="ghost"
                onClick={() => setMoveOpen(true)}
                title="Move to another thread"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text2, fontSize: 11.5, padding: "5px 10px", cursor: "pointer" }}
              >
                <FolderInput size={11} /> Move to thread…
              </button>
            </div>
            {sortState?.status === "error" && (
              <div style={{ marginTop: 8, fontSize: 11.5, color: C.danger }}>{sortState.msg}</div>
            )}
            {sortState?.status === "done" && (
              <SortSuggestion
                suggestion={sortState.suggestion}
                threads={allThreads}
                onAccept={() => { moveEntry(threadId, entry.id, sortState.suggestion.threadId); setSortState(null); }}
                onReject={() => { setSortState(null); setMoveOpen(true); }}
                onDismiss={() => setSortState(null)}
              />
            )}
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
          {isBoardEntry && (
            <button className="ghost" onClick={() => pinEntry(threadId, entry.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}>
              <Pin size={12} color={entry.pinned ? C.gold : C.text3} />
            </button>
          )}
          {isBoardEntry && (
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
          {!isInbox && otherThreads.length > 0 && (
            <button
              className="ghost"
              onClick={() => setMoveOpen(true)}
              title="Move to another thread"
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}
            >
              <FolderInput size={12} color={moveOpen ? C.gold : C.text3} />
            </button>
          )}
          <button className="ghost" onClick={() => { loomConfirm({ title: "Delete entry?", message: "Delete this entry? This can't be undone." }).then(ok => { if (ok) deleteEntry(threadId, entry.id); }); }} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}>
            <X size={12} color={C.text3} />
          </button>
        </div>
      )}
    </div>
    {moveOpen && (
      <MoveToThreadModal
        threads={allThreads}
        excludeId={threadId}
        title="Move entry"
        subtitle="Choose a destination thread."
        onPick={(tid) => { moveEntry(threadId, entry.id, tid); setMoveOpen(false); }}
        onClose={() => setMoveOpen(false)}
      />
    )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// NEW THREAD MODAL
// ─────────────────────────────────────────────────────────────
// Mounted once in Loom; renders the confirm modal on demand via loomConfirm().
function ConfirmHost() {
  const [state, setState] = useState(null);
  useEffect(() => { confirmSetter = setState; return () => { confirmSetter = null; }; }, []);
  if (!state) return null;
  const finish = (val) => { state.resolve(val); setState(null); };
  return (
    <ConfirmModal
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      danger={state.danger !== false}
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  );
}

function ConfirmModal({ title = "Are you sure?", message, confirmLabel = "Delete", cancelLabel = "Cancel", danger = true, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onCancel(); }
      if (e.key === "Enter")  { e.preventDefault(); onConfirm(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onConfirm, onCancel]);
  const accent  = danger ? C.danger : C.gold;
  const onAcc   = danger ? C.onDanger : C.onGold;
  return (
    <div onMouseDown={onCancel} style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}>
      <div onMouseDown={e => e.stopPropagation()} style={{ background: C.modalSurf, border: `1px solid ${C.border}`, borderRadius: 18, padding: "30px", width: 380, animation: "slideIn 0.22s ease both", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: danger ? C.dangerBg : C.goldDim, border: `1px solid ${danger ? C.dangerBorder : C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertCircle size={17} color={accent} />
          </div>
          <div style={{ fontFamily: "'Cormorant', serif", fontSize: 23, fontWeight: 400 }}>{title}</div>
        </div>
        {message && <div style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.55, marginBottom: 26, fontWeight: 300 }}>{message}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} className="ghost" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text2, fontSize: 13.5, padding: "10px 18px", fontWeight: 500, cursor: "pointer" }}>
            {cancelLabel}
          </button>
          <button ref={ref} onClick={onConfirm} style={{ background: accent, border: "none", borderRadius: 10, color: onAcc, fontSize: 13.5, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewModal({ title, setTitle, description, setDescription, type, setType, parentId, parentThread, onCreate, onClose }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const parentCfg = parentThread ? TYPES[parentThread.type] : null;
  return (
    <div style={{ position: "fixed", inset: 0, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeIn 0.18s ease both", backdropFilter: "blur(6px)" }}>
      <div style={{ background: C.modalSurf, border: `1px solid ${C.border}`, borderRadius: 18, padding: "36px", width: 440, animation: "slideIn 0.22s ease both", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
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
          style={{ width: "100%", background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14.5, padding: "13px 16px", marginBottom: 12, fontWeight: 300 }} />
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onCreate(); } }}
          placeholder="Describe what this thread is for (optional)..." rows={3}
          style={{ width: "100%", background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, padding: "11px 16px", marginBottom: 24, fontWeight: 300, fontStyle: "italic", resize: "none", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }} />
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
        <button onClick={onCreate} className="gold-btn" style={{ width: "100%", background: C.gold, border: "none", borderRadius: 11, color: C.onGold, fontSize: 14, padding: "14px", fontWeight: 600, cursor: "pointer" }}>
          {parentThread ? "Create Sub-thread" : "Create Thread"}
        </button>
      </div>
    </div>
  );
}
