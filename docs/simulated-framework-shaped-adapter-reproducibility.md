# Simulated framework-shaped adapter reproducibility/drift gate v0.7.3

`v0.7.3` adds a local reproducibility/drift gate for the `v0.7.2` simulated framework-shaped adapter evidence.

The gate reruns the fake/local/already-redacted fixtures twice and normalizes only record-only review evidence:

```text
committed v0.7.2 simulated-adapter evidence
→ rerun fake local fixtures twice
→ normalize parserEvidence / classifierDecision / DecisionTrace / advisory report fields
→ compare normalized hashes
→ reject drift controls
→ emit record-only reproducibility evidence
```

## Drift controls

The gate rejects drift in summary metrics, framework-kind ordering, classifier `compactAllowed`, machine-policy flags, agent consumption, authorization/enforcement capability flags, DecisionTrace boundary verdicts, and boundary token loss.

## Explicit non-goals

No real framework integration, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no SDK import, no network, no live traffic, no resource fetch, no tool execution, no memory/config writes, no publication, no agent-consumed advisory, no machine-readable policy, no approval, no block/allow, no authorization, and no enforcement.

## Gate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:simulated-framework-shaped-adapter-reproducibility
```

A pass means the committed simulated-adapter review evidence is locally reproducible and that the listed drift controls reject. It does not authorize a real adapter.
