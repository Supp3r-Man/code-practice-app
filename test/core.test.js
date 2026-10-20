const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { deepEqual, normalise, format, runTests } = require("../src/core.js");

const problem = (over) =>
  Object.assign(
    {
      id: "t",
      fn: "add",
      tests: [{ args: [1, 2], expected: 3 }],
      hidden: [{ args: [5, 5], expected: 10 }],
    },
    over
  );

test("deepEqual distinguishes types, shapes and key sets", () => {
  assert.equal(deepEqual([1, [2, { a: 3 }]], [1, [2, { a: 3 }]]), true);
  assert.equal(deepEqual([1, 2], [1, 2, 3]), false);
  assert.equal(deepEqual(1, "1"), false);
  assert.equal(deepEqual(null, undefined), false);
  assert.equal(deepEqual({ a: 1 }, { a: 1, b: undefined }), false);
  assert.equal(deepEqual([], {}), false);
  assert.equal(deepEqual(NaN, NaN), true);
  assert.equal(deepEqual(0, -0), true);
  assert.equal(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
});

test("normalise sorts only where the problem says order does not matter", () => {
  assert.deepEqual(normalise([3, 1, 2], "exact"), [3, 1, 2]);
  assert.deepEqual(normalise([3, 1, 2], "unordered"), [1, 2, 3]);
  assert.deepEqual(normalise([["b", "a"], ["c"]], "unordered"), [["b", "a"], ["c"]].sort());
  assert.deepEqual(normalise([["c"], ["b", "a"]], "unorderedNested"), [["a", "b"], ["c"]]);
  assert.equal(normalise(7, "unordered"), 7);
  assert.throws(() => normalise([1], "bogus"), /Unknown compare mode/);
});

test("normalise does not mutate its input", () => {
  const input = [3, 1, 2];
  normalise(input, "unordered");
  assert.deepEqual(input, [3, 1, 2]);
});

test("format handles undefined, infinities, functions, long values and cycles", () => {
  assert.equal(format(undefined), "undefined");
  assert.equal(format(Infinity), "Infinity");
  assert.equal(format(() => 1), "[function]");
  assert.equal(format("ab"), '"ab"');
  assert.equal(format("x".repeat(500), 20).length, 20);
  const cyc = {};
  cyc.self = cyc;
  assert.equal(format(cyc), "[unprintable value]");
});

test("a correct solution passes and counts visible and hidden tests", () => {
  const r = runTests(problem(), "function add(a, b) { return a + b; }");
  assert.equal(r.status, "passed");
  assert.equal(r.passed, 2);
  assert.equal(r.total, 2);
  assert.equal(r.results[0].input, "1, 2");
  assert.equal(r.results[0].expected, "3");
  assert.equal(r.results[0].actual, "3");
});

test("a wrong answer fails with actual and expected shown for visible tests only", () => {
  const r = runTests(problem(), "function add(a, b) { return a - b; }");
  assert.equal(r.status, "failed");
  assert.equal(r.passed, 0);
  assert.equal(r.results[0].actual, "-1");
  assert.equal(r.results[1].hidden, true);
  assert.equal(r.results[1].actual, null);
});

test("a thrown error fails only that test and is reported", () => {
  const r = runTests(problem(), "function add(a, b) { if (a === 1) throw new TypeError('boom'); return a + b; }");
  assert.equal(r.status, "failed");
  assert.equal(r.results[0].pass, false);
  assert.equal(r.results[0].error, "TypeError: boom");
  assert.equal(r.results[1].pass, true);
});

test("a syntax error is reported as a compile error before any test runs", () => {
  const r = runTests(problem(), "function add(a, b) { return a + ; }");
  assert.equal(r.status, "error");
  assert.match(r.message, /SyntaxError/);
  assert.equal(r.total, 0);
});

test("a missing function is reported with its expected name", () => {
  const r = runTests(problem(), "const x = 1;");
  assert.equal(r.status, "error");
  assert.equal(r.message, "Define a function named add.");
});

test("top-level code that throws is reported as an error", () => {
  const r = runTests(problem(), "throw new Error('top level'); function add(a, b) { return a + b; }");
  assert.equal(r.status, "error");
  assert.match(r.message, /top level/);
});

test("a solution cannot corrupt later tests by mutating its arguments", () => {
  const p = problem({
    fn: "first",
    tests: [{ args: [[1, 2]], expected: 1 }],
    hidden: [{ args: [[1, 2]], expected: 1 }],
  });
  const r = runTests(p, "function first(a) { const x = a[0]; a.length = 0; return x; }");
  assert.equal(r.status, "passed");
  assert.deepEqual(p.tests[0].args, [[1, 2]], "problem data must be untouched");
});

test("unordered compare accepts any order and still rejects wrong contents", () => {
  const p = problem({ fn: "ids", compare: "unordered", tests: [{ args: [], expected: [1, 2, 3] }], hidden: [] });
  assert.equal(runTests(p, "function ids() { return [3, 1, 2]; }").status, "passed");
  assert.equal(runTests(p, "function ids() { return [3, 1, 4]; }").status, "failed");
  assert.equal(runTests(p, "function ids() { return [1, 2]; }").status, "failed");
});

test("returning undefined or NaN is handled without crashing", () => {
  const p = problem({ fn: "f", tests: [{ args: [], expected: NaN }], hidden: [] });
  assert.equal(runTests(p, "function f() { return NaN; }").status, "passed");
  assert.equal(runTests(p, "function f() {}").status, "failed");
});

test("user code that never returns needs an outside timeout (vm here, Worker.terminate in the page)", () => {
  const sandbox = { runTests, p: problem(), code: "function add(a, b) { while (true) {} }" };
  assert.throws(() => vm.runInNewContext("runTests(p, code)", sandbox, { timeout: 300 }), /timed out/);
});
