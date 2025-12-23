/**
 * Legend Component
 *
 * Renders a visual legend explaining the graph encoding.
 * Per visual-design.md §7 Legend.
 */

import * as d3 from 'd3';

import type { GraphTheme } from './types';

export interface LegendOptions {
  x: number;
  y: number;
  collapsed: boolean;
}

const LEGEND_PADDING = 12;
const LEGEND_ROW_HEIGHT = 24;
const ICON_SIZE = 16;
const ICON_TEXT_GAP = 8;
const SECTION_GAP = 16;

/**
 * Render the legend component.
 */
export function renderLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  theme: GraphTheme,
  options: LegendOptions
): d3.Selection<SVGGElement, unknown, null, undefined> {
  // Remove existing legend
  svg.select('.legend').remove();

  if (options.collapsed) {
    return renderCollapsedLegend(svg, options);
  }

  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${options.x}, ${options.y})`);

  // Background
  const bgRect = legend
    .append('rect')
    .attr('class', 'legend-bg')
    .attr('fill', 'white')
    .attr('stroke', '#e5e7eb')
    .attr('stroke-width', 1)
    .attr('rx', 8);

  let currentY = LEGEND_PADDING;

  // Title
  legend
    .append('text')
    .attr('class', 'legend-title')
    .attr('x', LEGEND_PADDING)
    .attr('y', currentY + 12)
    .attr('font-size', 12)
    .attr('font-weight', 'bold')
    .attr('fill', '#374151')
    .text('Legend');

  currentY += LEGEND_ROW_HEIGHT + 4;

  // Node Types section
  legend
    .append('text')
    .attr('class', 'legend-section')
    .attr('x', LEGEND_PADDING)
    .attr('y', currentY + 10)
    .attr('font-size', 10)
    .attr('fill', '#6b7280')
    .text('Node Types');

  currentY += LEGEND_ROW_HEIGHT - 4;

  // Behaviour
  renderLegendNodeItem(legend, LEGEND_PADDING, currentY, 'Behaviour', theme.nodes.behaviour);
  currentY += LEGEND_ROW_HEIGHT;

  // Outcome
  renderLegendNodeItem(legend, LEGEND_PADDING, currentY, 'Outcome', theme.nodes.outcome);
  currentY += LEGEND_ROW_HEIGHT;

  // Value
  renderLegendNodeItem(legend, LEGEND_PADDING, currentY, 'Value', theme.nodes.value);
  currentY += LEGEND_ROW_HEIGHT + SECTION_GAP;

  // Edge Valence section
  legend
    .append('text')
    .attr('class', 'legend-section')
    .attr('x', LEGEND_PADDING)
    .attr('y', currentY + 10)
    .attr('font-size', 10)
    .attr('fill', '#6b7280')
    .text('Edge Valence');

  currentY += LEGEND_ROW_HEIGHT - 4;

  // Positive edge
  renderLegendEdgeItem(legend, LEGEND_PADDING, currentY, 'Positive', theme.edges.positive.stroke, '');
  currentY += LEGEND_ROW_HEIGHT;

  // Negative edge
  renderLegendEdgeItem(legend, LEGEND_PADDING, currentY, 'Negative', theme.edges.negative.stroke, '8,4');
  currentY += LEGEND_ROW_HEIGHT + SECTION_GAP;

  // Edge Strength section
  legend
    .append('text')
    .attr('class', 'legend-section')
    .attr('x', LEGEND_PADDING)
    .attr('y', currentY + 10)
    .attr('font-size', 10)
    .attr('fill', '#6b7280')
    .text('Edge Strength');

  currentY += LEGEND_ROW_HEIGHT - 4;

  // Strong
  renderLegendStrengthItem(legend, LEGEND_PADDING, currentY, 'Strong', 4, 1.0);
  currentY += LEGEND_ROW_HEIGHT;

  // Moderate
  renderLegendStrengthItem(legend, LEGEND_PADDING, currentY, 'Moderate', 2.5, 0.7);
  currentY += LEGEND_ROW_HEIGHT;

  // Weak
  renderLegendStrengthItem(legend, LEGEND_PADDING, currentY, 'Weak', 1, 0.4);
  currentY += LEGEND_ROW_HEIGHT;

  // Size background to content
  const legendWidth = 140;
  bgRect
    .attr('width', legendWidth)
    .attr('height', currentY + LEGEND_PADDING);

  return legend;
}

/**
 * Render collapsed legend (just an icon button).
 */
function renderCollapsedLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  options: LegendOptions
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const legend = svg
    .append('g')
    .attr('class', 'legend collapsed')
    .attr('transform', `translate(${options.x}, ${options.y})`)
    .style('cursor', 'pointer');

  legend
    .append('rect')
    .attr('width', 32)
    .attr('height', 32)
    .attr('rx', 6)
    .attr('fill', 'white')
    .attr('stroke', '#e5e7eb');

  // Question mark icon
  legend
    .append('text')
    .attr('x', 16)
    .attr('y', 22)
    .attr('text-anchor', 'middle')
    .attr('font-size', 16)
    .attr('fill', '#6b7280')
    .text('?');

  return legend;
}

/**
 * Render a node type legend item.
 */
function renderLegendNodeItem(
  legend: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  label: string,
  config: { shape: string; fill: string }
): void {
  const iconX = x + ICON_SIZE / 2;
  const iconY = y + ICON_SIZE / 2;

  switch (config.shape) {
    case 'rect':
      legend
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', ICON_SIZE)
        .attr('height', ICON_SIZE)
        .attr('rx', 3)
        .attr('fill', config.fill);
      break;
    case 'diamond':
      legend
        .append('polygon')
        .attr('points', `${iconX},${y} ${x + ICON_SIZE},${iconY} ${iconX},${y + ICON_SIZE} ${x},${iconY}`)
        .attr('fill', config.fill);
      break;
    case 'circle':
      legend
        .append('circle')
        .attr('cx', iconX)
        .attr('cy', iconY)
        .attr('r', ICON_SIZE / 2)
        .attr('fill', config.fill);
      break;
  }

  legend
    .append('text')
    .attr('x', x + ICON_SIZE + ICON_TEXT_GAP)
    .attr('y', y + ICON_SIZE / 2 + 4)
    .attr('font-size', 11)
    .attr('fill', '#374151')
    .text(label);
}

/**
 * Render an edge valence legend item.
 */
function renderLegendEdgeItem(
  legend: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  label: string,
  stroke: string,
  dasharray: string
): void {
  legend
    .append('line')
    .attr('x1', x)
    .attr('y1', y + ICON_SIZE / 2)
    .attr('x2', x + ICON_SIZE + 8)
    .attr('y2', y + ICON_SIZE / 2)
    .attr('stroke', stroke)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', dasharray);

  legend
    .append('text')
    .attr('x', x + ICON_SIZE + ICON_TEXT_GAP + 8)
    .attr('y', y + ICON_SIZE / 2 + 4)
    .attr('font-size', 11)
    .attr('fill', '#374151')
    .text(label);
}

/**
 * Render an edge strength legend item.
 */
function renderLegendStrengthItem(
  legend: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  label: string,
  width: number,
  opacity: number
): void {
  legend
    .append('line')
    .attr('x1', x)
    .attr('y1', y + ICON_SIZE / 2)
    .attr('x2', x + ICON_SIZE + 8)
    .attr('y2', y + ICON_SIZE / 2)
    .attr('stroke', '#6b7280')
    .attr('stroke-width', width)
    .attr('opacity', opacity);

  legend
    .append('text')
    .attr('x', x + ICON_SIZE + ICON_TEXT_GAP + 8)
    .attr('y', y + ICON_SIZE / 2 + 4)
    .attr('font-size', 11)
    .attr('fill', '#374151')
    .text(label);
}
