# Dragonswood V3.3 Safe Tester — Testing Guide

## What this package is

This is an isolated visual and interaction tester for the V3.3 screenshot-fidelity pass. It is deliberately **not** a production replacement.

## Production files protected

This test folder does **not** contain:

- `index.html`
- `teacher.html`

Its entry files are:

- `launcher.html`
- `student-test.html`
- `teacher-test.html`

The tester JavaScript does not initialize Firebase or call a production endpoint. Student draft/class/pet mock state uses browser storage keys beginning with `dw-v33-tester:`. Teacher commands are simulations only.

## Canonical hosted tester

1. Keep this tester inside the canonical `/v33-integration/` package.
2. Open `/v33-integration/launcher.html` on the hosted site.
3. Test student and teacher portals from the launcher.
4. Do not rename either tester HTML file to `index.html` or `teacher.html`.

The former duplicate `/dragonswood-v33-test/` package is retired.

## Reference comparison

The launcher includes “Open with reference button” links. On those versions, a gold **Reference** button appears and opens the approved screenshot for the current route.

## What is intentionally mock-only

Buttons that would change student records, passes, payroll, rewards, grades, or teacher state only update temporary in-page mock state or show a confirmation/toast. They do not write to the live Dragonswood database.
