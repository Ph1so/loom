// Plain-Node unit tests for electron/llm.js (no network, no Electron).
// Run: node electron/llm.test.js
const assert = require("assert");
const llm = require("./llm");

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok  " + name);
  } catch (e) {
    console.error("FAIL  " + name + "\n      " + (e && e.message));
    process.exitCode = 1;
  }
}

const threads = [
  { id: "inbox", title: "Inbox", type: "capture", entries: [
    { id: "i1", text: "call the dentist tomorrow", subtype: "entry" },
  ] },
  { id: "t_work", title: "Work tasks", type: "board", description: "Things to do at work",
    entries: [{ id: "w1", text: "ship the release", subtype: "entry" }] },
  { id: "t_health", title: "Health log", type: "progress", entries: [
    { id: "h1", text: "ran 5k", subtype: "entry" },
    { id: "h2", text: "a side note", subtype: "note" },
  ] },
];

// ── fileableThreads / reviewEntries ──
test("fileableThreads excludes inbox", () => {
  const ids = llm.fileableThreads(threads).map((t) => t.id);
  assert.deepStrictEqual(ids, ["t_work", "t_health"]);
});

test("reviewEntries includes inbox entries, skips notes & replies", () => {
  const withReply = threads.concat([
    { id: "t_x", title: "X", type: "capture", entries: [
      { id: "x1", text: "root", subtype: "entry" },
      { id: "x2", text: "reply", subtype: "entry", parentEntryId: "x1" },
    ] },
  ]);
  const ids = llm.reviewEntries(withReply).map((e) => e.entryId);
  assert.ok(ids.includes("i1"), "inbox entry present");
  assert.ok(!ids.includes("h2"), "note excluded");
  assert.ok(!ids.includes("x2"), "reply excluded");
});

// ── buildSuggest ──
test("buildSuggest lists candidate ids and the note, excludes inbox", () => {
  const { system, messages, schema } = llm.buildSuggest({
    entryText: "buy milk", threads,
  });
  assert.ok(/board/.test(system));
  const user = messages[0].content;
  assert.ok(user.includes("[t_work]") && user.includes("[t_health]"));
  assert.ok(!user.includes("[inbox]"), "inbox is never a destination");
  assert.ok(user.includes("buy milk"));
  assert.strictEqual(schema, llm.SUGGEST_SCHEMA);
});

test("buildSuggest prefers memory profile over description", () => {
  const memory = { profiles: [{ id: "t_work", profile: "MEMORY PROFILE HERE" }] };
  const { messages } = llm.buildSuggest({ entryText: "x", threads, memory });
  assert.ok(messages[0].content.includes("MEMORY PROFILE HERE"));
});

test("buildSuggest truncates very long entries", () => {
  const long = "z".repeat(2000);
  const { messages } = llm.buildSuggest({ entryText: long, threads });
  assert.ok(messages[0].content.includes("…"));
  assert.ok(messages[0].content.length < 2000);
});

// ── parseSuggestion ──
test("parseSuggestion accepts a valid thread id", () => {
  const s = llm.parseSuggestion({ threadId: "t_work", confidence: 0.9, reason: "task" }, threads);
  assert.strictEqual(s.threadId, "t_work");
  assert.strictEqual(s.confidence, 0.9);
});

test("parseSuggestion nulls out a hallucinated / inbox / empty id", () => {
  assert.strictEqual(llm.parseSuggestion({ threadId: "nope", confidence: 1, reason: "" }, threads).threadId, null);
  assert.strictEqual(llm.parseSuggestion({ threadId: "inbox", confidence: 1, reason: "" }, threads).threadId, null);
  assert.strictEqual(llm.parseSuggestion({ threadId: "", confidence: 1, reason: "" }, threads).threadId, null);
});

test("parseSuggestion clamps confidence and parses raw JSON strings", () => {
  const s = llm.parseSuggestion('{"threadId":"t_health","confidence":5,"reason":"run"}', threads);
  assert.strictEqual(s.threadId, "t_health");
  assert.strictEqual(s.confidence, 1);
  const neg = llm.parseSuggestion({ threadId: "t_health", confidence: -3, reason: "" }, threads);
  assert.strictEqual(neg.confidence, 0);
});

test("parseSuggestion tolerates code-fenced JSON", () => {
  const s = llm.parseSuggestion('```json\n{"threadId":"t_work","confidence":0.5,"reason":"x"}\n```', threads);
  assert.strictEqual(s.threadId, "t_work");
});

test("parseSuggestion returns null on garbage", () => {
  assert.strictEqual(llm.parseSuggestion("not json", threads), null);
});

// ── parseReview ──
test("parseReview keeps valid moves, drops invalid/no-op/dupe", () => {
  const raw = {
    suggestions: [
      { entryId: "i1", toThreadId: "t_work", confidence: 0.8, reason: "task" },   // valid
      { entryId: "w1", toThreadId: "t_work", confidence: 0.9, reason: "same" },   // no-op (already there)
      { entryId: "i1", toThreadId: "t_health", confidence: 0.7, reason: "dupe" }, // dup entry
      { entryId: "ghost", toThreadId: "t_work", confidence: 1, reason: "x" },     // unknown entry
      { entryId: "h1", toThreadId: "nope", confidence: 1, reason: "x" },          // bad dest
    ],
  };
  const out = llm.parseReview(raw, threads);
  assert.strictEqual(out.length, 1);
  assert.deepStrictEqual(out[0], {
    entryId: "i1", fromThreadId: "inbox", toThreadId: "t_work",
    confidence: 0.8, reason: "task",
  });
});

test("parseReview returns [] on malformed input", () => {
  assert.deepStrictEqual(llm.parseReview({}, threads), []);
  assert.deepStrictEqual(llm.parseReview("garbage", threads), []);
});

// ── buildReview ──
test("buildReview labels entries with their current thread", () => {
  const { messages, _entryIndex } = llm.buildReview({ threads });
  const user = messages[0].content;
  assert.ok(user.includes('(in "Inbox")'));
  assert.ok(Array.isArray(_entryIndex) && _entryIndex.length >= 1);
});

test("buildReview does NOT use memory profiles (breaks the circular yardstick)", () => {
  const mem = { profiles: [{ id: "t_work", profile: "PROFILE_SHOULD_NOT_APPEAR" }] };
  // Even if a caller passes memory, review must not surface it as the standard.
  const built = llm.buildReview({ threads, memory: mem });
  const user = built.messages[0].content;
  assert.ok(!user.includes("PROFILE_SHOULD_NOT_APPEAR"), "profile leaked into review");
  assert.ok(user.includes("Things to do at work"), "review uses the user description");
  assert.ok(/do not assume the current placement is correct/i.test(built.system), "review warns against trusting placement");
});

// ── buildMemory / parseMemory ──
test("buildMemory includes sample entries and ids", () => {
  const { messages, schema } = llm.buildMemory({ threads });
  const user = messages[0].content;
  assert.ok(user.includes("[t_work]") && user.includes("ship the release"));
  assert.strictEqual(schema, llm.MEMORY_SCHEMA);
});

test("parseMemory keeps only known ids, dedupes", () => {
  const raw = { profiles: [
    { id: "t_work", profile: "work stuff" },
    { id: "t_work", profile: "dupe" },
    { id: "ghost", profile: "x" },
    { id: "inbox", profile: "x" },
  ] };
  const out = llm.parseMemory(raw, threads);
  assert.deepStrictEqual(out.profiles, [{ id: "t_work", profile: "work stuff" }]);
});

// ── hierarchy + entry context (ancestorChain / describeThread) ──
const nested = [
  { id: "inbox", title: "Inbox", type: "capture", entries: [] },
  { id: "p", title: "Fitness", type: "question", parentId: null, description: "Everything about getting stronger", entries: [] },
  { id: "c", title: "Leg day", type: "progress", parentId: "p", entries: [
    { id: "c1", text: "squats 3x5 at 225", subtype: "entry" },
    { id: "c2", text: "a side note", subtype: "note" },
  ] },
];

test("ancestorChain walks parentId root-most first, excludes self/inbox", () => {
  assert.deepStrictEqual(llm.ancestorChain(nested, nested[2]).map(t => t.id), ["p"]);
  assert.deepStrictEqual(llm.ancestorChain(nested, nested[1]).map(t => t.id), []);
});

test("ancestorChain is cycle-guarded", () => {
  const cyc = [
    { id: "a", title: "A", parentId: "b", entries: [] },
    { id: "b", title: "B", parentId: "a", entries: [] },
  ];
  // Should terminate, not hang.
  assert.ok(Array.isArray(llm.ancestorChain(cyc, cyc[0])));
});

test("describeThread carries hierarchy, parent description, and entries (not notes)", () => {
  const block = llm.describeThread(nested, nested[2], { sampleCount: 3 });
  assert.ok(block.includes("nested under: Fitness"), "hierarchy line");
  assert.ok(block.includes("Everything about getting stronger"), "parent description");
  assert.ok(block.includes("squats 3x5 at 225"), "sample entry");
  assert.ok(!block.includes("a side note"), "notes excluded from samples");
});

test("describeThread ignores memory profile when useMemory:false, falls back to description", () => {
  const mem = { profiles: [{ id: "c", profile: "POLLUTED_PROFILE" }] };
  const t = { ...nested[2], description: "leg workouts only" };
  const withMem = llm.describeThread(nested, t, { memory: mem, useMemory: true });
  assert.ok(withMem.includes("POLLUTED_PROFILE"), "suggest mode uses the profile");
  const noMem = llm.describeThread(nested, t, { memory: mem, useMemory: false });
  assert.ok(!noMem.includes("POLLUTED_PROFILE"), "review mode drops the profile");
  assert.ok(noMem.includes("leg workouts only"), "review mode uses the user description");
});

test("buildSuggest passes parent context + entries into the prompt", () => {
  const user = llm.buildSuggest({ entryText: "did leg press today", threads: nested }).messages[0].content;
  assert.ok(user.includes("nested under: Fitness"));
  assert.ok(user.includes("Everything about getting stronger"));
  assert.ok(user.includes("squats 3x5 at 225"));
});

test("buildMemory prompt includes ancestor context + entries", () => {
  const user = llm.buildMemory({ threads: nested }).messages[0].content;
  assert.ok(user.includes("nested under: Fitness"));
  assert.ok(user.includes("squats 3x5 at 225"));
});

console.log(`\n${passed} checks passed.`);
