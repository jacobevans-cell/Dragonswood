import { OPINION_ARTICLES } from "./opinion-articles.js?v=dragon-path-11";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const artwork = {
  chat: '<path d="M13 14h43v29H33L21 54V43h-8z"/><path d="M24 25h21M24 33h13"/>',
  team: '<circle cx="24" cy="23" r="7"/><circle cx="46" cy="25" r="6"/><path d="M11 51V42c0-13 26-13 26 0v9M41 36c10-2 17 3 17 11v4M28 48l7 6 13-14"/>',
  screen:
    '<rect x="13" y="9" width="36" height="50" rx="6"/><path d="M22 18h18M27 51h8"/><circle cx="48" cy="39" r="13"/><path d="M48 31v8l6 4"/>',
  book: '<path d="M34 21C25 15 17 15 9 18v36c8-3 16-3 25 3 9-6 17-6 25-3V18c-8-3-16-3-25 3v36M17 27l9 2M17 36l9 2M43 29l8-2M43 38l8-2"/>',
};
function icon(topic) {
  return `<span class="topic-art" aria-hidden="true"><svg viewBox="0 0 68 68" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${artwork[topic.symbol] || artwork.book}</svg></span>`;
}
function backgroundArticle(topicId) {
  const article = OPINION_ARTICLES[topicId];
  if (!article) return "";
  return `<details class="topic-reading"><summary>Read the background article</summary><article class="topic-reading-body" aria-label="${esc(article.title)}"><div class="eyebrow">BACKGROUND ARTICLE</div><h3>${esc(article.title)}</h3><p class="topic-reading-intro">${esc(article.subtitle)}</p><img class="topic-reading-image" src="${esc(article.image)}" alt="${esc(article.imageAlt)}" width="${article.imageWidth}" height="${article.imageHeight}" loading="lazy" decoding="async">${article.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}<footer class="topic-reading-sources"><h4>Sources</h4><ol>${article.sources.map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a></li>`).join("")}</ol></footer></article></details>`;
}
export function topicResources(topic) {
  return `<div class="topic-context">${backgroundArticle(topic.id)}<h3>A little context</h3><p>${esc(topic.context)}</p><div class="topic-scenario"><div class="eyebrow">IMAGINED SITUATION · THINK IT THROUGH</div><p>${esc(topic.scenario)}</p></div><details><summary>Questions to help you think</summary><ul>${topic.consider.map((question) => `<li>${esc(question)}</li>`).join("")}</ul><p class="small muted">These are thinking prompts. You do not need to answer each one separately.</p></details></div>`;
}
export function topicChooser(project, pendingId, archive) {
  const topic = project.topics.find((t) => t.id === pendingId);
  const previous =
    archive?.draft || archive?.submissions?.length || archive?.versions?.length;
  const preserved = previous
    ? '<div class="notice"><strong>Your earlier writing is preserved.</strong> Your previous planning-topic work is included when you export. This new project begins with your own topic choice. <button class="btn small quiet" data-action="export">Export my work</button></div>'
    : "";
  if (topic)
    return `${preserved}<section class="panel topic-confirm" aria-labelledby="topic-confirm-heading"><a class="back" href="#writing" data-action="back-to-topics">← Back to all four topics</a><div class="row">${icon(topic)}<span class="tag gold">CHECK YOUR CHOICE</span></div><h2 id="topic-confirm-heading" tabindex="-1">Make this your writing project?</h2><p class="topic-question">${esc(topic.prompt)}</p>${topicResources(topic)}<div class="notice"><strong>One topic for the whole project.</strong><p>You will keep this question as you plan, draft, review, revise, and publish your three-paragraph short opinion essay across the next two school weeks. Once you confirm, you cannot switch topics.</p><p>${esc(project.positionRule)}</p></div><label class="choice topic-agreement"><input id="topic-agreement" type="checkbox"><span>I understand this topic will stay with me for this project.</span></label><div class="submit-bar"><button class="btn primary" data-action="confirm-topic" data-id="${esc(topic.id)}" disabled>Confirm and lock my topic</button><span id="topic-lock-status" role="status"></span></div></section>`;
  return `${preserved}<section class="panel topic-intro"><div class="eyebrow">YOUR VOICE · YOUR QUESTION</div><h2>Which conversation will you join?</h2><p>Choose a question you care about. Explore an option, think about both sides, then confirm your topic. You will write a short opinion essay with an introduction, one body paragraph, and a conclusion across two weeks.</p><p class="small muted">You can read all four background articles below before choosing. Opening an article or exploring a topic does not lock it. You will confirm on the next screen.</p></section><div class="topic-grid">${project.topics.map((t, i) => `<article class="panel topic-card"><div class="row">${icon(t)}<span class="topic-number">0${i + 1}</span></div><div class="eyebrow">${esc(t.category)}</div><h2>${esc(t.prompt)}</h2><p>${esc(t.invitation)}</p>${backgroundArticle(t.id)}<button class="btn" data-action="choose-topic" data-id="${esc(t.id)}" aria-label="Explore topic ${i + 1}: ${esc(t.prompt)}">Explore this topic <span aria-hidden="true">→</span></button></article>`).join("")}</div><p class="caption">Every option includes its full background article and image, context, and an imagined situation. No outside passage or handout is needed.</p>`;
}
export function lockedTopic(record, project) {
  return `<section class="panel locked-topic"><div class="row"><div class="eyebrow">${esc(record.topic.category)}</div><span class="tag gold">✓ TOPIC LOCKED</span></div><h2>${esc(record.topic.prompt)}</h2><p>${esc(project.positionRule)}</p><details open><summary>Your topic resources</summary>${topicResources(record.topic)}</details><p class="small muted">${esc(project.supportRule)}</p></section>`;
}
