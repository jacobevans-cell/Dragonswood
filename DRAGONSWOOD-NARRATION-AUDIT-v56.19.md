# Dragonswood Narration Audit — v56.19

## Authoritative merge base

Merged into GitHub `jacobevans-cell/Dragonswood` main at commit `070298b` after Claude's latest changes. Claude's current `index.html` optimizations and every unrelated repository file were preserved; narration was applied as narrow additions rather than replacing current pages with the older project copy.

## Result

The four-voice system is now sitewide for every current student-facing narration control, rather than limited to Profile and Daily Quest.

Covered entry points:

- Daily Quest directions, concepts, and academic narration
- Spelling flashcards, sound chunks, examples, tests, soccer, and volleyball
- Fraction Forge Read Coach
- The Witches Reader selected-page narration
- Profile voice preview

Every entry opens the same player and exposes Automatic, Lewis, Liam, Bella, and Alex. The Profile choice is the initial default, not a restriction. A voice change made inside any player is remembered locally immediately and saved to the signed-in student profile where the page has authenticated profile access.

Automatic routes general/fantasy text to Lewis and ELA/reading/spelling text to Liam. Bella is a complete English alternative. Alex reads supplied Spanish translations. English assessment words and reading passages remain in English; when no Spanish support translation exists, Liam provides the assessed English pronunciation.

The pilot contains four approved welcome recordings. Other sections use browser speech safely until their fixed text is included in the private batch-generation jobs. Missing audio cannot block an assignment. The production package contains no model, API key, paid request, dependency cache, or temporary audio.

The Witches Reader now uses the shared player. Its older browser-boundary highlighting engine remains in the file for compatibility, but the shared player does not promise synchronized highlighting until reliable timing data is generated.
