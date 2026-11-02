/**
 * M-E Net Application Entry Point
 */

import './styles/main.css';

import { EmptyState } from './components/empty';
import { FilterPanel, type FilterState } from './components/filters';
import {
  BehaviourForm,
  BehaviourFormData,
  LinkForm,
  LinkFormData,
  LinkFormDataWithPending,
  LinkType,
  NodeDetailPanel,
  OutcomeForm,
  OutcomeFormData,
  ValueForm,
  ValueFormData,
  behaviourToFormData,
  outcomeToFormData,
  valueToFormData,
} from './components/forms';
import { NetworkGraph } from './components/graph';
import { getThemeForMode } from './components/graph/theme';
import { InsightsPanel } from './components/insights';
import { LadderSession, WhyLadder } from './components/ladder';
import { ValidationPanel } from './components/validation';
import { WelcomeScreen } from './components/welcome';
import { addBehaviour, deleteBehaviour, updateBehaviour } from './data/behaviours';
import { addLinkToNewTarget } from './data/compound';
import { createExampleNetwork } from './data/example-network';
import { downloadNetworkAsJson, downloadSummaryReport, importNetworkFromFile } from './data/export';
import {
  addBehaviourOutcomeLink,
  addOutcomeValueLink,
  deleteLink,
  updateBehaviourOutcomeLink,
  updateOutcomeValueLink,
} from './data/links';
import { createEmptyNetwork, isNetworkEmpty } from './data/network';
import { addOutcome, deleteOutcome, updateOutcome } from './data/outcomes';
import { loadNetwork, saveNetwork } from './data/storage';
import { addValue, deleteValue, updateValue } from './data/values';
import { getConflictBehaviours, getFragileValues, getTopLeverageBehaviours } from './metrics';
import type { Behaviour, Link, Network, Node, Outcome, Value } from './types';
import { getCurrentTheme, initializeTheme, toggleTheme } from './utils/theme';
import { WarningState, createEmptyWarningState, pruneWarningState } from './validation';

// ============================================================================
// Application State
// ============================================================================

interface AppState {
  network: Network;
  selectedNodeId: string | null;
  formMode:
    | 'none'
    | 'create-behaviour'
    | 'create-outcome'
    | 'create-value'
    | 'create-link'
    | 'edit-node'
    | 'edit-link'
    | 'why-ladder';
  editingNode: Node | null;
  editingLink: Link | null;
  linkType: LinkType | null;
  preselectedSourceId: string | null;
  preselectedTargetId: string | null;
  ladderBehaviourId: string | null;
}

const state: AppState = {
  network: createEmptyNetwork(),
  selectedNodeId: null,
  formMode: 'none',
  editingNode: null,
  editingLink: null,
  linkType: null,
  preselectedSourceId: null,
  preselectedTargetId: null,
  ladderBehaviourId: null,
};

let graph: NetworkGraph | null = null;
let detailPanel: NodeDetailPanel | null = null;
let whyLadderInstance: WhyLadder | null = null;
let validationPanel: ValidationPanel | null = null;
let insightsPanel: InsightsPanel | null = null;
let filterPanel: FilterPanel | null = null;
let warningState: WarningState = createEmptyWarningState();
let welcomeScreen: WelcomeScreen | null = null;
let emptyState: EmptyState | null = null;
let messagesContainer: HTMLElement | null = null;
let hasDismissedWelcome = false;

const WARNING_STATE_KEY = 'me-net-warnings';
const WELCOME_DISMISSED_KEY = 'me-net-welcome-dismissed';
const MESSAGE_TIMEOUT_MS = 8000;

type MessageType = 'info' | 'success' | 'error';

// ============================================================================
// Warning State Persistence
// ============================================================================

function loadWarningState(): WarningState {
  try {
    const data = localStorage.getItem(WARNING_STATE_KEY);
    if (data !== null && data !== '') {
      return JSON.parse(data) as WarningState;
    }
  } catch {
    // Ignore parse errors
  }
  return createEmptyWarningState();
}

function saveWarningState(): void {
  try {
    localStorage.setItem(WARNING_STATE_KEY, JSON.stringify(warningState));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Messaging & Onboarding Helpers
// ============================================================================

function showAppMessage(type: MessageType, message: string): void {
  if (!messagesContainer) return;

  const messageEl = document.createElement('div');
  messageEl.className = `app-message app-message-${type}`;
  messageEl.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  messageEl.appendChild(textSpan);

  const dismissButton = document.createElement('button');
  dismissButton.type = 'button';
  dismissButton.className = 'app-message-close';
  dismissButton.setAttribute('aria-label', 'Dismiss message');
  dismissButton.textContent = '×';
  dismissButton.addEventListener('click', () => {
    messageEl.remove();
  });

  messageEl.appendChild(dismissButton);
  messagesContainer.appendChild(messageEl);

  window.setTimeout(() => {
    if (messageEl.parentElement === messagesContainer) {
      messageEl.remove();
    }
  }, MESSAGE_TIMEOUT_MS);
}

/**
 * Report a failed data-layer operation to the user.
 */
function showOperationError(error: string | undefined, fallback: string): void {
  showAppMessage('error', error !== undefined && error !== '' ? error : fallback);
}

function loadWelcomeState(): void {
  try {
    hasDismissedWelcome = localStorage.getItem(WELCOME_DISMISSED_KEY) === 'true';
  } catch {
    hasDismissedWelcome = false;
  }
}

function setWelcomeDismissed(): void {
  if (hasDismissedWelcome) return;
  hasDismissedWelcome = true;
  try {
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
  welcomeScreen?.hide();
}

function updateWelcomeVisibility(): void {
  if (!welcomeScreen) return;
  if (!hasDismissedWelcome && isNetworkEmpty(state.network)) {
    welcomeScreen.show();
  } else {
    welcomeScreen.hide();
  }
}

function updateEmptyStateVisibility(): void {
  if (!emptyState) return;
  if (!hasDismissedWelcome && isNetworkEmpty(state.network)) {
    emptyState.hide();
    return;
  }
  if (isNetworkEmpty(state.network)) {
    emptyState.show();
  } else {
    emptyState.hide();
  }
}

function triggerImportDialog(): void {
  document.getElementById('import-file-input')?.click();
}

function handleWelcomeStart(): void {
  setWelcomeDismissed();
  emptyState?.hide();
  showCreateBehaviourForm();
}

function handleWelcomeImport(): void {
  setWelcomeDismissed();
  emptyState?.hide();
  triggerImportDialog();
}

function handleLoadExample(): void {
  if (
    !isNetworkEmpty(state.network) &&
    !confirm(
      'Load the example network?\n\nThis will replace your current network. Export it first if you want to keep it.'
    )
  ) {
    return;
  }
  setWelcomeDismissed();
  emptyState?.hide();
  updateNetwork(createExampleNetwork());
  hideForm();
  selectNode(null);
  showAppMessage(
    'info',
    'Loaded the "Healthy Living" example. Explore it, then use New or Import to start your own network.'
  );
}

function handleNewNetwork(): void {
  if (isNetworkEmpty(state.network)) return;
  if (
    !confirm(
      'Start a new, empty network?\n\nThis will remove your current network. Export it first if you want to keep it.'
    )
  ) {
    return;
  }
  updateNetwork(createEmptyNetwork());
  hideForm();
  selectNode(null);
}

function handleEmptyStateAddBehaviour(): void {
  setWelcomeDismissed();
  emptyState?.hide();
  showCreateBehaviourForm();
}

function handleEmptyStateWhyLadder(): void {
  setWelcomeDismissed();
  emptyState?.hide();
  showWhyLadder();
}

function handleEmptyStateImport(): void {
  setWelcomeDismissed();
  emptyState?.hide();
  triggerImportDialog();
}

// ============================================================================
// State Management
// ============================================================================

function updateNetwork(newNetwork: Network): void {
  state.network = newNetwork;
  pruneStaleWarnings(newNetwork);
  const saveResult = saveNetwork(newNetwork);
  if (
    !saveResult.success &&
    saveResult.error !== undefined &&
    saveResult.error !== null &&
    saveResult.error !== ''
  ) {
    showAppMessage('error', saveResult.error);
  }
  graph?.setNetwork(newNetwork);
  detailPanel?.setNetwork(newNetwork);
  validationPanel?.setNetwork(newNetwork);
  insightsPanel?.setNetwork(newNetwork);
  filterPanel?.setNetwork(newNetwork);
  if (!hasDismissedWelcome && !isNetworkEmpty(newNetwork)) {
    setWelcomeDismissed();
  }
  // Keep an open Why Ladder in sync so nodes created this session are offered
  whyLadderInstance?.setNetwork(newNetwork);
  updateEmptyStateVisibility();
  updateWelcomeVisibility();
}

/**
 * Forget snoozed/dismissed warnings for nodes that no longer exist.
 * Mutates the shared warningState object so the Validation panel keeps its reference.
 */
function pruneStaleWarnings(network: Network): void {
  const pruned = pruneWarningState(warningState, network);
  const before =
    Object.keys(warningState.snoozed).length + Object.keys(warningState.dismissed).length;
  const after = Object.keys(pruned.snoozed).length + Object.keys(pruned.dismissed).length;
  if (before === after) return;
  warningState.snoozed = pruned.snoozed;
  warningState.dismissed = pruned.dismissed;
  saveWarningState();
}

function selectNode(nodeId: string | null): void {
  state.selectedNodeId = nodeId;
  if (nodeId !== null && nodeId !== '') {
    graph?.selectNode(nodeId);
    const node = findNode(nodeId);
    if (node) {
      detailPanel?.show(node);
    }
  } else {
    graph?.clearSelection();
    detailPanel?.hide();
  }
}

function findNode(id: string): Node | undefined {
  return (
    state.network.behaviours.find((b) => b.id === id) ??
    state.network.outcomes.find((o) => o.id === id) ??
    state.network.values.find((v) => v.id === id)
  );
}

function findLink(id: string): Link | undefined {
  return state.network.links.find((l) => l.id === id);
}

// ============================================================================
// Form Handlers
// ============================================================================

function showCreateBehaviourForm(): void {
  state.formMode = 'create-behaviour';
  renderSidebar();
}

function showCreateOutcomeForm(): void {
  state.formMode = 'create-outcome';
  renderSidebar();
}

function showCreateValueForm(): void {
  state.formMode = 'create-value';
  renderSidebar();
}

function showCreateLinkForm(
  linkType: LinkType,
  preselectedSourceId?: string,
  preselectedTargetId?: string
): void {
  state.formMode = 'create-link';
  state.linkType = linkType;
  state.preselectedSourceId = preselectedSourceId ?? null;
  state.preselectedTargetId = preselectedTargetId ?? null;
  renderSidebar();
}

function showEditNodeForm(node: Node): void {
  state.formMode = 'edit-node';
  state.editingNode = node;
  renderSidebar();
}

function showEditLinkForm(link: Link): void {
  state.formMode = 'edit-link';
  state.editingLink = link;
  state.linkType = link.type;
  renderSidebar();
}

function showWhyLadder(behaviourId?: string): void {
  state.formMode = 'why-ladder';
  state.ladderBehaviourId = behaviourId ?? null;
  renderSidebar();
}

function hideForm(): void {
  state.formMode = 'none';
  state.editingNode = null;
  state.editingLink = null;
  state.linkType = null;
  state.preselectedSourceId = null;
  state.preselectedTargetId = null;
  state.ladderBehaviourId = null;
  whyLadderInstance = null;
  renderSidebar();
  updateEmptyStateVisibility();
}

// ============================================================================
// Why Ladder Handlers
// ============================================================================

function handleLadderCreateBehaviour(label: string): Behaviour {
  const result = addBehaviour(state.network, {
    label,
    frequency: 'occasionally',
    cost: 'low',
    contextTags: [],
  });
  if (result.success && result.data) {
    updateNetwork(result.data.network);
    return result.data.behaviour;
  }
  showOperationError(result.error, 'Failed to create behaviour.');
  throw new Error(result.error ?? 'Failed to create behaviour');
}

function handleLadderCreateOutcome(label: string, behaviourId: string): Outcome {
  // Create the outcome and link it to the behaviour in one update
  const result = addLinkToNewTarget(state.network, {
    type: 'behaviour-outcome',
    sourceId: behaviourId,
    targetLabel: label,
    valence: 'positive',
    reliability: 'usually',
  });
  if (!result.success || !result.data) {
    showOperationError(result.error, 'Failed to create outcome.');
    throw new Error(result.error ?? 'Failed to create outcome');
  }
  updateNetwork(result.data.network);
  return result.data.target as Outcome;
}

function handleLadderLinkOutcome(outcomeId: string, behaviourId: string): void {
  const result = addBehaviourOutcomeLink(state.network, {
    sourceId: behaviourId,
    targetId: outcomeId,
    valence: 'positive',
    reliability: 'usually',
  });
  if (result.success && result.data) {
    updateNetwork(result.data.network);
  } else {
    showOperationError(result.error, 'Failed to link outcome.');
  }
}

function handleLadderCreateValue(label: string, outcomeId: string): Value {
  // Create the value and link the outcome to it in one update
  const result = addLinkToNewTarget(state.network, {
    type: 'outcome-value',
    sourceId: outcomeId,
    targetLabel: label,
    valence: 'positive',
    strength: 'moderate',
  });
  if (!result.success || !result.data) {
    showOperationError(result.error, 'Failed to create value.');
    throw new Error(result.error ?? 'Failed to create value');
  }
  updateNetwork(result.data.network);
  return result.data.target as Value;
}

function handleLadderLinkValue(valueId: string, outcomeId: string): void {
  const result = addOutcomeValueLink(state.network, {
    sourceId: outcomeId,
    targetId: valueId,
    valence: 'positive',
    strength: 'moderate',
  });
  if (result.success && result.data) {
    updateNetwork(result.data.network);
  } else {
    showOperationError(result.error, 'Failed to link value.');
  }
}

function handleLadderChainOutcome(label: string, _parentOutcomeId: string): Outcome {
  // For MVP, we create a new outcome that will need to be explained
  // The parent outcome is marked as explained when chaining
  // In a full implementation, we might create outcome-to-outcome links
  const outcomeResult = addOutcome(state.network, { label });
  if (!outcomeResult.success || !outcomeResult.data) {
    showOperationError(outcomeResult.error, 'Failed to create outcome.');
    throw new Error(outcomeResult.error ?? 'Failed to create chained outcome');
  }
  updateNetwork(outcomeResult.data.network);
  return outcomeResult.data.outcome;
}

function handleLadderComplete(_session: LadderSession): void {
  hideForm();
}

function handleLadderExit(_session: LadderSession): void {
  hideForm();
}

// ============================================================================
// CRUD Operations
// ============================================================================

function handleSaveBehaviour(data: BehaviourFormData): void {
  const input = {
    label: data.label,
    frequency: data.frequency,
    cost: data.cost,
    contextTags: data.contextTags,
    notes: data.notes || undefined,
  };
  if (state.formMode === 'edit-node' && state.editingNode?.type === 'behaviour') {
    const nodeId = state.editingNode.id;
    const result = updateBehaviour(state.network, nodeId, input);
    if (!result.success || !result.data) {
      showOperationError(result.error, 'Failed to update behaviour.');
      return;
    }
    updateNetwork(result.data.network);
    hideForm();
    selectNode(nodeId);
  } else {
    const result = addBehaviour(state.network, input);
    if (!result.success || !result.data) {
      showOperationError(result.error, 'Failed to create behaviour.');
      return;
    }
    updateNetwork(result.data.network);
    hideForm();
    selectNode(result.data.behaviour.id);
  }
}

function handleSaveOutcome(data: OutcomeFormData): void {
  const input = {
    label: data.label,
    notes: data.notes || undefined,
  };
  if (state.formMode === 'edit-node' && state.editingNode?.type === 'outcome') {
    const nodeId = state.editingNode.id;
    const result = updateOutcome(state.network, nodeId, input);
    if (!result.success || !result.data) {
      showOperationError(result.error, 'Failed to update outcome.');
      return;
    }
    updateNetwork(result.data.network);
    hideForm();
    selectNode(nodeId);
  } else {
    const result = addOutcome(state.network, input);
    if (!result.success || !result.data) {
      showOperationError(result.error, 'Failed to create outcome.');
      return;
    }
    updateNetwork(result.data.network);
    hideForm();
    selectNode(result.data.outcome.id);
  }
}

function handleSaveValue(data: ValueFormData): void {
  const input = {
    label: data.label,
    importance: data.importance,
    neglect: data.neglect,
    notes: data.notes || undefined,
  };
  if (state.formMode === 'edit-node' && state.editingNode?.type === 'value') {
    const nodeId = state.editingNode.id;
    const result = updateValue(state.network, nodeId, input);
    if (!result.success || !result.data) {
      showOperationError(result.error, 'Failed to update value.');
      return;
    }
    updateNetwork(result.data.network);
    hideForm();
    selectNode(nodeId);
  } else {
    const result = addValue(state.network, input);
    if (!result.success || !result.data) {
      showOperationError(result.error, 'Failed to create value.');
      return;
    }
    updateNetwork(result.data.network);
    hideForm();
    selectNode(result.data.value.id);
  }
}

function handleSaveLink(data: LinkFormData): void {
  let result: { success: boolean; data?: { network: Network }; error?: string };
  if (state.formMode === 'edit-link' && state.editingLink) {
    result =
      data.type === 'behaviour-outcome'
        ? updateBehaviourOutcomeLink(state.network, state.editingLink.id, {
            valence: data.valence,
            reliability: data.reliability,
          })
        : updateOutcomeValueLink(state.network, state.editingLink.id, {
            valence: data.valence,
            strength: data.strength,
          });
  } else {
    result =
      data.type === 'behaviour-outcome'
        ? addBehaviourOutcomeLink(state.network, {
            sourceId: data.sourceId,
            targetId: data.targetId,
            valence: data.valence,
            reliability: data.reliability,
          })
        : addOutcomeValueLink(state.network, {
            sourceId: data.sourceId,
            targetId: data.targetId,
            valence: data.valence,
            strength: data.strength,
          });
  }
  if (!result.success || !result.data) {
    showOperationError(result.error, 'Failed to save link.');
    return;
  }
  updateNetwork(result.data.network);
  hideForm();
}

/**
 * Create-on-link: create the new target node and the link in a single update.
 */
function handleSaveLinkWithNewNode({ linkData, pendingTarget }: LinkFormDataWithPending): void {
  if (pendingTarget === undefined) {
    handleSaveLink(linkData);
    return;
  }
  const result = addLinkToNewTarget(
    state.network,
    linkData.type === 'behaviour-outcome'
      ? {
          type: 'behaviour-outcome',
          sourceId: linkData.sourceId,
          targetLabel: pendingTarget.label,
          valence: linkData.valence,
          reliability: linkData.reliability,
        }
      : {
          type: 'outcome-value',
          sourceId: linkData.sourceId,
          targetLabel: pendingTarget.label,
          valence: linkData.valence,
          strength: linkData.strength,
        }
  );
  if (!result.success || !result.data) {
    showOperationError(result.error, `Failed to create ${pendingTarget.type} and link.`);
    return;
  }
  updateNetwork(result.data.network);
  hideForm();
  selectNode(result.data.target.id);
  showAppMessage(
    'success',
    `Created ${pendingTarget.type} "${result.data.target.label}" and linked it.`
  );
}

function handleDeleteNode(node: Node): void {
  let result;
  switch (node.type) {
    case 'behaviour':
      result = deleteBehaviour(state.network, node.id);
      break;
    case 'outcome':
      result = deleteOutcome(state.network, node.id);
      break;
    case 'value':
      result = deleteValue(state.network, node.id);
      break;
  }
  if (!result.success || !result.data) {
    showOperationError(result.error, `Failed to delete ${node.type}.`);
    return;
  }
  updateNetwork(result.data.network);
  selectNode(null);
  hideForm();
}

function handleDeleteLink(linkId: string): void {
  const result = deleteLink(state.network, linkId);
  if (!result.success || !result.data) {
    showOperationError(result.error, 'Failed to delete link.');
    return;
  }
  updateNetwork(result.data.network);
}

/**
 * Handle filter state changes from FilterPanel.
 */
function handleFilterChange(filter: FilterState): void {
  if (!graph) return;

  // Apply node type visibility
  graph.setNodeTypeVisibility('behaviour', filter.nodeTypes.behaviour);
  graph.setNodeTypeVisibility('outcome', filter.nodeTypes.outcome);
  graph.setNodeTypeVisibility('value', filter.nodeTypes.value);

  // Apply valence visibility
  graph.setValenceVisibility('positive', filter.valence.positive);
  graph.setValenceVisibility('negative', filter.valence.negative);

  // Apply search query
  graph.setSearchQuery(filter.searchQuery);

  // Apply highlight mode
  applyHighlightMode(filter.highlightMode);
}

/**
 * Apply highlight mode to the graph.
 */
function applyHighlightMode(mode: FilterState['highlightMode']): void {
  if (!graph) return;

  if (mode === 'none') {
    graph.clearHighlights();
    return;
  }

  let nodeIds: Set<string>;

  const collectDownstreamFromBehaviour = (behaviourId: string): Set<string> => {
    const ids = new Set<string>();
    ids.add(behaviourId);

    // Behaviour -> Outcome
    const outcomeIds = state.network.links
      .filter((l) => l.type === 'behaviour-outcome' && l.sourceId === behaviourId)
      .map((l) => l.targetId);
    for (const outcomeId of outcomeIds) {
      ids.add(outcomeId);
    }

    // Outcome -> Value
    for (const outcomeId of outcomeIds) {
      const valueIds = state.network.links
        .filter((l) => l.type === 'outcome-value' && l.sourceId === outcomeId)
        .map((l) => l.targetId);
      for (const valueId of valueIds) {
        ids.add(valueId);
      }
    }

    return ids;
  };

  const collectUpstreamToValue = (valueId: string): Set<string> => {
    const ids = new Set<string>();
    ids.add(valueId);

    // Outcome -> Value (incoming)
    const outcomeIds = state.network.links
      .filter((l) => l.type === 'outcome-value' && l.targetId === valueId)
      .map((l) => l.sourceId);
    for (const outcomeId of outcomeIds) {
      ids.add(outcomeId);
    }

    // Behaviour -> Outcome (incoming)
    for (const outcomeId of outcomeIds) {
      const behaviourIds = state.network.links
        .filter((l) => l.type === 'behaviour-outcome' && l.targetId === outcomeId)
        .map((l) => l.sourceId);
      for (const behaviourId of behaviourIds) {
        ids.add(behaviourId);
      }
    }

    return ids;
  };

  switch (mode) {
    case 'leverage': {
      const topBehaviours = getTopLeverageBehaviours(state.network, 5);
      nodeIds = new Set();
      for (const item of topBehaviours) {
        for (const id of collectDownstreamFromBehaviour(item.behaviour.id)) {
          nodeIds.add(id);
        }
      }
      break;
    }
    case 'fragile': {
      const fragileValues = getFragileValues(state.network);
      nodeIds = new Set();
      for (const item of fragileValues) {
        for (const id of collectUpstreamToValue(item.value.id)) {
          nodeIds.add(id);
        }
      }
      break;
    }
    case 'conflicts': {
      const conflicts = getConflictBehaviours(state.network);
      nodeIds = new Set();
      for (const item of conflicts) {
        for (const id of collectDownstreamFromBehaviour(item.behaviour.id)) {
          nodeIds.add(id);
        }
      }
      break;
    }
    default:
      nodeIds = new Set();
  }

  graph.setHighlightedNodes(nodeIds);
}

// ============================================================================
// Export / Import Handlers
// ============================================================================

function handleExportJson(): void {
  downloadNetworkAsJson(state.network);
}

function handleExportReport(): void {
  const topLeverage = getTopLeverageBehaviours(state.network, 5);
  const fragileValues = getFragileValues(state.network);
  const conflictBehaviours = getConflictBehaviours(state.network);

  downloadSummaryReport(state.network, topLeverage, fragileValues, conflictBehaviours);
}

function handleImportFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  void importNetworkFromFile(file).then((result) => {
    if (result.success && result.network) {
      // Confirm before replacing
      const nodeCount =
        result.network.behaviours.length +
        result.network.outcomes.length +
        result.network.values.length;
      const linkCount = result.network.links.length;

      const confirmed = confirm(
        `Import network with ${nodeCount} nodes and ${linkCount} links?\n\nThis will replace your current network.`
      );

      if (confirmed) {
        updateNetwork(result.network);
        // Re-render UI
        renderSidebar();
        showAppMessage('success', 'Network imported successfully.');
      }
    } else {
      showAppMessage('error', result.error ?? 'Import failed due to an unknown error.');
    }

    // Reset file input so same file can be imported again
    input.value = '';
  });
}

// ============================================================================
// Layout Helpers
// ============================================================================

function resizeGraphToContainer(): void {
  const graphContainer = document.getElementById('graph-container');
  if (!graphContainer || !graph) return;

  const rect = graphContainer.getBoundingClientRect();
  graph.resize(rect.width || 800, rect.height || 600);
}

function setupSidebarResizers(): void {
  const sidebar = document.getElementById('sidebar');
  const detailPanelEl = document.getElementById('detail-panel');
  const graphContainer = document.getElementById('graph-container');
  const leftResizer = document.getElementById('sidebar-resizer');
  const rightResizer = document.getElementById('detail-resizer');

  if (!sidebar || !detailPanelEl || !graphContainer) return;

  const initHorizontalResizer = (handle: HTMLElement, side: 'left' | 'right'): void => {
    const minWidth = 220;
    const maxWidth = 560;

    handle.addEventListener('mousedown', (event: MouseEvent): void => {
      event.preventDefault();

      const targetPanel = side === 'left' ? sidebar : detailPanelEl;
      const startX = event.clientX;
      const startWidth = targetPanel.getBoundingClientRect().width;

      handle.classList.add('sidebar-resizer-active');

      const onMouseMove = (moveEvent: MouseEvent): void => {
        const deltaX = moveEvent.clientX - startX;
        let newWidth = side === 'left' ? startWidth + deltaX : startWidth - deltaX;
        if (Number.isNaN(newWidth)) return;

        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;

        targetPanel.style.width = `${newWidth}px`;
        resizeGraphToContainer();
      };

      const onMouseUp = (): void => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        handle.classList.remove('sidebar-resizer-active');
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  };

  if (leftResizer) {
    initHorizontalResizer(leftResizer, 'left');
  }

  if (rightResizer) {
    initHorizontalResizer(rightResizer, 'right');
  }
}

// ============================================================================
// Rendering
// ============================================================================

function renderSidebar(): void {
  const sidebar = document.getElementById('sidebar');
  if (sidebar === null) return;

  const formContainer = sidebar.querySelector<HTMLElement>('.sidebar-form-container');
  if (formContainer === null) return;

  // Clear previous form
  formContainer.innerHTML = '';

  switch (state.formMode) {
    case 'create-behaviour':
      new BehaviourForm(formContainer, {
        mode: 'create',
        network: state.network,
        callbacks: {
          onSave: handleSaveBehaviour,
          onCancel: hideForm,
        },
      });
      break;

    case 'create-outcome':
      new OutcomeForm(formContainer, {
        mode: 'create',
        network: state.network,
        callbacks: {
          onSave: handleSaveOutcome,
          onCancel: hideForm,
        },
      });
      break;

    case 'create-value':
      new ValueForm(formContainer, {
        mode: 'create',
        network: state.network,
        callbacks: {
          onSave: handleSaveValue,
          onCancel: hideForm,
        },
      });
      break;

    case 'create-link':
      if (state.linkType) {
        new LinkForm(formContainer, {
          mode: 'create',
          linkType: state.linkType,
          network: state.network,
          preselectedSourceId: state.preselectedSourceId ?? undefined,
          preselectedTargetId: state.preselectedTargetId ?? undefined,
          callbacks: {
            onSave: handleSaveLink,
            onSaveWithNewNode: handleSaveLinkWithNewNode,
            onCancel: hideForm,
          },
        });
      }
      break;

    case 'edit-node':
      if (state.editingNode) {
        switch (state.editingNode.type) {
          case 'behaviour':
            new BehaviourForm(formContainer, {
              mode: 'edit',
              network: state.network,
              initialData: behaviourToFormData(state.editingNode),
              callbacks: {
                onSave: handleSaveBehaviour,
                onCancel: hideForm,
                onDelete: (): void => handleDeleteNode(state.editingNode!),
              },
            });
            break;
          case 'outcome':
            new OutcomeForm(formContainer, {
              mode: 'edit',
              network: state.network,
              initialData: outcomeToFormData(state.editingNode),
              callbacks: {
                onSave: handleSaveOutcome,
                onCancel: hideForm,
                onDelete: (): void => handleDeleteNode(state.editingNode!),
              },
            });
            break;
          case 'value':
            new ValueForm(formContainer, {
              mode: 'edit',
              network: state.network,
              initialData: valueToFormData(state.editingNode),
              callbacks: {
                onSave: handleSaveValue,
                onCancel: hideForm,
                onDelete: (): void => handleDeleteNode(state.editingNode!),
              },
            });
            break;
        }
      }
      break;

    case 'edit-link':
      if (state.editingLink !== null && state.linkType !== null) {
        new LinkForm(formContainer, {
          mode: 'edit',
          linkType: state.linkType,
          network: state.network,
          initialData:
            state.editingLink.type === 'behaviour-outcome'
              ? {
                  type: 'behaviour-outcome',
                  sourceId: state.editingLink.sourceId,
                  targetId: state.editingLink.targetId,
                  valence: state.editingLink.valence,
                  reliability: state.editingLink.reliability,
                }
              : {
                  type: 'outcome-value',
                  sourceId: state.editingLink.sourceId,
                  targetId: state.editingLink.targetId,
                  valence: state.editingLink.valence,
                  strength: state.editingLink.strength,
                },
          callbacks: {
            onSave: handleSaveLink,
            onCancel: hideForm,
            onDelete: (): void => {
              handleDeleteLink(state.editingLink!.id);
              hideForm();
            },
          },
        });
      }
      break;

    case 'why-ladder':
      // Initialize Why Ladder guided capture mode
      whyLadderInstance = new WhyLadder(formContainer, {
        network: state.network,
        initialBehaviourId: state.ladderBehaviourId ?? undefined,
        callbacks: {
          onCreateBehaviour: handleLadderCreateBehaviour,
          onSelectBehaviour: (_id: string): void => {
            // Track selected behaviour in state
          },
          onCreateOutcome: handleLadderCreateOutcome,
          onLinkOutcome: handleLadderLinkOutcome,
          onCreateValue: handleLadderCreateValue,
          onLinkValue: handleLadderLinkValue,
          onChainOutcome: handleLadderChainOutcome,
          onComplete: handleLadderComplete,
          onExit: handleLadderExit,
        },
      });
      break;

    default:
      // Show add buttons when no form is active
      formContainer.innerHTML = `
        <div class="sidebar-placeholder">
          <p>Add nodes to build your network:</p>
          <div class="add-buttons">
            <button class="btn btn-behaviour" id="btn-add-behaviour" aria-label="Add behaviour">Add Behaviour</button>
            <button class="btn btn-outcome" id="btn-add-outcome" aria-label="Add outcome">Add Outcome</button>
            <button class="btn btn-value" id="btn-add-value" aria-label="Add value">Add Value</button>
          </div>
          <hr class="sidebar-divider" />
          <p>Add connections:</p>
          <div class="add-buttons">
            <button class="btn btn-link" id="btn-add-bo-link" aria-label="Add behaviour to outcome link">Behaviour → Outcome Link</button>
            <button class="btn btn-link" id="btn-add-ov-link" aria-label="Add outcome to value link">Outcome → Value Link</button>
          </div>
          <hr class="sidebar-divider" />
          <p>Guided capture:</p>
          <div class="add-buttons">
            <button class="btn btn-ladder" id="btn-why-ladder" aria-label="Start Why Ladder capture">🪜 Why Ladder</button>
          </div>
        </div>
      `;

      // Bind add buttons
      document
        .getElementById('btn-add-behaviour')
        ?.addEventListener('click', showCreateBehaviourForm);
      document.getElementById('btn-add-outcome')?.addEventListener('click', showCreateOutcomeForm);
      document.getElementById('btn-add-value')?.addEventListener('click', showCreateValueForm);
      document
        .getElementById('btn-add-bo-link')
        ?.addEventListener('click', () => showCreateLinkForm('behaviour-outcome'));
      document
        .getElementById('btn-add-ov-link')
        ?.addEventListener('click', () => showCreateLinkForm('outcome-value'));
      document.getElementById('btn-why-ladder')?.addEventListener('click', () => showWhyLadder());
  }
}

// ============================================================================
// Theme Handling
// ============================================================================

function updateThemeToggleButton(): void {
  const btn = document.getElementById('btn-theme-toggle');
  if (!btn) return;
  const theme = getCurrentTheme();
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function handleThemeToggle(): void {
  const newTheme = toggleTheme();
  updateThemeToggleButton();
  // Update graph theme
  if (graph) {
    graph.setTheme(getThemeForMode(newTheme));
  }
}

// ============================================================================
// Initialization
// ============================================================================

function init(): void {
  const app = document.getElementById('app');
  if (!app) return;
  loadWelcomeState();

  // Initialize theme system
  initializeTheme();

  // Create app structure with sidebar
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header" role="banner">
        <h1>M-E Net</h1>
        <p class="subtitle">Means–Ends Network</p>
        <div class="toolbar" role="toolbar" aria-label="Graph controls">
          <button id="btn-fit" class="btn" aria-label="Fit entire network to view">Fit to View</button>
          <button id="btn-reset" class="btn" aria-label="Reset zoom level">Reset Zoom</button>
          <span class="toolbar-separator"></span>
          <button id="btn-export-json" class="btn btn-export" aria-label="Export network as JSON">Export JSON</button>
          <button id="btn-export-report" class="btn btn-export" aria-label="Export summary report">Export Report</button>
          <button id="btn-import" class="btn btn-import" aria-label="Import network data">Import</button>
          <button id="btn-new-network" class="btn btn-import" aria-label="Start a new empty network">New</button>
          <input type="file" id="import-file-input" accept=".json" style="display: none;" aria-hidden="true" />
          <span class="toolbar-separator"></span>
          <button id="btn-theme-toggle" class="btn btn-theme-toggle" aria-label="Toggle theme">🌙</button>
        </div>
      </header>
      <div id="app-messages" class="app-messages" role="region" aria-live="polite" aria-atomic="false"></div>
      <main class="app-main" role="main" aria-label="Network workspace">
        <aside id="sidebar" class="sidebar" aria-label="Network controls">
          <div class="sidebar-content">
            <h2 class="sidebar-title">Filters</h2>
            <div class="sidebar-filter-container"></div>
            <hr class="sidebar-divider" />
            <h2 class="sidebar-title">Add / Edit</h2>
            <div class="sidebar-form-container"></div>
            <hr class="sidebar-divider" />
            <h2 class="sidebar-title">Validation</h2>
            <div class="sidebar-validation-container"></div>
            <hr class="sidebar-divider" />
            <h2 class="sidebar-title">Insights</h2>
            <div class="sidebar-insights-container"></div>
          </div>
        </aside>
        <div id="sidebar-resizer" class="sidebar-resizer" role="separator" aria-orientation="vertical" aria-label="Resize left sidebar"></div>
        <div id="graph-container" class="graph-container" role="region" aria-label="Network diagram"></div>
        <div id="detail-resizer" class="sidebar-resizer" role="separator" aria-orientation="vertical" aria-label="Resize detail panel"></div>
        <aside id="detail-panel" class="detail-panel hidden" aria-label="Node details panel"></aside>
      </main>
      <div id="overlay-root" class="overlay-root" aria-live="assertive"></div>
    </div>
  `;
  messagesContainer = document.getElementById('app-messages');

  // Initialize graph
  const graphContainer = document.getElementById('graph-container');
  if (!graphContainer) return;

  const overlayRoot = document.getElementById('overlay-root');
  if (overlayRoot) {
    welcomeScreen = new WelcomeScreen(overlayRoot, {
      onGetStarted: handleWelcomeStart,
      onImportData: handleWelcomeImport,
      onLoadExample: handleLoadExample,
    });
  }

  emptyState = new EmptyState(graphContainer, {
    onAddBehaviour: handleEmptyStateAddBehaviour,
    onStartWhyLadder: handleEmptyStateWhyLadder,
    onImportData: handleEmptyStateImport,
    onLoadExample: handleLoadExample,
  });

  const rect = graphContainer.getBoundingClientRect();
  graph = new NetworkGraph(graphContainer, {
    width: rect.width || 800,
    height: rect.height || 600,
  });

  // Load network data
  const result = loadNetwork();
  if (
    !result.success &&
    result.error !== undefined &&
    result.error !== null &&
    result.error !== ''
  ) {
    showAppMessage('error', result.error);
  }
  state.network = result.success && result.data ? result.data : createEmptyNetwork();
  graph.setNetwork(state.network);
  if (!isNetworkEmpty(state.network)) {
    setWelcomeDismissed();
  }
  updateEmptyStateVisibility();
  updateWelcomeVisibility();

  // Load warning state
  warningState = loadWarningState();

  // Initialize detail panel
  const detailPanelEl = document.getElementById('detail-panel');
  if (detailPanelEl) {
    detailPanel = new NodeDetailPanel(detailPanelEl, {
      network: state.network,
      callbacks: {
        onEdit: (node): void => showEditNodeForm(node),
        onDelete: (node): void => handleDeleteNode(node),
        onAddLink: (nodeId, direction): void => {
          const node = findNode(nodeId);
          if (!node) return;

          if (node.type === 'behaviour' && direction === 'outgoing') {
            showCreateLinkForm('behaviour-outcome', nodeId);
          } else if (node.type === 'outcome') {
            if (direction === 'incoming') {
              showCreateLinkForm('behaviour-outcome', undefined, nodeId);
            } else {
              showCreateLinkForm('outcome-value', nodeId);
            }
          } else if (node.type === 'value' && direction === 'incoming') {
            showCreateLinkForm('outcome-value', undefined, nodeId);
          }
        },
        onSelectNode: (nodeId): void => selectNode(nodeId),
        onEditLink: (linkId): void => {
          const link = findLink(linkId);
          if (link) showEditLinkForm(link);
        },
        onDeleteLink: (linkId): void => handleDeleteLink(linkId),
        onClose: (): void => selectNode(null),
      },
    });
  }

  // Initialize validation panel
  const validationContainer = document.querySelector('.sidebar-validation-container');
  if (validationContainer) {
    validationPanel = new ValidationPanel(validationContainer as HTMLElement, {
      network: state.network,
      warningState,
      callbacks: {
        onSnooze: (_warningId): void => {
          // Save warning state to localStorage
          saveWarningState();
        },
        onDismiss: (_warningId): void => {
          saveWarningState();
        },
        onUndismiss: (_warningId): void => {
          saveWarningState();
        },
        onNavigateToNode: (nodeId): void => {
          selectNode(nodeId);
          graph?.focusOnNode(nodeId);
        },
      },
    });
  }

  // Initialize insights panel
  const insightsContainer = document.querySelector('.sidebar-insights-container');
  if (insightsContainer) {
    insightsPanel = new InsightsPanel(insightsContainer as HTMLElement, {
      network: state.network,
      callbacks: {
        onNavigateToNode: (nodeId): void => {
          selectNode(nodeId);
        },
      },
    });
  }

  // Initialize filter panel
  const filterContainer = document.querySelector('.sidebar-filter-container');
  if (filterContainer) {
    filterPanel = new FilterPanel(filterContainer as HTMLElement, {
      network: state.network,
      callbacks: {
        onFilterChange: (filter: FilterState): void => {
          handleFilterChange(filter);
        },
      },
    });
  }

  // Fit to view after initial render
  setTimeout((): void => graph?.fitToView(), 100);

  // Toolbar buttons
  document.getElementById('btn-fit')?.addEventListener('click', (): void => graph?.fitToView());
  document.getElementById('btn-reset')?.addEventListener('click', (): void => graph?.resetZoom());

  // Theme toggle button
  document.getElementById('btn-theme-toggle')?.addEventListener('click', handleThemeToggle);
  updateThemeToggleButton();

  // Export/Import buttons
  document.getElementById('btn-export-json')?.addEventListener('click', handleExportJson);
  document.getElementById('btn-export-report')?.addEventListener('click', handleExportReport);
  document.getElementById('btn-import')?.addEventListener('click', (): void => {
    triggerImportDialog();
  });
  document.getElementById('import-file-input')?.addEventListener('change', handleImportFile);
  document.getElementById('btn-new-network')?.addEventListener('click', handleNewNetwork);

  // Graph interaction handlers
  graph.setOnNodeClick((graphNode): void => {
    const node = findNode(graphNode.id);
    if (node) {
      selectNode(node.id);
    }
  });

  graph.setOnBackgroundClick((): void => {
    selectNode(null);
  });

  // Sidebar resizers
  setupSidebarResizers();

  // Handle window resize
  let resizeTimeout: number;
  window.addEventListener('resize', (): void => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout((): void => {
      resizeGraphToContainer();
    }, 100);
  });

  // Initial sidebar render
  renderSidebar();
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
