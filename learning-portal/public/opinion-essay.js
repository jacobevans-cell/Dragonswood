// Shared student/grader structure for this opinion project. It is not a
// universal scoring rubric, and does not change other writing assignments.
export const ESSAY_STRUCTURE_VERSION = "short-opinion-essay.2";
export function opinionEssayStructure(grade) {
  if (![4, 5].includes(grade)) throw new Error("Choose grade 4 or 5.");
  return {
    version: ESSAY_STRUCTURE_VERSION,
    source: "Writing_Assignment_Types_AI_Grading_Handoff.md",
    gradeLevel: grade,
    assignmentType: "short_essay",
    writingMode: "opinion_argumentative",
    requiredParagraphs: 3,
    requiredBodyParagraphs: 1,
    requiredReasons: 2,
    requiredEvidenceCount: 2,
    requiredSources: 0,
    teacherOverrides: [
      "The teacher requires the grade-specific sentence range in every final essay paragraph, replacing the handoff's flexible development targets for this project.",
    ],
    sentenceTarget: {
      min: grade === 4 ? 3 : 5,
      max: grade === 4 ? 5 : 7,
      hardMinimum: true,
      hardMaximum: true,
    },
    paragraphs: [
      {
        id: "introduction",
        title: "Introduction",
        job: "Introduce your topic and state your opinion clearly.",
        plan: "Use your opinion and audience notes.",
        parts: [
          "Topic",
          "My opinion",
          "Help the reader understand the question",
        ],
      },
      {
        id: "body",
        title: "Body",
        job: "Develop your two related reasons together in one body paragraph. Give an example for each reason and explain how it supports your opinion.",
        plan: "Use both reason-and-example pairs from your plan.",
        parts: [
          "Reason + specific example",
          "Explain the connection",
          "Another reason + example + explanation",
        ],
      },
      {
        id: "conclusion",
        title: "Conclusion",
        job: "Return to your opinion in new words and leave the reader with a clear closing thought.",
        plan: "Develop your closing idea.",
        parts: [
          "Return to my opinion",
          "Bring my ideas together",
          "Give the reader closure",
        ],
      },
    ],
    developmentGuidance:
      grade === 4
        ? "Keep related ideas together, use clear examples, and explain how they support your opinion. Use linking words such as because, also, and for example."
        : "Choose specific examples, explain why they matter, and connect ideas within and between paragraphs. Keep your focus clear and use precise words.",
    qualityRules: [
      "Every final essay paragraph must contain the grade-specific required range of complete sentences: Grade 4 requires 3–5; Grade 5 requires 5–7. A paragraph outside that range needs revision even when its idea is developed. This requirement does not apply to Day 30 planning boxes.",
      "Paragraph or sentence counts alone do not demonstrate development or determine the whole grade. Identify missing writing elements instead of labeling work too short.",
      "This assignment requires three paragraphs, including one body paragraph containing both related reasons. Do not infer an extra body paragraph or a formal five-paragraph essay after submission.",
      "Digital paragraph separation is sufficient; indentation is not required. If formatting cannot be determined, flag formatting_uncertain instead of confidently penalizing paragraph count.",
      "Titles, headings, names, dates, copied prompts, and unapproved lists are not developed essay paragraphs or student-written sentences. Sentence completeness needs a judgment of meaning; punctuation counts alone cannot establish it.",
      "Structure belongs in the organization judgment. Do not apply a separate blanket penalty, overall percentage cap, or duplicate deduction for the same missing element.",
      "Use the student's grade for depth, transitions, elaboration, and sentence control. Do not hold grade 4 to grade 5 expectations.",
      "Do not infer authorship or deduct points from an AI-detection guess. Feedback must point to observable writing and a concrete, student-friendly revision.",
    ],
  };
}
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function essayMap(structure) {
  const target = structure.sentenceTarget;
  return `<ol class="essay-map" aria-label="Three paragraphs in your short opinion essay">${structure.paragraphs.map((p, i) => `<li class="essay-part essay-${esc(p.id)}"><span class="essay-number" aria-hidden="true">${i + 1}</span><div class="eyebrow">PARAGRAPH ${i + 1}</div><h3>${esc(p.title)}</h3><p class="essay-sentence-rule"><strong>Required: ${target.min}–${target.max} complete sentences</strong></p><p>${esc(p.job)}</p><ul>${p.parts.map((part) => `<li>${esc(part)}</li>`).join("")}</ul><p class="essay-plan-link">${esc(p.plan)}</p></li>`).join("")}</ol>`;
}
export function essayGuide(structure) {
  const target = structure.sentenceTarget;
  return `<section class="panel essay-guide"><div class="row"><div><div class="eyebrow">YOUR FINISHED PROJECT</div><h2>A short essay. Three connected paragraphs.</h2></div><span class="tag gold">INTRODUCTION → BODY → CONCLUSION</span></div><p>Develop one opinion across your whole essay. Each paragraph has a job, and every reason should connect to the same central idea.</p>${essayMap(structure)}<div class="notice"><strong>Grade ${structure.gradeLevel} requirement: ${target.min}–${target.max} complete sentences in each paragraph.</strong><p>${esc(structure.developmentGuidance)}</p></div></section>`;
}
export function essayPreview(draft) {
  // Display the student's original paragraph breaks. No automatic restructuring,
  // sentence counting, paragraph classification, or quality judgment occurs here.
  const blocks = String(draft ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n|\u2029/)
    .filter((block) => block.trim());
  return blocks.length
    ? blocks.map((block) => `<p>${esc(block)}</p>`).join("")
    : '<p class="muted">Your essay will appear here as you write. Use a blank line between paragraphs.</p>';
}
export function bindEssayPreview(root) {
  const editor = root.querySelector(
    '[data-assignment="writing"][data-field="draft"]',
  );
  const preview = root.querySelector("#essay-preview");
  if (!editor || !preview) return;
  const update = () => (preview.innerHTML = essayPreview(editor.value));
  editor.addEventListener("input", update);
  update();
}
