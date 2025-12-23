/**
 * Metrics Module - Public API
 *
 * Exports all metrics computation functions and types.
 */

// Mappings
export {
  reliabilityToNumber,
  strengthToNumber,
  valenceToMultiplier,
  costToNumber,
  importanceToNumber,
  neglectToNumber,
  MAPPINGS,
} from './mappings';

// Path computation
export type { PathToValue, BehaviourPaths, ValueSupport } from './paths';

export {
  computeAllPaths,
  groupPathsByBehaviour,
  groupPathsByValue,
  getValuesReachedByBehaviour,
  getBehavioursSupportingValue,
  getOutcomesForBehaviour,
} from './paths';

// Metrics computation
export type { LeverageInsight, FragilityInsight, ConflictInsight, NetworkAnalysis } from './metrics';

export {
  INFINITE_FRAGILITY,
  FRAGILITY_THRESHOLD,
  CONFLICT_THRESHOLD,
  TOP_LEVERAGE_COUNT,
  computeLeverageScore,
  computeCoverage,
  computeConflictIndex,
  computeFragilityScore,
  computeAllBehaviourMetrics,
  computeAllValueMetrics,
  getTopLeverageBehaviours,
  getFragileValues,
  getConflictBehaviours,
  analyzeNetwork,
} from './metrics';
