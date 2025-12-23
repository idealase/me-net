/**
 * Tests for Storage Layer
 */

import {
  saveNetwork,
  loadNetwork,
  clearNetwork,
  validateNetworkStructure,
  STORAGE_KEY_FOR_TESTING,
} from './storage';
import { createEmptyNetwork, createNetwork } from './network';
import type { Behaviour, Outcome, Value, BehaviourOutcomeLink, OutcomeValueLink } from '@/types';

describe('saveNetwork', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves network to localStorage', () => {
    const network = createEmptyNetwork();

    const result = saveNetwork(network);

    expect(result.success).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY_FOR_TESTING)).not.toBeNull();
  });

  it('saves network as valid JSON', () => {
    const network = createEmptyNetwork();

    saveNetwork(network);

    const stored = localStorage.getItem(STORAGE_KEY_FOR_TESTING);
    expect(() => JSON.parse(stored!)).not.toThrow();
  });

  it('preserves all network data', () => {
    const behaviour: Behaviour = {
      id: 'b-1',
      type: 'behaviour',
      label: 'Test Behaviour',
      frequency: 'daily',
      cost: 'low',
      contextTags: ['morning'],
      notes: 'Some notes',
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
      neglect: 'somewhat-neglected',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const link: BehaviourOutcomeLink = {
      id: 'l-1',
      type: 'behaviour-outcome',
      sourceId: 'b-1',
      targetId: 'o-1',
      valence: 'positive',
      reliability: 'usually',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const network = createNetwork({
      behaviours: [behaviour],
      outcomes: [outcome],
      values: [value],
      links: [link],
    });

    saveNetwork(network);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_FOR_TESTING)!);
    expect(stored.behaviours).toHaveLength(1);
    expect(stored.behaviours[0].label).toBe('Test Behaviour');
    expect(stored.outcomes).toHaveLength(1);
    expect(stored.values).toHaveLength(1);
    expect(stored.links).toHaveLength(1);
  });

  it('adds version to saved network', () => {
    const network = createNetwork({ version: '' });

    saveNetwork(network);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_FOR_TESTING)!);
    expect(stored.version).toBe('1.0.0');
  });

  it('handles localStorage quota exceeded error', () => {
    // Mock localStorage.setItem to throw quota exceeded error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });

    const network = createEmptyNetwork();
    const result = saveNetwork(network);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to save network');
    expect(result.error).toContain('QuotaExceededError');

    // Restore
    localStorage.setItem = originalSetItem;
  });
});

describe('loadNetwork', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty network when no data exists', () => {
    const result = loadNetwork();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.behaviours).toEqual([]);
    expect(result.data!.outcomes).toEqual([]);
    expect(result.data!.values).toEqual([]);
    expect(result.data!.links).toEqual([]);
  });

  it('loads previously saved network', () => {
    const behaviour: Behaviour = {
      id: 'b-1',
      type: 'behaviour',
      label: 'Loaded Behaviour',
      frequency: 'weekly',
      cost: 'medium',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const network = createNetwork({ behaviours: [behaviour] });

    saveNetwork(network);
    const result = loadNetwork();

    expect(result.success).toBe(true);
    expect(result.data!.behaviours).toHaveLength(1);
    expect(result.data!.behaviours[0].label).toBe('Loaded Behaviour');
  });

  it('returns error for invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY_FOR_TESTING, 'not valid json {{{');

    const result = loadNetwork();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to load network');
  });

  it('returns error for missing required fields', () => {
    localStorage.setItem(STORAGE_KEY_FOR_TESTING, JSON.stringify({ foo: 'bar' }));

    const result = loadNetwork();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid network data');
  });

  it('returns error for non-array behaviours', () => {
    localStorage.setItem(
      STORAGE_KEY_FOR_TESTING,
      JSON.stringify({
        version: '1.0.0',
        behaviours: 'not an array',
        outcomes: [],
        values: [],
        links: [],
      })
    );

    const result = loadNetwork();

    expect(result.success).toBe(false);
    expect(result.error).toContain('behaviours');
  });
});

describe('clearNetwork', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes network from localStorage', () => {
    const network = createEmptyNetwork();
    saveNetwork(network);

    expect(localStorage.getItem(STORAGE_KEY_FOR_TESTING)).not.toBeNull();

    const result = clearNetwork();

    expect(result.success).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY_FOR_TESTING)).toBeNull();
  });

  it('succeeds even when no data exists', () => {
    const result = clearNetwork();

    expect(result.success).toBe(true);
  });
});

describe('validateNetworkStructure', () => {
  it('returns valid for correct structure', () => {
    const data = {
      version: '1.0.0',
      behaviours: [],
      outcomes: [],
      values: [],
      links: [],
    };

    const result = validateNetworkStructure(data);

    expect(result.valid).toBe(true);
  });

  it('returns invalid for null', () => {
    const result = validateNetworkStructure(null);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be an object');
  });

  it('returns invalid for non-object', () => {
    const result = validateNetworkStructure('string');

    expect(result.valid).toBe(false);
  });

  it('returns invalid for missing behaviours', () => {
    const result = validateNetworkStructure({
      version: '1.0.0',
      outcomes: [],
      values: [],
      links: [],
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('behaviours');
  });

  it('returns invalid for missing outcomes', () => {
    const result = validateNetworkStructure({
      version: '1.0.0',
      behaviours: [],
      values: [],
      links: [],
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('outcomes');
  });

  it('returns invalid for missing values', () => {
    const result = validateNetworkStructure({
      version: '1.0.0',
      behaviours: [],
      outcomes: [],
      links: [],
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('values');
  });

  it('returns invalid for missing links', () => {
    const result = validateNetworkStructure({
      version: '1.0.0',
      behaviours: [],
      outcomes: [],
      values: [],
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('links');
  });

  it('returns invalid for missing version', () => {
    const result = validateNetworkStructure({
      behaviours: [],
      outcomes: [],
      values: [],
      links: [],
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('version');
  });

  it('accepts populated arrays', () => {
    const data = {
      version: '1.0.0',
      behaviours: [{ id: 'b-1', label: 'Test' }],
      outcomes: [{ id: 'o-1', label: 'Test' }],
      values: [{ id: 'v-1', label: 'Test' }],
      links: [{ id: 'l-1', sourceId: 'b-1', targetId: 'o-1' }],
    };

    const result = validateNetworkStructure(data);

    expect(result.valid).toBe(true);
  });
});

describe('round-trip persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('preserves complete network through save/load cycle', () => {
    const behaviour: Behaviour = {
      id: 'b-123',
      type: 'behaviour',
      label: '30-min evening walk',
      frequency: 'daily',
      cost: 'low',
      contextTags: ['evening', 'outdoor', 'exercise'],
      notes: 'After dinner, around the neighbourhood.',
      createdAt: '2025-12-23T18:00:00.000Z',
      updatedAt: '2025-12-23T18:30:00.000Z',
    };

    const outcome: Outcome = {
      id: 'o-456',
      type: 'outcome',
      label: 'Reduced anxiety',
      notes: 'Noticeable calmness after physical activity.',
      createdAt: '2025-12-23T18:00:00.000Z',
      updatedAt: '2025-12-23T18:00:00.000Z',
    };

    const value: Value = {
      id: 'v-789',
      type: 'value',
      label: 'Peace of mind',
      importance: 'critical',
      neglect: 'somewhat-neglected',
      notes: 'Feeling calm and in control.',
      createdAt: '2025-12-23T18:00:00.000Z',
      updatedAt: '2025-12-23T18:00:00.000Z',
    };

    const boLink: BehaviourOutcomeLink = {
      id: 'l-001',
      type: 'behaviour-outcome',
      sourceId: 'b-123',
      targetId: 'o-456',
      valence: 'positive',
      reliability: 'usually',
      createdAt: '2025-12-23T18:00:00.000Z',
      updatedAt: '2025-12-23T18:00:00.000Z',
    };

    const ovLink: OutcomeValueLink = {
      id: 'l-002',
      type: 'outcome-value',
      sourceId: 'o-456',
      targetId: 'v-789',
      valence: 'positive',
      strength: 'strong',
      createdAt: '2025-12-23T18:00:00.000Z',
      updatedAt: '2025-12-23T18:00:00.000Z',
    };

    const originalNetwork = createNetwork({
      behaviours: [behaviour],
      outcomes: [outcome],
      values: [value],
      links: [boLink, ovLink],
      exportedAt: '2025-12-23T19:00:00.000Z',
    });

    // Save
    const saveResult = saveNetwork(originalNetwork);
    expect(saveResult.success).toBe(true);

    // Load
    const loadResult = loadNetwork();
    expect(loadResult.success).toBe(true);

    const loadedNetwork = loadResult.data!;

    // Verify structure
    expect(loadedNetwork.behaviours).toHaveLength(1);
    expect(loadedNetwork.outcomes).toHaveLength(1);
    expect(loadedNetwork.values).toHaveLength(1);
    expect(loadedNetwork.links).toHaveLength(2);

    // Verify behaviour details
    const loadedBehaviour = loadedNetwork.behaviours[0];
    expect(loadedBehaviour.id).toBe('b-123');
    expect(loadedBehaviour.label).toBe('30-min evening walk');
    expect(loadedBehaviour.frequency).toBe('daily');
    expect(loadedBehaviour.cost).toBe('low');
    expect(loadedBehaviour.contextTags).toEqual(['evening', 'outdoor', 'exercise']);
    expect(loadedBehaviour.notes).toBe('After dinner, around the neighbourhood.');

    // Verify outcome details
    const loadedOutcome = loadedNetwork.outcomes[0];
    expect(loadedOutcome.id).toBe('o-456');
    expect(loadedOutcome.label).toBe('Reduced anxiety');

    // Verify value details
    const loadedValue = loadedNetwork.values[0];
    expect(loadedValue.id).toBe('v-789');
    expect(loadedValue.importance).toBe('critical');
    expect(loadedValue.neglect).toBe('somewhat-neglected');

    // Verify links
    const loadedBoLink = loadedNetwork.links.find(l => l.id === 'l-001') as BehaviourOutcomeLink;
    expect(loadedBoLink.type).toBe('behaviour-outcome');
    expect(loadedBoLink.reliability).toBe('usually');

    const loadedOvLink = loadedNetwork.links.find(l => l.id === 'l-002') as OutcomeValueLink;
    expect(loadedOvLink.type).toBe('outcome-value');
    expect(loadedOvLink.strength).toBe('strong');

    // Verify exportedAt preserved
    expect(loadedNetwork.exportedAt).toBe('2025-12-23T19:00:00.000Z');
  });
});
