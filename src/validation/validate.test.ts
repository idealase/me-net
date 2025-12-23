/**
 * Tests for Validation Engine
 */

import type { Behaviour, BehaviourOutcomeLink, Link, Network, Outcome, Value } from '@/types';

import {
  detectOrphanValues,
  detectUnexplainedBehaviours,
  detectFloatingOutcomes,
  detectOutcomeLevelConflicts,
  detectValueLevelConflicts,
  validateNetwork,
  getActiveWarnings,
  getWarningsForNode,
  computePathsToValues,
  generateWarningId,
  getSeverity,
  getWarningTypeLabel,
  isWarningActive,
  Warning,
  WarningState,
} from './index';

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
      label: 'Late-night work',
      frequency: 'occasionally',
      cost: 'high',
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
    {
      id: 'o-4',
      type: 'outcome',
      label: 'Project progress',
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
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'v-2',
      type: 'value',
      label: 'Achievement',
      importance: 'high',
      neglect: 'somewhat-neglected',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'v-3',
      type: 'value',
      label: 'Orphan value',
      importance: 'medium',
      neglect: 'well-satisfied',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const links: Link[] = [
    // Morning walk -> Reduced anxiety (positive)
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
    // Morning walk -> Better sleep (positive)
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
    // Late-night work -> Better sleep (NEGATIVE - outcome conflict)
    {
      id: 'l-3',
      type: 'behaviour-outcome',
      sourceId: 'b-2',
      targetId: 'o-2',
      valence: 'negative',
      reliability: 'usually',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    // Late-night work -> Project progress (positive)
    {
      id: 'l-4',
      type: 'behaviour-outcome',
      sourceId: 'b-2',
      targetId: 'o-4',
      valence: 'positive',
      reliability: 'always',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    // Reduced anxiety -> Health (positive)
    {
      id: 'l-5',
      type: 'outcome-value',
      sourceId: 'o-1',
      targetId: 'v-1',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    // Better sleep -> Health (positive)
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
    // Project progress -> Achievement (positive)
    {
      id: 'l-7',
      type: 'outcome-value',
      sourceId: 'o-4',
      targetId: 'v-2',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  return {
    version: '1.0.0',
    behaviours,
    outcomes,
    values,
    links,
  };
}

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('generateWarningId', () => {
  it('generates consistent IDs', () => {
    expect(generateWarningId('orphan-value', 'v-1')).toBe('w-orphan-value-v-1');
    expect(generateWarningId('unexplained-behaviour', 'b-1')).toBe('w-unexplained-behaviour-b-1');
  });
});

describe('getSeverity', () => {
  it('returns correct severity for each type', () => {
    expect(getSeverity('orphan-value')).toBe('warning');
    expect(getSeverity('unexplained-behaviour')).toBe('info');
    expect(getSeverity('floating-outcome')).toBe('info');
    expect(getSeverity('outcome-level-conflict')).toBe('warning');
    expect(getSeverity('value-level-conflict')).toBe('error');
  });
});

describe('getWarningTypeLabel', () => {
  it('returns human-readable labels', () => {
    expect(getWarningTypeLabel('orphan-value')).toBe('Orphan Value');
    expect(getWarningTypeLabel('unexplained-behaviour')).toBe('Unexplained Behaviour');
    expect(getWarningTypeLabel('floating-outcome')).toBe('Floating Outcome');
    expect(getWarningTypeLabel('outcome-level-conflict')).toBe('Outcome Conflict');
    expect(getWarningTypeLabel('value-level-conflict')).toBe('Value Conflict');
  });
});

describe('isWarningActive', () => {
  const mockWarning: Warning = {
    id: 'w-test',
    type: 'orphan-value',
    nodeId: 'v-1',
    message: 'Test warning',
    severity: 'warning',
    relatedNodeIds: [],
  };

  it('returns true for active warnings', () => {
    const state: WarningState = { snoozed: {}, dismissed: {} };
    expect(isWarningActive(mockWarning, state)).toBe(true);
  });

  it('returns false for dismissed warnings', () => {
    const state: WarningState = { snoozed: {}, dismissed: { 'w-test': true } };
    expect(isWarningActive(mockWarning, state)).toBe(false);
  });

  it('returns false for snoozed warnings (not expired)', () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString();
    const state: WarningState = { snoozed: { 'w-test': futureDate }, dismissed: {} };
    expect(isWarningActive(mockWarning, state)).toBe(false);
  });

  it('returns true for expired snooze', () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    const state: WarningState = { snoozed: { 'w-test': pastDate }, dismissed: {} };
    expect(isWarningActive(mockWarning, state)).toBe(true);
  });
});

// ============================================================================
// Orphan Values Tests (V-1)
// ============================================================================

describe('detectOrphanValues', () => {
  it('detects values with no incoming path', () => {
    const network = createTestNetwork();
    const warnings = detectOrphanValues(network);

    // v-3 (Orphan value) has no links
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.nodeId).toBe('v-3');
    expect(warnings[0]?.type).toBe('orphan-value');
    expect(warnings[0]?.message).toContain('Orphan value');
  });

  it('returns empty for fully connected network', () => {
    const network = createTestNetwork();
    // Remove the orphan value
    network.values = network.values.filter((v) => v.id !== 'v-3');

    const warnings = detectOrphanValues(network);
    expect(warnings).toHaveLength(0);
  });

  it('detects value with outcome link but no behaviour path', () => {
    const network = createEmptyNetwork();
    network.values.push({
      id: 'v-1',
      type: 'value',
      label: 'Test value',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    network.outcomes.push({
      id: 'o-1',
      type: 'outcome',
      label: 'Test outcome',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    // Link outcome to value but no behaviour links to outcome
    network.links.push({
      id: 'l-1',
      type: 'outcome-value',
      sourceId: 'o-1',
      targetId: 'v-1',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });

    const warnings = detectOrphanValues(network);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.nodeId).toBe('v-1');
  });
});

// ============================================================================
// Unexplained Behaviours Tests (V-2)
// ============================================================================

describe('detectUnexplainedBehaviours', () => {
  it('detects behaviours with no outgoing links', () => {
    const network = createTestNetwork();
    const warnings = detectUnexplainedBehaviours(network);

    // b-3 (Unexplained behaviour) has no links
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.nodeId).toBe('b-3');
    expect(warnings[0]?.type).toBe('unexplained-behaviour');
  });

  it('returns empty when all behaviours have links', () => {
    const network = createTestNetwork();
    // Remove the unexplained behaviour
    network.behaviours = network.behaviours.filter((b) => b.id !== 'b-3');

    const warnings = detectUnexplainedBehaviours(network);
    expect(warnings).toHaveLength(0);
  });

  it('returns all behaviours when none have links', () => {
    const network = createEmptyNetwork();
    network.behaviours.push(
      {
        id: 'b-1',
        type: 'behaviour',
        label: 'Test 1',
        frequency: 'daily',
        cost: 'low',
        contextTags: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'b-2',
        type: 'behaviour',
        label: 'Test 2',
        frequency: 'weekly',
        cost: 'medium',
        contextTags: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }
    );

    const warnings = detectUnexplainedBehaviours(network);
    expect(warnings).toHaveLength(2);
  });
});

// ============================================================================
// Floating Outcomes Tests (V-3)
// ============================================================================

describe('detectFloatingOutcomes', () => {
  it('detects outcomes with no downstream links', () => {
    const network = createTestNetwork();
    const warnings = detectFloatingOutcomes(network);

    // o-3 (Floating outcome) has no downstream links
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.nodeId).toBe('o-3');
    expect(warnings[0]?.type).toBe('floating-outcome');
  });

  it('returns empty when all outcomes are connected', () => {
    const network = createTestNetwork();
    // Remove the floating outcome
    network.outcomes = network.outcomes.filter((o) => o.id !== 'o-3');

    const warnings = detectFloatingOutcomes(network);
    expect(warnings).toHaveLength(0);
  });
});

// ============================================================================
// Outcome-Level Conflicts Tests (V-4)
// ============================================================================

describe('detectOutcomeLevelConflicts', () => {
  it('detects negative behaviour-outcome links', () => {
    const network = createTestNetwork();
    const warnings = detectOutcomeLevelConflicts(network);

    // b-2 (Late-night work) has negative link to o-2 (Better sleep)
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.nodeId).toBe('b-2');
    expect(warnings[0]?.type).toBe('outcome-level-conflict');
    expect(warnings[0]?.message).toContain('Better sleep');
  });

  it('returns empty when no negative links exist', () => {
    const network = createTestNetwork();
    // Change negative link to positive
    const link = network.links.find((l) => l.id === 'l-3') as BehaviourOutcomeLink;
    if (link !== undefined) {
      link.valence = 'positive';
    }

    const warnings = detectOutcomeLevelConflicts(network);
    expect(warnings).toHaveLength(0);
  });

  it('groups multiple negative outcomes per behaviour', () => {
    const network = createTestNetwork();
    // Add another negative link from b-2
    network.links.push({
      id: 'l-extra',
      type: 'behaviour-outcome',
      sourceId: 'b-2',
      targetId: 'o-1',
      valence: 'negative',
      reliability: 'sometimes',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });

    const warnings = detectOutcomeLevelConflicts(network);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.relatedNodeIds).toContain('o-1');
    expect(warnings[0]?.relatedNodeIds).toContain('o-2');
  });
});

// ============================================================================
// Value-Level Conflicts Tests (V-5)
// ============================================================================

describe('detectValueLevelConflicts', () => {
  it('detects behaviours with mixed downstream effects', () => {
    const network = createTestNetwork();
    const warnings = detectValueLevelConflicts(network);

    // b-2 (Late-night work):
    // - Positive to Achievement via Project progress
    // - Negative to Health via Better sleep (negative B->O, positive O->V = negative)
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.nodeId).toBe('b-2');
    expect(warnings[0]?.type).toBe('value-level-conflict');
    expect(warnings[0]?.message).toContain('Achievement');
    expect(warnings[0]?.message).toContain('Health');
  });

  it('returns empty when no conflicts exist', () => {
    const network = createTestNetwork();
    // Remove the conflicting behaviour
    network.behaviours = network.behaviours.filter((b) => b.id !== 'b-2');
    network.links = network.links.filter(
      (l) => l.sourceId !== 'b-2'
    );

    const warnings = detectValueLevelConflicts(network);
    expect(warnings).toHaveLength(0);
  });
});

describe('computePathsToValues', () => {
  it('computes all paths from behaviours to values', () => {
    const network = createTestNetwork();
    const paths = computePathsToValues(network);

    // Expected paths:
    // b-1 -> o-1 -> v-1 (positive * positive = positive)
    // b-1 -> o-2 -> v-1 (positive * positive = positive)
    // b-2 -> o-2 -> v-1 (negative * positive = negative)
    // b-2 -> o-4 -> v-2 (positive * positive = positive)
    expect(paths.length).toBe(4);

    const b1Paths = paths.filter((p) => p.behaviourId === 'b-1');
    expect(b1Paths.every((p) => p.valence === 'positive')).toBe(true);

    const b2Paths = paths.filter((p) => p.behaviourId === 'b-2');
    expect(b2Paths.some((p) => p.valence === 'positive')).toBe(true);
    expect(b2Paths.some((p) => p.valence === 'negative')).toBe(true);
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
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    network.outcomes.push({
      id: 'o-1',
      type: 'outcome',
      label: 'Test outcome',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    network.values.push({
      id: 'v-1',
      type: 'value',
      label: 'Test value',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    // Negative B->O and negative O->V = positive effect
    network.links.push(
      {
        id: 'l-1',
        type: 'behaviour-outcome',
        sourceId: 'b-1',
        targetId: 'o-1',
        valence: 'negative',
        reliability: 'always',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'l-2',
        type: 'outcome-value',
        sourceId: 'o-1',
        targetId: 'v-1',
        valence: 'negative',
        strength: 'strong',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }
    );

    const paths = computePathsToValues(network);
    expect(paths).toHaveLength(1);
    expect(paths[0]?.valence).toBe('positive');
  });
});

// ============================================================================
// Main Validation Tests
// ============================================================================

describe('validateNetwork', () => {
  it('runs all checks and returns comprehensive result', () => {
    const network = createTestNetwork();
    const result = validateNetwork(network);

    // Expected warnings:
    // - 1 orphan value (v-3)
    // - 1 unexplained behaviour (b-3)
    // - 1 floating outcome (o-3)
    // - 1 outcome-level conflict (b-2)
    // - 1 value-level conflict (b-2)
    expect(result.counts.total).toBe(5);
    expect(result.counts.byType['orphan-value']).toBe(1);
    expect(result.counts.byType['unexplained-behaviour']).toBe(1);
    expect(result.counts.byType['floating-outcome']).toBe(1);
    expect(result.counts.byType['outcome-level-conflict']).toBe(1);
    expect(result.counts.byType['value-level-conflict']).toBe(1);
  });

  it('indexes warnings by type', () => {
    const network = createTestNetwork();
    const result = validateNetwork(network);

    expect(result.byType['orphan-value']).toHaveLength(1);
    expect(result.byType['orphan-value'][0]?.nodeId).toBe('v-3');
  });

  it('indexes warnings by node ID', () => {
    const network = createTestNetwork();
    const result = validateNetwork(network);

    // b-2 has two warnings: outcome-level and value-level
    expect(result.byNodeId['b-2']).toHaveLength(2);
  });

  it('tracks active/snoozed/dismissed counts', () => {
    const network = createTestNetwork();
    const state: WarningState = {
      snoozed: { 'w-orphan-value-v-3': new Date(Date.now() + 3600000).toISOString() },
      dismissed: { 'w-floating-outcome-o-3': true },
    };

    const result = validateNetwork(network, state);

    expect(result.counts.snoozed).toBe(1);
    expect(result.counts.dismissed).toBe(1);
    expect(result.counts.active).toBe(3);
  });

  it('returns empty result for valid network', () => {
    const network = createEmptyNetwork();
    network.behaviours.push({
      id: 'b-1',
      type: 'behaviour',
      label: 'Test',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    network.outcomes.push({
      id: 'o-1',
      type: 'outcome',
      label: 'Test outcome',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    network.values.push({
      id: 'v-1',
      type: 'value',
      label: 'Test value',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    network.links.push(
      {
        id: 'l-1',
        type: 'behaviour-outcome',
        sourceId: 'b-1',
        targetId: 'o-1',
        valence: 'positive',
        reliability: 'always',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'l-2',
        type: 'outcome-value',
        sourceId: 'o-1',
        targetId: 'v-1',
        valence: 'positive',
        strength: 'strong',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }
    );

    const result = validateNetwork(network);
    expect(result.counts.total).toBe(0);
  });
});

describe('getActiveWarnings', () => {
  it('filters out snoozed and dismissed warnings', () => {
    const network = createTestNetwork();
    const result = validateNetwork(network);
    const state: WarningState = {
      snoozed: { 'w-orphan-value-v-3': new Date(Date.now() + 3600000).toISOString() },
      dismissed: { 'w-floating-outcome-o-3': true },
    };

    const active = getActiveWarnings(result, state);
    expect(active).toHaveLength(3);
    expect(active.every((w) => w.id !== 'w-orphan-value-v-3')).toBe(true);
    expect(active.every((w) => w.id !== 'w-floating-outcome-o-3')).toBe(true);
  });
});

describe('getWarningsForNode', () => {
  it('returns warnings for specific node', () => {
    const network = createTestNetwork();
    const result = validateNetwork(network);

    const b2Warnings = getWarningsForNode(result, 'b-2');
    expect(b2Warnings).toHaveLength(2);

    const v3Warnings = getWarningsForNode(result, 'v-3');
    expect(v3Warnings).toHaveLength(1);
  });

  it('returns empty for node with no warnings', () => {
    const network = createTestNetwork();
    const result = validateNetwork(network);

    const warnings = getWarningsForNode(result, 'b-1');
    expect(warnings).toHaveLength(0);
  });
});
