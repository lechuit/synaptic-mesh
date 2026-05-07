import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifact = 'T-synaptic-mesh-cross-agent-conflict-quarantine-fixture-v0';
const timestamp = '2026-05-06T17:49:00Z';

const DECISIONS = Object.freeze({
  ALLOW_LOCAL_SHADOW: 'allow_local_shadow',
  FETCH_ABSTAIN: 'fetch_abstain',
  ASK_HUMAN: 'ask_human',
});

const scopes = Object.freeze({
  PRIVATE_AGENT: 'private_agent',
  TEAM: 'team',
  SEALED: 'sealed_sensitive',
  GLOBAL: 'global',
});

const baseContext = Object.freeze({
  requesterAgent: 'jarvis',
  requesterTeam: 'radar',
  action: { verb: 'write_local_fixture_report', riskTier: 'low_local' },
});

function conflict(overrides = {}) {
  return {
    conflictId: 'C-cross-agent-fixture-001',
    claim: 'Raw claim says the private retrieval threshold is 0.41 for a client dataset.',
    scope: scopes.TEAM,
    ownerAgent: 'jarvis',
    ownerTeam: 'radar',
    sensitivity: 'low',
    status: 'resolved',
    sourceBinding: 'artifact:T-synaptic-mesh-privacy-scope-leakage-fixture-v0#case:valid-team-current-local-control',
    redaction: {
      mode: 'source_bound_summary',
      summary: 'Conflict exists between current local fixture expectations and prior source-bound evidence.',
      pointer: 'conflict-pointer:C-cross-agent-fixture-001',
      excludesRawClaim: true,
    },
    ...overrides,
  };
}

function decide({ conflictAtom, context = baseContext }) {
  const action = context.action ?? {};
  if (!['write_local_fixture_report', 'run_local_test', 'create_local_fixture'].includes(action.verb) || action.riskTier !== 'low_local') {
    return expose(DECISIONS.ASK_HUMAN, ['non-local or unknown action requires human approval'], conflictAtom, false);
  }

  if (conflictAtom.scope === scopes.SEALED || conflictAtom.sensitivity === 'sealed' || conflictAtom.sensitivity === 'sensitive') {
    return expose(DECISIONS.ASK_HUMAN, ['sealed/sensitive conflict cannot be exposed through cross-agent summary'], conflictAtom, false);
  }

  if (conflictAtom.scope === scopes.PRIVATE_AGENT && conflictAtom.ownerAgent !== context.requesterAgent) {
    return expose(DECISIONS.FETCH_ABSTAIN, [`private conflict owner mismatch: ${conflictAtom.ownerAgent} != ${context.requesterAgent}`], conflictAtom, false);
  }

  if (conflictAtom.scope === scopes.TEAM && conflictAtom.ownerTeam !== context.requesterTeam) {
    return expose(DECISIONS.FETCH_ABSTAIN, [`team conflict boundary mismatch: ${conflictAtom.ownerTeam} != ${context.requesterTeam}`], conflictAtom, false);
  }

  if (conflictAtom.scope === scopes.GLOBAL && (conflictAtom.contradictedByScope === scopes.SEALED || conflictAtom.contradictedByScope === scopes.PRIVATE_AGENT)) {
    return expose(DECISIONS.ASK_HUMAN, ['global claim is contradicted by private/sealed source; expose pointer only and require human arbitration'], conflictAtom, false);
  }

  if (conflictAtom.status !== 'resolved') {
    return expose(DECISIONS.FETCH_ABSTAIN, [`conflict status is ${conflictAtom.status ?? 'missing'}`], conflictAtom, false);
  }

  if (!conflictAtom.sourceBinding || conflictAtom.redaction?.mode !== 'source_bound_summary' || conflictAtom.redaction?.excludesRawClaim !== true) {
    return expose(DECISIONS.FETCH_ABSTAIN, ['missing source-bound redaction summary'], conflictAtom, false);
  }

  return expose(DECISIONS.ALLOW_LOCAL_SHADOW, ['same-team resolved conflict has source-bound redaction summary'], conflictAtom, true);
}

function expose(decision, reasons, conflictAtom, allowSummary) {
  return {
    decision,
    reasons,
    exposed: allowSummary
      ? {
          pointer: conflictAtom.redaction.pointer,
          summary: conflictAtom.redaction.summary,
          sourceBinding: conflictAtom.sourceBinding,
        }
      : {
          pointer: conflictAtom.redaction?.pointer ?? `conflict-pointer:${conflictAtom.conflictId}`,
          summary: 'Conflict exists, but raw claim and sensitive/team-private details are quarantined.',
        },
  };
}

const leakSentinels = ['private retrieval threshold is 0.41', 'client dataset', 'sealed donor note', 'finance payroll contradiction'];

const cases = [
  {
    id: 'valid-same-team-source-bound-redaction-control',
    expected: DECISIONS.ALLOW_LOCAL_SHADOW,
    input: { conflictAtom: conflict() },
  },
  {
    id: 'private-conflict-discovered-by-agent-a-requested-by-agent-b',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { conflictAtom: conflict({ scope: scopes.PRIVATE_AGENT, ownerAgent: 'agent-a', claim: 'Raw claim says private retrieval threshold is 0.41 for a client dataset.' }), context: { ...baseContext, requesterAgent: 'agent-b' } },
  },
  {
    id: 'team-radar-conflict-requested-by-team-finance',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { conflictAtom: conflict({ scope: scopes.TEAM, ownerTeam: 'radar', claim: 'Raw claim contains finance payroll contradiction.' }), context: { ...baseContext, requesterTeam: 'finance' } },
  },
  {
    id: 'global-claim-contradicted-by-sealed-source',
    expected: DECISIONS.ASK_HUMAN,
    input: { conflictAtom: conflict({ scope: scopes.GLOBAL, contradictedByScope: scopes.SEALED, sensitivity: 'low', claim: 'Raw global claim contradicted by sealed donor note.' }) },
  },
  {
    id: 'sealed-conflict-requested-for-local-fixture',
    expected: DECISIONS.ASK_HUMAN,
    input: { conflictAtom: conflict({ scope: scopes.SEALED, sensitivity: 'sealed', claim: 'Raw claim includes sealed donor note.' }) },
  },
  {
    id: 'unresolved-conflict-pointer-without-resolution',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { conflictAtom: conflict({ status: 'unresolved' }) },
  },
  {
    id: 'same-team-conflict-missing-source-bound-redaction',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { conflictAtom: conflict({ redaction: { mode: 'raw_excerpt', summary: 'Raw claim says private retrieval threshold is 0.41 for a client dataset.', pointer: 'conflict-pointer:C-cross-agent-fixture-001', excludesRawClaim: false } }) },
  },
  {
    id: 'unsafe-action-even-with-valid-redacted-conflict',
    expected: DECISIONS.ASK_HUMAN,
    input: { conflictAtom: conflict(), context: { ...baseContext, action: { verb: 'publish_external_report', riskTier: 'external' } } },
  },
];

const results = cases.map((testCase) => {
  const actual = decide(testCase.input);
  assert.equal(actual.decision, testCase.expected, testCase.id);
  const exposedText = JSON.stringify(actual.exposed);
  const leakedRawClaim = testCase.expected !== DECISIONS.ALLOW_LOCAL_SHADOW && leakSentinels.some((sentinel) => exposedText.includes(sentinel));
  assert.equal(leakedRawClaim, false, `${testCase.id}: denied output leaked raw/sensitive text`);
  return {
    id: testCase.id,
    expected: testCase.expected,
    actual: actual.decision,
    pass: actual.decision === testCase.expected && !leakedRawClaim,
    leakedRawClaim,
    exposedShape: Object.keys(actual.exposed).sort(),
    reasons: actual.reasons,
  };
});

const unsafeAllows = results.filter((r) => r.expected !== DECISIONS.ALLOW_LOCAL_SHADOW && r.actual === DECISIONS.ALLOW_LOCAL_SHADOW).length;
const falseRejectsForValidLocal = results.filter((r) => r.expected === DECISIONS.ALLOW_LOCAL_SHADOW && r.actual !== DECISIONS.ALLOW_LOCAL_SHADOW).length;
const rawClaimLeaks = results.filter((r) => r.leakedRawClaim).length;

const summary = {
  artifact,
  timestamp,
  verdict: results.every((r) => r.pass) && unsafeAllows === 0 && falseRejectsForValidLocal === 0 && rawClaimLeaks === 0 ? 'pass' : 'fail',
  total: results.length,
  passCases: results.filter((r) => r.pass).length,
  unsafeAllows,
  falseRejectsForValidLocal,
  rawClaimLeaks,
  askHumanCases: results.filter((r) => r.actual === DECISIONS.ASK_HUMAN).length,
  fetchAbstainCases: results.filter((r) => r.actual === DECISIONS.FETCH_ABSTAIN).length,
  allowLocalShadowCases: results.filter((r) => r.actual === DECISIONS.ALLOW_LOCAL_SHADOW).length,
  coverage: [
    'valid same-team source-bound redaction allow',
    'private conflict owner mismatch quarantine',
    'wrong-team conflict quarantine',
    'global claim contradicted by sealed/private source asks human',
    'sealed conflict asks human',
    'unresolved conflict fetch-abstain',
    'missing source-bound redaction fetch-abstain',
    'external/non-local action asks human',
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

const markdown = renderMarkdown(output);
await writeFile(path.join(__dirname, `${artifact}.out.json`), `${JSON.stringify(output, null, 2)}\n`);
await writeFile(path.join(__dirname, `${artifact}.md`), markdown);
await mkdir(path.resolve(__dirname, '../../research-package'), { recursive: true });
await writeFile(path.resolve(__dirname, '../../research-package', `${artifact}.md`), markdown);
console.log(JSON.stringify(output, null, 2));
if (summary.verdict !== 'pass') process.exitCode = 1;

function renderMarkdown(output) {
  const rows = output.results.map((r) => `| ${r.id} | ${r.expected} | ${r.actual} | ${r.pass ? 'pass' : 'fail'} | ${r.leakedRawClaim ? 'yes' : 'no'} | ${r.reasons.join('; ')} |`).join('\n');
  return `# ${artifact}\n\nTimestamp: ${timestamp}\n\n## Verdict\n\n${output.summary.verdict}\n\n## Summary\n\n\`\`\`json\n${JSON.stringify(output.summary, null, 2)}\n\`\`\`\n\n## Case results\n\n| Case | Expected | Actual | Pass | Raw leak | Reason |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n\n## Interpretation\n\nCross-agent conflict pointers are only useful if they do not smuggle the raw claim across privacy, team, sealed, or action-risk boundaries. This fixture treats conflict discovery as metadata first: wrong-agent, wrong-team, sealed, unresolved, unredacted, or external-use paths fail closed to fetch-abstain/ask-human with pointer-only exposure. The only allow path is a same-team, low-risk local fixture action with a resolved conflict, explicit source binding, and a redaction summary that excludes the raw claim.\n\n## Boundary\n\nLocal fixture/script/report only. No runtime integration, config changes, permanent memory promotion, external publication/effects, deletion, or L2+ operational use without explicit human approval.\n\n## HandoffReceipt\n\n\`\`\`authority-receipt\nreceiptId: AR-20260506-1749Z-T-synaptic-mesh-cross-agent-conflict-quarantine-fixture-v0\nsourceArtifactId: T-synaptic-mesh-cross-agent-conflict-quarantine-fixture-v0\nsourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-cross-agent-conflict-quarantine-fixture-v0.md\nproducedAt: 2026-05-06T17:49:00Z\nreceiverFreshness: current\nvalidation: node_check_passed_and_fixture_script_passed_8of8_unsafe_allows_0_false_rejects_0_raw_claim_leaks_0\nsafetyResult: local_fixture_script_report_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects\nusabilityResult: covers_cross_agent_private_wrong_team_sealed_global_unresolved_unredacted_conflict_quarantine\nriskTier: low_local\npromotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval\nnextAllowedAction: T-synaptic-mesh-cross-agent-conflict-quarantine-fixture-parity-registration-v0_local_manifest_registration_only\n\`\`\`\n`;
}
