# Archive

This directory holds **read-only historical artifacts** preserved across the rename from "Synaptic Mesh" to "Aletheia" and the migration from JavaScript to TypeScript.

Nothing here is part of the live system. Do not modify these files. Their value is precisely that they capture the project at a moment in time, so future work can verify against them or cite them faithfully.

## Contents

### `synaptic-mesh-shadow-v0/`

The original JavaScript (`.mjs`) reference implementation of the receipt parser, validator, decision engine, and receiver-policy adapter. It was the "no-effect, local-only" MVP under the v0.45.5–v0.52.5 release ladder.

**Why it's still here**:

1. **Parity baseline for the TypeScript migration.** Every fixture in `runs/2026-05-03-memory-retrieval-contradiction-lab/` was validated against this implementation. The TS implementation in `packages/core/` must produce identical decisions on the same inputs.
2. **Reproducibility of pinned release evidence.** The metrics in `CHANGELOG.md` (e.g. `effectsBlockedCount: 10`, `boundaryViolationCount: 0`) were measured against this exact code. Preserving it lets a future reviewer re-run the original suite and verify the historical claims.
3. **Citation.** Papers and audits in `research-package/` reference functions and behaviors from this code by path.

**Don't**:

- Modify it. Any fix or improvement goes into the TS implementation; this directory is frozen.
- Import from it in new code. It does not exist in the public API surface.
- Rename files inside it. The pinned-evidence paths in `CHANGELOG.md` and `research-package/` depend on these exact paths.

To run the historical smoke tests:

```bash
cd archive/synaptic-mesh-shadow-v0
npm run smoke
```
