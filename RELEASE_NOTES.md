# Release Notes — Synaptic Mesh v0.26.5

## Summary

`v0.26.5` adds **passive observation window** over existing safe local stages. It runs one bounded operator-started observation loop from explicit repo-local sources through positive pass, review queue, manual local outcomes, and value scorecard.

## Evidence

- `windowStatus: OBSERVATION_WINDOW_COMPLETE`
- `stage chain: 6`
- `value scorecard: VALUE_SCORECARD_COMPLETE`
- `recommendation: HOLD_FOR_MORE_EVIDENCE`
- `recommendationIsAuthority: false`
- `policyDecision: null`
- `redacted evidence packet`
- `human-readable report only`
- negative controls for unsafe source specs, invalid chaining, missing/degraded intermediate artifacts, malformed authority fields/tokens in stage/reportMarkdown, unsafe outcome labels, scorecard recommendation treated as authority, raw persistence/output, external effects, nonlocal paths/symlinks/globs/network, invalid bounds, duplicate/missing ids, and output leakage

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to explicit repo-local sources and local manual outcome fixtures, redacted-before-persist, redacted-evidence-packet-only, human-readable-only, non-authoritative, and not runtime authority.

## Next

The next gate should either increase reviewer usefulness with more local fixture variety or improve reporting ergonomics while preserving the no-effects boundary.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
