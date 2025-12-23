/**
 * Tests for Graph Data Transformation
 */

import type {
  Behaviour,
  BehaviourOutcomeLink,
  Network,
  Outcome,
  OutcomeValueLink,
  Value,
} from '@/types';

import {
  getConnectedEdgeIds,
  getConnectedNodeIds,
  networkToGraphData,
  normalizeReliability,
  normalizeStrength,
  truncateLabel,
} from './data';

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestNetwork(): Network {
  const behaviour: Behaviour = {
    id: 'b-1',
    type: 'behaviour',
    label: 'Test Behaviour',
    frequency: 'daily',
    cost: 'low',
    contextTags: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const outcome: Outcome = {
    id: 'o-1',
    type: 'outcome',
    label: 'Test Outcome',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const value: Value = {
    id: 'v-1',
    type: 'value',
    label: 'Test Value',
    importance: 'high',
    neglect: 'adequately-met',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const boLink: BehaviourOutcomeLink = {
    id: 'l-1',
    type: 'behaviour-outcome',
    sourceId: 'b-1',
    targetId: 'o-1',
    valence: 'positive',
    reliability: 'usually',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const ovLink: OutcomeValueLink = {
    id: 'l-2',
    type: 'outcome-value',
    sourceId: 'o-1',
    targetId: 'v-1',
    valence: 'positive',
    strength: 'strong',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  return {
    version: '1.0.0',
    behaviours: [behaviour],
    outcomes: [outcome],
    values: [value],
    links: [boLink, ovLink],
  };
}

// ============================================================================
// normalizeReliability Tests
// ============================================================================

describe('normalizeReliability', () => {
  it('returns 1.0 for always', () => {
    expect(normalizeReliability('always')).toBe(1.0);
  });

  it('returns 0.75 for usually', () => {
    expect(normalizeReliability('usually')).toBe(0.75);
  });

  it('returns 0.5 for sometimes', () => {
    expect(normalizeReliability('sometimes')).toBe(0.5);
  });

  it('returns 0.25 for rarely', () => {
    expect(normalizeReliability('rarely')).toBe(0.25);
  });
});

// ============================================================================
// normalizeStrength Tests
// ============================================================================

describe('normalizeStrength', () => {
  it('returns 1.0 for strong', () => {
    expect(normalizeStrength('strong')).toBe(1.0);
  });

  it('returns 0.6 for moderate', () => {
    expect(normalizeStrength('moderate')).toBe(0.6);
  });

  it('returns 0.3 for weak', () => {
    expect(normalizeStrength('weak')).toBe(0.3);
  });
});

// ============================================================================
// networkToGraphData Tests
// ============================================================================

describe('networkToGraphData', () => {
  it('transforms behaviours to graph nodes', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const behaviourNodes = graphData.nodes.filter((n) => n.type === 'behaviour');
    expect(behaviourNodes).toHaveLength(1);
    expect(behaviourNodes[0]!.id).toBe('b-1');
    expect(behaviourNodes[0]!.label).toBe('Test Behaviour');
  });

  it('transforms outcomes to graph nodes', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const outcomeNodes = graphData.nodes.filter((n) => n.type === 'outcome');
    expect(outcomeNodes).toHaveLength(1);
    expect(outcomeNodes[0]!.id).toBe('o-1');
  });

  it('transforms values to graph nodes', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const valueNodes = graphData.nodes.filter((n) => n.type === 'value');
    expect(valueNodes).toHaveLength(1);
    expect(valueNodes[0]!.id).toBe('v-1');
  });

  it('transforms links to graph edges', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    expect(graphData.edges).toHaveLength(2);
  });

  it('normalizes reliability to strength for B→O edges', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const boEdge = graphData.edges.find((e) => e.type === 'behaviour-outcome');
    expect(boEdge?.strength).toBe(0.75); // 'usually' = 0.75
  });

  it('normalizes strength for O→V edges', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const ovEdge = graphData.edges.find((e) => e.type === 'outcome-value');
    expect(ovEdge?.strength).toBe(1.0); // 'strong' = 1.0
  });

  it('preserves valence on edges', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    expect(graphData.edges.every((e) => e.valence === 'positive')).toBe(true);
  });
});

// ============================================================================
// getConnectedNodeIds Tests
// ============================================================================

describe('getConnectedNodeIds', () => {
  it('returns connected nodes for source', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const connected = getConnectedNodeIds(graphData, 'b-1');
    expect(connected.has('o-1')).toBe(true);
    expect(connected.size).toBe(1);
  });

  it('returns connected nodes for middle node', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const connected = getConnectedNodeIds(graphData, 'o-1');
    expect(connected.has('b-1')).toBe(true);
    expect(connected.has('v-1')).toBe(true);
    expect(connected.size).toBe(2);
  });

  it('returns empty set for disconnected node', () => {
    const network = createTestNetwork();
    network.behaviours.push({
      id: 'b-2',
      type: 'behaviour',
      label: 'Disconnected',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    const graphData = networkToGraphData(network);

    const connected = getConnectedNodeIds(graphData, 'b-2');
    expect(connected.size).toBe(0);
  });
});

// ============================================================================
// getConnectedEdgeIds Tests
// ============================================================================

describe('getConnectedEdgeIds', () => {
  it('returns edges connected to node', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const edges = getConnectedEdgeIds(graphData, 'o-1');
    expect(edges.has('l-1')).toBe(true);
    expect(edges.has('l-2')).toBe(true);
    expect(edges.size).toBe(2);
  });

  it('returns single edge for terminal node', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    const edges = getConnectedEdgeIds(graphData, 'v-1');
    expect(edges.has('l-2')).toBe(true);
    expect(edges.size).toBe(1);
  });
});

// ============================================================================
// truncateLabel Tests
// ============================================================================

describe('truncateLabel', () => {
  it('returns short labels unchanged', () => {
    expect(truncateLabel('Short')).toBe('Short');
  });

  it('returns labels at max length unchanged', () => {
    const label = 'A'.repeat(20);
    expect(truncateLabel(label)).toBe(label);
  });

  it('truncates long labels with ellipsis', () => {
    const label = 'This is a very long label that exceeds limit';
    const result = truncateLabel(label);
    expect(result).toBe('This is a very long…');
    expect(result.length).toBe(20);
  });

  it('respects custom max length', () => {
    const label = 'Test label';
    const result = truncateLabel(label, 5);
    expect(result).toBe('Test…');
  });
});
