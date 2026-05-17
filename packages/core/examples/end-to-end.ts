import { describe, expect, it } from 'vitest';
import { openSqliteStores } from '../../store-sqlite/src/index.js';
import {
  type ActionContext,
  type AgentId,
  AletheiaAuthority,
  type Event,
  type EventId,
  type IsoTimestamp,
  type MemoryProposal,
  type Scope,
  type Visibility,
  staticVisibilityPolicy,
} from '../src/index.js';

const NOW = '2026-05-17T12:00:00Z' as IsoTimestamp;
const ACTOR = 'agent-smoke' as AgentId;
const SCOPE: Scope = { kind: 'project', projectId: 'aletheia-smoke' };
const PRIVATE: Visibility = { kind: 'private:user' };
const SEALED: Visibility = { kind: 'sealed:sensitive' };
const PERMITTED = [PRIVATE, SEALED] as const;

interface SmokeReport {
  readonly sealedProposalOutcome: string;
  readonly sealedRecallOutcome: string;
  readonly verifiedProposalOutcome: string;
  readonly verificationOutcome: string;
  readonly verifiedRecallOutcome: string;
  readonly sensitiveActionOutcome: string;
  readonly safeActionOutcome: string;
  readonly boundaryViolations: readonly string[];
}

async function runEndToEndSmoke(): Promise<SmokeReport> {
  const stores = openSqliteStores(':memory:');
  try {
    const authority = new AletheiaAuthority({
      eventLedger: stores.eventLedger,
      memoryStore: stores.memoryStore,
      conflictRegistry: stores.conflictRegistry,
      visibilityPolicy: staticVisibilityPolicy(PERMITTED),
      clock: { now: () => NOW },
    });

    await stores.eventLedger.append(event('evt-sealed' as EventId, SEALED));
    const sealedProposal = await authority.propose(
      proposal('prop-sealed', ['evt-sealed' as EventId], SEALED, 'sensitive'),
    );
    const sealedRecall = await authority.recall({ agentId: ACTOR, scope: SCOPE });

    await stores.eventLedger.append(event('evt-verified' as EventId, PRIVATE));
    const verifiedProposal = await authority.propose(
      proposal('prop-verified', ['evt-verified' as EventId], PRIVATE, 'low_local'),
    );
    if (verifiedProposal.atom === null) throw new Error('verified smoke proposal wrote no atom');
    const verification = await stores.memoryStore.transitionStatus(
      verifiedProposal.atom.memoryId,
      'verified',
      {
        actor: ACTOR,
        rationale: 'smoke: promote candidate to verified test fixture',
      },
    );

    const verifiedRecall = await authority.recall({ agentId: ACTOR, scope: SCOPE });
    const context: ActionContext = {
      agentId: ACTOR,
      scope: SCOPE,
      citedMemoryIds: [verifiedProposal.atom.memoryId],
    };
    const sensitiveAction = await authority.tryAct(
      { classifiedAction: 'external_send', target: 'https://example.invalid' },
      context,
    );
    const safeAction = await authority.tryAct(
      { classifiedAction: 'local_report', target: 'smoke-report' },
      context,
    );

    const report: SmokeReport = {
      sealedProposalOutcome: sealedProposal.decision.outcome,
      sealedRecallOutcome: sealedRecall.decision.outcome,
      verifiedProposalOutcome: verifiedProposal.decision.outcome,
      verificationOutcome: verification.kind,
      verifiedRecallOutcome: verifiedRecall.decision.outcome,
      sensitiveActionOutcome: sensitiveAction.decision.outcome,
      safeActionOutcome: safeAction.decision.outcome,
      boundaryViolations: boundaryViolations({
        sealedProposalOutcome: sealedProposal.decision.outcome,
        sealedRecallOutcome: sealedRecall.decision.outcome,
        verifiedProposalOutcome: verifiedProposal.decision.outcome,
        verificationOutcome: verification.kind,
        verifiedRecallOutcome: verifiedRecall.decision.outcome,
        sensitiveActionOutcome: sensitiveAction.decision.outcome,
        safeActionOutcome: safeAction.decision.outcome,
      }),
    };
    console.info(JSON.stringify(report, null, 2));
    return report;
  } finally {
    stores.close();
  }
}

describe('Aletheia core end-to-end smoke', () => {
  it('guards sealed, verified, sensitive, and safe paths without an LLM', async () => {
    const report = await runEndToEndSmoke();

    expect(report.boundaryViolations).toEqual([]);
    expect(report.sealedProposalOutcome).toBe('ask_human');
    expect(report.sealedRecallOutcome).toBe('fetch_abstain');
    expect(report.verifiedProposalOutcome).toBe('allow_local_shadow');
    expect(report.verificationOutcome).toBe('applied');
    expect(report.verifiedRecallOutcome).toBe('allow_local_shadow');
    expect(report.sensitiveActionOutcome).toBe('ask_human');
    expect(report.safeActionOutcome).toBe('allow_local_shadow');
  });
});

function event(eventId: EventId, visibility: Visibility): Event {
  return {
    eventId,
    kind: 'observation',
    agentId: ACTOR,
    occurredAt: NOW,
    payload: { note: 'smoke fixture source event' },
    scope: SCOPE,
    visibility,
  };
}

function proposal(
  id: string,
  sourceEventIds: readonly EventId[],
  intendedVisibility: Visibility,
  riskLevel: MemoryProposal['riskLevel'],
): MemoryProposal {
  return {
    proposalId: id as MemoryProposal['proposalId'],
    proposedBy: ACTOR,
    proposedAt: NOW,
    candidateType: 'claim',
    claim: `smoke claim ${id}`,
    sourceEventIds: [...sourceEventIds],
    intendedScope: SCOPE,
    intendedVisibility,
    riskLevel,
    knownConflicts: [],
  };
}

function boundaryViolations(outcomes: Omit<SmokeReport, 'boundaryViolations'>): readonly string[] {
  return [
    outcomes.sealedProposalOutcome === 'ask_human' ? null : 'sealed proposal must ask_human',
    outcomes.sealedRecallOutcome === 'fetch_abstain' ? null : 'sealed recall must fetch_abstain',
    outcomes.verifiedProposalOutcome === 'allow_local_shadow'
      ? null
      : 'verified proposal fixture must write locally',
    outcomes.verificationOutcome === 'applied' ? null : 'verification transition must apply',
    outcomes.verifiedRecallOutcome === 'allow_local_shadow'
      ? null
      : 'verified recall must allow local shadow',
    outcomes.sensitiveActionOutcome === 'ask_human' ? null : 'sensitive action must ask_human',
    outcomes.safeActionOutcome === 'allow_local_shadow' ? null : 'safe action must allow',
  ].filter((violation): violation is string => violation !== null);
}
