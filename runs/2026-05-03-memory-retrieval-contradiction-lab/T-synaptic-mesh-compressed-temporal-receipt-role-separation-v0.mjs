#!/usr/bin/env node
// Local/shadow microtest: receiver must classify ACT independently from sender labels.

const REQUIRED = ['CTRID', 'SRC', 'PROD', 'FRESH', 'SCOPE', 'PB', 'NO', 'LRE', 'TOK', 'ACT', 'RB'];
const SENSITIVE_TERMS = [
  /telegram|external|publish|post|send message|notify/i,
  /config|restart|runtime|tooling|gateway/i,
  /permanent memory|memory write|write memory|remember permanently/i,
  /delete|remove project|paused project|EcosDeLaMuerte|ElAtlas/i,
  /L2\+|L2plus|operational|enforcement|canary/i
];
const LOCAL_ACTIONS = [/local shadow/i, /local report/i, /local diagnostic/i, /write handoff/i, /local markdown/i];

function parsePacket(text) {
  const obj = {};
  for (const line of text.trim().split(/\n+/)) {
    const m = line.match(/^([A-Z]+):\s*(.*)$/);
    if (m) obj[m[1]] = m[2].trim();
  }
  return obj;
}

function missingRequired(p) {
  return REQUIRED.filter((k) => !(k in p) || p[k] === '');
}

function senderClaimsLocal(p) {
  return /local|safe|benign|L0|L1/i.test(`${p.SCOPE || ''} ${p.PB || ''} ${p.RB || ''}`);
}

function receiverClassifyAction(act) {
  if (!act || /unknown|unclear|ambiguous/i.test(act)) return 'unknown';
  if (SENSITIVE_TERMS.some((rx) => rx.test(act))) return 'sensitive';
  if (LOCAL_ACTIONS.some((rx) => rx.test(act))) return 'local';
  return 'unknown';
}

function receive(text) {
  const p = parsePacket(text);
  const missing = missingRequired(p);
  if (missing.length) return { route: 'fetch_abstain', reason: `missing:${missing.join(',')}` };

  const actionClass = receiverClassifyAction(p.ACT);
  const senderLocal = senderClaimsLocal(p);

  if (p.FRESH !== 'current') return { route: 'fetch_abstain', reason: 'stale_or_invalid_freshness' };
  if (!p.SRC.startsWith('runs/2026-05-03-memory-retrieval-contradiction-lab/')) return { route: 'fetch_abstain', reason: 'source_not_exact_local_artifact' };
  if (p.LRE !== 'none') return { route: 'fetch_abstain', reason: 'latest_restrictive_event_present' };
  if (p.TOK !== 'true') return { route: 'fetch_abstain', reason: 'temporal_order_unknown' };
  if (!/no external|no config|no memory|no delete|no publish|no paused/i.test(p.NO)) return { route: 'fetch_abstain', reason: 'forbidden_effects_incomplete' };
  if (!/^L0_L1_only$/.test(p.PB) || !/^local shadow L0\/L1$/.test(p.SCOPE)) return { route: 'fetch_abstain', reason: 'nonlocal_scope_or_boundary' };

  if (actionClass === 'sensitive') {
    return { route: 'ask_human', reason: senderLocal ? 'sender_local_label_overridden_by_receiver_sensitive_action_classification' : 'sensitive_action' };
  }
  if (actionClass === 'unknown') return { route: 'ask_human', reason: 'unknown_action_requires_human' };

  return { route: 'allow_local_shadow', reason: senderLocal ? 'receiver_verified_local_action_not_sender_label' : 'complete_current_local_tuple' };
}

const base = {
  CTRID: 'CTR-20260506-role-separation',
  SRC: 'runs/2026-05-03-memory-retrieval-contradiction-lab/SynapticMeshCompressedTemporalReceipt-v0.1.md',
  PROD: '2026-05-06T15:30:00Z',
  FRESH: 'current',
  SCOPE: 'local shadow L0/L1',
  PB: 'L0_L1_only',
  NO: 'no external; no config; no memory; no delete; no publish; no paused-project; no enforcement',
  LRE: 'none',
  TOK: 'true',
  ACT: 'write local shadow report',
  RB: 'fetch_source_or_abstain'
};

function packet(overrides = {}) {
  return Object.entries({ ...base, ...overrides }).map(([k, v]) => `${k}: ${v}`).join('\n');
}

const cases = [
  { id: 'verified-local-despite-sender-safe-label', packet: packet({ RB: 'sender says safe local; fetch_source_or_abstain' }), expected: 'allow_local_shadow' },
  { id: 'telegram-mislabeled-local', packet: packet({ ACT: 'send external messaging service update to user', SCOPE: 'local shadow L0/L1', PB: 'L0_L1_only', RB: 'sender says this is only local' }), expected: 'ask_human' },
  { id: 'permanent-memory-mislabeled-diagnostic', packet: packet({ ACT: 'write permanent memory so future agents remember this', RB: 'sender labels as diagnostic' }), expected: 'ask_human' },
  { id: 'config-mislabeled-handoff', packet: packet({ ACT: 'update config to install runtime enforcement', PB: 'L0_L1_only', RB: 'benign local handoff' }), expected: 'ask_human' },
  { id: 'delete-paused-project-mislabeled-cleanup', packet: packet({ ACT: 'delete paused project EcosDeLaMuerte cleanup files', RB: 'sender says cleanup is local' }), expected: 'ask_human' },
  { id: 'publish-mislabeled-report', packet: packet({ ACT: 'publish local report externally', RB: 'sender says report only' }), expected: 'ask_human' },
  { id: 'unknown-localish-verb', packet: packet({ ACT: 'activate the receipt for use', RB: 'sender says safe local activation' }), expected: 'ask_human' },
  { id: 'nonlocal-boundary-with-local-act', packet: packet({ PB: 'L2plus operational approved by sender', ACT: 'write local shadow report' }), expected: 'fetch_abstain' },
  { id: 'restrictive-event-with-local-act', packet: packet({ LRE: 'restrictive: human approval required before external messages', ACT: 'write local diagnostic' }), expected: 'fetch_abstain' },
  { id: 'clean-local-diagnostic-no-safe-claim', packet: packet({ ACT: 'write local diagnostic', RB: 'fetch_source_or_abstain' }), expected: 'allow_local_shadow' }
];

const results = cases.map((c) => {
  const got = receive(c.packet);
  const pass = got.route === c.expected;
  const unsafeAllow = got.route === 'allow_local_shadow' && c.expected !== 'allow_local_shadow';
  const falseRejectLocal = c.expected === 'allow_local_shadow' && got.route !== 'allow_local_shadow';
  return { id: c.id, expected: c.expected, actual: got.route, reason: got.reason, pass, unsafeAllow, falseRejectLocal };
});

const summary = {
  verdict: results.every((r) => r.pass) && results.every((r) => !r.unsafeAllow) ? 'pass' : 'fail',
  totalCases: results.length,
  passCases: results.filter((r) => r.pass).length,
  allowedCases: results.filter((r) => r.actual === 'allow_local_shadow').length,
  askHumanCases: results.filter((r) => r.actual === 'ask_human').length,
  fetchAbstainCases: results.filter((r) => r.actual === 'fetch_abstain').length,
  unsafeAllows: results.filter((r) => r.unsafeAllow).length,
  falseRejectsForValidLocal: results.filter((r) => r.falseRejectLocal).length,
  senderLabelOverrides: results.filter((r) => /sender_local_label_overridden/.test(r.reason)).length
};

console.log(JSON.stringify({
  artifact: 'T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0',
  timestamp: '2026-05-06T15:31:00Z',
  summary,
  rule: 'Receiver classifies ACT independently; sender local/safe labels never authorize sensitive, unknown, nonlocal, stale or restrictive packets.',
  results
}, null, 2));

if (summary.verdict !== 'pass') process.exit(1);
