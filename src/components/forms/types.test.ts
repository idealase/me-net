/**
 * Tests for Form Types and Utilities
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
  behaviourToFormData,
  findNode,
  getAutocompleteSuggestions,
  getConnectedNodes,
  getLabelsForType,
  linkExists,
  outcomeToFormData,
  validateLabel,
  valueToFormData,
} from './types';

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestNetwork(): Network {
  const behaviours: Behaviour[] = [
    {
      id: 'b-1',
      type: 'behaviour',
      label: 'Morning meditation',
      frequency: 'daily',
      cost: 'low',
      contextTags: ['morning', 'alone'],
      notes: 'Test notes',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'b-2',
      type: 'behaviour',
      label: 'Evening walk',
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
      label: 'Mental clarity',
      notes: 'Outcome notes',
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
  ];

  const values: Value[] = [
    {
      id: 'v-1',
      type: 'value',
      label: 'Health',
      importance: 'high',
      neglect: 'adequately-met',
      notes: 'Value notes',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'v-2',
      type: 'value',
      label: 'Productivity',
      importance: 'medium',
      neglect: 'somewhat-neglected',
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
    {
      id: 'l-3',
      type: 'outcome-value',
      sourceId: 'o-1',
      targetId: 'v-2',
      valence: 'negative',
      strength: 'weak',
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
// behaviourToFormData Tests
// ============================================================================

describe('behaviourToFormData', () => {
  it('converts behaviour to form data', () => {
    const behaviour: Behaviour = {
      id: 'b-1',
      type: 'behaviour',
      label: 'Test Behaviour',
      frequency: 'daily',
      cost: 'low',
      contextTags: ['tag1', 'tag2'],
      notes: 'Some notes',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = behaviourToFormData(behaviour);

    expect(result.label).toBe('Test Behaviour');
    expect(result.frequency).toBe('daily');
    expect(result.cost).toBe('low');
    expect(result.contextTags).toEqual(['tag1', 'tag2']);
    expect(result.notes).toBe('Some notes');
  });

  it('converts empty notes to empty string', () => {
    const behaviour: Behaviour = {
      id: 'b-1',
      type: 'behaviour',
      label: 'Test',
      frequency: 'weekly',
      cost: 'medium',
      contextTags: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = behaviourToFormData(behaviour);
    expect(result.notes).toBe('');
  });

  it('creates a copy of contextTags array', () => {
    const behaviour: Behaviour = {
      id: 'b-1',
      type: 'behaviour',
      label: 'Test',
      frequency: 'weekly',
      cost: 'medium',
      contextTags: ['original'],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = behaviourToFormData(behaviour);
    result.contextTags.push('modified');

    expect(behaviour.contextTags).toEqual(['original']);
  });
});

// ============================================================================
// outcomeToFormData Tests
// ============================================================================

describe('outcomeToFormData', () => {
  it('converts outcome to form data', () => {
    const outcome: Outcome = {
      id: 'o-1',
      type: 'outcome',
      label: 'Test Outcome',
      notes: 'Outcome notes',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = outcomeToFormData(outcome);

    expect(result.label).toBe('Test Outcome');
    expect(result.notes).toBe('Outcome notes');
  });

  it('handles undefined notes', () => {
    const outcome: Outcome = {
      id: 'o-1',
      type: 'outcome',
      label: 'Test',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = outcomeToFormData(outcome);
    expect(result.notes).toBe('');
  });
});

// ============================================================================
// valueToFormData Tests
// ============================================================================

describe('valueToFormData', () => {
  it('converts value to form data', () => {
    const value: Value = {
      id: 'v-1',
      type: 'value',
      label: 'Test Value',
      importance: 'critical',
      neglect: 'severely-neglected',
      notes: 'Value notes',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const result = valueToFormData(value);

    expect(result.label).toBe('Test Value');
    expect(result.importance).toBe('critical');
    expect(result.neglect).toBe('severely-neglected');
    expect(result.notes).toBe('Value notes');
  });
});

// ============================================================================
// validateLabel Tests
// ============================================================================

describe('validateLabel', () => {
  it('returns error for empty label', () => {
    const error = validateLabel('', []);
    expect(error).not.toBeNull();
    expect(error?.field).toBe('label');
    expect(error?.message).toContain('required');
  });

  it('returns error for whitespace-only label', () => {
    const error = validateLabel('   ', []);
    expect(error).not.toBeNull();
    expect(error?.message).toContain('required');
  });

  it('returns error for label over 100 characters', () => {
    const longLabel = 'a'.repeat(101);
    const error = validateLabel(longLabel, []);
    expect(error).not.toBeNull();
    expect(error?.message).toContain('100 characters');
  });

  it('returns error for duplicate label', () => {
    const error = validateLabel('existing', ['existing', 'other']);
    expect(error).not.toBeNull();
    expect(error?.message).toContain('already exists');
  });

  it('duplicate check is case-insensitive', () => {
    const error = validateLabel('EXISTING', ['existing', 'other']);
    expect(error).not.toBeNull();
    expect(error?.message).toContain('already exists');
  });

  it('allows duplicate when editing same label', () => {
    const error = validateLabel('existing', ['existing', 'other'], 'existing');
    expect(error).toBeNull();
  });

  it('returns null for valid label', () => {
    const error = validateLabel('New Label', ['existing', 'other']);
    expect(error).toBeNull();
  });
});

// ============================================================================
// getLabelsForType Tests
// ============================================================================

describe('getLabelsForType', () => {
  it('returns behaviour labels', () => {
    const network = createTestNetwork();
    const labels = getLabelsForType(network, 'behaviour');
    expect(labels).toEqual(['Morning meditation', 'Evening walk']);
  });

  it('returns outcome labels', () => {
    const network = createTestNetwork();
    const labels = getLabelsForType(network, 'outcome');
    expect(labels).toEqual(['Mental clarity', 'Better sleep']);
  });

  it('returns value labels', () => {
    const network = createTestNetwork();
    const labels = getLabelsForType(network, 'value');
    expect(labels).toEqual(['Health', 'Productivity']);
  });
});

// ============================================================================
// linkExists Tests
// ============================================================================

describe('linkExists', () => {
  it('returns true when link exists', () => {
    const network = createTestNetwork();
    expect(linkExists(network, 'b-1', 'o-1')).toBe(true);
    expect(linkExists(network, 'o-1', 'v-1')).toBe(true);
  });

  it('returns false when link does not exist', () => {
    const network = createTestNetwork();
    expect(linkExists(network, 'b-1', 'o-2')).toBe(false);
    expect(linkExists(network, 'b-2', 'o-1')).toBe(false);
  });

  it('direction matters', () => {
    const network = createTestNetwork();
    expect(linkExists(network, 'o-1', 'b-1')).toBe(false); // Reverse of existing link
  });
});

// ============================================================================
// getAutocompleteSuggestions Tests
// ============================================================================

describe('getAutocompleteSuggestions', () => {
  it('returns all nodes of type when query is empty', () => {
    const network = createTestNetwork();
    const suggestions = getAutocompleteSuggestions(network, 'behaviour', '');

    expect(suggestions).toHaveLength(2);
    expect(suggestions[0]!.label).toBe('Morning meditation');
    expect(suggestions[0]!.type).toBe('behaviour');
  });

  it('filters by query (case-insensitive)', () => {
    const network = createTestNetwork();
    const suggestions = getAutocompleteSuggestions(network, 'behaviour', 'MORNING');

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]!.label).toBe('Morning meditation');
  });

  it('excludes specified IDs', () => {
    const network = createTestNetwork();
    const suggestions = getAutocompleteSuggestions(network, 'behaviour', '', ['b-1']);

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]!.id).toBe('b-2');
  });

  it('limits results to 10', () => {
    const network: Network = {
      version: '1.0.0',
      behaviours: Array.from({ length: 15 }, (_, i) => ({
        id: `b-${i}`,
        type: 'behaviour' as const,
        label: `Behaviour ${i}`,
        frequency: 'daily' as const,
        cost: 'low' as const,
        contextTags: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      })),
      outcomes: [],
      values: [],
      links: [],
    };

    const suggestions = getAutocompleteSuggestions(network, 'behaviour', '');
    expect(suggestions).toHaveLength(10);
  });

  it('works for outcomes', () => {
    const network = createTestNetwork();
    const suggestions = getAutocompleteSuggestions(network, 'outcome', 'clarity');

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]!.label).toBe('Mental clarity');
    expect(suggestions[0]!.type).toBe('outcome');
  });

  it('works for values', () => {
    const network = createTestNetwork();
    const suggestions = getAutocompleteSuggestions(network, 'value', 'health');

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]!.label).toBe('Health');
    expect(suggestions[0]!.type).toBe('value');
  });

  describe('create-on-link support', () => {
    it('includes create option when allowCreate is true and no exact match', () => {
      const network = createTestNetwork();
      const suggestions = getAutocompleteSuggestions(network, 'outcome', 'New Outcome', [], true);

      // Should have create option at the end
      const createOption = suggestions.find(s => s.isCreateNew === true);
      expect(createOption).toBeDefined();
      expect(createOption?.label).toBe('New Outcome');
      expect(createOption?.id).toBe('__create__New Outcome');
    });

    it('does not include create option when exact match exists', () => {
      const network = createTestNetwork();
      const suggestions = getAutocompleteSuggestions(network, 'outcome', 'Mental clarity', [], true);

      const createOption = suggestions.find(s => s.isCreateNew === true);
      expect(createOption).toBeUndefined();
    });

    it('exact match is case-insensitive', () => {
      const network = createTestNetwork();
      const suggestions = getAutocompleteSuggestions(network, 'outcome', 'MENTAL CLARITY', [], true);

      const createOption = suggestions.find(s => s.isCreateNew === true);
      expect(createOption).toBeUndefined();
    });

    it('does not include create option when allowCreate is false', () => {
      const network = createTestNetwork();
      const suggestions = getAutocompleteSuggestions(network, 'outcome', 'New Outcome', [], false);

      const createOption = suggestions.find(s => s.isCreateNew === true);
      expect(createOption).toBeUndefined();
    });

    it('does not include create option when allowCreate is not provided', () => {
      const network = createTestNetwork();
      const suggestions = getAutocompleteSuggestions(network, 'outcome', 'New Outcome', []);

      const createOption = suggestions.find(s => s.isCreateNew === true);
      expect(createOption).toBeUndefined();
    });

    it('does not include create option when query is empty', () => {
      const network = createTestNetwork();
      const suggestions = getAutocompleteSuggestions(network, 'outcome', '', [], true);

      const createOption = suggestions.find(s => s.isCreateNew === true);
      expect(createOption).toBeUndefined();
    });

    it('trims whitespace from create option label', () => {
      const network = createTestNetwork();
      const suggestions = getAutocompleteSuggestions(network, 'outcome', '  New Outcome  ', [], true);

      const createOption = suggestions.find(s => s.isCreateNew === true);
      expect(createOption).toBeDefined();
      expect(createOption?.label).toBe('New Outcome');
    });

    it('works for values type', () => {
      const network = createTestNetwork();
      const suggestions = getAutocompleteSuggestions(network, 'value', 'New Value', [], true);

      const createOption = suggestions.find(s => s.isCreateNew === true);
      expect(createOption).toBeDefined();
      expect(createOption?.type).toBe('value');
    });
  });
});

// ============================================================================
// findNode Tests
// ============================================================================

describe('findNode', () => {
  it('finds behaviour by ID', () => {
    const network = createTestNetwork();
    const node = findNode(network, 'b-1');

    expect(node).toBeDefined();
    expect(node?.type).toBe('behaviour');
    expect(node?.label).toBe('Morning meditation');
  });

  it('finds outcome by ID', () => {
    const network = createTestNetwork();
    const node = findNode(network, 'o-1');

    expect(node).toBeDefined();
    expect(node?.type).toBe('outcome');
    expect(node?.label).toBe('Mental clarity');
  });

  it('finds value by ID', () => {
    const network = createTestNetwork();
    const node = findNode(network, 'v-1');

    expect(node).toBeDefined();
    expect(node?.type).toBe('value');
    expect(node?.label).toBe('Health');
  });

  it('returns undefined for non-existent ID', () => {
    const network = createTestNetwork();
    const node = findNode(network, 'nonexistent');

    expect(node).toBeUndefined();
  });
});

// ============================================================================
// getConnectedNodes Tests
// ============================================================================

describe('getConnectedNodes', () => {
  it('returns outgoing connections for behaviour', () => {
    const network = createTestNetwork();
    const connections = getConnectedNodes(network, 'b-1');

    expect(connections).toHaveLength(1);
    expect(connections[0]!.id).toBe('o-1');
    expect(connections[0]!.direction).toBe('outgoing');
    expect(connections[0]!.valence).toBe('positive');
    expect(connections[0]!.reliability).toBe('usually');
  });

  it('returns incoming and outgoing connections for outcome', () => {
    const network = createTestNetwork();
    const connections = getConnectedNodes(network, 'o-1');

    // o-1 has incoming from b-1 and outgoing to v-1, v-2
    expect(connections).toHaveLength(3);

    const incoming = connections.filter((c) => c.direction === 'incoming');
    const outgoing = connections.filter((c) => c.direction === 'outgoing');

    expect(incoming).toHaveLength(1);
    expect(incoming[0]!.id).toBe('b-1');

    expect(outgoing).toHaveLength(2);
    expect(outgoing.map((c) => c.id).sort()).toEqual(['v-1', 'v-2']);
  });

  it('returns incoming connections for value', () => {
    const network = createTestNetwork();
    const connections = getConnectedNodes(network, 'v-1');

    expect(connections).toHaveLength(1);
    expect(connections[0]!.id).toBe('o-1');
    expect(connections[0]!.direction).toBe('incoming');
    expect(connections[0]!.strength).toBe('strong');
  });

  it('returns empty array for unconnected node', () => {
    const network = createTestNetwork();
    const connections = getConnectedNodes(network, 'b-2'); // b-2 has no links

    expect(connections).toHaveLength(0);
  });

  it('includes correct link metadata', () => {
    const network = createTestNetwork();
    const connections = getConnectedNodes(network, 'o-1');

    // Find the negative link to v-2
    const negativeLink = connections.find((c) => c.id === 'v-2');
    expect(negativeLink).toBeDefined();
    expect(negativeLink?.valence).toBe('negative');
    expect(negativeLink?.strength).toBe('weak');
  });
});
