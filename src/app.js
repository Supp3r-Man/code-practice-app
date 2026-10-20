// Browser UI. Pure logic lives in lib.js and core.js (both tested in Node); this file only touches the DOM.
(function () {
  "use strict";

  const RUN_TIMEOUT_MS = 5000;
  const problems = window.PracticeProblems;
  const solutions = window.PracticeSolutions;
  const lib = window.PracticeLib;

  let storage = null;
  try {
    storage = window.localStorage;
  } catch (e) {
    storage = null; // blocked (private mode, disabled cookies): progress then lasts for this page load only
  }
  const store = lib.createStore(storage);

  const $ = (id) => document.getElementById(id);
  const el = {
    list: $("problem-list"),
    listEmpty: $("list-empty"),
    query: $("filter-query"),
    difficulty: $("filter-difficulty"),
    status: $("filter-status"),
    progressText: $("progress-text"),
    progressBar: $("progress-bar"),
    progressFill: $("progress-fill"),
    title: $("problem-title"),
    badge: $("problem-difficulty"),
    solvedFlag: $("problem-solved"),
    tags: $("problem-tags"),
    prompt: $("problem-prompt"),
    editor: $("editor"),
    run: $("run"),
    hint: $("hint"),
    solution: $("solution"),
    reset: $("reset"),
    hintBox: $("hint-box"),
    results: $("results"),
    solutionBox: $("solution-box"),
  };

  let current = null;
  let hintsShown = 0;
  let worker = null;
  let saveTimer = null;
  let trapTab = true;
  let confirmTimers = {};

  function node(tag, props, children) {
    const n = document.createElement(tag);
    if (props) Object.keys(props).forEach((k) => (k === "text" ? (n.textContent = props[k]) : n.setAttribute(k, props[k])));
    (children || []).forEach((c) => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return n;
  }

  function renderInline(parent, inline) {
    inline.forEach((part) => parent.appendChild(part.code ? node("code", { text: part.text }) : document.createTextNode(part.text)));
  }

  function renderRich(container, text) {
    container.replaceChildren();
    lib.parseRich(text).forEach((block) => {
      if (block.type === "p") {
        const p = node("p");
        renderInline(p, block.inline);
        container.appendChild(p);
      } else if (block.type === "ul") {
        const ul = node("ul");
        block.items.forEach((item) => {
          const li = node("li");
          renderInline(li, item);
          ul.appendChild(li);
        });
        container.appendChild(ul);
      } else {
        container.appendChild(node("pre", {}, [node("code", { text: block.text })]));
      }
    });
  }

  // ---- list and progress ----

  function updateProgress() {
    const done = store.solvedCount(problems.map((p) => p.id));
    const pct = problems.length ? Math.round((done / problems.length) * 100) : 0;
    el.progressText.textContent = done + " of " + problems.length + " solved";
    el.progressBar.setAttribute("aria-valuenow", String(pct));
    el.progressFill.style.width = pct + "%";
  }

  function renderList() {
    const shown = lib.filterProblems(problems, { query: el.query.value, difficulty: el.difficulty.value, status: el.status.value }, store.solved());
    el.list.replaceChildren();
    shown.forEach((p) => {
      const solved = store.isSolved(p.id);
      const button = node("button", { type: "button", "data-id": p.id }, [
        node("span", { class: "tick", "aria-hidden": "true", text: solved ? "✓" : "" }),
        node("span", { class: "title", text: p.title }),
        node("span", { class: "badge " + p.difficulty, text: p.difficulty }),
      ]);
      button.setAttribute("aria-label", p.title + ", " + p.difficulty + (solved ? ", solved" : ""));
      if (current && current.id === p.id) button.setAttribute("aria-current", "true");
      button.addEventListener("click", () => select(p.id));
      el.list.appendChild(node("li", {}, [button]));
    });
    el.listEmpty.hidden = shown.length > 0;
  }

  // ---- selecting a problem ----

  function select(id, opts) {
    const p = problems.find((x) => x.id === id) || problems[0];
    if (current) flushSave();
    current = p;
    hintsShown = 0;
    el.title.textContent = p.title;
    el.badge.textContent = p.difficulty;
    el.badge.className = "badge " + p.difficulty;
    el.tags.textContent = "Tags: " + p.tags.join(", ");
    renderRich(el.prompt, p.prompt);
    el.editor.value = store.getCode(p.id) !== null ? store.getCode(p.id) : p.starter;
    el.results.replaceChildren();
    el.hintBox.hidden = true;
    el.solutionBox.hidden = true;
    el.solution.textContent = "Show solution";
    el.hint.textContent = "Show hint";
    resetConfirm();
    el.solvedFlag.hidden = !store.isSolved(p.id);
    if (!opts || !opts.keepHash) {
      try {
        history.replaceState(null, "", "#" + p.id);
      } catch (e) {
        /* some browsers refuse this on file:// pages; the app works without the deep link */
      }
    }
    renderList();
  }

  // ---- editor ----

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 400);
  }

  function flushSave() {
    clearTimeout(saveTimer);
    if (current) store.saveCode(current.id, el.editor.value);
  }

  el.editor.addEventListener("input", scheduleSave);
  el.editor.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    } else if (e.key === "Escape") {
      trapTab = false; // lets keyboard users Tab out of the editor
    } else if (e.key === "Tab" && trapTab && !e.shiftKey) {
      e.preventDefault();
      const s = el.editor.selectionStart;
      const t = el.editor.selectionEnd;
      el.editor.setRangeText("  ", s, t, "end");
      scheduleSave();
    } else if (e.key !== "Shift" && e.key !== "Tab") {
      trapTab = true;
    }
  });

  // ---- two-step buttons (no confirm() dialogs) ----

  function confirmed(button, idleText, armedText) {
    if (button.dataset.armed === "1") {
      resetConfirmFor(button, idleText);
      return true;
    }
    button.dataset.armed = "1";
    button.textContent = armedText;
    clearTimeout(confirmTimers[button.id]);
    confirmTimers[button.id] = setTimeout(() => resetConfirmFor(button, idleText), 4000);
    return false;
  }

  function resetConfirmFor(button, idleText) {
    clearTimeout(confirmTimers[button.id]);
    button.dataset.armed = "0";
    button.textContent = idleText;
  }

  function resetConfirm() {
    resetConfirmFor(el.reset, "Reset code");
  }

  el.reset.addEventListener("click", () => {
    if (!current || !confirmed(el.reset, "Reset code", "Click again to discard your code")) return;
    store.clearCode(current.id);
    el.editor.value = current.starter;
    el.results.replaceChildren();
  });

  el.hint.addEventListener("click", () => {
    if (!current) return;
    if (hintsShown < current.hints.length) hintsShown++;
    el.hintBox.replaceChildren(node("h3", { text: "Hint " + hintsShown + " of " + current.hints.length }));
    for (let i = 0; i < hintsShown; i++) el.hintBox.appendChild(node("p", { text: current.hints[i] }));
    el.hintBox.hidden = false;
    el.hint.textContent = hintsShown < current.hints.length ? "Next hint" : "All hints shown";
  });

  el.solution.addEventListener("click", () => {
    if (!current) return;
    if (!el.solutionBox.hidden) {
      el.solutionBox.hidden = true;
      el.solution.textContent = "Show solution";
      return;
    }
    if (!store.isSolved(current.id) && !confirmed(el.solution, "Show solution", "Click again to reveal the solution")) return;
    const s = solutions[current.id];
    el.solutionBox.replaceChildren(
      node("h3", { text: "Reference solution" }),
      node("pre", {}, [node("code", { text: s.code })]),
      node("p", { text: s.explain }),
      node("p", { class: "muted", text: "Complexity: " + s.complexity })
    );
    el.solutionBox.hidden = false;
    el.solution.textContent = "Hide solution";
  });

  // ---- running tests ----

  function runInWorker(problem, code) {
    return new Promise((resolve) => {
      let w;
      try {
        w = new Worker("src/worker.js");
      } catch (e) {
        resolve({ status: "error", message: "Could not start the test worker (" + e.message + "). Open this app over http, for example with `npm start`, not from a file:// URL.", passed: 0, total: 0, results: [] });
        return;
      }
      worker = w;
      const timer = setTimeout(() => {
        w.terminate();
        worker = null;
        resolve({ status: "timeout", message: "No result after " + RUN_TIMEOUT_MS / 1000 + " seconds. Your code may contain an infinite loop or be too slow for the larger tests.", passed: 0, total: 0, results: [] });
      }, RUN_TIMEOUT_MS);
      w.onmessage = (ev) => {
        clearTimeout(timer);
        w.terminate();
        worker = null;
        resolve(ev.data);
      };
      w.onerror = (ev) => {
        clearTimeout(timer);
        w.terminate();
        worker = null;
        resolve({ status: "error", message: "Worker error: " + (ev.message || "unknown"), passed: 0, total: 0, results: [] });
      };
      w.postMessage({ problem: problem, code: code });
    });
  }

  function renderResult(result) {
    el.results.replaceChildren();
    let headline;
    if (result.status === "passed") headline = "All " + result.total + " tests passed";
    else if (result.status === "failed") headline = "Passed " + result.passed + " of " + result.total + " tests";
    else if (result.status === "timeout") headline = "Time limit exceeded";
    else headline = "Your code did not run";
    const summary = node("div", { class: "summary " + result.status, role: "status" }, [headline]);
    if (result.message) summary.appendChild(node("span", { class: "detail", text: result.message }));
    el.results.appendChild(summary);
    if (!result.results.length) return;

    const head = node("tr", {}, ["", "Input", "Expected", "Actual", "ms"].map((h) => node("th", { scope: "col", text: h })));
    const body = node("tbody");
    let hiddenIndex = 0;
    result.results.forEach((r) => {
      const mark = node("td", { class: r.pass ? "pass-mark" : "fail-mark", text: r.pass ? "✓" : "✗", "aria-label": r.pass ? "passed" : "failed" });
      if (r.hidden) {
        hiddenIndex++;
        body.appendChild(node("tr", {}, [mark, node("td", { colspan: "3", class: "muted", text: "Hidden test " + hiddenIndex + (r.pass ? "" : ": failed") }), node("td", { text: String(r.ms) })]));
      } else {
        const actual = r.error ? "threw " + r.error : r.actual;
        body.appendChild(
          node("tr", {}, [
            mark,
            node("td", { class: "mono", text: r.input }),
            node("td", { class: "mono", text: r.expected }),
            node("td", { class: "mono", text: actual }),
            node("td", { text: String(r.ms) }),
          ])
        );
      }
    });
    el.results.appendChild(node("div", { class: "table-wrap" }, [node("table", { class: "cases" }, [node("thead", {}, [head]), body])]));
  }

  async function run() {
    if (!current || el.run.disabled) return;
    flushSave();
    const problem = current;
    el.run.disabled = true;
    el.run.textContent = "Running…";
    const result = await runInWorker(problem, el.editor.value);
    el.run.disabled = false;
    el.run.textContent = "Run tests";
    if (current !== problem) return; // the learner switched problems while this run was in flight
    renderResult(result);
    if (result.status === "passed" && !store.isSolved(problem.id)) {
      store.markSolved(problem.id);
      el.solvedFlag.hidden = false;
      updateProgress();
      renderList();
    }
  }

  el.run.addEventListener("click", run);
  [el.query, el.difficulty, el.status].forEach((c) => c.addEventListener("input", renderList));
  window.addEventListener("pagehide", flushSave);

  // ---- start ----

  updateProgress();
  const startId = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  select(problems.some((p) => p.id === startId) ? startId : problems[0].id, { keepHash: true });
})();
