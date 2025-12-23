/**
 * Tests for Metrics Computation
 */

import type { Network, Behaviour, Outcome, Value, BehaviourOutcomeLink, OutcomeValueLink } from '@/types';

import {
  computeLeverageScore,
  computeCoverage,
  computeConflictIndex,
  computeFragilityScore,
  computeAllBehaviourMetrics,
  computeAllValueMetrics,
  getTopLeverageBehaviours,
  getFragileValues,
  getConflictBehaviours,
  analyzeNetwork,
  INFINITE_FRAGILITY,
  FRAGILITY_THRESHOLD,
  CONFLICT_THRESHOLD,
} from './metrics';
import { groupPathsByBehaviour, groupPathsByValue } from './paths';

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
      cost: 'low', // cost = 2
      contextTags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'b-work',
      type: 'behaviour',
      label: 'Late-night work',
      frequency: 'weekly',
      cost: 'high', // cost = 8
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
      importance: 'high', // 3
      neglect: 'somewhat-neglected', // 3
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'v-health',
      type: 'value',
      label: 'Health',
      importance: 'critical', // 4
      neglect: 'adequately-met', // 2
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'v-energy',
      type: 'value',
      label: 'Energy',
      importance: 'high', // 3
      neglect: 'adequately-met', // 2
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'v-achievement',
      type: 'value',
      label: 'Achievement',
      importance: 'medium', // 2
      neglect: 'adequately-met', // 2
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
      reliability: 'usually', // 0.75
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-2',
      type: 'behaviour-outcome',
      sourceId: 'b-walk',
      targetId: 'o-sleep',
      valence: 'positive',
      reliability: 'usually', // 0.75
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
      reliability: 'always', // 1.0
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-4',
      type: 'behaviour-outcome',
      sourceId: 'b-work',
      targetId: 'o-sleep',
      valence: 'negative',
      reliability: 'usually', // 0.75
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
      strength: 'strong', // 1.0
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-6',
      type: 'outcome-value',
      sourceId: 'o-anxiety',
      targetId: 'v-health',
      valence: 'positive',
      strength: 'moderate', // 0.6
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-7',
      type: 'outcome-value',
      sourceId: 'o-sleep',
      targetId: 'v-health',
      valence: 'positive',
      strength: 'strong', // 1.0
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-8',
      type: 'outcome-value',
      sourceId: 'o-sleep',
      targetId: 'v-energy',
      valence: 'positive',
      strength: 'strong', // 1.0
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'l-9',
      type: 'outcome-value',
      sourceId: 'o-progress',
      targetId: 'v-achievement',
      valence: 'positive',
      strength: 'strong', // 1.0
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  return { version: '1.0.0', behaviours, outcomes, values, links };
}

// ============================================================================
// Leverage Score Tests
// ============================================================================

describe('computeLeverageScore', () => {
  it('computes leverage correctly per spec example', () => {
    const network = createTestNetwork();
    const behaviour = network.behaviours.find((b) => b.id === 'b-walk')!;
    const pathsByBehaviour = groupPathsByBehaviour(network);
    const paths = pathsByBehaviour.get('b-walk')!;

    // From spec: TotalInfluence = 9.3, Cost = 2
    // Leverage = 9.3 / 2 = 4.65
    const leverage = computeLeverageScore(behaviour, paths);
    expect(leverage).toBeCloseTo(4.65, 1);
  });

  it('returns negative leverage for harmful behaviours', () => {
    const network = createTestNetwork();
    // Remove positive path from work
    network.links = network.links.filter((l) => l.id !== 'l-3' && l.id !== 'l-9');

    const behaviour = network.behaviours.find((b) => b.id === 'b-work')!;
    const pathsByBehaviour = groupPathsByBehaviour(network);
    const paths = pathsByBehaviour.get('b-work')!;

    const leverage = computeLeverageScore(behaviour, paths);
    expect(leverage).toBeLessThan(0);
  });

  it('handles behaviour with no paths', () => {
    const network = createEmptyNetwork();
    network.behaviours.push({
      id: 'b-1',
      type: 'behaviour',
      label: 'Lonely',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });

    const behaviour = network.behaviours[0]!;
    const pathsByBehaviour = groupPathsByBehaviour(network);
    const paths = pathsByBehaviour.get('b-1')!;

    const leverage = computeLeverageScore(behaviour, paths);
    expect(leverage).toBe(0);
  });
});

// ============================================================================
// Coverage Tests
// ============================================================================

describe('computeCoverage', () => {
  it('counts distinct positive values', () => {
    const network = createTestNetwork();
    const pathsByBehaviour = groupPathsByBehaviour(network);
    const walkPaths = pathsByBehaviour.get('b-walk')!;

    // Walk reaches Peace, Health, Energy positively
    const coverage = computeCoverage(walkPaths);
    expect(coverage).toBe(3);
  });

  it('excludes negatively affected values', () => {
    const network = createTestNetwork();
    const pathsByBehaviour = groupPathsByBehaviour(network);
    const workPaths = pathsByBehaviour.get('b-work')!;

    // Work reaches Achievement positively, but Health/Energy negatively
    const coverage = computeCoverage(workPaths);
    expect(coverage).toBe(1);
  });
});

// ============================================================================
// Conflict Index Tests
// ============================================================================

describe('computeConflictIndex', () => {
  it('computes conflict index per spec example', () => {
    const network = createTestNetwork();
    const pathsByBehaviour = groupPathsByBehaviour(network);
    const workPaths = pathsByBehaviour.get('b-work')!;

    // From spec: PositiveInfluence = 2.0, NegativeInfluence = 5.25
    // ConflictIndex = min(2.0, 5.25) = 2.0
    const conflict = computeConflictIndex(workPaths);
    expect(conflict).toBeCloseTo(2.0, 1);
  });

  it('returns 0 for purely positive behaviours', () => {
    const network = createTestNetwork();
    const pathsByBehaviour = groupPathsByBehaviour(network);
    const walkPaths = pathsByBehaviour.get('b-walk')!;

    const conflict = computeConflictIndex(walkPaths);
    expect(conflict).toBe(0);
  });
});

// ============================================================================
// Fragility Score Tests
// ============================================================================

describe('computeFragilityScore', () => {
  it('computes fragility correctly per spec example', () => {
    const network = createTestNetwork();
    const value = network.values.find((v) => v.id === 'v-peace')!;
    const pathsByValue = groupPathsByValue(network);
    const support = pathsByValue.get('v-peace')!;

    // From spec: importance=3, neglect=3, supportStrength=2.25
    // Fragility = (3 × 3) / 2.25 = 4.0
    const fragility = computeFragilityScore(value, support);
    expect(fragility).toBeCloseTo(4.0, 1);
  });

  it('returns INFINITE_FRAGILITY for orphan values', () => {
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

    const value = network.values[0]!;
    const pathsByValue = groupPathsByValue(network);
    const support = pathsByValue.get('v-orphan')!;

    const fragility = computeFragilityScore(value, support);
    expect(fragility).toBe(INFINITE_FRAGILITY);
  });

  it('computes lower fragility for well-supported values', () => {
    const network = createTestNetwork();
    const value = network.values.find((v) => v.id === 'v-health')!;
    const pathsByValue = groupPathsByValue(network);
    const support = pathsByValue.get('v-health')!;

    // Health: importance=4, neglect=2
    // Has multiple positive paths from walk
    const fragility = computeFragilityScore(value, support);
    expect(fragility).toBeLessThan(FRAGILITY_THRESHOLD);
  });
});

// ============================================================================
// Aggregate Metrics Tests
// ============================================================================

describe('computeAllBehaviourMetrics', () => {
  it('returns metrics for all behaviours', () => {
    const network = createTestNetwork();
    const metrics = computeAllBehaviourMetrics(network);

    expect(metrics.size).toBe(2);
    expect(metrics.has('b-walk')).toBe(true);
    expect(metrics.has('b-work')).toBe(true);
  });

  it('includes all metric fields', () => {
    const network = createTestNetwork();
    const metrics = computeAllBehaviourMetrics(network);
    const walkMetrics = metrics.get('b-walk')!;

    expect(walkMetrics.behaviourId).toBe('b-walk');
    expect(typeof walkMetrics.leverageScore).toBe('number');
    expect(typeof walkMetrics.coverage).toBe('number');
    expect(typeof walkMetrics.conflictIndex).toBe('number');
    expect(typeof walkMetrics.positiveInfluence).toBe('number');
    expect(typeof walkMetrics.negativeInfluence).toBe('number');
  });
});

describe('computeAllValueMetrics', () => {
  it('returns metrics for all values', () => {
    const network = createTestNetwork();
    const metrics = computeAllValueMetrics(network);

    expect(metrics.size).toBe(4);
    expect(metrics.has('v-peace')).toBe(true);
    expect(metrics.has('v-health')).toBe(true);
  });

  it('includes all metric fields', () => {
    const network = createTestNetwork();
    const metrics = computeAllValueMetrics(network);
    const peaceMetrics = metrics.get('v-peace')!;

    expect(peaceMetrics.valueId).toBe('v-peace');
    expect(typeof peaceMetrics.fragilityScore).toBe('number');
    expect(typeof peaceMetrics.supportStrength).toBe('number');
    expect(Array.isArray(peaceMetrics.supportingBehaviours)).toBe(true);
  });
});

// ============================================================================
// Insight Getters Tests
// ============================================================================

describe('getTopLeverageBehaviours', () => {
  it('returns top behaviours sorted by leverage', () => {
    const network = createTestNetwork();
    const top = getTopLeverageBehaviours(network);

    expect(top.length).toBeGreaterThan(0);
    // Walk should be first (higher leverage)
    expect(top[0]?.behaviour.id).toBe('b-walk');
  });

  it('includes supported values in insight', () => {
    const network = createTestNetwork();
    const top = getTopLeverageBehaviours(network);
    const walkInsight = top.find((i) => i.behaviour.id === 'b-walk')!;

    expect(walkInsight.supportedValues.length).toBe(3);
  });

  it('includes via outcomes in insight', () => {
    const network = createTestNetwork();
    const top = getTopLeverageBehaviours(network);
    const walkInsight = top.find((i) => i.behaviour.id === 'b-walk')!;

    expect(walkInsight.viaOutcomes).toContain('Reduced anxiety');
    expect(walkInsight.viaOutcomes).toContain('Better sleep');
  });

  it('excludes negative leverage behaviours', () => {
    const network = createTestNetwork();
    // Remove positive path from work
    network.links = network.links.filter((l) => l.id !== 'l-3' && l.id !== 'l-9');

    const top = getTopLeverageBehaviours(network);
    const hasWork = top.some((i) => i.behaviour.id === 'b-work');
    expect(hasWork).toBe(false);
  });

  it('respects count limit', () => {
    const network = createTestNetwork();
    const top = getTopLeverageBehaviours(network, 1);

    expect(top.length).toBe(1);
  });
});

describe('getFragileValues', () => {
  it('returns values with fragility above threshold', () => {
    const network = createTestNetwork();
    const fragile = getFragileValues(network);

    // Peace has fragility 4.0 > threshold 3.0
    const hasPeace = fragile.some((i) => i.value.id === 'v-peace');
    expect(hasPeace).toBe(true);
  });

  it('identifies orphan values', () => {
    const network = createTestNetwork();
    // Add orphan value
    network.values.push({
      id: 'v-orphan',
      type: 'value',
      label: 'Orphan',
      importance: 'high',
      neglect: 'severely-neglected',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });

    const fragile = getFragileValues(network);
    const orphanInsight = fragile.find((i) => i.value.id === 'v-orphan');

    expect(orphanInsight?.isOrphan).toBe(true);
  });

  it('sorts by fragility descending with orphans first', () => {
    const network = createTestNetwork();
    network.values.push({
      id: 'v-orphan',
      type: 'value',
      label: 'Orphan',
      importance: 'high',
      neglect: 'severely-neglected',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });

    const fragile = getFragileValues(network);
    expect(fragile[0]?.isOrphan).toBe(true);
  });
});

describe('getConflictBehaviours', () => {
  it('returns behaviours with conflict index above threshold', () => {
    const network = createTestNetwork();
    const conflicts = getConflictBehaviours(network);

    // Work has conflict index 2.0 > threshold 0.5
    const hasWork = conflicts.some((i) => i.behaviour.id === 'b-work');
    expect(hasWork).toBe(true);
  });

  it('excludes behaviours below threshold', () => {
    const network = createTestNetwork();
    const conflicts = getConflictBehaviours(network);

    // Walk has conflict index 0
    const hasWalk = conflicts.some((i) => i.behaviour.id === 'b-walk');
    expect(hasWalk).toBe(false);
  });

  it('includes positive and negative values in insight', () => {
    const network = createTestNetwork();
    const conflicts = getConflictBehaviours(network);
    const workInsight = conflicts.find((i) => i.behaviour.id === 'b-work')!;

    expect(workInsight.positiveValues.length).toBeGreaterThan(0);
    expect(workInsight.negativeValues.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// analyzeNetwork Tests
// ============================================================================

describe('analyzeNetwork', () => {
  it('returns complete analysis', () => {
    const network = createTestNetwork();
    const analysis = analyzeNetwork(network);

    expect(analysis.behaviourMetrics).toBeDefined();
    expect(analysis.valueMetrics).toBeDefined();
    expect(analysis.topLeverage).toBeDefined();
    expect(analysis.fragileValues).toBeDefined();
    expect(analysis.conflictBehaviours).toBeDefined();
  });

  it('handles empty network', () => {
    const network = createEmptyNetwork();
    const analysis = analyzeNetwork(network);

    expect(analysis.behaviourMetrics.size).toBe(0);
    expect(analysis.valueMetrics.size).toBe(0);
    expect(analysis.topLeverage).toHaveLength(0);
    expect(analysis.fragileValues).toHaveLength(0);
    expect(analysis.conflictBehaviours).toHaveLength(0);
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('Constants', () => {
  it('FRAGILITY_THRESHOLD is 3.0', () => {
    expect(FRAGILITY_THRESHOLD).toBe(3.0);
  });

  it('CONFLICT_THRESHOLD is 0.5', () => {
    expect(CONFLICT_THRESHOLD).toBe(0.5);
  });

  it('INFINITE_FRAGILITY is Infinity', () => {
    expect(INFINITE_FRAGILITY).toBe(Infinity);
  });
});
