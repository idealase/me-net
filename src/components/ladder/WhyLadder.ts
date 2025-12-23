/**
 * Why Ladder Component
 *
 * A guided capture mode that walks users through the "Why Ladder" flow:
 * Behaviour → Outcomes → Values
 */

import type { Network } from '@/types';

import {
  countUnexplainedOutcomes,
  createLadderSession,
  getLinkableOutcomes,
  getLinkableValues,
  getNextUnexplainedOutcome,
  getSelectableBehaviours,
  LadderSession,
  LadderStep,
  PendingOutcome,
  WhyLadderCallbacks,
  WhyLadderOptions,
} from './types';

/**
 * WhyLadder manages the guided "Why Ladder" capture flow.
 */
export class WhyLadder {
  private container: HTMLElement;
  private network: Network;
  private callbacks: WhyLadderCallbacks;
  private session: LadderSession;

  constructor(container: HTMLElement, options: WhyLadderOptions) {
    this.container = container;
    this.network = options.network;
    this.callbacks = options.callbacks;
    this.session = createLadderSession();

    // If initial behaviour provided, skip to outcomes step
    if (options.initialBehaviourId !== undefined && options.initialBehaviourId !== '') {
      const behaviour = this.network.behaviours.find((b) => b.id === options.initialBehaviourId);
      if (behaviour) {
        this.session.behaviourId = behaviour.id;
        this.session.behaviourLabel = behaviour.label;
        this.session.currentStep = 'add-outcomes';
      }
    }

    this.render();
  }

  /**
   * Update the network reference (called when network changes).
   */
  public setNetwork(network: Network): void {
    this.network = network;
    this.render();
  }

  /**
   * Get the current session state.
   */
  public getSession(): LadderSession {
    return { ...this.session };
  }

  /**
   * Reset and start a new session.
   */
  public reset(): void {
    this.session = createLadderSession();
    this.render();
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  private render(): void {
    switch (this.session.currentStep) {
      case 'select-behaviour':
        this.renderSelectBehaviour();
        break;
      case 'add-outcomes':
        this.renderAddOutcomes();
        break;
      case 'explain-outcome':
        this.renderExplainOutcome();
        break;
      case 'complete':
        this.renderComplete();
        break;
    }
  }

  private renderSelectBehaviour(): void {
    const behaviours = getSelectableBehaviours(this.network, false);

    this.container.innerHTML = `
      <div class="ladder-panel">
        <div class="ladder-header">
          <h2>Why Ladder</h2>
          <p class="ladder-subtitle">Map your behaviours to what matters</p>
        </div>

        <div class="ladder-step">
          <div class="step-indicator">
            <span class="step-number">1</span>
            <span class="step-label">Choose a Behaviour</span>
          </div>

          <p class="ladder-prompt">
            What behaviour would you like to explore? Why do you do it?
          </p>

          <div class="ladder-form">
            <div class="form-group">
              <label for="behaviour-input">Create new behaviour</label>
              <div class="input-row">
                <input 
                  type="text" 
                  id="behaviour-input" 
                  class="form-input" 
                  placeholder="e.g., Morning meditation, 30-min walk..."
                  autocomplete="off"
                />
                <button type="button" class="btn btn-primary" id="btn-create-behaviour">
                  Create
                </button>
              </div>
            </div>

            ${behaviours.length > 0 ? `
              <div class="divider-text">
                <span>or select existing</span>
              </div>

              <div class="form-group">
                <label>Select existing behaviour</label>
                <ul class="selectable-list" id="behaviour-list">
                  ${behaviours.map((b) => `
                    <li class="selectable-item ${b.hasLinks ? 'has-links' : 'no-links'}" data-id="${b.id}">
                      <span class="item-label">${this.escapeHtml(b.label)}</span>
                      ${b.hasLinks ? '<span class="item-badge">has links</span>' : '<span class="item-badge unexplained">unexplained</span>'}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="ladder-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    `;

    this.bindSelectBehaviourEvents();
  }

  private renderAddOutcomes(): void {
    const linkableOutcomes = getLinkableOutcomes(this.network, this.session.behaviourId!);
    const availableOutcomes = linkableOutcomes.filter((o) => !o.alreadyLinked);
    const addedCount = this.session.outcomes.length;

    this.container.innerHTML = `
      <div class="ladder-panel">
        <div class="ladder-header">
          <h2>Why Ladder</h2>
          <p class="ladder-subtitle">Exploring: <strong>${this.escapeHtml(this.session.behaviourLabel)}</strong></p>
        </div>

        <div class="ladder-step">
          <div class="step-indicator">
            <span class="step-number">2</span>
            <span class="step-label">Add Outcomes</span>
          </div>

          <p class="ladder-prompt">
            What outcome(s) does <strong>"${this.escapeHtml(this.session.behaviourLabel)}"</strong> produce?
          </p>

          ${addedCount > 0 ? `
            <div class="added-items">
              <h4>Added outcomes (${addedCount}):</h4>
              <ul class="outcome-chips">
                ${this.session.outcomes.map((o) => `
                  <li class="outcome-chip">
                    <span>${this.escapeHtml(o.outcomeLabel)}</span>
                    <button type="button" class="chip-remove" data-outcome-id="${o.outcomeId}" title="Remove">×</button>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="ladder-form">
            <div class="form-group">
              <label for="outcome-input">Create new outcome</label>
              <div class="input-row">
                <input 
                  type="text" 
                  id="outcome-input" 
                  class="form-input" 
                  placeholder="e.g., Reduced anxiety, Better sleep..."
                  autocomplete="off"
                />
                <button type="button" class="btn btn-primary" id="btn-add-outcome">
                  Add
                </button>
              </div>
            </div>

            ${availableOutcomes.length > 0 ? `
              <div class="divider-text">
                <span>or link existing</span>
              </div>

              <div class="form-group">
                <label>Link to existing outcome</label>
                <ul class="selectable-list" id="outcome-list">
                  ${availableOutcomes.map((o) => `
                    <li class="selectable-item" data-id="${o.id}">
                      <span class="item-label">${this.escapeHtml(o.label)}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="ladder-actions">
          <button type="button" class="btn btn-secondary" id="btn-back">
            Back
          </button>
          <button type="button" class="btn btn-secondary" id="btn-exit">
            Exit Early
          </button>
          ${addedCount > 0 ? `
            <button type="button" class="btn btn-primary" id="btn-next">
              Continue →
            </button>
          ` : ''}
        </div>
      </div>
    `;

    this.bindAddOutcomesEvents();
  }

  private renderExplainOutcome(): void {
    const pendingOutcome = getNextUnexplainedOutcome(this.session);
    if (!pendingOutcome) {
      this.goToStep('complete');
      return;
    }

    const outcomeId = pendingOutcome.outcomeId;
    const linkableValues = getLinkableValues(this.network, outcomeId);
    const availableValues = linkableValues.filter((v) => !v.alreadyLinked);
    const remainingCount = countUnexplainedOutcomes(this.session);

    this.container.innerHTML = `
      <div class="ladder-panel">
        <div class="ladder-header">
          <h2>Why Ladder</h2>
          <p class="ladder-subtitle">Exploring: <strong>${this.escapeHtml(this.session.behaviourLabel)}</strong></p>
        </div>

        <div class="ladder-step">
          <div class="step-indicator">
            <span class="step-number">3</span>
            <span class="step-label">Explain Outcomes</span>
          </div>

          <p class="ladder-prompt">
            Why does <strong>"${this.escapeHtml(pendingOutcome.outcomeLabel)}"</strong> matter to you?
          </p>

          <p class="ladder-hint">
            Link to a value (terminal goal) or chain to another outcome (intermediate step).
            <br/>
            <small>${remainingCount} outcome${remainingCount !== 1 ? 's' : ''} left to explain</small>
          </p>

          <div class="ladder-form">
            <div class="form-group">
              <label for="value-input">Add as new value</label>
              <div class="input-row">
                <input 
                  type="text" 
                  id="value-input" 
                  class="form-input" 
                  placeholder="e.g., Health, Peace of mind, Achievement..."
                  autocomplete="off"
                />
                <button type="button" class="btn btn-primary" id="btn-add-value">
                  Add Value
                </button>
              </div>
            </div>

            ${availableValues.length > 0 ? `
              <div class="divider-text">
                <span>or link to existing value</span>
              </div>

              <div class="form-group">
                <ul class="selectable-list" id="value-list">
                  ${availableValues.map((v) => `
                    <li class="selectable-item" data-id="${v.id}">
                      <span class="item-label">${this.escapeHtml(v.label)}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            <div class="divider-text">
              <span>or chain to another outcome</span>
            </div>

            <div class="form-group">
              <label for="chain-input">Create intermediate outcome</label>
              <div class="input-row">
                <input 
                  type="text" 
                  id="chain-input" 
                  class="form-input" 
                  placeholder="e.g., Another effect that leads to a value..."
                  autocomplete="off"
                />
                <button type="button" class="btn btn-secondary" id="btn-chain-outcome">
                  Chain Outcome
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="ladder-actions">
          <button type="button" class="btn btn-secondary" id="btn-back">
            Back
          </button>
          <button type="button" class="btn btn-secondary" id="btn-skip">
            Skip This Outcome
          </button>
          <button type="button" class="btn btn-secondary" id="btn-exit">
            Exit Early
          </button>
        </div>
      </div>
    `;

    this.bindExplainOutcomeEvents(pendingOutcome);
  }

  private renderComplete(): void {
    const outcomeCount = this.session.outcomes.length;
    const valueCount = this.session.valueIds.length;
    const unexplainedCount = countUnexplainedOutcomes(this.session);

    this.container.innerHTML = `
      <div class="ladder-panel">
        <div class="ladder-header">
          <h2>Why Ladder Complete!</h2>
        </div>

        <div class="ladder-summary">
          <div class="summary-item">
            <span class="summary-icon">✓</span>
            <span class="summary-text">
              Explored <strong>${this.escapeHtml(this.session.behaviourLabel)}</strong>
            </span>
          </div>

          <div class="summary-item">
            <span class="summary-icon">${outcomeCount > 0 ? '✓' : '○'}</span>
            <span class="summary-text">
              ${outcomeCount} outcome${outcomeCount !== 1 ? 's' : ''} added
            </span>
          </div>

          <div class="summary-item">
            <span class="summary-icon">${valueCount > 0 ? '✓' : '○'}</span>
            <span class="summary-text">
              ${valueCount} value${valueCount !== 1 ? 's' : ''} linked
            </span>
          </div>

          ${unexplainedCount > 0 ? `
            <div class="summary-item warning">
              <span class="summary-icon">⚠</span>
              <span class="summary-text">
                ${unexplainedCount} outcome${unexplainedCount !== 1 ? 's' : ''} left unexplained
              </span>
            </div>
          ` : ''}
        </div>

        <div class="ladder-actions">
          <button type="button" class="btn btn-secondary" id="btn-another">
            Add Another Behaviour
          </button>
          <button type="button" class="btn btn-primary" id="btn-done">
            Done
          </button>
        </div>
      </div>
    `;

    this.bindCompleteEvents();
  }

  // ============================================================================
  // Event Binding
  // ============================================================================

  private bindSelectBehaviourEvents(): void {
    const input = this.container.querySelector('#behaviour-input') as HTMLInputElement;
    const createBtn = this.container.querySelector('#btn-create-behaviour') as HTMLButtonElement;
    const cancelBtn = this.container.querySelector('#btn-cancel') as HTMLButtonElement;
    const list = this.container.querySelector('#behaviour-list');

    // Create new behaviour
    createBtn.addEventListener('click', () => {
      const label = input.value.trim();
      if (label !== '') {
        this.createBehaviour(label);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const label = input.value.trim();
        if (label !== '') {
          this.createBehaviour(label);
        }
      }
    });

    // Select existing behaviour
    if (list) {
      list.querySelectorAll('.selectable-item').forEach((item) => {
        item.addEventListener('click', () => {
          const id = (item as HTMLElement).dataset.id;
          if (id !== undefined) {
            this.selectBehaviour(id);
          }
        });
      });
    }

    // Cancel
    cancelBtn.addEventListener('click', () => {
      this.callbacks.onExit(this.session);
    });
  }

  private bindAddOutcomesEvents(): void {
    const input = this.container.querySelector('#outcome-input') as HTMLInputElement;
    const addBtn = this.container.querySelector('#btn-add-outcome') as HTMLButtonElement;
    const backBtn = this.container.querySelector('#btn-back') as HTMLButtonElement;
    const exitBtn = this.container.querySelector('#btn-exit') as HTMLButtonElement;
    const nextBtn = this.container.querySelector('#btn-next');
    const list = this.container.querySelector('#outcome-list');

    // Create new outcome
    addBtn.addEventListener('click', () => {
      const label = input.value.trim();
      if (label !== '') {
        this.createOutcome(label);
        input.value = '';
        input.focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const label = input.value.trim();
        if (label !== '') {
          this.createOutcome(label);
          input.value = '';
        }
      }
    });

    // Link existing outcome
    if (list) {
      list.querySelectorAll('.selectable-item').forEach((item) => {
        item.addEventListener('click', () => {
          const id = (item as HTMLElement).dataset.id;
          if (id !== undefined) {
            this.linkOutcome(id);
          }
        });
      });
    }

    // Remove outcome chip
    this.container.querySelectorAll('.chip-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const outcomeId = (btn as HTMLElement).dataset.outcomeId;
        if (outcomeId !== undefined) {
          this.removeOutcome(outcomeId);
        }
      });
    });

    // Navigation
    backBtn.addEventListener('click', () => {
      this.goToStep('select-behaviour');
    });

    exitBtn.addEventListener('click', () => {
      this.exitEarly();
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToStep('explain-outcome');
      });
    }
  }

  private bindExplainOutcomeEvents(pendingOutcome: PendingOutcome): void {
    const valueInput = this.container.querySelector('#value-input') as HTMLInputElement;
    const addValueBtn = this.container.querySelector('#btn-add-value') as HTMLButtonElement;
    const chainInput = this.container.querySelector('#chain-input') as HTMLInputElement;
    const chainBtn = this.container.querySelector('#btn-chain-outcome') as HTMLButtonElement;
    const backBtn = this.container.querySelector('#btn-back') as HTMLButtonElement;
    const skipBtn = this.container.querySelector('#btn-skip') as HTMLButtonElement;
    const exitBtn = this.container.querySelector('#btn-exit') as HTMLButtonElement;
    const valueList = this.container.querySelector('#value-list');

    // Create new value
    addValueBtn.addEventListener('click', () => {
      const label = valueInput.value.trim();
      if (label !== '') {
        this.createValue(label, pendingOutcome);
      }
    });

    valueInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const label = valueInput.value.trim();
        if (label !== '') {
          this.createValue(label, pendingOutcome);
        }
      }
    });

    // Link existing value
    if (valueList) {
      valueList.querySelectorAll('.selectable-item').forEach((item) => {
        item.addEventListener('click', () => {
          const id = (item as HTMLElement).dataset.id;
          if (id !== undefined) {
            this.linkValue(id, pendingOutcome);
          }
        });
      });
    }

    // Chain to another outcome
    chainBtn.addEventListener('click', () => {
      const label = chainInput.value.trim();
      if (label !== '') {
        this.chainOutcome(label, pendingOutcome);
      }
    });

    chainInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const label = chainInput.value.trim();
        if (label !== '') {
          this.chainOutcome(label, pendingOutcome);
        }
      }
    });

    // Navigation
    backBtn.addEventListener('click', () => {
      this.goToStep('add-outcomes');
    });

    skipBtn.addEventListener('click', () => {
      this.skipOutcome(pendingOutcome);
    });

    exitBtn.addEventListener('click', () => {
      this.exitEarly();
    });
  }

  private bindCompleteEvents(): void {
    const anotherBtn = this.container.querySelector('#btn-another') as HTMLButtonElement;
    const doneBtn = this.container.querySelector('#btn-done') as HTMLButtonElement;

    anotherBtn.addEventListener('click', () => {
      this.session.completed = true;
      this.callbacks.onComplete(this.session);
      this.reset();
    });

    doneBtn.addEventListener('click', () => {
      this.session.completed = true;
      this.callbacks.onComplete(this.session);
    });
  }

  // ============================================================================
  // Actions
  // ============================================================================

  private goToStep(step: LadderStep): void {
    this.session.currentStep = step;
    this.render();
  }

  private createBehaviour(label: string): void {
    const behaviour = this.callbacks.onCreateBehaviour(label);
    this.session.behaviourId = behaviour.id;
    this.session.behaviourLabel = behaviour.label;
    this.goToStep('add-outcomes');
  }

  private selectBehaviour(id: string): void {
    const behaviour = this.network.behaviours.find((b) => b.id === id);
    if (behaviour) {
      this.callbacks.onSelectBehaviour(id);
      this.session.behaviourId = id;
      this.session.behaviourLabel = behaviour.label;
      this.goToStep('add-outcomes');
    }
  }

  private createOutcome(label: string): void {
    if (this.session.behaviourId === null) return;

    const outcome = this.callbacks.onCreateOutcome(label, this.session.behaviourId);
    this.session.outcomes.push({
      outcomeId: outcome.id,
      outcomeLabel: outcome.label,
      explained: false,
    });
    this.render();
  }

  private linkOutcome(outcomeId: string): void {
    if (this.session.behaviourId === null) return;

    const outcome = this.network.outcomes.find((o) => o.id === outcomeId);
    if (outcome) {
      this.callbacks.onLinkOutcome(outcomeId, this.session.behaviourId);
      this.session.outcomes.push({
        outcomeId: outcome.id,
        outcomeLabel: outcome.label,
        explained: false,
      });
      this.render();
    }
  }

  private removeOutcome(outcomeId: string): void {
    this.session.outcomes = this.session.outcomes.filter((o) => o.outcomeId !== outcomeId);
    this.render();
  }

  private createValue(label: string, pendingOutcome: PendingOutcome): void {
    const value = this.callbacks.onCreateValue(label, pendingOutcome.outcomeId);
    this.session.valueIds.push(value.id);
    this.markOutcomeExplained(pendingOutcome);
  }

  private linkValue(valueId: string, pendingOutcome: PendingOutcome): void {
    this.callbacks.onLinkValue(valueId, pendingOutcome.outcomeId);
    if (!this.session.valueIds.includes(valueId)) {
      this.session.valueIds.push(valueId);
    }
    this.markOutcomeExplained(pendingOutcome);
  }

  private chainOutcome(label: string, pendingOutcome: PendingOutcome): void {
    // Create a new intermediate outcome linked to the current outcome
    // This creates an outcome-to-outcome chain (conceptually, though we model as behaviour->outcome->value)
    // For MVP, we'll treat this as creating a new outcome and marking current as explained
    const newOutcome = this.callbacks.onChainOutcome(label, pendingOutcome.outcomeId);
    
    // Add the new outcome to pending list (it also needs to be explained)
    this.session.outcomes.push({
      outcomeId: newOutcome.id,
      outcomeLabel: newOutcome.label,
      explained: false,
    });
    
    // Mark the original outcome as explained (it chains to the new one)
    this.markOutcomeExplained(pendingOutcome);
  }

  private markOutcomeExplained(pendingOutcome: PendingOutcome): void {
    const index = this.session.outcomes.findIndex((o) => o.outcomeId === pendingOutcome.outcomeId);
    if (index !== -1) {
      const outcome = this.session.outcomes[index];
      if (outcome) {
        outcome.explained = true;
      }
    }

    // Move to next unexplained or complete
    const next = getNextUnexplainedOutcome(this.session);
    if (next) {
      this.session.currentOutcomeIndex = this.session.outcomes.findIndex(
        (o) => o.outcomeId === next.outcomeId
      );
      this.render();
    } else {
      this.goToStep('complete');
    }
  }

  private skipOutcome(pendingOutcome: PendingOutcome): void {
    // Leave outcome unexplained but move on
    const currentIndex = this.session.outcomes.findIndex(
      (o) => o.outcomeId === pendingOutcome.outcomeId
    );
    this.session.currentOutcomeIndex = currentIndex + 1;

    const next = getNextUnexplainedOutcome(this.session);
    if (next) {
      this.render();
    } else {
      this.goToStep('complete');
    }
  }

  private exitEarly(): void {
    this.session.completed = false;
    this.callbacks.onExit(this.session);
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
