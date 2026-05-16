# Local Review Notes — v0.42.5 Receiver Package Usefulness Rehearsal

Two independent local reviews approved v0.42.5 after the manifest reconciliation blocker was fixed.

## Review A — APPROVED

Review A verified:
- Pre-read path pinning occurs before `readFile`; traversal/unpinned paths are rejected.
- Only the pinned completed v0.41.5 receiver package is accepted via path, artifact id, schema, release, status, digest, report digest, metrics, and item lanes.
- Comparison modes are present and fair: receiver package vs raw stable signals vs repeatability scorecard.
- Metrics match the required values: receiver usefulness `1`, raw/scorecard usefulness `0.6`, receiver noisy `0`, raw/scorecard noisy `2`.
- Boundary invariants hold: no memory writes, no runtime integration, no raw persistence/output, no memory promotion, no agent-consumed output, recommendation not authority, and `policyDecision: null`.
- Release-check integration and manifest paths are consistent.

## Review B — APPROVED

Review B threat-modeled:
- Path traversal/read-before-validate.
- Pinned artifact spoofing and digest/report drift.
- Unknown-field and authority/liveness smuggling.
- Stale/contradiction treatment drift and comparison metrics.
- Raw persistence, memory-promotion flags, runtime/tool/network/config/memory effects, agent-consumed machine-readable policy decisions, manifest/release-check gaps, and doc/release-note overclaims.

Review B additionally verified the v0.42.5 reviewer artifact and report match manifest bytes/hashes, the embedded report matches persisted markdown, `validationIssues` is empty, `policyDecision` is `null`, `recommendationIsAuthority=false`, `agentConsumedOutput=false`, `noMemoryWrites=true`, and `noRuntimeIntegration=true`.

Non-blocking hardening notes for future releases:
- Future releases could make even more explicit that this comparison is bounded/synthetic over the pinned v0.41.5 receiver package rather than an independently reloaded raw-signal/scorecard replay.
- Future CLI hardening could anchor output writes to the package root instead of the current working directory.
- Future reviewer packages could persist the pinned input path and sha256 directly in the output artifact for easier independent audit.
- Future artifact validation could assert `reportMarkdown` exactly equals the generated report to prevent report/body drift.

## Gates confirmed after fix

- `npm run test:passive-live-memory-coherence-receiver-package-usefulness-rehearsal`
- `npm run verify:manifest`
- `npm run release:check -- --target v0.42.5`
- final `npm run verify:manifest`
- `git diff --cached --check`
- `git diff --check`
