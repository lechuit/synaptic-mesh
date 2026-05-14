# Simulated framework-shaped adapter v0.7.2

`v0.7.2` adds a fake/local/already-redacted simulated adapter for framework-shaped fixtures.

It validates a local record-only flow:

```text
fake framework-shaped local fixture
→ parserEvidence
→ classifierDecision
→ DecisionTrace
→ advisory report
→ record-only evidence
```

This is still not real framework integration.

## Explicit non-goals

No MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no SDK import, no network, no live traffic, no resource fetch, no tool execution, no memory/config writes, no publication, no agent-consumed advisory, no machine-readable policy, no approval, no block/allow, no authorization, and no enforcement.

## Gate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:simulated-framework-shaped-adapter
```

A pass means the fake adapter can transform local already-redacted fixtures into record-only review evidence. The adapter persists only a neutralized classifier evidence shape (`compactAllowed=false`, no mayBlock/mayAllow, no authorization, no enforcement). It does not authorize a real adapter.
