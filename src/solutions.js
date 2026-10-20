// Reference solutions, shown only when the learner asks. Every one is run against its problem's tests in test/problems.test.js.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PracticeSolutions = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  return {
    "fizz-buzz": {
      complexity: "O(n) time, O(n) space",
      explain: "Test the multiple-of-15 case before the multiples of 3 and 5.",
      code:
        "function fizzBuzz(n) {\n  const out = [];\n  for (let i = 1; i <= n; i++) {\n" +
        "    if (i % 15 === 0) out.push(\"FizzBuzz\");\n    else if (i % 3 === 0) out.push(\"Fizz\");\n" +
        "    else if (i % 5 === 0) out.push(\"Buzz\");\n    else out.push(String(i));\n  }\n  return out;\n}\n",
    },
    "valid-palindrome": {
      complexity: "O(n) time, O(1) space",
      explain: "Two pointers skip non-alphanumeric characters and compare lower-cased characters.",
      code:
        "function isPalindrome(s) {\n  const isAlnum = (c) => /[a-z0-9]/i.test(c);\n  let i = 0;\n  let j = s.length - 1;\n  while (i < j) {\n" +
        "    if (!isAlnum(s[i])) i++;\n    else if (!isAlnum(s[j])) j--;\n" +
        "    else if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;\n    else { i++; j--; }\n  }\n  return true;\n}\n",
    },
    "valid-parentheses": {
      complexity: "O(n) time, O(n) space",
      explain: "Push each opener, and on a closer the top of the stack must be its matching opener.",
      code:
        "function isValid(s) {\n  const pairs = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };\n  const stack = [];\n  for (const c of s) {\n" +
        "    if (c in pairs) {\n      if (stack.pop() !== pairs[c]) return false;\n    } else {\n      stack.push(c);\n    }\n  }\n  return stack.length === 0;\n}\n",
    },
    "binary-search": {
      complexity: "O(log n) time, O(1) space",
      explain: "Inclusive bounds with `lo <= hi`, so a one-element range is still examined.",
      code:
        "function binarySearch(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n" +
        "    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}\n",
    },
    "climbing-stairs": {
      complexity: "O(n) time, O(1) space",
      explain: "Ways(n) = ways(n-1) + ways(n-2), the Fibonacci recurrence, kept as two rolling values.",
      code:
        "function climbStairs(n) {\n  let prev = 1; // ways to reach step 0\n  let cur = 1;  // ways to reach step 1\n  for (let i = 2; i <= n; i++) {\n" +
        "    [prev, cur] = [cur, prev + cur];\n  }\n  return cur;\n}\n",
    },
    "roman-to-integer": {
      complexity: "O(n) time, O(1) space",
      explain: "Subtract a symbol when the next one is larger, otherwise add it.",
      code:
        "function romanToInt(s) {\n  const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };\n  let total = 0;\n  for (let i = 0; i < s.length; i++) {\n" +
        "    const cur = v[s[i]];\n    const next = v[s[i + 1]] || 0;\n    total += cur < next ? -cur : cur;\n  }\n  return total;\n}\n",
    },
    "flatten-deep": {
      complexity: "O(total elements) time, O(depth) stack",
      explain: "Recurse into arrays and push everything else.",
      code:
        "function flattenDeep(arr) {\n  const out = [];\n  for (const item of arr) {\n    if (Array.isArray(item)) out.push(...flattenDeep(item));\n    else out.push(item);\n  }\n  return out;\n}\n",
    },
    "two-sum": {
      complexity: "O(n) time, O(n) space",
      explain: "Look up the complement before inserting the current value, so an element is never paired with itself.",
      code:
        "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n" +
        "    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n",
    },
    "best-time-to-buy-and-sell": {
      complexity: "O(n) time, O(1) space",
      explain: "Track the lowest price so far and the best profit from selling today.",
      code:
        "function maxProfit(prices) {\n  let low = Infinity;\n  let best = 0;\n  for (const p of prices) {\n    low = Math.min(low, p);\n    best = Math.max(best, p - low);\n  }\n  return best;\n}\n",
    },
    "max-subarray": {
      complexity: "O(n) time, O(1) space",
      explain: "Kadane's algorithm. Start from the first element, not 0, so all-negative input works.",
      code:
        "function maxSubArray(nums) {\n  let cur = nums[0];\n  let best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    best = Math.max(best, cur);\n  }\n  return best;\n}\n",
    },
    "longest-substring": {
      complexity: "O(n) time, O(alphabet) space",
      explain: "Sliding window with the last index of each character. The window start only ever moves forward.",
      code:
        "function lengthOfLongestSubstring(s) {\n  const last = new Map();\n  let start = 0;\n  let best = 0;\n  for (let i = 0; i < s.length; i++) {\n" +
        "    if (last.has(s[i]) && last.get(s[i]) >= start) start = last.get(s[i]) + 1;\n    last.set(s[i], i);\n    best = Math.max(best, i - start + 1);\n  }\n  return best;\n}\n",
    },
    "group-anagrams": {
      complexity: "O(n * k log k) time for n words of length k",
      explain: "The sorted letters of a word are the same for every anagram, so they key a Map of groups.",
      code:
        "function groupAnagrams(strs) {\n  const groups = new Map();\n  for (const w of strs) {\n    const key = w.split(\"\").sort().join(\"\");\n" +
        "    if (!groups.has(key)) groups.set(key, []);\n    groups.get(key).push(w);\n  }\n  return [...groups.values()];\n}\n",
    },
    "top-k-frequent": {
      complexity: "O(n log n) time (a bucket sort gets O(n))",
      explain: "Count occurrences, sort the entries by count descending, take k.",
      code:
        "function topKFrequent(nums, k) {\n  const counts = new Map();\n  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);\n" +
        "  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map((e) => e[0]);\n}\n",
    },
    "merge-intervals": {
      complexity: "O(n log n) time",
      explain: "Sort by start, then extend the last merged interval to the larger end whenever the next one starts inside it.",
      code:
        "function mergeIntervals(intervals) {\n  const sorted = intervals.map((i) => [i[0], i[1]]).sort((a, b) => a[0] - b[0]);\n  const out = [];\n  for (const cur of sorted) {\n" +
        "    const last = out[out.length - 1];\n    if (last && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]);\n    else out.push(cur);\n  }\n  return out;\n}\n",
    },
    "rotate-matrix": {
      complexity: "O(n^2) time and space",
      explain: "Row i of the clockwise rotation is column i of the input, read bottom to top.",
      code:
        "function rotate(matrix) {\n  const n = matrix.length;\n  const out = [];\n  for (let i = 0; i < n; i++) {\n    out.push([]);\n" +
        "    for (let j = n - 1; j >= 0; j--) out[i].push(matrix[j][i]);\n  }\n  return out;\n}\n",
    },
  };
});
