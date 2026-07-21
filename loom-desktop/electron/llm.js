// Pure prompt-building + response-parsing helpers for Loom's smart-sort features.
//
// This module has NO network or Electron dependencies on purpose: everything
// here is deterministic and unit-testable with plain Node. The actual Claude
// API call lives in main.js, which owns the API key and passes the built
// {system, messages, schema} down to the SDK. Keeping the impure boundary thin
// means the prompt shapes and the fragile response parsing can be tested without
// hitting the network.
//
// Three tasks are supported:
//   1. suggest  — given one entry, pick the single best thread for it.
//   2. review   — given many entries, flag the ones that belong somewhere better.
//   3. memory   — summarize each thread into a one-line "what belongs here" profile.
//
// The memory profiles are the token-saving mechanism the app calls its "thread
// memory": once built, they let suggest/review reference a compact per-thread
// blurb instead of re-sending every thread's entries on every call.

const DEFAULT_MODEL = "claude-haiku-4-5";

// Models offered in Settings. Haiku is the default — this is a short
// classification task, so the cheapest capable model is the right call.
const MODELS = [
  { id: "claude-haiku-4-5", label: "Haiku 4.5 · fast & cheap" },
  { id: "claude-sonnet-5", label: "Sonnet 5 · balanced" },
  { id: "claude-opus-4-8", label: "Opus 4.8 · most capable" },
];

const MAX_ENTRY_CHARS = 600;   // truncate long entries before sending
const MAX_REVIEW_ENTRIES = 80; // cap the review batch so cost stays bounded

function clean(text) {
  return String(text == null ? "" : text).replace(/\s+/g, " ").trim();
}

function truncate(text, max = MAX_ENTRY_CHARS) {
  const t = clean(text);
  return t.length > max ? t.slice(0, max) + "…" : t;
}

// Threads a note can be filed into: everything except the Inbox itself (the
// Inbox is the untriaged source, never a destination for triage).
function fileableThreads(threads) {
  return (Array.isArray(threads) ? threads : []).filter(
    (t) => t && t.id && t.id !== "inbox"
  );
}

// Walk parentId up to the root, returning ancestor threads root-most first
// (excluding the thread itself and the Inbox). Cycle-guarded so a corrupt
// parentId loop can't hang. Used to give the model the surrounding context a
// nested thread inherits from its parents.
function ancestorChain(threads, thread) {
  const byId = {};
  for (const t of Array.isArray(threads) ? threads : []) if (t && t.id) byId[t.id] = t;
  const chain = [];
  const seen = new Set();
  let cur = thread && thread.parentId ? byId[thread.parentId] : null;
  while (cur && cur.id !== "inbox" && !seen.has(cur.id)) {
    seen.add(cur.id);
    chain.unshift(cur);
    cur = cur.parentId ? byId[cur.parentId] : null;
  }
  return chain;
}

// A multi-line context block describing one thread: title/type, where it sits in
// the hierarchy (ancestor titles + their descriptions), a one-line "about" (its
// purpose), and a few recent entries.
//
// The `about` yardstick is chosen deliberately by caller:
//   - useMemory=true  (Suggest): the entry-derived memory profile when present,
//     else the user's description. Fine for filing NEW notes.
//   - useMemory=false (Review, Memory-build): the user-authored description ONLY.
//     Never the profile — judging entries against a standard learned from those
//     same (possibly misfiled) entries is circular and hides misplacement.
// `entryLabel` lets Review present the samples as "current entries (may be
// misfiled)" so the model doesn't read current contents as ground truth.
function describeThread(threads, thread, opts = {}) {
  const { memory = null, sampleCount = 3, useMemory = true, entryLabel = "entries" } = opts;
  const type = thread.type || "capture";
  const lines = [`- [${thread.id}] "${clean(thread.title) || "Untitled"}" (${type})`];

  const chain = ancestorChain(threads, thread);
  if (chain.length) {
    lines.push(`    nested under: ${chain.map((a) => clean(a.title) || "Untitled").join(" › ")}`);
    // Parent/ancestor descriptions carry the theme a sub-thread inherits — these
    // are user-authored intent, so they're a safe (non-circular) signal.
    for (const a of chain) {
      const ad = clean(a.description);
      if (ad) lines.push(`    ↑ "${clean(a.title) || "Untitled"}": ${ad}`);
    }
  }

  const about = clean((useMemory ? memoryMap(memory)[thread.id] : "") || thread.description || "");
  if (about) lines.push(`    about: ${about}`);

  const samples = (Array.isArray(thread.entries) ? thread.entries : [])
    .filter((e) => e && e.subtype !== "note" && !e.parentEntryId)
    .slice(-sampleCount)
    .map((e) => `“${truncate(e.text, 140)}”`);
  if (samples.length) lines.push(`    ${entryLabel}: ${samples.join("; ")}`);

  return lines.join("\n");
}

// Build the candidate-thread context list for suggest/review. Each candidate is a
// full describeThread() block (hierarchy + parent descriptions + entries), not
// just a title, so the model routes on real content. `opts` is passed straight
// through so the caller controls the memory/entry-label policy above.
function candidateLines(threads, opts = {}) {
  return fileableThreads(threads).map((t) => describeThread(threads, t, opts));
}

function memoryMap(memory) {
  const out = {};
  const list = memory && Array.isArray(memory.profiles) ? memory.profiles : [];
  for (const p of list) {
    if (p && p.id && typeof p.profile === "string") out[p.id] = p.profile;
  }
  return out;
}

const THREAD_PRIMER =
  "Loom is a personal thread-based journal. Every entry lives in one typed thread:\n" +
  "- question: open-ended reflections revisited over time\n" +
  "- progress: append-only logs (workouts, habits, routines)\n" +
  "- board: tasks / action items\n" +
  "- capture: quick, loose notes\n";

// ── 1. Suggest a home for a single entry ─────────────────────────────
const SUGGEST_SCHEMA = {
  type: "object",
  properties: {
    threadId: {
      type: "string",
      description:
        "The id of the best-fitting candidate thread, or an empty string if none is a clear fit.",
    },
    confidence: {
      type: "number",
      description: "How confident the choice is, from 0 to 1.",
    },
    reason: {
      type: "string",
      description: "One short phrase (<= 100 chars) explaining the choice.",
    },
  },
  required: ["threadId", "confidence", "reason"],
  additionalProperties: false,
};

function buildSuggest({ entryText, threads, memory }) {
  const candidates = candidateLines(threads, { memory, sampleCount: 3, useMemory: true });
  const system =
    THREAD_PRIMER +
    "\nYou file loose notes into the thread they most naturally belong in. Each " +
    "candidate below shows its type, where it sits in the thread hierarchy (with " +
    "its parent threads' descriptions under `↑`), an `about` summary, and a few " +
    "example `entries`. Judge fit from ALL of this — especially the example entries " +
    "and the parent context — not the title alone. Pick exactly one thread only " +
    "when it is a clear fit. If nothing fits well, return an empty threadId rather " +
    "than forcing a weak match. threadId must be one of the bracketed candidate ids, " +
    "verbatim. Keep the reason to a short phrase.";
  const user =
    `Note to file:\n"""${truncate(entryText)}"""\n\n` +
    `Candidate threads:\n${candidates.join("\n") || "(none)"}`;
  return {
    system,
    messages: [{ role: "user", content: user }],
    schema: SUGGEST_SCHEMA,
  };
}

// Validate/normalize the model's answer against the real thread ids so a
// hallucinated id can never move an entry into a nonexistent thread.
function parseSuggestion(raw, threads) {
  const obj = coerceObject(raw);
  if (!obj) return null;
  const validIds = new Set(fileableThreads(threads).map((t) => t.id));
  const threadId =
    typeof obj.threadId === "string" && validIds.has(obj.threadId)
      ? obj.threadId
      : null;
  return {
    threadId,
    confidence: clampConfidence(obj.confidence),
    reason: clean(obj.reason).slice(0, 200),
  };
}

// ── 2. Review many entries for misplacement ──────────────────────────
const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entryId: { type: "string" },
          toThreadId: { type: "string" },
          confidence: { type: "number" },
          reason: { type: "string" },
        },
        required: ["entryId", "toThreadId", "confidence", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
};

// Flatten every thread's entries (Inbox included — untriaged notes are prime
// review candidates) into a labelled, capped list. Notes and replies are
// skipped: notes are side-text and replies are anchored to their parent.
function reviewEntries(threads) {
  const titleById = {};
  for (const t of fileableThreads(threads)) titleById[t.id] = clean(t.title);
  const inbox = (Array.isArray(threads) ? threads : []).find(
    (t) => t && t.id === "inbox"
  );
  if (inbox) titleById.inbox = "Inbox";

  const out = [];
  for (const t of Array.isArray(threads) ? threads : []) {
    if (!t || !Array.isArray(t.entries)) continue;
    for (const e of t.entries) {
      if (!e || !e.id) continue;
      if (e.subtype === "note" || e.parentEntryId) continue;
      out.push({ entryId: e.id, fromThreadId: t.id, text: e.text });
      if (out.length >= MAX_REVIEW_ENTRIES) return out;
    }
  }
  return out;
}

function buildReview({ threads }) {
  // Review deliberately does NOT use the memory profiles: those are derived from
  // the current (possibly misfiled) entries, so using them as the yardstick would
  // rubber-stamp existing placement. Judge against user-authored intent instead.
  const candidates = candidateLines(threads, { sampleCount: 2, useMemory: false, entryLabel: "current entries (may be misfiled)" });
  const entries = reviewEntries(threads);
  const titleById = {};
  for (const t of Array.isArray(threads) ? threads : []) {
    if (t && t.id) titleById[t.id] = clean(t.title) || (t.id === "inbox" ? "Inbox" : "");
  }
  const entryLines = entries.map(
    (e) => `- [${e.entryId}] (in "${titleById[e.fromThreadId] || e.fromThreadId}") ${truncate(e.text)}`
  );
  const system =
    THREAD_PRIMER +
    "\nYou audit whether each entry sits in the right thread. Do NOT assume the current " +
    "placement is correct: a thread can be full of entries that don't actually match its " +
    "purpose. Judge each entry against every thread's PURPOSE — given by its title, type, " +
    "`about` description, and parent threads' descriptions (under `↑`), which are the " +
    "user's stated intent — together with the DOMINANT theme of that thread's current " +
    "entries. Treat the listed current entries as unverified: an entry that clashes with " +
    "its thread's purpose, or that clearly fits another thread's purpose better, should be " +
    "flagged even if similar entries sit beside it — the outliers are exactly the misfiled " +
    "ones. Flag only clear improvements; a short list of confident moves beats many weak " +
    "ones. toThreadId must be one of the bracketed candidate ids and must differ from the " +
    "entry's current thread.";
  const user =
    `Candidate threads:\n${candidates.join("\n") || "(none)"}\n\n` +
    `Entries to audit:\n${entryLines.join("\n") || "(none)"}`;
  return {
    system,
    messages: [{ role: "user", content: user }],
    schema: REVIEW_SCHEMA,
    // Echoed back so main.js can attach current-thread info without re-deriving.
    _entryIndex: entries,
  };
}

function parseReview(raw, threads) {
  const obj = coerceObject(raw);
  if (!obj || !Array.isArray(obj.suggestions)) return [];
  const validThreadIds = new Set(fileableThreads(threads).map((t) => t.id));
  const fromById = {};
  for (const e of reviewEntries(threads)) fromById[e.entryId] = e.fromThreadId;

  const out = [];
  const seen = new Set();
  for (const s of obj.suggestions) {
    if (!s || typeof s.entryId !== "string" || typeof s.toThreadId !== "string") continue;
    if (!(s.entryId in fromById)) continue;          // unknown / non-reviewable entry
    if (!validThreadIds.has(s.toThreadId)) continue;  // hallucinated destination
    if (s.toThreadId === fromById[s.entryId]) continue; // no-op move
    if (seen.has(s.entryId)) continue;                // one suggestion per entry
    seen.add(s.entryId);
    out.push({
      entryId: s.entryId,
      fromThreadId: fromById[s.entryId],
      toThreadId: s.toThreadId,
      confidence: clampConfidence(s.confidence),
      reason: clean(s.reason).slice(0, 200),
    });
  }
  return out;
}

// ── 3. Build per-thread memory profiles ──────────────────────────────
const MEMORY_SCHEMA = {
  type: "object",
  properties: {
    profiles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          profile: { type: "string" },
        },
        required: ["id", "profile"],
        additionalProperties: false,
      },
    },
  },
  required: ["profiles"],
  additionalProperties: false,
};

function buildMemory({ threads }) {
  // Deeper entry sample here since this pass runs rarely and distills content.
  // useMemory:false — there's no prior memory to lean on, and the profile should
  // describe intended purpose, not echo whatever profile existed before.
  const blocks = fileableThreads(threads).map((t) =>
    describeThread(threads, t, { memory: null, sampleCount: 6, useMemory: false })
  );
  const system =
    THREAD_PRIMER +
    "\nFor each thread, write a single-sentence profile (<= 140 chars) describing what the " +
    "thread is FOR — the kind of entry that BELONGS there — so a filing assistant can route " +
    "notes. Derive the purpose primarily from the title, type, `about` description, and " +
    "parent threads' descriptions (under `↑`) — the user's stated intent. The example " +
    "`entries` are evidence of the intended theme, but assume some may be MISFILED: capture " +
    "the dominant purpose, and don't let an outlier entry widen the scope (e.g. one stray " +
    "task in a reflections thread shouldn't make the profile mention tasks). Return one " +
    "profile per thread id given, using the ids verbatim.";
  const user = `Threads:\n${blocks.join("\n\n") || "(none)"}`;
  return {
    system,
    messages: [{ role: "user", content: user }],
    schema: MEMORY_SCHEMA,
  };
}

function parseMemory(raw, threads) {
  const obj = coerceObject(raw);
  if (!obj || !Array.isArray(obj.profiles)) return { generatedAt: null, profiles: [] };
  const validIds = new Set(fileableThreads(threads).map((t) => t.id));
  const profiles = [];
  const seen = new Set();
  for (const p of obj.profiles) {
    if (!p || typeof p.id !== "string" || typeof p.profile !== "string") continue;
    if (!validIds.has(p.id) || seen.has(p.id)) continue;
    seen.add(p.id);
    profiles.push({ id: p.id, profile: clean(p.profile).slice(0, 240) });
  }
  return { profiles };
}

// ── Shared parsing helpers ───────────────────────────────────────────
function clampConfidence(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

// Accept either an already-parsed object or the raw text of a structured-output
// response. Tolerates stray code fences in case a model wraps the JSON.
function coerceObject(raw) {
  if (raw && typeof raw === "object") return raw;
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  try {
    const parsed = JSON.parse(s);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

module.exports = {
  DEFAULT_MODEL,
  MODELS,
  fileableThreads,
  ancestorChain,
  describeThread,
  reviewEntries,
  buildSuggest,
  parseSuggestion,
  SUGGEST_SCHEMA,
  buildReview,
  parseReview,
  REVIEW_SCHEMA,
  buildMemory,
  parseMemory,
  MEMORY_SCHEMA,
  coerceObject,
  clampConfidence,
};
