/**
 * Form Types and Shared Utilities
 *
 * Common types used across all form components.
 */

import type {
  Behaviour,
  Cost,
  Frequency,
  Importance,
  Neglect,
  Network,
  Node,
  Outcome,
  Reliability,
  Strength,
  Valence,
  Value,
} from '@/types';

// ============================================================================
// Form Mode
// ============================================================================

export type FormMode = 'create' | 'edit';

// ============================================================================
// Form State
// ============================================================================

export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  errors: FormError[];
}

// ============================================================================
// Behaviour Form
// ============================================================================

export interface BehaviourFormData {
  label: string;
  frequency: Frequency;
  cost: Cost;
  contextTags: string[];
  notes: string;
}

export const defaultBehaviourFormData: BehaviourFormData = {
  label: '',
  frequency: 'weekly',
  cost: 'low',
  contextTags: [],
  notes: '',
};

export function behaviourToFormData(behaviour: Behaviour): BehaviourFormData {
  return {
    label: behaviour.label,
    frequency: behaviour.frequency,
    cost: behaviour.cost,
    contextTags: [...behaviour.contextTags],
    notes: behaviour.notes ?? '',
  };
}

// ============================================================================
// Outcome Form
// ============================================================================

export interface OutcomeFormData {
  label: string;
  notes: string;
}

export const defaultOutcomeFormData: OutcomeFormData = {
  label: '',
  notes: '',
};

export function outcomeToFormData(outcome: Outcome): OutcomeFormData {
  return {
    label: outcome.label,
    notes: outcome.notes ?? '',
  };
}

// ============================================================================
// Value Form
// ============================================================================

export interface ValueFormData {
  label: string;
  importance: Importance;
  neglect: Neglect;
  notes: string;
}

export const defaultValueFormData: ValueFormData = {
  label: '',
  importance: 'medium',
  neglect: 'adequately-met',
  notes: '',
};

export function valueToFormData(value: Value): ValueFormData {
  return {
    label: value.label,
    importance: value.importance,
    neglect: value.neglect,
    notes: value.notes ?? '',
  };
}

// ============================================================================
// Link Form
// ============================================================================

export interface BehaviourOutcomeLinkFormData {
  type: 'behaviour-outcome';
  sourceId: string;
  targetId: string;
  valence: Valence;
  reliability: Reliability;
}

export interface OutcomeValueLinkFormData {
  type: 'outcome-value';
  sourceId: string;
  targetId: string;
  valence: Valence;
  strength: Strength;
}

export type LinkFormData = BehaviourOutcomeLinkFormData | OutcomeValueLinkFormData;

export const defaultBehaviourOutcomeLinkFormData: BehaviourOutcomeLinkFormData = {
  type: 'behaviour-outcome',
  sourceId: '',
  targetId: '',
  valence: 'positive',
  reliability: 'usually',
};

export const defaultOutcomeValueLinkFormData: OutcomeValueLinkFormData = {
  type: 'outcome-value',
  sourceId: '',
  targetId: '',
  valence: 'positive',
  strength: 'moderate',
};

// ============================================================================
// Form Callbacks
// ============================================================================

export interface BehaviourFormCallbacks {
  onSave: (data: BehaviourFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export interface OutcomeFormCallbacks {
  onSave: (data: OutcomeFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export interface ValueFormCallbacks {
  onSave: (data: ValueFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export interface LinkFormCallbacks {
  onSave: (data: LinkFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

// ============================================================================
// Select Options
// ============================================================================

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export const frequencyOptions: SelectOption<Frequency>[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'rarely', label: 'Rarely' },
];

export const costOptions: SelectOption<Cost>[] = [
  { value: 'trivial', label: 'Trivial' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'very-high', label: 'Very High' },
];

export const importanceOptions: SelectOption<Importance>[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const neglectOptions: SelectOption<Neglect>[] = [
  { value: 'severely-neglected', label: 'Severely Neglected' },
  { value: 'somewhat-neglected', label: 'Somewhat Neglected' },
  { value: 'adequately-met', label: 'Adequately Met' },
  { value: 'well-satisfied', label: 'Well Satisfied' },
];

export const valenceOptions: SelectOption<Valence>[] = [
  { value: 'positive', label: 'Positive (+)' },
  { value: 'negative', label: 'Negative (−)' },
];

export const reliabilityOptions: SelectOption<Reliability>[] = [
  { value: 'always', label: 'Always' },
  { value: 'usually', label: 'Usually' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'rarely', label: 'Rarely' },
];

export const strengthOptions: SelectOption<Strength>[] = [
  { value: 'strong', label: 'Strong' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'weak', label: 'Weak' },
];

// ============================================================================
// Autocomplete
// ============================================================================

export interface AutocompleteItem {
  id: string;
  label: string;
  type: 'behaviour' | 'outcome' | 'value';
}

/**
 * Get autocomplete suggestions from network nodes.
 */
export function getAutocompleteSuggestions(
  network: Network,
  nodeType: 'behaviour' | 'outcome' | 'value',
  query: string,
  excludeIds: string[] = []
): AutocompleteItem[] {
  const normalizedQuery = query.toLowerCase().trim();

  let nodes: Node[];
  switch (nodeType) {
    case 'behaviour':
      nodes = network.behaviours;
      break;
    case 'outcome':
      nodes = network.outcomes;
      break;
    case 'value':
      nodes = network.values;
      break;
  }

  return nodes
    .filter((node) => !excludeIds.includes(node.id))
    .filter((node) => normalizedQuery === '' || node.label.toLowerCase().includes(normalizedQuery))
    .map((node) => ({
      id: node.id,
      label: node.label,
      type: nodeType,
    }))
    .slice(0, 10); // Limit to 10 suggestions
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate a label field.
 */
export function validateLabel(label: string, existingLabels: string[], currentLabel?: string): FormError | null {
  const trimmed = label.trim();

  if (!trimmed) {
    return { field: 'label', message: 'Label is required' };
  }

  if (trimmed.length > 100) {
    return { field: 'label', message: 'Label must be 100 characters or less' };
  }

  // Check for duplicates (case-insensitive), excluding current label during edit
  const normalized = trimmed.toLowerCase();
  const isDuplicate = existingLabels.some(
    (existing) => existing.toLowerCase() === normalized && existing.toLowerCase() !== currentLabel?.toLowerCase()
  );

  if (isDuplicate) {
    return { field: 'label', message: 'A node with this label already exists' };
  }

  return null;
}

/**
 * Check if a link already exists between two nodes.
 */
export function linkExists(network: Network, sourceId: string, targetId: string): boolean {
  return network.links.some((link) => link.sourceId === sourceId && link.targetId === targetId);
}

/**
 * Get labels for a specific node type from the network.
 */
export function getLabelsForType(network: Network, nodeType: 'behaviour' | 'outcome' | 'value'): string[] {
  switch (nodeType) {
    case 'behaviour':
      return network.behaviours.map((b) => b.label);
    case 'outcome':
      return network.outcomes.map((o) => o.label);
    case 'value':
      return network.values.map((v) => v.label);
  }
}

// ============================================================================
// Node Detail Helpers
// ============================================================================

export interface ConnectedNode {
  id: string;
  label: string;
  type: 'behaviour' | 'outcome' | 'value';
  linkId: string;
  valence: Valence;
  reliability?: Reliability;
  strength?: Strength;
  direction: 'incoming' | 'outgoing';
}

/**
 * Get all nodes connected to a given node.
 */
export function getConnectedNodes(network: Network, nodeId: string): ConnectedNode[] {
  const connected: ConnectedNode[] = [];

  for (const link of network.links) {
    if (link.sourceId === nodeId) {
      // Outgoing link
      const target = findNode(network, link.targetId);
      if (target) {
        connected.push({
          id: target.id,
          label: target.label,
          type: target.type,
          linkId: link.id,
          valence: link.valence,
          reliability: link.type === 'behaviour-outcome' ? link.reliability : undefined,
          strength: link.type === 'outcome-value' ? link.strength : undefined,
          direction: 'outgoing',
        });
      }
    } else if (link.targetId === nodeId) {
      // Incoming link
      const source = findNode(network, link.sourceId);
      if (source) {
        connected.push({
          id: source.id,
          label: source.label,
          type: source.type,
          linkId: link.id,
          valence: link.valence,
          reliability: link.type === 'behaviour-outcome' ? link.reliability : undefined,
          strength: link.type === 'outcome-value' ? link.strength : undefined,
          direction: 'incoming',
        });
      }
    }
  }

  return connected;
}

/**
 * Find a node by ID across all node types.
 */
export function findNode(network: Network, nodeId: string): Node | undefined {
  return (
    network.behaviours.find((b) => b.id === nodeId) ??
    network.outcomes.find((o) => o.id === nodeId) ??
    network.values.find((v) => v.id === nodeId)
  );
}
