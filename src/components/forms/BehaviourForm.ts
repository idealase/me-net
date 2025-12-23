/**
 * Behaviour Form Component
 *
 * Form for creating and editing Behaviour entities.
 */

import type { Network } from '@/types';

import {
  BehaviourFormCallbacks,
  BehaviourFormData,
  FormError,
  FormMode,
  costOptions,
  defaultBehaviourFormData,
  frequencyOptions,
  getLabelsForType,
  validateLabel,
} from './types';

export interface BehaviourFormOptions {
  mode: FormMode;
  network: Network;
  initialData?: BehaviourFormData;
  callbacks: BehaviourFormCallbacks;
}

export class BehaviourForm {
  private container: HTMLElement;
  private mode: FormMode;
  private network: Network;
  private data: BehaviourFormData;
  private originalLabel?: string;
  private callbacks: BehaviourFormCallbacks;
  private errors: FormError[] = [];

  constructor(container: HTMLElement, options: BehaviourFormOptions) {
    this.container = container;
    this.mode = options.mode;
    this.network = options.network;
    this.callbacks = options.callbacks;

    if (options.initialData) {
      this.data = { ...options.initialData };
      this.originalLabel = options.initialData.label;
    } else {
      this.data = { ...defaultBehaviourFormData };
    }

    this.render();
  }

  private render(): void {
    const title = this.mode === 'create' ? 'Add Behaviour' : 'Edit Behaviour';
    const submitLabel = this.mode === 'create' ? 'Create' : 'Save';

    this.container.innerHTML = `
      <form class="entity-form behaviour-form" novalidate>
        <h3 class="form-title">${title}</h3>
        
        <div class="form-group">
          <label for="behaviour-label" class="form-label">
            Label <span class="required">*</span>
          </label>
          <input
            type="text"
            id="behaviour-label"
            class="form-input"
            value="${this.escapeHtml(this.data.label)}"
            placeholder="e.g., Morning meditation"
            maxlength="100"
            required
          />
          <div class="form-error" id="label-error"></div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="behaviour-frequency" class="form-label">Frequency</label>
            <select id="behaviour-frequency" class="form-select">
              ${frequencyOptions.map((opt) => `<option value="${opt.value}" ${this.data.frequency === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="behaviour-cost" class="form-label">Cost</label>
            <select id="behaviour-cost" class="form-select">
              ${costOptions.map((opt) => `<option value="${opt.value}" ${this.data.cost === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="behaviour-tags" class="form-label">Context Tags</label>
          <input
            type="text"
            id="behaviour-tags"
            class="form-input"
            value="${this.escapeHtml(this.data.contextTags.join(', '))}"
            placeholder="e.g., morning, alone, work"
          />
          <div class="form-hint">Separate tags with commas</div>
        </div>

        <div class="form-group">
          <label for="behaviour-notes" class="form-label">Notes</label>
          <textarea
            id="behaviour-notes"
            class="form-textarea"
            rows="3"
            placeholder="Optional notes about this behaviour..."
          >${this.escapeHtml(this.data.notes)}</textarea>
        </div>

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
    const labelInput = this.container.querySelector('#behaviour-label') as HTMLInputElement;
    const frequencySelect = this.container.querySelector('#behaviour-frequency') as HTMLSelectElement;
    const costSelect = this.container.querySelector('#behaviour-cost') as HTMLSelectElement;
    const tagsInput = this.container.querySelector('#behaviour-tags') as HTMLInputElement;
    const notesTextarea = this.container.querySelector('#behaviour-notes') as HTMLTextAreaElement;
    const cancelBtn = this.container.querySelector('#btn-cancel') as HTMLButtonElement;
    const deleteBtn = this.container.querySelector('#btn-delete');

    // Update data on input
    labelInput.addEventListener('input', () => {
      this.data.label = labelInput.value;
      this.validateField('label');
    });

    frequencySelect.addEventListener('change', () => {
      this.data.frequency = frequencySelect.value as typeof this.data.frequency;
    });

    costSelect.addEventListener('change', () => {
      this.data.cost = costSelect.value as typeof this.data.cost;
    });

    tagsInput.addEventListener('input', () => {
      this.data.contextTags = tagsInput.value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    });

    notesTextarea.addEventListener('input', () => {
      this.data.notes = notesTextarea.value;
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate()) {
        this.callbacks.onSave(this.data);
      }
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
      this.callbacks.onCancel();
    });

    // Delete button
    if (deleteBtn && this.callbacks.onDelete) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this behaviour? This will also remove all connected links.')) {
          this.callbacks.onDelete!();
        }
      });
    }
  }

  private validateField(field: string): boolean {
    // Remove existing error for this field
    this.errors = this.errors.filter((e) => e.field !== field);

    if (field === 'label') {
      const existingLabels = getLabelsForType(this.network, 'behaviour');
      const error = validateLabel(this.data.label, existingLabels, this.originalLabel);
      if (error) {
        this.errors.push(error);
      }
    }

    this.updateErrorDisplay();
    return !this.errors.some((e) => e.field === field);
  }

  private validate(): boolean {
    this.errors = [];

    // Validate label
    const existingLabels = getLabelsForType(this.network, 'behaviour');
    const labelError = validateLabel(this.data.label, existingLabels, this.originalLabel);
    if (labelError) {
      this.errors.push(labelError);
    }

    this.updateErrorDisplay();
    return this.errors.length === 0;
  }

  private updateErrorDisplay(): void {
    const labelError = this.container.querySelector('#label-error') as HTMLElement;
    const labelInput = this.container.querySelector('#behaviour-label') as HTMLInputElement;

    const error = this.errors.find((e) => e.field === 'label');
    if (error) {
      labelError.textContent = error.message;
      labelInput.classList.add('invalid');
    } else {
      labelError.textContent = '';
      labelInput.classList.remove('invalid');
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get the current form data.
   */
  getData(): BehaviourFormData {
    return { ...this.data };
  }

  /**
   * Update the network reference (for validation).
   */
  setNetwork(network: Network): void {
    this.network = network;
  }
}
