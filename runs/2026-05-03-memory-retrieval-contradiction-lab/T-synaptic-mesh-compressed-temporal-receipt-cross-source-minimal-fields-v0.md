# T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0

Timestamp: 2026-05-06T16:02Z  
Status: local shadow microtest only. No runtime/tooling integration, no config change, no permanent memory write, no external message/publication, no deletion, no paused-project work, no canary/enforcement.

## Question

After adding cross-source source path/digest binding to compressed temporal receipts, can the tuple be made smaller without losing safety?

Claim: the cross-source receipt may now be too verbose for handoff use.  
Counterclaim: dropping fields may silently lose source authority, temporal precedence, local boundary, forbidden effects, or independent action classification.

## Method

A local Node fixture compares receipt profiles against 10 cases:

- known/current/local L0/L1 action;
- wrong source path lane;
- wrong digest lane;
- stale source;
- sensitive external action;
- unknown action;
- later restrictive event;
- unknown temporal order;
- L2+/operational boundary expansion;
- missing forbidden-effect category.

Profiles tested:

- full tuple;
- no receipt id;
- no producedAt;
- no source path;
- no source digest;
- no freshness;
- no local boundary;
- no forbidden-effect list;
- no latest restrictive event / temporal-order token;
- no independent action field;
- short labels preserving the same semantics.

## Result

Command:

```bash
node T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0.mjs > T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0.out.json
```

Summary from `T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0.out.json`:

```json
{
  "verdict": "pass",
  "scenarioCount": 10,
  "baselineBytes": 438,
  "safeProfiles": [
    { "profile": "full", "bytes": 438, "savedPct": 0 },
    { "profile": "noReceiptId", "bytes": 423, "savedPct": 3.4 },
    { "profile": "shortLabels", "bytes": 402, "savedPct": 8.2 }
  ],
  "regressions": [
    { "profile": "noProducedAt", "unsafeAllows": 0, "falseRejectLocal": 1, "passCases": 7, "savedPct": 5.9 },
    { "profile": "noPath", "unsafeAllows": 7, "falseRejectLocal": 0, "passCases": 3, "savedPct": 30.6 },
    { "profile": "noDigest", "unsafeAllows": 7, "falseRejectLocal": 0, "passCases": 3, "savedPct": 12.3 },
    { "profile": "noFreshness", "unsafeAllows": 6, "falseRejectLocal": 0, "passCases": 4, "savedPct": 2.5 },
    { "profile": "noBoundary", "unsafeAllows": 6, "falseRejectLocal": 0, "passCases": 4, "savedPct": 8.2 },
    { "profile": "noForbiddenEffects", "unsafeAllows": 6, "falseRejectLocal": 0, "passCases": 4, "savedPct": 15.3 },
    { "profile": "noTemporalEvent", "unsafeAllows": 7, "falseRejectLocal": 0, "passCases": 3, "savedPct": 4.1 },
    { "profile": "noActionSeparation", "unsafeAllows": 7, "falseRejectLocal": 0, "passCases": 3, "savedPct": 9.1 }
  ]
}
```

## Finding

The safe minimum is semantic, not merely shorter.

Required for cross-source compressed temporal handoff:

```text
SRC=<source lane id>
PATH=<exact source artifact path>
DIG=<source/registry digest lane>
PROD=<producedAt / ordering timestamp>
FR=current
SC=local_shadow_L0_L1
PB=L0_L1_only
NO=<external,config,memory,delete,publish,paused,L2+,runtime,canary all explicit>
LRE=none
TOK=true
ACT=<requested receiver action>
RB=fetch_abstain_or_ask_human
```

Optional / low-value:

```text
ID=<receipt id>
```

Safe compression in this fixture came from short labels (`8.2%` bytes saved) or dropping only the receipt id (`3.4%`). The larger-looking savings were unsafe because they removed authority-bearing information.

## Interpretation

- Dropping `PATH` or `DIG` reopens cross-source/source-laundering routes.
- Dropping `FR`, `LRE`, or `TOK` reopens stale or later-restrictive-event routes.
- Dropping `SC`/`PB` reopens L2+/operational boundary expansion.
- Dropping `NO` loses explicit forbidden effects even when the current action looks local.
- Dropping `ACT` prevents independent sensitive/unknown action classification.
- Dropping `PROD` is not an unsafe allow in this fixture, but it causes strict receiver false-rejects and weakens auditability/temporal ordering; keep it unless a separate source-index freshness proof replaces it.

## Boundary

This artifact is local research documentation/checklist only. It does not authorize runtime enforcement, canary use, config changes, permanent memory writes, external messaging/publication, deletion, paused-project work, or L2+ operational use.

## Next safe question

Document a `SynapticMeshCompressedTemporalReceipt-v0.2` compact profile that permits short labels only as aliases for the full semantic tuple, with an explicit receiver rule: abbreviation is acceptable; semantic omission is not.
