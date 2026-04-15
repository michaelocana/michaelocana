/**
 * @file
 * Adds toggle functionality to a fixed search block with Drupal best practices.
 *
 * Filename: solo-fixed-search-block.js
 * Website: https://www.flashwebcenter.com
 * Developer: Alaa Haddad https://www.alaahaddad.com
 *
 * Dependencies:
 * - core/drupal
 * - core/drupalSettings
 * - core/once
 */

(function (Drupal, drupalSettings, once) {
  'use strict';

  /**
   * Solo theme namespace for public APIs.
   * @namespace
   */
  Drupal.solo = Drupal.solo || {};

  /**
   * Search block toggle functionality.
   *
   * @type {Object}
   * @property {boolean} isOpen - Current state of the search block
   * @property {number} animationId - Current animation frame ID
   */
  Drupal.solo.searchBlock = {
    isOpen: false,
    animationId: null
  };

  /**
   * Main behavior for the fixed search block functionality.
   */
  Drupal.behaviors.soloFixedSearchBlock = {
    /**
     * Attach the search block toggle behavior.
     *
     * @param {HTMLElement} context - The context element
     * @param {Object} settings - Drupal settings object
     */
    attach: function (context, settings) {
      // Initialize search block functionality with once() to prevent duplicates
      once('solo-search-block-init', '[id="fixed-search-block"]', context).forEach((searchBlock) => {
        try {
          this.initializeSearchBlock(searchBlock, context);
        } catch (error) {
          this.handleError('Failed to initialize search block', error);
        }
      });

      // Attach open button handlers
      once('solo-search-open-btn', '.search-button-open > button', context).forEach((button) => {
        this.attachOpenButtonHandler(button);
      });
    },

    /**
     * Detach the search block behavior.
     *
     * @param {HTMLElement} context - The context element
     * @param {Object} settings - Drupal settings object
     * @param {string} trigger - The trigger for the detach ('unload', 'move', 'serialize')
     */
    detach: function (context, settings, trigger) {
      if (trigger === 'unload') {
        // Clean up event listeners and animations
        once.remove('solo-search-block-init', '[id="fixed-search-block"]', context);
        once.remove('solo-search-open-btn', '.search-button-open > button', context);
        once.remove('solo-search-close-btn', '.search-button-close > button', context);
        once.remove('solo-search-outside-click', 'body', document);

        // Cancel any pending animations
        if (Drupal.solo.searchBlock.animationId) {
          cancelAnimationFrame(Drupal.solo.searchBlock.animationId);
        }
      }
    },

    /**
     * Initialize the search block with all necessary handlers.
     *
     * @param {HTMLElement} searchBlock - The search block element
     * @param {HTMLElement} context - The context element
     */
    initializeSearchBlock: function (searchBlock, context) {
      const closeButton = searchBlock.querySelector('.search-button-close > button');

      if (!searchBlock) {
        this.logWarning('Search block element not found');
        return;
      }

      // Cache elements for performance
      const cache = this.createElementCache(searchBlock);

      // Expose public API method
      Drupal.solo.searchBlockToggle = this.createToggleFunction(searchBlock, cache);

      // Attach close button handler
      if (closeButton) {
        once('solo-search-close-btn', closeButton).forEach((button) => {
          this.attachCloseButtonHandler(button, searchBlock, cache);
        });
      }

      // Add keyboard trap handler
      this.attachKeyboardTrap(searchBlock);

      // Add outside click handler
      this.attachOutsideClickHandler(searchBlock, context);

       // Set initial ARIA attributes based on current DOM state.
       const initiallyOpen = searchBlock.classList.contains('toggled');
       Drupal.solo.searchBlock.isOpen = initiallyOpen;
       this.setInitialAriaAttributes(searchBlock, cache);
       this.setAriaAttributes(initiallyOpen, searchBlock, cache);
       this.setTabindexOnElements(initiallyOpen, cache.focusableElements);
    },

    /**
     * Create a cache of commonly accessed elements.
     *
     * @param {HTMLElement} searchBlock - The search block element
     * @returns {Object} Cache object with element references
     */
    createElementCache: function (searchBlock) {
      return {
        openButtons: document.querySelectorAll('.search-button-open > button'),
        closeButton: searchBlock.querySelector('.search-button-close > button'),
        inputs: searchBlock.querySelectorAll('input'),
        focusableElements: searchBlock.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])'),
        mainSideNav: document.getElementById('primary-sidebar-menu')
      };
    },

    /**
     * Create the toggle function with proper error handling.
     *
     * @param {HTMLElement} searchBlock - The search block element
     * @param {Object} cache - Cached element references
     * @returns {Function} The toggle function
     */
    createToggleFunction: function (searchBlock, cache) {
      const self = this;
      return function (isOpen) {
        try {
          self.toggleSearchBlock(isOpen, searchBlock, cache);
        } catch (error) {
          self.handleError('Failed to toggle search block', error);
        }
      };
    },

    /**
     * Toggle the search block open/closed state.
     *
     * @param {boolean} isOpen - Whether to open or close
     * @param {HTMLElement} searchBlock - The search block element
     * @param {Object} cache - Cached element references
     */
    toggleSearchBlock: function (isOpen, searchBlock, cache) {
      if (!searchBlock) {
        this.logWarning('Cannot toggle: search block not found');
        return;
      }

      // Update state
      Drupal.solo.searchBlock.isOpen = isOpen;

      // Set ARIA attributes
      this.setAriaAttributes(isOpen, searchBlock, cache);

      // Set tabindex on interactive elements
      this.setTabindexOnElements(isOpen, cache.focusableElements);

      if (isOpen) {
        this.openSearchBlock(searchBlock, cache);
      } else {
        this.closeSearchBlock(searchBlock);
      }

      // Announce state change to screen readers
      this.announceStateChange(isOpen);
    },

    /**
     * Open the search block with animation.
     *
     * @param {HTMLElement} searchBlock - The search block element
     * @param {Object} cache - Cached element references
     */
    openSearchBlock: function (searchBlock, cache) {
      searchBlock.classList.add('toggled');

      // Prepare for animation
      const targetHeight = this.calculateHeight(searchBlock);
      searchBlock.style.height = '0px';

      // Force reflow
      void searchBlock.offsetHeight;

      // Animate open using requestAnimationFrame
      if (Drupal.solo.searchBlock.animationId) {
        cancelAnimationFrame(Drupal.solo.searchBlock.animationId);
        Drupal.solo.searchBlock.animationId = null;
      }
      Drupal.solo.searchBlock.animationId = requestAnimationFrame(() => {
        searchBlock.style.transition = 'height 0.3s ease-in-out';
        searchBlock.style.height = targetHeight + 'px';
      });

      // Handle transition end
      const onOpenEnd = (event) => {
        if (event.propertyName === 'height') {
          searchBlock.style.height = 'auto';
          searchBlock.removeEventListener('transitionend', onOpenEnd);

          // Focus first input after animation
          this.focusFirstInput(cache.inputs);
        }
      };
      searchBlock.addEventListener('transitionend', onOpenEnd);

      // Close sidebar if present
      if (cache.mainSideNav && typeof Drupal.solo.sideMenubarToggleNav === 'function') {
        try {
          Drupal.solo.sideMenubarToggleNav(false);
        } catch (error) {
          this.logWarning('Failed to close sidebar', error);
        }
      }
    },

    /**
     * Close the search block with animation.
     *
     * @param {HTMLElement} searchBlock - The search block element
     */
    closeSearchBlock: function (searchBlock) {
      // Get current height before closing
      searchBlock.style.height = getComputedStyle(searchBlock).height;

      // Force reflow
      void searchBlock.offsetHeight;

      // Animate close
       if (Drupal.solo.searchBlock.animationId) {
         cancelAnimationFrame(Drupal.solo.searchBlock.animationId);
         Drupal.solo.searchBlock.animationId = null;
       }
      Drupal.solo.searchBlock.animationId = requestAnimationFrame(() => {
        searchBlock.style.height = '0px';
      });

      // Handle transition end
      const onCloseEnd = (event) => {
        if (event.propertyName === 'height') {
          searchBlock.classList.remove('toggled');
          searchBlock.style.height = '';

         searchBlock.removeEventListener('transitionend', onCloseEnd);
         // Return focus to the element that opened the search, if known.
         if (Drupal.solo.searchBlock.triggerElement) {
           try {
             Drupal.solo.searchBlock.triggerElement.focus();
           } catch (e) {
             // no-op
           }
           Drupal.solo.searchBlock.triggerElement = null;
         }

        }
      };
      searchBlock.addEventListener('transitionend', onCloseEnd);
    },

    /**
     * Calculate the natural height of an element.
     *
     * @param {HTMLElement} element - The element to measure
     * @returns {number} The natural height in pixels
     */
    calculateHeight: function (element) {
      const originalHeight = element.style.height;
      element.style.height = 'auto';
      const height = element.clientHeight;
      element.style.height = originalHeight;
      return height;
    },

    /**
     * Set ARIA attributes for accessibility.
     *
     * @param {boolean} isOpen - Whether the search block is open
     * @param {HTMLElement} searchBlock - The search block element
     * @param {Object} cache - Cached element references
     */
    setAriaAttributes: function (isOpen, searchBlock, cache) {
      const expandedValue = isOpen ? 'true' : 'false';
      const hiddenValue = isOpen ? 'false' : 'true';

      // Update open buttons
      if (cache.openButtons) {
        cache.openButtons.forEach(btn => {
          if (btn) btn.setAttribute('aria-expanded', expandedValue);
        });
      }

      // Update close button
      if (cache.closeButton) {
        cache.closeButton.setAttribute('aria-expanded', expandedValue);
      }

      // Update search block
      searchBlock.setAttribute('aria-hidden', hiddenValue);
       if (isOpen) {
         searchBlock.removeAttribute('inert');
       } else {
         searchBlock.setAttribute('inert', '');
       }
    },

    /**
     * Set initial ARIA attributes.
     *
     * @param {HTMLElement} searchBlock - The search block element
     * @param {Object} cache - Cached element references
     */
    setInitialAriaAttributes: function (searchBlock, cache) {
      // Set initial state as closed
      this.setAriaAttributes(false, searchBlock, cache);

      // Add ARIA labels if missing
      if (cache.openButtons) {
        cache.openButtons.forEach(btn => {
          if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', Drupal.t('Open search'));
          }
        });
      }

      if (cache.closeButton && !cache.closeButton.getAttribute('aria-label')) {
        cache.closeButton.setAttribute('aria-label', Drupal.t('Close search'));
      }
    },

    /**
     * Set tabindex on focusable elements.
     *
     * @param {boolean} isOpen - Whether the search block is open
     * @param {NodeList} elements - The focusable elements
     */
    setTabindexOnElements: function (isOpen, elements) {
      if (!elements) return;

      elements.forEach(element => {
        if (element) {
          if (isOpen) {
            element.removeAttribute('tabindex');
          } else {
            element.setAttribute('tabindex', '-1');
          }
        }
      });
    },

    /**
     * Focus the first input field.
     *
     * @param {NodeList} inputs - The input elements
     */
    focusFirstInput: function (inputs) {
      if (inputs && inputs.length > 0 && inputs[0]) {
        // Small delay to ensure animation has started
        setTimeout(() => {
          try {
            inputs[0].focus();
          } catch (error) {
            this.logWarning('Failed to focus input', error);
          }
        }, 100);
      }
    },

    /**
     * Attach keyboard trap for accessibility.
     *
     * @param {HTMLElement} searchBlock - The search block element
     */
    attachKeyboardTrap: function (searchBlock) {
      const trapHandler = this.createKeyboardTrapHandler(searchBlock);
      searchBlock.addEventListener('keydown', trapHandler);

      // Store reference for cleanup
      searchBlock.dataset.keyboardTrapHandler = 'attached';
    },

    /**
     * Create keyboard trap handler.
     *
     * @param {HTMLElement} searchBlock - The search block element
     * @returns {Function} The keyboard trap handler
     */
    createKeyboardTrapHandler: function (searchBlock) {
      return (event) => {
        if (!Drupal.solo.searchBlock.isOpen) {
          return;
        }

        // Allow Escape to close any time the block is open.
        if (event.key === 'Escape') {
          event.preventDefault();
          if (typeof Drupal.solo.searchBlockToggle === 'function') {
            Drupal.solo.searchBlockToggle(false);
          }
          // If we know who opened it, return focus there; otherwise focus the first opener.
          const opener =
            Drupal.solo.searchBlock.triggerElement ||
            document.querySelector('.search-button-open > button');
          if (opener) {
            opener.focus();
          }
          return;
        }

        if (event.key !== 'Tab') {
          return;
        }

        const focusable = Array.from(
          searchBlock.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
        ).filter(el => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && event.target === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && event.target === last) {
          event.preventDefault();
          first.focus();
        }
      };
    },

    /**
     * Attach open button handler with debouncing.
     *
     * @param {HTMLElement} button - The open button element
     */
    attachOpenButtonHandler: function (button) {
      const debouncedHandler = this.debounce(() => {
        if (typeof Drupal.solo.searchBlockToggle === 'function') {
          Drupal.solo.searchBlockToggle(true);
        }
      }, 200);


       button.addEventListener('click', (event) => {
         Drupal.solo.searchBlock.triggerElement = event.currentTarget;
         debouncedHandler();
       });

    },

    /**
     * Attach close button handler with debouncing.
     *
     * @param {HTMLElement} button - The close button element
     * @param {HTMLElement} searchBlock - The search block element
     * @param {Object} cache - Cached element references
     */
    attachCloseButtonHandler: function (button, searchBlock, cache) {
      const debouncedHandler = this.debounce(() => {
        this.toggleSearchBlock(false, searchBlock, cache);
      }, 200);

      button.addEventListener('click', debouncedHandler);
    },

    /**
     * Attach outside click handler.
     *
     * @param {HTMLElement} searchBlock - The search block element
     * @param {HTMLElement} context - The context element
     */
      attachOutsideClickHandler: function (searchBlock, context) {
        // Attach a single, global outside-click listener for the page lifetime.
        // Using document as the context ensures this runs once even after AJAX attaches.
        once('solo-search-outside-click', 'body', document).forEach(() => {
          document.addEventListener('click', (event) => {
            if (!searchBlock || !Drupal.solo.searchBlock.isOpen) {
              return;
            }

            const target = event.target;
            // Treat clicks as "outside" if they are neither inside the block nor on any open button.
            const isOutsideClick =
              !searchBlock.contains(target) &&
              !(target.closest && target.closest('.search-button-open'));

            if (isOutsideClick && typeof Drupal.solo.searchBlockToggle === 'function') {
              Drupal.solo.searchBlockToggle(false);
            }
          });
        });
      },


    /**
     * Announce state change to screen readers.
     *
     * @param {boolean} isOpen - Whether the search block is open
     */
    announceStateChange: function (isOpen) {
      const message = isOpen ?
        Drupal.t('Search form opened') :
        Drupal.t('Search form closed');

     if (Drupal.announce) {
       Drupal.announce(message);
     }
    },

    /**
     * Debounce function for performance.
     *
     * @param {Function} func - The function to debounce
     * @param {number} wait - The debounce delay in milliseconds
     * @returns {Function} The debounced function
     */
    debounce: function (func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Handle errors gracefully.
     *
     * @param {string} message - The error message
     * @param {Error} error - The error object
     */
    handleError: function (message, error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('[Solo Theme]', message, error);
      }
    },

    /**
     * Log warnings for development.
     *
     * @param {string} message - The warning message
     * @param {Error} [error] - Optional error object
     */
    logWarning: function (message, error) {
      if (typeof console !== 'undefined' && console.warn) {
        if (error) {
          console.warn('[Solo Theme]', message, error);
        } else {
          console.warn('[Solo Theme]', message);
        }
      }
    }
  };

})(Drupal, drupalSettings, once);
