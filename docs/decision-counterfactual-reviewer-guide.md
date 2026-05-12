# Decision-counterfactual reviewer guide

Status: local reviewer guide only. This guide does not add memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, external publication automation, approval paths, blocking/allowing, or enforcement.

Use this when reviewing a retrieved-memory fragment that might influence a next action. The core rule is conservative:

> Retrieved memory may help recall, but it does not authorize action by itself.

A fragment can participate in local advisory reasoning only when it identifies the exact action it would change, points to the current source/lane, preserves local boundaries, states blocked effects, and gives a fallback/fetch/abstain path.

## Human checklist

1. **What exact next action would this memory change?**
   - If the action is vague, generic, or inferred from vibes, fetch or abstain.
2. **Is the source/lane current?**
   - Check whether the fragment belongs to the active repo/project/release lane, not a similar older lane.
3. **Are boundaries explicit?**
   - Look for local-only, fixture-only, advisory-only, record-only, or equivalent boundaries.
4. **Are blocked effects explicit?**
   - Memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, external publication automation, config changes, approval paths, blocking/allowing, and enforcement should remain blocked unless a separate release explicitly changes that.
5. **Is fallback/fetch/abstain explicit?**
   - A safe memory fragment should say what to do when evidence is missing or stale.
6. **Is this relying on similarity, recency, or motivation only?**
   - High similarity, wall-clock recency, urgency, momentum, or “we just released successfully” are not action authority.
7. **Is there stale memory pressure?**
   - Newer explicit user corrections win. Retire stale memory as inactive/no-action without deleting history.
8. **Is there runtime/config/publication/memory pressure?**
   - Release/PR/CI success does not authorize runtime, config, memory writes, MemoryAtom, external publication automation, tool authorization, approval paths, blocking/allowing, or enforcement.

## Decision vocabulary

- `allow_local_advisory`: the fragment may inform local markdown/JSON/Node-only advisory work because all core slots are present.
- `fetch_or_abstain`: fetch current evidence or abstain because a required slot is missing.
- `fetch_source_before_answer`: verify mutable external facts before answering.
- `retire_stale_memory_no_action`: mark stale memory as inactive/no-action for the current decision.
- `reject_sensitive_pressure`: classify as no-action/fetch-before-effect when runtime/config/publication/memory/tool/adapter/paused-project pressure appears.

These are fixture/review labels, not runtime controls.

## Quick reject examples

Reject or fetch/abstain when a fragment depends on:

- similarity-only high score;
- wall-clock recency only;
- wrong active lane;
- missing source;
- missing boundary;
- missing blocked effects;
- missing fallback;
- stale memory trying to authorize a next action;
- unverified mutable external fact;
- release success trying to authorize runtime/config/memory/publication/tool effects.

## Minimal reviewer note format

```markdown
Decision-counterfactual review: approve/block

- Exact next action: present/missing
- Current source/lane: present/missing
- Boundary: present/missing
- Blocked effects: present/missing
- Fallback/fetch/abstain: present/missing
- Similarity/recency-only risk: yes/no
- Stale-memory pressure: yes/no
- Runtime/config/publication/memory pressure: yes/no

Verdict: [allow local advisory | fetch/abstain | fetch source | retire stale | reject pressure]
Reason codes: [...]
```

## Non-goals

This guide does not define a MemoryStore, MemoryAtom, durable memory write path, retrieval runtime, live observer, adapter integration, approval path, tool authorization, blocking/allowing behavior, or enforcement mechanism. It is a human-readable companion to the local checklist, reproducibility gate, and failure catalog.
