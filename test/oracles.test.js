// Cross-check the expected values in problems.js against deliberately naive, independent implementations, so a test case
// cannot be wrong in the same way as the reference solution that was written alongside it.
const test = require("node:test");
const assert = require("node:assert/strict");
const problems = require("../src/problems.js");

const byId = (id) => problems.find((p) => p.id === id);
const allCases = (id) => [...byId(id).tests, ...byId(id).hidden];

function eachCase(id, oracle, norm) {
  norm = norm || ((x) => x);
  for (const t of allCases(id)) {
    assert.deepEqual(norm(oracle(...structuredClone(t.args))), norm(t.expected), id + " " + JSON.stringify(t.args));
  }
}

test("two-sum expected indices come from an exhaustive pair search, and the pair is unique", () => {
  for (const t of allCases("two-sum")) {
    const [nums, target] = t.args;
    const pairs = [];
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] + nums[j] === target) pairs.push([i, j]);
    assert.equal(pairs.length, 1, "exactly one pair for " + JSON.stringify(t.args));
    assert.deepEqual(pairs[0], t.expected);
  }
});

test("max-subarray expected values come from checking every subarray", () => {
  eachCase("max-subarray", (nums) => {
    let best = -Infinity;
    for (let i = 0; i < nums.length; i++) {
      let sum = 0;
      for (let j = i; j < nums.length; j++) {
        sum += nums[j];
        best = Math.max(best, sum);
      }
    }
    return best;
  });
});

test("best-time expected values come from checking every buy/sell pair", () => {
  eachCase("best-time-to-buy-and-sell", (prices) => {
    let best = 0;
    for (let i = 0; i < prices.length; i++) for (let j = i + 1; j < prices.length; j++) best = Math.max(best, prices[j] - prices[i]);
    return best;
  });
});

test("longest-substring expected values come from checking every substring", () => {
  eachCase("longest-substring", (s) => {
    let best = 0;
    for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1);
      if (new Set(sub).size === sub.length) best = Math.max(best, sub.length);
    }
    return best;
  });
});

test("climbing-stairs expected values come from counting step sequences", () => {
  const count = (n, memo = new Map()) => (n <= 1 ? 1 : memo.get(n) ?? (memo.set(n, count(n - 1, memo) + count(n - 2, memo)), memo.get(n)));
  eachCase("climbing-stairs", (n) => count(n));
  // and the smallest cases by explicit enumeration of 1/2 step sequences
  const enumerate = (n) => (n === 0 ? 1 : n < 0 ? 0 : enumerate(n - 1) + enumerate(n - 2));
  for (const n of [1, 2, 3, 5, 10]) assert.equal(enumerate(n), byId("climbing-stairs").tests.concat(byId("climbing-stairs").hidden).find((t) => t.args[0] === n).expected);
});

test("merge-intervals expected values come from point coverage on a doubled grid", () => {
  eachCase("merge-intervals", (intervals) => {
    // Touching intervals merge, so treat each integer endpoint and the half-step after it as covered.
    const covered = new Set();
    for (const [a, b] of intervals) for (let x = a * 2; x <= b * 2; x++) covered.add(x);
    const xs = [...covered].sort((p, q) => p - q);
    const out = [];
    for (const x of xs) {
      const last = out[out.length - 1];
      if (last && x === last[1] + 1) last[1] = x;
      else out.push([x, x]);
    }
    return out.map(([a, b]) => [a / 2, b / 2]);
  });
});

test("roman-to-integer expected values round-trip through an independent integer-to-roman encoder", () => {
  const table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  const toRoman = (n) => table.reduce((acc, [v, s]) => { while (n >= v) { acc += s; n -= v; } return acc; }, "");
  for (const t of allCases("roman-to-integer")) assert.equal(toRoman(t.expected), t.args[0]);
});

test("rotate-matrix expected values satisfy the rotation index formula", () => {
  for (const t of allCases("rotate-matrix")) {
    const m = t.args[0];
    const n = m.length;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) assert.equal(t.expected[j][n - 1 - i], m[i][j]);
    assert.equal(t.expected.length, n);
  }
});

test("top-k-frequent expected values have strictly higher counts than every excluded value (so the answer is unique)", () => {
  for (const t of allCases("top-k-frequent")) {
    const [nums, k] = t.args;
    const counts = new Map();
    for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);
    assert.equal(t.expected.length, k);
    const minIn = Math.min(...t.expected.map((v) => counts.get(v)));
    const maxOut = Math.max(0, ...[...counts].filter(([v]) => !t.expected.includes(v)).map(([, c]) => c));
    assert.ok(minIn > maxOut, "ambiguous top-k for " + JSON.stringify(t.args));
  }
});

test("group-anagrams expected groups partition the input and each group shares one letter signature", () => {
  for (const t of allCases("group-anagrams")) {
    const sig = (w) => [...w].sort().join("");
    const flat = t.expected.flat();
    assert.deepEqual([...flat].sort(), [...t.args[0]].sort());
    for (const g of t.expected) assert.equal(new Set(g.map(sig)).size, 1);
    assert.equal(new Set(t.expected.map((g) => sig(g[0]))).size, t.expected.length, "two groups share a signature");
  }
});
