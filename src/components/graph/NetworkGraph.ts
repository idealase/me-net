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
  private forceSimulation: d3.Simulation<AnyGraphNode, GraphEdge> | null = null;

  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private edgeSelection: d3.Selection<SVGPathElement, GraphEdge, SVGGElement, unknown> | null = null;
  private nodeSelection: d3.Selection<SVGGElement, AnyGraphNode, SVGGElement, unknown> | null = null;
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

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
      hoverHighlightedNodeIds: new Set(),
      modeHighlightedNodeIds: new Set(),
      searchQuery: '',
      nodeTypeVisibility: { behaviour: true, outcome: true, value: true },
      valenceVisibility: { positive: true, negative: true },
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

    this.keydownHandler = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName !== undefined && tagName !== null && tagName !== '' && (tagName === 'input' || tagName === 'textarea' || tagName === 'select')) {
        return;
      }
      this.clearSelection();
      this.onBackgroundClick?.();
    };
    document.addEventListener('keydown', this.keydownHandler);

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
    this.stopForceSimulation();
    this.graphData = networkToGraphData(network);

    const nodeLookup = new Map(this.graphData.nodes.map((node) => [node.id, node] as const));
    for (const edge of this.graphData.edges) {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      const sourceNode = nodeLookup.get(sourceId);
      const targetNode = nodeLookup.get(targetId);
      if (sourceNode) {
        edge.source = sourceNode;
      }
      if (targetNode) {
        edge.target = targetNode;
      }
    }

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
    } else {
      this.startForceSimulation();
    }

    this.render();
    // Re-apply current selection/filter state to new DOM elements
    this.updateSelectionState();
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
    } else {
      const center = d3.forceCenter(width / 2, height / 2);
      this.forceSimulation?.force('center', center);
      this.forceSimulation?.alpha(0.4).restart();
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
    this.interactionState.hoverHighlightedNodeIds.clear();
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
   * Set search query for filtering nodes.
   */
  public setSearchQuery(query: string): void {
    this.interactionState.searchQuery = query;
    // When search is active, disable hover highlighting to avoid fighting states.
    if (query.trim() !== '') {
      this.interactionState.hoverHighlightedNodeIds.clear();
    }
    this.updateSelectionState();
  }

  /**
   * Set node type visibility.
   */
  public setNodeTypeVisibility(
    nodeType: 'behaviour' | 'outcome' | 'value',
    visible: boolean
  ): void {
    this.interactionState.nodeTypeVisibility[nodeType] = visible;
    this.updateSelectionState();
  }

  /**
   * Set edge valence visibility.
   */
  public setValenceVisibility(valence: 'positive' | 'negative', visible: boolean): void {
    this.interactionState.valenceVisibility[valence] = visible;
    this.updateSelectionState();
  }

  /**
   * Set highlighted node IDs (for highlight modes).
   */
  public setHighlightedNodes(nodeIds: Set<string>): void {
    this.interactionState.modeHighlightedNodeIds = nodeIds;
    // Disable hover highlight while an explicit mode is active.
    if (nodeIds.size > 0) {
      this.interactionState.hoverHighlightedNodeIds.clear();
    }
    this.updateSelectionState();
  }

  /**
   * Clear all highlights.
   */
  public clearHighlights(): void {
    this.interactionState.modeHighlightedNodeIds.clear();
    this.updateSelectionState();
  }

  /**
   * Destroy the graph and clean up.
   */
  public destroy(): void {
    this.stopForceSimulation();
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
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

    if (this.options.layout.type === 'force' && !this.forceSimulation) {
      this.startForceSimulation();
    }
  }

  private buildNodeAriaLabel(node: AnyGraphNode): string {
    const typeLabel = `${node.type.charAt(0).toUpperCase()}${node.type.slice(1)}`;
    return `${typeLabel} node ${node.label}. Press Enter to select.`;
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
    const nodeEnter = selection
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('focusable', 'true')
      .attr('aria-keyshortcuts', 'Enter Space')
      .attr('aria-label', (d) => this.buildNodeAriaLabel(d))
      .style('cursor', 'pointer');

    // Render shapes and labels
    renderNodeShape(nodeEnter, this.options.theme);
    renderNodeLabel(nodeEnter, this.options.theme);

    // Merge
    this.nodeSelection = nodeEnter.merge(selection);
    this.nodeSelection
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('focusable', 'true')
      .attr('aria-keyshortcuts', 'Enter Space')
      .attr('aria-label', (d) => this.buildNodeAriaLabel(d));

    // Event handlers
    this.nodeSelection
      .on('click', (event: MouseEvent, d: AnyGraphNode) => {
        event.stopPropagation();
        this.selectNode(d.id);
        this.onNodeClick?.(d);
      })
      .on('keydown', (event: KeyboardEvent, d: AnyGraphNode) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.selectNode(d.id);
          this.onNodeClick?.(d);
        }
      })
      .on('focus', (_event: FocusEvent, d: AnyGraphNode) => {
        this.interactionState.hoveredNodeId = d.id;
        this.highlightConnected(d.id);
        this.onNodeHover?.(d);
      })
      .on('blur', () => {
        this.interactionState.hoveredNodeId = null;
        this.clearHighlight();
        this.onNodeHover?.(null);
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

    if (this.options.layout.type === 'force') {
      this.enableNodeDragging();
    }
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
    const { nodeTypeVisibility, valenceVisibility, searchQuery } = this.interactionState;
    const searchActive = searchQuery.trim() !== '';

    const nodeById = new Map(this.graphData.nodes.map((n) => [n.id, n] as const));

    const modeHighlightedIds = this.interactionState.modeHighlightedNodeIds;
    const hoverHighlightedIds = this.interactionState.hoverHighlightedNodeIds;
    const modeActive = modeHighlightedIds.size > 0;
    const hoverActive = !modeActive && !searchActive && hoverHighlightedIds.size > 0;

    const activeHighlightedIds = modeActive ? modeHighlightedIds : hoverActive ? hoverHighlightedIds : new Set<string>();

    // Update node styling
    this.nodeSelection?.each(function (d) {
      const group = d3.select(this);
      const isSelected = d.id === selectedId;
      const typeEnabled = nodeTypeVisibility[d.type];
      const matchesSearch = !searchActive || d.label.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const isHighlighted = activeHighlightedIds.has(d.id) || (searchActive && matchesSearch);

      // Dimming rules:
      // - Node type filter: disable -> dim node but keep it visible
      // - Search: active -> dim non-matches
      // - Highlight mode: active -> dim nodes not in mode set
      // - Hover highlight: active (and no search/mode) -> dim nodes not in hover set
      const dimByType = !typeEnabled;
      const dimBySearch = searchActive && !matchesSearch;
      const dimByMode = modeActive && !modeHighlightedIds.has(d.id);
      const dimByHover = hoverActive && !hoverHighlightedIds.has(d.id) && d.id !== selectedId;

      const isDimmed = !isSelected && (dimByType || dimBySearch || dimByMode || dimByHover);

      group.classed('selected', isSelected);
      group.classed('highlighted', isHighlighted);
      group.classed('dimmed', isDimmed);
      group.attr('aria-pressed', isSelected ? 'true' : 'false');

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

      const sourceNode = nodeById.get(sourceId);
      const targetNode = nodeById.get(targetId);

      // Determine if edge should be hidden due to filters
      const valenceEnabled = valenceVisibility[d.valence];
      const sourceTypeEnabled = sourceNode ? nodeTypeVisibility[sourceNode.type] : true;
      const targetTypeEnabled = targetNode ? nodeTypeVisibility[targetNode.type] : true;

      const isHidden = !valenceEnabled || !sourceTypeEnabled || !targetTypeEnabled;
      edge.classed('filtered-hidden', isHidden);
      if (isHidden) {
        edge.style('display', 'none');
        return;
      }
      edge.style('display', null);

      // Dimming rules:
      // - Highlight mode: dim edges when neither endpoint is highlighted
      // - Search: dim edges when neither endpoint matches search
      // - Hover highlight: dim edges when not connected to hovered/selected neighborhood
      const isConnectedToSelected = sourceId === selectedId || targetId === selectedId;
      const isConnectedToActiveHighlight =
        activeHighlightedIds.has(sourceId) || activeHighlightedIds.has(targetId);

      const dimByModeEdge = modeActive && !isConnectedToActiveHighlight && !isConnectedToSelected;

      const q = searchQuery.toLowerCase().trim();
      const sourceMatchesSearch = !searchActive || (sourceNode?.label.toLowerCase().includes(q) ?? false);
      const targetMatchesSearch = !searchActive || (targetNode?.label.toLowerCase().includes(q) ?? false);
      const dimBySearchEdge = searchActive && !sourceMatchesSearch && !targetMatchesSearch;

      const dimByHoverEdge = hoverActive && !isConnectedToActiveHighlight && !isConnectedToSelected;

      const isDimmed = dimByModeEdge || dimBySearchEdge || dimByHoverEdge;

      edge.classed('dimmed', isDimmed);
      edge.attr('opacity', isDimmed ? 0.15 : null);
    });
  }

  /**
   * Highlight nodes connected to the given node.
   */
  private highlightConnected(nodeId: string): void {
    // Don't override active search/highlight mode.
    if (this.interactionState.modeHighlightedNodeIds.size > 0) return;
    if (this.interactionState.searchQuery.trim() !== '') return;

    const connectedNodes = getConnectedNodeIds(this.graphData, nodeId);
    const connectedEdges = getConnectedEdgeIds(this.graphData, nodeId);

    this.interactionState.hoverHighlightedNodeIds = new Set([nodeId, ...connectedNodes]);

    this.updateSelectionState();

    // Also store connected edges for potential edge highlighting
    void connectedEdges; // Currently unused but available
  }

  /**
   * Clear all highlighting.
   */
  private clearHighlight(): void {
    this.interactionState.hoverHighlightedNodeIds.clear();
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

  /**
   * Initialize force-directed simulation and re-render on ticks.
   */
  private startForceSimulation(): void {
    if (this.graphData.nodes.length === 0) return;

    if (this.options.layout.type !== 'force') return;

    const layout = this.options.layout;
    const theme = this.options.theme;
    const linkForce = d3
      .forceLink<AnyGraphNode, GraphEdge>(this.graphData.edges)
      .id((d) => d.id)
      .distance((edge) => {
        const base = layout.linkDistance;
        // Stronger connections pull nodes closer together.
        return Math.max(80, base * (1 - edge.strength * 0.4));
      })
      .strength((edge) => 0.25 + edge.strength * 0.75);

    const chargeForce = d3.forceManyBody<AnyGraphNode>().strength(layout.chargeStrength);

    const collisionForce = d3.forceCollide<AnyGraphNode>((node) => {
      const config = getNodeConfig(theme, node.type);
      const radius = Math.max(config.width, config.height) / 2;
      return radius + layout.collisionRadius;
    });

    const centerForce = d3.forceCenter(this.options.width / 2, this.options.height / 2);

    this.forceSimulation = d3
      .forceSimulation<AnyGraphNode, GraphEdge>(this.graphData.nodes)
      .force('link', linkForce)
      .force('charge', chargeForce)
      .force('collision', collisionForce)
      .force('center', centerForce)
      .velocityDecay(0.25)
      .alpha(1)
      .on('tick', () => this.updatePositions());
  }

  /**
   * Stop and clean up force simulation if active.
   */
  private stopForceSimulation(): void {
    if (this.forceSimulation) {
      this.forceSimulation.stop();
      this.forceSimulation = null;
    }
  }

  /**
   * Enable drag interactions for force-directed layout.
   */
  private enableNodeDragging(): void {
    if (!this.nodeSelection) return;

    const dragBehavior = d3
      .drag<SVGGElement, AnyGraphNode>()
      .on('start', (event: d3.D3DragEvent<SVGGElement, AnyGraphNode, AnyGraphNode>, d) => {
        (event.sourceEvent as Event).stopPropagation();
        if (event.active === 0 && this.forceSimulation) {
          this.forceSimulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x ?? event.x;
        d.fy = d.y ?? event.y;
      })
      .on('drag', (event: d3.D3DragEvent<SVGGElement, AnyGraphNode, AnyGraphNode>, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: d3.D3DragEvent<SVGGElement, AnyGraphNode, AnyGraphNode>, d) => {
        if (event.active === 0) {
          this.forceSimulation?.alphaTarget(0);
        }
        // Keep the node pinned where the user dropped it
        d.fx = d.x;
        d.fy = d.y;
      });

    this.nodeSelection.call(dragBehavior as never);
  }
}
