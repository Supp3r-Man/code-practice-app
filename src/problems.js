// Problem data only: no functions, so it can be posted to a Web Worker. Reference solutions live in solutions.js.
// `tests` are shown to the learner; `hidden` tests report only pass or fail.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PracticeProblems = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  return [
    {
      id: "fizz-buzz",
      title: "Fizz Buzz",
      difficulty: "easy",
      tags: ["loops", "strings"],
      fn: "fizzBuzz",
      prompt:
        "Return an array of strings for the numbers 1 to `n`.\n\n" +
        "- multiples of 3 become `\"Fizz\"`\n- multiples of 5 become `\"Buzz\"`\n- multiples of both become `\"FizzBuzz\"`\n- everything else is the number as a string\n\n" +
        "If `n` is 0, return an empty array.",
      starter: "function fizzBuzz(n) {\n  // your code here\n}\n",
      hints: ["Check the multiple-of-15 case first, otherwise 15 matches the multiple-of-3 branch and never reaches FizzBuzz."],
      tests: [
        { args: [1], expected: ["1"] },
        { args: [3], expected: ["1", "2", "Fizz"] },
        { args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
      ],
      hidden: [
        { args: [0], expected: [] },
        { args: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] },
      ],
    },
    {
      id: "valid-palindrome",
      title: "Valid Palindrome",
      difficulty: "easy",
      tags: ["strings", "two-pointers"],
      fn: "isPalindrome",
      prompt:
        "Return `true` if the string reads the same forwards and backwards after you lower-case it and remove every character that is not a letter or a digit.\n\n" +
        "```\nisPalindrome(\"A man, a plan, a canal: Panama\")  // true\nisPalindrome(\"race a car\")                       // false\n```\n\n" +
        "An empty string (or one with no letters or digits) counts as a palindrome.",
      starter: "function isPalindrome(s) {\n  // your code here\n}\n",
      hints: ["Digits count as characters. `\"0P\"` is not a palindrome.", "Two pointers moving inwards avoid building a second string."],
      tests: [
        { args: ["A man, a plan, a canal: Panama"], expected: true },
        { args: ["race a car"], expected: false },
        { args: [" "], expected: true },
      ],
      hidden: [
        { args: ["0P"], expected: false },
        { args: ["ab_a"], expected: true },
        { args: [""], expected: true },
        { args: ["No 'x' in Nixon"], expected: true },
      ],
    },
    {
      id: "valid-parentheses",
      title: "Valid Parentheses",
      difficulty: "easy",
      tags: ["stack", "strings"],
      fn: "isValid",
      prompt:
        "The string contains only the characters `( ) [ ] { }`. Return `true` if every bracket is closed by the same type of bracket, in the correct order.\n\n" +
        "```\nisValid(\"()[]{}\")  // true\nisValid(\"(]\")      // false\nisValid(\"([)]\")    // false\n```\n\n" +
        "The empty string is valid.",
      starter: "function isValid(s) {\n  // your code here\n}\n",
      hints: ["Counting each bracket type is not enough: `\"([)]\"` has matching counts but is invalid.", "Push openers on a stack and compare on every closer."],
      tests: [
        { args: ["()"], expected: true },
        { args: ["()[]{}"], expected: true },
        { args: ["(]"], expected: false },
      ],
      hidden: [
        { args: ["([)]"], expected: false },
        { args: ["{[]}"], expected: true },
        { args: ["("], expected: false },
        { args: [")"], expected: false },
        { args: [""], expected: true },
      ],
    },
    {
      id: "binary-search",
      title: "Binary Search",
      difficulty: "easy",
      tags: ["search", "arrays"],
      fn: "binarySearch",
      prompt:
        "`nums` is sorted in ascending order with no duplicates. Return the index of `target`, or `-1` if it is not present. Aim for O(log n).\n\n" +
        "```\nbinarySearch([-1, 0, 3, 5, 9, 12], 9)  // 4\nbinarySearch([-1, 0, 3, 5, 9, 12], 2)  // -1\n```",
      starter: "function binarySearch(nums, target) {\n  // your code here\n}\n",
      hints: ["Decide whether your bounds are inclusive or exclusive and keep the loop condition consistent with that.", "A one-element array is the case that most often breaks the loop condition."],
      tests: [
        { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
        { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
        { args: [[5], 5], expected: 0 },
      ],
      hidden: [
        { args: [[5], -5], expected: -1 },
        { args: [[1, 2], 2], expected: 1 },
        { args: [[1, 3, 5, 7], 7], expected: 3 },
        { args: [[1, 3, 5, 7], 1], expected: 0 },
        { args: [[], 3], expected: -1 },
      ],
    },
    {
      id: "climbing-stairs",
      title: "Climbing Stairs",
      difficulty: "easy",
      tags: ["dynamic-programming", "math"],
      fn: "climbStairs",
      prompt:
        "You can climb 1 or 2 steps at a time. Return the number of distinct ways to reach the top of a staircase with `n` steps (`n` is at least 1).\n\n" +
        "```\nclimbStairs(2)  // 2   (1+1, 2)\nclimbStairs(3)  // 3   (1+1+1, 1+2, 2+1)\n```\n\n" +
        "Plain recursion is far too slow for `n = 45`.",
      starter: "function climbStairs(n) {\n  // your code here\n}\n",
      hints: ["The ways to reach step n are the ways to reach n-1 plus the ways to reach n-2.", "You only need the last two values, so O(1) space is enough."],
      tests: [
        { args: [1], expected: 1 },
        { args: [2], expected: 2 },
        { args: [3], expected: 3 },
        { args: [5], expected: 8 },
      ],
      hidden: [
        { args: [10], expected: 89 },
        { args: [20], expected: 10946 },
        { args: [45], expected: 1836311903 },
      ],
    },
    {
      id: "roman-to-integer",
      title: "Roman to Integer",
      difficulty: "easy",
      tags: ["strings", "hash-map"],
      fn: "romanToInt",
      prompt:
        "Convert a Roman numeral (1 to 3999) to an integer. `I V X L C D M` are 1, 5, 10, 50, 100, 500, 1000.\n\n" +
        "A smaller value written before a larger one is subtracted: `IV` is 4, `IX` is 9, `XL` is 40, `CM` is 900.\n\n" +
        "```\nromanToInt(\"MCMXCIV\")  // 1994\n```",
      starter: "function romanToInt(s) {\n  // your code here\n}\n",
      hints: ["Walk the string and subtract a symbol when the next symbol is larger, otherwise add it."],
      tests: [
        { args: ["III"], expected: 3 },
        { args: ["LVIII"], expected: 58 },
        { args: ["MCMXCIV"], expected: 1994 },
      ],
      hidden: [
        { args: ["IV"], expected: 4 },
        { args: ["IX"], expected: 9 },
        { args: ["XL"], expected: 40 },
        { args: ["CDXLIV"], expected: 444 },
        { args: ["MMMCMXCIX"], expected: 3999 },
      ],
    },
    {
      id: "flatten-deep",
      title: "Flatten Deep",
      difficulty: "easy",
      tags: ["recursion", "arrays"],
      fn: "flattenDeep",
      prompt:
        "Return a new one-dimensional array with every nested array unwrapped, however deep. Keep the order. Non-array values such as `null` and `false` are kept as they are.\n\n" +
        "```\nflattenDeep([1, [2, [3, [4]]]])  // [1, 2, 3, 4]\n```",
      starter: "function flattenDeep(arr) {\n  // your code here\n}\n",
      hints: ["`Array.prototype.flat(Infinity)` exists, but try it with recursion first.", "Empty nested arrays contribute nothing."],
      tests: [
        { args: [[1, [2, [3, [4]]]]], expected: [1, 2, 3, 4] },
        { args: [[]], expected: [] },
        { args: [[[], [[]]]], expected: [] },
      ],
      hidden: [
        { args: [[1, 2, 3]], expected: [1, 2, 3] },
        { args: [[[[[5]]]]], expected: [5] },
        { args: [[0, [null, [false]]]], expected: [0, null, false] },
      ],
    },
    {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "easy",
      tags: ["arrays", "hash-map"],
      fn: "twoSum",
      prompt:
        "Return the indices of the two different elements of `nums` that add up to `target`, as an array in ascending order. Exactly one such pair exists.\n\n" +
        "```\ntwoSum([2, 7, 11, 15], 9)  // [0, 1]\ntwoSum([3, 3], 6)          // [0, 1]\n```\n\n" +
        "Do not use the same element twice.",
      starter: "function twoSum(nums, target) {\n  // your code here\n}\n",
      hints: ["Store each value's index in a Map as you go, and look up `target - value` before inserting.", "Negative numbers and zeros are valid inputs."],
      tests: [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { args: [[3, 2, 4], 6], expected: [1, 2] },
        { args: [[3, 3], 6], expected: [0, 1] },
      ],
      hidden: [
        { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
        { args: [[0, 4, 3, 0], 0], expected: [0, 3] },
        { args: [[1, 5, 5, 8], 10], expected: [1, 2] },
      ],
    },
    {
      id: "best-time-to-buy-and-sell",
      title: "Best Time to Buy and Sell",
      difficulty: "easy",
      tags: ["arrays", "greedy"],
      fn: "maxProfit",
      prompt:
        "`prices[i]` is the price on day `i`. Buy once and sell once on a later day. Return the maximum profit, or `0` if no profit is possible.\n\n" +
        "```\nmaxProfit([7, 1, 5, 3, 6, 4])  // 5   (buy at 1, sell at 6)\nmaxProfit([7, 6, 4, 3, 1])     // 0\n```",
      starter: "function maxProfit(prices) {\n  // your code here\n}\n",
      hints: ["You must buy before you sell, so the overall minimum and maximum may be in the wrong order.", "Track the lowest price seen so far as you scan."],
      tests: [
        { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
        { args: [[7, 6, 4, 3, 1]], expected: 0 },
        { args: [[2, 4, 1]], expected: 2 },
      ],
      hidden: [
        { args: [[1]], expected: 0 },
        { args: [[]], expected: 0 },
        { args: [[3, 2, 6, 5, 0, 3]], expected: 4 },
        { args: [[1, 2, 3, 4, 5]], expected: 4 },
      ],
    },
    {
      id: "max-subarray",
      title: "Maximum Subarray",
      difficulty: "medium",
      tags: ["arrays", "dynamic-programming"],
      fn: "maxSubArray",
      prompt:
        "Return the largest sum of any non-empty contiguous subarray of `nums`.\n\n" +
        "```\nmaxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])  // 6   ([4, -1, 2, 1])\nmaxSubArray([-3, -2, -5])                    // -2\n```",
      starter: "function maxSubArray(nums) {\n  // your code here\n}\n",
      hints: ["If every number is negative the answer is the largest single number, not 0.", "Kadane's algorithm: at each element choose between extending the current run or starting a new one."],
      tests: [
        { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
        { args: [[1]], expected: 1 },
        { args: [[5, 4, -1, 7, 8]], expected: 23 },
      ],
      hidden: [
        { args: [[-1]], expected: -1 },
        { args: [[-2, -1]], expected: -1 },
        { args: [[-3, -2, -5]], expected: -2 },
        { args: [[2, -1, 2, -1, 2]], expected: 4 },
      ],
    },
    {
      id: "longest-substring",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "medium",
      tags: ["strings", "sliding-window"],
      fn: "lengthOfLongestSubstring",
      prompt:
        "Return the length of the longest substring of `s` that contains no repeated character.\n\n" +
        "```\nlengthOfLongestSubstring(\"abcabcbb\")  // 3   (\"abc\")\nlengthOfLongestSubstring(\"pwwkew\")    // 3   (\"wke\")\n```",
      starter: "function lengthOfLongestSubstring(s) {\n  // your code here\n}\n",
      hints: ["Keep a window [start, i] and the last index of each character.", "When you see a repeat, move `start` just past the earlier copy, but never move it backwards (`\"abba\"`)."],
      tests: [
        { args: ["abcabcbb"], expected: 3 },
        { args: ["bbbbb"], expected: 1 },
        { args: ["pwwkew"], expected: 3 },
      ],
      hidden: [
        { args: [""], expected: 0 },
        { args: [" "], expected: 1 },
        { args: ["dvdf"], expected: 3 },
        { args: ["abba"], expected: 2 },
      ],
    },
    {
      id: "group-anagrams",
      title: "Group Anagrams",
      difficulty: "medium",
      tags: ["strings", "hash-map"],
      fn: "groupAnagrams",
      compare: "unorderedNested",
      prompt:
        "Group the words that are anagrams of each other. Return an array of groups. The order of the groups and the order of words inside a group do not matter.\n\n" +
        "```\ngroupAnagrams([\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"])\n// [[\"bat\"], [\"nat\", \"tan\"], [\"ate\", \"eat\", \"tea\"]]\n```",
      starter: "function groupAnagrams(strs) {\n  // your code here\n}\n",
      hints: ["Two words are anagrams if their sorted letters are equal, so the sorted letters make a good Map key."],
      tests: [
        { args: [["eat", "tea", "tan", "ate", "nat", "bat"]], expected: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]] },
        { args: [[""]], expected: [[""]] },
        { args: [["a"]], expected: [["a"]] },
      ],
      hidden: [
        { args: [["ab", "ba", "abc"]], expected: [["ab", "ba"], ["abc"]] },
        { args: [["aab", "aba", "baa", "abb"]], expected: [["aab", "aba", "baa"], ["abb"]] },
        { args: [[]], expected: [] },
      ],
    },
    {
      id: "top-k-frequent",
      title: "Top K Frequent Elements",
      difficulty: "medium",
      tags: ["arrays", "hash-map", "sorting"],
      fn: "topKFrequent",
      compare: "unordered",
      prompt:
        "Return the `k` most frequent values in `nums`. The answer is unique for every test, and the order of the returned values does not matter.\n\n" +
        "```\ntopKFrequent([1, 1, 1, 2, 2, 3], 2)  // [1, 2]\n```",
      starter: "function topKFrequent(nums, k) {\n  // your code here\n}\n",
      hints: ["Count with a Map, then sort the entries by count descending and take the first k."],
      tests: [
        { args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
        { args: [[1], 1], expected: [1] },
        { args: [[1, 2], 2], expected: [1, 2] },
      ],
      hidden: [
        { args: [[4, 4, 4, 5, 5, 6, 6, 6, 6], 2], expected: [4, 6] },
        { args: [[-1, -1, 2, 2, 3], 2], expected: [-1, 2] },
        { args: [[5, 3, 3, 3, 5, 9, 9, 9, 9, 1], 1], expected: [9] },
      ],
    },
    {
      id: "merge-intervals",
      title: "Merge Intervals",
      difficulty: "medium",
      tags: ["arrays", "sorting"],
      fn: "mergeIntervals",
      prompt:
        "Merge every overlapping interval and return the result sorted by start. Intervals that only touch (`[1, 4]` and `[4, 5]`) count as overlapping.\n\n" +
        "```\nmergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]])  // [[1, 6], [8, 10], [15, 18]]\n```\n\n" +
        "The input is not sorted.",
      starter: "function mergeIntervals(intervals) {\n  // your code here\n}\n",
      hints: ["Sort by start first.", "When two intervals overlap the merged end is the larger of the two ends, because one interval can sit entirely inside another."],
      tests: [
        { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
        { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
        { args: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
      ],
      hidden: [
        { args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
        { args: [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]], expected: [[1, 10]] },
        { args: [[]], expected: [] },
        { args: [[[5, 6], [1, 2]]], expected: [[1, 2], [5, 6]] },
      ],
    },
    {
      id: "rotate-matrix",
      title: "Rotate Matrix",
      difficulty: "medium",
      tags: ["matrix", "arrays"],
      fn: "rotate",
      prompt:
        "Given an n x n matrix, return a new matrix rotated 90 degrees clockwise. Do not modify the input.\n\n" +
        "```\nrotate([[1, 2, 3], [4, 5, 6], [7, 8, 9]])\n// [[7, 4, 1], [8, 5, 2], [9, 6, 3]]\n```",
      starter: "function rotate(matrix) {\n  // your code here\n}\n",
      hints: ["Row i of the result is column i of the input, read from bottom to top.", "Alternatively transpose, then reverse every row."],
      tests: [
        { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
        { args: [[[1]]], expected: [[1]] },
        { args: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
      ],
      hidden: [
        {
          args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]],
          expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]],
        },
        { args: [[]], expected: [] },
      ],
    },
  ];
});
