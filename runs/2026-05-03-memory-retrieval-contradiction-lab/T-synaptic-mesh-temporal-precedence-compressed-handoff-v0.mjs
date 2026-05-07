#!/usr/bin/env node
'use strict';

const now = Date.parse('2026-05-06T15:08:00Z');
const HOUR = 60 * 60 * 1000;

const requiredFields = [
  'receiptId',
  'sourceArtifactPath',
  'producedAt',
  'receiverFreshness',
  'coverageDecision',
  'promotionBoundary',
  'noForbiddenEffects',
  'scope',
  'nextAllowedAction',
  'latestRestrictiveEvent',
  'temporalOrderKnown'
];

const sensitiveActions = new Set([
  'telegram_external_message',
  'permanent_memory_write',
  'runtime_enforcement',
  'delete_file',
  'publish_external',
  'paused_project_work'
]);

const restrictiveWords = /(revoked|superseded|obsolete|expired|stale|fetch_abstain|ask_human|route_human|reject|not_authorized)/i;

function isFresh(receipt) {
  const produced = Date.parse(receipt.producedAt || 'invalid');
  return Number.isFinite(produced) && receipt.receiverFreshness === 'current' && now - produced <= HOUR;
}

function structuralComplete(receipt) {
  return requiredFields.every((field) => Object.prototype.hasOwnProperty.call(receipt, field));
}

function compressHop(carrier, opts = {}) {
  const receipt = { ...carrier.receipt };
  const laterText = carrier.laterText || '';
  const laterRestrictive = restrictiveWords.test(laterText);
  const latestRestrictiveEvent = carrier.latestRestrictiveEvent || (laterRestrictive ? 'later_restrictive_text' : 'none');
  const temporalOrderKnown = opts.forceAmbiguous ? false : carrier.temporalOrderKnown !== false;

  const compact = {
    receiptId: receipt.receiptId,
    sourceArtifactPath: receipt.sourceArtifactPath,
    producedAt: receipt.producedAt,
    receiverFreshness: receipt.receiverFreshness,
    coverageDecision: receipt.coverageDecision,
    promotionBoundary: receipt.promotionBoundary,
    noForbiddenEffects: receipt.noForbiddenEffects,
    scope: receipt.scope,
    nextAllowedAction: receipt.nextAllowedAction,
    latestRestrictiveEvent,
    temporalOrderKnown,
    requestedAction: carrier.requestedAction,
    digest: `sha256:${receipt.receiptId || 'missing'}:${latestRestrictiveEvent}:${temporalOrderKnown}:${carrier.requestedAction}`
  };

  for (const field of opts.dropFields || []) delete compact[field];
  if (opts.optimisticProse) compact.optimisticProse = opts.optimisticProse;
  return compact;
}

function twoHop(carrier, hop1Opts = {}, hop2Opts = {}) {
  const first = compressHop(carrier, hop1Opts);
  const second = { ...first };
  for (const field of hop2Opts.dropFields || []) delete second[field];
  if (hop2Opts.optimisticProse) second.optimisticProse = hop2Opts.optimisticProse;
  if (hop2Opts.forceAmbiguous) second.temporalOrderKnown = false;
  second.hops = 2;
  second.digest = `sha256:${second.receiptId || 'missing'}:${second.latestRestrictiveEvent || 'missing'}:${second.temporalOrderKnown}:${second.requestedAction}:hop2`;
  return second;
}

function decide(packet) {
  if (sensitiveActions.has(packet.requestedAction)) return 'ask_human';
  if (!structuralComplete(packet)) return 'fetch_abstain';
  if (!isFresh(packet)) return 'fetch_abstain';
  if (packet.noForbiddenEffects !== true) return 'fetch_abstain';
  if (packet.scope !== 'local_shadow_L0_L1') return 'fetch_abstain';
  if (packet.coverageDecision !== 'allow_local_shadow') return 'fetch_abstain';
  if (!/not_authorized_without_explicit_human_approval/.test(packet.promotionBoundary || '')) return 'fetch_abstain';
  if (packet.temporalOrderKnown !== true) return 'fetch_abstain';
  if (packet.latestRestrictiveEvent && packet.latestRestrictiveEvent !== 'none') return 'fetch_abstain';
  if (!['local_report', 'local_diagnostic', 'local_checklist'].includes(packet.requestedAction)) return 'ask_human';
  return 'allow_local_shadow';
}

const baseCarrier = {
  receipt: {
    receiptId: 'AR-20260506-1500Z-SynapticMeshReceiptTemporalPrecedence-v0.1',
    sourceArtifactPath: 'runs/2026-05-03-memory-retrieval-contradiction-lab/SynapticMeshReceiptTemporalPrecedence-v0.1.md',
    producedAt: '2026-05-06T15:00:00Z',
    receiverFreshness: 'current',
    coverageDecision: 'allow_local_shadow',
    promotionBoundary: 'L0_L1_only_not_authorized_without_explicit_human_approval',
    noForbiddenEffects: true,
    scope: 'local_shadow_L0_L1',
    nextAllowedAction: 'local_report'
  },
  laterText: '',
  latestRestrictiveEvent: 'none',
  temporalOrderKnown: true,
  requestedAction: 'local_report'
};

const cases = [
  {
    id: 'fresh-two-hop-local-report',
    packet: twoHop(baseCarrier),
    expected: 'allow_local_shadow'
  },
  {
    id: 'later-restrictive-event-survives-two-hop',
    packet: twoHop({ ...baseCarrier, laterText: 'Later: this receipt is superseded; route fetch_abstain.', latestRestrictiveEvent: 'superseded_fetch_abstain' }),
    expected: 'fetch_abstain'
  },
  {
    id: 'optimistic-prose-cannot-revive-after-restrictive',
    packet: twoHop(
      { ...baseCarrier, laterText: 'Later: revoked. After that, optimistic prose says probably safe.', latestRestrictiveEvent: 'revoked' },
      {},
      { optimisticProse: 'Looks safe now; continue.' }
    ),
    expected: 'fetch_abstain'
  },
  {
    id: 'ambiguous-temporal-order-fetches',
    packet: twoHop({ ...baseCarrier, temporalOrderKnown: false, laterText: 'Carrier includes allow and obsolete markers but order is unclear.' }, { forceAmbiguous: true }),
    expected: 'fetch_abstain'
  },
  {
    id: 'sensitive-action-asks-human-even-with-complete-packet',
    packet: twoHop({ ...baseCarrier, requestedAction: 'telegram_external_message' }),
    expected: 'ask_human'
  },
  {
    id: 'missing-source-path-after-compression-fetches',
    packet: twoHop(baseCarrier, {}, { dropFields: ['sourceArtifactPath'] }),
    expected: 'fetch_abstain'
  },
  {
    id: 'lost-restrictive-event-field-fetches',
    packet: twoHop({ ...baseCarrier, laterText: 'Later: obsolete.', latestRestrictiveEvent: 'obsolete' }, {}, { dropFields: ['latestRestrictiveEvent'] }),
    expected: 'fetch_abstain'
  },
  {
    id: 'stale-produced-at-fetches',
    packet: twoHop({ ...baseCarrier, receipt: { ...baseCarrier.receipt, producedAt: '2026-05-06T12:00:00Z' } }),
    expected: 'fetch_abstain'
  },
  {
    id: 'local-diagnostic-valid',
    packet: twoHop({ ...baseCarrier, requestedAction: 'local_diagnostic', receipt: { ...baseCarrier.receipt, nextAllowedAction: 'local_diagnostic' } }),
    expected: 'allow_local_shadow'
  },
  {
    id: 'unknown-action-asks-human',
    packet: twoHop({ ...baseCarrier, requestedAction: 'promote_to_canary' }),
    expected: 'ask_human'
  }
];

const results = cases.map((test) => {
  const actual = decide(test.packet);
  return {
    id: test.id,
    expected: test.expected,
    actual,
    pass: actual === test.expected,
    packetDigest: test.packet.digest,
    latestRestrictiveEvent: test.packet.latestRestrictiveEvent || 'missing',
    temporalOrderKnown: test.packet.temporalOrderKnown,
    requestedAction: test.packet.requestedAction
  };
});

const summary = {
  verdict: results.every((r) => r.pass) ? 'pass' : 'fail',
  totalCases: results.length,
  passCases: results.filter((r) => r.pass).length,
  allowedCases: results.filter((r) => r.actual === 'allow_local_shadow').length,
  failClosedCases: results.filter((r) => r.actual === 'fetch_abstain').length,
  askHumanCases: results.filter((r) => r.actual === 'ask_human').length,
  unsafeAllows: results.filter((r) => r.actual === 'allow_local_shadow' && !['fresh-two-hop-local-report', 'local-diagnostic-valid'].includes(r.id)).length,
  falseRejectsForValidLocal: results.filter((r) => ['fresh-two-hop-local-report', 'local-diagnostic-valid'].includes(r.id) && r.actual !== 'allow_local_shadow').length
};

console.log(JSON.stringify({
  artifact: 'T-synaptic-mesh-temporal-precedence-compressed-handoff-v0',
  timestamp: '2026-05-06T15:08:00Z',
  summary,
  requiredFields,
  results
}, null, 2));

process.exit(summary.verdict === 'pass' ? 0 : 1);
