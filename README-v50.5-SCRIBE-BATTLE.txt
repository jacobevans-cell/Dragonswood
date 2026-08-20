DRAGONSWOOD v50.5 — SCRIBE BATTLE

WHAT CHANGED
• Scribe Battle submissions automatically trigger the existing gradeWriting AI function.
• Teacher cannot select finalists until every submitted entry has an AI score.
• Only the AI-ranked Top 4 enter voting. Ranking: total /20, then Target Skill, then Ideas.
• Semifinals are seeded #1 vs #4 and #2 vs #3.
• Student names are hidden during voting.
• Students cannot vote for their own entry.
• One locked vote per student per round.
• Teacher advances semifinal winners, then reveals the Master Scribe.
• Ties fall back to AI ranking so a joke/popularity tie cannot hijack the academic result.

DEPLOY
1. GitHub: upload the GITHUB-ONLY package contents.
2. Cloud Shell: deploy firestore.rules from the FULL package:
   firebase deploy --only firestore:rules --project dragonswood-9289e
3. No function redeploy is required. v50.5 reuses the already-live gradeWriting function.

TEST
Launch MODE = Scribe Battle. Submit at least four student entries. Each submission should auto-grade. Teacher presses CLOSE ENTRIES + SELECT AI TOP 4, students vote in semifinals, teacher advances winners, students vote in final, teacher reveals Master Scribe.
