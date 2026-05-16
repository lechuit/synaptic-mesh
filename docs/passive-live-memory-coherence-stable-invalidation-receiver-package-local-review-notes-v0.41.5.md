# Local Review Notes — v0.41.5 Stable Invalidation Receiver Package

Two independent local reviews completed for the passive live memory/coherence stable invalidation receiver package.

## Review A — APPROVE

Evidence checked:
- Pre-read path pinning is enforced before file read in both CLI and source helper.
- The v0.40.5 input artifact is pinned by allowed path, artifact id, schema, release/status, SHA-256 digest, reportMarkdown digest, metrics, and expected item semantics.
- Receiver semantics preserve three stable carry-forward items, one stale-invalidated/excluded item, and one contradiction-caution item.
- Boundary invariants hold: `policyDecision: null`, non-authoritative, not runtime instruction, `agentConsumedOutput: false`, `promoteToMemory: false`, `rawPersisted: false`, no memory writes, and no runtime integration.
- Negative controls cover path traversal, digest drift, object/report drift, unknown-field smuggling, authority/runtime/tool/network/memory/config/raw output requests, stale/contradiction treatment drift, promotion, and agent consumption.
- Scripts, release-check suite, manifest, docs, and release notes are wired.

Gates run from `implementation/synaptic-mesh-shadow-v0`:
- `npm run test:passive-live-memory-coherence-stable-invalidation-receiver-package`
- `npm run verify:manifest`
- `npm run release:check -- --target v0.41.5`

No blocking issues found.

## Review B — APPROVE

Evidence checked:
- Pre-read path pinning happens before file read; traversal/path spoof controls are covered.
- Input digest pinning checks both declared SHA-256 and object digest.
- Receiver package preserves stable carry-forward, stale invalidation, and contradiction caution lanes.
- No runtime/tool/network/config/memory effects were found in source; only local evidence writes occur in bin/test artifacts.
- Artifact/tests verify `policyDecision: null`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `promoteToMemory: false`, and `rawPersisted: false`.
- Release-check suite and manifest required paths include the v0.41.5 package.

Gates run from `implementation/synaptic-mesh-shadow-v0`:
- `npm run test:passive-live-memory-coherence-stable-invalidation-receiver-package`
- `npm run verify:manifest`
- `npm run release:check -- --target v0.41.5`
- `git diff --cached --check`
- `git diff --check`

No blocking issues found.

Non-blocking note from Review B resolved in these notes: the prior placeholder said independent reviews were pending.
