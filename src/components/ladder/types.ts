/**
 * Why Ladder Types and Utilities
 *
 * Types and helpers for the guided "Why Ladder" capture mode.
 */

import type {
  Behaviour,
  BehaviourOutcomeLink,
  Network,
  Outcome,
  OutcomeValueLink,
  Value,
} from '@/types';

// ============================================================================
// State Machine Types
// ============================================================================

/**
 * Steps in the Why Ladder flow.
 */
export type LadderStep =
  | 'select-behaviour' // Step 1: Select or create a behaviour
  | 'add-outcomes' // Step 2: Add outcomes for current behaviour
  | 'explain-outcome' // Step 3: Explain why an outcome matters (link to value or chain to outcome)
  | 'complete'; // Done with current ladder

/**
 * Represents an unexplained node that needs to be connected.
 */
export interface UnexplainedNode {
  id: string;
  type: 'behaviour' | 'outcome';
  label: string;
}

/**
 * A pending outcome that needs to be explained (linked to a value).
 */
export interface PendingOutcome {
  outcomeId: string;
  outcomeLabel: string;
  explained: boolean;
}

/**
 * Session state for a Why Ladder session.
 */
export interface LadderSession {
  /** Unique session ID */
  id: string;
  /** Current step in the ladder */
  currentStep: LadderStep;
  /** The behaviour being explored */
  behaviourId: string | null;
  behaviourLabel: string;
  /** Outcomes created/linked in this session */
  outcomes: PendingOutcome[];
  /** Index of the outcome currently being explained */
  currentOutcomeIndex: number;
  /** Values created/linked in this session */
  valueIds: string[];
  /** Whether the session was completed normally */
  completed: boolean;
  /** Timestamp when session started */
  startedAt: string;
}

/**
 * Creates an empty ladder session.
 */
export function createLadderSession(): LadderSession {
  return {
    id: `ladder-${Date.now()}`,
    currentStep: 'select-behaviour',
    behaviourId: null,
    behaviourLabel: '',
    outcomes: [],
    currentOutcomeIndex: 0,
    valueIds: [],
    completed: false,
    startedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Callbacks
// ============================================================================

/**
 * Callbacks for Why Ladder component.
 */
export interface WhyLadderCallbacks {
  /** Called when a new behaviour is created */
  onCreateBehaviour: (label: string) => Behaviour;
  /** Called when an existing behaviour is selected */
  onSelectBehaviour: (id: string) => void;
  /** Called when a new outcome is created and linked to the current behaviour */
  onCreateOutcome: (label: string, behaviourId: string) => Outcome;
  /** Called when an existing outcome is linked to the current behaviour */
  onLinkOutcome: (outcomeId: string, behaviourId: string) => void;
  /** Called when a new value is created and linked to an outcome */
  onCreateValue: (label: string, outcomeId: string) => Value;
  /** Called when an existing value is linked to an outcome */
  onLinkValue: (valueId: string, outcomeId: string) => void;
  /** Called when the ladder is completed */
  onComplete: (session: LadderSession) => void;
  /** Called when the ladder is cancelled/exited early */
  onExit: (session: LadderSession) => void;
  /** Called when a new outcome is chained (intermediate) */
  onChainOutcome: (label: string, parentOutcomeId: string) => Outcome;
}

/**
 * Options for the Why Ladder component.
 */
export interface WhyLadderOptions {
  network: Network;
  callbacks: WhyLadderCallbacks;
  /** Optional pre-selected behaviour ID to start with */
  initialBehaviourId?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all behaviour-outcome links from the network.
 */
function getBehaviourOutcomeLinks(network: Network): BehaviourOutcomeLink[] {
  return network.links.filter(
    (link): link is BehaviourOutcomeLink => link.type === 'behaviour-outcome'
  );
}

/**
 * Get all outcome-value links from the network.
 */
function getOutcomeValueLinks(network: Network): OutcomeValueLink[] {
  return network.links.filter(
    (link): link is OutcomeValueLink => link.type === 'outcome-value'
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all unexplained behaviours (no outgoing links).
 */
export function getUnexplainedBehaviours(network: Network): UnexplainedNode[] {
  const unexplained: UnexplainedNode[] = [];
  const boLinks = getBehaviourOutcomeLinks(network);

  for (const behaviour of network.behaviours) {
    const hasOutgoingLink = boLinks.some((link) => link.sourceId === behaviour.id);
    if (!hasOutgoingLink) {
      unexplained.push({
        id: behaviour.id,
        type: 'behaviour',
        label: behaviour.label,
      });
    }
  }

  return unexplained;
}

/**
 * Get all floating outcomes (no downstream links to values).
 */
export function getFloatingOutcomes(network: Network): UnexplainedNode[] {
  const floating: UnexplainedNode[] = [];
  const ovLinks = getOutcomeValueLinks(network);

  for (const outcome of network.outcomes) {
    const hasDownstreamLink = ovLinks.some((link) => link.sourceId === outcome.id);
    if (!hasDownstreamLink) {
      floating.push({
        id: outcome.id,
        type: 'outcome',
        label: outcome.label,
      });
    }
  }

  return floating;
}

/**
 * Check if a behaviour has any outgoing links.
 */
export function behaviourHasOutgoingLinks(network: Network, behaviourId: string): boolean {
  const boLinks = getBehaviourOutcomeLinks(network);
  return boLinks.some((link) => link.sourceId === behaviourId);
}

/**
 * Check if an outcome has any downstream links to values.
 */
export function outcomeHasDownstreamLinks(network: Network, outcomeId: string): boolean {
  const ovLinks = getOutcomeValueLinks(network);
  return ovLinks.some((link) => link.sourceId === outcomeId);
}

/**
 * Get the next unexplained outcome in a session.
 */
export function getNextUnexplainedOutcome(session: LadderSession): PendingOutcome | null {
  for (let i = session.currentOutcomeIndex; i < session.outcomes.length; i++) {
    const outcome = session.outcomes[i];
    if (outcome && !outcome.explained) {
      return outcome;
    }
  }
  return null;
}

/**
 * Count unexplained outcomes in a session.
 */
export function countUnexplainedOutcomes(session: LadderSession): number {
  return session.outcomes.filter((o) => !o.explained).length;
}

/**
 * Get behaviours that can be selected for the ladder (optionally filter unexplained).
 */
export function getSelectableBehaviours(
  network: Network,
  onlyUnexplained: boolean = false
): Array<{ id: string; label: string; hasLinks: boolean }> {
  return network.behaviours
    .map((b) => ({
      id: b.id,
      label: b.label,
      hasLinks: behaviourHasOutgoingLinks(network, b.id),
    }))
    .filter((b) => !onlyUnexplained || !b.hasLinks);
}

/**
 * Get outcomes that can be linked to a behaviour.
 */
export function getLinkableOutcomes(
  network: Network,
  behaviourId: string
): Array<{ id: string; label: string; alreadyLinked: boolean }> {
  const boLinks = getBehaviourOutcomeLinks(network);
  const linkedOutcomeIds = new Set(
    boLinks.filter((link) => link.sourceId === behaviourId).map((link) => link.targetId)
  );

  return network.outcomes.map((o) => ({
    id: o.id,
    label: o.label,
    alreadyLinked: linkedOutcomeIds.has(o.id),
  }));
}

/**
 * Get values that can be linked to an outcome.
 */
export function getLinkableValues(
  network: Network,
  outcomeId: string
): Array<{ id: string; label: string; alreadyLinked: boolean }> {
  const ovLinks = getOutcomeValueLinks(network);
  const linkedValueIds = new Set(
    ovLinks.filter((link) => link.sourceId === outcomeId).map((link) => link.targetId)
  );

  return network.values.map((v) => ({
    id: v.id,
    label: v.label,
    alreadyLinked: linkedValueIds.has(v.id),
  }));
}
