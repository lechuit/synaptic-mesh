# Recommendation Boundary v0.22.4

The scorecard recommendation can be `advance`, `hold`, or `degrade`, but it is a human-readable review signal only. It is not authority, not a policy decision, not an approval, not a block, not an allow, and not an enforcement instruction.

Required boundary fields remain false/null: `policyDecision: null`; authorization, enforcement, approval/block/allow behavior, tool execution, network/resource fetch, memory/config writes, agent-consumed output, raw persistence, and external effects are false.
