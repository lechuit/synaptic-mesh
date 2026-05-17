import type { DecisionReason, MemoryProposal } from '../types/index.js';

export type ProposalSafetyOutcome = 'deny' | 'ask_human';

export interface ProposalSafetyFinding {
  readonly outcome: ProposalSafetyOutcome;
  readonly reason: DecisionReason;
}

const SECRET_PATTERNS: readonly RegExp[] = [
  /\bsk-[A-Za-z0-9_-]{3,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
  /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*["']?[^"'\s]{8,}/i,
];

const PERMISSION_BYPASS_PATTERNS: readonly RegExp[] = [
  /\bact(?:uar)?\s+sin\s+pedir\s+permiso\b/,
  /\bsin\s+(?:pedir|requerir)\s+permiso\b/,
  /\bwithout\s+(?:asking|requiring)\s+permission\b/,
  /\bbypass\s+(?:approval|permission|human)\b/,
  /\bignore\s+(?:approval|permission|human)\b/,
  /\bdo\s+not\s+ask\s+(?:for\s+)?permission\b/,
];

const DESTRUCTIVE_EFFECT_PATTERNS: readonly RegExp[] = [
  /\brm\s+-rf\b/,
  /\bdelete\s+(?:the\s+)?(?:repo|repository|database|production)\b/,
  /\bdrop\s+database\b/,
  /\bformat\s+(?:the\s+)?disk\b/,
  /\bborra\s+(?:todo\s+)?(?:el\s+)?repo\b/,
  /\belimina\s+(?:todo\s+)?(?:el\s+)?repo\b/,
];

/**
 * Deterministic proposal safety policy for claims that should not become
 * actionable memory even if a model proposes them.
 *
 * @remarks
 * This is deliberately small and receipt-adjacent: it catches credential-like
 * material, durable permission-bypass policies, and destructive runtime
 * instructions before a MemoryAtom can become actionable. It does not rank,
 * embed, or infer relevance.
 */
export function evaluateProposalSafety(proposal: MemoryProposal): ProposalSafetyFinding | null {
  const claim = proposal.claim;
  const normalizedClaim = normalizeClaim(claim);

  if (matchesAny(claim, SECRET_PATTERNS) || matchesAny(normalizedClaim, SECRET_PATTERNS)) {
    return {
      outcome: 'deny',
      reason: {
        kind: 'promotion_boundary_blocked',
        detail: 'proposal claim contains credential-like material and was not stored',
      },
    };
  }

  if (matchesAny(normalizedClaim, DESTRUCTIVE_EFFECT_PATTERNS)) {
    return {
      outcome: 'deny',
      reason: {
        kind: 'forbidden_effect_present',
        effect: 'destructive_runtime_instruction',
      },
    };
  }

  if (matchesAny(normalizedClaim, PERMISSION_BYPASS_PATTERNS)) {
    return {
      outcome: 'ask_human',
      reason: {
        kind: 'promotion_boundary_blocked',
        detail: 'proposal attempts to weaken receiver-side permission checks',
      },
    };
  }

  return null;
}

function normalizeClaim(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function matchesAny(value: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}
