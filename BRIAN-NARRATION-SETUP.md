# Brian selected for Dragonswood

The website runtime, current book reader, stable-audio generator, and optional changing-lesson backend are wired for `en-US-BrianMultilingualNeural`.

## Finish the audio

1. Double-click `START-BRIAN-NARRATION-GENERATOR.cmd`.
2. Enter the Azure Speech region used by the resource (`eastus` is the default prompt).
3. Paste the Speech key into the hidden prompt.
4. Publish the newly generated `assets/audio` files plus both narration manifest files with the site.

The first run prepares 89 clips: one welcome clip plus 88 pages in the current Witches reader. Later runs reuse unchanged MP3s and regenerate only text that changed.

## Enable daily changing lessons

Set the `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` Firebase secrets and deploy `synthesizeBrianNarration` from the `academic-ai` codebase. Exact deployment commands and the future-library JSON format are in `tools/narration/README.md`.

The site never receives the Azure key. Signed-in lesson text is hashed and cached, so the same words reuse the same Brian recording.

## Online-only GitHub method

The repository includes `.github/workflows/generate-brian-narration.yml`. After the patch is committed to the default branch:

1. Add repository Actions secrets named `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`.
2. In **Settings → Actions → General → Workflow permissions**, allow read/write access and allow GitHub Actions to create pull requests.
3. Open **Actions → Generate Brian Narration → Run workflow**.
4. Leave **force regenerate** unchecked for normal use.
5. The workflow generates only missing or changed MP3s and opens a review pull request. It never pushes generated audio directly to the default branch.
