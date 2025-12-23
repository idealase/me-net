/**
 * FilterPanel Component
 *
 * UI component for filtering and searching the network visualization.
 * Per visual-design.md §5.4, §5.5, §5.6 specification.
 */

import type { Network } from '@/types';

import {
  createDefaultFilterState,
  type FilterState,
  type HighlightMode,
} from './types';

// ============================================================================
// Types
// ============================================================================

export interface FilterPanelCallbacks {
  /** Called when filter state changes */
  onFilterChange: (filter: FilterState) => void;
}

export interface FilterPanelOptions {
  network: Network;
  callbacks: FilterPanelCallbacks;
}

// ============================================================================
// FilterPanel Component
// ============================================================================

export class FilterPanel {
  private container: HTMLElement;
  private network: Network;
  private callbacks: FilterPanelCallbacks;
  private filterState: FilterState;

  constructor(container: HTMLElement, options: FilterPanelOptions) {
    this.container = container;
    this.network = options.network;
    this.callbacks = options.callbacks;
    this.filterState = createDefaultFilterState();

    this.render();
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Update the network data.
   */
  public setNetwork(network: Network): void {
    this.network = network;
    // Re-render to update counts
    this.render();
  }

  /**
   * Get current filter state.
   */
  public getFilterState(): FilterState {
    return { ...this.filterState };
  }

  /**
   * Reset all filters to default.
   */
  public reset(): void {
    this.filterState = createDefaultFilterState();
    this.render();
    this.emitChange();
  }

  /**
   * Clear search query.
   */
  public clearSearch(): void {
    this.filterState.searchQuery = '';
    this.render();
    this.emitChange();
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private render(): void {
    const { nodeTypes, valence, searchQuery, highlightMode } = this.filterState;

    // Count nodes by type
    const behaviourCount = this.network.behaviours.length;
    const outcomeCount = this.network.outcomes.length;
    const valueCount = this.network.values.length;

    // Count edges by valence
    const positiveCount = this.network.links.filter((l) => l.valence === 'positive').length;
    const negativeCount = this.network.links.filter((l) => l.valence === 'negative').length;

    this.container.innerHTML = `
      <div class="filter-panel">
        <!-- Search Box -->
        <div class="filter-section search-section">
          <label class="filter-label" for="filter-search">Search</label>
          <div class="search-input-wrapper">
            <input
              type="text"
              id="filter-search"
              class="filter-search-input"
              placeholder="Search nodes..."
              value="${this.escapeHtml(searchQuery)}"
              aria-label="Search nodes by label"
            />
            <button
              class="search-clear-btn ${searchQuery === '' ? 'hidden' : ''}"
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Node Type Filters -->
        <div class="filter-section">
          <span class="filter-label">Show Nodes</span>
          <div class="filter-checkboxes">
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-behaviour"
                ${nodeTypes.behaviour ? 'checked' : ''}
              />
              <span class="checkbox-label behaviour">Behaviours (${behaviourCount})</span>
            </label>
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-outcome"
                ${nodeTypes.outcome ? 'checked' : ''}
              />
              <span class="checkbox-label outcome">Outcomes (${outcomeCount})</span>
            </label>
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-value"
                ${nodeTypes.value ? 'checked' : ''}
              />
              <span class="checkbox-label value">Values (${valueCount})</span>
            </label>
          </div>
        </div>

        <!-- Valence Filters -->
        <div class="filter-section">
          <span class="filter-label">Show Edges</span>
          <div class="filter-checkboxes">
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-positive"
                ${valence.positive ? 'checked' : ''}
              />
              <span class="checkbox-label positive">Positive (${positiveCount})</span>
            </label>
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-negative"
                ${valence.negative ? 'checked' : ''}
              />
              <span class="checkbox-label negative">Negative (${negativeCount})</span>
            </label>
          </div>
        </div>

        <!-- Highlight Modes -->
        <div class="filter-section">
          <span class="filter-label">Highlight</span>
          <div class="filter-radio-group">
            <label class="filter-radio">
              <input
                type="radio"
                name="highlight-mode"
                value="none"
                ${highlightMode === 'none' ? 'checked' : ''}
              />
              <span class="radio-label">None</span>
            </label>
            <label class="filter-radio">
              <input
                type="radio"
                name="highlight-mode"
                value="leverage"
                ${highlightMode === 'leverage' ? 'checked' : ''}
              />
              <span class="radio-label leverage">High Leverage</span>
            </label>
            <label class="filter-radio">
              <input
                type="radio"
                name="highlight-mode"
                value="fragile"
                ${highlightMode === 'fragile' ? 'checked' : ''}
              />
              <span class="radio-label fragile">Fragile Values</span>
            </label>
            <label class="filter-radio">
              <input
                type="radio"
                name="highlight-mode"
                value="conflicts"
                ${highlightMode === 'conflicts' ? 'checked' : ''}
              />
              <span class="radio-label conflicts">Conflicts</span>
            </label>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="filter-actions">
          <button class="filter-reset-btn" aria-label="Reset all filters">
            Reset Filters
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Search input
    const searchInput = this.container.querySelector<HTMLInputElement>('#filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterState.searchQuery = (e.target as HTMLInputElement).value;
        this.updateClearButton();
        this.emitChange();
      });

      // Handle Escape key to clear search
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.clearSearch();
        }
      });
    }

    // Clear search button
    const clearBtn = this.container.querySelector<HTMLButtonElement>('.search-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    // Node type checkboxes
    const behaviourCb = this.container.querySelector<HTMLInputElement>('#filter-behaviour');
    const outcomeCb = this.container.querySelector<HTMLInputElement>('#filter-outcome');
    const valueCb = this.container.querySelector<HTMLInputElement>('#filter-value');

    behaviourCb?.addEventListener('change', (e) => {
      this.filterState.nodeTypes.behaviour = (e.target as HTMLInputElement).checked;
      this.emitChange();
    });

    outcomeCb?.addEventListener('change', (e) => {
      this.filterState.nodeTypes.outcome = (e.target as HTMLInputElement).checked;
      this.emitChange();
    });

    valueCb?.addEventListener('change', (e) => {
      this.filterState.nodeTypes.value = (e.target as HTMLInputElement).checked;
      this.emitChange();
    });

    // Valence checkboxes
    const positiveCb = this.container.querySelector<HTMLInputElement>('#filter-positive');
    const negativeCb = this.container.querySelector<HTMLInputElement>('#filter-negative');

    positiveCb?.addEventListener('change', (e) => {
      this.filterState.valence.positive = (e.target as HTMLInputElement).checked;
      this.emitChange();
    });

    negativeCb?.addEventListener('change', (e) => {
      this.filterState.valence.negative = (e.target as HTMLInputElement).checked;
      this.emitChange();
    });

    // Highlight mode radios
    const radios = this.container.querySelectorAll<HTMLInputElement>('input[name="highlight-mode"]');
    radios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        this.filterState.highlightMode = (e.target as HTMLInputElement).value as HighlightMode;
        this.emitChange();
      });
    });

    // Reset button
    const resetBtn = this.container.querySelector<HTMLButtonElement>('.filter-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.reset();
      });
    }
  }

  private updateClearButton(): void {
    const clearBtn = this.container.querySelector<HTMLButtonElement>('.search-clear-btn');
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', this.filterState.searchQuery === '');
    }
  }

  private emitChange(): void {
    this.callbacks.onFilterChange({ ...this.filterState });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
