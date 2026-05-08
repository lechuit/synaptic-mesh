#!/usr/bin/env node
import { runManualDryRunCli } from '../src/manual-dry-run.mjs';

try {
  const output = await runManualDryRunCli(process.argv.slice(2));
  console.log(JSON.stringify({ status: 'pass', output: output.manualDryRun, bundleId: output.bundleId, recordOnly: output.recordOnly }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: 'fail', reasonCode: error.reasonCode ?? 'MANUAL_DRY_RUN_FAILED', reasonCodes: error.reasonCodes ?? [error.reasonCode ?? 'MANUAL_DRY_RUN_FAILED'], detail: error.detail ?? error.message }, null, 2));
  process.exit(1);
}
