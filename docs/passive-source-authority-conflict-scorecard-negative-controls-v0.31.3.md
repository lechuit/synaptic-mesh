# Passive Source Authority Conflict Scorecard v0.31.3

Rejects fabricated upstream artifacts, wrong metrics/items/digests, runtime/tool/network/memory/config/raw requests, and authority-token leakage.

Boundary: no enforcement, authorization, approval/block/allow, runtime integration, memory/config writes, network/resource fetch, external effects, durable memory promotion, or agent-consumed policy decisions. `policyDecision: null`.

Additional v0.31.3 hardening: fabricated copies with ideal metadata must degrade unless the receiver artifact path and sha256 digest match the pinned v0.30.5 evidence file, and unknown top-level/item fields must be rejected.
