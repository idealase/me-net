/**
 * Layered Layout Algorithm
 *
 * Arranges nodes in three columns: Behaviours → Outcomes → Values.
 * Per visual-design.md §4.1 Layered Layout.
 */

import type { AnyGraphNode, GraphData, LayeredLayoutConfig } from './types';

/**
 * Column indices for layered layout.
 */
const LAYER_COLUMN = {
  behaviour: 0,
  outcome: 1,
  value: 2,
} as const;

/**
 * Apply layered layout to graph data.
 * Mutates node x/y positions in place.
 *
 * @param graphData - The graph data with nodes and edges
 * @param config - Layout configuration
 * @param canvasWidth - Available canvas width
 * @param canvasHeight - Available canvas height
 */
export function applyLayeredLayout(
  graphData: GraphData,
  config: LayeredLayoutConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Group nodes by type
  const columns: Record<number, AnyGraphNode[]> = {
    0: [], // Behaviours
    1: [], // Outcomes
    2: [], // Values
  };

  for (const node of graphData.nodes) {
    const col = LAYER_COLUMN[node.type];
    columns[col]!.push(node);
  }

  // Calculate column x positions (centered in canvas)
  const totalWidth = 2 * config.columnGap + 2 * config.padding;
  const startX = (canvasWidth - totalWidth) / 2 + config.padding;

  const columnX = [
    startX, // Behaviours
    startX + config.columnGap, // Outcomes
    startX + 2 * config.columnGap, // Values
  ];

  // Position nodes in each column
  for (let col = 0; col < 3; col++) {
    const nodesInColumn = columns[col]!;
    const columnHeight = (nodesInColumn.length - 1) * config.rowGap;
    const startY = (canvasHeight - columnHeight) / 2;

    nodesInColumn.forEach((node, index) => {
      node.x = columnX[col];
      node.y = startY + index * config.rowGap;
    });
  }
}

/**
 * Sort nodes within columns by connectivity.
 * Nodes with more connections to adjacent columns are placed closer
 * to minimize edge crossings (simple heuristic).
 */
export function sortNodesByConnectivity(graphData: GraphData): void {
  // Build adjacency map
  const adjacency = new Map<string, Set<string>>();

  for (const node of graphData.nodes) {
    adjacency.set(node.id, new Set());
  }

  for (const edge of graphData.edges) {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    adjacency.get(sourceId)?.add(targetId);
    adjacency.get(targetId)?.add(sourceId);
  }

  // Group by type
  const behaviours = graphData.nodes.filter((n) => n.type === 'behaviour');
  const outcomes = graphData.nodes.filter((n) => n.type === 'outcome');
  const values = graphData.nodes.filter((n) => n.type === 'value');

  // Sort outcomes by number of connections (most connected in middle)
  outcomes.sort((a, b) => {
    const aCount = adjacency.get(a.id)?.size ?? 0;
    const bCount = adjacency.get(b.id)?.size ?? 0;
    return bCount - aCount;
  });

  // Sort behaviours by average y-position of connected outcomes
  const getAverageOutcomeY = (nodeId: string): number => {
    const connected = adjacency.get(nodeId);
    if (!connected || connected.size === 0) return 0;

    let sum = 0;
    let count = 0;
    for (const outId of connected) {
      const outcome = outcomes.find((o) => o.id === outId);
      if (outcome?.y !== undefined) {
        sum += outcome.y;
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  };

  // First pass: position outcomes
  const columnHeight = (outcomes.length - 1) * 80; // Default row gap
  outcomes.forEach((node, index) => {
    node.y = index * 80 - columnHeight / 2;
  });

  // Sort behaviours by their connected outcomes' positions
  behaviours.sort((a, b) => getAverageOutcomeY(a.id) - getAverageOutcomeY(b.id));

  // Sort values by their connected outcomes' positions
  const getAverageOutcomeYForValue = (nodeId: string): number => {
    const connected = adjacency.get(nodeId);
    if (!connected || connected.size === 0) return 0;

    let sum = 0;
    let count = 0;
    for (const outId of connected) {
      const outcome = outcomes.find((o) => o.id === outId);
      if (outcome?.y !== undefined) {
        sum += outcome.y;
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  };

  values.sort((a, b) => getAverageOutcomeYForValue(a.id) - getAverageOutcomeYForValue(b.id));

  // Rebuild nodes array in sorted order
  graphData.nodes.length = 0;
  graphData.nodes.push(...behaviours, ...outcomes, ...values);
}

/**
 * Get column boundaries for rendering guidelines or debugging.
 */
export function getColumnBoundaries(
  config: LayeredLayoutConfig,
  canvasWidth: number
): { x: number; label: string }[] {
  const totalWidth = 2 * config.columnGap + 2 * config.padding;
  const startX = (canvasWidth - totalWidth) / 2 + config.padding;

  return [
    { x: startX, label: 'Behaviours' },
    { x: startX + config.columnGap, label: 'Outcomes' },
    { x: startX + 2 * config.columnGap, label: 'Values' },
  ];
}
