# Retention policy schema v0

`schemas/retention-policy.schema.json` defines the offline retention metadata policy contract for v0.1.17.

Scope:

- manual/offline/local-shadow metadata only;
- already-redacted or placeholder fixtures only;
- validates retention classes and ceilings;
- rejects unknown retention classes;
- does not implement deletion, retention scheduling, live observation, runtime integration, daemon/watcher behavior, adapter integration, tool execution, memory/config writes, external publication, approval paths, blocking/allowing, authorization, or enforcement.

Policy ceilings:

| Artifact class | Ceiling |
| --- | ---: |
| raw live inputs | `0` days / do not persist |
| redacted observation records | up to `7` days local metadata |
| redacted result records | up to `7` days local metadata |
| aggregate scorecards | up to `90` days, aggregate metadata only |
| public release evidence | indefinite only if synthetic or non-sensitive |

This schema is not a scheduler and does not delete files. It only makes retention metadata executable as a local validation gate.
