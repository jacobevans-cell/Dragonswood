# Rollback

The installer prints both:

- the hardening commit SHA, for a normal `git revert`, and
- a `backup/math-operations-pre-56-27-*` branch pointing at the exact pre-install state.

Preferred rollback after push:

```bash
git revert <HARDENING_COMMIT_SHA>
git push origin main
```

If the Claude debug patch was also applied by the installer and you want to remove both commits, revert the hardening commit first and the Claude debug commit second.
