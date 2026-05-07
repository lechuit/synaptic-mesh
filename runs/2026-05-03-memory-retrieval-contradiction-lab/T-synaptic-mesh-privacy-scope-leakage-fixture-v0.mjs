import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifact = 'T-synaptic-mesh-privacy-scope-leakage-fixture-v0';
const timestamp = '2026-05-06T18:38:00Z';

const DECISIONS = Object.freeze({
  ALLOW_LOCAL_SHADOW: 'allow_local_shadow',
  FETCH_ABSTAIN: 'fetch_abstain',
  ASK_HUMAN: 'ask_human',
});

const scopes = Object.freeze({
  PRIVATE_AGENT: 'private_agent',
  TEAM: 'team',
  SEALED: 'sealed_sensitive',
  LOCAL_ONLY: 'local_only',
  GLOBAL: 'global',
});

const validContext = Object.freeze({
  requesterAgent: 'jarvis',
  requesterTeam: 'radar',
  action: { verb: 'write_local_fixture_report', riskTier: 'low_local', targetScope: scopes.LOCAL_ONLY },
});

function atom(overrides = {}) {
  return {
    atomId: 'M-synaptic-fixture-team-current-local-001',
    claim: 'Fixture parity harness currently passes 13/13 with no unsafe allows.',
    scope: scopes.TEAM,
    ownerAgent: 'jarvis',
    ownerTeam: 'radar',
    sensitivity: 'low',
    freshness: 'current',
    sourceArtifactId: 'T-synaptic-mesh-source-spoofing-fixture-parity-registration-v0',
    allowedUse: ['local_shadow', 'fixture_report'],
    promotionBoundary: 'no_global_promotion_without_human_approval',
    effectBoundary: 'local_only_no_runtime_no_external_no_delete',
    ...overrides,
  };
}

function decide({ memoryAtom, context = validContext }) {
  const reasons = [];
  const action = context.action ?? {};

  if (!['write_local_fixture_report', 'run_local_test', 'create_local_fixture'].includes(action.verb) || action.riskTier !== 'low_local') {
    return { decision: DECISIONS.ASK_HUMAN, reasons: [`non-local or unknown action: ${action.verb ?? 'missing'}`] };
  }

  if (memoryAtom.freshness !== 'current') reasons.push(`freshness is ${memoryAtom.freshness ?? 'missing'}`);
  if (!String(memoryAtom.effectBoundary ?? '').includes('local_only') || !String(memoryAtom.effectBoundary ?? '').includes('no_external')) {
    reasons.push('effectBoundary is not local/no_external bound');
  }

  if (memoryAtom.scope === scopes.PRIVATE_AGENT && memoryAtom.ownerAgent !== context.requesterAgent) {
    reasons.push(`private_agent owner mismatch: ${memoryAtom.ownerAgent} != ${context.requesterAgent}`);
  }

  if (memoryAtom.scope === scopes.TEAM && memoryAtom.ownerTeam !== context.requesterTeam) {
    reasons.push(`team scope mismatch: ${memoryAtom.ownerTeam} != ${context.requesterTeam}`);
  }

  if (memoryAtom.scope === scopes.SEALED || memoryAtom.sensitivity === 'sealed' || memoryAtom.sensitivity === 'sensitive') {
    return {
      decision: DECISIONS.ASK_HUMAN,
      reasons: ['sealed/sensitive memory cannot be summarized or reused by local shadow fixture without human approval'],
    };
  }

  const attemptsGlobalPromotion = action.targetScope === scopes.GLOBAL || action.verb === 'promote_memory_global';
  const forbidsGlobalPromotion = String(memoryAtom.promotionBoundary ?? '').includes('no_global') || memoryAtom.scope === scopes.LOCAL_ONLY;
  if (attemptsGlobalPromotion && forbidsGlobalPromotion) {
    return { decision: DECISIONS.ASK_HUMAN, reasons: ['global promotion attempt violates local/no-global promotion boundary'] };
  }

  if (memoryAtom.scope === scopes.GLOBAL && !String(memoryAtom.promotionBoundary ?? '').includes('verified_global')) {
    reasons.push('global scope lacks verified_global promotion boundary');
  }

  if (reasons.length) return { decision: DECISIONS.FETCH_ABSTAIN, reasons };
  return { decision: DECISIONS.ALLOW_LOCAL_SHADOW, reasons: ['scope, owner/team, freshness, and local boundaries match low-risk local action'] };
}

const cases = [
  {
    id: 'valid-team-current-local-control',
    expected: DECISIONS.ALLOW_LOCAL_SHADOW,
    input: { memoryAtom: atom() },
  },
  {
    id: 'private-agent-requested-by-different-agent',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { memoryAtom: atom({ scope: scopes.PRIVATE_AGENT, ownerAgent: 'contractor-agent', ownerTeam: 'radar' }) },
  },
  {
    id: 'team-memory-requested-by-wrong-team',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { memoryAtom: atom({ scope: scopes.TEAM, ownerTeam: 'finance' }) },
  },
  {
    id: 'sealed-memory-requested-for-local-summary',
    expected: DECISIONS.ASK_HUMAN,
    input: { memoryAtom: atom({ scope: scopes.SEALED, sensitivity: 'sealed', allowedUse: [] }) },
  },
  {
    id: 'sensitive-memory-requested-for-local-fixture',
    expected: DECISIONS.ASK_HUMAN,
    input: { memoryAtom: atom({ sensitivity: 'sensitive' }) },
  },
  {
    id: 'local-only-memory-attempted-as-global-promotion',
    expected: DECISIONS.ASK_HUMAN,
    input: { memoryAtom: atom({ scope: scopes.LOCAL_ONLY }), context: { ...validContext, action: { verb: 'write_local_fixture_report', riskTier: 'low_local', targetScope: scopes.GLOBAL } } },
  },
  {
    id: 'global-memory-without-verified-global-boundary',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { memoryAtom: atom({ scope: scopes.GLOBAL, promotionBoundary: 'claimed_global_unverified' }) },
  },
  {
    id: 'stale-team-memory-even-with-correct-team',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { memoryAtom: atom({ freshness: 'stale' }) },
  },
  {
    id: 'unsafe-action-even-with-valid-team-memory',
    expected: DECISIONS.ASK_HUMAN,
    input: { memoryAtom: atom(), context: { ...validContext, action: { verb: 'write_permanent_memory', riskTier: 'sensitive', targetScope: scopes.GLOBAL } } },
  },
];

const results = cases.map((testCase) => {
  const actual = decide(testCase.input);
  assert.equal(actual.decision, testCase.expected, testCase.id);
  return {
    id: testCase.id,
    expected: testCase.expected,
    actual: actual.decision,
    pass: actual.decision === testCase.expected,
    reasons: actual.reasons,
  };
});

const unsafeAllows = results.filter((r) => r.expected !== DECISIONS.ALLOW_LOCAL_SHADOW && r.actual === DECISIONS.ALLOW_LOCAL_SHADOW).length;
const falseRejectsForValidLocal = results.filter((r) => r.expected === DECISIONS.ALLOW_LOCAL_SHADOW && r.actual !== DECISIONS.ALLOW_LOCAL_SHADOW).length;

const summary = {
  artifact,
  timestamp,
  verdict: results.every((r) => r.pass) && unsafeAllows === 0 && falseRejectsForValidLocal === 0 ? 'pass' : 'fail',
  total: results.length,
  passCases: results.filter((r) => r.pass).length,
  unsafeAllows,
  falseRejectsForValidLocal,
  askHumanCases: results.filter((r) => r.actual === DECISIONS.ASK_HUMAN).length,
  fetchAbstainCases: results.filter((r) => r.actual === DECISIONS.FETCH_ABSTAIN).length,
  allowLocalShadowCases: results.filter((r) => r.actual === DECISIONS.ALLOW_LOCAL_SHADOW).length,
  coverage: [
    'valid same-team current low-risk local use',
    'private-agent owner mismatch',
    'team scope mismatch',
    'sealed/sensitive summary attempt',
    'local-only to global promotion attempt',
    'unverified global scope claim',
    'stale scoped memory',
    'sensitive action override even with valid memory',
  ],
};

const output = {
  summary,
  results,
  boundary: {
    mode: 'L0/L1 local fixture only',
    noRuntimeIntegration: true,
    noConfigChanges: true,
    noMemoryPromotion: true,
    noExternalEffects: true,
    noDelete: true,
    l2PlusRequiresHuman: true,
  },
};

await writeFile(path.join(__dirname, `${artifact}.out.json`), `${JSON.stringify(output, null, 2)}\n`);
await mkdir(path.resolve(__dirname, '../../research-package'), { recursive: true });
await writeFile(path.resolve(__dirname, '../../research-package', `${artifact}.md`), renderMarkdown(output));
console.log(JSON.stringify(output, null, 2));
if (summary.verdict !== 'pass') process.exitCode = 1;

function renderMarkdown(output) {
  const rows = output.results.map((r) => `| ${r.id} | ${r.expected} | ${r.actual} | ${r.pass ? 'pass' : 'fail'} | ${r.reasons.join('; ')} |`).join('\n');
  return `# ${artifact}\n\nTimestamp: ${timestamp}\n\n## Verdict\n\n${output.summary.verdict}\n\n## Summary\n\n\`\`\`json\n${JSON.stringify(output.summary, null, 2)}\n\`\`\`\n\n## Case results\n\n| Case | Expected | Actual | Pass | Reason |\n| --- | --- | --- | --- | --- |\n${rows}\n\n## Interpretation\n\nScope is a hard precondition before usefulness/ranking. The local shadow router may reuse same-team current low-risk memory for a local fixture report, but it fails closed on private-agent owner mismatch, wrong-team memory, sealed/sensitive memory, stale scoped memory, unverified global claims, and any attempt to promote local-only material into global/durable memory.\n\n## Boundary\n\nLocal fixture/script/report only. No runtime integration, config changes, permanent memory promotion, external publication/effects, deletion, or L2+ operational use without explicit human approval.\n`;
}
