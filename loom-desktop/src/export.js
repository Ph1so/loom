// Build an LLM-friendly markdown export of the user's Loom journal.
//
// Output shape: a short schema explainer + stats up top, then one heading per
// thread (## for root, ### for sub-thread, etc.). Within each thread, entries
// render as a bullet list; replies (parentEntryId) become nested bullets with
// a `↳` marker. Boards get `[x]`/`[ ]` checkboxes; pinned entries get 📌;
// due dates render as `· due:YYYY-MM-DD`; subtype "note" entries render with
// an italic *(note)* tag.

const TYPE_META = {
  question: { emoji: "❓", label: "Question" },
  progress: { emoji: "📈", label: "Progress" },
  board:    { emoji: "☑️",  label: "Board"    },
  capture:  { emoji: "✒️",  label: "Capture"  },
};

function todayISO(now) {
  const d = now instanceof Date ? now : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "Export roots" are the top-level entries in the rendered output. With no
// filter, that's every thread whose parentId is null. With a filter, a thread
// is also a root if its parent was excluded — orphaned children get promoted
// so they aren't silently dropped.
function exportRoots(filtered) {
  const ids = new Set(filtered.map(t => t.id));
  const inbox = filtered.find(t => t.id === "inbox");
  const others = filtered.filter(t =>
    t.id !== "inbox" && (t.parentId == null || !ids.has(t.parentId))
  );
  return inbox ? [inbox, ...others] : others;
}

function exportChildren(filtered, parentId) {
  return filtered.filter(t => t.parentId === parentId && t.id !== "inbox");
}

function threadEmoji(thread) {
  if (thread.special === "inbox") return "📥";
  return (TYPE_META[thread.type] || TYPE_META.capture).emoji;
}

function threadTypeLabel(thread) {
  return (TYPE_META[thread.type] || TYPE_META.capture).label;
}

// Collapse arbitrary whitespace inside an entry's text to single spaces. LLMs
// don't need the original line breaks, and collapsing keeps each entry on one
// markdown bullet line (no fragile multi-paragraph indentation).
function flattenText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function entryLine(entry, threadType, depth) {
  const indent = "  ".repeat(depth);
  const bullet = depth > 0 ? "- ↳" : "-";
  const parts = [];

  if (threadType === "board") parts.push(entry.checked ? "[x]" : "[ ]");
  if (entry.pinned) parts.push("📌");
  if (entry.dateISO) {
    parts.push(entry.dateISO);
    parts.push("—");
  }

  const text = flattenText(entry.text);
  parts.push(entry.subtype === "note" ? `*(note)* ${text}` : text);

  if (entry.dueDate) parts.push(`· due:${entry.dueDate}`);
  if (!entry.dateISO) parts.push("· (undated)");

  return `${indent}${bullet} ${parts.join(" ")}`;
}

// Walk an entry and its replies (depth-first, preserving array order).
function renderEntryTree(entries, threadType) {
  const byId = new Map(entries.map(e => [e.id, e]));
  const childrenOf = new Map();
  const roots = [];
  for (const e of entries) {
    if (e.parentEntryId && byId.has(e.parentEntryId)) {
      const arr = childrenOf.get(e.parentEntryId) || [];
      arr.push(e);
      childrenOf.set(e.parentEntryId, arr);
    } else {
      roots.push(e);
    }
  }
  const lines = [];
  const walk = (entry, depth) => {
    lines.push(entryLine(entry, threadType, depth));
    const kids = childrenOf.get(entry.id) || [];
    for (const k of kids) walk(k, depth + 1);
  };
  for (const r of roots) walk(r, 0);
  return lines;
}

function renderThread(thread, filtered, depth, lines) {
  const hashes = "#".repeat(Math.min(2 + depth, 6));
  const isSub = depth > 0;
  const typeLabel = threadTypeLabel(thread).toLowerCase();
  const badge = `*(${typeLabel}${isSub ? " · sub-thread" : ""})*`;
  const titlePrefix = isSub ? "↳ " : "";
  lines.push(`${hashes} ${threadEmoji(thread)} ${titlePrefix}${thread.title}  ${badge}`);
  lines.push("");

  const entries = Array.isArray(thread.entries) ? thread.entries : [];
  if (entries.length === 0) {
    lines.push("_(empty)_");
  } else {
    lines.push(...renderEntryTree(entries, thread.type));
  }
  lines.push("");

  for (const child of exportChildren(filtered, thread.id)) {
    renderThread(child, filtered, depth + 1, lines);
  }
}

function computeStats(filtered) {
  let entryCount = 0;
  let openTasks = 0;
  for (const t of filtered) {
    const entries = Array.isArray(t.entries) ? t.entries : [];
    entryCount += entries.length;
    if (t.type === "board") {
      openTasks += entries.filter(e => !e.checked).length;
    }
  }
  return {
    total: filtered.length,
    rootCount: exportRoots(filtered).length,
    entryCount,
    openTasks,
  };
}

function preamble(dateStr, stats) {
  const ent = stats.entryCount === 1 ? "entry" : "entries";
  const thr = stats.total === 1 ? "thread" : "threads";
  const tasks = stats.openTasks > 0
    ? ` · ${stats.openTasks} open task${stats.openTasks === 1 ? "" : "s"}`
    : "";
  return [
    `# Loom Journal — exported ${dateStr}`,
    "",
    "Loom is my personal thread-based journal. Each **thread** is a continuing",
    "line of thought of one of four kinds:",
    "",
    "- ❓ **Question** — open-ended reflections I sit with over time",
    "- 📈 **Progress** — ongoing logs (habits, routines)",
    "- ☑️ **Board** — action items / tasks",
    "- ✒️ **Capture** — quick notes and loose thoughts",
    "",
    "Threads can have **sub-threads**, rendered nested below their parent.",
    "Within a thread, entries appear in the order I curated them. An indented",
    "entry starting with `↳` is a *reply* to the entry above. On boards,",
    "`[ ]` is pending and `[x]` is done. `📌` marks a pinned/priority entry.",
    "`· due:YYYY-MM-DD` is a due date. Entries tagged `*(note)*` are side notes,",
    "not primary entries.",
    "",
    `**Stats:** ${stats.total} ${thr} (${stats.rootCount} root) · ${stats.entryCount} ${ent}${tasks}`,
    "",
    "---",
    "",
  ];
}

export function buildExportMarkdown(threads, opts = {}) {
  const safe = Array.isArray(threads) ? threads : [];
  const selected = opts.selectedIds instanceof Set ? opts.selectedIds : null;
  const filtered = selected === null ? safe : safe.filter(t => selected.has(t.id));

  const stats = computeStats(filtered);
  const lines = preamble(todayISO(opts.now), stats);

  const roots = exportRoots(filtered);
  if (roots.length === 0) {
    lines.push("_(nothing selected)_", "");
  } else {
    for (const t of roots) renderThread(t, filtered, 0, lines);
  }

  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n") + "\n";
}
