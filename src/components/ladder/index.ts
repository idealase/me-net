/**
 * Ladder Module - Public API
 *
 * Re-exports the WhyLadder component and types.
 */

// Types
export type {
  LadderSession,
  LadderStep,
  PendingOutcome,
  UnexplainedNode,
  WhyLadderCallbacks,
  WhyLadderOptions,
} from './types';

// Utilities
export {
  behaviourHasOutgoingLinks,
  countUnexplainedOutcomes,
  createLadderSession,
  getFloatingOutcomes,
  getLinkableOutcomes,
  getLinkableValues,
  getNextUnexplainedOutcome,
  getSelectableBehaviours,
  getUnexplainedBehaviours,
  outcomeHasDownstreamLinks,
} from './types';

// Component
export { WhyLadder } from './WhyLadder';
