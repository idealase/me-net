/**
 * Forms Module - Public API
 *
 * Re-exports all form components and types.
 */

// Types
export type {
  AutocompleteItem,
  BehaviourFormCallbacks,
  BehaviourFormData,
  BehaviourOutcomeLinkFormData,
  ConnectedNode,
  FormError,
  FormMode,
  FormState,
  LinkFormCallbacks,
  LinkFormCallbacksWithCreate,
  LinkFormData,
  LinkFormDataWithPending,
  OutcomeFormCallbacks,
  OutcomeFormData,
  OutcomeValueLinkFormData,
  PendingNodeCreation,
  SelectOption,
  ValueFormCallbacks,
  ValueFormData,
} from './types';

// Utility exports
export {
  behaviourToFormData,
  costOptions,
  defaultBehaviourFormData,
  defaultBehaviourOutcomeLinkFormData,
  defaultOutcomeFormData,
  defaultOutcomeValueLinkFormData,
  defaultValueFormData,
  findNode,
  frequencyOptions,
  getAutocompleteSuggestions,
  getConnectedNodes,
  getLabelsForType,
  importanceOptions,
  linkExists,
  neglectOptions,
  outcomeToFormData,
  reliabilityOptions,
  strengthOptions,
  valenceOptions,
  validateLabel,
  valueToFormData,
} from './types';

// Components
export { BehaviourForm } from './BehaviourForm';
export type { BehaviourFormOptions } from './BehaviourForm';

export { OutcomeForm } from './OutcomeForm';
export type { OutcomeFormOptions } from './OutcomeForm';

export { ValueForm } from './ValueForm';
export type { ValueFormOptions } from './ValueForm';

export { LinkForm } from './LinkForm';
export type { LinkFormOptions, LinkType } from './LinkForm';

export { NodeDetailPanel } from './NodeDetailPanel';
export type { NodeDetailPanelCallbacks, NodeDetailPanelOptions } from './NodeDetailPanel';
