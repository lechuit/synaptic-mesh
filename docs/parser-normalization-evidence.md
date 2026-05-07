# Parser normalization evidence

Parser normalization evidence is the local-shadow bridge between messy raw handoffs and RouteDecision inputs.

It records what a receiver can observe before any classifier or runtime integration exists:

```text
raw handoff
  -> parserEvidence
  -> normalized routeDecisionInput
  -> expected RouteDecision fixture
```

The current gate is:

```bash
cd implementation/synaptic-mesh-shadow-v0
npm run test:parser-normalization-evidence
```

## What is covered

The fixture set covers hand-authored raw-ish handoffs for:

- valid local-shadow receipt -> `shadow_only`;
- free-text config / permanent-memory promotion -> `ask_human`;
- stale source or policy window -> `fetch_source`;
- folded-index mismatch hiding runtime/tool authority -> `ask_human`;
- benign folded-index mismatch without sensitive signals -> `request_full_receipt`;
- multiple valid receipts conflicting over config/runtime authority -> `ask_human`;
- nested handoff boundary loss -> `request_full_receipt`;
- sender-overclaimed human approval for config/memory/runtime -> `ask_human`;
- stale policy checksum -> `request_policy_refresh`;
- unknown compact grammar digest -> `request_grammar_refresh`;
- explicit destructive delete request -> `block`;
- unparseable authority fragment -> `abstain`;
- malformed local receipt without sensitive promotion -> `request_full_receipt`.

Each case records:

- `rawArtifactId` and `rawInputShape`;
- receipt candidate counts;
- valid vs invalid receipt counts;
- free-text authority attempts;
- sensitive boundary signals;
- folded-index status;
- normalization warnings;
- `routeDecisionInputHash` binding the normalized input used by the route-decision fixture.

## Non-goals

This is deliberately not:

- a live parser robustness proof;
- a classifier;
- a live shadow observer;
- runtime enforcement;
- tool authorization;
- memory write authorization;
- config mutation;
- network access;
- publication readiness;
- production or canary safety evidence.

The goal is narrower: make the receiver's pre-decision evidence auditable before adding classifier or real-flow replay work.
