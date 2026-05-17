/**
 * Small facade over the Phase 1.5 runtime components.
 *
 * Hosts can wire the components individually, or use this class when they want
 * the roadmap-shaped API: propose(), recall(), tryAct().
 */

import type { ActionContext, MemoryProposal, ProposedAction, RecallQuery } from '../types/index.js';
import {
  type ActionAuthorizationResult,
  ActionAuthorizer,
  type ActionAuthorizerOptions,
} from './action-authorizer.js';
import type { Clock } from './decision-helpers.js';
import {
  type RetrievalResult,
  RetrievalRouter,
  type RetrievalRouterOptions,
} from './retrieval-router.js';
import type { VisibilityPolicy } from './visibility-policy.js';
import {
  WriteGate,
  type WriteGateOptions,
  type WriteGateResult,
  type WriteGateStores,
} from './write-gate.js';

export interface AletheiaAuthorityOptions extends WriteGateStores {
  readonly visibilityPolicy?: VisibilityPolicy;
  readonly clock?: Clock;
  readonly memoryIdForProposal?: WriteGateOptions['memoryIdForProposal'];
  readonly topicMatcher?: RetrievalRouterOptions['topicMatcher'];
}

export class AletheiaAuthority {
  readonly writeGate: WriteGate;
  readonly retrievalRouter: RetrievalRouter;
  readonly actionAuthorizer: ActionAuthorizer;

  constructor(options: AletheiaAuthorityOptions) {
    this.writeGate = new WriteGate({
      eventLedger: options.eventLedger,
      memoryStore: options.memoryStore,
      conflictRegistry: options.conflictRegistry,
      ...(options.visibilityPolicy !== undefined
        ? { visibilityPolicy: options.visibilityPolicy }
        : {}),
      ...(options.clock !== undefined ? { clock: options.clock } : {}),
      ...(options.memoryIdForProposal !== undefined
        ? { memoryIdForProposal: options.memoryIdForProposal }
        : {}),
    });

    const sharedRouterOptions: RetrievalRouterOptions = {
      memoryStore: options.memoryStore,
      conflictRegistry: options.conflictRegistry,
      ...(options.visibilityPolicy !== undefined
        ? { visibilityPolicy: options.visibilityPolicy }
        : {}),
      ...(options.clock !== undefined ? { clock: options.clock } : {}),
      ...(options.topicMatcher !== undefined ? { topicMatcher: options.topicMatcher } : {}),
    };
    this.retrievalRouter = new RetrievalRouter(sharedRouterOptions);

    const actionOptions: ActionAuthorizerOptions = {
      memoryStore: options.memoryStore,
      conflictRegistry: options.conflictRegistry,
      ...(options.visibilityPolicy !== undefined
        ? { visibilityPolicy: options.visibilityPolicy }
        : {}),
      ...(options.clock !== undefined ? { clock: options.clock } : {}),
    };
    this.actionAuthorizer = new ActionAuthorizer(actionOptions);
  }

  propose(proposal: MemoryProposal): Promise<WriteGateResult> {
    return this.writeGate.propose(proposal);
  }

  recall(query: RecallQuery): Promise<RetrievalResult> {
    return this.retrievalRouter.recall(query);
  }

  tryAct(action: ProposedAction, context: ActionContext): Promise<ActionAuthorizationResult> {
    return this.actionAuthorizer.tryAct(action, context);
  }
}
