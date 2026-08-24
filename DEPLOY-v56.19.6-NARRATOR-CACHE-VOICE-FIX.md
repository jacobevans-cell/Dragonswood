# Dragonswood v56.19.6 — Narrator Cache and Voice Fix

## Fixed

- Versioned the narration manifest and reader script on every student page so GitHub Pages and Chrome cannot combine a new page with an older narrator.
- Removed the Profile `Reload to Enable Voice` dead end; older cached readers now use the compatible preview path.
- Bella now searches all installed English voices, including ChromeOS `Google UK English Female`, rather than collapsing onto Liam's single U.S. default.
- Lewis, Liam, Bella, and Alex retain explicit browser-family mappings.

## Deploy

Unzip at the repository root and commit every extracted file.

No Firestore, Firebase Storage, or R2 update is required.

## Test

1. Wait for GitHub Pages to publish; then load normally. The new `?v=56.19.6` URLs bypass the stale reader automatically.
2. In Profile, preview all four voices.
3. In The Witches, read the same selected page with Lewis, Liam, Bella, and Alex.
4. Confirm Bella uses a female English voice and Liam uses the U.S. academic/default English voice.
