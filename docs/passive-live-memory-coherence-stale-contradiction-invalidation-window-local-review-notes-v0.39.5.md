# Local Review Notes — Passive Live Memory/Coherence Stale/Contradiction Invalidation Window v0.39.5

Status: approved by two independent local reviews after blocker fixes.

Review focus:

- v0.39 consumes only the pinned completed v0.38.5 usefulness window artifact by path and sha256.
- v0.39 carries forward current valid handoff signals, invalidates stale signals, and labels contradictory boundary claims for human review.
- Candidates and judgements are source-bound, redacted, human-review-only, non-authoritative, not agent-consumed, no memory promotion, no runtime integration, no policy decision.
- Negative controls should degrade artifact spoofing, digest drift, report poisoning, handoff semantic drift, stale-not-invalidated, contradiction-not-cautioned, unknown-field smuggling, raw persistence, authority/token leakage, runtime/tool/network/memory/config/raw/external-effect attempts.

Review A: approved. Evidence checked: target feature gate, manifest verification, `release:check -- --target v0.39.5`, and final manifest verification all passed; traversal/path spoofing negative controls are present; v0.39.5 remains passive/read-only/local/human-review-only with `policyDecision: null`, no memory writes, no runtime integration, and 0 boundary violations.

Review B: approved. Evidence checked independently: traversal-shaped `usefulnessArtifactPath` values degrade with `input.usefulness_artifact_path_not_pinned`; release/manifest gates pass cleanly with 1528 manifest files; no network/tool/runtime/config/memory/external-effect boundary crossing found.
