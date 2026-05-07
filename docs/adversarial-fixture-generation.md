# Adversarial fixture generation

The local shadow package includes a deterministic adversarial fixture generator:

```bash
cd implementation/synaptic-mesh-shadow-v0
npm run test:adversarial-generator
```

The generator reads the hand-authored wrong-route RouteDecision oracle fixture at `implementation/synaptic-mesh-shadow-v0/fixtures/route-decision-wrong-routes.json` and writes:

- `implementation/synaptic-mesh-shadow-v0/fixtures/generated-adversarial-routes.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/adversarial-fixture-generator.out.json`

## What it does

The generator creates one deterministic variant for each current wrong-route oracle case. Each generated record:

- references the source oracle `caseId`;
- records generator version, deterministic seed, and transformation name;
- preserves the source oracle `selectedRoute`, `reasonCodes`, `decisiveSignals`, rejected/blocked routes, and full `RouteDecision` record;
- validates the preserved `RouteDecision` shape against `schemas/route-decision.schema.json` enums and stable-code constraints;
- records whether the expected route was preserved.

Current transformations cover boundary-phrase smuggling, folded-index promotion wrapping, stale policy-window variation, nested handoff wrapping, memory-claim to permission-claim laundering, free-text `nextAllowedAction` tampering, stale receipt timestamp variation, ambiguous verb injection, and missing-checksum boundary smuggling.

## Limits

Generated fixtures augment the hand-authored oracles. They do not replace them.

They are not semantic proof, authorization, production evidence, runtime integration, a classifier, or an enforcement layer. The generator performs no LLM/API calls and should not create cases where the expected route is unclear from the source oracle.
