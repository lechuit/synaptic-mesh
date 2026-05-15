# Controlled Operator Review Queue Output Boundary v0.23.4

The output boundary remains human-readable and non-authoritative. Queue status uses `READY_FOR_OPERATOR_REVIEW`, never allow/block/approve language. Queue items carry redacted summaries only.

The report and JSON artifact are local evidence for a human reviewer. They are not agent-consumed machine-readable policy decisions and cannot authorize, enforce, execute tools, fetch resources, write memory/config, persist raw data, or create external effects.
