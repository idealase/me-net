/**
 * Graph Data Transformation
 *
 * Converts Network domain model to D3-compatible graph data.
 */

import type { Network, Reliability, Strength } from '@/types';

import type {
  AnyGraphNode,
  BehaviourGraphNode,
  GraphData,
  GraphEdge,
  OutcomeGraphNode,
  ValueGraphNode,
} from './types';

// ============================================================================
// Strength Normalization
// ============================================================================

/**
 * Convert reliability to normalized 0-1 value.
 * Per docs/metrics-and-insights.md:
 * - always = 1.0
 * - usually = 0.75
 * - sometimes = 0.5
 * - rarely = 0.25
 */
export function normalizeReliability(reliability: Reliability): number {
  const map: Record<Reliability, number> = {
    always: 1.0,
    usually: 0.75,
    sometimes: 0.5,
    rarely: 0.25,
  };
  return map[reliability];
}

/**
 * Convert strength to normalized 0-1 value.
 * Per docs/metrics-and-insights.md:
 * - strong = 1.0
 * - moderate = 0.6
 * - weak = 0.3
 */
export function normalizeStrength(strength: Strength): number {
  const map: Record<Strength, number> = {
    strong: 1.0,
    moderate: 0.6,
    weak: 0.3,
  };
  return map[strength];
}

// ============================================================================
// Graph Data Transformation
// ============================================================================

/**
 * Transform Network domain model to D3-compatible graph data.
 */
export function networkToGraphData(network: Network): GraphData {
  // Transform behaviours to graph nodes
  const behaviourNodes: BehaviourGraphNode[] = network.behaviours.map((b) => ({
    id: b.id,
    label: b.label,
    type: 'behaviour' as const,
    data: b,
  }));

  // Transform outcomes to graph nodes
  const outcomeNodes: OutcomeGraphNode[] = network.outcomes.map((o) => ({
    id: o.id,
    label: o.label,
    type: 'outcome' as const,
    data: o,
  }));

  // Transform values to graph nodes
  const valueNodes: ValueGraphNode[] = network.values.map((v) => ({
    id: v.id,
    label: v.label,
    type: 'value' as const,
    data: v,
  }));

  const nodes: AnyGraphNode[] = [...behaviourNodes, ...outcomeNodes, ...valueNodes];

  // Transform links to graph edges
  const edges: GraphEdge[] = network.links.map((link) => {
    const strength =
      link.type === 'behaviour-outcome'
        ? normalizeReliability(link.reliability)
        : normalizeStrength(link.strength);

    return {
      id: link.id,
      source: link.sourceId,
      target: link.targetId,
      type: link.type,
      valence: link.valence,
      strength,
      data: link,
    };
  });

  return { nodes, edges };
}

/**
 * Get all node IDs connected to a given node (direct neighbors).
 */
export function getConnectedNodeIds(graphData: GraphData, nodeId: string): Set<string> {
  const connected = new Set<string>();

  for (const edge of graphData.edges) {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;

    if (sourceId === nodeId) {
      connected.add(targetId);
    } else if (targetId === nodeId) {
      connected.add(sourceId);
    }
  }

  return connected;
}

/**
 * Get all edge IDs connected to a given node.
 */
export function getConnectedEdgeIds(graphData: GraphData, nodeId: string): Set<string> {
  const connected = new Set<string>();

  for (const edge of graphData.edges) {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;

    if (sourceId === nodeId || targetId === nodeId) {
      connected.add(edge.id);
    }
  }

  return connected;
}

/**
 * Truncate label for display (max 20 chars per visual-design.md).
 */
export function truncateLabel(label: string, maxLength: number = 20): string {
  if (label.length <= maxLength) {
    return label;
  }
  return label.substring(0, maxLength - 1) + '…';
}
