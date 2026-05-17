/**
 * @aletheia-labs/core
 *
 * Memory as governance for LLM agents.
 *
 * Phase 1.5 — domain types, storage interfaces, WriteGate, RetrievalRouter,
 * ActionAuthorizer, and AletheiaAuthority are live.
 *
 * Design maxim:
 *   "Do not build a memory that remembers more.
 *    Build a memory that knows when to distrust itself."
 */

export const PACKAGE_NAME = '@aletheia-labs/core';
export const PACKAGE_VERSION = '0.1.1';

// Domain types and schemas — the public protocol surface.
export * from './types/index.js';

// Storage interfaces — implementations live in adapter packages.
export * from './storage/index.js';

// Runtime governance components — host applications provide stores + policy.
export * from './runtime/index.js';
