import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

export const BATCH_MODE = 'manual_explicit_redacted_file_list';
export const BATCH_SCHEMA_VERSION = 'read-only-local-file-batch-manifest-v0';
const FORBIDDEN_TRUE_FIELDS = ['directoryDiscovery','globAllowed','watcherAllowed','daemonAllowed','networkAllowed','liveTrafficAllowed'];
const sourcePathPattern = new RegExp('^(?!/)(?!.*(?:^|/)\\.\\.(?:/|$))(?!.*[*?\\[\\]{}])(?!(?:[a-zA-Z][a-zA-Z0-9+.-]*:|//))[A-Za-z0-9_./-]+\\.json$');

export function validateBatchManifest(manifest = {}) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return { ok:false, errors:['manifest must be object'] };
  const allowed = new Set(['schemaVersion','batchMode','explicitInputListOnly','directoryDiscovery','globAllowed','watcherAllowed','daemonAllowed','networkAllowed','liveTrafficAllowed','recordOnly','maxInputCount','inputs']);
  for (const k of Object.keys(manifest)) if (!allowed.has(k)) errors.push(`additional property ${k}`);
  if (manifest.schemaVersion !== BATCH_SCHEMA_VERSION) errors.push('schemaVersion mismatch');
  if (manifest.batchMode !== BATCH_MODE) errors.push('batchMode mismatch');
  if (manifest.explicitInputListOnly !== true) errors.push('explicitInputListOnly must be true');
  if (manifest.recordOnly !== true) errors.push('recordOnly must be true');
  for (const f of FORBIDDEN_TRUE_FIELDS) if (manifest[f] !== false) errors.push(`${f} must be false`);
  if (!Number.isInteger(manifest.maxInputCount) || manifest.maxInputCount < 1 || manifest.maxInputCount > 5) errors.push('maxInputCount must be integer 1..5');
  if (!Array.isArray(manifest.inputs)) errors.push('inputs must be array');
  const inputs = Array.isArray(manifest.inputs) ? manifest.inputs : [];
  if (inputs.length < 1 || inputs.length > 5) errors.push('inputs length must be 1..5');
  if (Number.isInteger(manifest.maxInputCount) && inputs.length > manifest.maxInputCount) errors.push('inputs length exceeds maxInputCount');
  const seen = new Set();
  inputs.forEach((item, i) => {
    const inputAllowed = new Set(['sourceFilePath','sourceArtifactDigest','sourceAlreadyRedacted','redactionReviewRecordId']);
    if (!item || typeof item !== 'object' || Array.isArray(item)) { errors.push(`inputs[${i}] must be object`); return; }
    for (const k of Object.keys(item)) if (!inputAllowed.has(k)) errors.push(`inputs[${i}].${k} additional property`);
    if (!sourcePathPattern.test(item.sourceFilePath ?? '')) errors.push(`inputs[${i}].sourceFilePath pattern mismatch`);
    if (!/^sha256:[a-f0-9]{64}$/.test(item.sourceArtifactDigest ?? '')) errors.push(`inputs[${i}].sourceArtifactDigest pattern mismatch`);
    if (item.sourceAlreadyRedacted !== true) errors.push(`inputs[${i}].sourceAlreadyRedacted must be true`);
    if (typeof item.redactionReviewRecordId !== 'string' || item.redactionReviewRecordId.length < 1) errors.push(`inputs[${i}].redactionReviewRecordId too short`);
    if (seen.has(item.sourceFilePath)) errors.push(`inputs[${i}].sourceFilePath duplicate`);
    seen.add(item.sourceFilePath);
  });
  return { ok: errors.length === 0, errors, inputCount: inputs.length };
}

export async function runReadOnlyLocalFileBatchAdapter(manifest = {}, options = {}) {
  const repoRoot = resolve(options.repoRoot ?? process.cwd());
  const validation = validateBatchManifest(manifest);
  if (!validation.ok) return rejectBatch(validation.errors);
  const rows = [];
  for (const [index, input] of manifest.inputs.entries()) {
    const sourcePath = resolve(repoRoot, input.sourceFilePath);
    const containment = await validateContainment(sourcePath, repoRoot);
    if (!containment.ok) return rejectBatch(containment.errors, rows);
    const bytes = await readFile(sourcePath);
    const digest = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
    if (digest !== input.sourceArtifactDigest) return rejectBatch([`inputs[${index}].sourceArtifactDigest mismatch`], rows);
    rows.push({ index, sourceFilePath: input.sourceFilePath, sourceArtifactDigest: digest, redactionReviewRecordId: input.redactionReviewRecordId, sourceFileRead: true, sourceAlreadyRedacted: true, recordOnly: true, selectedRoute: 'shadow_only', notAuthority: true });
  }
  return { ok:true, batchResult:{ inputCount: manifest.inputs.length, sourceFilesRead: rows.length, recordOnly:true, adapterDecidesAuthority:false, machineReadablePolicyDecision:false, agentConsumed:false, mayBlock:false, mayAllow:false, authorization:false, enforcement:false, toolExecution:false, memoryWrite:false, configWrite:false, externalPublication:false, approvalEmission:false }, rows, boundary: boundary() };
}
function rejectBatch(errors, rows=[]) { return { ok:false, errors, rows, batchResult:{ sourceFilesRead: rows.length, recordOnly:true, adapterDecidesAuthority:false, machineReadablePolicyDecision:false, agentConsumed:false, mayBlock:false, mayAllow:false, authorization:false, enforcement:false, toolExecution:false, memoryWrite:false, configWrite:false, externalPublication:false, approvalEmission:false }, boundary: boundary() }; }
async function validateContainment(sourcePath, repoRoot) {
  const stat = await lstat(sourcePath).catch(() => null);
  if (!stat) return { ok:false, errors:['source file not found'] };
  const errors = [];
  if (!stat.isFile()) errors.push('source path must be a regular file');
  if (stat.isSymbolicLink()) errors.push('source path must not be a symlink');
  const rootReal = await realpath(repoRoot).catch(() => null);
  const sourceReal = await realpath(sourcePath).catch(() => null);
  if (!rootReal || !sourceReal) errors.push('source path realpath resolution failed');
  if (rootReal && sourceReal) {
    const rel = relative(rootReal, sourceReal);
    if (rel.startsWith('..') || rel === '') errors.push('source file must stay inside repo root and not be repo root');
  }
  return { ok:errors.length===0, errors };
}
function boundary(){ return ['manual_invocation_only','explicit_local_file_list_only','already_redacted_sources_only','max_input_count_5','record_only','no_directory_discovery','no_glob','no_watcher','no_daemon','no_network','no_live_traffic','no_runtime_authorization','no_tool_execution','no_memory_write','no_config_write','no_external_publication','no_agent_consumption','no_blocking','no_allowing','no_authorization','no_enforcement']; }
