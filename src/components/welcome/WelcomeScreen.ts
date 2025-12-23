/**
 * Welcome Screen Component
 * First-run experience for new users
 */

export interface WelcomeScreenCallbacks {
  onGetStarted: () => void;
  onImportData: () => void;
}

export class WelcomeScreen {
  private container: HTMLElement;
  private element: HTMLElement | null = null;
  private callbacks: WelcomeScreenCallbacks;

  constructor(container: HTMLElement, callbacks: WelcomeScreenCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  show(): void {
    if (this.element !== null) {
      this.element.classList.remove('hidden');
      const existingStartButton = this.element.querySelector<HTMLButtonElement>('#btn-welcome-start');
      existingStartButton?.focus();
      return;
    }

    this.element = document.createElement('div');
    this.element.className = 'welcome-screen';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-labelledby', 'welcome-title');
    this.element.innerHTML = `
      <div class="welcome-content">
        <h1 id="welcome-title" class="welcome-title">Welcome to M-E Net</h1>
        <p class="welcome-subtitle">Map your behaviours to what truly matters</p>
        
        <div class="welcome-description">
          <p>M-E Net helps you understand <strong>why</strong> you do what you do by connecting:</p>
          <ul class="welcome-list">
            <li><strong>Behaviours</strong> — The actions you take</li>
            <li><strong>Outcomes</strong> — The effects they produce</li>
            <li><strong>Values</strong> — What ultimately matters to you</li>
          </ul>
          <p>Discover which behaviours are most leveraged, which values are fragile, and where trade-offs exist.</p>
        </div>

        <div class="welcome-actions">
          <button id="btn-welcome-start" class="btn btn-primary" aria-label="Start mapping your first behaviour">
            Start with a Behaviour
          </button>
          <button id="btn-welcome-import" class="btn btn-secondary" aria-label="Import existing network data">
            Import Existing Data
          </button>
        </div>

        <p class="welcome-hint">Tip: Use the Why Ladder mode to quickly build your network</p>
      </div>
    `;

    this.container.appendChild(this.element);

    // Wire event handlers
    const startBtn = this.element.querySelector<HTMLButtonElement>('#btn-welcome-start');
    const importBtn = this.element.querySelector<HTMLButtonElement>('#btn-welcome-import');

    if (startBtn !== null) {
      startBtn.addEventListener('click', () => {
        this.hide();
        this.callbacks.onGetStarted();
      });
    }

    if (importBtn !== null) {
      importBtn.addEventListener('click', () => {
        this.hide();
        this.callbacks.onImportData();
      });
    }

    // Focus the primary action
    startBtn?.focus();
  }

  hide(): void {
    if (this.element !== null) {
      this.element.classList.add('hidden');
    }
  }

  destroy(): void {
    if (this.element !== null) {
      this.element.remove();
      this.element = null;
    }
  }
}
