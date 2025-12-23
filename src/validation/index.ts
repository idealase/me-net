/**
 * Validation Module
 *
 * Public exports for the validation engine.
 */

// Types
export type {
  Warning,
  WarningState,
  ValidationResult,
  WarningSeverity,
  ValidationCallbacks,
  OutcomeConflict,
  ValueConflict,
  PathToValue,
} from './types';

export {
  generateWarningId,
  getSeverity,
  getWarningTypeLabel,
  isWarningActive,
  createEmptyValidationResult,
  createEmptyWarningState,
  DEFAULT_SNOOZE_DURATION_MS,
} from './types';

// Validation functions
export {
  validateNetwork,
  getActiveWarnings,
  getWarningsForNode,
  getConflictDetails,
  detectOrphanValues,
  detectUnexplainedBehaviours,
  detectFloatingOutcomes,
  detectOutcomeLevelConflicts,
  detectValueLevelConflicts,
  computePathsToValues,
} from './validate';
