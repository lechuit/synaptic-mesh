# ADR 0001: Shadow receiver architecture

## Status

Accepted for the local shadow implementation.

## Context

The Synaptic Mesh shadow receiver is growing from a small validation package into a safer place to test receiver policy, framework-shaped inputs, and reproducibility evidence. Recent work exposed three architecture pressures:

- receiver policy rules were expanding in ways that could make action classification hard to audit;
- framework action names can be ambiguous, so a default allow/fallback path must stay explicit and tested;
- repository-level evidence can become stale when tracked files change without a manifest guard.

The current project boundary remains local shadow only. These decisions do not claim runtime integration, production enforcement, framework SDK coverage, or protocol authority. They document the architecture now encoded by the scalable design patterns, action-policy contract tests/evidence, and manifest verification guard changes.

## Decision

1. Keep the receiver policy core pure.
   - Core receiver policy modules classify and evaluate packet data without filesystem, network, CLI, or evidence-writing side effects.
   - IO remains at the edges: CLIs under implementation `bin/`, contract/evidence writers in tests, and generated artifacts under `evidence/` or `runs/`.

2. Classify action behavior through a strategy registry.
   - Action classification uses ordered strategies instead of ad hoc conditional growth inside receipt validation.
   - Strategy order is part of the contract so ambiguous framework verbs cannot silently drift into unsafe fallbacks.

3. Treat tests and evidence as the first architecture contract.
   - Receiver-adapter contracts, action-policy contracts, and local review checks define expected shadow behavior before runtime claims.
   - Evidence should support review and reproducibility, not imply external enforcement.

4. Verify the tracked-file manifest as a repository gate.
   - `MANIFEST.json` carries the small human-readable release metadata; `MANIFEST.files.json` carries generated tracked-file bytes and hashes.
   - `npm run manifest:update` regenerates the file inventory, and `npm run verify:manifest`, `npm run check`, and `npm run review:local` should fail on missing, extra, or stale manifest entries.

5. Preserve small PR and review discipline.
   - Prefer behavior-preserving refactors, narrow seams, and docs/design notes over broad migrations.
   - Keep future ports/adapters extraction incremental and independently reviewed before merging to `main`.

## Consequences

- Receiver policy can grow by adding small, reviewable strategies rather than editing one large validator path.
- Framework-specific packet handling has a clear extraction path toward ports/adapters packages when the implementation outgrows the current package.
- Manifest verification reduces stale evidence risk but adds a maintenance step for every tracked-file change.
- Local checks are stronger, but the system remains a shadow implementation; this ADR does not authorize runtime integration or enforcement claims.
- Larger layout changes should still happen in dedicated PRs with regenerated evidence and independent review.
