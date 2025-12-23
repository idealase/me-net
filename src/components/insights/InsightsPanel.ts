/**
 * Insights Panel Component
 *
 * Displays metrics-based insights: top leverage behaviours,
 * fragile values, and conflict behaviours.
 */

import {
  analyzeNetwork,
  NetworkAnalysis,
  LeverageInsight,
  FragilityInsight,
  ConflictInsight,
} from '@/metrics';
import type { Network } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface InsightsPanelCallbacks {
  onNavigateToNode: (nodeId: string) => void;
}

export interface InsightsPanelOptions {
  network: Network;
  callbacks: InsightsPanelCallbacks;
}

// ============================================================================
// Component
// ============================================================================

export class InsightsPanel {
  private container: HTMLElement;
  private network: Network;
  private callbacks: InsightsPanelCallbacks;
  private analysis: NetworkAnalysis | null = null;
  private expandedSections: Set<string> = new Set(['leverage']); // Leverage expanded by default

  constructor(container: HTMLElement, options: InsightsPanelOptions) {
    this.container = container;
    this.network = options.network;
    this.callbacks = options.callbacks;

    this.render();
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  public setNetwork(network: Network): void {
    this.network = network;
    this.analysis = null;
    this.render();
  }

  public getAnalysis(): NetworkAnalysis {
    this.analysis ??= analyzeNetwork(this.network);
    return this.analysis;
  }

  public refresh(): void {
    this.analysis = null;
    this.render();
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  private render(): void {
    const analysis = this.getAnalysis();

    this.container.innerHTML = `
      <div class="insights-panel">
        ${this.renderHeader(analysis)}
        ${this.renderSections(analysis)}
      </div>
    `;

    this.bindEvents();
  }

  private renderHeader(analysis: NetworkAnalysis): string {
    const hasInsights =
      analysis.topLeverage.length > 0 ||
      analysis.fragileValues.length > 0 ||
      analysis.conflictBehaviours.length > 0;

    return `
      <div class="insights-header">
        <div class="insights-status ${hasInsights ? 'has-insights' : 'no-insights'}">
          <span class="status-icon">${hasInsights ? '📊' : '📈'}</span>
          <span class="status-text">${hasInsights ? 'Insights available' : 'Add more data for insights'}</span>
        </div>
        <button class="btn-icon" id="btn-refresh-insights" title="Refresh insights">
          🔄
        </button>
      </div>
    `;
  }

  private renderSections(analysis: NetworkAnalysis): string {
    return `
      <div class="insights-sections">
        ${this.renderLeverageSection(analysis.topLeverage)}
        ${this.renderFragilitySection(analysis.fragileValues)}
        ${this.renderConflictSection(analysis.conflictBehaviours)}
      </div>
    `;
  }

  private renderLeverageSection(insights: LeverageInsight[]): string {
    const isExpanded = this.expandedSections.has('leverage');
    const isEmpty = insights.length === 0;

    return `
      <div class="insight-section ${isExpanded ? 'expanded' : ''}" data-section="leverage">
        <div class="section-header" data-section="leverage">
          <span class="expand-icon">▶</span>
          <span class="section-title">🚀 Top Leverage</span>
          <span class="section-count">${insights.length}</span>
        </div>
        <div class="section-content">
          ${isEmpty ? this.renderEmptyLeverage() : this.renderLeverageList(insights)}
        </div>
      </div>
    `;
  }

  private renderEmptyLeverage(): string {
    return `
      <div class="insight-empty">
        <p>No high-leverage behaviours yet.</p>
        <p class="hint">Add behaviours with links to outcomes and values.</p>
      </div>
    `;
  }

  private renderLeverageList(insights: LeverageInsight[]): string {
    let html = '<div class="insight-list">';
    for (const insight of insights) {
      html += this.renderLeverageItem(insight);
    }
    html += '</div>';
    return html;
  }

  private renderLeverageItem(insight: LeverageInsight): string {
    const { behaviour, metrics, supportedValues, viaOutcomes } = insight;
    const valueLabels = supportedValues.map((v) => v.label).join(', ');
    const outcomeLabels = viaOutcomes.join(', ');

    return `
      <div class="insight-item leverage-item" data-node-id="${behaviour.id}">
        <div class="insight-main">
          <div class="insight-label">${this.escapeHtml(behaviour.label)}</div>
          <div class="insight-score">
            <span class="score-value">${metrics.leverageScore.toFixed(2)}</span>
            <span class="score-label">leverage</span>
          </div>
        </div>
        <div class="insight-explanation">
          <span class="explanation-text">
            Supports <strong>${valueLabels !== '' ? valueLabels : 'no values'}</strong>
            ${outcomeLabels !== '' ? `via ${outcomeLabels}` : ''}
          </span>
        </div>
        <div class="insight-meta">
          <span class="meta-item">Coverage: ${metrics.coverage}</span>
          <span class="meta-item">Cost: ${behaviour.cost}</span>
        </div>
      </div>
    `;
  }

  private renderFragilitySection(insights: FragilityInsight[]): string {
    const isExpanded = this.expandedSections.has('fragility');
    const isEmpty = insights.length === 0;

    return `
      <div class="insight-section ${isExpanded ? 'expanded' : ''}" data-section="fragility">
        <div class="section-header" data-section="fragility">
          <span class="expand-icon">▶</span>
          <span class="section-title">⚠️ Fragile Values</span>
          <span class="section-count">${insights.length}</span>
        </div>
        <div class="section-content">
          ${isEmpty ? this.renderEmptyFragility() : this.renderFragilityList(insights)}
        </div>
      </div>
    `;
  }

  private renderEmptyFragility(): string {
    return `
      <div class="insight-empty">
        <p>No fragile values detected.</p>
        <p class="hint">All values have adequate support.</p>
      </div>
    `;
  }

  private renderFragilityList(insights: FragilityInsight[]): string {
    let html = '<div class="insight-list">';
    for (const insight of insights) {
      html += this.renderFragilityItem(insight);
    }
    html += '</div>';
    return html;
  }

  private renderFragilityItem(insight: FragilityInsight): string {
    const { value, metrics, supportingBehaviours, isOrphan } = insight;
    const fragilityDisplay = isOrphan ? '∞' : metrics.fragilityScore.toFixed(2);
    const behaviourLabels = supportingBehaviours.map((b) => b.label).join(', ');

    return `
      <div class="insight-item fragility-item ${isOrphan ? 'orphan' : ''}" data-node-id="${value.id}">
        <div class="insight-main">
          <div class="insight-label">${this.escapeHtml(value.label)}</div>
          <div class="insight-score">
            <span class="score-value ${isOrphan ? 'critical' : ''}">${fragilityDisplay}</span>
            <span class="score-label">fragility</span>
          </div>
        </div>
        <div class="insight-explanation">
          ${isOrphan
            ? '<span class="explanation-text warning">No behaviours support this value.</span>'
            : `<span class="explanation-text">Supported by: <strong>${behaviourLabels !== '' ? behaviourLabels : 'none'}</strong></span>`
          }
        </div>
        <div class="insight-meta">
          <span class="meta-item">Importance: ${value.importance}</span>
          <span class="meta-item">Neglect: ${this.formatNeglect(value.neglect)}</span>
        </div>
        ${isOrphan ? '<div class="suggestion">Consider adding behaviours that support this value.</div>' : ''}
      </div>
    `;
  }

  private renderConflictSection(insights: ConflictInsight[]): string {
    const isExpanded = this.expandedSections.has('conflict');
    const isEmpty = insights.length === 0;

    return `
      <div class="insight-section ${isExpanded ? 'expanded' : ''}" data-section="conflict">
        <div class="section-header" data-section="conflict">
          <span class="expand-icon">▶</span>
          <span class="section-title">⚡ Conflicts</span>
          <span class="section-count">${insights.length}</span>
        </div>
        <div class="section-content">
          ${isEmpty ? this.renderEmptyConflict() : this.renderConflictList(insights)}
        </div>
      </div>
    `;
  }

  private renderEmptyConflict(): string {
    return `
      <div class="insight-empty">
        <p>No conflict behaviours detected.</p>
        <p class="hint">Behaviours have consistent positive or negative effects.</p>
      </div>
    `;
  }

  private renderConflictList(insights: ConflictInsight[]): string {
    let html = '<div class="insight-list">';
    for (const insight of insights) {
      html += this.renderConflictItem(insight);
    }
    html += '</div>';
    return html;
  }

  private renderConflictItem(insight: ConflictInsight): string {
    const { behaviour, metrics, positiveValues, negativeValues } = insight;
    const positiveLabels = positiveValues.map((v) => v.label).join(', ');
    const negativeLabels = negativeValues.map((v) => v.label).join(', ');

    return `
      <div class="insight-item conflict-item" data-node-id="${behaviour.id}">
        <div class="insight-main">
          <div class="insight-label">${this.escapeHtml(behaviour.label)}</div>
          <div class="insight-score">
            <span class="score-value">${metrics.conflictIndex.toFixed(2)}</span>
            <span class="score-label">conflict</span>
          </div>
        </div>
        <div class="insight-explanation">
          <div class="conflict-breakdown">
            <span class="positive-effect">
              ✓ ${positiveLabels !== '' ? positiveLabels : 'none'} (+${metrics.positiveInfluence.toFixed(1)})
            </span>
            <span class="negative-effect">
              ✗ ${negativeLabels !== '' ? negativeLabels : 'none'} (-${metrics.negativeInfluence.toFixed(1)})
            </span>
          </div>
        </div>
        <div class="suggestion">Consider reducing frequency or mitigating negative effects.</div>
      </div>
    `;
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private formatNeglect(neglect: string): string {
    return neglect.replace(/-/g, ' ');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================================================================
  // Event Handling
  // ==========================================================================

  private bindEvents(): void {
    // Refresh button
    this.container.querySelector('#btn-refresh-insights')?.addEventListener('click', () => {
      this.refresh();
    });

    // Section headers (expand/collapse)
    this.container.querySelectorAll('.section-header').forEach((header) => {
      header.addEventListener('click', (e) => {
        const section = (e.currentTarget as HTMLElement).dataset.section;
        if (section !== undefined && section !== '') {
          if (this.expandedSections.has(section)) {
            this.expandedSections.delete(section);
          } else {
            this.expandedSections.add(section);
          }
          this.render();
        }
      });
    });

    // Insight items (navigate to node)
    this.container.querySelectorAll('.insight-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const nodeId = (e.currentTarget as HTMLElement).dataset.nodeId;
        if (nodeId !== undefined && nodeId !== '') {
          this.callbacks.onNavigateToNode(nodeId);
        }
      });
    });
  }
}
