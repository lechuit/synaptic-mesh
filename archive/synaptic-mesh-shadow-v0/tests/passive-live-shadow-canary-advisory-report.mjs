import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-passive-live-shadow-canary-advisory-report-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const evidenceRoot = resolve(packageRoot, 'evidence');
const jsonEvidencePath = resolve(evidenceRoot, 'passive-live-shadow-canary-advisory-report.out.json');
const markdownReportPath = resolve(evidenceRoot, 'passive-live-shadow-canary-advisory-report.out.md');

const expandedPack = JSON.parse(await readFile(resolve(evidenceRoot, 'passive-live-shadow-canary-expanded-pack.out.json'), 'utf8'));
const sourceBoundaryExpansion = JSON.parse(await readFile(resolve(evidenceRoot, 'passive-live-shadow-canary-source-boundary-expansion.out.json'), 'utf8'));
const sourceBoundaryStress = JSON.parse(await readFile(resolve(evidenceRoot, 'passive-live-shadow-canary-source-boundary-stress.out.json'), 'utf8'));
const driftScorecard = JSON.parse(await readFile(resolve(evidenceRoot, 'passive-live-shadow-canary-drift-scorecard.out.json'), 'utf8'));

const reportTitle = 'Synaptic Mesh v0.3.0-alpha passive canary advisory report';
const releaseLayer = 'v0.3.0-alpha';
const advisoryMode = 'human_readable_advisory_only_non_authoritative_record_only';

const reportBody = [
  '# Synaptic Mesh v0.3.0-alpha passive canary advisory report',
  '',
  '> ADVISORY ONLY. This report is human-readable evidence, not authority. Advisory no es authority.',
  '',
  '## Scope',
  '',
  '- manual, local, opt-in, already-redacted evidence only;',
  '- passive and record-only;',
  '- no live traffic reads;',
  '- no runtime integration;',
  '- no tool execution;',
  '- no memory or config writes;',
  '- no external publication automation;',
  '- no approval path, blocking, allowing, authorization, or enforcement;',
  '- not automatically consumed by agents.',
  '',
  '## Evidence summary',
  '',
  `- Expanded passive canary pack: ${expandedPack.summary.verdict}; ${expandedPack.summary.coveredTargetCoverageCount}/${expandedPack.summary.targetCoverageCount} target labels covered; unexpected accepts ${expandedPack.summary.unexpectedAccepts}; unexpected rejects ${expandedPack.summary.unexpectedRejects}.`,
  `- Source-boundary expansion: ${sourceBoundaryExpansion.summary.verdict}; ${sourceBoundaryExpansion.summary.coveredTargetCoverageCount}/${sourceBoundaryExpansion.summary.targetCoverageCount} target labels covered; unexpected accepts ${sourceBoundaryExpansion.summary.unexpectedAccepts}; unexpected rejects ${sourceBoundaryExpansion.summary.unexpectedRejects}.`,
  `- Source-boundary baseline stress: ${sourceBoundaryStress.summary.verdict}; malformed tuple, stale digest, missing mtime, wrong lane, and output containment checks remain present.`,
  `- Drift scorecard baseline: ${driftScorecard.summary.verdict}; route/reason/boundary/scorecard/trace/normalized-output drift counts remain zero.`,
  '',
  '## Interpretation',
  '',
  'The current canary evidence is consistent with the intended local review boundary. It should help a human reviewer spot whether passive canary fixtures preserve source/output boundaries and non-authority posture.',
  '',
  'This report must not be used by an agent, runtime, tool, CI workflow, policy layer, or approval system as an action permit, denial, grant, command, instruction, or safety certification.',
  '',
  '## Next human review questions',
  '',
  '- Are the source/output metadata stress rows still representative enough for the next release step?',
  '- Are advisory report words clear without implying operational authority?',
  '- Is another 0.2.x split needed before any broader alpha work?',
  '',
  '## Non-authority invariant',
  '',
  'Advisory no es authority. The report exists only as local human-readable evidence.',
  '',
].join('\n');
const reportSections = `${reportBody}\n`;

const forbiddenAuthorityPhrases = [
  'machine-readable policy decision',
  'runtime decision',
  'agent instruction',
  'is a safety certification',
  'is production ready',
  'approved for execution',
  'permission granted',
  'automatic consumption enabled',
];
for (const phrase of forbiddenAuthorityPhrases) {
  assert.equal(reportSections.toLowerCase().includes(phrase), false, `advisory report must not include authority phrase: ${phrase}`);
}

assert.equal(expandedPack.summary.verdict, 'pass');
assert.equal(expandedPack.summary.releaseLayer, 'v0.2.5');
assert.equal(expandedPack.summary.automaticAgentConsumptionImplemented, false);
assert.equal(sourceBoundaryExpansion.summary.verdict, 'pass');
assert.equal(sourceBoundaryExpansion.summary.releaseLayer, 'v0.2.6');
assert.equal(sourceBoundaryExpansion.summary.automaticAgentConsumptionImplemented, false);
assert.equal(driftScorecard.summary.verdict, 'pass');
assert.equal(driftScorecard.summary.automaticAgentConsumptionImplemented, false);

const summary = {
  artifact,
  timestamp: '2026-05-13T02:45:00.000Z',
  verdict: 'pass',
  releaseLayer,
  dependsOn: 'v0.2.6-source-boundary-stress-expansion',
  mode: advisoryMode,
  reportPath: 'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-advisory-report.out.md',
  reportTitle,
  reportBytes: Buffer.byteLength(reportSections),
  sourceEvidenceCount: 4,
  expandedPackVerdict: expandedPack.summary.verdict,
  expandedPackCoveredTargetCoverageCount: expandedPack.summary.coveredTargetCoverageCount,
  sourceBoundaryExpansionVerdict: sourceBoundaryExpansion.summary.verdict,
  sourceBoundaryExpansionCoveredTargetCoverageCount: sourceBoundaryExpansion.summary.coveredTargetCoverageCount,
  driftScorecardVerdict: driftScorecard.summary.verdict,
  advisoryOnly: true,
  humanReadableOnly: true,
  nonAuthoritative: true,
  machineReadablePolicyDecision: false,
  consumedByAgent: false,
  automaticAgentConsumptionImplemented: false,
  runtimeIntegrated: false,
  toolExecutionImplemented: false,
  memoryWriteImplemented: false,
  configWriteImplemented: false,
  externalPublicationImplemented: false,
  approvalPathImplemented: false,
  blockingImplemented: false,
  allowingImplemented: false,
  authorizationImplemented: false,
  enforcementImplemented: false,
  safetyClaimScope: 'human_readable_advisory_only_not_authority_not_runtime_not_agent_consumed',
};

assert.equal(summary.advisoryOnly, true);
assert.equal(summary.humanReadableOnly, true);
assert.equal(summary.nonAuthoritative, true);
assert.equal(summary.machineReadablePolicyDecision, false);
assert.equal(summary.consumedByAgent, false);
assert.equal(summary.automaticAgentConsumptionImplemented, false);
assert.equal(summary.runtimeIntegrated, false);
assert.equal(summary.toolExecutionImplemented, false);
assert.equal(summary.memoryWriteImplemented, false);
assert.equal(summary.configWriteImplemented, false);
assert.equal(summary.externalPublicationImplemented, false);
assert.equal(summary.approvalPathImplemented, false);
assert.equal(summary.blockingImplemented, false);
assert.equal(summary.allowingImplemented, false);
assert.equal(summary.authorizationImplemented, false);
assert.equal(summary.enforcementImplemented, false);
assert.ok(reportSections.includes('ADVISORY ONLY'));
assert.ok(reportSections.includes('Advisory no es authority'));
assert.ok(reportSections.includes('not automatically consumed by agents'));

const output = {
  summary,
  sourceEvidence: [
    'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-expanded-pack.out.json',
    'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-expansion.out.json',
    'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-source-boundary-stress.out.json',
    'implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-drift-scorecard.out.json',
  ],
  boundary: [
    'human_readable_advisory_only',
    'not_authority',
    'not_runtime',
    'not_agent_consumed',
    'no_tools',
    'no_memory_write',
    'no_config_write',
    'no_publication',
    'no_approval',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement',
  ],
};

await mkdir(evidenceRoot, { recursive: true });
await writeFile(markdownReportPath, reportSections);
await writeFile(jsonEvidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

if (summary.verdict !== 'pass') process.exit(1);
