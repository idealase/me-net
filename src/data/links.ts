/**
 * Link CRUD Operations
 *
 * Functions for creating, reading, updating, and deleting Links.
 * Enforces layer constraints: Behaviour→Outcome or Outcome→Value only.
 */

import type {
  Network,
  Link,
  BehaviourOutcomeLink,
  OutcomeValueLink,
  Valence,
  Reliability,
  Strength,
} from '@/types';
import { generateId, now } from '@/utils/id';

// ============================================================================
// Types
// ============================================================================

export interface CreateBehaviourOutcomeLinkInput {
  sourceId: string; // Behaviour ID
  targetId: string; // Outcome ID
  valence: Valence;
  reliability: Reliability;
}

export interface CreateOutcomeValueLinkInput {
  sourceId: string; // Outcome ID
  targetId: string; // Value ID
  valence: Valence;
  strength: Strength;
}

export interface UpdateBehaviourOutcomeLinkInput {
  valence?: Valence;
  reliability?: Reliability;
}

export interface UpdateOutcomeValueLinkInput {
  valence?: Valence;
  strength?: Strength;
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
 * Add a Behaviour→Outcome link.
 */
export function addBehaviourOutcomeLink(
  network: Network,
  input: CreateBehaviourOutcomeLinkInput
): CrudResult<{ network: Network; link: BehaviourOutcomeLink }> {
  // Validate source is a Behaviour
  const behaviour = network.behaviours.find((b) => b.id === input.sourceId);
  if (!behaviour) {
    return { success: false, error: `Behaviour with id "${input.sourceId}" not found` };
  }

  // Validate target is an Outcome
  const outcome = network.outcomes.find((o) => o.id === input.targetId);
  if (!outcome) {
    return { success: false, error: `Outcome with id "${input.targetId}" not found` };
  }

  // Check for duplicate link
  const existingLink = network.links.find(
    (l) => l.sourceId === input.sourceId && l.targetId === input.targetId
  );
  if (existingLink) {
    return {
      success: false,
      error: `A link from "${behaviour.label}" to "${outcome.label}" already exists`,
    };
  }

  const link: BehaviourOutcomeLink = {
    id: generateId('l'),
    type: 'behaviour-outcome',
    sourceId: input.sourceId,
    targetId: input.targetId,
    valence: input.valence,
    reliability: input.reliability,
    createdAt: now(),
    updatedAt: now(),
  };

  const updatedNetwork: Network = {
    ...network,
    links: [...network.links, link],
  };

  return {
    success: true,
    data: { network: updatedNetwork, link },
  };
}

/**
 * Add an Outcome→Value link.
 */
export function addOutcomeValueLink(
  network: Network,
  input: CreateOutcomeValueLinkInput
): CrudResult<{ network: Network; link: OutcomeValueLink }> {
  // Validate source is an Outcome
  const outcome = network.outcomes.find((o) => o.id === input.sourceId);
  if (!outcome) {
    return { success: false, error: `Outcome with id "${input.sourceId}" not found` };
  }

  // Validate target is a Value
  const value = network.values.find((v) => v.id === input.targetId);
  if (!value) {
    return { success: false, error: `Value with id "${input.targetId}" not found` };
  }

  // Check for duplicate link
  const existingLink = network.links.find(
    (l) => l.sourceId === input.sourceId && l.targetId === input.targetId
  );
  if (existingLink) {
    return {
      success: false,
      error: `A link from "${outcome.label}" to "${value.label}" already exists`,
    };
  }

  const link: OutcomeValueLink = {
    id: generateId('l'),
    type: 'outcome-value',
    sourceId: input.sourceId,
    targetId: input.targetId,
    valence: input.valence,
    strength: input.strength,
    createdAt: now(),
    updatedAt: now(),
  };

  const updatedNetwork: Network = {
    ...network,
    links: [...network.links, link],
  };

  return {
    success: true,
    data: { network: updatedNetwork, link },
  };
}

// ============================================================================
// Read
// ============================================================================

/**
 * Find a link by ID.
 */
export function getLinkById(network: Network, id: string): Link | undefined {
  return network.links.find((l) => l.id === id);
}

/**
 * Get all links.
 */
export function getAllLinks(network: Network): Link[] {
  return network.links;
}

/**
 * Get all links of a specific type.
 */
export function getLinksByType(
  network: Network,
  type: 'behaviour-outcome' | 'outcome-value'
): Link[] {
  return network.links.filter((l) => l.type === type);
}

/**
 * Get all outgoing links from a node.
 */
export function getOutgoingLinks(network: Network, nodeId: string): Link[] {
  return network.links.filter((l) => l.sourceId === nodeId);
}

/**
 * Get all incoming links to a node.
 */
export function getIncomingLinks(network: Network, nodeId: string): Link[] {
  return network.links.filter((l) => l.targetId === nodeId);
}

/**
 * Get links by valence.
 */
export function getLinksByValence(network: Network, valence: Valence): Link[] {
  return network.links.filter((l) => l.valence === valence);
}

/**
 * Find link between two specific nodes.
 */
export function getLinkBetween(
  network: Network,
  sourceId: string,
  targetId: string
): Link | undefined {
  return network.links.find((l) => l.sourceId === sourceId && l.targetId === targetId);
}

// ============================================================================
// Update
// ============================================================================

/**
 * Update a Behaviour→Outcome link.
 */
export function updateBehaviourOutcomeLink(
  network: Network,
  id: string,
  input: UpdateBehaviourOutcomeLinkInput
): CrudResult<{ network: Network; link: BehaviourOutcomeLink }> {
  const existingIndex = network.links.findIndex((l) => l.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Link with id "${id}" not found` };
  }

  const existing = network.links[existingIndex];
  if (existing.type !== 'behaviour-outcome') {
    return { success: false, error: `Link "${id}" is not a behaviour-outcome link` };
  }

  const updated: BehaviourOutcomeLink = {
    ...existing,
    valence: input.valence ?? existing.valence,
    reliability: input.reliability ?? existing.reliability,
    updatedAt: now(),
  };

  const updatedLinks = [...network.links];
  updatedLinks[existingIndex] = updated;

  const updatedNetwork: Network = {
    ...network,
    links: updatedLinks,
  };

  return {
    success: true,
    data: { network: updatedNetwork, link: updated },
  };
}

/**
 * Update an Outcome→Value link.
 */
export function updateOutcomeValueLink(
  network: Network,
  id: string,
  input: UpdateOutcomeValueLinkInput
): CrudResult<{ network: Network; link: OutcomeValueLink }> {
  const existingIndex = network.links.findIndex((l) => l.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Link with id "${id}" not found` };
  }

  const existing = network.links[existingIndex];
  if (existing.type !== 'outcome-value') {
    return { success: false, error: `Link "${id}" is not an outcome-value link` };
  }

  const updated: OutcomeValueLink = {
    ...existing,
    valence: input.valence ?? existing.valence,
    strength: input.strength ?? existing.strength,
    updatedAt: now(),
  };

  const updatedLinks = [...network.links];
  updatedLinks[existingIndex] = updated;

  const updatedNetwork: Network = {
    ...network,
    links: updatedLinks,
  };

  return {
    success: true,
    data: { network: updatedNetwork, link: updated },
  };
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete a link by ID.
 */
export function deleteLink(
  network: Network,
  id: string
): CrudResult<{ network: Network }> {
  const existingIndex = network.links.findIndex((l) => l.id === id);
  if (existingIndex === -1) {
    return { success: false, error: `Link with id "${id}" not found` };
  }

  const updatedLinks = network.links.filter((l) => l.id !== id);

  const updatedNetwork: Network = {
    ...network,
    links: updatedLinks,
  };

  return {
    success: true,
    data: { network: updatedNetwork },
  };
}

/**
 * Delete all links between two nodes.
 */
export function deleteLinkBetween(
  network: Network,
  sourceId: string,
  targetId: string
): CrudResult<{ network: Network }> {
  const updatedLinks = network.links.filter(
    (l) => !(l.sourceId === sourceId && l.targetId === targetId)
  );

  const updatedNetwork: Network = {
    ...network,
    links: updatedLinks,
  };

  return {
    success: true,
    data: { network: updatedNetwork },
  };
}
