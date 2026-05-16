# Local Review Notes — Passive Hard-Case Outcome Repeatability Scorecard v0.35.5

Status: approved by two independent local reviews.

Review focus:

- v0.35 consumes only the pinned completed v0.34.5 outcome value artifact by path and sha256.
- Upstream v0.34 artifact fields, protocol fields, metrics, outcome items, semantic labels/values, and report markdown digest are pinned.
- Repeatability runs measure stable usefulness/noise/evidence-gap labels across baseline, paraphrased-rationale, and order-invariant passes.
- Output remains human-readable-only, non-authoritative, not agent-consumed, no memory promotion, no runtime integration, no policy decision.
- Negative controls should degrade on artifact spoofing, label drift, unknown fields, source-bound failures, authority/token leakage, runtime/tool/network/memory/config/raw/external-effect attempts.

Review A: APPROVE.

- Verified pinned v0.34.5 artifact sha256 `cb6d4165d14b0747f1b739abf1c79be0b60d0f28eefdbcaf4436361f5fef92e2` and report sha256 `470ce1844e3b86ced192aa2a9996b5619392a048b230a8cf45a9514c72c42ecc`.
- Verified pinned outcome semantics: five hard cases, three useful, one noise, one evidence gap.
- Verified repeatability coverage: three runs, fifteen judgements, label drift detection, duplicate/missing IDs, boundary flags, and rationale presence.
- Verified 51 rejected negative controls and no authority-token payload leak.
- Verified output boundary: `policyDecision: null`, `agentConsumedOutput: false`, `recommendationIsAuthority: false`, no memory promotion, no runtime integration.
- Verified release-check integration, manifest/docs references, clean `git diff --cached --check`, and `/tmp/v035-release-check-final.log` status pass.
- Non-blocking note: CLI reads the provided local path before validator rejects unpinned paths; current scope is local/operator-run and does not leak parsed content, but future hardening can pre-check normalized path before reading.

Review B: APPROVE.

- Verified v0.34 upstream artifact path and SHA pinning; fabricated copies are rejected.
- Verified unknown upstream artifact/protocol/metrics/item fields are rejected.
- Verified labels, values, metrics, and `reportMarkdown` digest are pinned against semantic/report poisoning.
- Verified repeatability controls catch missing/duplicate runs, missing/duplicate cases, label drift, bad IDs/kinds/counts.
- Verified boundary flags remain non-authoritative: `policyDecision: null`, `promoteToMemory: false`, `agentConsumedOutput: false`, and no runtime/tool/network/memory/config/raw/external effects.
- Verified authority-token leakage is redacted/detected without raw payload re-emission.
- Verified docs/manifest/evidence/package scripts/release-check integration and `/tmp/v035-release-check-final.log` status pass.
- Re-ran focused v0.35 tests and release check; both passed.

No blockers found.
