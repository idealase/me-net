/**
 * Link Form Component
 *
 * Form for creating and editing links between nodes.
 * Includes autocomplete for selecting source/target nodes.
 * Supports "create-on-link" - allows creating new target nodes inline.
 */

import type { Network } from '@/types';

import {
  AutocompleteItem,
  BehaviourOutcomeLinkFormData,
  FormError,
  FormMode,
  LinkFormCallbacksWithCreate,
  LinkFormData,
  LinkFormDataWithPending,
  OutcomeValueLinkFormData,
  PendingNodeCreation,
  defaultBehaviourOutcomeLinkFormData,
  defaultOutcomeValueLinkFormData,
  getAutocompleteSuggestions,
  getLabelsForType,
  linkExists,
  reliabilityOptions,
  strengthOptions,
  valenceOptions,
} from './types';

export type LinkType = 'behaviour-outcome' | 'outcome-value';

export interface LinkFormOptions {
  mode: FormMode;
  linkType: LinkType;
  network: Network;
  initialData?: LinkFormData;
  /** Pre-select a source node (e.g., when adding link from detail panel) */
  preselectedSourceId?: string;
  /** Pre-select a target node */
  preselectedTargetId?: string;
  /** Enable create-on-link for target nodes (default: true for create mode) */
  allowCreateTarget?: boolean;
  callbacks: LinkFormCallbacksWithCreate;
}

export class LinkForm {
  private container: HTMLElement;
  private mode: FormMode;
  private linkType: LinkType;
  private network: Network;
  private data: LinkFormData;
  private callbacks: LinkFormCallbacksWithCreate;
  private errors: FormError[] = [];
  private allowCreateTarget: boolean;

  // Autocomplete state
  private sourceQuery: string = '';
  private targetQuery: string = '';
  private sourceSuggestions: AutocompleteItem[] = [];
  private targetSuggestions: AutocompleteItem[] = [];
  private selectedSource: AutocompleteItem | null = null;
  private selectedTarget: AutocompleteItem | null = null;
  
  // Create-on-link state
  private pendingTargetCreation: PendingNodeCreation | null = null;

  constructor(container: HTMLElement, options: LinkFormOptions) {
    this.container = container;
    this.mode = options.mode;
    this.linkType = options.linkType;
    this.network = options.network;
    this.callbacks = options.callbacks;
    // Enable create-on-link by default in create mode
    this.allowCreateTarget = options.allowCreateTarget ?? (options.mode === 'create');

    // Initialize data based on link type
    if (options.initialData) {
      this.data = { ...options.initialData };
      // Populate selected source/target from IDs
      this.selectedSource = this.findNodeById(this.data.sourceId);
      this.selectedTarget = this.findNodeById(this.data.targetId);
    } else {
      this.data =
        this.linkType === 'behaviour-outcome'
          ? { ...defaultBehaviourOutcomeLinkFormData }
          : { ...defaultOutcomeValueLinkFormData };

      // Handle preselected source/target
      if (options.preselectedSourceId !== undefined && options.preselectedSourceId !== '') {
        this.data.sourceId = options.preselectedSourceId;
        this.selectedSource = this.findNodeById(options.preselectedSourceId);
      }
      if (options.preselectedTargetId !== undefined && options.preselectedTargetId !== '') {
        this.data.targetId = options.preselectedTargetId;
        this.selectedTarget = this.findNodeById(options.preselectedTargetId);
      }
    }

    this.render();
  }

  private findNodeById(id: string): AutocompleteItem | null {
    if (id === '') return null;

    const behaviour = this.network.behaviours.find((b) => b.id === id);
    if (behaviour) return { id: behaviour.id, label: behaviour.label, type: 'behaviour' };

    const outcome = this.network.outcomes.find((o) => o.id === id);
    if (outcome) return { id: outcome.id, label: outcome.label, type: 'outcome' };

    const value = this.network.values.find((v) => v.id === id);
    if (value) return { id: value.id, label: value.label, type: 'value' };

    return null;
  }

  private get sourceNodeType(): 'behaviour' | 'outcome' {
    return this.linkType === 'behaviour-outcome' ? 'behaviour' : 'outcome';
  }

  private get targetNodeType(): 'outcome' | 'value' {
    return this.linkType === 'behaviour-outcome' ? 'outcome' : 'value';
  }

  private render(): void {
    const title =
      this.mode === 'create'
        ? this.linkType === 'behaviour-outcome'
          ? 'Link Behaviour → Outcome'
          : 'Link Outcome → Value'
        : 'Edit Link';
    const submitLabel = this.mode === 'create' 
      ? (this.pendingTargetCreation ? 'Create & Link' : 'Create Link')
      : 'Save';

    const sourceTypeLabel = this.sourceNodeType === 'behaviour' ? 'Behaviour' : 'Outcome';
    const targetTypeLabel = this.targetNodeType === 'outcome' ? 'Outcome' : 'Value';

    // Show pending creation indicator if creating new target
    const pendingIndicator = this.pendingTargetCreation
      ? `<div class="pending-creation-indicator">
          <span class="pending-icon">✨</span>
          <span class="pending-text">Will create new ${targetTypeLabel.toLowerCase()}: "${this.escapeHtml(this.pendingTargetCreation.label)}"</span>
        </div>`
      : '';

    const attributeField =
      this.linkType === 'behaviour-outcome'
        ? `
          <div class="form-group">
            <label for="link-reliability" class="form-label">Reliability</label>
            <select id="link-reliability" class="form-select">
              ${reliabilityOptions.map((opt) => `<option value="${opt.value}" ${(this.data as BehaviourOutcomeLinkFormData).reliability === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
            <div class="form-hint">How reliably does this behaviour produce this outcome?</div>
          </div>
        `
        : `
          <div class="form-group">
            <label for="link-strength" class="form-label">Strength</label>
            <select id="link-strength" class="form-select">
              ${strengthOptions.map((opt) => `<option value="${opt.value}" ${(this.data as OutcomeValueLinkFormData).strength === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
            <div class="form-hint">How strongly does this outcome contribute to this value?</div>
          </div>
        `;

    this.container.innerHTML = `
      <form class="entity-form link-form" novalidate>
        <h3 class="form-title">${title}</h3>

        <div class="form-group">
          <label for="link-source" class="form-label">
            ${sourceTypeLabel} <span class="required">*</span>
          </label>
          <div class="autocomplete-wrapper">
            <input
              type="text"
              id="link-source"
              class="form-input autocomplete-input"
              value="${this.selectedSource ? this.escapeHtml(this.selectedSource.label) : ''}"
              placeholder="Search ${sourceTypeLabel.toLowerCase()}s..."
              autocomplete="off"
              ${this.mode === 'edit' || this.selectedSource ? 'readonly' : ''}
            />
            ${this.selectedSource ? `<button type="button" class="autocomplete-clear" id="clear-source">×</button>` : ''}
            <div class="autocomplete-dropdown" id="source-dropdown" style="display: none;"></div>
          </div>
          <div class="form-error" id="source-error"></div>
        </div>

        <div class="link-direction-indicator">↓</div>

        <div class="form-group">
          <label for="link-target" class="form-label">
            ${targetTypeLabel} <span class="required">*</span>
          </label>
          <div class="autocomplete-wrapper">
            <input
              type="text"
              id="link-target"
              class="form-input autocomplete-input ${this.pendingTargetCreation ? 'pending-creation' : ''}"
              value="${this.selectedTarget ? this.escapeHtml(this.selectedTarget.label) : (this.pendingTargetCreation ? this.escapeHtml(this.pendingTargetCreation.label) : '')}"
              placeholder="${this.allowCreateTarget ? `Search or type new ${targetTypeLabel.toLowerCase()}...` : `Search ${targetTypeLabel.toLowerCase()}s...`}"
              autocomplete="off"
              ${this.mode === 'edit' || this.selectedTarget ? 'readonly' : ''}
            />
            ${this.selectedTarget ? `<button type="button" class="autocomplete-clear" id="clear-target">×</button>` : ''}
            ${this.pendingTargetCreation ? `<button type="button" class="autocomplete-clear" id="clear-pending">×</button>` : ''}
            <div class="autocomplete-dropdown" id="target-dropdown" style="display: none;"></div>
          </div>
          ${pendingIndicator}
          <div class="form-error" id="target-error"></div>
          ${this.allowCreateTarget && this.mode === 'create' ? `<div class="form-hint">Type a new name to create a ${targetTypeLabel.toLowerCase()} on the fly</div>` : ''}
        </div>

        <div class="form-group">
          <label for="link-valence" class="form-label">Valence</label>
          <select id="link-valence" class="form-select">
            ${valenceOptions.map((opt) => `<option value="${opt.value}" ${this.data.valence === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
          </select>
          <div class="form-hint">Does this link have a positive or negative effect?</div>
        </div>

        ${attributeField}

        <div class="form-actions">
          ${this.mode === 'edit' && this.callbacks.onDelete ? '<button type="button" class="btn btn-danger" id="btn-delete">Delete</button>' : ''}
          <button type="button" class="btn btn-secondary" id="btn-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-submit">${submitLabel}</button>
        </div>
      </form>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const form = this.container.querySelector('form')!;
    const sourceInput = this.container.querySelector('#link-source') as HTMLInputElement;
    const targetInput = this.container.querySelector('#link-target') as HTMLInputElement;
    const sourceDropdown = this.container.querySelector('#source-dropdown') as HTMLElement;
    const targetDropdown = this.container.querySelector('#target-dropdown') as HTMLElement;
    const valenceSelect = this.container.querySelector('#link-valence') as HTMLSelectElement;
    const cancelBtn = this.container.querySelector('#btn-cancel') as HTMLButtonElement;
    const deleteBtn = this.container.querySelector('#btn-delete');
    const clearSourceBtn = this.container.querySelector('#clear-source');
    const clearTargetBtn = this.container.querySelector('#clear-target');
    const clearPendingBtn = this.container.querySelector('#clear-pending');

    // Source autocomplete (only if not readonly)
    if (!sourceInput.readOnly) {
      sourceInput.addEventListener('input', () => {
        this.sourceQuery = sourceInput.value;
        this.updateSourceSuggestions();
      });

      sourceInput.addEventListener('focus', () => {
        this.updateSourceSuggestions();
      });

      sourceInput.addEventListener('blur', () => {
        // Delay to allow click on dropdown item
        setTimeout(() => {
          sourceDropdown.style.display = 'none';
        }, 200);
      });
    }

    // Target autocomplete (only if not readonly)
    if (!targetInput.readOnly) {
      targetInput.addEventListener('input', () => {
        this.targetQuery = targetInput.value;
        this.updateTargetSuggestions();
      });

      targetInput.addEventListener('focus', () => {
        this.updateTargetSuggestions();
      });

      targetInput.addEventListener('blur', () => {
        setTimeout(() => {
          targetDropdown.style.display = 'none';
        }, 200);
      });
    }

    // Clear buttons
    if (clearSourceBtn) {
      clearSourceBtn.addEventListener('click', () => {
        this.selectedSource = null;
        this.data.sourceId = '';
        this.render();
      });
    }

    if (clearTargetBtn) {
      clearTargetBtn.addEventListener('click', () => {
        this.selectedTarget = null;
        this.data.targetId = '';
        this.render();
      });
    }

    // Clear pending creation
    if (clearPendingBtn) {
      clearPendingBtn.addEventListener('click', () => {
        this.pendingTargetCreation = null;
        this.data.targetId = '';
        this.render();
      });
    }

    // Valence change
    valenceSelect.addEventListener('change', () => {
      this.data.valence = valenceSelect.value as typeof this.data.valence;
    });

    // Reliability/Strength change
    if (this.linkType === 'behaviour-outcome') {
      const reliabilitySelect = this.container.querySelector('#link-reliability') as HTMLSelectElement;
      reliabilitySelect.addEventListener('change', () => {
        (this.data as BehaviourOutcomeLinkFormData).reliability = reliabilitySelect.value as 'always' | 'usually' | 'sometimes' | 'rarely';
      });
    } else {
      const strengthSelect = this.container.querySelector('#link-strength') as HTMLSelectElement;
      strengthSelect.addEventListener('change', () => {
        (this.data as OutcomeValueLinkFormData).strength = strengthSelect.value as 'strong' | 'moderate' | 'weak';
      });
    }

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate()) {
        // Handle create-on-link: if there's a pending target creation
        if (this.pendingTargetCreation && this.callbacks.onSaveWithNewNode) {
          const dataWithPending: LinkFormDataWithPending = {
            linkData: this.data,
            pendingTarget: this.pendingTargetCreation,
          };
          this.callbacks.onSaveWithNewNode(dataWithPending);
        } else {
          this.callbacks.onSave(this.data);
        }
      }
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
      this.callbacks.onCancel();
    });

    // Delete button
    if (deleteBtn && this.callbacks.onDelete) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this link?')) {
          this.callbacks.onDelete!();
        }
      });
    }
  }

  private updateSourceSuggestions(): void {
    const dropdown = this.container.querySelector('#source-dropdown') as HTMLElement;

    this.sourceSuggestions = getAutocompleteSuggestions(this.network, this.sourceNodeType, this.sourceQuery);

    if (this.sourceSuggestions.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = this.sourceSuggestions
      .map(
        (item) => `
        <div class="autocomplete-item" data-id="${item.id}">
          <span class="autocomplete-label">${this.escapeHtml(item.label)}</span>
        </div>
      `
      )
      .join('');

    dropdown.style.display = 'block';

    // Bind click events on items
    dropdown.querySelectorAll('.autocomplete-item').forEach((el) => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const id = (el as HTMLElement).dataset.id!;
        const item = this.sourceSuggestions.find((s) => s.id === id);
        if (item) {
          this.selectSource(item);
        }
      });
    });
  }

  private updateTargetSuggestions(): void {
    const dropdown = this.container.querySelector('#target-dropdown') as HTMLElement;

    // Exclude already linked targets if creating new link
    const excludeIds: string[] = [];
    if (this.mode === 'create' && this.data.sourceId) {
      // Get all existing targets for this source
      this.network.links
        .filter((l) => l.sourceId === this.data.sourceId)
        .forEach((l) => excludeIds.push(l.targetId));
    }

    // Pass allowCreateTarget to show "Create new" option when no match found
    this.targetSuggestions = getAutocompleteSuggestions(
      this.network,
      this.targetNodeType,
      this.targetQuery,
      excludeIds,
      this.allowCreateTarget
    );

    if (this.targetSuggestions.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = this.targetSuggestions
      .map(
        (item) => `
        <div class="autocomplete-item ${item.isCreateNew === true ? 'autocomplete-item-create' : ''}" data-id="${item.id}" data-create="${String(item.isCreateNew === true)}">
          ${item.isCreateNew === true
            ? `<span class="autocomplete-create-icon">✨</span><span class="autocomplete-label">Create "${this.escapeHtml(item.label)}"</span>`
            : `<span class="autocomplete-label">${this.escapeHtml(item.label)}</span>`
          }
        </div>
      `
      )
      .join('');

    dropdown.style.display = 'block';

    dropdown.querySelectorAll('.autocomplete-item').forEach((el) => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const id = (el as HTMLElement).dataset.id!;
        const isCreate = (el as HTMLElement).dataset.create === 'true';
        const item = this.targetSuggestions.find((s) => s.id === id);
        if (item) {
          if (isCreate) {
            this.selectPendingTarget(item);
          } else {
            this.selectTarget(item);
          }
        }
      });
    });
  }

  private selectSource(item: AutocompleteItem): void {
    this.selectedSource = item;
    this.data.sourceId = item.id;
    this.render();
  }

  private selectTarget(item: AutocompleteItem): void {
    this.selectedTarget = item;
    this.data.targetId = item.id;
    // Clear any pending creation since we selected an existing node
    this.pendingTargetCreation = null;
    this.render();
  }

  /**
   * Select a pending target for creation (create-on-link).
   * This sets up the state for creating a new node when the form is submitted.
   */
  private selectPendingTarget(item: AutocompleteItem): void {
    this.pendingTargetCreation = {
      label: item.label,
      type: this.targetNodeType,
    };
    // Clear selected target and use a placeholder ID
    this.selectedTarget = null;
    this.data.targetId = '__pending__';
    this.render();
  }

  private validate(): boolean {
    this.errors = [];

    if (!this.data.sourceId) {
      this.errors.push({ field: 'source', message: `Please select a ${this.sourceNodeType}` });
    }

    // For target, either need a selected target OR a pending creation
    if (!this.data.targetId && !this.pendingTargetCreation) {
      this.errors.push({ field: 'target', message: `Please select a ${this.targetNodeType}` });
    }

    // Validate pending target creation
    if (this.pendingTargetCreation) {
      const label = this.pendingTargetCreation.label.trim();
      
      // Check if label is empty
      if (!label) {
        this.errors.push({ field: 'target', message: 'Label cannot be empty' });
      } else {
        // Check for duplicate labels in the target type
        const existingLabels = getLabelsForType(this.network, this.targetNodeType);
        const isDuplicate = existingLabels.some(
          (existing) => existing.toLowerCase() === label.toLowerCase()
        );
        if (isDuplicate) {
          this.errors.push({ 
            field: 'target', 
            message: `A ${this.targetNodeType} with label "${label}" already exists` 
          });
        }
        
        // Check label length
        if (label.length > 100) {
          this.errors.push({ field: 'target', message: 'Label must be 100 characters or less' });
        }
      }
    }

    // Check for duplicate link (in create mode, only if target is an existing node)
    if (this.mode === 'create' && this.data.sourceId && this.data.targetId && !this.pendingTargetCreation) {
      if (linkExists(this.network, this.data.sourceId, this.data.targetId)) {
        this.errors.push({ field: 'target', message: 'A link between these nodes already exists' });
      }
    }

    this.updateErrorDisplay();
    return this.errors.length === 0;
  }

  private updateErrorDisplay(): void {
    const sourceError = this.container.querySelector('#source-error') as HTMLElement;
    const targetError = this.container.querySelector('#target-error') as HTMLElement;
    const sourceInput = this.container.querySelector('#link-source') as HTMLInputElement;
    const targetInput = this.container.querySelector('#link-target') as HTMLInputElement;

    const srcErr = this.errors.find((e) => e.field === 'source');
    if (srcErr) {
      sourceError.textContent = srcErr.message;
      sourceInput.classList.add('invalid');
    } else {
      sourceError.textContent = '';
      sourceInput.classList.remove('invalid');
    }

    const tgtErr = this.errors.find((e) => e.field === 'target');
    if (tgtErr) {
      targetError.textContent = tgtErr.message;
      targetInput.classList.add('invalid');
    } else {
      targetError.textContent = '';
      targetInput.classList.remove('invalid');
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getData(): LinkFormData {
    return { ...this.data };
  }

  /**
   * Get form data including any pending node creation.
   */
  getDataWithPending(): LinkFormDataWithPending {
    return {
      linkData: { ...this.data },
      pendingTarget: this.pendingTargetCreation ?? undefined,
    };
  }

  /**
   * Check if there's a pending target creation.
   */
  hasPendingCreation(): boolean {
    return this.pendingTargetCreation !== null;
  }

  setNetwork(network: Network): void {
    this.network = network;
  }
}
