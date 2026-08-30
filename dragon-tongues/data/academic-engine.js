(function (root) {
  "use strict";

  const exposureIndexes = [
    [0, 2, 3],
    [0, 3],
    [0, 1, 2],
    [0, 1, 3],
    [0, 3],
    [0, 1, 2, 3]
  ];
  const role = (kind, wordIndex = null) => Object.freeze({ kind, wordIndex });
  const practiceRoles = [
    [role("listen", 0), role("recognize", 2), role("build"), role("typing", 3)],
    [role("response"), role("listen", 0), role("build"), role("typing", 3)],
    [role("listen", 0), role("reverse", 1), role("recognize", 2), role("response")],
    [role("build"), role("typing", 3), role("reverse", 1), role("listen", 0)],
    [role("speaking"), role("response"), role("listen", 0), role("typing", 3)],
    [role("listen", 0), role("response"), role("build"), role("typing", 3), role("reverse", 1), role("recognize", 2)]
  ];

  function normalizeChoice(value) {
    return String(value ?? "").normalize("NFC").trim().replace(/[’‘‛ʼʻ]/g, "'").replace(/[“”]/g, '"').replace(/[.!?¿¡。؟،؛,:;"()\[\]]/g, " ").replace(/\s+/g, " ").trim();
  }

  function uniqueWords(words) {
    return words.filter((word, index, list) => list.findIndex(item => item.target === word.target) === index);
  }

  function standardPlan(words, lessonIndex) {
    const primary = uniqueWords((exposureIndexes[lessonIndex] || [0, 1, 2, 3]).map(index => words[index]).filter(Boolean));
    const support = words.filter(word => !primary.some(item => item.target === word.target));
    return Object.freeze({
      exposureWords: Object.freeze(uniqueWords([...primary, ...support]).slice(0, 4)),
      practiceRoles: Object.freeze([...(practiceRoles[lessonIndex] || practiceRoles[0])])
    });
  }

  function uniqueChoiceValues(values, answer) {
    const seen = new Set([normalizeChoice(answer)]);
    return values.filter(value => {
      const key = normalizeChoice(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  root.DRAGON_TONGUES_ACADEMIC_ENGINE = Object.freeze({ standardPlan, uniqueChoiceValues, normalizeChoice });
})(typeof window !== "undefined" ? window : self);
