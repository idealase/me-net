/**
 * Filter Types Tests
 */

import {
  createDefaultFilterState,
  isEdgeVisible,
  isNodeVisible,
  nodeMatchesSearch,
  shouldDimNode,
} from './types';
import type { FilterState } from './types';

describe('Filter Types', () => {
  describe('createDefaultFilterState', () => {
    it('creates state with all node types visible', () => {
      const state = createDefaultFilterState();

      expect(state.nodeTypes.behaviour).toBe(true);
      expect(state.nodeTypes.outcome).toBe(true);
      expect(state.nodeTypes.value).toBe(true);
    });

    it('creates state with all valences visible', () => {
      const state = createDefaultFilterState();

      expect(state.valence.positive).toBe(true);
      expect(state.valence.negative).toBe(true);
    });

    it('creates state with empty search query', () => {
      const state = createDefaultFilterState();

      expect(state.searchQuery).toBe('');
    });

    it('creates state with no highlight mode', () => {
      const state = createDefaultFilterState();

      expect(state.highlightMode).toBe('none');
    });
  });

  describe('isNodeVisible', () => {
    it('returns true when node type is enabled', () => {
      const filter = createDefaultFilterState();

      expect(isNodeVisible('behaviour', filter)).toBe(true);
      expect(isNodeVisible('outcome', filter)).toBe(true);
      expect(isNodeVisible('value', filter)).toBe(true);
    });

    it('returns false when node type is disabled', () => {
      const filter = createDefaultFilterState();
      filter.nodeTypes.behaviour = false;
      filter.nodeTypes.outcome = false;
      filter.nodeTypes.value = false;

      expect(isNodeVisible('behaviour', filter)).toBe(false);
      expect(isNodeVisible('outcome', filter)).toBe(false);
      expect(isNodeVisible('value', filter)).toBe(false);
    });
  });

  describe('nodeMatchesSearch', () => {
    it('returns true for empty search query', () => {
      expect(nodeMatchesSearch('Any label', '')).toBe(true);
      expect(nodeMatchesSearch('Any label', '   ')).toBe(true);
    });

    it('matches case-insensitively', () => {
      expect(nodeMatchesSearch('Morning Walk', 'morning')).toBe(true);
      expect(nodeMatchesSearch('Morning Walk', 'MORNING')).toBe(true);
      expect(nodeMatchesSearch('Morning Walk', 'MoRnInG')).toBe(true);
    });

    it('matches substring anywhere in label', () => {
      expect(nodeMatchesSearch('Morning Walk', 'walk')).toBe(true);
      expect(nodeMatchesSearch('Morning Walk', 'ning')).toBe(true);
      expect(nodeMatchesSearch('Morning Walk', 'rn')).toBe(true);
    });

    it('returns false when no match', () => {
      expect(nodeMatchesSearch('Morning Walk', 'evening')).toBe(false);
      expect(nodeMatchesSearch('Morning Walk', 'xyz')).toBe(false);
    });

    it('trims whitespace from query', () => {
      expect(nodeMatchesSearch('Morning Walk', '  walk  ')).toBe(true);
    });
  });

  describe('isEdgeVisible', () => {
    let filter: FilterState;

    beforeEach(() => {
      filter = createDefaultFilterState();
    });

    it('returns true when valence and both endpoints are visible', () => {
      expect(isEdgeVisible('positive', 'behaviour', 'outcome', filter)).toBe(true);
      expect(isEdgeVisible('negative', 'outcome', 'value', filter)).toBe(true);
    });

    it('returns false when valence is hidden', () => {
      filter.valence.positive = false;
      expect(isEdgeVisible('positive', 'behaviour', 'outcome', filter)).toBe(false);
      expect(isEdgeVisible('negative', 'behaviour', 'outcome', filter)).toBe(true);

      filter.valence.negative = false;
      expect(isEdgeVisible('negative', 'outcome', 'value', filter)).toBe(false);
    });

    it('returns false when source node type is hidden', () => {
      filter.nodeTypes.behaviour = false;
      expect(isEdgeVisible('positive', 'behaviour', 'outcome', filter)).toBe(false);
    });

    it('returns false when target node type is hidden', () => {
      filter.nodeTypes.outcome = false;
      expect(isEdgeVisible('positive', 'behaviour', 'outcome', filter)).toBe(false);
    });
  });

  describe('shouldDimNode', () => {
    let filter: FilterState;
    let highlightedIds: Set<string>;

    beforeEach(() => {
      filter = createDefaultFilterState();
      highlightedIds = new Set();
    });

    it('returns false when no search and no highlight mode', () => {
      expect(shouldDimNode('Any Label', 'n1', filter, highlightedIds)).toBe(false);
    });

    it('returns true when search is active and node does not match', () => {
      filter.searchQuery = 'walk';
      expect(shouldDimNode('Morning Walk', 'n1', filter, highlightedIds)).toBe(false);
      expect(shouldDimNode('Evening Jog', 'n2', filter, highlightedIds)).toBe(true);
    });

    it('returns true when highlight mode active and node not highlighted', () => {
      filter.highlightMode = 'leverage';
      highlightedIds.add('n1');
      highlightedIds.add('n2');

      expect(shouldDimNode('Label 1', 'n1', filter, highlightedIds)).toBe(false);
      expect(shouldDimNode('Label 3', 'n3', filter, highlightedIds)).toBe(true);
    });

    it('returns false when highlight mode is none', () => {
      filter.highlightMode = 'none';
      highlightedIds.add('n1');

      // Even with highlighted IDs, if mode is 'none', don't dim
      expect(shouldDimNode('Label 2', 'n2', filter, highlightedIds)).toBe(false);
    });

    it('returns false when highlight set is empty', () => {
      filter.highlightMode = 'leverage';
      // Empty highlight set means no dimming

      expect(shouldDimNode('Any Label', 'n1', filter, highlightedIds)).toBe(false);
    });
  });
});
