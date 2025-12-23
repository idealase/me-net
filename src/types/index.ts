/**
 * M-E Net Data Model Types
 *
 * Core type definitions for the Means-Ends Network application.
 * See docs/data-model.md for full specification.
 */

// ============================================================================
// Enums
// ============================================================================

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'occasionally' | 'rarely';

export type Cost = 'trivial' | 'low' | 'medium' | 'high' | 'very-high';

export type Importance = 'critical' | 'high' | 'medium' | 'low';

export type Neglect = 'severely-neglected' | 'somewhat-neglected' | 'adequately-met' | 'well-satisfied';

export type Reliability = 'always' | 'usually' | 'sometimes' | 'rarely';

export type Strength = 'strong' | 'moderate' | 'weak';

export type Valence = 'positive' | 'negative';

// ============================================================================
// Node Types
// ============================================================================

export interface BaseNode {
  id: string;
  label: string;
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface Behaviour extends BaseNode {
  type: 'behaviour';
  frequency: Frequency;
  cost: Cost;
  contextTags: string[];
}

export interface Outcome extends BaseNode {
  type: 'outcome';
}

export interface Value extends BaseNode {
  type: 'value';
  importance: Importance;
  neglect: Neglect;
}

export type Node = Behaviour | Outcome | Value;
export type NodeType = 'behaviour' | 'outcome' | 'value';

// ============================================================================
// Link Types
// ============================================================================

export interface BaseLink {
  id: string;
  sourceId: string;
  targetId: string;
  valence: Valence;
  createdAt: string;
  updatedAt: string;
}

export interface BehaviourOutcomeLink extends BaseLink {
  type: 'behaviour-outcome';
  reliability: Reliability;
}

export interface OutcomeValueLink extends BaseLink {
  type: 'outcome-value';
  strength: Strength;
}

export type Link = BehaviourOutcomeLink | OutcomeValueLink;
export type LinkType = 'behaviour-outcome' | 'outcome-value';

// ============================================================================
// Network
// ============================================================================

export interface Network {
  version: string;
  exportedAt?: string;
  behaviours: Behaviour[];
  outcomes: Outcome[];
  values: Value[];
  links: Link[];
}

// ============================================================================
// Validation
// ============================================================================

export type WarningType =
  | 'orphan-value'
  | 'unexplained-behaviour'
  | 'floating-outcome'
  | 'outcome-level-conflict'
  | 'value-level-conflict';

export interface ValidationWarning {
  id: string;
  type: WarningType;
  nodeId: string;
  message: string;
  snoozedUntil?: string; // ISO 8601
  dismissed?: boolean;
}

// ============================================================================
// Metrics
// ============================================================================

export interface BehaviourMetrics {
  behaviourId: string;
  leverageScore: number;
  coverage: number;
  conflictIndex: number;
  positiveInfluence: number;
  negativeInfluence: number;
}

export interface ValueMetrics {
  valueId: string;
  fragilityScore: number;
  supportStrength: number;
  supportingBehaviours: string[];
}
