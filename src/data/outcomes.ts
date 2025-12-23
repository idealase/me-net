/**
 * Outcome CRUD Operations
 *
 * Functions for creating, reading, updating, and deleting Outcomes.
 */

import type { Outcome, Network } from '@/types';
import { generateId, now } from '@/utils/id';

// ============================================================================
// Types
// ============================================================================

export interface CreateOutcomeInput {
  label: string;
  notes?: string;
}

export interface UpdateOutcomeInput {
  label?: string;
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
 * Add a new outcome to the network.
 * Returns the updated network and the new outcome.
 */
export function addOutcome(
  network: Network,
  input: CreateOutcomeInput
): CrudResult<{ network: Network; outcome: Outcome }> {
  // Validate label
  const labelValidation = validateLabel(input.label, network);
  if (!labelValidation.valid) {
    return { success: false, error: labelValidation.error };
  }

  const outcome: Outcome = {
    id: generateId('o'),
    type: 'outcome',
    label: input.label.trim(),
    notes: input.notes,
    createdAt: now(),
    updatedAt: now(),
  };

  const updatedNetwork: Network = {
    ...network,
    outcomes: [...network.outcomes, outcome],
  };

  return {
    success: true,
    data: { network: updatedNetwork, outcome },
  };
}

// ============================================================================
// Read
// ============================================================================

/**
 * Find an outcome by ID.
 */
export function getOutcomeById(network: Network, id: string): Outcome | undefined {
  return network.outcomes.find((o) => o.id === id);
}

/**
 * Find an outcome by label (case-insensitive).
 */
export function getOutcomeByLabel(network: Network, label: string): Outcome | undefined {
  const normalised = label.trim().toLowerCase();
  return network.outcomes.find((o) => o.label.toLowerCase() === normalised);
}

/**
 * Get all outcomes.
 */
export function getAllOutcomes(network: Network): Outcome[] {
  return network.outcomes;
}

// ============================================================================
// Update
// ============================================================================

/**
 * Update an existing outcome.
 * Returns the updated network and outcome.
 */
export function updateOutcome(
  network: Network,
  id: string,
  input: UpdateOutcomeInput
): CrudResult<{ network: Network; outcome: Outcome }> {
  const existingIndex = network.outcomes.findIndex((o) => o.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Outcome with id "${id}" not found` };
  }

  const existing = network.outcomes[existingIndex]!;

  // Validate label uniqueness if changing label
  if (input.label !== undefined && input.label.trim().toLowerCase() !== existing.label.toLowerCase()) {
    const labelValidation = validateLabel(input.label, network);
    if (!labelValidation.valid) {
      return { success: false, error: labelValidation.error };
    }
  }

  const updated: Outcome = {
    ...existing,
    label: input.label?.trim() ?? existing.label,
    notes: input.notes ?? existing.notes,
    updatedAt: now(),
  };

  const updatedOutcomes = [...network.outcomes];
  updatedOutcomes[existingIndex] = updated;

  const updatedNetwork: Network = {
    ...network,
    outcomes: updatedOutcomes,
  };

  return {
    success: true,
    data: { network: updatedNetwork, outcome: updated },
  };
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete an outcome and all its incident links.
 * Returns the updated network.
 */
export function deleteOutcome(
  network: Network,
  id: string
): CrudResult<{ network: Network }> {
  const existingIndex = network.outcomes.findIndex((o) => o.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Outcome with id "${id}" not found` };
  }

  // Remove outcome
  const updatedOutcomes = network.outcomes.filter((o) => o.id !== id);

  // Cascade delete: remove all links where this outcome is source OR target
  const updatedLinks = network.links.filter(
    (link) => link.sourceId !== id && link.targetId !== id
  );

  const updatedNetwork: Network = {
    ...network,
    outcomes: updatedOutcomes,
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
 * Validate outcome label (non-empty, unique within outcomes).
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
  const exists = network.outcomes.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    return { valid: false, error: `An outcome with label "${trimmed}" already exists` };
  }

  return { valid: true };
}
