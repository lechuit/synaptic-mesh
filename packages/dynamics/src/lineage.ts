import type { MemoryAtom, MemoryId, MemoryStore, Visibility } from '@aletheia/core';

export type LineageTraceOutcome = 'ok' | 'fetch_abstain';
export type LineageTraceReason =
  | 'cycle_detected'
  | 'max_depth_exceeded'
  | 'memory_missing_or_invisible';

export interface LineageTraceInput {
  readonly memoryId: MemoryId;
  readonly permittedVisibilities: readonly Visibility[];
  readonly maxDepth?: number;
}

export interface LineageTraceResult {
  readonly outcome: LineageTraceOutcome;
  readonly reasons: readonly LineageTraceReason[];
  readonly atoms: readonly MemoryAtom[];
}

export interface LineageTracerOptions {
  readonly memoryStore: MemoryStore;
}

export class LineageTracer {
  /**
   * Create a permission-guarded lineage tracer over a memory store.
   *
   * @remarks
   * The tracer reads only through `MemoryStore.get()`, so invisible ancestors
   * are treated the same as missing ancestors. It reconstructs `supersedes`
   * chains without mutating atoms or status history.
   */
  constructor(private readonly options: LineageTracerOptions) {}

  /**
   * Trace from a successor atom backwards through `supersedes` links.
   *
   * @returns Atoms in newest-to-oldest order when every ancestor is visible.
   */
  async traceBack(input: LineageTraceInput): Promise<LineageTraceResult> {
    const maxDepth = input.maxDepth ?? 128;
    const atoms: MemoryAtom[] = [];
    const visited = new Set<MemoryId>();
    let currentId: MemoryId | null = input.memoryId;

    while (currentId !== null) {
      if (atoms.length >= maxDepth) {
        return { outcome: 'fetch_abstain', reasons: ['max_depth_exceeded'], atoms };
      }
      if (visited.has(currentId)) {
        return { outcome: 'fetch_abstain', reasons: ['cycle_detected'], atoms };
      }
      visited.add(currentId);

      const atom = await this.options.memoryStore.get(currentId, input.permittedVisibilities);
      if (atom === null) {
        return { outcome: 'fetch_abstain', reasons: ['memory_missing_or_invisible'], atoms };
      }
      atoms.push(atom);
      currentId = supersededMemoryId(atom);
    }

    return { outcome: 'ok', reasons: [], atoms };
  }
}

function supersededMemoryId(atom: MemoryAtom): MemoryId | null {
  return atom.links.find((link) => link.relation === 'supersedes')?.targetMemoryId ?? null;
}
