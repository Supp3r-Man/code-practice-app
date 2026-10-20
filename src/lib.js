// UI-independent helpers: filtering, a tiny text format for problem prompts, and the progress store. Tested in Node.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PracticeLib = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Inline text: `code` spans between backticks. Returns [{ code: boolean, text: string }].
  function parseInline(text) {
    const parts = text.split("`");
    const out = [];
    parts.forEach((part, i) => {
      // An odd number of backticks leaves the last part unclosed: treat it as plain text with its backtick restored.
      const isCode = i % 2 === 1;
      if (isCode && i === parts.length - 1) out.push({ code: false, text: "`" + part });
      else if (part !== "") out.push({ code: isCode, text: part });
    });
    return out;
  }

  // Prompt format: blank-line separated paragraphs, "- " bullet lists, and ``` fenced code blocks.
  // Returns blocks: { type: "p", inline }, { type: "ul", items: [inline] }, { type: "pre", text }.
  function parseRich(text) {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let para = [];
    let list = null;
    let i = 0;

    function flushPara() {
      if (para.length) blocks.push({ type: "p", inline: parseInline(para.join(" ")) });
      para = [];
    }
    function flushList() {
      if (list) blocks.push({ type: "ul", items: list });
      list = null;
    }

    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith("```")) {
        flushPara();
        flushList();
        const code = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
        i++; // closing fence (or end of text if it was never closed)
        blocks.push({ type: "pre", text: code.join("\n") });
        continue;
      }
      if (line.startsWith("- ")) {
        flushPara();
        list = list || [];
        list.push(parseInline(line.slice(2)));
      } else if (line.trim() === "") {
        flushPara();
        flushList();
      } else {
        flushList();
        para.push(line.trim());
      }
      i++;
    }
    flushPara();
    flushList();
    return blocks;
  }

  function filterProblems(problems, filters, solved) {
    const q = (filters.query || "").trim().toLowerCase();
    return problems.filter((p) => {
      if (filters.difficulty && p.difficulty !== filters.difficulty) return false;
      const isSolved = Boolean(solved[p.id]);
      if (filters.status === "solved" && !isSolved) return false;
      if (filters.status === "todo" && isSolved) return false;
      if (q) {
        const hay = (p.title + " " + p.tags.join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // Progress and drafts. Falls back to memory if storage is missing, full or holds corrupt data.
  function createStore(storage, storageKey) {
    const KEY = storageKey || "code-practice.v1";
    let data = { solved: {}, code: {} };
    try {
      const raw = storage && storage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          data.solved = isPlainMap(parsed.solved) ? parsed.solved : {};
          data.code = isPlainMap(parsed.code) ? parsed.code : {};
        }
      }
    } catch (e) {
      data = { solved: {}, code: {} };
    }

    function persist() {
      try {
        if (storage) storage.setItem(KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        return false;
      }
    }

    return {
      solved: () => Object.assign({}, data.solved),
      isSolved: (id) => Boolean(data.solved[id]),
      markSolved(id, when) {
        if (!data.solved[id]) data.solved[id] = when || new Date().toISOString();
        return persist();
      },
      getCode: (id) => (typeof data.code[id] === "string" ? data.code[id] : null),
      saveCode(id, code) {
        data.code[id] = code;
        return persist();
      },
      clearCode(id) {
        delete data.code[id];
        return persist();
      },
      solvedCount(ids) {
        return ids.filter((id) => data.solved[id]).length;
      },
    };
  }

  function isPlainMap(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  return { parseInline: parseInline, parseRich: parseRich, filterProblems: filterProblems, createStore: createStore };
});
