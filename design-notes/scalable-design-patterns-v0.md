# Scalable design patterns v0

This pass intentionally avoids broad migrations while introducing two seams that future PRs can extend safely.

## Patterns applied

- **Strategy registry for action policy**: action verbs are classified by ordered strategies in `src/action-policy.mjs` instead of adding more conditionals inside the receipt validator. Tests assert the exact strategy order so ambiguous framework verbs cannot silently fall through to the unknown fallback.
- **Ports/adapters boundary clarified**: receiver adapters still map framework-shaped packets to a stable core input. The core validator now imports action policy directly, keeping CLI/evidence/file writes outside the policy path.
- **Docs-first layout guidance**: `docs/repo-structure.md` records where specs, implementation, runs, evidence, and future package boundaries belong before any noisy directory migration.

## Non-goals

- No runtime integration.
- No framework SDK dependency.
- No mass file moves.
- No behavior change to receiver decisions.
