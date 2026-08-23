# Dragonswood v54 audit

Date: 2026-08-22

## Reconciled findings

| Finding | Result |
|---|---|
| Skill labels could silently route to the wrong generator | Confirmed in the legacy design; v54 retains the stable-ID registry. All four tracks report zero legacy routing. |
| Curriculum Quest had no auto-graded activity types | Rejected as stated. The page already had `number`, `mc`, `morph`, `readingPov`, `fanboys`, `commas`, `capital`, `opinion`, and `explain`. The real defect was one generic activity per mission and universal Teacher Verify. |
| Curriculum Quest needs standard-linked checks | Fixed. Six deterministic questions are generated from the mission ID, pacing-plan standards, vocabulary, morphology, or subject-specific topic rules. |
| Teacher Verify was overused | Fixed. It is now reserved for Science, Writing, and observation/performance missions. |
| Curriculum progress could disappear with browser/profile reset | Fixed in code. Local progress is retained and merged with Firestore. The new Firestore rules must be deployed before cloud sync can succeed. |
| Morning Work and Curriculum Quest were at risk of blending | Prevented. Packet banks affect Morning Work only; Curriculum Quest remains Explore-pacing driven. |
| Foundation needed a non-stigmatizing identity | Fixed. Stable ID `foundation`; display label `FOUNDATION`. No deficit label is used. |
| Drag-and-drop was newly invented for Curriculum Quest | Rejected. No new Curriculum Quest drag-and-drop type was added. Existing Daily Quest game engines already included drag interactions. |

## Automated verification

| Area | Coverage | Result |
|---|---:|---:|
| Foundation | 180 days / 7,200 generated questions | 0 unknown IDs, 0 legacy, 0 malformed |
| Fourth Grade | 5,040 questions | 0 failures; 861/861 recognized arithmetic answers independently recomputed |
| Fifth Grade | 5,760 questions | 0 failures; 611/611 recognized arithmetic answers independently recomputed |
| Challenge | 5,760 questions | 0 failures; 396/396 recognized arithmetic answers independently recomputed |
| Curriculum Quest | 743 source missions / 3,972 auto questions | 0 empty non-observation missions, 0 legacy, 0 malformed, 0 unplanned IDs |
| HTML/JavaScript | Daily Quest, Curriculum Quest, Teacher page, both new JS assets | Syntax checks pass |
| Local asset references | All deployment HTML | 0 missing local files |
| Firestore rules | Static structural check | Balanced structure; requires normal Firebase rules deployment validation |

## Source provenance

The Foundation sequence indexes every selected Grade 3 lesson page: August–March
lessons 1–22, followed by April lessons 1–4. Each day records month, lesson, and
source PDF page. OCR task headings were readable and directly classified on 88
of 180 pages in this environment. The remaining 92 pages use the packet month's
standards progression fallback rather than guessing from unreadable text. This is
explicitly recorded per day in `foundation-track.js` as `sourceAudit` metadata.

The fourth-, fifth-, and Challenge-track registry data remains the verified v53
engine assembled from the supplied packet banks. Curriculum Quest uses only the
Q1 Explore pacing data and video map.

## Deployment boundary

No GitHub, Firebase Hosting, or Firestore deployment was performed. Deployment is
a separate risky action. Before publishing, deploy the included `firestore.rules`
with the hosting files; otherwise the app safely retains local progress but cloud
progress writes will be rejected.

## Remaining judgment call

The 92 Foundation pages classified from monthly standards progression are safe,
stable-ID practice, but their individual task headings were not machine-readable
in this environment. If exact page-by-page task fidelity is required beyond the
current standards-aligned sequence, those pages should receive a human/source OCR
pass in the next content audit. This does not create invalid or cross-skill
questions; it limits how specifically those days mirror the printed page.
