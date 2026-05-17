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
  readonly authorityScorer?: RetrievalRouterOptions['authorityScorer'];
}

export class AletheiaAuthority {
  /** Lower-level proposal gate, exposed for hosts that need detailed write control. */
  readonly writeGate: WriteGate;
  /** Lower-level recall router, exposed for hosts that compose retrieval manually. */
  readonly retrievalRouter: RetrievalRouter;
  /** Lower-level action guard, exposed for hosts that build their own facade. */
  readonly actionAuthorizer: ActionAuthorizer;

  /**
   * Create the high-level authority facade from host-provided stores and policy.
   *
   * @remarks
   * This is the composition root for most consumers. The facade does not own
   * storage, authentication, provider clients, or background work; it wires the
   * three runtime use cases over the supplied ports.
   */
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
      ...(options.authorityScorer !== undefined
        ? { authorityScorer: options.authorityScorer }
        : {}),
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

  /**
   * Submit a memory proposal to the WriteGate.
   *
   * @remarks
   * Use this after a host or adapter has already recorded the source event(s).
   * The method validates proposal shape, source existence, visibility, scope,
   * and conflict boundaries before inserting an atom. It never promotes beyond
   * candidate authority by itself.
   *
   * @returns A structured write decision plus the inserted atom when one was
   * recorded.
   */
  propose(proposal: MemoryProposal): Promise<WriteGateResult> {
    return this.writeGate.propose(proposal);
  }

  /**
   * Recall governed memory for a caller, scope, and optional filters.
   *
   * @remarks
   * Use this before giving memory text to a model. Visibility and scope are
   * checked before status/type/topic filtering, and unresolved conflicts block
   * local use.
   */
  recall(query: RecallQuery): Promise<RetrievalResult> {
    return this.retrievalRouter.recall(query);
  }

  /**
   * Authorize a proposed action against the memories the agent cites.
   *
   * @remarks
   * Use this immediately before acting on recalled memory. The receiver-side
   * action classification is re-checked here; sensitive actions always ask a
   * human even when every cited memory is valid.
   */
  tryAct(action: ProposedAction, context: ActionContext): Promise<ActionAuthorizationResult> {
    return this.actionAuthorizer.tryAct(action, context);
  }
}
