# Deploy Dragonswood v56.19 Sitewide Narration

This replaces the not-yet-deployed v56.18 pilot. It was rebuilt on GitHub main commit `070298b` after Claude's latest work. Do not deploy the older v56.18 ZIP or the earlier v56.19 ZIP.

## GitHub

Extract `DRAGONSWOOD-v56.19-CURRENT-MAIN-SITEWIDE-NARRATION-GITHUB.zip` at the repository root, preserving folders, then run:

```bash
git rm -f cedar-narration.js tools/generate-cedar-narration.mjs 2>/dev/null || true
git add .gitignore package.json narration-jobs.json narration-manifest.js dragonswood-narrator.js \
  index.html daily-quest.html spelling-practice.html fraction-forge.html witches-reader.html \
  tools/narration assets/audio/narration \
  DRAGONSWOOD-NARRATION-AUDIT-v56.19.md QA-v56.19-SITEWIDE-NARRATION.md DEPLOY-v56.19-SITEWIDE-NARRATION.md MERGE-NOTE-v56.19-CURRENT-MAIN.md
git commit -m "Add sitewide four-voice Dragonswood narration"
git pull --rebase origin main
git push origin main
```

## Firebase

Publish `firestore.rules` from the separate rules ZIP. It permits only Automatic, Lewis, Liam, Bella, or Alex as a student narration preference.

## R2 and Firebase Storage

No upload is required for this pilot. The four small welcome recordings are delivered from GitHub. Use R2 later for the full batch-generated narration library. Firebase Storage does not need a change.

See `MERGE-NOTE-v56.19-CURRENT-MAIN.md` for the preserved Claude base and the separate pre-existing Firestore coverage warning.

## Private narration generation

Run in Codespaces or a private development computer:

```bash
npm install
npm run narration:audit
npm run narration:generate
```

Never commit model downloads, ONNX files, `node_modules`, temporary WAV files, or secrets.
