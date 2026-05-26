(function () {
  const ELEMENT_NAME = "ld-theme-toggle";
  const DEFAULT_STORAGE_KEY = "ld-theme";
  const MODES = ["system", "light", "dark"];

  if (customElements.get(ELEMENT_NAME)) {
    return;
  }

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (_error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (_error) {
        // Ignore storage failures so the component still works in private modes.
      }
    },
  };

  class LdThemeToggle extends HTMLElement {
    static get observedAttributes() {
      return ["storage-key"];
    }

    constructor() {
      super();

      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.mode = "system";
      this.buttons = new Map();
      this.handleSystemChange = this.handleSystemChange.bind(this);
      this.handleClick = this.handleClick.bind(this);

      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          :host {
            --ld-theme-toggle-fg: #111827;
            --ld-theme-toggle-bg: rgba(255, 255, 255, 0.82);
            --ld-theme-toggle-border: rgba(17, 24, 39, 0.28);
            --ld-theme-toggle-active-bg: #111827;
            --ld-theme-toggle-active-color: #ffffff;
            --ld-theme-toggle-focus: Highlight;
            color: var(--ld-theme-toggle-fg);
            display: inline-flex;
            font: inherit;
          }

          :host([theme="dark"]) {
            --ld-theme-toggle-fg: #f9fafb;
            --ld-theme-toggle-bg: rgba(17, 24, 39, 0.82);
            --ld-theme-toggle-border: rgba(249, 250, 251, 0.32);
            --ld-theme-toggle-active-bg: #f9fafb;
            --ld-theme-toggle-active-color: #111827;
          }

          .control {
            align-items: center;
            background: var(--ld-theme-toggle-bg);
            border: 1px solid var(--ld-theme-toggle-border);
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
            display: inline-flex;
            gap: 2px;
            padding: 2px;
          }

          button {
            align-items: center;
            appearance: none;
            background: transparent;
            border: 0;
            border-radius: 6px;
            color: inherit;
            cursor: pointer;
            display: inline-flex;
            font: inherit;
            height: 2.25rem;
            justify-content: center;
            line-height: 1;
            padding: 0;
            width: 2.25rem;
          }

          svg {
            display: block;
            height: 1.15rem;
            pointer-events: none;
            width: 1.15rem;
          }

          button[aria-pressed="true"] {
            background: var(--ld-theme-toggle-active-bg);
            color: var(--ld-theme-toggle-active-color);
          }

          button:focus-visible {
            outline: 2px solid var(--ld-theme-toggle-focus);
            outline-offset: 2px;
          }
        </style>
        <div class="control" role="group" aria-label="Theme">
          <button type="button" data-mode="system" title="System" aria-label="Use system theme">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="3" rx="2"></rect>
              <path d="M8 21h8"></path>
              <path d="M12 17v4"></path>
            </svg>
          </button>
          <button type="button" data-mode="light" title="Light" aria-label="Use light theme">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
          </button>
          <button type="button" data-mode="dark" title="Dark" aria-label="Use dark theme">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </button>
        </div>
      `;
    }

    connectedCallback() {
      this.buttons = new Map(
        Array.from(this.shadowRoot.querySelectorAll("button")).map((button) => [
          button.dataset.mode,
          button,
        ]),
      );

      this.shadowRoot.addEventListener("click", this.handleClick);
      this.mediaQuery.addEventListener("change", this.handleSystemChange);
      this.mode = this.getStoredMode();
      this.applyTheme();
    }

    disconnectedCallback() {
      this.shadowRoot.removeEventListener("click", this.handleClick);
      this.mediaQuery.removeEventListener("change", this.handleSystemChange);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "storage-key" && oldValue !== newValue && this.isConnected) {
        this.mode = this.getStoredMode();
        this.applyTheme();
      }
    }

    get storageKey() {
      return this.getAttribute("storage-key") || DEFAULT_STORAGE_KEY;
    }

    get resolvedTheme() {
      return this.mode === "system" ? getSystemTheme() : this.mode;
    }

    getStoredMode() {
      const storedMode = safeStorage.get(this.storageKey);
      return MODES.includes(storedMode) ? storedMode : "system";
    }

    setMode(mode) {
      if (!MODES.includes(mode)) {
        return;
      }

      this.mode = mode;
      safeStorage.set(this.storageKey, mode);
      this.applyTheme();
    }

    applyTheme() {
      const theme = this.resolvedTheme;

      document.body.setAttribute("data-theme", theme);
      this.setAttribute("mode", this.mode);
      this.setAttribute("theme", theme);

      for (const [mode, button] of this.buttons) {
        button.setAttribute("aria-pressed", String(mode === this.mode));
      }

      this.dispatchEvent(
        new CustomEvent("themechange", {
          bubbles: true,
          detail: { mode: this.mode, theme },
        }),
      );
    }

    handleClick(event) {
      const button = event.target.closest("button[data-mode]");
      if (!button) {
        return;
      }

      this.setMode(button.dataset.mode);
    }

    handleSystemChange() {
      if (this.mode === "system") {
        this.applyTheme();
      }
    }
  }

  customElements.define(ELEMENT_NAME, LdThemeToggle);
})();
