/**
 * @file
 * Solo Popup Login Block functionality.
 *
 * Provides an accessible popup login block with keyboard navigation,
 * ARIA support, and proper AJAX compatibility.
 *
 * @package Solo
 * @author Alaa Haddad
 * @see https://www.flashwebcenter.com
 */

(function (Drupal, drupalSettings, once) {
  'use strict';

  Drupal.solo = Drupal.solo || {};

  /**
   * Popup login block behavior.
   */
  Drupal.behaviors.soloPopupLoginBlock = {
    attach: function (context, settings) {
      // Initialize popup instance on the login block.
      once('solo-popup-login-init', '#popup-login-block', context).forEach((loginBlock) => {
        try {
          const popupLogin = new Drupal.solo.PopupLogin(loginBlock, context);
          loginBlock.soloPopupLogin = popupLogin;
          popupLogin.init();
        } catch (error) {
          if (window.console && console.error) {
            console.error('Solo popup login initialization error:', error);
          }
        }
      });

      // Attach click/keyboard handlers to standard triggers.
      once('solo-login-trigger', '[data-solo-login-popup-trigger], .login-popup-trigger', context)
        .forEach((trigger) => {
          trigger.addEventListener('click', Drupal.solo.handleLoginTriggerClick);

          // Ensure non-interactive elements act like buttons for accessibility.
          const tag = trigger.tagName.toLowerCase();
          const isInteractive = tag === 'button' || tag === 'a' || trigger.hasAttribute('role');
          if (!isInteractive) {
            trigger.setAttribute('role', 'button');
          }
          if (!trigger.hasAttribute('tabindex')) {
            trigger.setAttribute('tabindex', '0');
          }
          trigger.addEventListener('keydown', Drupal.solo.handleLoginTriggerKeydown);
        });

      // Custom triggers provided via drupalSettings.
      const popupSettings = (drupalSettings.solo && drupalSettings.solo.popupLogin) || {};
      if (popupSettings.customTriggers) {
        const selectors = popupSettings.customTriggers
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        selectors.forEach((selector) => {
          try {
            const onceKey = 'solo-custom-trigger-' + selector.replace(/[^a-zA-Z0-9]/g, '-');
            once(onceKey, selector, context).forEach((trigger) => {
              trigger.addEventListener('click', Drupal.solo.handleLoginTriggerClick);

              // Apply the same keyboard and focusability enhancements.
              const tag = trigger.tagName.toLowerCase();
              const isInteractive = tag === 'button' || tag === 'a' || trigger.hasAttribute('role');
              if (!isInteractive) {
                trigger.setAttribute('role', 'button');
              }
              if (!trigger.hasAttribute('tabindex')) {
                trigger.setAttribute('tabindex', '0');
              }
              trigger.addEventListener('keydown', Drupal.solo.handleLoginTriggerKeydown);
            });
          } catch (e) {
            // Ignore invalid selectors
          }
        });
      }
    },

    detach: function (context, settings, trigger) {
      if (trigger === 'unload' || trigger === 'move') {
        // Destroy popup instances and remove their listeners.
        once.remove('solo-popup-login-init', '#popup-login-block', context).forEach((loginBlock) => {
          if (loginBlock.soloPopupLogin && typeof loginBlock.soloPopupLogin.destroy === 'function') {
            loginBlock.soloPopupLogin.destroy();
            delete loginBlock.soloPopupLogin;
          }
        });

        // Remove standard trigger listeners.
        once.remove('solo-login-trigger', '[data-solo-login-popup-trigger], .login-popup-trigger', context)
          .forEach((triggerEl) => {
            triggerEl.removeEventListener('click', Drupal.solo.handleLoginTriggerClick);
            triggerEl.removeEventListener('keydown', Drupal.solo.handleLoginTriggerKeydown);
          });

        // Remove custom trigger listeners to avoid leaks across AJAX updates.
        const popupSettings = (drupalSettings.solo && drupalSettings.solo.popupLogin) || {};
        if (popupSettings.customTriggers) {
          popupSettings.customTriggers
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((selector) => {
              try {
                const onceKey = 'solo-custom-trigger-' + selector.replace(/[^a-zA-Z0-9]/g, '-');
                once.remove(onceKey, selector, context).forEach((triggerEl) => {
                  triggerEl.removeEventListener('click', Drupal.solo.handleLoginTriggerClick);
                  triggerEl.removeEventListener('keydown', Drupal.solo.handleLoginTriggerKeydown);
                });
              } catch (e) {
                // Ignore invalid selectors
              }
            });
        }
      }
    }
  };

  /**
   * Handle clicks on login popup triggers.
   */
  Drupal.solo.handleLoginTriggerClick = function (event) {
    event.preventDefault();
    event.stopPropagation();
    const loginBlock = document.getElementById('popup-login-block');
    if (loginBlock && loginBlock.soloPopupLogin) {
      loginBlock.soloPopupLogin.open();
    }
  };

  /**
   * Enable keyboard activation (Enter/Space) for non-button triggers.
   */
  Drupal.solo.handleLoginTriggerKeydown = function (event) {
    const isSpace = event.key === ' ' || event.key === 'Spacebar';
    const isEnter = event.key === 'Enter';
    if (isEnter || isSpace) {
      event.preventDefault();
      Drupal.solo.handleLoginTriggerClick(event);
    }
  };

  /**
   * Popup Login handler class.
   */
  Drupal.solo.PopupLogin = function (loginBlock, context) {
    this.loginBlock = loginBlock;
    this.context = context;
    this.openButton = null;
    this.closeButton = null;
    this.isOpen = false;
    this.boundHandlers = {};
    this.lastFocusedElement = null;

    // Settings with defaults.
    this.settings = {
      animationDuration: 300,
      closeOnEscape: true,
      closeOnOutsideClick: true,
      focusTrap: true,
      announceToScreenReaders: true,
      returnFocusOnClose: true,
      customTriggers: '',
      zIndex: 10000,
      overlayOpacity: 50,
      useInlineStyles: false
    };

    // Merge with drupalSettings.
    if (drupalSettings.solo && drupalSettings.solo.popupLogin) {
      Object.assign(this.settings, drupalSettings.solo.popupLogin);
    }

    // Sanitize numeric settings.
    this.settings.animationDuration = Math.max(0, Number(this.settings.animationDuration) || 0);
    this.settings.overlayOpacity = Math.min(100, Math.max(0, Number(this.settings.overlayOpacity) || 0));
    this.settings.zIndex = Number.isFinite(Number(this.settings.zIndex)) ? Number(this.settings.zIndex) : 10000;
  };

  /**
   * Initialize the popup login.
   */
  Drupal.solo.PopupLogin.prototype.init = function () {
    // Find buttons.
    this.openButton = document.querySelector('.login-button-open > button') ||
                      document.querySelector('.login-button-open button') ||
                      document.querySelector('[data-solo-login-popup-trigger]');

    this.closeButton = this.loginBlock.querySelector('.login-button-close button') ||
                       this.loginBlock.querySelector('.login-block-button-close-inner');

    if (!this.closeButton) {
      if (window.console && console.warn) {
        console.warn('Solo popup login: Close button not found');
      }
      return;
    }

    // Fix role attribute if mis-set.
    if (this.loginBlock.getAttribute('role') === 'login') {
      this.loginBlock.setAttribute('role', 'dialog');
    }

    // Setup ARIA.
    this.setupAria();

    // Create screen reader region.
    if (this.settings.announceToScreenReaders) {
      this.createAriaLiveRegion();
    }

    // Setup CSS variables if not using inline styles.
    if (!this.settings.useInlineStyles) {
      this.loginBlock.style.setProperty('--solo-popup-z-index', this.settings.zIndex);
      this.loginBlock.style.setProperty('--solo-popup-overlay-opacity', this.settings.overlayOpacity / 100);
      this.loginBlock.style.setProperty('--solo-popup-animation-duration', this.settings.animationDuration + 'ms');
      this.loginBlock.classList.add('solo-popup-css-vars');
    }

    // Bind events.
    this.bindEvents();

    // Initialize as closed.
    this.close(false);
  };

  /**
   * Setup ARIA attributes.
   */
  Drupal.solo.PopupLogin.prototype.setupAria = function () {
    const loginId = this.loginBlock.id || 'popup-login-block';

    if (this.openButton) {
      this.openButton.setAttribute('aria-controls', loginId);
      this.openButton.setAttribute('aria-label', Drupal.t('Open login form'));
    }

    this.closeButton.setAttribute('aria-label', Drupal.t('Close login form'));
    this.loginBlock.setAttribute('role', 'dialog');
    this.loginBlock.setAttribute('aria-modal', 'true');

    // Strengthen dialog labeling: aria-labelledby / aria-describedby when possible.
    let labelEl = this.loginBlock.querySelector('[data-sr-dialog-title], .popup-login-title, h1, h2, h3');
    if (labelEl) {
      if (!labelEl.id) {
        labelEl.id = 'solo-login-title-' + Math.random().toString(36).slice(2);
      }
      this.loginBlock.setAttribute('aria-labelledby', labelEl.id);
    }

    let descEl = this.loginBlock.querySelector('[data-sr-dialog-description], .popup-login-description, .description');
    if (descEl) {
      if (!descEl.id) {
        descEl.id = 'solo-login-desc-' + Math.random().toString(36).slice(2);
      }
      this.loginBlock.setAttribute('aria-describedby', descEl.id);
    }

    // Mirror aria-controls on all known triggers.
    const allTriggers = document.querySelectorAll(
      '[data-solo-login-popup-trigger], .login-popup-trigger, .login-button-open button, .login-button-open > button'
    );
    allTriggers.forEach((el) => {
      el.setAttribute('aria-controls', loginId);
    });
  };

  /**
   * Create ARIA live region.
   */
  Drupal.solo.PopupLogin.prototype.createAriaLiveRegion = function () {
    if (!document.getElementById('solo-popup-login-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'solo-popup-login-live-region';
      liveRegion.className = 'visually-hidden';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }
    this.liveRegion = document.getElementById('solo-popup-login-live-region');
  };

  /**
   * Announce to screen readers.
   */
  Drupal.solo.PopupLogin.prototype.announce = function (message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = '';
      setTimeout(() => {
        this.liveRegion.textContent = message;
        setTimeout(() => {
          this.liveRegion.textContent = '';
        }, 1000);
      }, 100);
    }
  };

  /**
   * Bind event handlers.
   */
  Drupal.solo.PopupLogin.prototype.bindEvents = function () {
    // Button handlers.
    if (this.openButton) {
      this.boundHandlers.open = (e) => {
        e.preventDefault();
        this.open();
      };
      this.openButton.addEventListener('click', this.boundHandlers.open);
    }

    this.boundHandlers.close = (e) => {
      e.preventDefault();
      this.close();
    };
    this.closeButton.addEventListener('click', this.boundHandlers.close);

    // Document click (outside) handler.
    if (this.settings.closeOnOutsideClick) {
      this.boundHandlers.documentClick = (e) => {
        if (!this.isOpen) return;

        // Inner popup container.
        const popupInner = this.loginBlock.querySelector('.popup-login-block-inner');

        // Fallback if inner container is missing.
        if (!popupInner) {
          if (
            !this.loginBlock.contains(e.target) &&
            !e.target.closest('.login-button-open') &&
            !e.target.closest('[data-solo-login-popup-trigger]') &&
            !e.target.closest('.login-popup-trigger')
          ) {
            this.close();
          }
          return;
        }

        // Close only if click is outside the inner popup and not on any trigger.
        if (
          !popupInner.contains(e.target) &&
          !e.target.closest('.login-button-open') &&
          !e.target.closest('[data-solo-login-popup-trigger]') &&
          !e.target.closest('.login-popup-trigger')
        ) {
          this.close();
        }
      };
    }

    // Escape key handler.
    if (this.settings.closeOnEscape) {
      this.boundHandlers.escapeKey = (e) => {
        if ((e.key === 'Escape' || e.key === 'Esc') && this.isOpen) {
          e.preventDefault();
          this.close();
        }
      };
    }

    // Focus trap handler.
    if (this.settings.focusTrap) {
      this.boundHandlers.focusTrap = (e) => {
        if (e.key !== 'Tab') return;

        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      };
    }
  };

  /**
   * Open the login popup.
   */
  Drupal.solo.PopupLogin.prototype.open = function () {
    if (this.isOpen) return;

    if (this.settings.returnFocusOnClose) {
      this.lastFocusedElement = document.activeElement;
    }

    this.isOpen = true;

    // Dispatch custom event.
    this.loginBlock.dispatchEvent(
      new CustomEvent('solo:loginPopupOpen', { detail: { loginBlock: this.loginBlock }, bubbles: true })
    );

    // Apply styles.
    if (this.settings.useInlineStyles) {
      // Show without clearing existing inline styles.
      this.loginBlock.style.display = 'block';

      // Only set z-index if not default.
      if (this.settings.zIndex !== 10000) {
        this.loginBlock.style.zIndex = this.settings.zIndex;
      }

      // Overlay opacity via CSS var.
      this.loginBlock.style.setProperty('--solo-popup-overlay-opacity', this.settings.overlayOpacity / 100);
    } else {
      this.loginBlock.classList.add('solo-popup-visible');
    }

    // Add classes and update ARIA.
    requestAnimationFrame(() => {
      this.loginBlock.classList.add('toggled');
      this.updateAriaAttributes(true);
      this.setElementsTabindex(true);
      this.focusFirstInput();

      if (this.settings.announceToScreenReaders) {
        this.announce(Drupal.t('Login form opened'));
      }

      // Attach global handlers with a short delay.
      setTimeout(() => {
        if (this.boundHandlers.documentClick) {
          document.addEventListener('click', this.boundHandlers.documentClick, true);
          // Helper to check passive support
          const supportsPassive = (() => {
            let passive = false;
            try {
              const opts = Object.defineProperty({}, 'passive', {
                get: function() { passive = true; }
              });
              window.addEventListener('testPassive', null, opts);
              window.removeEventListener('testPassive', null, opts);
            } catch (e) {}
            return passive;
          })();

          // Then use it
          document.addEventListener('touchstart', this.boundHandlers.documentClick,
            supportsPassive ? { capture: true, passive: true } : true
          );
        }
        if (this.boundHandlers.escapeKey) {
          document.addEventListener('keydown', this.boundHandlers.escapeKey);
        }
        if (this.boundHandlers.focusTrap) {
          this.loginBlock.addEventListener('keydown', this.boundHandlers.focusTrap);
        }
      }, 100);

      document.body.classList.add('solo-login-popup-open');
    });
  };

  /**
   * Close the login popup.
   */
  Drupal.solo.PopupLogin.prototype.close = function (announce = true) {
    if (!this.isOpen && !this.loginBlock.classList.contains('toggled')) return;

    this.isOpen = false;

    // Dispatch custom event.
    this.loginBlock.dispatchEvent(
      new CustomEvent('solo:loginPopupClose', { detail: { loginBlock: this.loginBlock }, bubbles: true })
    );

    // Remove classes and update ARIA.
    this.loginBlock.classList.remove('toggled');
    this.updateAriaAttributes(false);
    this.setElementsTabindex(false);
    document.body.classList.remove('solo-login-popup-open');

    // Hide after animation.
    setTimeout(() => {
      if (!this.isOpen) {
        if (this.settings.useInlineStyles) {
          this.loginBlock.style.display = 'none';
        } else {
          this.loginBlock.classList.remove('solo-popup-visible');
        }
      }
    }, this.settings.animationDuration);

    // Return focus.
    if (this.settings.returnFocusOnClose && this.lastFocusedElement) {
      setTimeout(() => {
        try {
          this.lastFocusedElement.focus();
        } catch (e) {
          if (this.openButton) {
            this.openButton.focus();
          }
        }
      }, 50);
    }

    if (announce && this.settings.announceToScreenReaders) {
      this.announce(Drupal.t('Login form closed'));
    }

    // Remove global handlers.
    if (this.boundHandlers.documentClick) {
      document.removeEventListener('click', this.boundHandlers.documentClick, true);
      // Must match capture setting used when adding.
      document.removeEventListener('touchstart', this.boundHandlers.documentClick, { capture: true });
    }
    if (this.boundHandlers.escapeKey) {
      document.removeEventListener('keydown', this.boundHandlers.escapeKey);
    }
    if (this.boundHandlers.focusTrap) {
      this.loginBlock.removeEventListener('keydown', this.boundHandlers.focusTrap);
    }
  };

  /**
   * Update ARIA attributes.
   */
  Drupal.solo.PopupLogin.prototype.updateAriaAttributes = function (isOpen) {
    // Keep all triggers in sync.
    const triggers = document.querySelectorAll(
      '[data-solo-login-popup-trigger], .login-popup-trigger, .login-button-open button, .login-button-open > button'
    );
    triggers.forEach((el) => el.setAttribute('aria-expanded', String(isOpen)));

    if (this.openButton) {
      this.openButton.setAttribute('aria-expanded', String(isOpen));
    }
    this.closeButton.setAttribute('aria-expanded', String(isOpen));
    this.loginBlock.setAttribute('aria-hidden', String(!isOpen));
  };

  /**
   * Set tabindex on elements within the dialog.
   */
  Drupal.solo.PopupLogin.prototype.setElementsTabindex = function (isOpen) {
    const elements = this.loginBlock.querySelectorAll('button, input, select, textarea, a[href]');
    elements.forEach((element) => {
      if (isOpen) {
        const original = element.getAttribute('data-original-tabindex');
        if (original) {
          if (original === 'none') {
            element.removeAttribute('tabindex');
          } else {
            element.setAttribute('tabindex', original);
          }
          element.removeAttribute('data-original-tabindex');
        } else {
          element.removeAttribute('tabindex');
        }
      } else {
        const current = element.getAttribute('tabindex');
        element.setAttribute('data-original-tabindex', current || 'none');
        element.setAttribute('tabindex', '-1');
      }
    });
  };

  /**
   * Get focusable elements.
   */
  Drupal.solo.PopupLogin.prototype.getFocusableElements = function () {
    const selector = [
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'a[href]:not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]:not([tabindex="-1"])'
    ].join(', ');
    return Array.from(this.loginBlock.querySelectorAll(selector)).filter((el) => {
      return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
    });
  };

  /**
   * Focus first input (or first focusable element).
   */
  Drupal.solo.PopupLogin.prototype.focusFirstInput = function () {
    const focusableElements = this.getFocusableElements();
    const firstInput = focusableElements.find((el) => el.tagName === 'INPUT' && el.type !== 'hidden');

    setTimeout(() => {
      try {
        if (firstInput) {
          firstInput.focus({ preventScroll: true });
        } else if (focusableElements.length > 0) {
          focusableElements[0].focus({ preventScroll: true });
        }
      } catch (e) {
        // Ignore focus errors
      }
    }, 50);
  };

  /**
   * Destroy the popup instance.
   */
  Drupal.solo.PopupLogin.prototype.destroy = function () {
    if (this.isOpen) {
      this.close(false);
    }

    // Remove event listeners specific to this instance.
    if (this.openButton && this.boundHandlers.open) {
      this.openButton.removeEventListener('click', this.boundHandlers.open);
    }
    if (this.closeButton && this.boundHandlers.close) {
      this.closeButton.removeEventListener('click', this.boundHandlers.close);
    }

    // Clean up ARIA live region if this was the last popup.
    if (this.liveRegion && document.querySelectorAll('#popup-login-block').length <= 1) {
      try {
        this.liveRegion.remove();
      } catch (e) {
        // Ignore if already removed
      }
    }

    // Clean up classes.
    document.body.classList.remove('solo-login-popup-open');
    this.loginBlock.classList.remove('solo-popup-css-vars', 'solo-popup-visible');

    // Clear references.
    this.loginBlock = null;
    this.openButton = null;
    this.closeButton = null;
    this.context = null;
    this.boundHandlers = null;
    this.liveRegion = null;
    this.lastFocusedElement = null;
  };

})(Drupal, drupalSettings, once);
