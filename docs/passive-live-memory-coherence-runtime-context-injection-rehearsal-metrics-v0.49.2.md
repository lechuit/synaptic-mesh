# Passive Live Memory Coherence Runtime Context Injection Rehearsal Metrics v0.49.2

Pinned v0.49 metrics:

- sourceRuntimeContextCardCount: 5
- contextCardsConsumedByLocalRehearsalCount: 5
- injectionEnvelopeCount: 1
- injectionEnvelopeContextBlockCount: 4
- receiverFacingContextBlockCount: 4
- allEffectsBlockedUntilNextBarrierCount: 10
- sourceBoundContextCardRatio: 1
- sourceBoundReceiverBlockRatio: 1
- forbiddenEffectCount: 0
- boundaryViolationCount: 0

This is a real barrier over v0.48 because the prior runtime context cards are consumed by a local adapter-style harness and converted into receiver-facing context blocks, while all effects remain blocked.
