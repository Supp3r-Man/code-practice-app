// Test fixture. One plausible, commonly written bug per problem. test/problems.test.js requires every one of these to FAIL the problem's tests,
// which is what shows the tests are not vacuous. `hiddenOnly: true` marks bugs that pass every visible test and are caught
// only by a hidden test.
module.exports = {
  "fizz-buzz": {
    why: "checks 3 and 5 before 15, so 15 prints Fizz",
    code: 'function fizzBuzz(n){const o=[];for(let i=1;i<=n;i++){if(i%3===0)o.push("Fizz");else if(i%5===0)o.push("Buzz");else if(i%15===0)o.push("FizzBuzz");else o.push(String(i));}return o;}',
    hiddenOnly: true,
  },
  "valid-palindrome": {
    why: "strips digits as well as punctuation",
    code: "function isPalindrome(s){const t=s.toLowerCase().replace(/[^a-z]/g,'');return t===t.split('').reverse().join('');}",
    hiddenOnly: true,
  },
  "valid-parentheses": {
    why: "only compares counts of each bracket type",
    code: "function isValid(s){const c=(ch)=>s.split(ch).length-1;return c('(')===c(')')&&c('[')===c(']')&&c('{')===c('}');}",
    hiddenOnly: true,
  },
  "binary-search": {
    why: "loop condition lo < hi never examines a one-element range",
    code: "function binarySearch(n,t){let lo=0,hi=n.length-1;while(lo<hi){const m=(lo+hi)>>1;if(n[m]===t)return m;if(n[m]<t)lo=m+1;else hi=m-1;}return -1;}",
  },
  "climbing-stairs": {
    why: "off by one: returns the (n-1)th Fibonacci number",
    code: "function climbStairs(n){let a=0,b=1;for(let i=1;i<n;i++){[a,b]=[b,a+b];}return b;}",
  },
  "roman-to-integer": {
    why: "adds every symbol and never subtracts",
    code: "function romanToInt(s){const v={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let t=0;for(const c of s)t+=v[c];return t;}",
  },
  "flatten-deep": {
    why: "flattens one level only",
    code: "function flattenDeep(a){return [].concat(...a);}",
  },
  "two-sum": {
    why: "allows pairing an element with itself",
    code: "function twoSum(n,t){for(let i=0;i<n.length;i++)for(let j=i;j<n.length;j++)if(n[i]+n[j]===t)return [i,j];return [];}",
  },
  "best-time-to-buy-and-sell": {
    why: "max minus min, ignoring that you must buy before you sell",
    code: "function maxProfit(p){if(!p.length)return 0;return Math.max(0,Math.max(...p)-Math.min(...p));}",
  },
  "max-subarray": {
    why: "starts the best sum at 0, so all-negative input returns 0",
    code: "function maxSubArray(n){let cur=0,best=0;for(const x of n){cur=Math.max(0,cur+x);best=Math.max(best,cur);}return best;}",
    hiddenOnly: true,
  },
  "longest-substring": {
    why: "restarts the window at 1 on a repeat instead of moving its start",
    code: "function lengthOfLongestSubstring(s){let seen=new Set(),cur=0,best=0;for(const c of s){if(seen.has(c)){seen=new Set([c]);cur=1;}else{seen.add(c);cur++;}best=Math.max(best,cur);}return best;}",
    hiddenOnly: true,
  },
  "group-anagrams": {
    why: "groups by word length instead of by letters",
    code: "function groupAnagrams(s){const m=new Map();for(const w of s){const k=w.length;if(!m.has(k))m.set(k,[]);m.get(k).push(w);}return [...m.values()];}",
  },
  "top-k-frequent": {
    why: "returns the first k distinct values, ignoring frequency",
    code: "function topKFrequent(n,k){return [...new Set(n)].slice(0,k);}",
    hiddenOnly: true,
  },
  "merge-intervals": {
    why: "takes the end of the later interval instead of the larger end",
    code: "function mergeIntervals(iv){const s=iv.map(i=>[i[0],i[1]]).sort((a,b)=>a[0]-b[0]);const o=[];for(const c of s){const l=o[o.length-1];if(l&&c[0]<=l[1])l[1]=c[1];else o.push(c);}return o;}",
    hiddenOnly: true,
  },
  "rotate-matrix": {
    why: "rotates counter-clockwise",
    code: "function rotate(m){const n=m.length;const o=[];for(let i=0;i<n;i++){o.push([]);for(let j=0;j<n;j++)o[i].push(m[j][n-1-i]);}return o;}",
  },
};
