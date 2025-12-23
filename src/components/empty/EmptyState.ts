/**
 * Empty State Component
 * Displayed when the network has no nodes
 */

export interface EmptyStateCallbacks {
  onAddBehaviour: () => void;
  onStartWhyLadder: () => void;
  onImportData: () => void;
}

export class EmptyState {
  private container: HTMLElement;
  private element: HTMLElement | null = null;
  private callbacks: EmptyStateCallbacks;

  constructor(container: HTMLElement, callbacks: EmptyStateCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  show(): void {
    if (this.element !== null) {
      this.element.classList.remove('hidden');
      const existingAddButton = this.element.querySelector<HTMLButtonElement>('#btn-empty-add-behaviour');
      existingAddButton?.focus();
      return;
    }

    this.element = document.createElement('div');
    this.element.className = 'empty-state';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.innerHTML = `
      <div class="empty-state-content">
        <svg class="empty-state-icon" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="30" cy="60" r="8" fill="var(--color-behaviour)" opacity="0.3" />
          <circle cx="60" cy="60" r="8" fill="var(--color-outcome)" opacity="0.3" />
          <circle cx="90" cy="60" r="8" fill="var(--color-value)" opacity="0.3" />
          <path d="M 38 60 L 52 60" stroke="var(--color-text-secondary)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3" />
          <path d="M 68 60 L 82 60" stroke="var(--color-text-secondary)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3" />
        </svg>
        
        <h2 class="empty-state-title">Your network is empty</h2>
        <p class="empty-state-description">
          Start building your means-ends network by adding your first behaviour.
        </p>

        <div class="empty-state-actions">
          <button id="btn-empty-add-behaviour" class="btn btn-primary" aria-label="Add your first behaviour">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Add First Behaviour
          </button>
          <button id="btn-empty-why-ladder" class="btn btn-secondary" aria-label="Start Why Ladder guided mode">
            Start Why Ladder
          </button>
          <button id="btn-empty-import" class="btn btn-secondary" aria-label="Import existing data">
            Import Data
          </button>
        </div>

        <div class="empty-state-tips">
          <h3 class="empty-state-tips-title">Quick Start Tips:</h3>
          <ul class="empty-state-tips-list">
            <li>Think of a daily habit or action you perform regularly</li>
            <li>Use the Why Ladder mode to quickly map outcomes and values</li>
            <li>The sidebar helps you add nodes and view insights as you build</li>
          </ul>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);

    // Wire event handlers
    const addBehaviourBtn = this.element.querySelector<HTMLButtonElement>('#btn-empty-add-behaviour');
    const whyLadderBtn = this.element.querySelector<HTMLButtonElement>('#btn-empty-why-ladder');
    const importBtn = this.element.querySelector<HTMLButtonElement>('#btn-empty-import');

    if (addBehaviourBtn !== null) {
      addBehaviourBtn.addEventListener('click', () => {
        this.callbacks.onAddBehaviour();
      });
    }

    if (whyLadderBtn !== null) {
      whyLadderBtn.addEventListener('click', () => {
        this.callbacks.onStartWhyLadder();
      });
    }

    if (importBtn !== null) {
      importBtn.addEventListener('click', () => {
        this.callbacks.onImportData();
      });
    }

    // Focus the primary action
    addBehaviourBtn?.focus();
  }

  hide(): void {
    if (this.element !== null) {
      this.element.classList.add('hidden');
    }
  }

  destroy(): void {
    if (this.element !== null) {
      this.element.remove();
      this.element = null;
    }
  }
}
