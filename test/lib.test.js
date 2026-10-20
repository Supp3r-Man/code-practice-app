const test = require("node:test");
const assert = require("node:assert/strict");
const { parseInline, parseRich, filterProblems, createStore } = require("../src/lib.js");
const problems = require("../src/problems.js");

test("parseInline splits `code` spans and keeps an unclosed backtick as text", () => {
  assert.deepEqual(parseInline("a `b` c"), [{ code: false, text: "a " }, { code: true, text: "b" }, { code: false, text: " c" }]);
  assert.deepEqual(parseInline("plain"), [{ code: false, text: "plain" }]);
  assert.deepEqual(parseInline("open `tick"), [{ code: false, text: "open " }, { code: false, text: "`tick" }]);
  assert.deepEqual(parseInline("`only`"), [{ code: true, text: "only" }]);
  assert.deepEqual(parseInline(""), []);
});

test("parseRich builds paragraphs, bullet lists and fenced code blocks", () => {
  const blocks = parseRich("First line\nsecond line.\n\n- one\n- two with `code`\n\n```\nx = 1\n  y = 2\n```\n\nEnd.");
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["p", "ul", "pre", "p"]
  );
  assert.equal(blocks[0].inline[0].text, "First line second line.");
  assert.equal(blocks[1].items.length, 2);
  assert.deepEqual(blocks[1].items[1], [{ code: false, text: "two with " }, { code: true, text: "code" }]);
  assert.equal(blocks[2].text, "x = 1\n  y = 2");
});

test("parseRich survives an unclosed fence and CRLF line endings", () => {
  const blocks = parseRich("intro\r\n\r\n```\r\ncode here");
  assert.deepEqual(blocks.map((b) => b.type), ["p", "pre"]);
  assert.equal(blocks[1].text, "code here");
});

test("every real problem prompt parses to at least one block and has balanced code fences", () => {
  for (const p of problems) {
    assert.ok(parseRich(p.prompt).length > 0, p.id);
    assert.equal((p.prompt.match(/```/g) || []).length % 2, 0, p.id + " has an unclosed code fence");
  }
});

test("filterProblems combines difficulty, status and a case-insensitive title/tag search", () => {
  const solved = { "fizz-buzz": "2026-01-01" };
  const ids = (f) => filterProblems(problems, f, solved).map((p) => p.id);
  assert.equal(ids({}).length, problems.length);
  assert.ok(ids({ difficulty: "medium" }).every((id) => problems.find((p) => p.id === id).difficulty === "medium"));
  assert.deepEqual(ids({ status: "solved" }), ["fizz-buzz"]);
  assert.equal(ids({ status: "todo" }).length, problems.length - 1);
  assert.ok(ids({ query: "HASH-MAP" }).includes("two-sum"));
  assert.ok(ids({ query: "  palindrome " }).includes("valid-palindrome"));
  assert.deepEqual(ids({ query: "zzzz-no-match" }), []);
  assert.deepEqual(ids({ difficulty: "easy", status: "solved", query: "fizz" }), ["fizz-buzz"]);
  assert.deepEqual(ids({ difficulty: "medium", status: "solved" }), []);
});

function memoryStorage(initial) {
  const m = new Map(Object.entries(initial || {}));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), dump: () => Object.fromEntries(m) };
}

test("the store persists solved problems and drafts and reloads them", () => {
  const storage = memoryStorage();
  const a = createStore(storage, "k");
  assert.equal(a.isSolved("two-sum"), false);
  a.saveCode("two-sum", "draft");
  a.markSolved("two-sum", "2026-10-20T00:00:00Z");
  const b = createStore(storage, "k");
  assert.equal(b.isSolved("two-sum"), true);
  assert.equal(b.getCode("two-sum"), "draft");
  assert.equal(b.getCode("other"), null);
  assert.equal(b.solvedCount(["two-sum", "other"]), 1);
});

test("markSolved keeps the first solve date and clearCode removes only the draft", () => {
  const s = createStore(memoryStorage(), "k");
  s.markSolved("a", "first");
  s.markSolved("a", "second");
  assert.equal(s.solved().a, "first");
  s.saveCode("a", "x");
  s.clearCode("a");
  assert.equal(s.getCode("a"), null);
  assert.equal(s.isSolved("a"), true);
});

test("the store ignores corrupt or wrongly shaped saved data instead of crashing", () => {
  for (const raw of ["{not json", "null", "[]", '"str"', '{"solved":[1],"code":"x"}']) {
    const s = createStore(memoryStorage({ k: raw }), "k");
    assert.deepEqual(s.solved(), {}, raw);
    assert.equal(s.getCode("a"), null, raw);
  }
});

test("the store keeps working in memory when storage is missing or throws", () => {
  const none = createStore(null, "k");
  assert.equal(none.saveCode("a", "x"), true);
  assert.equal(none.getCode("a"), "x");
  const full = createStore({ getItem: () => null, setItem: () => { throw new Error("quota"); } }, "k");
  assert.equal(full.markSolved("a"), false, "reports the failed save");
  assert.equal(full.isSolved("a"), true, "but still remembers it for this session");
  const broken = createStore({ getItem: () => { throw new Error("denied"); }, setItem: () => {} }, "k");
  assert.deepEqual(broken.solved(), {});
});

test("the store ignores non-string drafts in saved data", () => {
  const s = createStore(memoryStorage({ k: JSON.stringify({ solved: {}, code: { a: 5, b: "ok" } }) }), "k");
  assert.equal(s.getCode("a"), null);
  assert.equal(s.getCode("b"), "ok");
});
