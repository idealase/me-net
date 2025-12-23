/**
 * Value CRUD Operations
 *
 * Functions for creating, reading, updating, and deleting Values.
 */

import type { Value, Network, Importance, Neglect } from '@/types';
import { generateId, now } from '@/utils/id';

// ============================================================================
// Types
// ============================================================================

export interface CreateValueInput {
  label: string;
  importance: Importance;
  neglect: Neglect;
  notes?: string;
}

export interface UpdateValueInput {
  label?: string;
  importance?: Importance;
  neglect?: Neglect;
  notes?: string;
}

export interface CrudResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Create
// ============================================================================

/**
 * Add a new value to the network.
 * Returns the updated network and the new value.
 */
export function addValue(
  network: Network,
  input: CreateValueInput
): CrudResult<{ network: Network; value: Value }> {
  // Validate label
  const labelValidation = validateLabel(input.label, network);
  if (!labelValidation.valid) {
    return { success: false, error: labelValidation.error };
  }

  const value: Value = {
    id: generateId('v'),
    type: 'value',
    label: input.label.trim(),
    importance: input.importance,
    neglect: input.neglect,
    notes: input.notes,
    createdAt: now(),
    updatedAt: now(),
  };

  const updatedNetwork: Network = {
    ...network,
    values: [...network.values, value],
  };

  return {
    success: true,
    data: { network: updatedNetwork, value },
  };
}

// ============================================================================
// Read
// ============================================================================

/**
 * Find a value by ID.
 */
export function getValueById(network: Network, id: string): Value | undefined {
  return network.values.find((v) => v.id === id);
}

/**
 * Find a value by label (case-insensitive).
 */
export function getValueByLabel(network: Network, label: string): Value | undefined {
  const normalised = label.trim().toLowerCase();
  return network.values.find((v) => v.label.toLowerCase() === normalised);
}

/**
 * Get all values.
 */
export function getAllValues(network: Network): Value[] {
  return network.values;
}

/**
 * Get values filtered by importance level.
 */
export function getValuesByImportance(network: Network, importance: Importance): Value[] {
  return network.values.filter((v) => v.importance === importance);
}

/**
 * Get values filtered by neglect level.
 */
export function getValuesByNeglect(network: Network, neglect: Neglect): Value[] {
  return network.values.filter((v) => v.neglect === neglect);
}

// ============================================================================
// Update
// ============================================================================

/**
 * Update an existing value.
 * Returns the updated network and value.
 */
export function updateValue(
  network: Network,
  id: string,
  input: UpdateValueInput
): CrudResult<{ network: Network; value: Value }> {
  const existingIndex = network.values.findIndex((v) => v.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Value with id "${id}" not found` };
  }

  const existing = network.values[existingIndex]!;

  // Validate label uniqueness if changing label
  if (input.label !== undefined && input.label.trim().toLowerCase() !== existing.label.toLowerCase()) {
    const labelValidation = validateLabel(input.label, network);
    if (!labelValidation.valid) {
      return { success: false, error: labelValidation.error };
    }
  }

  const updated: Value = {
    ...existing,
    label: input.label?.trim() ?? existing.label,
    importance: input.importance ?? existing.importance,
    neglect: input.neglect ?? existing.neglect,
    notes: input.notes ?? existing.notes,
    updatedAt: now(),
  };

  const updatedValues = [...network.values];
  updatedValues[existingIndex] = updated;

  const updatedNetwork: Network = {
    ...network,
    values: updatedValues,
  };

  return {
    success: true,
    data: { network: updatedNetwork, value: updated },
  };
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete a value and all its incident links.
 * Returns the updated network.
 */
export function deleteValue(
  network: Network,
  id: string
): CrudResult<{ network: Network }> {
  const existingIndex = network.values.findIndex((v) => v.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Value with id "${id}" not found` };
  }

  // Remove value
  const updatedValues = network.values.filter((v) => v.id !== id);

  // Cascade delete: remove all links where this value is the target
  const updatedLinks = network.links.filter((link) => link.targetId !== id);

  const updatedNetwork: Network = {
    ...network,
    values: updatedValues,
    links: updatedLinks,
  };

  return {
    success: true,
    data: { network: updatedNetwork },
  };
}

// ============================================================================
// Validation
// ============================================================================

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate value label (non-empty, unique within values).
 */
function validateLabel(label: string, network: Network): ValidationResult {
  const trimmed = label.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Label cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Label cannot exceed 100 characters' };
  }

  // Check uniqueness (case-insensitive)
  const exists = network.values.some(
    (v) => v.label.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    return { valid: false, error: `A value with label "${trimmed}" already exists` };
  }

  return { valid: true };
}
