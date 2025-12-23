/**
 * Graph Visualization Types
 *
 * Types for D3.js visualization of the M-E Network.
 * See docs/visual-design.md for visual encoding specification.
 */

import type { Behaviour, Outcome, Value, Link, NodeType, Valence } from '@/types';

// ============================================================================
// Graph Node Types
// ============================================================================

/**
 * Base graph node with position data for D3 layout.
 */
export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x?: number;
  y?: number;
  fx?: number | null; // Fixed x position (for dragging)
  fy?: number | null; // Fixed y position (for dragging)
}

/**
 * Graph node for Behaviour entities.
 */
export interface BehaviourGraphNode extends GraphNode {
  type: 'behaviour';
  data: Behaviour;
}

/**
 * Graph node for Outcome entities.
 */
export interface OutcomeGraphNode extends GraphNode {
  type: 'outcome';
  data: Outcome;
}

/**
 * Graph node for Value entities.
 */
export interface ValueGraphNode extends GraphNode {
  type: 'value';
  data: Value;
}

export type AnyGraphNode = BehaviourGraphNode | OutcomeGraphNode | ValueGraphNode;

// ============================================================================
// Graph Edge Types
// ============================================================================

/**
 * Graph edge with source/target references for D3 force layout.
 */
export interface GraphEdge {
  id: string;
  source: string | AnyGraphNode;
  target: string | AnyGraphNode;
  type: 'behaviour-outcome' | 'outcome-value';
  valence: Valence;
  strength: number; // Normalized 0-1 for visual encoding
  data: Link;
}

// ============================================================================
// Visual Configuration
// ============================================================================

/**
 * Visual encoding configuration per node type.
 */
export interface NodeVisualConfig {
  shape: 'rect' | 'diamond' | 'circle';
  fill: string;
  stroke: string;
  width: number;
  height: number;
}

/**
 * Visual encoding configuration per edge valence.
 */
export interface EdgeVisualConfig {
  stroke: string;
  strokeDasharray: string;
  markerEnd: string;
}

/**
 * Complete visual theme configuration.
 */
export interface GraphTheme {
  nodes: Record<NodeType, NodeVisualConfig>;
  edges: {
    positive: EdgeVisualConfig;
    negative: EdgeVisualConfig;
  };
  background: string;
  text: {
    fill: string;
    fontSize: number;
    fontFamily: string;
  };
}

// ============================================================================
// Layout Configuration
// ============================================================================

export type LayoutType = 'layered' | 'force';

export interface LayeredLayoutConfig {
  type: 'layered';
  columnGap: number; // Horizontal gap between columns
  rowGap: number; // Vertical gap between nodes in same column
  padding: number; // Canvas padding
}

export interface ForceLayoutConfig {
  type: 'force';
  linkDistance: number;
  chargeStrength: number;
  collisionRadius: number;
}

export type LayoutConfig = LayeredLayoutConfig | ForceLayoutConfig;

// ============================================================================
// Interaction State
// ============================================================================

/**
 * Node type visibility filter.
 */
export interface NodeTypeVisibility {
  behaviour: boolean;
  outcome: boolean;
  value: boolean;
}

/**
 * Edge valence visibility filter.
 */
export interface ValenceVisibility {
  positive: boolean;
  negative: boolean;
}

export interface GraphInteractionState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  /** Nodes highlighted due to hover (connected neighborhood). */
  hoverHighlightedNodeIds: Set<string>;
  /** Nodes highlighted due to an explicit highlight mode (filters panel). */
  modeHighlightedNodeIds: Set<string>;
  /** Search query for filtering nodes */
  searchQuery: string;
  /** Node type visibility */
  nodeTypeVisibility: NodeTypeVisibility;
  /** Edge valence visibility */
  valenceVisibility: ValenceVisibility;
}

// ============================================================================
// Graph Data
// ============================================================================

export interface GraphData {
  nodes: AnyGraphNode[];
  edges: GraphEdge[];
}

// ============================================================================
// Graph Options
// ============================================================================

export interface GraphOptions {
  width: number;
  height: number;
  layout: LayoutConfig;
  theme: GraphTheme;
  zoomExtent: [number, number]; // [minZoom, maxZoom]
  transitionDuration: number;
}
