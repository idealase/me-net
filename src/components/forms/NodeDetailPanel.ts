/**
 * Node Detail Panel Component
 *
 * Displays detailed information about a selected node including
 * attributes and connected neighbours.
 */

import type { Behaviour, Network, Node, Outcome, Value } from '@/types';

import {
  ConnectedNode,
  costOptions,
  frequencyOptions,
  getConnectedNodes,
  importanceOptions,
  neglectOptions,
  reliabilityOptions,
  strengthOptions,
} from './types';

export interface NodeDetailPanelCallbacks {
  onEdit: (node: Node) => void;
  onDelete: (node: Node) => void;
  onAddLink: (nodeId: string, direction: 'outgoing' | 'incoming') => void;
  onSelectNode: (nodeId: string) => void;
  onEditLink: (linkId: string) => void;
  onDeleteLink: (linkId: string) => void;
  onClose: () => void;
}

export interface NodeDetailPanelOptions {
  network: Network;
  callbacks: NodeDetailPanelCallbacks;
}

export class NodeDetailPanel {
  private container: HTMLElement;
  private network: Network;
  private callbacks: NodeDetailPanelCallbacks;
  private selectedNode: Node | null = null;

  constructor(container: HTMLElement, options: NodeDetailPanelOptions) {
    this.container = container;
    this.network = options.network;
    this.callbacks = options.callbacks;
    this.render();
  }

  /**
   * Show details for a specific node.
   */
  show(node: Node): void {
    this.selectedNode = node;
    this.container.classList.remove('hidden');
    this.render();
  }

  /**
   * Hide the panel.
   */
  hide(): void {
    this.selectedNode = null;
    this.container.classList.add('hidden');
  }

  /**
   * Update the network reference.
   */
  setNetwork(network: Network): void {
    this.network = network;
    // Re-render if we have a selected node
    if (this.selectedNode) {
      // Find updated node
      const updated = this.findNode(this.selectedNode.id);
      if (updated) {
        this.selectedNode = updated;
        this.render();
      } else {
        // Node was deleted
        this.hide();
      }
    }
  }

  private findNode(id: string): Node | undefined {
    return (
      this.network.behaviours.find((b) => b.id === id) ??
      this.network.outcomes.find((o) => o.id === id) ??
      this.network.values.find((v) => v.id === id)
    );
  }

  private render(): void {
    if (!this.selectedNode) {
      this.container.innerHTML = `
        <div class="panel-content">
          <div class="panel-header">
            <h2>Select a node</h2>
          </div>
          <p class="panel-placeholder">Click on a node in the graph to see its details.</p>
        </div>
      `;
      return;
    }

    const node = this.selectedNode;
    const connectedNodes = getConnectedNodes(this.network, node.id);
    const incoming = connectedNodes.filter((n) => n.direction === 'incoming');
    const outgoing = connectedNodes.filter((n) => n.direction === 'outgoing');

    const typeLabel = this.getTypeLabel(node.type);
    const typeClass = node.type;

    this.container.innerHTML = `
      <div class="panel-content">
        <div class="panel-header">
          <button class="panel-close" id="btn-close" aria-label="Close panel">×</button>
          <span class="node-type-badge ${typeClass}">${typeLabel}</span>
          <h2 class="panel-title">${this.escapeHtml(node.label)}</h2>
        </div>

        <div class="panel-section">
          <h3>Attributes</h3>
          ${this.renderAttributes(node)}
        </div>

        ${incoming.length > 0 ? this.renderConnections('Incoming Links', incoming, 'incoming') : ''}
        ${outgoing.length > 0 ? this.renderConnections('Outgoing Links', outgoing, 'outgoing') : ''}

        <div class="panel-section panel-actions-section">
          ${this.renderAddLinkButtons(node)}
          <div class="panel-action-buttons">
            <button class="btn btn-secondary" id="btn-edit">Edit</button>
            <button class="btn btn-danger" id="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderAttributes(node: Node): string {
    switch (node.type) {
      case 'behaviour':
        return this.renderBehaviourAttributes(node);
      case 'outcome':
        return this.renderOutcomeAttributes(node);
      case 'value':
        return this.renderValueAttributes(node);
    }
  }

  private renderBehaviourAttributes(behaviour: Behaviour): string {
    const freqLabel = frequencyOptions.find((o) => o.value === behaviour.frequency)?.label ?? behaviour.frequency;
    const costLabel = costOptions.find((o) => o.value === behaviour.cost)?.label ?? behaviour.cost;

    return `
      <dl class="attribute-list">
        <dt>Frequency</dt>
        <dd>${freqLabel}</dd>
        <dt>Cost</dt>
        <dd>${costLabel}</dd>
        ${behaviour.contextTags.length > 0 ? `<dt>Tags</dt><dd>${behaviour.contextTags.map((t) => `<span class="tag">${this.escapeHtml(t)}</span>`).join(' ')}</dd>` : ''}
        ${behaviour.notes !== undefined && behaviour.notes !== '' ? `<dt>Notes</dt><dd class="notes">${this.escapeHtml(behaviour.notes)}</dd>` : ''}
      </dl>
    `;
  }

  private renderOutcomeAttributes(outcome: Outcome): string {
    return `
      <dl class="attribute-list">
        ${outcome.notes !== undefined && outcome.notes !== '' ? `<dt>Notes</dt><dd class="notes">${this.escapeHtml(outcome.notes)}</dd>` : '<p class="no-attributes">No additional attributes</p>'}
      </dl>
    `;
  }

  private renderValueAttributes(value: Value): string {
    const impLabel = importanceOptions.find((o) => o.value === value.importance)?.label ?? value.importance;
    const negLabel = neglectOptions.find((o) => o.value === value.neglect)?.label ?? value.neglect;

    return `
      <dl class="attribute-list">
        <dt>Importance</dt>
        <dd>${impLabel}</dd>
        <dt>Current Status</dt>
        <dd>${negLabel}</dd>
        ${value.notes !== undefined && value.notes !== '' ? `<dt>Notes</dt><dd class="notes">${this.escapeHtml(value.notes)}</dd>` : ''}
      </dl>
    `;
  }

  private renderConnections(title: string, connections: ConnectedNode[], direction: 'incoming' | 'outgoing'): string {
    return `
      <div class="panel-section">
        <h3>${title}</h3>
        <ul class="connection-list">
          ${connections
            .map((conn) => {
              const typeClass = conn.type;
              const valenceClass = conn.valence;
              const strengthLabel = conn.strength !== undefined
                ? strengthOptions.find((o) => o.value === conn.strength)?.label
                : conn.reliability !== undefined
                  ? reliabilityOptions.find((o) => o.value === conn.reliability)?.label
                  : '';

              return `
              <li class="connection-item">
                <div class="connection-main">
                  <span class="connection-direction">${direction === 'incoming' ? '←' : '→'}</span>
                  <span class="node-type-dot ${typeClass}"></span>
                  <a href="#" class="connection-label" data-node-id="${conn.id}">${this.escapeHtml(conn.label)}</a>
                </div>
                <div class="connection-meta">
                  <span class="valence-badge ${valenceClass}">${conn.valence === 'positive' ? '+' : '−'}</span>
                  ${strengthLabel !== '' ? `<span class="strength-label">${strengthLabel}</span>` : ''}
                  <button class="btn-icon" data-link-id="${conn.linkId}" data-action="edit-link" title="Edit link">✎</button>
                  <button class="btn-icon btn-icon-danger" data-link-id="${conn.linkId}" data-action="delete-link" title="Delete link">×</button>
                </div>
              </li>
            `;
            })
            .join('')}
        </ul>
      </div>
    `;
  }

  private renderAddLinkButtons(node: Node): string {
    const buttons: string[] = [];

    // Behaviours can link to Outcomes (outgoing only)
    if (node.type === 'behaviour') {
      buttons.push(`<button class="btn btn-sm" id="btn-add-outgoing">+ Link to Outcome</button>`);
    }

    // Outcomes can have incoming from Behaviours and outgoing to Values
    if (node.type === 'outcome') {
      buttons.push(`<button class="btn btn-sm" id="btn-add-incoming">+ Link from Behaviour</button>`);
      buttons.push(`<button class="btn btn-sm" id="btn-add-outgoing">+ Link to Value</button>`);
    }

    // Values can have incoming from Outcomes (incoming only)
    if (node.type === 'value') {
      buttons.push(`<button class="btn btn-sm" id="btn-add-incoming">+ Link from Outcome</button>`);
    }

    return buttons.length > 0 ? `<div class="add-link-buttons">${buttons.join('')}</div>` : '';
  }

  private getTypeLabel(type: 'behaviour' | 'outcome' | 'value'): string {
    switch (type) {
      case 'behaviour':
        return 'Behaviour';
      case 'outcome':
        return 'Outcome';
      case 'value':
        return 'Value';
    }
  }

  private bindEvents(): void {
    const closeBtn = this.container.querySelector('#btn-close');
    const editBtn = this.container.querySelector('#btn-edit');
    const deleteBtn = this.container.querySelector('#btn-delete');
    const addIncomingBtn = this.container.querySelector('#btn-add-incoming');
    const addOutgoingBtn = this.container.querySelector('#btn-add-outgoing');

    closeBtn?.addEventListener('click', () => {
      this.callbacks.onClose();
    });

    editBtn?.addEventListener('click', () => {
      if (this.selectedNode) {
        this.callbacks.onEdit(this.selectedNode);
      }
    });

    deleteBtn?.addEventListener('click', () => {
      if (this.selectedNode) {
        if (confirm(`Are you sure you want to delete "${this.selectedNode.label}"? This will also remove all connected links.`)) {
          this.callbacks.onDelete(this.selectedNode);
        }
      }
    });

    addIncomingBtn?.addEventListener('click', () => {
      if (this.selectedNode) {
        this.callbacks.onAddLink(this.selectedNode.id, 'incoming');
      }
    });

    addOutgoingBtn?.addEventListener('click', () => {
      if (this.selectedNode) {
        this.callbacks.onAddLink(this.selectedNode.id, 'outgoing');
      }
    });

    // Connection label clicks (navigate to node)
    this.container.querySelectorAll('.connection-label').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const nodeId = (el as HTMLElement).dataset.nodeId;
        if (nodeId !== undefined && nodeId !== '') {
          this.callbacks.onSelectNode(nodeId);
        }
      });
    });

    // Edit link buttons
    this.container.querySelectorAll('[data-action="edit-link"]').forEach((el) => {
      el.addEventListener('click', () => {
        const linkId = (el as HTMLElement).dataset.linkId;
        if (linkId !== undefined && linkId !== '') {
          this.callbacks.onEditLink(linkId);
        }
      });
    });

    // Delete link buttons
    this.container.querySelectorAll('[data-action="delete-link"]').forEach((el) => {
      el.addEventListener('click', () => {
        const linkId = (el as HTMLElement).dataset.linkId;
        if (linkId !== undefined && linkId !== '' && confirm('Are you sure you want to delete this link?')) {
          this.callbacks.onDeleteLink(linkId);
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
