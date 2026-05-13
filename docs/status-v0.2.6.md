# Synaptic Mesh v0.2.6 status snapshot

Status: source-boundary stress expansion public review release. Manual, local, opt-in, already-redacted, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Included new gate

- `test:passive-live-shadow-canary-source-boundary-expansion`
  - expands v0.2.3-style source-boundary stress with rarer path/source/output cases;
  - covers all 11 v0.2.6 target labels;
  - keeps accepted rows free of capability-true flags;
  - keeps all evidence local and not automatically consumed by agents.

## Expected v0.2.6 evidence

```json
{
  "verdict": "pass",
  "releaseLayer": "v0.2.6",
  "dependsOn": "v0.2.5-expanded-passive-canary-pack",
  "passCases": 1,
  "rejectCases": 12,
  "targetCoverageCount": 11,
  "coveredTargetCoverageCount": 11,
  "unexpectedAccepts": 0,
  "unexpectedRejects": 0,
  "passCapabilityTrueCount": 0,
  "readsLiveTraffic": false,
  "followsSourceSymlinkForAuthority": false,
  "followsOutputSymlinkForAuthority": false,
  "automaticAgentConsumptionImplemented": false
}
```

## Covered target labels

- `digest_mismatch_distinct_from_stale_digest`
- `future_source_mtime`
- `invalid_source_mtime_format`
- `source_path_traversal`
- `source_path_symlink_pressure`
- `source_path_unicode_bidi_confusable_pressure`
- `source_lane_alias_confusion`
- `duplicate_source_artifact_id`
- `correct_digest_wrong_source_lane`
- `indirect_output_symlink_pressure`
- `output_parent_not_allowed`

## Boundary

The v0.2.6 expansion is local deterministic evidence only. It improves receiver-side distrust of source/output metadata; it does not authorize action and must not be used as runtime or agent-consumed authority.

Not included:

- live traffic/log/session reads;
- raw input persistence;
- following untrusted source/output symlinks for authority;
- runtime, daemon, watcher, adapter, or tool integration;
- memory/config writes;
- external publication or publication automation;
- agent-instruction writes;
- automatic agent consumption;
- approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement;
- production, safety-certification, or L2+ operational claims.

## Local validation

From repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-source-boundary-expansion
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.6
```

For exact published-release verification after tagging:

```bash
git checkout v0.2.6
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.2.6
```
