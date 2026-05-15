# Release Notes — Synaptic Mesh v0.29.5

## Summary

`v0.29.5` adds **passive memory handoff candidate scorecard** over the completed v0.28 redacted recall probe artifact. It tests whether passive recall evidence can become a safe human-review handoff package for AI continuity: carry-forward candidates, surfaced contradictions, stale-context cautions, and noise suppression.

## Evidence

- `handoffStatus: MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE`
- `candidateCount: 4`
- `carryForwardCandidateCount: 2`
- `contradictionCandidateCount: 1`
- `staleCautionCandidateCount: 1`
- `sourceBoundCandidateRatio: 1`
- `contradictionFlagRatio: 1`
- `staleCautionRatio: 1`
- `noiseSuppressedCount: 1`
- `noiseSuppressionRatio: 1`
- `humanReviewCandidateRatio: 1`
- `boundaryViolationCount: 0`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `policyDecision: null`
- `human-readable report only`
- negative controls for missing/malformed recall artifact, degraded upstream status, fabricated upstream artifacts, unexpected v0.28 artifact identity/release layer/source-anchor/evidence digests, non-null `policyDecision`, source-bound failures, contradiction/stale failures, noise leakage, missing card coverage, unsourced matches, missing source anchors, raw persistence/output/source text, unsafe CLI paths, network/tool/memory/config/runtime flags, daemon/watch flags, invalid metrics, and authority-token text/card IDs that must be detected without being re-emitted

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to the completed repo-local v0.28 redacted recall artifact, human-readable-only, non-authoritative, and not runtime authority.

No enforcement, authorization, approval/block/allow semantics, tool execution, network/resource fetch, memory/config writes, external effects, daemon/watchers, autonomous runtime, raw persistence/output, runtime integration, durable memory writes, or agent-consumed machine-readable policy decisions.

## Next

The next gate may test receiver-side usefulness of these handoff candidates in a stricter shadow-only rubric, or harden authority/source conflict handling across competing memories. It must not convert recommendations or candidates into authority or live behavior.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
