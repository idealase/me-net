/**
 * Filter & Search Types
 *
 * Types for filtering and searching the network visualization.
 * See docs/visual-design.md §5.4, §5.5, §5.6
 */

import type { NodeType } from '@/types';

// ============================================================================
// Filter State
// ============================================================================

/**
 * Node type visibility filter.
 * When true, nodes of that type are visible.
 */
export interface NodeTypeFilter {
  behaviour: boolean;
  outcome: boolean;
  value: boolean;
}

/**
 * Edge valence visibility filter.
 * When true, edges of that valence are visible.
 */
export interface ValenceFilter {
  positive: boolean;
  negative: boolean;
}

/**
 * Highlight modes - only one can be active at a time.
 */
export type HighlightMode = 'none' | 'leverage' | 'fragile' | 'conflicts';

/**
 * Complete filter state.
 */
export interface FilterState {
  /** Node type visibility */
  nodeTypes: NodeTypeFilter;

  /** Edge valence visibility */
  valence: ValenceFilter;

  /** Search query (case-insensitive substring match) */
  searchQuery: string;

  /** Active highlight mode */
  highlightMode: HighlightMode;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create default filter state (everything visible, no search, no highlight).
 */
export function createDefaultFilterState(): FilterState {
  return {
    nodeTypes: {
      behaviour: true,
      outcome: true,
      value: true,
    },
    valence: {
      positive: true,
      negative: true,
    },
    searchQuery: '',
    highlightMode: 'none',
  };
}

// ============================================================================
// Filter Logic
// ============================================================================

/**
 * Check if a node should be visible based on filter state.
 */
export function isNodeVisible(nodeType: NodeType, filter: FilterState): boolean {
  return filter.nodeTypes[nodeType];
}

/**
 * Check if a node matches the search query.
 * Returns true if search is empty or label contains query (case-insensitive).
 */
export function nodeMatchesSearch(label: string, query: string): boolean {
  if (query.trim() === '') {
    return true;
  }
  return label.toLowerCase().includes(query.toLowerCase().trim());
}

/**
 * Check if an edge should be visible based on filter state.
 * An edge is visible if:
 * - Its valence is enabled in the filter
 * - Both source and target nodes are visible
 */
export function isEdgeVisible(
  valence: 'positive' | 'negative',
  sourceType: NodeType,
  targetType: NodeType,
  filter: FilterState
): boolean {
  // Check valence filter
  if (!filter.valence[valence]) {
    return false;
  }

  // Check if both endpoints are visible
  if (!isNodeVisible(sourceType, filter) || !isNodeVisible(targetType, filter)) {
    return false;
  }

  return true;
}

/**
 * Determine if a node should be dimmed.
 * A node is dimmed when:
 * - Search is active and node doesn't match
 * - Highlight mode is active and node is not in highlighted set
 */
export function shouldDimNode(
  label: string,
  nodeId: string,
  filter: FilterState,
  highlightedNodeIds: Set<string>
): boolean {
  // If search is active, dim non-matching nodes
  if (filter.searchQuery.trim() !== '') {
    if (!nodeMatchesSearch(label, filter.searchQuery)) {
      return true;
    }
  }

  // If highlight mode is active, dim non-highlighted nodes
  if (filter.highlightMode !== 'none' && highlightedNodeIds.size > 0) {
    if (!highlightedNodeIds.has(nodeId)) {
      return true;
    }
  }

  return false;
}
