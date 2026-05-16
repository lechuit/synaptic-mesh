# Local Review Notes — Passive Live Memory/Coherence Repeatability Scorecard v0.37.5

Status: approved by two independent local reviews after blocker fix.

Review focus:

- v0.37 consumes only the pinned completed v0.36.5 observation rehearsal artifact by path and sha256.
- v0.37 repeats four v0.36 observation items across three passive variants.
- Repeatability judgements are source-bound, redacted, human-review-only, non-authoritative, not agent-consumed, no memory promotion, no runtime integration, no policy decision.
- Negative controls degrade artifact spoofing, digest drift, unknown fields, report poisoning, label drift, benign semantic/source drift, raw persistence, authority/token leakage, runtime/tool/network/memory/config/raw/external-effect attempts.

Review A: APPROVE. Verified pinned v0.36.5 path/digest, recomputed object digest, per-observation semantic/source pinning (`sourcePath`, `sourceSha256`, `sourceSignal`, `observation`, `humanTreatment`), semantic/source drift negative controls, canonical complete output, manifest, and release check. No blockers.

Review B: APPROVE after initial blocker. Initial blocker: v0.37 accepted benign semantic/source drift while keeping a claimed canonical digest. Fix verified: mutating `observation`, `sourcePath`, `sourceSha256`, and `sourceSignal` now degrades with `input.observation_artifact_object_digest_not_pinned` and pinned-field validation issues; poisoned report markdown is rejected; unknown fields and boundaries are covered; manifest/release discipline passed. Non-blocking note: generated-artifact validator does not reject purely benign unknown fields added after generation, but manifest pinning plus boundary/authority scans cover the release-risk path.
