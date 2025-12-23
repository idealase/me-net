/**
 * Outcome Form Component
 *
 * Form for creating and editing Outcome entities.
 */

import type { Network } from '@/types';

import {
  FormError,
  FormMode,
  OutcomeFormCallbacks,
  OutcomeFormData,
  defaultOutcomeFormData,
  getLabelsForType,
  validateLabel,
} from './types';

export interface OutcomeFormOptions {
  mode: FormMode;
  network: Network;
  initialData?: OutcomeFormData;
  callbacks: OutcomeFormCallbacks;
}

export class OutcomeForm {
  private container: HTMLElement;
  private mode: FormMode;
  private network: Network;
  private data: OutcomeFormData;
  private originalLabel?: string;
  private callbacks: OutcomeFormCallbacks;
  private errors: FormError[] = [];

  constructor(container: HTMLElement, options: OutcomeFormOptions) {
    this.container = container;
    this.mode = options.mode;
    this.network = options.network;
    this.callbacks = options.callbacks;

    if (options.initialData) {
      this.data = { ...options.initialData };
      this.originalLabel = options.initialData.label;
    } else {
      this.data = { ...defaultOutcomeFormData };
    }

    this.render();
  }

  private render(): void {
    const title = this.mode === 'create' ? 'Add Outcome' : 'Edit Outcome';
    const submitLabel = this.mode === 'create' ? 'Create' : 'Save';

    this.container.innerHTML = `
      <form class="entity-form outcome-form" novalidate>
        <h3 class="form-title">${title}</h3>
        
        <div class="form-group">
          <label for="outcome-label" class="form-label">
            Label <span class="required">*</span>
          </label>
          <input
            type="text"
            id="outcome-label"
            class="form-input"
            value="${this.escapeHtml(this.data.label)}"
            placeholder="e.g., Mental clarity"
            maxlength="100"
            required
          />
          <div class="form-error" id="label-error"></div>
        </div>

        <div class="form-group">
          <label for="outcome-notes" class="form-label">Notes</label>
          <textarea
            id="outcome-notes"
            class="form-textarea"
            rows="3"
            placeholder="Optional notes about this outcome..."
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
    const labelInput = this.container.querySelector('#outcome-label') as HTMLInputElement;
    const notesTextarea = this.container.querySelector('#outcome-notes') as HTMLTextAreaElement;
    const cancelBtn = this.container.querySelector('#btn-cancel') as HTMLButtonElement;
    const deleteBtn = this.container.querySelector('#btn-delete');

    // Update data on input
    labelInput.addEventListener('input', () => {
      this.data.label = labelInput.value;
      this.validateField('label');
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
        if (confirm('Are you sure you want to delete this outcome? This will also remove all connected links.')) {
          this.callbacks.onDelete!();
        }
      });
    }
  }

  private validateField(field: string): boolean {
    this.errors = this.errors.filter((e) => e.field !== field);

    if (field === 'label') {
      const existingLabels = getLabelsForType(this.network, 'outcome');
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

    const existingLabels = getLabelsForType(this.network, 'outcome');
    const labelError = validateLabel(this.data.label, existingLabels, this.originalLabel);
    if (labelError) {
      this.errors.push(labelError);
    }

    this.updateErrorDisplay();
    return this.errors.length === 0;
  }

  private updateErrorDisplay(): void {
    const labelError = this.container.querySelector('#label-error') as HTMLElement;
    const labelInput = this.container.querySelector('#outcome-label') as HTMLInputElement;

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

  getData(): OutcomeFormData {
    return { ...this.data };
  }

  setNetwork(network: Network): void {
    this.network = network;
  }
}
