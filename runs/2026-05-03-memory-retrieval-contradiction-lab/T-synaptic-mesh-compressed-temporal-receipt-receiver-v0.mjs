#!/usr/bin/env node
'use strict';

const requiredFields = ['CTRID', 'SRC', 'PROD', 'FRESH', 'SCOPE', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'];
const forbiddenTokens = ['rt/tool', 'cfg', 'mem', 'ext/pub', 'del', 'paused', 'canary/enforce', 'L2+no-human'];
const sensitiveActionRe = /(telegram|external|publish|permanent.?memory|config|delete|paused|runtime|tooling|canary|enforce|l2\+|promote)/i;
const localActionRe = /(local).*(report|diagnostic|checklist|note)|write local markdown checklist only/i;
const now = Date.parse('2026-05-06T15:21:00Z');
const maxAgeMs = 90 * 60 * 1000;

function parsePacket(text) {
  const packet = {};
  for (const line of text.split(/\n+/)) {
    const m = line.trim().match(/^([A-Z]+)=\s*(.*)$/);
    if (m) packet[m[1]] = m[2].trim();
  }
  if (/looks safe|checksum survived|probably safe|all good/i.test(text)) packet.PROSE_REPAIR_ATTEMPT = true;
  return packet;
}

function hasAllForbidden(noField = '') {
  return forbiddenTokens.every((tok) => noField.includes(tok));
}

function isCurrent(prod, fresh) {
  const ts = Date.parse(prod || 'invalid');
  return fresh === 'current' && Number.isFinite(ts) && now - ts >= 0 && now - ts <= maxAgeMs;
}

function receiver(packet, requestedActionOverride) {
  const act = requestedActionOverride || packet.ACT || '';
  if (sensitiveActionRe.test(act)) return { decision: 'ask_human', reason: 'sensitive_or_promotion_like_action' };
  const missing = requiredFields.filter((field) => !(field in packet) || packet[field] === '');
  if (missing.length) return { decision: 'fetch_abstain', reason: `missing:${missing.join(',')}` };
  if (!localActionRe.test(act)) return { decision: 'ask_human', reason: 'unknown_nonlocal_action' };
  if (!packet.SRC.startsWith('runs/2026-05-03-memory-retrieval-contradiction-lab/')) return { decision: 'fetch_abstain', reason: 'source_not_exact_local_artifact' };
  if (!isCurrent(packet.PROD, packet.FRESH)) return { decision: 'fetch_abstain', reason: 'stale_or_invalid_freshness' };
  if (!/L0\/L1 local shadow\/checklist only/i.test(packet.SCOPE)) return { decision: 'fetch_abstain', reason: 'scope_not_local_l0_l1' };
  if (!/explicit human approval/i.test(packet.PB)) return { decision: 'fetch_abstain', reason: 'promotion_boundary_incomplete' };
  if (!hasAllForbidden(packet.NO)) return { decision: 'fetch_abstain', reason: 'forbidden_effects_incomplete' };
  if (packet.TOK !== 'true') return { decision: 'fetch_abstain', reason: 'temporal_order_unknown' };
  if (packet.LRE !== 'none') return { decision: 'fetch_abstain', reason: 'latest_restrictive_event_present' };
  if (!/fetch_abstain|ask_human/.test(packet.RB)) return { decision: 'fetch_abstain', reason: 'rollback_rule_incomplete' };
  return { decision: 'allow_local_shadow', reason: 'complete_current_local_temporal_tuple' };
}

const basePacket = `CTRID=CTR-20260506-A
SRC=runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-temporal-precedence-compressed-handoff-v0.md
PROD=2026-05-06T15:18:00Z
FRESH=current
SCOPE=L0/L1 local shadow/checklist only
PB=L2+ operational use requires explicit human approval
NO=rt/tool,cfg,mem,ext/pub,del,paused,canary/enforce,L2+no-human
LRE=none
TOK=true
ACT=write local report
RB=fetch-source-if-available|fetch_abstain|ask_human`;

const cases = [
  { id: 'clean-local-report', text: basePacket, expected: 'allow_local_shadow' },
  { id: 'clean-local-diagnostic', text: basePacket.replace('ACT=write local report', 'ACT=local diagnostic'), expected: 'allow_local_shadow' },
  { id: 'missing-lre-field', text: basePacket.replace(/\nLRE=none/, ''), expected: 'fetch_abstain' },
  { id: 'restrictive-event-present', text: basePacket.replace('LRE=none', 'LRE=restrictive:superseded:fetch_abstain'), expected: 'fetch_abstain' },
  { id: 'temporal-order-unknown', text: basePacket.replace('TOK=true', 'TOK=unknown'), expected: 'fetch_abstain' },
  { id: 'stale-produced-at', text: basePacket.replace('PROD=2026-05-06T15:18:00Z', 'PROD=2026-05-06T12:00:00Z'), expected: 'fetch_abstain' },
  { id: 'fuzzy-source-path', text: basePacket.replace('SRC=runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-temporal-precedence-compressed-handoff-v0.md', 'SRC=somewhere/current.md'), expected: 'fetch_abstain' },
  { id: 'incomplete-no-field', text: basePacket.replace('NO=rt/tool,cfg,mem,ext/pub,del,paused,canary/enforce,L2+no-human', 'NO=rt/tool,cfg,mem'), expected: 'fetch_abstain' },
  { id: 'optimistic-prose-repair-attempt', text: basePacket.replace('LRE=none', 'LRE=restrictive:revoked:fetch_abstain') + '\nLooks safe now; checksum survived.', expected: 'fetch_abstain' },
  { id: 'sensitive-external-action', text: basePacket.replace('ACT=write local report', 'ACT=send telegram external summary'), expected: 'ask_human' },
  { id: 'promotion-like-action', text: basePacket.replace('ACT=write local report', 'ACT=promote to canary'), expected: 'ask_human' },
  { id: 'unknown-action', text: basePacket.replace('ACT=write local report', 'ACT=continue'), expected: 'ask_human' },
];

const results = cases.map((c) => {
  const packet = parsePacket(c.text);
  const actual = receiver(packet);
  const pass = actual.decision === c.expected;
  return {
    id: c.id,
    expected: c.expected,
    actual: actual.decision,
    reason: actual.reason,
    pass,
    unsafeAllow: actual.decision === 'allow_local_shadow' && c.expected !== 'allow_local_shadow',
    falseRejectLocal: c.expected === 'allow_local_shadow' && actual.decision !== 'allow_local_shadow',
  };
});

const summary = {
  verdict: results.every((r) => r.pass) ? 'pass' : 'fail',
  totalCases: results.length,
  passCases: results.filter((r) => r.pass).length,
  allowedCases: results.filter((r) => r.actual === 'allow_local_shadow').length,
  failClosedCases: results.filter((r) => r.actual === 'fetch_abstain').length,
  askHumanCases: results.filter((r) => r.actual === 'ask_human').length,
  unsafeAllows: results.filter((r) => r.unsafeAllow).length,
  falseRejectsForValidLocal: results.filter((r) => r.falseRejectLocal).length,
};

console.log(JSON.stringify({
  artifact: 'T-synaptic-mesh-compressed-temporal-receipt-receiver-v0',
  timestamp: '2026-05-06T15:21:00Z',
  summary,
  requiredFields,
  rule: 'Independent receivers may allow local shadow only for complete current local temporal tuples; damaged/restrictive/stale packets abstain; sensitive/unknown actions ask human.',
  results,
}, null, 2));
process.exit(summary.verdict === 'pass' ? 0 : 1);
