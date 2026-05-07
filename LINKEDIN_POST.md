# LinkedIn Post Draft — Synaptic Mesh v0.1.0-rc1

## Recommended post

I just published Synaptic Mesh v0.1.0-rc1:

https://github.com/lechuit/synaptic-mesh

I am working on a problem that shows up when agents use memory, summaries, and handoffs:

sometimes the context survives, but the restriction gets lost.

For example, a system may preserve “this source says X” while dropping “this was only evidence, not permission to act.” Stale, local-only, denied, sealed/private, partial-lineage, or human-required context can quietly turn into downstream action authority if the receiving agent only sees a confident summary.

Synaptic Mesh is a research/protocol release candidate for preserving those boundaries across memory transforms:

source result → summary → handoff → next action → action proposal

The core idea is a compact receipt that travels with memory-derived claims and lets the receiver fail closed — fetch again, abstain, or ask a human — when source, freshness, scope, promotion boundary, forbidden effects, or action separation are missing or unclear.

Included in v0.1.0-rc1:

- paper draft;
- protocol specs;
- local shadow/reference implementation;
- 15 curated fixtures;
- quote-check and bibliography artifacts;
- explicit runtime / non-goal boundaries.

The most useful feedback right now:

1. adversarial fixture cases;
2. threat-model gaps;
3. citation / quote-check review;
4. receipt/API shape feedback;
5. runtime-boundary clarity.

Release:
https://github.com/lechuit/synaptic-mesh/releases/tag/v0.1.0-rc1

Important boundary: this is not runtime-ready, not production/canary/enforcement-ready, and not L2+ operational approval. It is a public research/protocol RC for review.

If you work on agent memory, provenance, AI safety, multi-agent orchestration, or agent frameworks, I’d love your critique.

#AI #AIAgents #MultiAgentSystems #Memory #AISafety #Provenance

## Short version

I just published Synaptic Mesh v0.1.0-rc1:
https://github.com/lechuit/synaptic-mesh

Problem: when agents summarize memory-derived evidence, the content can survive while the restriction gets lost — “this says X” remains, but “this was not permission to act” disappears.

Synaptic Mesh is a research/protocol RC for preserving memory authority, status, and boundary receipts across multi-agent compression, handoff, and action-planning steps.

Includes paper draft, specs, local shadow/reference implementation, 15 fixtures, quote-check artifacts, and explicit runtime boundaries.

Feedback welcome on adversarial fixtures, threat-model gaps, citations, receipt/API shape, and runtime-boundary clarity.

#AI #AIAgents #MultiAgentSystems #AISafety
