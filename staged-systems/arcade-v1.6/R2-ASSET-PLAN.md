# R2 Asset Plan

Keep the initial lightweight SVG/CSS/JS assets inside the GitHub/Firebase site. Use R2 later for larger arcade assets: music, texture packs, 3D models, seasonal backgrounds, and downloadable level packs.

Recommended path convention:

```text
arcade/common/...
arcade/dragon-dash/...
arcade/void-runner/...
arcade/<future-game>/...
```

The public site may read from an R2 custom domain. It must never contain R2 write credentials.
