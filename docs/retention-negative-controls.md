# Retention negative controls v0

`implementation/synaptic-mesh-shadow-v0/src/retention-gate.mjs` adds a minimal executable retention metadata gate for v0.1.17 negative controls.

Scope:

- committed synthetic/local fixtures only;
- reject/record-only validation of retention metadata;
- no deletion, retention scheduler, live observation, runtime integration, daemon/watcher, adapter integration, tool execution, memory/config writes, external publication, approval path, blocking/allowing, authorization, or enforcement.

Negative controls reject:

- raw live input retained longer than zero days;
- redacted observation retention over 7 days;
- redacted result retention over 7 days;
- aggregate scorecard retention over 90 days;
- unknown retention class;
- raw content persisted;
- missing redaction status for redacted records;
- aggregate scorecard that is not aggregate-only;
- public release evidence that is not synthetic/non-sensitive;
- retention scheduler implemented;
- deletion implementation added;
- runtime integration implemented.

This gate validates retention metadata and refusal classes. It does not delete files and is not a retention scheduler.
