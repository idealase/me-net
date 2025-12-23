/**
 * Graph Components - Public API
 *
 * Re-exports all graph visualization components and utilities.
 */

// Main component
export { NetworkGraph } from './NetworkGraph';

// Types
export type {
  GraphNode,
  BehaviourGraphNode,
  OutcomeGraphNode,
  ValueGraphNode,
  AnyGraphNode,
  GraphEdge,
  GraphData,
  GraphOptions,
  GraphTheme,
  GraphInteractionState,
  LayoutType,
  LayeredLayoutConfig,
  ForceLayoutConfig,
  LayoutConfig,
  NodeVisualConfig,
  EdgeVisualConfig,
} from './types';
export type { LegendOptions } from './legend';

// Theme and configuration
export { defaultTheme, defaultLayeredLayout, defaultGraphOptions } from './theme';

// Data transformation utilities
export {
  networkToGraphData,
  normalizeReliability,
  normalizeStrength,
  getConnectedNodeIds,
  getConnectedEdgeIds,
  truncateLabel,
} from './data';

// Layout utilities
export { applyLayeredLayout, sortNodesByConnectivity, getColumnBoundaries } from './layout';
