/**
 * Tests for Path Computation
 */

import type { Network, Behaviour, Outcome, Value, BehaviourOutcomeLink, OutcomeValueLink } from '@/types';

import {
  computeAllPaths,
  groupPathsByBehaviour,
  groupPathsByValue,
  getValuesReachedByBehaviour,
  getBehavioursSupportingValue,
  getOutcomesForBehaviour,
} from './paths';

// ============================================================================
// Test Fixtures
// ============================================================================

function createEmptyNetwork(): Network {
  return {
    version: '1.0.0',
    behaviours: [],
    outcomes: [],
    values: [],
    links: [],
  };
}

function createTestNetwork(): Network {
  // Based on the example from metrics-and-insights.md
  const behaviours: Behaviour[] = [
    {
      id: 'b-walk',
      type: 'behaviour',
      label: '30-min walk',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'b-work',
      type: 'behaviour',
      label: 'Late-night work',
      frequency: 'weekly',
      cost: 'high',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const outcomes: Outcome[] = [
    {
      id: 'o-anxiety',
      type: 'outcome',
      label: 'Reduced anxiety',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'o-sleep',
      type: 'outcome',
      label: 'Better sleep',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'o-progress',
      type: 'outcome',
      label: 'Project progress',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const values: Value[] = [
    {
      id: 'v-peace',
      type: 'value',
      label: 'Peace of mind',
      importance: 'high',
      neglect: 'somewhat-neglected',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'v-health',
      type: 'value',
      label: 'Health',
      importance: 'critical',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'v-energy',
      type: 'value',
      label: 'Energy',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'v-achievement',
      type: 'value',
      label: 'Achievement',
      importance: 'medium',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const links: (BehaviourOutcomeLink | OutcomeValueLink)[] = [
    // Walk -> Outcomes
    {
      id: 'l-1',
      type: 'behaviour-outcome',
      sourceId: 'b-walk',
      targetId: 'o-anxiety',
      valence: 'positive',
      reliability: 'usually',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-2',
      type: 'behaviour-outcome',
      sourceId: 'b-walk',
      targetId: 'o-sleep',
      valence: 'positive',
      reliability: 'usually',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    // Work -> Outcomes
    {
      id: 'l-3',
      type: 'behaviour-outcome',
      sourceId: 'b-work',
      targetId: 'o-progress',
      valence: 'positive',
      reliability: 'always',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-4',
      type: 'behaviour-outcome',
      sourceId: 'b-work',
      targetId: 'o-sleep',
      valence: 'negative',
      reliability: 'usually',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    // Outcomes -> Values
    {
      id: 'l-5',
      type: 'outcome-value',
      sourceId: 'o-anxiety',
      targetId: 'v-peace',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-6',
      type: 'outcome-value',
      sourceId: 'o-anxiety',
      targetId: 'v-health',
      valence: 'positive',
      strength: 'moderate',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-7',
      type: 'outcome-value',
      sourceId: 'o-sleep',
      targetId: 'v-health',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-8',
      type: 'outcome-value',
      sourceId: 'o-sleep',
      targetId: 'v-energy',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-9',
      type: 'outcome-value',
      sourceId: 'o-progress',
      targetId: 'v-achievement',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  return { version: '1.0.0', behaviours, outcomes, values, links };
}

// ============================================================================
// computeAllPaths Tests
// ============================================================================

describe('computeAllPaths', () => {
  it('returns empty array for empty network', () => {
    const network = createEmptyNetwork();
    const paths = computeAllPaths(network);
    expect(paths).toHaveLength(0);
  });

  it('computes correct number of paths', () => {
    const network = createTestNetwork();
    const paths = computeAllPaths(network);
    // Walk: 4 paths (anxiety->peace, anxiety->health, sleep->health, sleep->energy)
    // Work: 3 paths (progress->achievement, sleep->health (neg), sleep->energy (neg))
    expect(paths).toHaveLength(7);
  });

  it('computes correct effective valence for positive paths', () => {
    const network = createTestNetwork();
    const paths = computeAllPaths(network);
    const walkToPeace = paths.find(
      (p) => p.behaviourId === 'b-walk' && p.valueId === 'v-peace'
    );
    expect(walkToPeace?.effectiveValence).toBe('positive');
  });

  it('computes correct effective valence for negative paths', () => {
    const network = createTestNetwork();
    const paths = computeAllPaths(network);
    const workToHealth = paths.find(
      (p) => p.behaviourId === 'b-work' && p.valueId === 'v-health'
    );
    expect(workToHealth?.effectiveValence).toBe('negative');
  });

  it('computes correct path weight (reliability × strength)', () => {
    const network = createTestNetwork();
    const paths = computeAllPaths(network);
    // Walk -> anxiety -> peace: usually (0.75) × strong (1.0) = 0.75
    const walkToPeace = paths.find(
      (p) => p.behaviourId === 'b-walk' && p.valueId === 'v-peace'
    );
    expect(walkToPeace?.pathWeight).toBe(0.75);
  });

  it('computes correct influence including importance', () => {
    const network = createTestNetwork();
    const paths = computeAllPaths(network);
    // Walk -> anxiety -> peace: +1 × 0.75 × 1.0 × 3 (high) = 2.25
    const walkToPeace = paths.find(
      (p) => p.behaviourId === 'b-walk' && p.valueId === 'v-peace'
    );
    expect(walkToPeace?.influence).toBe(2.25);
  });

  it('handles double-negative as positive', () => {
    const network = createEmptyNetwork();
    network.behaviours.push({
      id: 'b-1',
      type: 'behaviour',
      label: 'Test',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });
    network.outcomes.push({
      id: 'o-1',
      type: 'outcome',
      label: 'Outcome',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });
    network.values.push({
      id: 'v-1',
      type: 'value',
      label: 'Value',
      importance: 'medium',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });
    network.links.push(
      {
        id: 'l-1',
        type: 'behaviour-outcome',
        sourceId: 'b-1',
        targetId: 'o-1',
        valence: 'negative',
        reliability: 'always',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'l-2',
        type: 'outcome-value',
        sourceId: 'o-1',
        targetId: 'v-1',
        valence: 'negative',
        strength: 'strong',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
    );

    const paths = computeAllPaths(network);
    expect(paths).toHaveLength(1);
    expect(paths[0]?.effectiveValence).toBe('positive');
    expect(paths[0]?.influence).toBeGreaterThan(0);
  });
});

// ============================================================================
// groupPathsByBehaviour Tests
// ============================================================================

describe('groupPathsByBehaviour', () => {
  it('groups paths correctly', () => {
    const network = createTestNetwork();
    const grouped = groupPathsByBehaviour(network);

    expect(grouped.size).toBe(2); // walk and work
    expect(grouped.get('b-walk')?.paths.length).toBe(4);
    expect(grouped.get('b-work')?.paths.length).toBe(3);
  });

  it('computes positive influence correctly', () => {
    const network = createTestNetwork();
    const grouped = groupPathsByBehaviour(network);
    const walkPaths = grouped.get('b-walk');

    // From the spec example:
    // walk → anxiety → Peace of mind: 1 × 0.75 × 1 × 1.0 × 3 = 2.25
    // walk → anxiety → Health: 1 × 0.75 × 1 × 0.6 × 4 = 1.8
    // walk → sleep → Health: 1 × 0.75 × 1 × 1.0 × 4 = 3.0
    // walk → sleep → Energy: 1 × 0.75 × 1 × 1.0 × 3 = 2.25
    // Total = 9.3
    expect(walkPaths?.positiveInfluence).toBeCloseTo(9.3);
  });

  it('computes negative influence correctly', () => {
    const network = createTestNetwork();
    const grouped = groupPathsByBehaviour(network);
    const workPaths = grouped.get('b-work');

    // Work negative paths:
    // work → sleep (neg) → Health: -1 × 0.75 × 1 × 1.0 × 4 = -3.0
    // work → sleep (neg) → Energy: -1 × 0.75 × 1 × 1.0 × 3 = -2.25
    // Negative influence (abs) = 5.25
    expect(workPaths?.negativeInfluence).toBeCloseTo(5.25);
  });

  it('tracks positive value IDs', () => {
    const network = createTestNetwork();
    const grouped = groupPathsByBehaviour(network);
    const walkPaths = grouped.get('b-walk');

    expect(walkPaths?.positiveValueIds.has('v-peace')).toBe(true);
    expect(walkPaths?.positiveValueIds.has('v-health')).toBe(true);
    expect(walkPaths?.positiveValueIds.has('v-energy')).toBe(true);
    expect(walkPaths?.positiveValueIds.size).toBe(3);
  });

  it('tracks negative value IDs', () => {
    const network = createTestNetwork();
    const grouped = groupPathsByBehaviour(network);
    const workPaths = grouped.get('b-work');

    expect(workPaths?.negativeValueIds.has('v-health')).toBe(true);
    expect(workPaths?.negativeValueIds.has('v-energy')).toBe(true);
  });

  it('includes behaviours with no paths', () => {
    const network = createEmptyNetwork();
    network.behaviours.push({
      id: 'b-lonely',
      type: 'behaviour',
      label: 'Lonely',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });

    const grouped = groupPathsByBehaviour(network);
    expect(grouped.has('b-lonely')).toBe(true);
    expect(grouped.get('b-lonely')?.paths.length).toBe(0);
  });
});

// ============================================================================
// groupPathsByValue Tests
// ============================================================================

describe('groupPathsByValue', () => {
  it('groups paths correctly', () => {
    const network = createTestNetwork();
    const grouped = groupPathsByValue(network);

    expect(grouped.size).toBe(4);
    expect(grouped.get('v-health')?.paths.length).toBe(3); // 2 from walk + 1 negative from work
  });

  it('tracks supporting behaviours', () => {
    const network = createTestNetwork();
    const grouped = groupPathsByValue(network);
    const healthSupport = grouped.get('v-health');

    expect(healthSupport?.supportingBehaviourIds.has('b-walk')).toBe(true);
  });

  it('tracks harming behaviours', () => {
    const network = createTestNetwork();
    const grouped = groupPathsByValue(network);
    const healthSupport = grouped.get('v-health');

    expect(healthSupport?.harmingBehaviourIds.has('b-work')).toBe(true);
  });

  it('includes orphan values', () => {
    const network = createEmptyNetwork();
    network.values.push({
      id: 'v-orphan',
      type: 'value',
      label: 'Orphan',
      importance: 'high',
      neglect: 'severely-neglected',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });

    const grouped = groupPathsByValue(network);
    expect(grouped.has('v-orphan')).toBe(true);
    expect(grouped.get('v-orphan')?.positiveSupport).toBe(0);
  });
});

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('getValuesReachedByBehaviour', () => {
  it('returns positive and negative value IDs', () => {
    const network = createTestNetwork();
    const result = getValuesReachedByBehaviour(network, 'b-work');

    expect(result.positive).toContain('v-achievement');
    expect(result.negative).toContain('v-health');
    expect(result.negative).toContain('v-energy');
  });

  it('returns empty arrays for unknown behaviour', () => {
    const network = createTestNetwork();
    const result = getValuesReachedByBehaviour(network, 'b-unknown');

    expect(result.positive).toHaveLength(0);
    expect(result.negative).toHaveLength(0);
  });
});

describe('getBehavioursSupportingValue', () => {
  it('returns supporting and harming behaviour IDs', () => {
    const network = createTestNetwork();
    const result = getBehavioursSupportingValue(network, 'v-health');

    expect(result.supporting).toContain('b-walk');
    expect(result.harming).toContain('b-work');
  });
});

describe('getOutcomesForBehaviour', () => {
  it('returns outcome IDs in paths', () => {
    const network = createTestNetwork();
    const result = getOutcomesForBehaviour(network, 'b-walk');

    expect(result).toContain('o-anxiety');
    expect(result).toContain('o-sleep');
  });
});
