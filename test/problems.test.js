const test = require("node:test");
const assert = require("node:assert/strict");
const { runTests } = require("../src/core.js");
const problems = require("../src/problems.js");
const solutions = require("../src/solutions.js");
const wrong = require("../fixtures/wrong-solutions.js");

test("problem ids are unique, kebab-case and every problem has the required fields", () => {
  const ids = problems.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of problems) {
    assert.match(p.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.id);
    assert.ok(p.title && p.prompt && p.starter, p.id + " needs title, prompt and starter");
    assert.ok(["easy", "medium", "hard"].includes(p.difficulty), p.id + " difficulty");
    assert.ok(Array.isArray(p.tags) && p.tags.length > 0, p.id + " tags");
    assert.ok(Array.isArray(p.hints) && p.hints.length > 0, p.id + " hints");
    assert.match(p.fn, /^[A-Za-z_$][\w$]*$/, p.id + " fn name");
    assert.ok(["exact", "unordered", "unorderedNested", undefined].includes(p.compare), p.id + " compare mode");
  }
});

test("every problem has at least 3 visible and 2 hidden tests, with array args", () => {
  for (const p of problems) {
    assert.ok(p.tests.length >= 3, p.id + " visible tests");
    assert.ok(p.hidden.length >= 2, p.id + " hidden tests");
    for (const t of [...p.tests, ...p.hidden]) {
      assert.ok(Array.isArray(t.args), p.id + " args must be an array");
      assert.ok("expected" in t, p.id + " expected");
    }
  }
});

test("problem data is plain JSON-like data that survives structuredClone (it is posted to a Worker)", () => {
  for (const p of problems) assert.doesNotThrow(() => structuredClone(p), p.id);
});

test("the starter code defines the function the tests call, and does not pass", () => {
  for (const p of problems) {
    assert.match(p.starter, new RegExp("function\\s+" + p.fn + "\\s*\\("), p.id + " starter names " + p.fn);
    const r = runTests(p, p.starter);
    assert.notEqual(r.status, "passed", p.id + " starter must not already pass");
  }
});

test("every problem has a reference solution and every solution has a problem", () => {
  assert.deepEqual(Object.keys(solutions).sort(), problems.map((p) => p.id).sort());
  for (const s of Object.values(solutions)) assert.ok(s.code && s.explain && s.complexity);
});

test("each reference solution passes all of its tests", () => {
  for (const p of problems) {
    const r = runTests(p, solutions[p.id].code);
    const failed = r.results.filter((x) => !x.pass).map((x) => x.index);
    assert.equal(r.status, "passed", p.id + " failing test indexes: " + failed.join(",") + " " + r.message);
    assert.equal(r.passed, p.tests.length + p.hidden.length);
  }
});

test("each known-wrong solution fails (the tests are not vacuous)", () => {
  assert.deepEqual(Object.keys(wrong).sort(), problems.map((p) => p.id).sort(), "one wrong solution per problem");
  for (const p of problems) {
    const r = runTests(p, wrong[p.id].code);
    assert.equal(r.status, "failed", p.id + " wrong solution (" + wrong[p.id].why + ") must fail");
  }
});

test("bugs marked hiddenOnly pass every visible test and fail a hidden one; the others fail a visible test", () => {
  for (const p of problems) {
    const r = runTests(p, wrong[p.id].code);
    const visibleFail = r.results.some((x) => !x.hidden && !x.pass);
    const hiddenFail = r.results.some((x) => x.hidden && !x.pass);
    if (wrong[p.id].hiddenOnly) {
      assert.equal(visibleFail, false, p.id + " is marked hiddenOnly but fails a visible test");
      assert.equal(hiddenFail, true, p.id + " is marked hiddenOnly but no hidden test catches it");
    } else {
      assert.equal(visibleFail, true, p.id + " is not marked hiddenOnly but passes every visible test");
    }
  }
});

test("hidden test results never leak input, expected or actual", () => {
  const p = problems[0];
  const r = runTests(p, p.starter);
  for (const x of r.results.filter((y) => y.hidden)) {
    assert.equal(x.input, null);
    assert.equal(x.expected, null);
    assert.equal(x.actual, null);
  }
});
