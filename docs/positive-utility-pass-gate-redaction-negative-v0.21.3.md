# Redaction Negative Controls v0.21.3

The positive path requires clean redaction. It rejects semantic decision token persistence, private-pattern detection, and decision-verb detection in the accepted observation set. Rejection still emits no authorization, no enforcement, no tool execution, no external effects, and `policyDecision: null`.
