# Dragonswood Narrator — private generation tool

The Kokoro model runs only on a private development computer or GitHub Codespace. Students receive only completed MP3 files.

From the repository root:

```bash
npm install && npm run narration:audit && npm run narration:generate
```

The first run downloads and caches `onnx-community/Kokoro-82M-v1.0-ONNX`. Model files, caches, temporary WAV files, and `node_modules` are excluded from Git. The generator skips unchanged clips and exits unsuccessfully when a required clip fails.

Generated MP3 path:

`assets/audio/narration/{area}/{lesson-id}/{section-id}--{voice-id}.mp3`
