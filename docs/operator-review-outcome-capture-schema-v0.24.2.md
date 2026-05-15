# Operator Review Outcome Capture Schema v0.24.2

Adds schema-style validation for both inputs: the v0.23 review queue and the operator outcome artifact. Validation enforces bounded item counts, exact queue/outcome ID coverage, known value-feedback labels, boundary flags, and redaction-before-persist behavior.

Malformed queue artifacts, malformed outcome artifacts, invalid bounds, mismatched IDs, and missing outcomes degrade to no capture.
