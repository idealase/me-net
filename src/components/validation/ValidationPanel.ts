/**
 * Validation Panel Component
 *
 * Displays network validation warnings with snooze/dismiss functionality.
 */

import type { Network } from '@/types';
import {
  Warning,
  WarningState,
  ValidationResult,
  ValidationCallbacks,
  validateNetwork,
  getActiveWarnings,
  createEmptyWarningState,
  DEFAULT_SNOOZE_DURATION_MS,
} from '@/validation';

// ============================================================================
// Types
// ============================================================================

export interface ValidationPanelOptions {
  network: Network;
  warningState?: WarningState;
  callbacks: ValidationCallbacks;
  showDismissed?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export class ValidationPanel {
  private container: HTMLElement;
  private network: Network;
  private warningState: WarningState;
  private callbacks: ValidationCallbacks;
  private showDismissed: boolean;
  private result: ValidationResult | null = null;
  private expandedTypes: Set<string> = new Set();

  constructor(container: HTMLElement, options: ValidationPanelOptions) {
    this.container = container;
    this.network = options.network;
    this.warningState = options.warningState ?? createEmptyWarningState();
    this.callbacks = options.callbacks;
    this.showDismissed = options.showDismissed ?? false;

    this.render();
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  public setNetwork(network: Network): void {
    this.network = network;
    this.result = null;
    this.render();
  }

  public setWarningState(state: WarningState): void {
    this.warningState = state;
    this.render();
  }

  public getValidationResult(): ValidationResult {
    this.result ??= validateNetwork(this.network, this.warningState);
    return this.result;
  }

  public refresh(): void {
    this.result = null;
    this.render();
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  private render(): void {
    const result = this.getValidationResult();
    const activeWarnings = getActiveWarnings(result, this.warningState);

    this.container.innerHTML = `
      <div class="validation-panel">
        ${this.renderHeader(result, activeWarnings.length)}
        ${this.renderSummary(result)}
        ${this.renderWarningGroups(result)}
      </div>
    `;

    this.bindEvents();
  }

  private renderHeader(_result: ValidationResult, activeCount: number): string {
    const statusIcon = activeCount === 0 ? '✓' : '⚠';
    const statusClass = activeCount === 0 ? 'status-ok' : 'status-warning';

    return `
      <div class="validation-header">
        <div class="validation-status ${statusClass}">
          <span class="status-icon">${statusIcon}</span>
          <span class="status-text">
            ${activeCount === 0 ? 'No issues' : `${activeCount} issue${activeCount === 1 ? '' : 's'}`}
          </span>
        </div>
        <div class="validation-actions">
          <button class="btn btn-small" id="btn-refresh-validation" title="Re-run validation">
            ↻
          </button>
          <label class="toggle-label">
            <input type="checkbox" id="chk-show-dismissed" ${this.showDismissed ? 'checked' : ''}>
            Show dismissed
          </label>
        </div>
      </div>
    `;
  }

  private renderSummary(result: ValidationResult): string {
    const counts = result.counts;
    
    if (counts.total === 0) {
      return `
        <div class="validation-summary validation-empty">
          <p>Your network is well-connected! 🎉</p>
        </div>
      `;
    }

    return `
      <div class="validation-summary">
        <div class="summary-counts">
          ${counts.bySeverity.error > 0 ? `<span class="count-badge error">${counts.bySeverity.error} conflicts</span>` : ''}
          ${counts.bySeverity.warning > 0 ? `<span class="count-badge warning">${counts.bySeverity.warning} warnings</span>` : ''}
          ${counts.bySeverity.info > 0 ? `<span class="count-badge info">${counts.bySeverity.info} suggestions</span>` : ''}
        </div>
      </div>
    `;
  }

  private renderWarningGroups(result: ValidationResult): string {
    const groups = [
      { type: 'value-level-conflict' as const, label: 'Value Conflicts', severity: 'error' },
      { type: 'outcome-level-conflict' as const, label: 'Outcome Conflicts', severity: 'warning' },
      { type: 'orphan-value' as const, label: 'Orphan Values', severity: 'warning' },
      { type: 'unexplained-behaviour' as const, label: 'Unexplained Behaviours', severity: 'info' },
      { type: 'floating-outcome' as const, label: 'Floating Outcomes', severity: 'info' },
    ];

    let html = '<div class="warning-groups">';

    for (const group of groups) {
      const warnings = this.filterWarnings(result.byType[group.type]);
      if (warnings.length === 0) continue;

      const isExpanded = this.expandedTypes.has(group.type);
      
      html += `
        <div class="warning-group ${group.severity}">
          <div class="group-header" data-type="${group.type}">
            <span class="group-icon">${isExpanded ? '▼' : '▶'}</span>
            <span class="group-label">${group.label}</span>
            <span class="group-count">${warnings.length}</span>
          </div>
          ${isExpanded ? this.renderWarningList(warnings) : ''}
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  private filterWarnings(warnings: Warning[]): Warning[] {
    return warnings.filter((w) => {
      const isDismissed = this.warningState.dismissed[w.id] === true;
      const snoozedUntil = this.warningState.snoozed[w.id];
      const isSnoozed = snoozedUntil !== undefined && snoozedUntil !== '' && new Date(snoozedUntil) > new Date();

      if (!this.showDismissed && isDismissed) return false;
      if (!this.showDismissed && isSnoozed) return false;
      return true;
    });
  }

  private renderWarningList(warnings: Warning[]): string {
    if (warnings.length === 0) {
      return '<div class="warning-list-empty">No issues</div>';
    }

    let html = '<div class="warning-list">';
    for (const warning of warnings) {
      html += this.renderWarningItem(warning);
    }
    html += '</div>';
    return html;
  }

  private renderWarningItem(warning: Warning): string {
    const isDismissed = this.warningState.dismissed[warning.id] === true;
    const snoozedUntil = this.warningState.snoozed[warning.id];
    const isSnoozed = snoozedUntil !== undefined && snoozedUntil !== '' && new Date(snoozedUntil) > new Date();

    const statusClass = isDismissed ? 'dismissed' : isSnoozed ? 'snoozed' : 'active';

    return `
      <div class="warning-item ${statusClass}" data-warning-id="${warning.id}">
        <div class="warning-content">
          <div class="warning-message">${warning.message}</div>
          ${warning.suggestion !== undefined && warning.suggestion !== '' ? `<div class="warning-suggestion">${warning.suggestion}</div>` : ''}
          ${isSnoozed && snoozedUntil !== undefined ? `<div class="warning-status">Snoozed until ${new Date(snoozedUntil).toLocaleString()}</div>` : ''}
          ${isDismissed ? '<div class="warning-status">Dismissed</div>' : ''}
        </div>
        <div class="warning-actions">
          <button class="btn-icon btn-navigate" data-node-id="${warning.nodeId}" title="Go to node">
            👁
          </button>
          ${!isDismissed && !isSnoozed ? `
            <button class="btn-icon btn-snooze" data-warning-id="${warning.id}" title="Snooze for 24h">
              💤
            </button>
            <button class="btn-icon btn-dismiss" data-warning-id="${warning.id}" title="Dismiss">
              ✕
            </button>
          ` : ''}
          ${isDismissed ? `
            <button class="btn-icon btn-undismiss" data-warning-id="${warning.id}" title="Restore">
              ↩
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Event Handling
  // ==========================================================================

  private bindEvents(): void {
    // Refresh button
    this.container.querySelector('#btn-refresh-validation')?.addEventListener('click', () => {
      this.refresh();
    });

    // Show dismissed checkbox
    this.container.querySelector('#chk-show-dismissed')?.addEventListener('change', (e) => {
      this.showDismissed = (e.target as HTMLInputElement).checked;
      this.render();
    });

    // Group headers (expand/collapse)
    this.container.querySelectorAll('.group-header').forEach((header) => {
      header.addEventListener('click', (e) => {
        const type = (e.currentTarget as HTMLElement).dataset.type;
        if (type !== undefined && type !== '') {
          if (this.expandedTypes.has(type)) {
            this.expandedTypes.delete(type);
          } else {
            this.expandedTypes.add(type);
          }
          this.render();
        }
      });
    });

    // Navigate buttons
    this.container.querySelectorAll('.btn-navigate').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = (e.currentTarget as HTMLElement).dataset.nodeId;
        if (nodeId !== undefined && nodeId !== '') {
          this.callbacks.onNavigateToNode(nodeId);
        }
      });
    });

    // Snooze buttons
    this.container.querySelectorAll('.btn-snooze').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const warningId = (e.currentTarget as HTMLElement).dataset.warningId;
        if (warningId !== undefined && warningId !== '') {
          // Set snooze time
          const snoozeUntil = new Date(Date.now() + DEFAULT_SNOOZE_DURATION_MS).toISOString();
          this.warningState.snoozed[warningId] = snoozeUntil;
          this.callbacks.onSnooze(warningId);
          this.render();
        }
      });
    });

    // Dismiss buttons
    this.container.querySelectorAll('.btn-dismiss').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const warningId = (e.currentTarget as HTMLElement).dataset.warningId;
        if (warningId !== undefined && warningId !== '') {
          this.warningState.dismissed[warningId] = true;
          this.callbacks.onDismiss(warningId);
          this.render();
        }
      });
    });

    // Undismiss buttons
    this.container.querySelectorAll('.btn-undismiss').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const warningId = (e.currentTarget as HTMLElement).dataset.warningId;
        if (warningId !== undefined && warningId !== '') {
          delete this.warningState.dismissed[warningId];
          this.callbacks.onUndismiss(warningId);
          this.render();
        }
      });
    });
  }
}
