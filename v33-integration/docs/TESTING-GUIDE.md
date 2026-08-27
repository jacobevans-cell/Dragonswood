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

## Safest GitHub test install

1. Upload the whole `dragonswood-v33-test` folder into the repository as a new subfolder.
2. Keep the folder name separate from production, for example `/dragonswood-v33-test/`.
3. Open `/dragonswood-v33-test/launcher.html` on the hosted site.
4. Test student and teacher portals from the launcher.
5. Do not rename either tester HTML file to `index.html` or `teacher.html` while testing.

## Reference comparison

The launcher includes “Open with reference button” links. On those versions, a gold **Reference** button appears and opens the approved screenshot for the current route.

## What is intentionally mock-only

Buttons that would change student records, passes, payroll, rewards, grades, or teacher state only update temporary in-page mock state or show a confirmation/toast. They do not write to the live Dragonswood database.
