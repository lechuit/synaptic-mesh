/**
 * Canonical string keys for Scope and Visibility.
 *
 * Any storage backend needs a single-string representation of these
 * discriminated unions for indexing and permission filtering. Defining the
 * canonical form once in `core` guarantees every backend agrees on it.
 *
 * Format is irreversible-by-design: a parser is provided, but storage layers
 * should keep the original JSON alongside the key so the round-trip is exact.
 */

import type { Scope, Visibility } from './enums.js';

/**
 * Visibility → string key.
 *   private:agent      → "private:agent"
 *   private:user       → "private:user"
 *   team               → "team:<name>"
 *   global:safe        → "global:safe"
 *   sealed:sensitive   → "sealed:sensitive"
 *   ephemeral          → "ephemeral"
 */
export function visibilityKey(v: Visibility): string {
  switch (v.kind) {
    case 'private:agent':
    case 'private:user':
    case 'global:safe':
    case 'sealed:sensitive':
    case 'ephemeral':
      return v.kind;
    case 'team':
      return `team:${v.name}`;
  }
}

/**
 * Scope → string key.
 *   local      → "local"
 *   project    → "project:<projectId>"
 *   user       → "user:<userId>"
 *   team       → "team:<teamId>"
 *   global     → "global"
 */
export function scopeKey(s: Scope): string {
  switch (s.kind) {
    case 'local':
    case 'global':
      return s.kind;
    case 'project':
      return `project:${s.projectId}`;
    case 'user':
      return `user:${s.userId}`;
    case 'team':
      return `team:${s.teamId}`;
  }
}
