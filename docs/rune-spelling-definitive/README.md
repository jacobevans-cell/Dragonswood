# Dragonswood Definitive Rune Spelling Word Set

Status: **owner approved and definitive**

Student-facing/public name: **phonics clips**. Source and permission records retain their precise internal provenance.

- Source workbook: `source/Dragonswood-Words-and-Spalding-Breakdown.xlsx`
- Source SHA-256: `A4CE8669B462DBD464291B3D8ED7B9F2EDF9B420F0A654B2DC810230F5EB452C`
- Approved words: **1,683** (no duplicates)
- Lessons: **150** across five levels and 30 weeks per level
- Weekly lesson size: **11–12 words**, exactly as supplied
- Canonical word data: `definitive-word-set.json` and `definitive-word-set.csv`
- Runtime lesson bank: `definitive-lessons.json`
- Automated gates: `validation-report.json`
- Approved audio library: `../../assets/audio/rune-spelling/approved-spalding-mp3/`
- Previous embedded banks: `rollback/`

The importer preserves the workbook's word, placement, order, word parts, whole-word phonetics, Spalding breakdown, selected sound for every phonogram, rule/watch note, and difficulty exactly. Normal phonogram sounds are routed to the matching owner-approved Track 1–4 MP3 clip. Silent chunks remain silent; explicitly labeled exceptions use the whole-word pronunciation so Rune does not substitute an incorrect isolated phonogram sound. The authorized tracks contain no isolated recording for one selected sound (the second `ear` sound in `disappear`); it is labeled but deliberately has no substitute phonogram audio. See `validation-report.json`.

Regenerate and reinstall from the repository root:

```powershell
node tools/install-rune-spelling-definitive-word-set.mjs --matrix <artifact-tool-workbook-values.json> --workbook <Dragonswood-Words-and-Spalding-Breakdown.xlsx>
```
