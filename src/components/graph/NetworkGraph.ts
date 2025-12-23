/**
 * NetworkGraph Component
 *
 * Main D3.js visualization component for rendering the M-E Network.
 * Per visual-design.md specification.
 */

import * as d3 from 'd3';

import type { Network } from '@/types';


import { getConnectedEdgeIds, getConnectedNodeIds, networkToGraphData } from './data';
import { renderEdges, updateEdgePaths } from './edges';
import { applyLayeredLayout, sortNodesByConnectivity } from './layout';
import { renderLegend } from './legend';
import { createDefs, getNodeConfig, renderNodeLabel, renderNodeShape } from './nodes';
import { defaultGraphOptions } from './theme';
import type {
  AnyGraphNode,
  GraphData,
  GraphEdge,
  GraphInteractionState,
  GraphOptions,
} from './types';

// ============================================================================
// NetworkGraph Class
// ============================================================================

export class NetworkGraph {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private zoomGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private edgeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  private options: GraphOptions;
  private graphData: GraphData;
  private interactionState: GraphInteractionState;

  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private edgeSelection: d3.Selection<SVGPathElement, GraphEdge, SVGGElement, unknown> | null = null;
  private nodeSelection: d3.Selection<SVGGElement, AnyGraphNode, SVGGElement, unknown> | null = null;

  // Event callbacks
  private onNodeClick?: (node: AnyGraphNode) => void;
  private onNodeHover?: (node: AnyGraphNode | null) => void;
  private onBackgroundClick?: () => void;

  constructor(container: HTMLElement, options: Partial<GraphOptions> = {}) {
    this.options = { ...defaultGraphOptions, ...options };
    this.graphData = { nodes: [], edges: [] };
    this.interactionState = {
      selectedNodeId: null,
      hoveredNodeId: null,
      hoveredEdgeId: null,
      highlightedNodeIds: new Set(),
      dimmingEnabled: false,
    };

    // Create SVG
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .attr('class', 'network-graph')
      .style('background', this.options.theme.background);

    // Create defs (markers, filters)
    createDefs(this.svg, this.options.theme);

    // Create zoom group
    this.zoomGroup = this.svg.append('g').attr('class', 'zoom-group');

    // Create layer groups (edges under nodes)
    this.edgeGroup = this.zoomGroup.append('g').attr('class', 'edges');
    this.nodeGroup = this.zoomGroup.append('g').attr('class', 'nodes');

    // Setup zoom behavior
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent(this.options.zoomExtent)
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        this.zoomGroup.attr('transform', event.transform.toString());
      });

    this.svg.call(this.zoom);

    // Background click handler
    this.svg.on('click', (event: MouseEvent) => {
      if (event.target === this.svg.node()) {
        this.clearSelection();
        this.onBackgroundClick?.();
      }
    });

    // Render legend
    this.renderLegend();
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Update the graph with new network data.
   */
  public setNetwork(network: Network): void {
    this.graphData = networkToGraphData(network);

    // Sort nodes to minimize edge crossings
    sortNodesByConnectivity(this.graphData);

    // Apply layout
    if (this.options.layout.type === 'layered') {
      applyLayeredLayout(
        this.graphData,
        this.options.layout,
        this.options.width,
        this.options.height
      );
    }

    this.render();
  }

  /**
   * Resize the graph canvas.
   */
  public resize(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;

    this.svg.attr('width', width).attr('height', height);

    // Re-apply layout
    if (this.options.layout.type === 'layered') {
      applyLayeredLayout(this.graphData, this.options.layout, width, height);
    }

    this.updatePositions();
    this.renderLegend();
  }

  /**
   * Zoom to fit all nodes in view.
   */
  public fitToView(): void {
    if (this.graphData.nodes.length === 0) return;

    const bounds = this.calculateBounds();
    const padding = 40;

    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;

    const scale = Math.min(
      this.options.width / width,
      this.options.height / height,
      1 // Don't zoom in beyond 100%
    );

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const transform = d3.zoomIdentity
      .translate(this.options.width / 2, this.options.height / 2)
      .scale(scale)
      .translate(-centerX, -centerY);

    this.svg
      .transition()
      .duration(this.options.transitionDuration)
      .call((selection) => this.zoom.transform(selection, transform));
  }

  /**
   * Reset zoom to default.
   */
  public resetZoom(): void {
    this.svg
      .transition()
      .duration(this.options.transitionDuration)
      .call((selection) => this.zoom.transform(selection, d3.zoomIdentity));
  }

  /**
   * Select a node by ID.
   */
  public selectNode(nodeId: string): void {
    this.interactionState.selectedNodeId = nodeId;
    this.updateSelectionState();
  }

  /**
   * Clear current selection.
   */
  public clearSelection(): void {
    this.interactionState.selectedNodeId = null;
    this.interactionState.highlightedNodeIds.clear();
    this.interactionState.dimmingEnabled = false;
    this.updateSelectionState();
  }

  /**
   * Set node click callback.
   */
  public setOnNodeClick(callback: (node: AnyGraphNode) => void): void {
    this.onNodeClick = callback;
  }

  /**
   * Set node hover callback.
   */
  public setOnNodeHover(callback: (node: AnyGraphNode | null) => void): void {
    this.onNodeHover = callback;
  }

  /**
   * Set background click callback.
   */
  public setOnBackgroundClick(callback: () => void): void {
    this.onBackgroundClick = callback;
  }

  /**
   * Destroy the graph and clean up.
   */
  public destroy(): void {
    this.svg.remove();
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Render the complete graph.
   */
  private render(): void {
    this.renderEdges();
    this.renderNodes();
    this.updatePositions();
  }

  /**
   * Render edge elements.
   */
  private renderEdges(): void {
    this.edgeSelection = renderEdges(this.edgeGroup, this.graphData.edges, this.options.theme);

    // Edge hover
    this.edgeSelection
      .on('mouseenter', (_event: MouseEvent, d: GraphEdge) => {
        this.interactionState.hoveredEdgeId = d.id;
      })
      .on('mouseleave', () => {
        this.interactionState.hoveredEdgeId = null;
      });
  }

  /**
   * Render node elements.
   */
  private renderNodes(): void {
    const selection = this.nodeGroup
      .selectAll<SVGGElement, AnyGraphNode>('g.node')
      .data(this.graphData.nodes, (d) => d.id);

    // Exit
    selection.exit().remove();

    // Enter
    const nodeEnter = selection.enter().append('g').attr('class', 'node').style('cursor', 'pointer');

    // Render shapes and labels
    renderNodeShape(nodeEnter, this.options.theme);
    renderNodeLabel(nodeEnter, this.options.theme);

    // Merge
    this.nodeSelection = nodeEnter.merge(selection);

    // Event handlers
    this.nodeSelection
      .on('click', (event: MouseEvent, d: AnyGraphNode) => {
        event.stopPropagation();
        this.selectNode(d.id);
        this.onNodeClick?.(d);
      })
      .on('mouseenter', (_event: MouseEvent, d: AnyGraphNode) => {
        this.interactionState.hoveredNodeId = d.id;
        this.highlightConnected(d.id);
        this.onNodeHover?.(d);
      })
      .on('mouseleave', () => {
        this.interactionState.hoveredNodeId = null;
        if (this.interactionState.selectedNodeId === null) {
          this.clearHighlight();
        }
        this.onNodeHover?.(null);
      });
  }

  /**
   * Update node and edge positions.
   */
  private updatePositions(): void {
    // Update node positions
    this.nodeSelection?.attr('transform', (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);

    // Update edge paths
    if (this.edgeSelection) {
      updateEdgePaths(this.edgeSelection, this.options.theme);
    }
  }

  /**
   * Update visual state based on selection/hover.
   */
  private updateSelectionState(): void {
    const selectedId = this.interactionState.selectedNodeId;
    const highlightedIds = this.interactionState.highlightedNodeIds;

    // Update node styling
    this.nodeSelection?.each(function (d) {
      const group = d3.select(this);
      const isSelected = d.id === selectedId;
      const isHighlighted = highlightedIds.has(d.id);
      const isDimmed = highlightedIds.size > 0 && !isHighlighted && d.id !== selectedId;

      group.classed('selected', isSelected);
      group.classed('highlighted', isHighlighted);
      group.classed('dimmed', isDimmed);

      group
        .select('.node-shape')
        .attr('filter', isSelected ? 'url(#drop-shadow)' : null)
        .attr('stroke-width', isSelected ? 3 : 2)
        .attr('opacity', isDimmed ? 0.3 : 1);

      group.select('.node-label').attr('opacity', isDimmed ? 0.3 : 1);
    });

    // Update edge styling
    this.edgeSelection?.each(function (d) {
      const edge = d3.select(this);
      const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
      const targetId = typeof d.target === 'string' ? d.target : d.target.id;
      const isConnected =
        sourceId === selectedId ||
        targetId === selectedId ||
        highlightedIds.has(sourceId) ||
        highlightedIds.has(targetId);
      const isDimmed = highlightedIds.size > 0 && !isConnected;

      edge.classed('dimmed', isDimmed);
      edge.attr('opacity', isDimmed ? 0.15 : null);
    });
  }

  /**
   * Highlight nodes connected to the given node.
   */
  private highlightConnected(nodeId: string): void {
    const connectedNodes = getConnectedNodeIds(this.graphData, nodeId);
    const connectedEdges = getConnectedEdgeIds(this.graphData, nodeId);

    this.interactionState.highlightedNodeIds = new Set([nodeId, ...connectedNodes]);
    this.interactionState.dimmingEnabled = true;

    this.updateSelectionState();

    // Also store connected edges for potential edge highlighting
    void connectedEdges; // Currently unused but available
  }

  /**
   * Clear all highlighting.
   */
  private clearHighlight(): void {
    this.interactionState.highlightedNodeIds.clear();
    this.interactionState.dimmingEnabled = false;
    this.updateSelectionState();
  }

  /**
   * Calculate bounding box of all nodes.
   */
  private calculateBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const node of this.graphData.nodes) {
      const config = getNodeConfig(this.options.theme, node.type);
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const halfW = config.width / 2;
      const halfH = config.height / 2;

      minX = Math.min(minX, x - halfW);
      minY = Math.min(minY, y - halfH);
      maxX = Math.max(maxX, x + halfW);
      maxY = Math.max(maxY, y + halfH);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * Render the legend component.
   */
  private renderLegend(): void {
    renderLegend(this.svg, this.options.theme, {
      x: this.options.width - 160,
      y: 20,
      collapsed: false,
    });
  }
}
