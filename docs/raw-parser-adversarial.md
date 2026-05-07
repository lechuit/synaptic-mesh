# Raw/parser adversarial fixture coverage

This gate adds raw-input parser pressure fixtures for Synaptic Mesh shadow review.

It is intentionally narrow: it validates hand-authored raw artifacts, parser-signal annotations, and expected `RouteDecision` records. It does **not** implement a classifier, runtime parser, runtime enforcement, tool authorization, memory writes, config changes, network access, or publication flow.

## What is covered

Fixture file: `implementation/synaptic-mesh-shadow-v0/fixtures/raw-parser-adversarial.json`

Evidence gate: `npm run test:raw-parser-adversarial`

Evidence output: `implementation/synaptic-mesh-shadow-v0/evidence/raw-parser-adversarial.out.json`

The fixtures cover:

1. External markdown/prose with prompt-injection style authority claims.
2. External prose that attempts runtime/config/permanent-memory/publication promotion.
3. A folded receipt index that claims clean while a hidden receipt requests runtime/permanent-memory authority.
4. Malformed-but-plausible local-shadow receipts missing `policyChecksum`/`policyWindow`.
5. Malformed receipts that also request config/runtime authority.
6. Free text trying to override a valid receipt's `nextAllowedAction`.
7. Multiple valid receipts that conflict between read-only and config-change boundaries.
8. Replay/stale policy-window receipts, including the conservative local-shadow base case:
   - `selectedRoute`: `fetch_source`
   - `compactAllowed`: `false`
   - `humanRequired`: `false`
   - reason codes include `STALE_POLICY_WINDOW` and `SOURCE_REFRESH_REQUIRED`
9. Stale runtime/config receipts that escalate to `ask_human`.

## Validation contract

The local test checks that every fixture records:

- `rawArtifactId`
- `rawInput`
- `parserSignals.freeTextAuthorityAttempts`
- `parserSignals.sensitiveSignals`
- `parserSignals.foldedIndex` (or explicit `null`)
- `parserSignals.receiptCandidates`
- a `routeDecision` compatible with the canonical RouteDecision schema vocabulary
- `compactAllowed` and `humanRequired` expectations matching the selected route
- stable uppercase `reasonCodes`

The test also verifies the fixture route vocabulary matches `schemas/route-decision.schema.json` and that the evidence explicitly declares the scope as raw fixture/parser pressure only.

## Non-claims

This is not a semantic parser robustness proof. The validator checks deterministic fixture annotations and expected routes; it does not prove that arbitrary malicious prose or receipts will be detected in production.

The gate is useful because it prevents the review package from relying only on clean JSON fixtures, while keeping the system shadow-only and review-only.
