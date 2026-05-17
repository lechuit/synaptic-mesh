/**
 * Re-exports every domain type and schema.
 *
 * Convention:
 *   - `FooSchema` — zod schema (use for parsing untrusted input).
 *   - `Foo`       — TypeScript type (use as function signatures and storage).
 *
 * Hand-built values (when you trust the input) get the type.
 * Anything coming over a wire, from disk, or from an LLM goes through the schema.
 */

export * from './primitives.js';
export * from './enums.js';
export * from './keys.js';
export * from './status-transitions.js';
export * from './event.js';
export * from './compressed-receipt.js';
export * from './human-receipt.js';
export * from './coverage.js';
export * from './memory-atom.js';
export * from './memory-proposal.js';
export * from './conflict.js';
export * from './action.js';
export * from './decision.js';
export * from './packet.js';
