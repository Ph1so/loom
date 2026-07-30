// Build an LLM-friendly markdown export of the user's Loom journal.
//
// Output shape: a framing/schema explainer + stats up top, a table of contents,
// then one heading per thread (## for root, ### for sub-thread, etc.). Each
// thread heading is followed by an optional description blockquote and a bold
// **metadata line** (entry counts, activity dates, open/overdue tasks). Within
// each thread, entries render as a bullet list; replies (parentEntryId) become
// nested bullets with a `↳` marker. Boards get `[x]`/`[ ]` checkboxes; pinned
// entries get 📌; due dates render as `· due:YYYY-MM-DD` with a relative verdict
// like `(OVERDUE by 3d)`; subtype "note" entries render with an italic *(note)*
// tag; archived entries render with an italic *(archived)* tag and are excluded
// from board task/open counts (they're kept for the record but not "live").
//
// Everything temporal is computed relative to the export date (opts.now) so the
// reader never has to do date math.

const TYPE_META = {
  question: { emoji: "❓", label: "Question" },
  progress: { emoji: "📈", label: "Progress" },
  board:    { emoji: "☑️",  label: "Board"    },
  capture:  { emoji: "✒️",  label: "Capture"  },
};

function exportNow(now) {
  return now instanceof Date ? now : new Date();
}

function todayISO(now) {
  const d = exportNow(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Days from the export date to `iso` ("YYYY-MM-DD"). Positive = future,
// negative = past, 0 = the export day. Null if `iso` is missing/blank.
function dayDiffFrom(iso, now) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const base = exportNow(now);
  const baseMidnight = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  return Math.round((d - baseMidnight) / 86400000);
}

// Human "N days ago / today / in N days" relative to the export date.
function relativeDay(iso, now) {
  const diff = dayDiffFrom(iso, now);
  if (diff === null) return "";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  return diff < 0 ? `${-diff}d ago` : `in ${diff}d`;
}

// The verdict appended after `· due:YYYY-MM-DD`. The reader should never have
// to compute whether something is overdue — we state it.
function dueVerdict(dueDate, now) {
  const diff = dayDiffFrom(dueDate, now);
  if (diff === null) return "";
  if (diff < 0) return `(OVERDUE by ${-diff}d)`;
  if (diff === 0) return "(due today)";
  if (diff === 1) return "(due tomorrow)";
  return `(due in ${diff}d)`;
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

// Flatten the thread forest into render order (root, then its descendants
// depth-first), tagging each with its depth. Shared by the TOC and the body so
// the two never drift.
function flattenThreadOrder(filtered) {
  const out = [];
  const visit = (t, depth) => {
    out.push({ thread: t, depth });
    for (const c of exportChildren(filtered, t.id)) visit(c, depth + 1);
  };
  for (const r of exportRoots(filtered)) visit(r, 0);
  return out;
}

function threadEmoji(thread) {
  if (thread.special === "inbox") return "📥";
  return (TYPE_META[thread.type] || TYPE_META.capture).emoji;
}

function threadTypeLabel(thread) {
  return (TYPE_META[thread.type] || TYPE_META.capture).label;
}

// The "YYYY-MM-DD" portion of a real ISO timestamp, or null for legacy values
// (the old "Today" sentinel, blanks, or anything unparseable).
function isoDatePart(value) {
  if (typeof value !== "string" || !value.includes("T")) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return value.slice(0, 10);
}

// Per-thread facts derived from its entries. Used for the metadata line and the
// TOC summary so the reader can prioritize without reading every entry.
function threadFacts(thread, now) {
  const entries = Array.isArray(thread.entries) ? thread.entries : [];
  const dates = entries.map(e => e.dateISO).filter(Boolean).sort();
  const firstISO = dates[0] || null;
  const lastISO = dates[dates.length - 1] || null;
  const createdISO = isoDatePart(thread.createdAt);
  const undated = entries.filter(e => !e.dateISO).length;
  const isBoard = thread.type === "board";
  // Notes are plain text, never tasks — exclude them from board task counts.
  // Archived tasks are deliberately out of the way — exclude them too.
  const tasks = isBoard ? entries.filter(e => e.subtype !== "note" && !e.archived) : [];
  const open = isBoard ? tasks.filter(e => !e.checked).length : 0;
  const done = isBoard ? tasks.filter(e => e.checked).length : 0;
  const overdue = isBoard
    ? tasks.filter(e => !e.checked && e.dueDate && dayDiffFrom(e.dueDate, now) < 0).length
    : 0;
  // "Days open" = span from the first entry to the export date.
  const firstDiff = dayDiffFrom(firstISO, now);
  const daysOpen = firstDiff === null ? null : Math.max(0, -firstDiff);
  return {
    count: entries.length, undated, firstISO, lastISO, daysOpen, createdISO,
    isBoard, open, done, overdue,
  };
}

// The bold facts line rendered directly under a thread heading/description.
function threadMetaLine(facts, now) {
  // An empty thread still has a temporal anchor if we know when it was created.
  if (facts.count === 0) {
    return facts.createdISO
      ? `**created ${facts.createdISO} (${relativeDay(facts.createdISO, now)}) · empty**`
      : "";
  }
  const segs = [];
  if (facts.isBoard) {
    segs.push(`${facts.count} task${facts.count === 1 ? "" : "s"}`);
    segs.push(`${facts.open} open`);
    segs.push(`${facts.done} done`);
    if (facts.overdue > 0) segs.push(`${facts.overdue} overdue`);
  } else {
    segs.push(`${facts.count} ${facts.count === 1 ? "entry" : "entries"}`);
  }
  if (facts.lastISO) segs.push(`last active ${facts.lastISO} (${relativeDay(facts.lastISO, now)})`);
  if (facts.firstISO && facts.firstISO !== facts.lastISO) segs.push(`first noted ${facts.firstISO}`);
  // Surface thread creation only when it predates the first entry — otherwise
  // it's redundant with "first noted" and just adds noise.
  if (facts.createdISO && (!facts.firstISO || facts.createdISO < facts.firstISO)) {
    segs.push(`created ${facts.createdISO}`);
  }
  if (facts.daysOpen != null && facts.daysOpen > 0) segs.push(`${facts.daysOpen}d open`);
  if (facts.undated > 0) segs.push(`${facts.undated} undated`);
  return `**${segs.join(" · ")}**`;
}

// One-line TOC summary for a thread — the smallest useful signal.
function threadTocSummary(facts, now) {
  if (facts.count === 0) return "empty";
  const bits = [];
  if (facts.isBoard) {
    bits.push(`${facts.open}/${facts.count} open`);
    if (facts.overdue > 0) bits.push(`${facts.overdue} overdue`);
  } else {
    bits.push(`${facts.count} ${facts.count === 1 ? "entry" : "entries"}`);
  }
  if (facts.lastISO) bits.push(`active ${relativeDay(facts.lastISO, now)}`);
  return bits.join(", ");
}

// Collapse arbitrary whitespace inside an entry's text to single spaces. LLMs
// don't need the original line breaks, and collapsing keeps each entry on one
// markdown bullet line (no fragile multi-paragraph indentation).
function flattenText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function entryLine(entry, threadType, depth, now) {
  const indent = "  ".repeat(depth);
  const bullet = depth > 0 ? "- ↳" : "-";
  const parts = [];

  // Notes are plain text even on a board — no checkbox.
  if (threadType === "board" && entry.subtype !== "note") parts.push(entry.checked ? "[x]" : "[ ]");
  if (entry.pinned) parts.push("📌");
  if (entry.dateISO) {
    parts.push(entry.dateISO);
    parts.push("—");
  }

  const text = flattenText(entry.text);
  const tags = [entry.archived && "*(archived)*", entry.subtype === "note" && "*(note)*"].filter(Boolean);
  parts.push(tags.length ? `${tags.join(" ")} ${text}` : text);

  if (entry.dueDate) {
    const verdict = dueVerdict(entry.dueDate, now);
    parts.push(`· due:${entry.dueDate}${verdict ? ` ${verdict}` : ""}`);
  }
  if (!entry.dateISO) parts.push("· (undated)");

  return `${indent}${bullet} ${parts.join(" ")}`;
}

// Walk an entry and its replies (depth-first, preserving array order).
function renderEntryTree(entries, threadType, now) {
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
    lines.push(entryLine(entry, threadType, depth, now));
    const kids = childrenOf.get(entry.id) || [];
    for (const k of kids) walk(k, depth + 1);
  };
  for (const r of roots) walk(r, 0);
  return lines;
}

function renderThread(thread, filtered, depth, lines, now) {
  const hashes = "#".repeat(Math.min(2 + depth, 6));
  const isSub = depth > 0;
  const typeLabel = threadTypeLabel(thread).toLowerCase();
  const badge = `*(${typeLabel}${isSub ? " · sub-thread" : ""})*`;
  const titlePrefix = isSub ? "↳ " : "";
  lines.push(`${hashes} ${threadEmoji(thread)} ${titlePrefix}${thread.title}  ${badge}`);
  lines.push("");

  const description = typeof thread.description === "string" ? thread.description.trim() : "";
  if (description) {
    for (const ln of description.split(/\r?\n/)) {
      lines.push(`> ${ln}`);
    }
    lines.push("");
  }

  const facts = threadFacts(thread, now);
  const metaLine = threadMetaLine(facts, now);
  if (metaLine) {
    lines.push(metaLine);
    lines.push("");
  }

  const entries = Array.isArray(thread.entries) ? thread.entries : [];
  if (entries.length === 0) {
    lines.push("_(empty)_");
  } else {
    lines.push(...renderEntryTree(entries, thread.type, now));
  }
  lines.push("");

  for (const child of exportChildren(filtered, thread.id)) {
    renderThread(child, filtered, depth + 1, lines, now);
  }
}

function computeStats(filtered, now) {
  let entryCount = 0;
  let openTasks = 0;
  let recentCount = 0;
  let lastActive = null;
  for (const t of filtered) {
    const entries = Array.isArray(t.entries) ? t.entries : [];
    entryCount += entries.length;
    if (t.type === "board") {
      openTasks += entries.filter(e => !e.checked && !e.archived && e.subtype !== "note").length;
    }
    for (const e of entries) {
      const diff = dayDiffFrom(e.dateISO, now);
      if (diff === null) continue;
      if (diff >= -6 && diff <= 0) recentCount += 1;
      if (e.dateISO && (lastActive === null || e.dateISO > lastActive)) lastActive = e.dateISO;
    }
  }
  return {
    total: filtered.length,
    rootCount: exportRoots(filtered).length,
    entryCount,
    openTasks,
    recentCount,
    lastActive,
  };
}

function tableOfContents(filtered, now) {
  const ordered = flattenThreadOrder(filtered);
  if (ordered.length === 0) return [];
  const lines = ["## Contents", ""];
  for (const { thread, depth } of ordered) {
    const indent = "  ".repeat(depth);
    const facts = threadFacts(thread, now);
    const summary = threadTocSummary(facts, now);
    lines.push(`${indent}- ${threadEmoji(thread)} ${thread.title} — ${summary}`);
  }
  lines.push("");
  return lines;
}

function preamble(dateStr, stats) {
  const ent = stats.entryCount === 1 ? "entry" : "entries";
  const thr = stats.total === 1 ? "thread" : "threads";
  const tasks = stats.openTasks > 0
    ? ` · ${stats.openTasks} open task${stats.openTasks === 1 ? "" : "s"}`
    : "";
  const recent = stats.recentCount > 0 ? ` · ${stats.recentCount} in last 7d` : "";
  const last = stats.lastActive ? ` · last active ${stats.lastActive}` : "";
  return [
    `# Loom Journal — exported ${dateStr}`,
    "",
    "This document is a snapshot of my personal thread-based journal, exported",
    "for you to read and reason over. Use it to answer questions about my notes,",
    "tasks, open questions, and what I've been focused on. When reasoning about",
    `recency or deadlines, treat **${dateStr}** (the export date) as "today" —`,
    "every relative phrase below (e.g. `3d ago`, `OVERDUE by 2d`) is already",
    "computed against that date, so you don't need to do any date math.",
    "",
    "Each **thread** is a continuing line of thought of one of four kinds:",
    "",
    "- ❓ **Question** — open-ended reflections I sit with over time",
    "- 📈 **Progress** — ongoing logs (habits, routines)",
    "- ☑️ **Board** — action items / tasks",
    "- ✒️ **Capture** — quick notes and loose thoughts",
    "",
    "**How to read this:**",
    "",
    "- Threads can have **sub-threads**, rendered nested below their parent.",
    "- A thread's description (its intent in my own words) appears as a blockquote",
    "  (`>`) under the heading, followed by a **bold metadata line** summarizing",
    "  entry counts, activity dates, and open/overdue tasks.",
    "- Entries appear in the order I curated them, **not** chronologically — don't",
    "  assume top-to-bottom means oldest-to-newest. Each entry is prefixed with its",
    "  own date (`YYYY-MM-DD`) when it has one.",
    "- An indented entry starting with `↳` is a *reply* to the nearest less-indented",
    "  entry above it.",
    "- On boards, `[ ]` is pending and `[x]` is done. `📌` marks a pinned/priority",
    "  entry. `· due:YYYY-MM-DD` is a due date, annotated with a relative verdict.",
    "  Entries tagged `*(note)*` are side notes, not primary entries.",
    "",
    `**Stats:** ${stats.total} ${thr} (${stats.rootCount} root) · ${stats.entryCount} ${ent}${tasks}${recent}${last}`,
    "",
    "---",
    "",
  ];
}

export function buildExportMarkdown(threads, opts = {}) {
  const safe = Array.isArray(threads) ? threads : [];
  const selected = opts.selectedIds instanceof Set ? opts.selectedIds : null;
  const filtered = selected === null ? safe : safe.filter(t => selected.has(t.id));
  const now = exportNow(opts.now);

  const stats = computeStats(filtered, now);
  const lines = preamble(todayISO(now), stats);

  const roots = exportRoots(filtered);
  if (roots.length === 0) {
    lines.push("_(nothing selected)_", "");
  } else {
    lines.push(...tableOfContents(filtered, now));
    lines.push("---", "");
    for (const t of roots) renderThread(t, filtered, 0, lines, now);
  }

  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n") + "\n";
}
