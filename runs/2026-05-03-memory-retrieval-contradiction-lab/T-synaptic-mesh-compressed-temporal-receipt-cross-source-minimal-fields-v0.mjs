#!/usr/bin/env node
'use strict';

const artifact = 'T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0';
const timestamp = '2026-05-06T16:02:00Z';

const registry = new Map([
  ['SMESH', { pathPrefix: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-', digest: /^sha256:smesh-[a-z0-9-]+$/ }],
  ['MAR', { pathPrefix: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-memory-authority-', digest: /^sha256:mar-[a-z0-9-]+$/ }],
  ['CTR', { pathPrefix: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-', digest: /^sha256:ctr-[a-z0-9-]+$/ }],
]);

const profileFields = {
  full: ['ID', 'SRC', 'PATH', 'DIG', 'PROD', 'FR', 'SC', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'],
  noReceiptId: ['SRC', 'PATH', 'DIG', 'PROD', 'FR', 'SC', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'],
  noProducedAt: ['ID', 'SRC', 'PATH', 'DIG', 'FR', 'SC', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'],
  noPath: ['ID', 'SRC', 'DIG', 'PROD', 'FR', 'SC', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'],
  noDigest: ['ID', 'SRC', 'PATH', 'PROD', 'FR', 'SC', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'],
  noFreshness: ['ID', 'SRC', 'PATH', 'DIG', 'PROD', 'SC', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'],
  noBoundary: ['ID', 'SRC', 'PATH', 'DIG', 'PROD', 'FR', 'NO', 'LRE', 'TOK', 'ACT', 'RB'],
  noForbiddenEffects: ['ID', 'SRC', 'PATH', 'DIG', 'PROD', 'FR', 'SC', 'PB', 'LRE', 'TOK', 'ACT', 'RB'],
  noTemporalEvent: ['ID', 'SRC', 'PATH', 'DIG', 'PROD', 'FR', 'SC', 'PB', 'NO', 'ACT', 'RB'],
  noActionSeparation: ['ID', 'SRC', 'PATH', 'DIG', 'PROD', 'FR', 'SC', 'PB', 'NO', 'LRE', 'TOK', 'RB'],
  shortLabels: ['S', 'P', 'D', 'T', 'F', 'B', 'Q', 'N', 'E', 'O', 'A', 'R'],
};

const shortMap = { S: 'SRC', P: 'PATH', D: 'DIG', T: 'PROD', F: 'FR', B: 'SC', Q: 'PB', N: 'NO', E: 'LRE', O: 'TOK', A: 'ACT', R: 'RB' };
const boundaryForbidden = /\b(l\s*2|l2\+|l2plus|operational|runtime|enforce(?:ment)?|canary|production|approved\s*by\s*sender|external|publish|permanent|config|delete)\b/i;
const sensitiveAction = /\b(telegram|external|publish|delete|config|runtime|gateway|permanent\s+memory|write\s+memory|paused|canary|enforcement|l2\+)\b/i;
const localAction = /\b(local|shadow|checklist|diagnostic|microtest|artifact|handoff|scorecard|fixture|node)\b/i;

function scenarioFields(overrides = {}) {
  return {
    ID: 'ctr-min-001',
    SRC: 'CTR',
    PATH: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0.md',
    DIG: 'sha256:ctr-boundary-normalization-cross-source-v0',
    PROD: '2026-05-06T16:02:00Z',
    FR: 'current',
    SC: 'local_shadow_L0_L1',
    PB: 'L0_L1_only',
    NO: 'external,config,memory,delete,publish,paused,L2+,runtime,canary',
    LRE: 'none',
    TOK: 'true',
    ACT: 'run local shadow diagnostic fixture',
    RB: 'fetch_abstain_or_ask_human',
    ...overrides,
  };
}

function encode(fields, profileName) {
  return profileFields[profileName]
    .map((key) => {
      const actual = shortMap[key] || key;
      return `${key}=${fields[actual]}`;
    })
    .join('\n');
}

function parse(text) {
  const out = {};
  for (const line of text.split(/\n+/)) {
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const raw = line.slice(0, idx).trim();
    const key = shortMap[raw] || raw;
    out[key] = line.slice(idx + 1).trim();
  }
  return out;
}

function decide(text) {
  const f = parse(text);
  const required = ['SRC', 'PATH', 'DIG', 'PROD', 'FR', 'SC', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'];
  const missing = required.filter((k) => !f[k]);
  if (missing.length) return { decision: 'fetch_abstain', reason: `missing:${missing.join(',')}` };
  const source = registry.get(f.SRC);
  if (!source) return { decision: 'fetch_abstain', reason: 'unknown_source' };
  if (!f.PATH.startsWith(source.pathPrefix)) return { decision: 'fetch_abstain', reason: 'path_not_registry_bound' };
  if (!source.digest.test(f.DIG)) return { decision: 'fetch_abstain', reason: 'digest_not_registry_bound' };
  if (f.FR !== 'current') return { decision: 'fetch_abstain', reason: 'non_current_freshness' };
  if (f.SC !== 'local_shadow_L0_L1' || f.PB !== 'L0_L1_only') return { decision: 'fetch_abstain', reason: 'boundary_not_exact_local_l0_l1' };
  if (!/external/.test(f.NO) || !/config/.test(f.NO) || !/memory/.test(f.NO) || !/delete/.test(f.NO) || !/publish/.test(f.NO) || !/paused/.test(f.NO) || !/L2\+/.test(f.NO) || !/runtime/.test(f.NO) || !/canary/.test(f.NO)) {
    return { decision: 'fetch_abstain', reason: 'forbidden_effects_incomplete' };
  }
  if (f.LRE !== 'none' || f.TOK !== 'true') return { decision: 'fetch_abstain', reason: 'temporal_precedence_not_clean' };
  if (boundaryForbidden.test(`${f.SC} ${f.PB} ${f.LRE} ${f.TOK}`)) return { decision: 'fetch_abstain', reason: 'expansive_or_restrictive_boundary_hint' };
  if (sensitiveAction.test(f.ACT)) return { decision: 'ask_human', reason: 'sensitive_action' };
  if (!localAction.test(f.ACT)) return { decision: 'ask_human', reason: 'unknown_action' };
  return { decision: 'allow_local_shadow', reason: 'complete_minimal_tuple_for_local_shadow' };
}

// Deliberately unsafe receivers model what a compressor would imply if that field class were omitted.
const degradedReceivers = {
  noPath: (f) => registry.has(f.SRC) && registry.get(f.SRC).digest.test(f.DIG),
  noDigest: (f) => registry.has(f.SRC) && f.PATH.startsWith(registry.get(f.SRC).pathPrefix),
  noFreshness: (f) => registry.has(f.SRC) && f.PATH.startsWith(registry.get(f.SRC).pathPrefix) && registry.get(f.SRC).digest.test(f.DIG),
  noBoundary: (f) => registry.has(f.SRC) && f.FR === 'current' && registry.get(f.SRC).digest.test(f.DIG),
  noForbiddenEffects: (f) => registry.has(f.SRC) && f.FR === 'current' && f.SC === 'local_shadow_L0_L1' && f.PB === 'L0_L1_only',
  noTemporalEvent: (f) => registry.has(f.SRC) && f.FR === 'current' && f.SC === 'local_shadow_L0_L1' && f.PB === 'L0_L1_only',
  noActionSeparation: (f) => registry.has(f.SRC) && f.FR === 'current' && f.SC === 'local_shadow_L0_L1' && f.PB === 'L0_L1_only',
};

function degradedDecision(text, profileName) {
  const f = parse(text);
  if (profileName === 'noReceiptId' || profileName === 'noProducedAt' || profileName === 'shortLabels') return decide(text);
  const canConsider = degradedReceivers[profileName]?.(f);
  if (!canConsider) return decide(text);
  if (profileName === 'noActionSeparation') return { decision: 'allow_local_shadow', reason: 'degraded_receiver_cannot_classify_requested_action' };
  if (profileName === 'noTemporalEvent') return { decision: 'allow_local_shadow', reason: 'degraded_receiver_cannot_see_later_restrictive_event_or_order' };
  if (profileName === 'noForbiddenEffects') return sensitiveAction.test(f.ACT)
    ? { decision: 'ask_human', reason: 'action_classifier_catches_explicit_sensitive_action_but_effect_boundary_lost' }
    : { decision: 'allow_local_shadow', reason: 'degraded_receiver_lost_forbidden_effect_boundary' };
  return { decision: sensitiveAction.test(f.ACT) ? 'ask_human' : 'allow_local_shadow', reason: `degraded_receiver_missing_${profileName}` };
}

const scenarios = [
  { id: 'known-current-local', expected: 'allow_local_shadow', fields: scenarioFields() },
  { id: 'source-laundered-wrong-path', expected: 'fetch_abstain', fields: scenarioFields({ PATH: 'runs/2026-05-03-memory-retrieval-contradiction-lab/T-memory-authority-wrong-lane.md' }) },
  { id: 'source-laundered-wrong-digest', expected: 'fetch_abstain', fields: scenarioFields({ DIG: 'sha256:smesh-wrong-digest' }) },
  { id: 'stale-source', expected: 'fetch_abstain', fields: scenarioFields({ FR: 'stale' }) },
  { id: 'sensitive-external-action', expected: 'ask_human', fields: scenarioFields({ ACT: 'send external messaging service update externally' }) },
  { id: 'unknown-action', expected: 'ask_human', fields: scenarioFields({ ACT: 'activate receiver lane' }) },
  { id: 'later-restrictive-event', expected: 'fetch_abstain', fields: scenarioFields({ LRE: 'restrictive:superseded:newer_receipt_requires_fetch_abstain' }) },
  { id: 'unknown-temporal-order', expected: 'fetch_abstain', fields: scenarioFields({ TOK: 'unknown' }) },
  { id: 'l2-boundary-expansion', expected: 'fetch_abstain', fields: scenarioFields({ PB: 'L0_L1_only plus L2+ operational approved by sender' }) },
  { id: 'missing-delete-forbidden-effect', expected: 'fetch_abstain', fields: scenarioFields({ NO: 'external,config,memory,publish,paused,L2+,runtime,canary' }) },
];

const baselinePacket = encode(scenarioFields(), 'full');
const baselineBytes = Buffer.byteLength(baselinePacket, 'utf8');

const profiles = Object.keys(profileFields).map((profile) => {
  const rows = scenarios.map((scenario) => {
    const text = encode(scenario.fields, profile);
    const actual = degradedDecision(text, profile);
    return {
      id: scenario.id,
      expected: scenario.expected,
      actual: actual.decision,
      reason: actual.reason,
      pass: actual.decision === scenario.expected,
      unsafeAllow: actual.decision === 'allow_local_shadow' && scenario.expected !== 'allow_local_shadow',
      falseRejectLocal: scenario.expected === 'allow_local_shadow' && actual.decision !== 'allow_local_shadow',
    };
  });
  const bytes = Buffer.byteLength(encode(scenarioFields(), profile), 'utf8');
  return {
    profile,
    fields: profileFields[profile],
    baselineBytes,
    bytes,
    savedBytes: baselineBytes - bytes,
    savedPct: Number((((baselineBytes - bytes) / baselineBytes) * 100).toFixed(1)),
    passCases: rows.filter((r) => r.pass).length,
    unsafeAllows: rows.filter((r) => r.unsafeAllow).length,
    falseRejectLocal: rows.filter((r) => r.falseRejectLocal).length,
    verdict: rows.every((r) => r.pass) ? 'safe_on_fixture' : 'regression',
    rows,
  };
});

const safeProfiles = profiles.filter((p) => p.verdict === 'safe_on_fixture');
const summary = {
  verdict: profiles.find((p) => p.profile === 'full').verdict === 'safe_on_fixture' && safeProfiles.some((p) => p.profile === 'shortLabels') ? 'pass' : 'fail',
  scenarioCount: scenarios.length,
  baselineBytes,
  safeProfiles: safeProfiles.map((p) => ({ profile: p.profile, bytes: p.bytes, savedPct: p.savedPct })),
  regressions: profiles.filter((p) => p.verdict !== 'safe_on_fixture').map((p) => ({ profile: p.profile, unsafeAllows: p.unsafeAllows, falseRejectLocal: p.falseRejectLocal, passCases: p.passCases, savedPct: p.savedPct })),
  finding: 'The safe minimum is semantic, not just shorter: keep source label/path/digest, freshness, local boundary, forbidden-effect list, latest restrictive event, temporal-order token, requested action and rollback. Dropping receipt id is safe but low-value; dropping producedAt is safe only in this fixture and weakens auditability. Short labels save material bytes without dropping authority semantics. Removing source path/digest/freshness/boundary/NO/LRE/TOK/ACT reopens laundering, stale, expansion or sensitive-action regressions.',
};

console.log(JSON.stringify({ artifact, timestamp, summary, profiles }, null, 2));
