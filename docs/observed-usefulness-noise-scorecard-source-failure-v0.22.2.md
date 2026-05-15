# Source Failure Threshold Case v0.22.2

A packet with one isolated source failure is rejected by default by the v0.21 positive utility pass gate. The same packet may pass only when `maxIsolatedSourceFailures: 1` is explicitly set for that local run.

This is measurement only. It does not authorize reads, recover files, retry sources, fetch network resources, or change runtime policy.
