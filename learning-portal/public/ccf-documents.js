// Exact, code-rendered evidence exhibits. The generated desk images identify
// stations; they never supply hidden map geometry, tiny text, or answer keys.
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function documentMarkup(doc) {
  if (!doc) return "";
  if (doc.kind === "route") {
    const changed = doc.variant === "changed";
    const route = changed
      ? "Start Gate → Pine Junction → RIGHT → Orchard Loop → Fountain → Finish"
      : "Start Gate → Pine Junction → LEFT → Fountain → Finish";
    return `<figure class="ccf-source-exhibit" style="margin:16px 0"><svg role="img" aria-label="${esc(route)}" viewBox="0 0 560 290" style="display:block;width:100%;height:auto" xmlns="http://www.w3.org/2000/svg"><title>${esc(route)}</title><rect width="560" height="290" rx="14" fill="#edf1df"/><path d="M270 240 V170 M270 170 L115 105 L270 48 M270 170 L450 160 L450 80 L270 48" stroke="#c4cbb7" stroke-width="14" fill="none"/><path d="${changed ? "M270 240 V170 L450 160 L450 80 L270 48" : "M270 240 V170 L115 105 L270 48"}" stroke="${changed ? "#935133" : "#24786e"}" stroke-width="7" fill="none"/><circle cx="270" cy="170" r="10" fill="#344f37"/><circle cx="270" cy="48" r="11" fill="#538bad"/><g fill="#263f36" font-size="19" font-family="Arial,sans-serif"><text x="205" y="275">Start Gate</text><text x="180" y="205">Pine Junction</text><text x="27" y="87">LEFT</text><text x="452" y="197">RIGHT</text><text x="375" y="49">Orchard Loop</text><text x="235" y="22">Fountain</text><text x="280" y="77">Finish</text></g><text x="22" y="254" fill="#4f653d" font-size="14" font-family="Arial,sans-serif">Route diagram · not to scale</text></svg><figcaption style="font-size:15px;line-height:1.5;margin-top:8px"><strong>${changed ? "Batch B" : "Approved route A"}:</strong> ${esc(route)}</figcaption></figure>`;
  }
  if (doc.kind === "signature")
    return `<figure class="ccf-source-exhibit" style="margin:16px 0;border:8px ridge #9b7846;background:#f5e6c8;padding:22px;color:#332638"><figcaption>${esc(doc.title)}</figcaption><div style="font-family:Georgia,serif;font-size:clamp(28px,6vw,50px);letter-spacing:3px;margin:14px 0">${esc(doc.text)}</div><p style="font-size:14px">Large transcription of the recorded signature strip. The surrounding painting is not needed to read these letters.</p></figure>`;
  if (doc.kind === "quote")
    return `<figure class="ccf-source-exhibit" style="margin:16px 0;padding:20px;background:#e9dfcd;color:#292033;border-left:4px solid #795894;border-radius:8px"><figcaption style="font-size:14px;font-weight:bold">${esc(doc.title)}</figcaption><blockquote style="margin:10px 0;font-family:Georgia,serif;font-size:20px;line-height:1.55">${esc(doc.text)}</blockquote></figure>`;
  if (doc.kind === "settings" || doc.kind === "dates")
    return `<figure class="ccf-source-exhibit" style="margin:16px 0"><figcaption style="font-weight:bold;margin-bottom:10px">${esc(doc.title)}</figcaption><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">${[doc.left, doc.right].map((text, i) => `<div style="padding:20px 12px;color:#292033;background:${i ? "#e7ddec" : "#dcebe3"};border-radius:10px;border:1px solid #9b927d;font-size:clamp(18px,3vw,25px);line-height:1.4;text-align:center">${esc(text)}</div>`).join("")}</div></figure>`;
  if (doc.kind === "chain")
    return `<ol class="ccf-source-exhibit" aria-label="Complete relevant message path" style="padding-left:24px">${doc.items.map((text) => `<li style="margin:10px 0;padding:14px;background:#e1e9e2;color:#292033;border-radius:8px">${esc(text)}</li>`).join("")}</ol>`;
  return "";
}
export function portraitMarkup(w) {
  const atlas = w.portraitAtlas;
  if (!atlas)
    return `<img src="${esc(w.portrait)}" alt="${esc(w.portraitAlt || `Character portrait of ${w.name}. Appearance is not a clue.`)}" width="1024" height="1024">`;
  if (
    atlas.columns !== 3 ||
    !Number.isInteger(atlas.index) ||
    atlas.index < 0 ||
    atlas.index > 2
  )
    throw Error("Invalid portrait atlas frame");
  return `<figure class="ccf-portrait-frame" style="margin:0;position:relative;display:block;width:100%;min-height:105px;aspect-ratio:1;align-self:start;overflow:hidden;flex:none"><img src="${esc(w.portrait)}" alt="${esc(w.portraitAlt)}" width="2172" height="724" loading="lazy" style="position:absolute;top:0;left:0;width:300%;max-width:none;height:100%;object-fit:fill;aspect-ratio:3;transform:translateX(-${(atlas.index * 100) / 3}%);display:block"></figure>`;
}
