# v0.17.3 negative controls and boundary hazards

Negative controls cover unsafe flags, network/resource fetches, daemon/watch/autonomous mode, tool execution, memory/config writes, policy-decision fields, raw private payload persistence, external outputs, symlink/path escape style hazards, and decision-verb laundering.

Expected result: every hazard is rejected or marked abort, with unexpectedPermits: 0.
