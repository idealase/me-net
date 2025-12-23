/**
 * M-E Net Application Entry Point
 */

import './styles/main.css';

import { NetworkGraph } from './components/graph';
import { createEmptyNetwork } from './data/network';
import { loadNetwork } from './data/storage';

function init(): void {
  const app = document.getElementById('app');
  if (!app) return;

  // Create app structure
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <h1>M-E Net</h1>
        <p class="subtitle">Means–Ends Network</p>
        <div class="toolbar">
          <button id="btn-fit" class="btn">Fit to View</button>
          <button id="btn-reset" class="btn">Reset Zoom</button>
        </div>
      </header>
      <main class="app-main">
        <div id="graph-container" class="graph-container"></div>
        <aside id="detail-panel" class="detail-panel hidden">
          <div class="panel-content">
            <h2 id="panel-title">Select a node</h2>
            <div id="panel-body"></div>
          </div>
        </aside>
      </main>
    </div>
  `;

  // Initialize graph
  const container = document.getElementById('graph-container');
  if (!container) return;

  // Get container dimensions
  const rect = container.getBoundingClientRect();
  const graph = new NetworkGraph(container, {
    width: rect.width || 1000,
    height: rect.height || 700,
  });

  // Load network data
  const result = loadNetwork();
  const network = result.success && result.data ? result.data : createEmptyNetwork();
  graph.setNetwork(network);

  // Fit to view after initial render
  setTimeout(() => graph.fitToView(), 100);

  // Toolbar buttons
  document.getElementById('btn-fit')?.addEventListener('click', () => graph.fitToView());
  document.getElementById('btn-reset')?.addEventListener('click', () => graph.resetZoom());

  // Node selection handler
  const detailPanel = document.getElementById('detail-panel');
  const panelTitle = document.getElementById('panel-title');
  const panelBody = document.getElementById('panel-body');

  graph.setOnNodeClick((node) => {
    if (detailPanel && panelTitle && panelBody) {
      detailPanel.classList.remove('hidden');
      panelTitle.textContent = node.label;
      panelBody.innerHTML = `
        <p><strong>Type:</strong> ${node.type}</p>
        <p><strong>ID:</strong> ${node.id}</p>
      `;
    }
  });

  graph.setOnBackgroundClick(() => {
    detailPanel?.classList.add('hidden');
  });

  // Handle window resize
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      const newRect = container.getBoundingClientRect();
      graph.resize(newRect.width || 1000, newRect.height || 700);
    }, 100);
  });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
