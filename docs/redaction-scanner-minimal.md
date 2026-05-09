# Minimal executable redaction scanner gate v0

`implementation/synaptic-mesh-shadow-v0/src/redaction-scanner.mjs` is the first executable redaction gate for v0.1.17.

It scans committed, synthetic or already-redacted local fixtures only. It is reject-only and record-only: it reports whether a candidate fixture appears to persist sensitive material. It does not observe live traffic, read runtime logs, run as a daemon/watcher, integrate adapters, execute tools, write memory/config, publish externally, enter an approval path, block/allow runtime actions, authorize, or enforce.

The positive gate output is intentionally small:

```json
{
  "redactionGate": "pass",
  "rawPersisted": false,
  "secretLikePersisted": false,
  "privatePathPersisted": false,
  "toolOutputPersisted": false,
  "memoryTextPersisted": false,
  "configTextPersisted": false,
  "approvalTextPersisted": false
}
```

The minimal scanner rejects fixtures that persist any of these classes:

- raw content;
- secret-like value;
- private path;
- tool output;
- memory text;
- config text;
- approval text;
- long raw prompt;
- unknown sensitive field.

This gate turns the v0.1.16 redaction-review records into an executable local fixture check, while keeping the project pre-runtime and pre-enforcement.
