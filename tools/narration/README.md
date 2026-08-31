# Dragonswood Brian narration

Dragonswood now uses Azure voice `en-US-BrianMultilingualNeural` as its one named narrator. The Azure key is never placed in HTML, JavaScript, the manifest, or an MP3.

There are two complementary paths:

1. Stable pages and books are generated privately as MP3 files and published with the site.
2. Authenticated lessons that change can call a protected Firebase function. The function stores one private cached MP3 per text hash, so identical wording is reused.

The browser's installed voice is only an emergency fallback when neither Brian path is available. David and Zira are no longer preferred or presented as Dragonswood narrators.

## Generate the current book and stable clips

On Windows, double-click:

`START-BRIAN-NARRATION-GENERATOR.cmd`

It prompts for the Azure Speech region and a hidden key. The key exists only in the child process and is cleared afterward. The initial plan contains the welcome clip and all 88 pages embedded in `witches-reader.html`.

Command-line equivalents:

```powershell
npm run narration:plan
$env:AZURE_SPEECH_KEY = 'paste-key-for-this-process'
$env:AZURE_SPEECH_REGION = 'eastus'
npm run narration:generate
Remove-Item Env:AZURE_SPEECH_KEY, Env:AZURE_SPEECH_REGION
```

Generated paths are:

```text
assets/audio/narration/{area}/{lesson-id}/{section-id}--us-brian.mp3
assets/audio/library/{book-id}/us-brian/page-{number}.mp3
```

The generator writes `narration-manifest.generated.json`, replaces `narration-manifest.js` only after every required clip succeeds, and writes `narration-generation-report.json`. It uses the same normalized FNV-1a text hash as the website. On the next run, unchanged text and MP3s are reused; only new or edited text is sent to Azure.

The 3.25-second pacing stays below the Azure F0 real-time limit of 20 requests per 60 seconds. A failed run leaves the previous site manifest intact.

## Add a future library book

For a normal new reader, save a UTF-8 JSON file such as `library/books/dragon-book.json`:

```json
{
  "schemaVersion": 1,
  "bookId": "dragon-book",
  "pages": [
    {"page": 1, "text": "Page one text."},
    {"page": 2, "text": "Page two text."}
  ]
}
```

Then add it to `library-books.json`:

```json
{
  "id": "dragon-book",
  "title": "Dragon Book",
  "enabled": true,
  "source": "library/books/dragon-book.json",
  "sourceFormat": "json-pages",
  "clipIdPrefix": "library/dragon-book/page-",
  "locale": "en-US"
}
```

The future reader calls the shared player with the same ID and exact text:

```js
DWNarrator.play({
  id: `library/dragon-book/page-${page.page}`,
  text: page.text,
  contentType: "book",
  locale: "en-US"
});
```

For Brian's British, Irish, or Australian English delivery, change a book's `locale` to `en-GB`, `en-IE`, or `en-AU`. This changes the accent while retaining the Brian persona. The site default is `en-US`.

## Enable changing lesson text

The protected callable is `synthesizeBrianNarration` in `functions-academic-ai/index.js`. It accepts only authorized Dragonswood users, limits text to 6,000 characters per part, serializes Azure misses for the free tier, and caches MP3s in private Cloud Storage under a SHA-256 key. The browser automatically breaks longer page text into parts.

Set both Firebase secrets, then deploy only this function:

```powershell
firebase functions:secrets:set AZURE_SPEECH_KEY --config firebase.academic-ai.json
firebase functions:secrets:set AZURE_SPEECH_REGION --config firebase.academic-ai.json
firebase deploy --config firebase.academic-ai.json --only functions:academic-ai:synthesizeBrianNarration
```

Use the short Azure region name, for example `eastus`. Never commit a key to the repository.

Public pages that do not initialize signed-in Firebase—such as a self-contained book reader—use the generated MP3 library. Signed-in lesson pages can use the callable for new daily wording and then reuse the cached result.

## What can still cost money

Azure counts newly synthesized characters. Unchanged static clips are skipped locally, and identical dynamic text is served from the private cache without another Azure synthesis. Firebase Functions and Storage can still have small platform usage. A custom cloned voice would be a separate paid product; this setup uses Microsoft's stock Brian multilingual neural voice.

References: [Azure text-to-speech quickstart](https://learn.microsoft.com/azure/ai-services/speech-service/get-started-text-to-speech), [Speech quotas and limits](https://learn.microsoft.com/azure/ai-services/speech-service/speech-services-quotas-and-limits), and [language/voice support](https://learn.microsoft.com/azure/ai-services/speech-service/language-support).
