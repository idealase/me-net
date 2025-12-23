/**
 * Tests for Why Ladder Types and Utilities
 */

import type { Behaviour, BehaviourOutcomeLink, Link, Network, Outcome, OutcomeValueLink, Value } from '@/types';

import {
  behaviourHasOutgoingLinks,
  countUnexplainedOutcomes,
  createLadderSession,
  getFloatingOutcomes,
  getLinkableOutcomes,
  getLinkableValues,
  getNextUnexplainedOutcome,
  getSelectableBehaviours,
  getUnexplainedBehaviours,
  LadderSession,
  outcomeHasDownstreamLinks,
} from './types';

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestNetwork(): Network {
  const behaviours: Behaviour[] = [
    {
      id: 'b-1',
      type: 'behaviour',
      label: 'Morning walk',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'b-2',
      type: 'behaviour',
      label: 'Meditation',
      frequency: 'daily',
      cost: 'trivial',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'b-3',
      type: 'behaviour',
      label: 'Unexplained behaviour',
      frequency: 'weekly',
      cost: 'medium',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const outcomes: Outcome[] = [
    {
      id: 'o-1',
      type: 'outcome',
      label: 'Reduced anxiety',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'o-2',
      type: 'outcome',
      label: 'Better sleep',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'o-3',
      type: 'outcome',
      label: 'Floating outcome',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const values: Value[] = [
    {
      id: 'v-1',
      type: 'value',
      label: 'Health',
      importance: 'critical',
      neglect: 'well-satisfied',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'v-2',
      type: 'value',
      label: 'Peace of mind',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const behaviourOutcomeLinks: BehaviourOutcomeLink[] = [
    {
      id: 'l-1',
      type: 'behaviour-outcome',
      sourceId: 'b-1',
      targetId: 'o-1',
      valence: 'positive',
      reliability: 'usually',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'l-2',
      type: 'behaviour-outcome',
      sourceId: 'b-1',
      targetId: 'o-2',
      valence: 'positive',
      reliability: 'sometimes',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'l-3',
      type: 'behaviour-outcome',
      sourceId: 'b-2',
      targetId: 'o-1',
      valence: 'positive',
      reliability: 'always',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const outcomeValueLinks: OutcomeValueLink[] = [
    {
      id: 'l-4',
      type: 'outcome-value',
      sourceId: 'o-1',
      targetId: 'v-1',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'l-5',
      type: 'outcome-value',
      sourceId: 'o-1',
      targetId: 'v-2',
      valence: 'positive',
      strength: 'moderate',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'l-6',
      type: 'outcome-value',
      sourceId: 'o-2',
      targetId: 'v-1',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  // Combine into unified links array
  const links: Link[] = [...behaviourOutcomeLinks, ...outcomeValueLinks];

  return {
    version: '1.0.0',
    behaviours,
    outcomes,
    values,
    links,
  };
}

function createTestSession(): LadderSession {
  return {
    id: 'test-session',
    currentStep: 'add-outcomes',
    behaviourId: 'b-1',
    behaviourLabel: 'Morning walk',
    outcomes: [
      { outcomeId: 'o-1', outcomeLabel: 'Reduced anxiety', explained: true },
      { outcomeId: 'o-2', outcomeLabel: 'Better sleep', explained: false },
      { outcomeId: 'o-3', outcomeLabel: 'Floating outcome', explained: false },
    ],
    currentOutcomeIndex: 1,
    valueIds: ['v-1'],
    completed: false,
    startedAt: '2025-01-01T00:00:00.000Z',
  };
}

// ============================================================================
// createLadderSession Tests
// ============================================================================

describe('createLadderSession', () => {
  it('creates a session with default values', () => {
    const session = createLadderSession();

    expect(session.id).toMatch(/^ladder-\d+$/);
    expect(session.currentStep).toBe('select-behaviour');
    expect(session.behaviourId).toBeNull();
    expect(session.behaviourLabel).toBe('');
    expect(session.outcomes).toEqual([]);
    expect(session.currentOutcomeIndex).toBe(0);
    expect(session.valueIds).toEqual([]);
    expect(session.completed).toBe(false);
    expect(session.startedAt).toBeDefined();
  });

  it('creates unique session IDs when time advances', () => {
    vi.useFakeTimers();
    const session1 = createLadderSession();
    vi.advanceTimersByTime(1);
    const session2 = createLadderSession();
    vi.useRealTimers();

    expect(session1.id).not.toBe(session2.id);
  });
});

// ============================================================================
// getUnexplainedBehaviours Tests
// ============================================================================

describe('getUnexplainedBehaviours', () => {
  it('finds behaviours with no outgoing links', () => {
    const network = createTestNetwork();
    const unexplained = getUnexplainedBehaviours(network);

    expect(unexplained).toHaveLength(1);
    expect(unexplained[0]).toEqual({
      id: 'b-3',
      type: 'behaviour',
      label: 'Unexplained behaviour',
    });
  });

  it('returns empty array when all behaviours are explained', () => {
    const network = createTestNetwork();
    // Remove the unexplained behaviour
    network.behaviours = network.behaviours.filter((b) => b.id !== 'b-3');

    const unexplained = getUnexplainedBehaviours(network);
    expect(unexplained).toHaveLength(0);
  });

  it('returns all behaviours when none have links', () => {
    const network = createTestNetwork();
    // Remove all behaviour-outcome links
    network.links = network.links.filter((l) => l.type !== 'behaviour-outcome');

    const unexplained = getUnexplainedBehaviours(network);
    expect(unexplained).toHaveLength(3);
  });
});

// ============================================================================
// getFloatingOutcomes Tests
// ============================================================================

describe('getFloatingOutcomes', () => {
  it('finds outcomes with no downstream links to values', () => {
    const network = createTestNetwork();
    const floating = getFloatingOutcomes(network);

    expect(floating).toHaveLength(1);
    expect(floating[0]).toEqual({
      id: 'o-3',
      type: 'outcome',
      label: 'Floating outcome',
    });
  });

  it('returns empty array when all outcomes are connected', () => {
    const network = createTestNetwork();
    network.outcomes = network.outcomes.filter((o) => o.id !== 'o-3');

    const floating = getFloatingOutcomes(network);
    expect(floating).toHaveLength(0);
  });

  it('returns all outcomes when none have downstream links', () => {
    const network = createTestNetwork();
    // Remove all outcome-value links
    network.links = network.links.filter((l) => l.type !== 'outcome-value');

    const floating = getFloatingOutcomes(network);
    expect(floating).toHaveLength(3);
  });
});

// ============================================================================
// behaviourHasOutgoingLinks Tests
// ============================================================================

describe('behaviourHasOutgoingLinks', () => {
  it('returns true for behaviour with links', () => {
    const network = createTestNetwork();
    expect(behaviourHasOutgoingLinks(network, 'b-1')).toBe(true);
    expect(behaviourHasOutgoingLinks(network, 'b-2')).toBe(true);
  });

  it('returns false for behaviour without links', () => {
    const network = createTestNetwork();
    expect(behaviourHasOutgoingLinks(network, 'b-3')).toBe(false);
  });

  it('returns false for non-existent behaviour', () => {
    const network = createTestNetwork();
    expect(behaviourHasOutgoingLinks(network, 'b-999')).toBe(false);
  });
});

// ============================================================================
// outcomeHasDownstreamLinks Tests
// ============================================================================

describe('outcomeHasDownstreamLinks', () => {
  it('returns true for outcome with downstream links', () => {
    const network = createTestNetwork();
    expect(outcomeHasDownstreamLinks(network, 'o-1')).toBe(true);
    expect(outcomeHasDownstreamLinks(network, 'o-2')).toBe(true);
  });

  it('returns false for floating outcome', () => {
    const network = createTestNetwork();
    expect(outcomeHasDownstreamLinks(network, 'o-3')).toBe(false);
  });

  it('returns false for non-existent outcome', () => {
    const network = createTestNetwork();
    expect(outcomeHasDownstreamLinks(network, 'o-999')).toBe(false);
  });
});

// ============================================================================
// getNextUnexplainedOutcome Tests
// ============================================================================

describe('getNextUnexplainedOutcome', () => {
  it('returns the first unexplained outcome from current index', () => {
    const session = createTestSession();
    const next = getNextUnexplainedOutcome(session);

    expect(next).toEqual({
      outcomeId: 'o-2',
      outcomeLabel: 'Better sleep',
      explained: false,
    });
  });

  it('skips already explained outcomes', () => {
    const session = createTestSession();
    const outcome = session.outcomes[1];
    if (outcome) {
      outcome.explained = true;
    }
    
    const next = getNextUnexplainedOutcome(session);

    expect(next).toEqual({
      outcomeId: 'o-3',
      outcomeLabel: 'Floating outcome',
      explained: false,
    });
  });

  it('returns null when all outcomes are explained', () => {
    const session = createTestSession();
    session.outcomes.forEach((o) => (o.explained = true));

    const next = getNextUnexplainedOutcome(session);
    expect(next).toBeNull();
  });

  it('returns null for empty outcomes list', () => {
    const session = createTestSession();
    session.outcomes = [];

    const next = getNextUnexplainedOutcome(session);
    expect(next).toBeNull();
  });
});

// ============================================================================
// countUnexplainedOutcomes Tests
// ============================================================================

describe('countUnexplainedOutcomes', () => {
  it('counts unexplained outcomes correctly', () => {
    const session = createTestSession();
    expect(countUnexplainedOutcomes(session)).toBe(2);
  });

  it('returns 0 when all outcomes are explained', () => {
    const session = createTestSession();
    session.outcomes.forEach((o) => (o.explained = true));

    expect(countUnexplainedOutcomes(session)).toBe(0);
  });

  it('returns 0 for empty outcomes list', () => {
    const session = createTestSession();
    session.outcomes = [];

    expect(countUnexplainedOutcomes(session)).toBe(0);
  });
});

// ============================================================================
// getSelectableBehaviours Tests
// ============================================================================

describe('getSelectableBehaviours', () => {
  it('returns all behaviours with hasLinks flag', () => {
    const network = createTestNetwork();
    const behaviours = getSelectableBehaviours(network);

    expect(behaviours).toHaveLength(3);
    expect(behaviours).toContainEqual({
      id: 'b-1',
      label: 'Morning walk',
      hasLinks: true,
    });
    expect(behaviours).toContainEqual({
      id: 'b-3',
      label: 'Unexplained behaviour',
      hasLinks: false,
    });
  });

  it('filters to only unexplained when requested', () => {
    const network = createTestNetwork();
    const behaviours = getSelectableBehaviours(network, true);

    expect(behaviours).toHaveLength(1);
    expect(behaviours[0]).toEqual({
      id: 'b-3',
      label: 'Unexplained behaviour',
      hasLinks: false,
    });
  });
});

// ============================================================================
// getLinkableOutcomes Tests
// ============================================================================

describe('getLinkableOutcomes', () => {
  it('returns outcomes with alreadyLinked flag for behaviour', () => {
    const network = createTestNetwork();
    const outcomes = getLinkableOutcomes(network, 'b-1');

    expect(outcomes).toHaveLength(3);
    expect(outcomes.find((o) => o.id === 'o-1')?.alreadyLinked).toBe(true);
    expect(outcomes.find((o) => o.id === 'o-2')?.alreadyLinked).toBe(true);
    expect(outcomes.find((o) => o.id === 'o-3')?.alreadyLinked).toBe(false);
  });

  it('returns all outcomes as not linked for behaviour with no links', () => {
    const network = createTestNetwork();
    const outcomes = getLinkableOutcomes(network, 'b-3');

    expect(outcomes.every((o) => !o.alreadyLinked)).toBe(true);
  });
});

// ============================================================================
// getLinkableValues Tests
// ============================================================================

describe('getLinkableValues', () => {
  it('returns values with alreadyLinked flag for outcome', () => {
    const network = createTestNetwork();
    const values = getLinkableValues(network, 'o-1');

    expect(values).toHaveLength(2);
    expect(values.find((v) => v.id === 'v-1')?.alreadyLinked).toBe(true);
    expect(values.find((v) => v.id === 'v-2')?.alreadyLinked).toBe(true);
  });

  it('returns all values as not linked for floating outcome', () => {
    const network = createTestNetwork();
    const values = getLinkableValues(network, 'o-3');

    expect(values.every((v) => !v.alreadyLinked)).toBe(true);
  });
});
