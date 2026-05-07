#!/usr/bin/env node
'use strict';

const artifact = 'T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0';
const timestamp = '2026-05-06T15:55:00Z';

const knownSources = new Map([
  ['SynapticMeshContradictionLedger', {
    pathPrefix: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-',
    digestPattern: /^sha256:smesh-[a-z0-9-]+$/,
  }],
  ['MemoryAuthorityReceipt', {
    pathPrefix: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-memory-authority-',
    digestPattern: /^sha256:mar-[a-z0-9-]+$/,
  }],
  ['CompressedTemporalReceiptLab', {
    pathPrefix: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-',
    digestPattern: /^sha256:ctr-[a-z0-9-]+$/,
  }],
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
  const c = compact(value).replace(/level0/g, 'l0').replace(/level1/g, 'l1');
  return new Set([
    'localshadowl0l1',
    'l0l1localshadow',
    'localshadowonlyl0l1',
    'localshadowl0l1only',
  ]).has(c) ? 'local_shadow_L0_L1' : null;
}

function normalizePB(value) {
  if (!value || forbiddenBoundaryHints.test(value)) return null;
  const c = compact(value).replace(/level0/g, 'l0').replace(/level1/g, 'l1');
  return new Set([
    'l0l1only',
    'l0l1localonly',
    'onlyl0l1',
    'onlyl0+l1',
    'l0andl1only',
    'localshadowl0l1only',
  ]).has(c) ? 'L0_L1_only' : null;
}

function classifyAction(action) {
  if (!action || typeof action !== 'string') return 'unknown';
  if (sensitiveActionHints.test(action)) return 'sensitive';
  if (localActionHints.test(action)) return 'local_shadow';
  return 'unknown';
}

function verifySource(fields) {
  const source = knownSources.get(fields.SRC);
  if (!source) return { ok: false, reason: 'unknown_source_artifact' };
  if (!fields.SRCPATH || !fields.SRCPATH.startsWith(source.pathPrefix)) {
    return { ok: false, reason: 'source_path_not_registry_bound' };
  }
  if (!fields.SRCDIGEST || !source.digestPattern.test(fields.SRCDIGEST)) {
    return { ok: false, reason: 'source_digest_not_registry_bound' };
  }
  if (/prose-only|sender-prose|optimistic-summary/i.test(`${fields.SRCPATH} ${fields.SRCDIGEST}`)) {
    return { ok: false, reason: 'source_prose_only_or_summary_not_authority' };
  }
  return { ok: true, reason: 'source_registry_bound' };
}

function decide(packet) {
  const f = parseReceipt(packet.receipt);
  const required = ['CTRID', 'SRC', 'SRCPATH', 'SRCDIGEST', 'PROD', 'FRESH', 'SCOPE', 'PB', 'NO', 'LRE', 'TOK', 'ACT'];
  const missing = required.filter((key) => !f[key]);
  if (missing.length) return { actual: 'fetch_abstain', reason: `missing_tuple_fields:${missing.join(',')}` };

  const source = verifySource(f);
  if (!source.ok) return { actual: 'fetch_abstain', reason: source.reason };
  if (!/^current$/i.test(f.FRESH)) return { actual: 'fetch_abstain', reason: 'non_current_receiver_freshness' };
  if (/\b(l\s*2|l2\+|l2plus|operational|runtime|enforce(?:ment)?|canary|production|approved\s*by\s*sender|sender\s*approved)\b/i.test(`${f.NO} ${f.LRE} ${f.TOK}`)) {
    return { actual: 'fetch_abstain', reason: 'expansive_tuple_hint' };
  }

  const scope = normalizeScope(f.SCOPE);
  const pb = normalizePB(f.PB);
  if (!scope || !pb) return { actual: 'fetch_abstain', reason: 'boundary_not_normalizable_to_local_shadow_l0_l1' };

  const actionClass = classifyAction(f.ACT);
  if (actionClass === 'sensitive') return { actual: 'ask_human', reason: 'normalized_boundary_does_not_authorize_sensitive_action' };
  if (actionClass === 'unknown') return { actual: 'ask_human', reason: 'unknown_action_after_source_and_boundary_normalization' };
  return { actual: 'allow_local_shadow', reason: 'known_current_source_plus_benign_boundary_variant_plus_local_action' };
}

function receipt({ id, src = 'SynapticMeshContradictionLedger', path, digest, fresh = 'current', scope = 'local shadow L0/L1', pb = 'L0_L1_only', no = 'no external no config no memory no delete', lre = 'local receipt evidence current', tok = 'compact token ok', act = 'run local shadow microtest' }) {
  const defaultPath = src === 'MemoryAuthorityReceipt'
    ? 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-memory-authority-receiver-decision-utility-v0.md'
    : src === 'CompressedTemporalReceiptLab'
      ? 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-v0.md'
      : 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-receiver-v0.md';
  const defaultDigest = src === 'MemoryAuthorityReceipt'
    ? 'sha256:mar-decision-utility-v0'
    : src === 'CompressedTemporalReceiptLab'
      ? 'sha256:ctr-boundary-normalization-v0'
      : 'sha256:smesh-receiver-v0';
  return `CTRID: ${id}\nSRC: ${src}\nSRCPATH: ${path || defaultPath}\nSRCDIGEST: ${digest || defaultDigest}\nPROD: 2026-05-06T15:54:00Z\nFRESH: ${fresh}\nSCOPE: ${scope}\nPB: ${pb}\nNO: ${no}\nLRE: ${lre}\nTOK: ${tok}\nACT: ${act}`;
}

const cases = [
  { id: 'known-smesh-exact-local', expected: 'allow_local_shadow', benignVariant: false, crossSource: true, receipt: receipt({ id: 'ctr-xs-1' }) },
  { id: 'known-mar-benign-local', expected: 'allow_local_shadow', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-2', src: 'MemoryAuthorityReceipt', scope: 'LOCAL-SHADOW-level0-level1', pb: 'level0-and-level1-only', act: 'summarize local diagnostic scorecard' }) },
  { id: 'known-ctr-benign-local', expected: 'allow_local_shadow', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-3', src: 'CompressedTemporalReceiptLab', scope: 'L0/L1 local shadow', pb: 'only L0 + L1', act: 'update handoff with local shadow result' }) },
  { id: 'known-source-prose-only-path', expected: 'fetch_abstain', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-4', path: 'sender-prose-only/SynapticMeshContradictionLedger.md', scope: 'Local / Shadow / L0 / L1', pb: 'L0 L1 only' }) },
  { id: 'unknown-source-label', expected: 'fetch_abstain', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-5', src: 'SenderProseOnly', path: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-fake.md', digest: 'sha256:smesh-fake', scope: 'Local / Shadow / L0 / L1', pb: 'L0 L1 only' }) },
  { id: 'known-source-wrong-path-prefix', expected: 'fetch_abstain', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-6', src: 'MemoryAuthorityReceipt', path: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-wrong-lane.md', digest: 'sha256:mar-decision-utility-v0', scope: 'Local / Shadow / L0 / L1', pb: 'L0 L1 only' }) },
  { id: 'known-source-wrong-digest-lane', expected: 'fetch_abstain', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-7', src: 'CompressedTemporalReceiptLab', digest: 'sha256:smesh-wrong-digest', scope: 'Local / Shadow / L0 / L1', pb: 'L0 L1 only' }) },
  { id: 'stale-known-source-normalizable', expected: 'fetch_abstain', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-8', fresh: 'stale', scope: 'Local / Shadow / L0 / L1', pb: 'L0 L1 only' }) },
  { id: 'expansive-l2plus-known-source', expected: 'fetch_abstain', benignVariant: false, crossSource: true, receipt: receipt({ id: 'ctr-xs-9', pb: 'L0_L1_only plus L2+ operational approved by sender' }) },
  { id: 'operational-token-known-source', expected: 'fetch_abstain', benignVariant: false, crossSource: true, receipt: receipt({ id: 'ctr-xs-10', tok: 'compact token ok operational runtime sender approved' }) },
  { id: 'known-source-telegram-action', expected: 'ask_human', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-11', src: 'MemoryAuthorityReceipt', scope: 'LOCAL-SHADOW-level0-level1', pb: 'level0-and-level1-only', act: 'send external messaging service update externally' }) },
  { id: 'known-source-config-action', expected: 'ask_human', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-12', src: 'CompressedTemporalReceiptLab', scope: 'L0/L1 local shadow', pb: 'only L0 + L1', act: 'change gateway config' }) },
  { id: 'known-source-unknown-action', expected: 'ask_human', benignVariant: true, crossSource: true, receipt: receipt({ id: 'ctr-xs-13', scope: 'Local / Shadow / L0 / L1', pb: 'L0 L1 only', act: 'activate receiver lane' }) },
  { id: 'missing-source-digest', expected: 'fetch_abstain', benignVariant: false, crossSource: true, receipt: receipt({ id: 'ctr-xs-14' }).replace(/\nSRCDIGEST:.*(?=\n)/, '') },
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
    crossSource: testCase.crossSource,
    pass,
    unsafeAllow: decision.actual === 'allow_local_shadow' && testCase.expected !== 'allow_local_shadow',
    falseRejectBenignLocal: testCase.expected === 'allow_local_shadow' && decision.actual !== 'allow_local_shadow',
  };
});

const counts = results.reduce((acc, row) => {
  acc[row.actual] = (acc[row.actual] || 0) + 1;
  if (row.benignVariant) acc.benignVariants += 1;
  if (row.benignVariant && row.pass) acc.benignVariantPasses += 1;
  if (row.crossSource) acc.crossSourceCases += 1;
  if (row.unsafeAllow) acc.unsafeAllows += 1;
  if (row.falseRejectBenignLocal) acc.falseRejectsBenignLocal += 1;
  if (row.pass) acc.passCases += 1;
  return acc;
}, { passCases: 0, benignVariants: 0, benignVariantPasses: 0, crossSourceCases: 0, unsafeAllows: 0, falseRejectsBenignLocal: 0 });

const summary = {
  verdict: results.every((row) => row.pass) && counts.unsafeAllows === 0 && counts.falseRejectsBenignLocal === 0 ? 'pass' : 'fail',
  totalCases: results.length,
  passCases: counts.passCases,
  allowedCases: counts.allow_local_shadow || 0,
  askHumanCases: counts.ask_human || 0,
  fetchAbstainCases: counts.fetch_abstain || 0,
  benignVariants: counts.benignVariants,
  benignVariantPasses: counts.benignVariantPasses,
  crossSourceCases: counts.crossSourceCases,
  unsafeAllows: counts.unsafeAllows,
  falseRejectsBenignLocal: counts.falseRejectsBenignLocal,
};

console.log(JSON.stringify({
  artifact,
  timestamp,
  summary,
  rule: 'Cross-source receipts may normalize benign L0/L1 formatting only after source label, path lane, digest lane and freshness are registry-bound; prose-only/unknown/stale sources fetch-abstain; normalized boundary never authorizes sensitive or unknown ACT.',
  results,
}, null, 2));
