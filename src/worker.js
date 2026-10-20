// Runs the learner's code away from the page. The page terminates this worker if a run takes too long.
importScripts("core.js");

self.onmessage = function (event) {
  const data = event.data;
  let result;
  try {
    result = PracticeCore.runTests(data.problem, data.code);
  } catch (e) {
    result = { status: "error", message: "Runner error: " + (e && e.message ? e.message : String(e)), passed: 0, total: 0, results: [] };
  }
  self.postMessage(result);
};
