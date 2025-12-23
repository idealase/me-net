/**
 * M-E Net Application Entry Point
 */

import './styles/main.css';

function init(): void {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="container">
        <h1>M-E Net</h1>
        <p>Means–Ends Network</p>
        <p class="subtitle">Map behaviours to motivations</p>
      </div>
    `;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
