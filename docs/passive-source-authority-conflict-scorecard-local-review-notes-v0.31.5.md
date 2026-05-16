# Local Review Notes v0.31.5

Two independent local reviews approved HEAD `20751e0` on `release/v0.31-passive-source-authority-conflict-scorecard` before PR.

## Review A

Verdict: APPROVE.

Evidence checked:
- `npm run verify:manifest`
- `npm run test:passive-source-authority-conflict-scorecard`
- `npm run release:check -- --target v0.31.5`
- Confirmed scorecard is bound to the pinned v0.30.5 receiver artifact path/digest and exact expected receiver metrics/items.
- Confirmed four passive conflict cases: source-bound decision vs inference, project rule vs generic prior, explicit contradiction, and stale negative context.
- Confirmed boundaries: `policyDecision: null`, no memory promotion, human-readable/non-authoritative only, no runtime/tool/network/memory/config/external effects.
- Confirmed fabricated v0.30-style receiver copies degrade on pinned path, pinned sha256 digest, unknown top-level fields, unknown protocol fields, and unknown receiver item fields.

## Review B

Verdict: APPROVE.

Adversarial evidence checked:
- `npm run test:passive-source-authority-conflict-scorecard`
- `npm run verify:manifest`
- Re-ran fabricated-copy repro and variants with wrong path, wrong digest, unknown top-level/protocol/item fields, wrong IDs/treatments/anchors/digests, authority-token payloads, non-null `policyDecision`, `agentConsumedOutput`, `promoteToMemory`, `precedenceSuggestionIsAuthority`, and tool/network/runtime/memory/config/raw/external-effect flags.
- Confirmed all adversarial cases degrade to `DEGRADED_PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD` with `HOLD_FOR_MORE_EVIDENCE`.
- Confirmed tested authority-token payloads do not leak into JSON/report output.
- Confirmed canonical positive control still completes with `ADVANCE_OBSERVATION_ONLY`.
- Source/CLI inspection found no network/tool/runtime/memory/config effects; CLI only reads the explicit local receiver artifact and optionally writes explicit repo-local `--out` / `--report`.

## Result

No blockers remain after hardening the previous fabricated-copy finding with pinned receiver artifact path/digest checks and unknown-field rejection.
