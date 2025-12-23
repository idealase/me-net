/**
 * Tests for Network Factory
 */

import { 
  createEmptyNetwork, 
  createNetwork, 
  isNetworkEmpty, 
  getNodeCount, 
  getLinkCount,
  getNetworkStats 
} from './network';
import type { Behaviour, Outcome, Value } from '@/types';

describe('createEmptyNetwork', () => {
  it('creates a network with empty arrays', () => {
    const network = createEmptyNetwork();

    expect(network.behaviours).toEqual([]);
    expect(network.outcomes).toEqual([]);
    expect(network.values).toEqual([]);
    expect(network.links).toEqual([]);
  });

  it('includes version string', () => {
    const network = createEmptyNetwork();

    expect(network.version).toBe('1.0.0');
  });

  it('does not include exportedAt by default', () => {
    const network = createEmptyNetwork();

    expect(network.exportedAt).toBeUndefined();
  });
});

describe('createNetwork', () => {
  it('creates empty network when called with no arguments', () => {
    const network = createNetwork();

    expect(network.behaviours).toEqual([]);
    expect(network.outcomes).toEqual([]);
    expect(network.values).toEqual([]);
    expect(network.links).toEqual([]);
    expect(network.version).toBe('1.0.0');
  });

  it('accepts partial network data', () => {
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

    const network = createNetwork({ behaviours: [behaviour] });

    expect(network.behaviours).toHaveLength(1);
    expect(network.behaviours[0].label).toBe('Test Behaviour');
    expect(network.outcomes).toEqual([]);
    expect(network.values).toEqual([]);
  });

  it('preserves custom version', () => {
    const network = createNetwork({ version: '2.0.0' });

    expect(network.version).toBe('2.0.0');
  });

  it('preserves exportedAt timestamp', () => {
    const timestamp = '2025-12-23T12:00:00.000Z';
    const network = createNetwork({ exportedAt: timestamp });

    expect(network.exportedAt).toBe(timestamp);
  });
});

describe('isNetworkEmpty', () => {
  it('returns true for empty network', () => {
    const network = createEmptyNetwork();

    expect(isNetworkEmpty(network)).toBe(true);
  });

  it('returns false when behaviours exist', () => {
    const behaviour: Behaviour = {
      id: 'b-1',
      type: 'behaviour',
      label: 'Test',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const network = createNetwork({ behaviours: [behaviour] });

    expect(isNetworkEmpty(network)).toBe(false);
  });

  it('returns false when outcomes exist', () => {
    const outcome: Outcome = {
      id: 'o-1',
      type: 'outcome',
      label: 'Test',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const network = createNetwork({ outcomes: [outcome] });

    expect(isNetworkEmpty(network)).toBe(false);
  });

  it('returns false when values exist', () => {
    const value: Value = {
      id: 'v-1',
      type: 'value',
      label: 'Test',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const network = createNetwork({ values: [value] });

    expect(isNetworkEmpty(network)).toBe(false);
  });

  it('returns true when only links exist (orphaned links)', () => {
    // This is an edge case - links without nodes
    const network = createNetwork({
      links: [{
        id: 'l-1',
        type: 'behaviour-outcome',
        sourceId: 'b-1',
        targetId: 'o-1',
        valence: 'positive',
        reliability: 'usually',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }],
    });

    // Network is "empty" of nodes even if orphan links exist
    expect(isNetworkEmpty(network)).toBe(true);
  });
});

describe('getNodeCount', () => {
  it('returns 0 for empty network', () => {
    const network = createEmptyNetwork();

    expect(getNodeCount(network)).toBe(0);
  });

  it('counts all node types', () => {
    const behaviour: Behaviour = {
      id: 'b-1',
      type: 'behaviour',
      label: 'B1',
      frequency: 'daily',
      cost: 'low',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const outcome: Outcome = {
      id: 'o-1',
      type: 'outcome',
      label: 'O1',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const value: Value = {
      id: 'v-1',
      type: 'value',
      label: 'V1',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const network = createNetwork({
      behaviours: [behaviour],
      outcomes: [outcome],
      values: [value],
    });

    expect(getNodeCount(network)).toBe(3);
  });
});

describe('getLinkCount', () => {
  it('returns 0 for empty network', () => {
    const network = createEmptyNetwork();

    expect(getLinkCount(network)).toBe(0);
  });

  it('counts links correctly', () => {
    const network = createNetwork({
      links: [
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
      ],
    });

    expect(getLinkCount(network)).toBe(2);
  });
});

describe('getNetworkStats', () => {
  it('returns all zero stats for empty network', () => {
    const network = createEmptyNetwork();
    const stats = getNetworkStats(network);

    expect(stats).toEqual({
      behaviours: 0,
      outcomes: 0,
      values: 0,
      links: 0,
      totalNodes: 0,
    });
  });

  it('returns correct stats for populated network', () => {
    const network = createNetwork({
      behaviours: [
        { id: 'b-1', type: 'behaviour', label: 'B1', frequency: 'daily', cost: 'low', contextTags: [], createdAt: '', updatedAt: '' },
        { id: 'b-2', type: 'behaviour', label: 'B2', frequency: 'weekly', cost: 'medium', contextTags: [], createdAt: '', updatedAt: '' },
      ],
      outcomes: [
        { id: 'o-1', type: 'outcome', label: 'O1', createdAt: '', updatedAt: '' },
      ],
      values: [
        { id: 'v-1', type: 'value', label: 'V1', importance: 'high', neglect: 'adequately-met', createdAt: '', updatedAt: '' },
        { id: 'v-2', type: 'value', label: 'V2', importance: 'medium', neglect: 'somewhat-neglected', createdAt: '', updatedAt: '' },
        { id: 'v-3', type: 'value', label: 'V3', importance: 'low', neglect: 'well-satisfied', createdAt: '', updatedAt: '' },
      ],
      links: [
        { id: 'l-1', type: 'behaviour-outcome', sourceId: 'b-1', targetId: 'o-1', valence: 'positive', reliability: 'usually', createdAt: '', updatedAt: '' },
      ],
    });

    const stats = getNetworkStats(network);

    expect(stats).toEqual({
      behaviours: 2,
      outcomes: 1,
      values: 3,
      links: 1,
      totalNodes: 6,
    });
  });
});
