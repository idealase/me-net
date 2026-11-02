/**
 * Validation Types
 *
 * Types for the validation engine and warning management.
 */

import type { Network, WarningType, ValidationWarning } from '@/types';

// ============================================================================
// Warning Severity
// ============================================================================

export type WarningSeverity = 'error' | 'warning' | 'info';

/**
 * Extended warning with severity and related nodes.
 */
export interface Warning extends ValidationWarning {
  severity: WarningSeverity;
  relatedNodeIds: string[];
  suggestion?: string;
}

// ============================================================================
// Validation Result
// ============================================================================

export interface ValidationResult {
  /** All detected warnings */
  warnings: Warning[];
  /** Warnings by type */
  byType: Record<WarningType, Warning[]>;
  /** Warnings by node ID */
  byNodeId: Record<string, Warning[]>;
  /** Summary counts */
  counts: {
    total: number;
    byType: Record<WarningType, number>;
    bySeverity: Record<WarningSeverity, number>;
    active: number; // Not snoozed or dismissed
    snoozed: number;
    dismissed: number;
  };
}

// ============================================================================
// Snooze/Dismiss State
// ============================================================================

export interface WarningState {
  /** Warning ID -> snooze expiration (ISO 8601) */
  snoozed: Record<string, string>;
  /** Warning ID -> dismissed flag */
  dismissed: Record<string, boolean>;
}

export const DEFAULT_SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Validation Callbacks
// ============================================================================

export interface ValidationCallbacks {
  onSnooze: (warningId: string) => void;
  onDismiss: (warningId: string) => void;
  onUndismiss: (warningId: string) => void;
  onNavigateToNode: (nodeId: string) => void;
}

// ============================================================================
// Conflict Detection Types
// ============================================================================

export interface OutcomeConflict {
  behaviourId: string;
  behaviourLabel: string;
  outcomeId: string;
  outcomeLabel: string;
  valence: 'negative';
}

export interface ValueConflict {
  behaviourId: string;
  behaviourLabel: string;
  positiveValues: Array<{ id: string; label: string }>;
  negativeValues: Array<{ id: string; label: string }>;
}

// ============================================================================
// Path Analysis Types
// ============================================================================

export interface PathToValue {
  behaviourId: string;
  outcomeId: string;
  valueId: string;
  valence: 'positive' | 'negative';
  /** Combined weight from behaviour->outcome->value */
  weight: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique warning ID based on type and node.
 */
export function generateWarningId(type: WarningType, nodeId: string): string {
  return `w-${type}-${nodeId}`;
}

const ALL_WARNING_TYPES: WarningType[] = [
  'orphan-value',
  'unexplained-behaviour',
  'floating-outcome',
  'outcome-level-conflict',
  'value-level-conflict',
];

/**
 * Drop snoozed/dismissed entries for nodes that no longer exist in the network.
 * Returns a new WarningState; the input is not modified.
 */
export function pruneWarningState(state: WarningState, network: Network): WarningState {
  const validIds = new Set<string>();
  const nodes = [...network.behaviours, ...network.outcomes, ...network.values];
  for (const node of nodes) {
    for (const type of ALL_WARNING_TYPES) {
      validIds.add(generateWarningId(type, node.id));
    }
  }

  const snoozed: Record<string, string> = {};
  for (const [id, until] of Object.entries(state.snoozed)) {
    if (validIds.has(id)) snoozed[id] = until;
  }
  const dismissed: Record<string, boolean> = {};
  for (const [id, flag] of Object.entries(state.dismissed)) {
    if (validIds.has(id)) dismissed[id] = flag;
  }
  return { snoozed, dismissed };
}

/**
 * Get severity for a warning type.
 */
export function getSeverity(type: WarningType): WarningSeverity {
  switch (type) {
    case 'orphan-value':
      return 'warning';
    case 'unexplained-behaviour':
      return 'info';
    case 'floating-outcome':
      return 'info';
    case 'outcome-level-conflict':
      return 'warning';
    case 'value-level-conflict':
      return 'error';
    default:
      return 'info';
  }
}

/**
 * Get human-readable label for warning type.
 */
export function getWarningTypeLabel(type: WarningType): string {
  switch (type) {
    case 'orphan-value':
      return 'Orphan Value';
    case 'unexplained-behaviour':
      return 'Unexplained Behaviour';
    case 'floating-outcome':
      return 'Floating Outcome';
    case 'outcome-level-conflict':
      return 'Outcome Conflict';
    case 'value-level-conflict':
      return 'Value Conflict';
    default:
      return 'Unknown';
  }
}

/**
 * Check if a warning is currently active (not snoozed or dismissed).
 */
export function isWarningActive(warning: Warning, state: WarningState): boolean {
  if (state.dismissed[warning.id] === true) {
    return false;
  }
  const snoozedUntil = state.snoozed[warning.id];
  if (snoozedUntil !== undefined && snoozedUntil !== '') {
    return new Date(snoozedUntil) < new Date();
  }
  return true;
}

/**
 * Create an empty validation result.
 */
export function createEmptyValidationResult(): ValidationResult {
  return {
    warnings: [],
    byType: {
      'orphan-value': [],
      'unexplained-behaviour': [],
      'floating-outcome': [],
      'outcome-level-conflict': [],
      'value-level-conflict': [],
    },
    byNodeId: {},
    counts: {
      total: 0,
      byType: {
        'orphan-value': 0,
        'unexplained-behaviour': 0,
        'floating-outcome': 0,
        'outcome-level-conflict': 0,
        'value-level-conflict': 0,
      },
      bySeverity: {
        error: 0,
        warning: 0,
        info: 0,
      },
      active: 0,
      snoozed: 0,
      dismissed: 0,
    },
  };
}

/**
 * Create empty warning state.
 */
export function createEmptyWarningState(): WarningState {
  return {
    snoozed: {},
    dismissed: {},
  };
}
