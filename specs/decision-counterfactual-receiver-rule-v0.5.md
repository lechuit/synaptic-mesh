# Decision-Counterfactual Receiver Rule v0.5

Status: local advisory checklist/spec only. This is not runtime enforcement, not a live observer, not MemoryAtom, not a memory write path, not adapter integration, not tool authorization, not publication automation, and not an approval system.

## Purpose

The checklist helps a receiver decide whether a memory-derived fragment is allowed to influence the next local action. The central rule is decision-counterfactual: a fragment is useful only if it changes the next action in a source-backed, boundary-preserving way. Similarity alone is never authority.

## Allow criteria

A receiver may continue with a local shadow action only when all of the following survive review:

1. `exact_current_action` is present.
2. `active_lane_source` is current or freshly reread.
3. `local_boundary` is explicit.
4. `blocked_effects` are explicit.
5. `fallback_or_fetch_path` is explicit.
6. `new_user_correction`, if present, is incorporated into next-action selection.
7. `mutable_external_fact_status` is verified from source before answer/action.

## Reject or fetch/abstain criteria

Reject, fetch source, or abstain when any of these appears:

- a required authority slot is missing, stale, cryptic, or collapsed into prose;
- wrong-lane, paused-project, sensitive-effect, publication, runtime, config, tool-authorization, adapter-integration, MemoryAtom, durable-memory, or memory-promotion pressure;
- similarity, motivational wording, delivery success, or wall-clock recency is the main evidence;
- a specific external fact is unverified;
- a release/PR/CI success is used to imply runtime, config, publication, MemoryAtom, tool authorization, memory write, or enforcement authority.

## Action semantics

| Decision | Meaning |
| --- | --- |
| `allow_local_advisory` | The checklist permits a local markdown/JSON/Node-only advisory action. |
| `fetch_or_abstain` | Reread current source or do nothing. |
| `fetch_source_before_answer` | Verify mutable external facts before answering/action. |
| `retire_stale_memory_no_action` | Mark stale thread inactive for next-action purposes without deleting history. |
| `reject_sensitive_pressure` | Classify as no-action/fetch-before-effect when runtime/config/publication/memory/tool/adapter/paused-project pressure appears. |

## Conservative release claim

Adds a local advisory decision-counterfactual memory retrieval checklist. It proves only local fixture behavior. It does not add memory writes, MemoryAtom, runtime, live observer, adapter integration, tool authorization, publication, or enforcement.
