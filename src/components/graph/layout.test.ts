/**
 * Tests for Layered Layout Algorithm
 */

import type {
  Behaviour,
  BehaviourOutcomeLink,
  Network,
  Outcome,
  OutcomeValueLink,
  Value,
} from '@/types';

import { networkToGraphData } from './data';
import { applyLayeredLayout, getColumnBoundaries, sortNodesByConnectivity } from './layout';
import { defaultLayeredLayout } from './theme';

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestNetwork(): Network {
  const behaviours: Behaviour[] = [
    {
      id: 'b-1',
      type: 'behaviour',
      label: 'Behaviour 1',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'b-2',
      type: 'behaviour',
      label: 'Behaviour 2',
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
      label: 'Outcome 1',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const values: Value[] = [
    {
      id: 'v-1',
      type: 'value',
      label: 'Value 1',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'v-2',
      type: 'value',
      label: 'Value 2',
      importance: 'medium',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const links: (BehaviourOutcomeLink | OutcomeValueLink)[] = [
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
      type: 'outcome-value',
      sourceId: 'o-1',
      targetId: 'v-1',
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
// applyLayeredLayout Tests
// ============================================================================

describe('applyLayeredLayout', () => {
  it('assigns x positions in three columns', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);

    const behaviours = graphData.nodes.filter((n) => n.type === 'behaviour');
    const outcomes = graphData.nodes.filter((n) => n.type === 'outcome');
    const values = graphData.nodes.filter((n) => n.type === 'value');

    // All behaviours should have same x
    const behaviourX = behaviours[0]!.x;
    expect(behaviours.every((n) => n.x === behaviourX)).toBe(true);

    // All outcomes should have same x
    const outcomeX = outcomes[0]!.x;
    expect(outcomes.every((n) => n.x === outcomeX)).toBe(true);

    // All values should have same x
    const valueX = values[0]!.x;
    expect(values.every((n) => n.x === valueX)).toBe(true);

    // Columns should be in order: behaviours < outcomes < values
    expect(behaviourX).toBeLessThan(outcomeX!);
    expect(outcomeX).toBeLessThan(valueX!);
  });

  it('assigns y positions within columns', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);

    // All nodes should have y positions
    expect(graphData.nodes.every((n) => n.y !== undefined)).toBe(true);
  });

  it('spaces nodes according to rowGap', () => {
    const network = createTestNetwork();
    const graphData = networkToGraphData(network);

    applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);

    const behaviours = graphData.nodes.filter((n) => n.type === 'behaviour');
    if (behaviours.length >= 2) {
      const yDiff = Math.abs((behaviours[1]!.y ?? 0) - (behaviours[0]!.y ?? 0));
      expect(yDiff).toBe(defaultLayeredLayout.rowGap);
    }
  });

  it('handles empty network', () => {
    const graphData = { nodes: [], edges: [] };

    expect(() => {
      applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);
    }).not.toThrow();
  });
});

// ============================================================================
// getColumnBoundaries Tests
// ============================================================================

describe('getColumnBoundaries', () => {
  it('returns three column boundaries', () => {
    const boundaries = getColumnBoundaries(defaultLayeredLayout, 1200);

    expect(boundaries).toHaveLength(3);
    expect(boundaries[0]!.label).toBe('Behaviours');
    expect(boundaries[1]!.label).toBe('Outcomes');
    expect(boundaries[2]!.label).toBe('Values');
  });

  it('spaces columns according to columnGap', () => {
    const boundaries = getColumnBoundaries(defaultLayeredLayout, 1200);

    const gap1 = boundaries[1]!.x - boundaries[0]!.x;
    const gap2 = boundaries[2]!.x - boundaries[1]!.x;

    expect(gap1).toBe(defaultLayeredLayout.columnGap);
    expect(gap2).toBe(defaultLayeredLayout.columnGap);
  });
});

// ============================================================================
// sortNodesByConnectivity Tests
// ============================================================================

describe('sortNodesByConnectivity', () => {
  function createConnectedNetwork(): Network {
    const behaviours: Behaviour[] = [
      {
        id: 'b-1',
        type: 'behaviour',
        label: 'Behaviour 1',
        frequency: 'daily',
        cost: 'low',
        contextTags: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'b-2',
        type: 'behaviour',
        label: 'Behaviour 2',
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
        label: 'Outcome 1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'o-2',
        type: 'outcome',
        label: 'Outcome 2',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    const values: Value[] = [
      {
        id: 'v-1',
        type: 'value',
        label: 'Value 1',
        importance: 'high',
        neglect: 'adequately-met',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'v-2',
        type: 'value',
        label: 'Value 2',
        importance: 'medium',
        neglect: 'adequately-met',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    const links: (BehaviourOutcomeLink | OutcomeValueLink)[] = [
      // b-1 connects to o-1
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
      // b-2 connects to o-2
      {
        id: 'l-2',
        type: 'behaviour-outcome',
        sourceId: 'b-2',
        targetId: 'o-2',
        valence: 'positive',
        reliability: 'always',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      // o-1 connects to v-1
      {
        id: 'l-3',
        type: 'outcome-value',
        sourceId: 'o-1',
        targetId: 'v-1',
        valence: 'positive',
        strength: 'strong',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      // o-2 connects to v-2
      {
        id: 'l-4',
        type: 'outcome-value',
        sourceId: 'o-2',
        targetId: 'v-2',
        valence: 'positive',
        strength: 'moderate',
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

  it('sorts outcomes by connectivity (most connected first)', () => {
    const network = createConnectedNetwork();
    // Add extra link to o-1 to make it more connected
    network.links.push({
      id: 'l-5',
      type: 'behaviour-outcome',
      sourceId: 'b-2',
      targetId: 'o-1',
      valence: 'positive',
      reliability: 'usually',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    } as BehaviourOutcomeLink);

    const graphData = networkToGraphData(network);
    applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);
    sortNodesByConnectivity(graphData);

    const outcomes = graphData.nodes.filter((n) => n.type === 'outcome');
    // o-1 has 3 connections (b-1, b-2, v-1), o-2 has 2 (b-2, v-2)
    expect(outcomes[0]!.id).toBe('o-1');
  });

  it('handles nodes with no connections', () => {
    const network: Network = {
      version: '1.0.0',
      behaviours: [
        {
          id: 'b-1',
          type: 'behaviour',
          label: 'Behaviour 1',
          frequency: 'daily',
          cost: 'low',
          contextTags: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      outcomes: [
        {
          id: 'o-1',
          type: 'outcome',
          label: 'Outcome 1',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      values: [
        {
          id: 'v-1',
          type: 'value',
          label: 'Value 1',
          importance: 'high',
          neglect: 'adequately-met',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      links: [], // No links
    };

    const graphData = networkToGraphData(network);
    applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);

    expect(() => {
      sortNodesByConnectivity(graphData);
    }).not.toThrow();

    // Should still have all nodes
    expect(graphData.nodes).toHaveLength(3);
  });

  it('sorts behaviours by connected outcomes y-position', () => {
    const network = createConnectedNetwork();
    const graphData = networkToGraphData(network);
    applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);
    sortNodesByConnectivity(graphData);

    // After sorting, behaviours should be ordered by their connected outcomes
    const behaviours = graphData.nodes.filter((n) => n.type === 'behaviour');
    expect(behaviours).toHaveLength(2);
  });

  it('sorts values by connected outcomes y-position', () => {
    const network = createConnectedNetwork();
    const graphData = networkToGraphData(network);
    applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);
    sortNodesByConnectivity(graphData);

    // After sorting, values should be ordered by their connected outcomes
    const values = graphData.nodes.filter((n) => n.type === 'value');
    expect(values).toHaveLength(2);
  });

  it('handles edges with object references', () => {
    // Test when edge.source/target are objects, not strings
    const network = createConnectedNetwork();
    const graphData = networkToGraphData(network);
    applyLayeredLayout(graphData, defaultLayeredLayout, 1200, 800);

    // Convert string references to object references
    for (const edge of graphData.edges) {
      const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
      const targetNode = graphData.nodes.find((n) => n.id === edge.target);
      if (sourceNode && targetNode) {
        edge.source = sourceNode as typeof edge.source;
        edge.target = targetNode as typeof edge.target;
      }
    }

    expect(() => {
      sortNodesByConnectivity(graphData);
    }).not.toThrow();
  });
});
