import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifact = 'T-synaptic-mesh-source-spoofing-nested-handoff-fixture-v0';
const timestamp = '2026-05-06T17:52:00Z';

const DECISIONS = Object.freeze({
  ALLOW_LOCAL_SHADOW: 'allow_local_shadow',
  FETCH_ABSTAIN: 'fetch_abstain',
  ASK_HUMAN: 'ask_human',
});

const knownSources = new Map([
  ['T-synaptic-mesh-fixture-parity-harness-v0', {
    sourceArtifactId: 'T-synaptic-mesh-fixture-parity-harness-v0',
    sourceArtifactPath: 'research-package/T-synaptic-mesh-fixture-parity-harness-v0.md',
    registryDigest: 'sha256:fixture-parity-12of12-nodecheck0-missing0-gate0-nonreg-unsafe0',
    freshness: 'current',
    allowedNextAction: artifact,
  }],
]);

const localAction = { verb: 'create_local_fixture', target: artifact, riskTier: 'low_local' };
const sensitiveAction = { verb: 'promote_memory', target: 'MEMORY.md', riskTier: 'sensitive' };

function baseReceipt(overrides = {}) {
  return {
    sourceArtifactId: 'T-synaptic-mesh-fixture-parity-harness-v0',
    sourceArtifactPath: 'research-package/T-synaptic-mesh-fixture-parity-harness-v0.md',
    producedAt: timestamp,
    receiverFreshness: 'current',
    registryDigest: 'sha256:fixture-parity-12of12-nodecheck0-missing0-gate0-nonreg-unsafe0',
    effectBoundary: 'local_only_no_runtime_no_external_no_delete',
    promotionBoundary: 'L0_L1_only_L2plus_requires_human_approval_no_memory_write',
    lineage: 'successor_of_T-synaptic-mesh-fixture-parity-harness-v0',
    nextAllowedAction: `${artifact}_local_fixture_only`,
    ...overrides,
  };
}

function decide({ action = localAction, receipt = baseReceipt(), nestedHandoff = null }) {
  const reasons = [];

  if (!['create_local_fixture', 'run_local_test', 'write_doc', 'prepare_draft'].includes(action.verb) || action.riskTier === 'sensitive') {
    return { decision: DECISIONS.ASK_HUMAN, reasons: [`sensitive or unknown action: ${action.verb}`] };
  }

  const known = knownSources.get(receipt.sourceArtifactId);
  if (!known) reasons.push(`unknown sourceArtifactId: ${receipt.sourceArtifactId}`);
  if (known && receipt.sourceArtifactPath !== known.sourceArtifactPath) reasons.push('source path mismatch for known sourceArtifactId');
  if (known && receipt.registryDigest !== known.registryDigest) reasons.push('registryDigest mismatch for known sourceArtifactId/path');
  if (receipt.receiverFreshness !== 'current') reasons.push(`receiverFreshness is ${receipt.receiverFreshness}`);
  if (!String(receipt.effectBoundary ?? '').includes('local') || !String(receipt.effectBoundary ?? '').includes('no_runtime')) reasons.push('effectBoundary is not local/no_runtime bound');
  if (!String(receipt.promotionBoundary ?? '').includes('human') || !String(receipt.promotionBoundary ?? '').includes('no_memory')) reasons.push('promotionBoundary is not restrictive enough');

  if (nestedHandoff) {
    if (nestedHandoff.claimsInheritedAuthority !== true) reasons.push('nested handoff does not explicitly claim authority state');
    if (!nestedHandoff.parentSourceArtifactPath || !nestedHandoff.parentRegistryDigest) reasons.push('nested handoff lacks bound parent path/digest');
    if (nestedHandoff.parentSourceArtifactPath && known && nestedHandoff.parentSourceArtifactPath !== known.sourceArtifactPath) reasons.push('nested parent path mismatch');
    if (nestedHandoff.parentRegistryDigest && known && nestedHandoff.parentRegistryDigest !== known.registryDigest) reasons.push('nested parent digest mismatch');
    if (nestedHandoff.inheritedFreshness !== 'current') reasons.push(`nested inherited freshness is ${nestedHandoff.inheritedFreshness ?? 'missing'}`);
  }

  if (reasons.length) return { decision: DECISIONS.FETCH_ABSTAIN, reasons };
  return { decision: DECISIONS.ALLOW_LOCAL_SHADOW, reasons: ['known current source path/digest and local-only boundary validated'] };
}

const cases = [
  {
    id: 'valid-known-current-local-control',
    expected: DECISIONS.ALLOW_LOCAL_SHADOW,
    input: { receipt: baseReceipt() },
  },
  {
    id: 'source-alias-collision-similar-id',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { receipt: baseReceipt({ sourceArtifactId: 'T-synaptic-mesh-fixture-parity-hamess-v0' }) },
  },
  {
    id: 'known-label-wrong-path',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { receipt: baseReceipt({ sourceArtifactPath: 'research-package/T-synaptic-mesh-fixture-parity-harness-vO.md' }) },
  },
  {
    id: 'known-label-wrong-digest',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { receipt: baseReceipt({ registryDigest: 'sha256:fixture-parity-12of12-nodecheck0-missing0-gate0-nonreg-unsafeO' }) },
  },
  {
    id: 'nested-handoff-unbound-parent',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { receipt: baseReceipt(), nestedHandoff: { claimsInheritedAuthority: true, inheritedFreshness: 'current' } },
  },
  {
    id: 'nested-handoff-wrong-parent-digest',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { receipt: baseReceipt(), nestedHandoff: { claimsInheritedAuthority: true, inheritedFreshness: 'current', parentSourceArtifactPath: 'research-package/T-synaptic-mesh-fixture-parity-harness-v0.md', parentRegistryDigest: 'sha256:wrong' } },
  },
  {
    id: 'nested-handoff-stale-inherited-receipt',
    expected: DECISIONS.FETCH_ABSTAIN,
    input: { receipt: baseReceipt(), nestedHandoff: { claimsInheritedAuthority: true, inheritedFreshness: 'stale', parentSourceArtifactPath: 'research-package/T-synaptic-mesh-fixture-parity-harness-v0.md', parentRegistryDigest: 'sha256:fixture-parity-12of12-nodecheck0-missing0-gate0-nonreg-unsafe0' } },
  },
  {
    id: 'sensitive-action-known-source-still-human',
    expected: DECISIONS.ASK_HUMAN,
    input: { action: sensitiveAction, receipt: baseReceipt() },
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
const askHumanCases = results.filter((r) => r.actual === DECISIONS.ASK_HUMAN).length;
const fetchAbstainCases = results.filter((r) => r.actual === DECISIONS.FETCH_ABSTAIN).length;

const summary = {
  artifact,
  timestamp,
  verdict: results.every((r) => r.pass) && unsafeAllows === 0 && falseRejectsForValidLocal === 0 ? 'pass' : 'fail',
  total: results.length,
  passCases: results.filter((r) => r.pass).length,
  unsafeAllows,
  falseRejectsForValidLocal,
  askHumanCases,
  fetchAbstainCases,
  allowLocalShadowCases: results.filter((r) => r.actual === DECISIONS.ALLOW_LOCAL_SHADOW).length,
  coverage: [
    'similar source IDs / alias collisions',
    'wrong path under known-looking source label',
    'wrong digest under known-looking source label',
    'nested handoff without bound parent path/digest',
    'nested handoff parent digest mismatch',
    'stale inherited receipt',
    'sensitive action asks human even with known source',
    'valid known/current/local source control',
  ],
};

const output = {
  summary,
  knownSources: Array.from(knownSources.values()),
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
  return `# ${artifact}\n\nTimestamp: ${timestamp}\n\n## Verdict\n\n${output.summary.verdict}\n\n## Summary\n\n\`\`\`json\n${JSON.stringify(output.summary, null, 2)}\n\`\`\`\n\n## Case results\n\n| Case | Expected | Actual | Pass | Reason |\n| --- | --- | --- | --- | --- |\n${rows}\n\n## Interpretation\n\nSource labels are not authority. The local shadow gate only allows the valid control where sourceArtifactId, sourceArtifactPath, registryDigest, freshness, and local-only boundaries agree. Alias collisions, known-label path/digest drift, unbound nested handoffs, stale inherited authority, and sensitive actions fail closed by fetch-abstain or ask-human.\n\n## Boundary\n\nLocal fixture/script/report only. No runtime integration, config changes, permanent memory promotion, external publication/effects, deletion, or L2+ operational use without explicit human approval.\n`;
}
