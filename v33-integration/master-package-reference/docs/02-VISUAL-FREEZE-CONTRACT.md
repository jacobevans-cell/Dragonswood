# 02 — V3.3 Visual Freeze Contract

## Purpose

The next phase is integration, not visual redesign.

## Frozen appearance

Do not intentionally change without explicit user approval:

- overall page compositions
- widths/heights of major regions
- sidebar/header dimensions
- card geometry
- spacing rhythm
- reference-matched background placement
- gloss/glass/metallic material treatment
- gradient direction and visual weight
- typography hierarchy
- icon/art placement
- artwork crops
- navigation visual treatment
- teacher density/proportions established in V3.3

## Allowed integration changes

Changes are allowed when required to make real production behavior function, provided they preserve the visual result. Examples:

- replacing hardcoded mock values with live data
- replacing mock click handlers with real service calls
- adding nonvisual adapters/services
- adding loading/error state logic that uses existing visual components
- adding accessibility semantics that do not alter the approved layout
- wiring production assets into existing approved visual slots

## Change-control rule

If a production feature cannot fit into V3.3 without a visible change:

1. do not improvise a redesign;
2. document the conflict;
3. preserve the feature in the integration architecture;
4. ask for explicit approval before altering visual structure.

## Hash-protected baseline

The package includes a baseline hash manifest for the approved V3.3 CSS and art assets.

Run:

`python tools/verify_visual_freeze.py`

from the package root to detect modifications to the protected baseline copy.

In the eventual integration branch, use the same principle: visual changes should be intentional and reviewable, not side effects of functionality work.
