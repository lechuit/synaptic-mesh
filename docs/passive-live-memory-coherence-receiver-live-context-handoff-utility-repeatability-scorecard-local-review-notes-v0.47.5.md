# Local Review Notes v0.47.5

Two independent local reviews were completed for `v0.47.5` after the manifest/evidence drift fix. Earlier Review A/B runs are intentionally not counted because both blocked on stale `MANIFEST.files.json` digests for regenerated historical evidence.

## Review A2 — APPROVE

Evidence checked:

- Reviewed staged diff on `release/v0.47-passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard`; 38 staged files, no unstaged diff after release-check.
- Required gates passed from `implementation/synaptic-mesh-shadow-v0`:
  - `npm run test:passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard`
  - `npm run verify:manifest`
  - `npm run release:check -- --target v0.47.5`
  - `git diff --cached --check`
  - `git diff --check`
- Release-check passed for target `v0.47.5`; manifest target matched `v0.47.5`.
- Regenerated v0.18-v0.20 evidence is staged and manifest-consistent.
- v0.47.5 artifact uses pinned v0.46.5 handoff utility artifact with expected SHA `958195ce8630eb160c1a93186bc07add899517701430eaa02a2252a56a26ae2a`.
- Repeatability covers 3 variants: `baseline_order`, `paraphrased_rationale_whyUseful`, `reverse_order`; metrics show 3 runs, 5 stable items, 0 unstable, `boundaryViolationCount=0`.
- Boundary checks hold: local/passive/read-only, redacted-before-persist, `rawPersisted=false`, human-review-only, non-authoritative, no memory writes, no runtime integration, no external/tool/network effects.
- `policyDecision` appears only as top-level null sentinel in reviewer JSON artifact; it is not repeated in protocol/metrics/runs/items.

## Review B2 — APPROVE

Evidence checked:

- Required gates passed:
  - `npm run test:passive-live-memory-coherence-receiver-live-context-handoff-utility-repeatability-scorecard`
  - `npm run verify:manifest` (`status: pass`, `files: 1738`)
  - `npm run release:check -- --target v0.47.5` (`status: pass`)
  - `git diff --cached --check`
- After `release:check`, `git diff --name-only` remained empty; no unstaged drift.
- v0.46.5 source artifact is pinned before read via allowed exact paths only; traversal/absolute spoofing rejects.
- Verified source SHA `958195ce8630eb160c1a93186bc07add899517701430eaa02a2252a56a26ae2a` and report SHA `fa81fcd83e0674be27b922e6c7b1b257888a3abb35f4990a8dcafa9efca928a7`.
- v0.47.5 artifact validates with `validationIssues: []`; no unknown-field smuggling found.
- `policyDecision` appears only as top-level `null`; absent from protocol, metrics, runs, and items.
- Boundary flags hold: no memory/config/runtime/tool/network/external effects; `agentConsumedOutput=false`, `recommendationIsAuthority=false`, `rawPersisted=false`, `boundaryViolationCount=0`.
- Repeatability stable across baseline/paraphrased/reverse variants: 3 runs, 5 stable handoff items, 0 unstable, stable ratios (`receiverUsefulnessRatio=1`, raw/scorecard `0.6`).

## Result

`v0.47.5` is approved by two independent local reviews for PR/release, subject to final local gates, CI, merge, exact-tag verification, and normal release discipline.
