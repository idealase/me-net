/**
 * SVG Renderer - Edges
 *
 * Renders edges as SVG path elements with valence and strength encoding.
 * Per visual-design.md §3 Edge Encoding.
 */

import * as d3 from 'd3';


import { getNodeBoundaryPoint } from './nodes';
import { edgeOpacityScale, edgeWidthScale } from './theme';
import type { AnyGraphNode, GraphEdge, GraphTheme } from './types';

/**
 * Calculate edge stroke width from normalized strength.
 */
export function getEdgeWidth(strength: number): number {
  return edgeWidthScale.min + strength * (edgeWidthScale.max - edgeWidthScale.min);
}

/**
 * Calculate edge opacity from normalized strength.
 */
export function getEdgeOpacity(strength: number): number {
  return edgeOpacityScale.min + strength * (edgeOpacityScale.max - edgeOpacityScale.min);
}

/**
 * Generate path data for an edge.
 * Uses straight lines for layered layout.
 */
export function generateEdgePath(
  source: AnyGraphNode,
  target: AnyGraphNode,
  theme: GraphTheme
): string {
  const sourceX = source.x ?? 0;
  const sourceY = source.y ?? 0;
  const targetX = target.x ?? 0;
  const targetY = target.y ?? 0;

  // Get boundary points
  const sourcePoint = getNodeBoundaryPoint(source, targetX, targetY, theme);
  const targetPoint = getNodeBoundaryPoint(target, sourceX, sourceY, theme);

  // Offset target point slightly for arrow marker
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const arrowOffset = 8; // Space for arrow marker
  const adjustedTarget = {
    x: targetPoint.x - (dx / len) * arrowOffset,
    y: targetPoint.y - (dy / len) * arrowOffset,
  };

  return `M ${sourcePoint.x},${sourcePoint.y} L ${adjustedTarget.x},${adjustedTarget.y}`;
}

/**
 * Render edges with visual encoding.
 */
export function renderEdges(
  edgeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  edges: GraphEdge[],
  theme: GraphTheme
): d3.Selection<SVGPathElement, GraphEdge, SVGGElement, unknown> {
  const edgeSelection = edgeGroup
    .selectAll<SVGPathElement, GraphEdge>('path.edge')
    .data(edges, (d) => d.id);

  // Exit
  edgeSelection.exit().remove();

  // Enter
  const edgeEnter = edgeSelection
    .enter()
    .append('path')
    .attr('class', 'edge')
    .attr('fill', 'none');

  // Update (merge enter + update)
  const edgeMerge = edgeEnter.merge(edgeSelection);

  edgeMerge.each(function (d) {
    const path = d3.select(this);
    const valenceConfig = theme.edges[d.valence];

    path
      .attr('stroke', valenceConfig.stroke)
      .attr('stroke-dasharray', valenceConfig.strokeDasharray)
      .attr('stroke-width', getEdgeWidth(d.strength))
      .attr('opacity', getEdgeOpacity(d.strength))
      .attr('marker-end', valenceConfig.markerEnd);
  });

  return edgeMerge;
}

/**
 * Update edge paths based on current node positions.
 */
export function updateEdgePaths(
  edgeSelection: d3.Selection<SVGPathElement, GraphEdge, SVGGElement, unknown>,
  theme: GraphTheme
): void {
  edgeSelection.attr('d', (d) => {
    const source = d.source as AnyGraphNode;
    const target = d.target as AnyGraphNode;
    return generateEdgePath(source, target, theme);
  });
}

/**
 * Apply highlight styling to edges.
 */
export function highlightEdge(
  edge: d3.Selection<SVGPathElement, GraphEdge, SVGGElement, unknown>,
  highlighted: boolean
): void {
  edge
    .classed('highlighted', highlighted)
    .attr('opacity', highlighted ? 1 : null);
}

/**
 * Apply dimmed styling to edges.
 */
export function dimEdge(
  edge: d3.Selection<SVGPathElement, GraphEdge, SVGGElement, unknown>,
  dimmed: boolean
): void {
  edge
    .classed('dimmed', dimmed)
    .attr('opacity', dimmed ? 0.15 : null);
}
