// Test-running core. Loaded as a plain script in the page and the Web Worker, and with require() in Node tests.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PracticeCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Strict structural equality: same types and keys. NaN equals NaN, and 0 equals -0.
  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a === "number" && typeof b === "number") return a === b;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEqual(a[k], b[k])) return false;
    }
    return true;
  }

  function key(value) {
    return JSON.stringify(value);
  }

  // Put results into a canonical order for problems where the answer is a set, not a sequence.
  //   exact           compare as returned
  //   unordered       sort the top-level array
  //   unorderedNested sort every inner array, then the top-level array
  function normalise(value, mode) {
    if (mode === "exact" || !Array.isArray(value)) return value;
    if (mode === "unordered") return value.slice().sort(byKey);
    if (mode === "unorderedNested") {
      return value.map((v) => (Array.isArray(v) ? v.slice().sort(byKey) : v)).sort(byKey);
    }
    throw new Error("Unknown compare mode: " + mode);
  }

  function byKey(x, y) {
    const a = key(x);
    const b = key(y);
    return a < b ? -1 : a > b ? 1 : 0;
  }

  function format(value, max) {
    max = max || 160;
    let text;
    if (value === undefined) text = "undefined";
    else if (typeof value === "number" && !Number.isFinite(value)) text = String(value);
    else if (typeof value === "function") text = "[function]";
    else {
      try {
        text = JSON.stringify(value);
        if (text === undefined) text = String(value);
      } catch (e) {
        text = "[unprintable value]";
      }
    }
    return text.length > max ? text.slice(0, max - 1) + "…" : text;
  }

  function compile(problem, code) {
    let fn;
    try {
      fn = new Function('"use strict";\n' + code + "\n;return typeof " + problem.fn + ' === "function" ? ' + problem.fn + " : undefined;")();
    } catch (e) {
      return { error: describeError(e) };
    }
    if (typeof fn !== "function") return { error: "Define a function named " + problem.fn + "." };
    return { fn: fn };
  }

  function describeError(e) {
    if (e && typeof e === "object" && "message" in e) return (e.name ? e.name + ": " : "") + e.message;
    return String(e);
  }

  // Run every visible and hidden test for a problem against the user's source code.
  // Hidden tests report only pass or fail, never their input or expected value.
  function runTests(problem, code) {
    const now = typeof performance !== "undefined" ? () => performance.now() : () => Date.now();
    const compiled = compile(problem, code);
    if (compiled.error) {
      return { status: "error", message: compiled.error, passed: 0, total: 0, results: [] };
    }
    const mode = problem.compare || "exact";
    const cases = problem.tests
      .map((t) => ({ args: t.args, expected: t.expected, hidden: false }))
      .concat((problem.hidden || []).map((t) => ({ args: t.args, expected: t.expected, hidden: true })));

    const results = [];
    let passed = 0;
    cases.forEach((t, index) => {
      const args = structuredClone(t.args);
      const started = now();
      let actual;
      let error = null;
      try {
        actual = compiled.fn.apply(null, args);
      } catch (e) {
        error = describeError(e);
      }
      const ms = Math.round((now() - started) * 100) / 100;
      const pass = error === null && deepEqual(normalise(actual, mode), normalise(t.expected, mode));
      if (pass) passed++;
      results.push({
        index: index,
        hidden: t.hidden,
        pass: pass,
        ms: ms,
        error: error,
        input: t.hidden ? null : t.args.map((a) => format(a)).join(", "),
        expected: t.hidden ? null : format(t.expected),
        actual: t.hidden || error !== null ? null : format(actual),
      });
    });
    return {
      status: passed === cases.length ? "passed" : "failed",
      message: "",
      passed: passed,
      total: cases.length,
      results: results,
    };
  }

  return { deepEqual: deepEqual, normalise: normalise, format: format, runTests: runTests };
});
