/**
 * Behaviour CRUD Operations
 *
 * Functions for creating, reading, updating, and deleting Behaviours.
 */

import type { Behaviour, Network, Cost, Frequency } from '@/types';
import { generateId, now } from '@/utils/id';

// ============================================================================
// Types
// ============================================================================

export interface CreateBehaviourInput {
  label: string;
  frequency: Frequency;
  cost: Cost;
  contextTags?: string[];
  notes?: string;
}

export interface UpdateBehaviourInput {
  label?: string;
  frequency?: Frequency;
  cost?: Cost;
  contextTags?: string[];
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
 * Add a new behaviour to the network.
 * Returns the updated network and the new behaviour.
 */
export function addBehaviour(
  network: Network,
  input: CreateBehaviourInput
): CrudResult<{ network: Network; behaviour: Behaviour }> {
  // Validate label
  const labelValidation = validateLabel(input.label, network);
  if (!labelValidation.valid) {
    return { success: false, error: labelValidation.error };
  }

  const behaviour: Behaviour = {
    id: generateId('b'),
    type: 'behaviour',
    label: input.label.trim(),
    frequency: input.frequency,
    cost: input.cost,
    contextTags: input.contextTags ?? [],
    notes: input.notes,
    createdAt: now(),
    updatedAt: now(),
  };

  const updatedNetwork: Network = {
    ...network,
    behaviours: [...network.behaviours, behaviour],
  };

  return {
    success: true,
    data: { network: updatedNetwork, behaviour },
  };
}

// ============================================================================
// Read
// ============================================================================

/**
 * Find a behaviour by ID.
 */
export function getBehaviourById(network: Network, id: string): Behaviour | undefined {
  return network.behaviours.find((b) => b.id === id);
}

/**
 * Find a behaviour by label (case-insensitive).
 */
export function getBehaviourByLabel(network: Network, label: string): Behaviour | undefined {
  const normalised = label.trim().toLowerCase();
  return network.behaviours.find((b) => b.label.toLowerCase() === normalised);
}

/**
 * Get all behaviours.
 */
export function getAllBehaviours(network: Network): Behaviour[] {
  return network.behaviours;
}

/**
 * Get behaviours filtered by context tag.
 */
export function getBehavioursByTag(network: Network, tag: string): Behaviour[] {
  const normalised = tag.trim().toLowerCase();
  return network.behaviours.filter((b) =>
    b.contextTags.some((t) => t.toLowerCase() === normalised)
  );
}

// ============================================================================
// Update
// ============================================================================

/**
 * Update an existing behaviour.
 * Returns the updated network and behaviour.
 */
export function updateBehaviour(
  network: Network,
  id: string,
  input: UpdateBehaviourInput
): CrudResult<{ network: Network; behaviour: Behaviour }> {
  const existingIndex = network.behaviours.findIndex((b) => b.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Behaviour with id "${id}" not found` };
  }

  const existing = network.behaviours[existingIndex]!;

  // Validate label uniqueness if changing label
  if (input.label !== undefined && input.label.trim().toLowerCase() !== existing.label.toLowerCase()) {
    const labelValidation = validateLabel(input.label, network);
    if (!labelValidation.valid) {
      return { success: false, error: labelValidation.error };
    }
  }

  const updated: Behaviour = {
    ...existing,
    label: input.label?.trim() ?? existing.label,
    frequency: input.frequency ?? existing.frequency,
    cost: input.cost ?? existing.cost,
    contextTags: input.contextTags ?? existing.contextTags,
    notes: input.notes ?? existing.notes,
    updatedAt: now(),
  };

  const updatedBehaviours = [...network.behaviours];
  updatedBehaviours[existingIndex] = updated;

  const updatedNetwork: Network = {
    ...network,
    behaviours: updatedBehaviours,
  };

  return {
    success: true,
    data: { network: updatedNetwork, behaviour: updated },
  };
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete a behaviour and all its incident links.
 * Returns the updated network.
 */
export function deleteBehaviour(
  network: Network,
  id: string
): CrudResult<{ network: Network }> {
  const existingIndex = network.behaviours.findIndex((b) => b.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Behaviour with id "${id}" not found` };
  }

  // Remove behaviour
  const updatedBehaviours = network.behaviours.filter((b) => b.id !== id);

  // Cascade delete: remove all links where this behaviour is the source
  const updatedLinks = network.links.filter((link) => link.sourceId !== id);

  const updatedNetwork: Network = {
    ...network,
    behaviours: updatedBehaviours,
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
 * Validate behaviour label (non-empty, unique within behaviours).
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
  const exists = network.behaviours.some(
    (b) => b.label.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    return { valid: false, error: `A behaviour with label "${trimmed}" already exists` };
  }

  return { valid: true };
}
