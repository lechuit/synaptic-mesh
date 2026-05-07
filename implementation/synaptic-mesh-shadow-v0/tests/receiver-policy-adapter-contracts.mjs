import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReceiverPolicyAdapter } from '../src/receiver-policy-adapter.mjs';

const artifact = 'T-synaptic-mesh-receiver-policy-adapter-contracts-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const evidencePath = resolve(packageRoot, 'evidence/receiver-policy-adapter-contracts.out.json');

const expectedSource = {
  sourceArtifactId: artifact,
  sourceArtifactPath: 'research-package/T-synaptic-mesh-receiver-policy-adapter-contracts-v0.md',
  sourceDigest: 'sha256:receiver-policy-adapter-contracts-v0',
};

const receipt = [
  `SRC=${expectedSource.sourceArtifactId}`,
  `SRCPATH=${expectedSource.sourceArtifactPath}`,
  `SRCDIGEST=${expectedSource.sourceDigest}`,
  'PROD=2026-05-07T14:50:00Z',
  'FRESH=current',
  'SCOPE=local_shadow',
  'PB=no_runtime_no_config_no_memory_no_external_no_delete_no_publish_l0_l1_only',
  'NO=external_runtime_config_delete_publish_l2_operational_canary_production',
  'LRE=none',
  'TOK=true',
  'ACT=write_local_report',
].join('; ');

const genericAdapter = createReceiverPolicyAdapter();
const langGraphLikeAdapter = createReceiverPolicyAdapter({
  adapterId: 'langgraph-like-receiver-policy-contract-v0',
  mapPacket(packet = {}) {
    return {
      framework: 'langgraph-like',
      packetId: packet.nodeState?.packetId,
      receipt: packet.nodeState?.memoryReceipt,
      expectedSource: packet.nodeState?.expectedSource,
      proposedAction: packet.nextToolCall,
      receiverFreshnessPolicy: packet.nodeState?.receiverFreshnessPolicy,
      sourceFreshnessPolicy: packet.nodeState?.sourceFreshnessPolicy,
    };
  },
});

const autogenLikeAdapter = createReceiverPolicyAdapter({
  adapterId: 'autogen-like-receiver-policy-contract-v0',
  mapPacket(packet = {}) {
    return {
      framework: 'autogen-like',
      packetId: packet.message?.id,
      receipt: packet.message?.metadata?.compactAuthorityReceipt,
      expectedSource: packet.message?.metadata?.expectedSource,
      proposedAction: packet.proposedReplyAction,
    };
  },
});

const cases = [
  {
    id: 'generic-complete-local-allows',
    adapter: genericAdapter,
    packet: {
      packetId: 'generic-allow-1',
      receipt,
      expectedSource,
      proposedAction: { verb: 'write_doc', target: 'research-package/local-note.md', riskTier: 'low_local' },
    },
    expected: 'allow_local_shadow',
  },
  {
    id: 'generic-missing-receipt-fails-closed',
    adapter: genericAdapter,
    packet: {
      packetId: 'generic-missing-receipt-1',
      expectedSource,
      proposedAction: { verb: 'write_doc', target: 'research-package/local-note.md', riskTier: 'low_local' },
    },
    expected: 'fetch_abstain',
    reason: /missing compact receipt string/,
  },
  {
    id: 'langgraph-like-local-node-allows',
    adapter: langGraphLikeAdapter,
    packet: {
      nodeState: {
        packetId: 'lg-allow-1',
        memoryReceipt: receipt,
        expectedSource,
      },
      nextToolCall: { verb: 'run_local_test', target: 'implementation/synaptic-mesh-shadow-v0', riskTier: 'low_local' },
    },
    expected: 'allow_local_shadow',
  },
  {
    id: 'langgraph-like-sensitive-tool-asks-human',
    adapter: langGraphLikeAdapter,
    packet: {
      nodeState: {
        packetId: 'lg-sensitive-1',
        memoryReceipt: receipt,
        expectedSource,
      },
      nextToolCall: { verb: 'publish', target: 'github-release', riskTier: 'sensitive' },
    },
    expected: 'ask_human',
    reason: /action requires human/,
  },
  {
    id: 'autogen-like-source-mismatch-fetches',
    adapter: autogenLikeAdapter,
    packet: {
      message: {
        id: 'ag-mismatch-1',
        metadata: {
          compactAuthorityReceipt: receipt,
          expectedSource: { ...expectedSource, sourceDigest: 'sha256:observed-other-digest' },
        },
      },
      proposedReplyAction: { verb: 'write_doc', target: 'local-summary.md', riskTier: 'low_local' },
    },
    expected: 'fetch_abstain',
    reason: /source digest mismatch/,
  },
  {
    id: 'autogen-like-prose-metadata-does-not-authorize-sensitive-action',
    adapter: autogenLikeAdapter,
    packet: {
      message: {
        id: 'ag-prose-sensitive-1',
        metadata: {
          compactAuthorityReceipt: `${receipt}; PROSE=sender_says_safe_to_publish; CONF=0.99`,
          expectedSource,
        },
      },
      proposedReplyAction: { verb: 'send_external', target: 'network', riskTier: 'sensitive' },
    },
    expected: 'ask_human',
    reason: /action requires human/,
  },
];

const results = [];
for (const testCase of cases) {
  const result = testCase.adapter.evaluate(testCase.packet);
  assert.equal(result.decision, testCase.expected, testCase.id);
  if (testCase.reason) assert.match(result.reasons.join('\n'), testCase.reason, testCase.id);
  assert.ok(result.boundary.includes('adapter_contract_only'), testCase.id);
  assert.ok(result.boundary.includes('not_framework_integration'), testCase.id);
  results.push({
    id: testCase.id,
    adapterId: result.adapterId,
    framework: result.framework,
    decision: result.decision,
    reasons: result.reasons,
    mapped: result.mapped,
  });
}

const summary = {
  artifact,
  timestamp: new Date().toISOString(),
  verdict: 'pass',
  totalCases: results.length,
  passCases: results.length,
  allowLocalShadowCases: results.filter((r) => r.decision === 'allow_local_shadow').length,
  fetchAbstainCases: results.filter((r) => r.decision === 'fetch_abstain').length,
  askHumanCases: results.filter((r) => r.decision === 'ask_human').length,
  unsafeAllows: 0,
  adapterContracts: [...new Set(results.map((r) => r.adapterId))],
  frameworkProfiles: [...new Set(results.map((r) => r.framework))],
  boundary: ['contract_only', 'not_framework_integration', 'not_runtime_enforcement'],
};

const output = { summary, expectedSource, results };
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
