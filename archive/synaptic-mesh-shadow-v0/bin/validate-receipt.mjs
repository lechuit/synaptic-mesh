#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help || (!args.receipt && !args.file)) {
  printHelp();
  process.exit(args.help ? 0 : 2);
}

const receipt = args.file ? readFileSync(args.file, 'utf8') : args.receipt;
const expectedSource = {
  sourceArtifactId: args['source-id'],
  sourceArtifactPath: args['source-path'],
  sourceDigest: args['source-digest'],
};
const proposedAction = {
  verb: args['action-verb'] ?? 'run_local_test',
  riskTier: args['risk-tier'],
};

const receiverFreshnessPolicy = buildReceiverFreshnessPolicy(args);
const sourceFreshnessPolicy = buildSourceFreshnessPolicy(args);

const result = validateCompactReceiptForAction(receipt, { expectedSource, proposedAction, receiverFreshnessPolicy, sourceFreshnessPolicy });
const output = {
  ok: result.decision === 'allow_local_shadow',
  decision: result.decision,
  reasons: result.reasons,
  authority: result.authority,
  metadata: result.metadata,
  boundary: [
    'local_shadow_only',
    'no_runtime_integration',
    'no_config_changes',
    'no_publication',
    'no_external_effects',
    'no_permanent_memory',
  ],
};

console.log(JSON.stringify(output, null, 2));
process.exit(result.decision === 'allow_local_shadow' ? 0 : 1);

function parseArgs(argv) {
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') {
      out.help = true;
      continue;
    }
    if (!token.startsWith('--')) throw new Error(`unexpected positional argument: ${token}`);
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else {
      out[key] = next;
      index += 1;
    }
  }
  return out;
}

function buildReceiverFreshnessPolicy(args) {
  if (!args['receiver-now'] && !args['max-age-ms'] && !args['future-skew-ms']) return undefined;
  return {
    receiverNow: args['receiver-now'],
    maxAgeMs: args['max-age-ms'],
    allowedFutureSkewMs: args['future-skew-ms'] ?? 0,
  };
}

function buildSourceFreshnessPolicy(args) {
  if (!args['source-policy-profile'] && !args['source-mtime'] && !args['source-run-id'] && !args['current-run-id'] && !args['observed-source-digest'] && !args['max-source-age-ms']) return undefined;
  return {
    profile: args['source-policy-profile'],
    receiverNow: args['receiver-now'],
    maxSourceAgeMs: args['max-source-age-ms'],
    allowedFutureSkewMs: args['future-skew-ms'] ?? 0,
    sourceMtime: args['source-mtime'],
    sourceRunId: args['source-run-id'],
    currentRunId: args['current-run-id'],
    observedSourceDigest: args['observed-source-digest'],
  };
}

function printHelp() {
  console.log(`Synaptic Mesh local compact receipt validator\n\nUsage:\n  node bin/validate-receipt.mjs --receipt '<SRC=...; ...>' [options]\n  node bin/validate-receipt.mjs --file receipt.txt [options]\n\nOptions:\n  --source-id ID       Expected source artifact id\n  --source-path PATH   Expected source path\n  --source-digest DIG  Expected source digest\n  --action-verb VERB   Proposed local action verb; default run_local_test\n  --risk-tier TIER     Optional action risk tier\n  --receiver-now ISO   Optional receiver clock timestamp for freshness policy\n  --max-age-ms N       Optional maximum accepted PROD age in milliseconds\n  --future-skew-ms N   Optional accepted future clock skew in milliseconds\n  --max-source-age-ms N Optional maximum accepted source artifact age in milliseconds\n  --source-mtime ISO   Receiver-observed source artifact mtime\n  --source-run-id ID   Receiver-observed source run id\n  --current-run-id ID  Receiver current run id for source comparison\n  --observed-source-digest DIG Receiver-observed source digest\n  --source-policy-profile PROFILE Source evidence profile: strict (default) or diagnostic_optional\n\nExit codes:\n  0 allow_local_shadow\n  1 fetch_abstain or ask_human\n  2 usage error\n\nBoundary: local shadow validator only; not runtime, not config, not publication, not an enforcement layer.`);
}
