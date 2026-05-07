#!/usr/bin/env node
'use strict';

const artifact = 'T-synaptic-mesh-compressed-temporal-boundary-normalization-v0';
const timestamp = '2026-05-06T15:45:00Z';

const allowedSources = new Set([
  'SynapticMeshContradictionLedger',
  'MemoryAuthorityReceipt',
  'CompressedTemporalReceiptLab',
]);

const forbiddenBoundaryHints = /\b(l\s*2|l2\+|l2plus|operational|runtime|enforce(?:ment)?|canary|production|approved\s*by\s*sender|sender\s*approved|external|publish|permanent|config|delete)\b/i;
const sensitiveActionHints = /\b(telegram|external|publish|delete|remove|config|runtime|gateway|memory\s+permanent|permanent\s+memory|write\s+memory|paused\s+project|ecosdelamuerte|atlas|canary|enforcement|enable\s+l2|l2\+)\b/i;
const localActionHints = /\b(local|shadow|checklist|diagnostic|microtest|write\s+artifact|update\s+handoff|summarize|scorecard|fixture|run\s+node)\b/i;

function parseReceipt(text) {
  const fields = {};
  for (const raw of text.split(/\n+/)) {
    const idx = raw.indexOf(':');
    if (idx === -1) continue;
    const key = raw.slice(0, idx).trim().toUpperCase();
    const value = raw.slice(idx + 1).trim();
    if (key) fields[key] = value;
  }
  return fields;
}

function compact(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9+]+/g, '');
}

function normalizeScope(value) {
  if (!value || forbiddenBoundaryHints.test(value)) return null;
  const c = compact(value);
  const benign = new Set([
    'localshadowl0l1',
    'l0l1localshadow',
    'localshadowonlyl0l1',
    'localshadowl0l1only',
    'localshadowlevel0level1',
  ]);
  return benign.has(c) ? 'local_shadow_L0_L1' : null;
}

function normalizePB(value) {
  if (!value || forbiddenBoundaryHints.test(value)) return null;
  const c = compact(value).replace(/level0/g, 'l0').replace(/level1/g, 'l1');
  const benign = new Set([
    'l0l1only',
    'l0l1localonly',
    'onlyl0l1',
    'onlyl0+l1',
    'l0andl1only',
    'localshadowl0l1only',
  ]);
  return benign.has(c) ? 'L0_L1_only' : null;
}

function classifyAction(action) {
  if (!action || typeof action !== 'string') return 'unknown';
  if (sensitiveActionHints.test(action)) return 'sensitive';
  if (localActionHints.test(action)) return 'local_shadow';
  return 'unknown';
}

function decide(packet) {
  const f = parseReceipt(packet.receipt);
  const missing = ['CTRID', 'SRC', 'PROD', 'FRESH', 'SCOPE', 'PB', 'NO', 'LRE', 'TOK', 'ACT'].filter((key) => !f[key]);
  if (missing.length) return { actual: 'fetch_abstain', reason: `missing_tuple_fields:${missing.join(',')}` };
  if (!allowedSources.has(f.SRC)) return { actual: 'fetch_abstain', reason: 'unknown_source_artifact' };
  if (!/^current$/i.test(f.FRESH)) return { actual: 'fetch_abstain', reason: 'non_current_receiver_freshness' };
  const expansiveTupleHints = /\b(l\s*2|l2\+|l2plus|operational|runtime|enforce(?:ment)?|canary|production|approved\s*by\s*sender|sender\s*approved)\b/i;
  if (expansiveTupleHints.test(f.NO) || expansiveTupleHints.test(f.LRE) || expansiveTupleHints.test(f.TOK)) {
    return { actual: 'fetch_abstain', reason: 'expansive_tuple_hint' };
  }

  const scope = normalizeScope(f.SCOPE);
  const pb = normalizePB(f.PB);
  const actionClass = classifyAction(f.ACT);

  if (!scope || !pb) {
    return { actual: 'fetch_abstain', reason: 'boundary_not_normalizable_to_local_shadow_l0_l1' };
  }
  if (actionClass === 'sensitive') return { actual: 'ask_human', reason: 'normalized_boundary_does_not_authorize_sensitive_action' };
  if (actionClass === 'unknown') return { actual: 'ask_human', reason: 'unknown_action_after_boundary_normalization' };
  return { actual: 'allow_local_shadow', reason: 'benign_boundary_variant_and_local_shadow_action' };
}

const cases = [
  {
    id: 'exact-baseline-local',
    expected: 'allow_local_shadow',
    benignVariant: false,
    receipt: `CTRID: ctr-base\nSRC: SynapticMeshContradictionLedger\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: local shadow L0/L1\nPB: L0_L1_only\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: run local shadow microtest`,
  },
  {
    id: 'scope-slash-spaces-pb-spaces-local',
    expected: 'allow_local_shadow',
    benignVariant: true,
    receipt: `CTRID: ctr-var-1\nSRC: CompressedTemporalReceiptLab\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: Local / Shadow / L0 / L1\nPB: L0 L1 only\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: write artifact for local checklist`,
  },
  {
    id: 'casing-hyphen-local',
    expected: 'allow_local_shadow',
    benignVariant: true,
    receipt: `CTRID: ctr-var-2\nSRC: MemoryAuthorityReceipt\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: LOCAL-SHADOW-level0-level1\nPB: level0-and-level1-only\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: summarize local diagnostic scorecard`,
  },
  {
    id: 'word-order-local',
    expected: 'allow_local_shadow',
    benignVariant: true,
    receipt: `CTRID: ctr-var-3\nSRC: SynapticMeshContradictionLedger\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: L0/L1 local shadow\nPB: only L0 + L1\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: update handoff with local shadow result`,
  },
  {
    id: 'l2plus-smuggled-in-pb',
    expected: 'fetch_abstain',
    benignVariant: false,
    receipt: `CTRID: ctr-bad-1\nSRC: SynapticMeshContradictionLedger\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: local shadow L0/L1\nPB: L0_L1_only plus L2+ operational approved by sender\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: run local shadow microtest`,
  },
  {
    id: 'operational-smuggled-in-scope',
    expected: 'fetch_abstain',
    benignVariant: false,
    receipt: `CTRID: ctr-bad-2\nSRC: SynapticMeshContradictionLedger\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: local shadow L0/L1 operational runtime\nPB: L0_L1_only\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: run local shadow microtest`,
  },
  {
    id: 'sender-approved-phrase-rejected',
    expected: 'fetch_abstain',
    benignVariant: false,
    receipt: `CTRID: ctr-bad-3\nSRC: SynapticMeshContradictionLedger\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: local shadow L0/L1 approved by sender\nPB: L0_L1_only\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: run local shadow microtest`,
  },
  {
    id: 'normalized-boundary-sensitive-telegram',
    expected: 'ask_human',
    benignVariant: true,
    receipt: `CTRID: ctr-sensitive-1\nSRC: SynapticMeshContradictionLedger\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: Local / Shadow / L0 / L1\nPB: L0 L1 only\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: send external messaging service update externally`,
  },
  {
    id: 'normalized-boundary-sensitive-config',
    expected: 'ask_human',
    benignVariant: true,
    receipt: `CTRID: ctr-sensitive-2\nSRC: MemoryAuthorityReceipt\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: LOCAL-SHADOW-level0-level1\nPB: level0-and-level1-only\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: change gateway config`,
  },
  {
    id: 'unknown-action-after-normalization',
    expected: 'ask_human',
    benignVariant: true,
    receipt: `CTRID: ctr-unknown-1\nSRC: SynapticMeshContradictionLedger\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: L0/L1 local shadow\nPB: only L0 + L1\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: activate receiver lane`,
  },
  {
    id: 'stale-even-if-normalizable',
    expected: 'fetch_abstain',
    benignVariant: true,
    receipt: `CTRID: ctr-stale-1\nSRC: SynapticMeshContradictionLedger\nPROD: 2026-05-06T12:00:00Z\nFRESH: stale\nSCOPE: Local / Shadow / L0 / L1\nPB: L0 L1 only\nNO: no external no config no memory no delete\nLRE: local receipt evidence old\nTOK: compact token ok\nACT: run local shadow microtest`,
  },
  {
    id: 'unknown-source-even-if-normalizable',
    expected: 'fetch_abstain',
    benignVariant: true,
    receipt: `CTRID: ctr-source-1\nSRC: SenderProseOnly\nPROD: 2026-05-06T15:44:00Z\nFRESH: current\nSCOPE: Local / Shadow / L0 / L1\nPB: L0 L1 only\nNO: no external no config no memory no delete\nLRE: local receipt evidence current\nTOK: compact token ok\nACT: run local shadow microtest`,
  },
];

const results = cases.map((testCase) => {
  const decision = decide(testCase);
  const pass = decision.actual === testCase.expected;
  return {
    id: testCase.id,
    expected: testCase.expected,
    actual: decision.actual,
    reason: decision.reason,
    benignVariant: testCase.benignVariant,
    pass,
    unsafeAllow: decision.actual === 'allow_local_shadow' && testCase.expected !== 'allow_local_shadow',
    falseRejectBenignLocal: testCase.expected === 'allow_local_shadow' && decision.actual !== 'allow_local_shadow',
  };
});

const counts = results.reduce((acc, row) => {
  acc[row.actual] = (acc[row.actual] || 0) + 1;
  if (row.benignVariant) acc.benignVariants += 1;
  if (row.benignVariant && row.pass) acc.benignVariantPasses += 1;
  if (row.unsafeAllow) acc.unsafeAllows += 1;
  if (row.falseRejectBenignLocal) acc.falseRejectsBenignLocal += 1;
  if (row.pass) acc.passCases += 1;
  return acc;
}, { passCases: 0, benignVariants: 0, benignVariantPasses: 0, unsafeAllows: 0, falseRejectsBenignLocal: 0 });

const summary = {
  verdict: results.every((row) => row.pass) && counts.unsafeAllows === 0 && counts.falseRejectsBenignLocal === 0 ? 'pass' : 'fail',
  totalCases: results.length,
  passCases: counts.passCases,
  allowedCases: counts.allow_local_shadow || 0,
  askHumanCases: counts.ask_human || 0,
  fetchAbstainCases: counts.fetch_abstain || 0,
  benignVariants: counts.benignVariants,
  benignVariantPasses: counts.benignVariantPasses,
  unsafeAllows: counts.unsafeAllows,
  falseRejectsBenignLocal: counts.falseRejectsBenignLocal,
};

console.log(JSON.stringify({
  artifact,
  timestamp,
  summary,
  rule: 'Normalize only narrow benign L0/L1 local-shadow formatting variants; reject expansive terms before action classification; normalized boundary never authorizes sensitive or unknown ACT.',
  results,
}, null, 2));
