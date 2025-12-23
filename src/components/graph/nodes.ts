/**
 * SVG Renderer - Node Shapes
 *
 * Renders nodes as SVG elements based on type-specific shapes.
 * Per visual-design.md §2 Node Encoding.
 */

import * as d3 from 'd3';

import { truncateLabel } from './data';
import type { AnyGraphNode, GraphTheme, NodeVisualConfig } from './types';


/**
 * Create SVG definitions for markers and gradients.
 */
export function createDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  theme: GraphTheme
): void {
  const defs = svg.append('defs');

  // Arrow marker for positive edges
  defs
    .append('marker')
    .attr('id', 'arrow-positive')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', theme.edges.positive.stroke);

  // Arrow marker for negative edges
  defs
    .append('marker')
    .attr('id', 'arrow-negative')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', theme.edges.negative.stroke);

  // Drop shadow filter for selection state
  const filter = defs
    .append('filter')
    .attr('id', 'drop-shadow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filter
    .append('feDropShadow')
    .attr('dx', 0)
    .attr('dy', 2)
    .attr('stdDeviation', 4)
    .attr('flood-color', 'rgba(0,0,0,0.3)');
}

/**
 * Get node visual config from theme.
 */
export function getNodeConfig(theme: GraphTheme, type: AnyGraphNode['type']): NodeVisualConfig {
  return theme.nodes[type];
}

/**
 * Render a rectangle node (for Behaviours).
 */
export function renderRectNode(
  group: d3.Selection<SVGGElement, AnyGraphNode, SVGGElement, unknown>,
  config: NodeVisualConfig
): void {
  const cornerRadius = 8;

  group
    .append('rect')
    .attr('class', 'node-shape')
    .attr('x', -config.width / 2)
    .attr('y', -config.height / 2)
    .attr('width', config.width)
    .attr('height', config.height)
    .attr('rx', cornerRadius)
    .attr('ry', cornerRadius)
    .attr('fill', config.fill)
    .attr('stroke', config.stroke)
    .attr('stroke-width', 2);
}

/**
 * Render a diamond node (for Outcomes).
 */
export function renderDiamondNode(
  group: d3.Selection<SVGGElement, AnyGraphNode, SVGGElement, unknown>,
  config: NodeVisualConfig
): void {
  const halfW = config.width / 2;
  const halfH = config.height / 2;

  const points = [
    [0, -halfH], // top
    [halfW, 0], // right
    [0, halfH], // bottom
    [-halfW, 0], // left
  ]
    .map((p) => p.join(','))
    .join(' ');

  group
    .append('polygon')
    .attr('class', 'node-shape')
    .attr('points', points)
    .attr('fill', config.fill)
    .attr('stroke', config.stroke)
    .attr('stroke-width', 2);
}

/**
 * Render a circle node (for Values).
 */
export function renderCircleNode(
  group: d3.Selection<SVGGElement, AnyGraphNode, SVGGElement, unknown>,
  config: NodeVisualConfig
): void {
  const radius = Math.min(config.width, config.height) / 2;

  group
    .append('circle')
    .attr('class', 'node-shape')
    .attr('r', radius)
    .attr('fill', config.fill)
    .attr('stroke', config.stroke)
    .attr('stroke-width', 2);
}

/**
 * Render node shape based on type.
 */
export function renderNodeShape(
  group: d3.Selection<SVGGElement, AnyGraphNode, SVGGElement, unknown>,
  theme: GraphTheme
): void {
  group.each(function (d) {
    const g = d3.select(this) as unknown as d3.Selection<SVGGElement, AnyGraphNode, SVGGElement, unknown>;
    const config = getNodeConfig(theme, d.type);

    switch (config.shape) {
      case 'rect':
        renderRectNode(g, config);
        break;
      case 'diamond':
        renderDiamondNode(g, config);
        break;
      case 'circle':
        renderCircleNode(g, config);
        break;
    }
  });
}

/**
 * Render node label.
 */
export function renderNodeLabel(
  group: d3.Selection<SVGGElement, AnyGraphNode, SVGGElement, unknown>,
  theme: GraphTheme
): void {
  group
    .append('text')
    .attr('class', 'node-label')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', theme.text.fill)
    .attr('font-size', theme.text.fontSize)
    .attr('font-family', theme.text.fontFamily)
    .attr('pointer-events', 'none')
    .text((d) => truncateLabel(d.label));
}

/**
 * Get node boundary point for edge connection.
 * Returns the point on the node boundary where an edge should connect.
 */
export function getNodeBoundaryPoint(
  node: AnyGraphNode,
  targetX: number,
  targetY: number,
  theme: GraphTheme
): { x: number; y: number } {
  const config = getNodeConfig(theme, node.type);
  const nodeX = node.x ?? 0;
  const nodeY = node.y ?? 0;

  const dx = targetX - nodeX;
  const dy = targetY - nodeY;
  const angle = Math.atan2(dy, dx);

  switch (config.shape) {
    case 'rect': {
      const halfW = config.width / 2;
      const halfH = config.height / 2;
      // Find intersection with rectangle
      const tanAngle = Math.abs(Math.tan(angle));
      let bx: number, by: number;
      if (tanAngle < halfH / halfW) {
        // Intersects vertical edge
        bx = dx > 0 ? halfW : -halfW;
        by = bx * Math.tan(angle);
      } else {
        // Intersects horizontal edge
        by = dy > 0 ? halfH : -halfH;
        bx = by / Math.tan(angle);
      }
      return { x: nodeX + bx, y: nodeY + by };
    }
    case 'diamond': {
      const halfW = config.width / 2;
      const halfH = config.height / 2;
      // Diamond is defined by |x|/halfW + |y|/halfH = 1
      // Find intersection along angle
      const absAngle = Math.abs(angle);
      let t: number;
      if (absAngle < Math.PI / 2) {
        t = 1 / (Math.abs(Math.cos(angle)) / halfW + Math.abs(Math.sin(angle)) / halfH);
      } else {
        t = 1 / (Math.abs(Math.cos(angle)) / halfW + Math.abs(Math.sin(angle)) / halfH);
      }
      return {
        x: nodeX + t * Math.cos(angle),
        y: nodeY + t * Math.sin(angle),
      };
    }
    case 'circle': {
      const radius = Math.min(config.width, config.height) / 2;
      return {
        x: nodeX + radius * Math.cos(angle),
        y: nodeY + radius * Math.sin(angle),
      };
    }
  }
}
