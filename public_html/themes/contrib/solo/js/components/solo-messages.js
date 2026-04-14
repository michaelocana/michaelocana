/**
 * @file
 * Solo Theme Message Handler
 *
 * Provides close functionality for Drupal messages with proper AJAX support,
 * error handling, and accessibility features.
 *
 * Filename:     solo-message.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com
 *
 * @requires core/drupal
 * @requires core/once
 */

(function (Drupal, drupalSettings, once) {
  'use strict';

  // Ensure namespace exists
  Drupal.solo = Drupal.solo || {};

  /**
   * Configuration constants for message behavior.
   *
   * @const {Object}
   */
  const CONFIG = {
    selectors: {
      message: '[data-drupal-selector="messages"]',
      container: '[data-drupal-selector="messages-container"]',
      buttonWrapper: 'messages__button',
      closeButton: 'messages__close',
      hiddenClass: 'hidden',
      visuallyHidden: 'visually-hidden'
    },
    animation: {
      hideDelay: 300, // milliseconds
      removeDelay: 500 // milliseconds after hide animation
    },
    aria: {
      label: Drupal.t('Close message'),
      live: 'polite',
      role: 'status'
    }
  };

  /**
   * WeakMap to track initialized messages for cleanup.
   *
   * @type {WeakMap}
   */
  const initializedMessages = new WeakMap();

  /**
   * Creates a close button element with proper accessibility attributes.
   *
   * @param {string} messageId - Unique identifier for the message.
   * @return {HTMLElement} The close button wrapper element.
   */
  const createCloseButton = (messageId) => {
    try {
      // Create wrapper
      const closeBtnWrapper = document.createElement('div');
      closeBtnWrapper.classList.add(CONFIG.selectors.buttonWrapper);

      // Create button
      const closeBtn = document.createElement('button');
      closeBtn.setAttribute('type', 'button');
      closeBtn.classList.add(CONFIG.selectors.closeButton);
      closeBtn.setAttribute('aria-label', CONFIG.aria.label);
      closeBtn.setAttribute('aria-controls', messageId);

      // Create visually hidden text for screen readers
      const closeBtnText = document.createElement('span');
      closeBtnText.classList.add(CONFIG.selectors.visuallyHidden);
      closeBtnText.textContent = CONFIG.aria.label;

      // Assemble elements
      closeBtn.appendChild(closeBtnText);
      closeBtnWrapper.appendChild(closeBtn);

      return closeBtnWrapper;
    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Theme: Failed to create close button', error);
      }
      return null;
    }
  };

  /**
   * Handles the close button click event with animation and cleanup.
   *
   * @param {HTMLElement} message - The message element to close.
   * @param {MouseEvent} event - The click event.
   */
  const handleCloseClick = (message, event) => {
    try {
      event.preventDefault();
      event.stopPropagation();

      // Add hidden class for CSS animation
      message.classList.add(CONFIG.selectors.hiddenClass);

      // Announce closure to screen readers
      if (message.getAttribute('role') === 'status') {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.classList.add(CONFIG.selectors.visuallyHidden);
        announcement.textContent = Drupal.t('Message closed');
        document.body.appendChild(announcement);

        // Remove announcement after screen readers have time to read it
        setTimeout(() => {
          if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
          }
        }, 1000);
      }

      // Remove from DOM after animation completes
      setTimeout(() => {
        if (message.parentNode) {
          // Clean up event listeners
          cleanupMessage(message);

          // Trigger custom event for other scripts
          const removeEvent = new CustomEvent('solo:messageRemoved', {
            detail: { message: message },
            bubbles: true
          });
          document.dispatchEvent(removeEvent);

          // Remove from DOM
          message.parentNode.removeChild(message);
        }
      }, CONFIG.animation.removeDelay);

    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Theme: Error closing message', error);
      }
    }
  };

  /**
   * Cleans up event listeners and references for a message.
   *
   * @param {HTMLElement} message - The message element to clean up.
   */
  const cleanupMessage = (message) => {
    const data = initializedMessages.get(message);
    if (data && data.closeHandler) {
      const closeBtn = message.querySelector(`.${CONFIG.selectors.closeButton}`);
      if (closeBtn) {
        closeBtn.removeEventListener('click', data.closeHandler);
      }
    }
    initializedMessages.delete(message);
  };

  /**
   * Adds a close button to the message with proper error handling.
   *
   * @param {HTMLElement} message - The message element.
   */
  const closeMessage = (message) => {
    try {
      // Validate message element
      if (!message || !(message instanceof HTMLElement)) {
        throw new Error('Invalid message element');
      }

      // Check if already initialized
      if (initializedMessages.has(message)) {
        return;
      }

      // Find or create message container
      let messageContainer = message.querySelector(CONFIG.selectors.container);

      // If no container found, use the message itself
      if (!messageContainer) {
        messageContainer = message;
      }

      // Generate unique ID if not present
      if (!message.id) {
        message.id = `solo-message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Set ARIA attributes for accessibility
      if (!message.hasAttribute('role')) {
        message.setAttribute('role', 'status');
      }
      if (!message.hasAttribute('aria-live')) {
        message.setAttribute('aria-live', CONFIG.aria.live);
      }

      // Create and add close button
      const closeBtnWrapper = createCloseButton(message.id);
      if (!closeBtnWrapper) {
        throw new Error('Failed to create close button');
      }

      messageContainer.appendChild(closeBtnWrapper);

      // Get the button element for event handling
      const closeBtn = closeBtnWrapper.querySelector(`.${CONFIG.selectors.closeButton}`);
      if (!closeBtn) {
        throw new Error('Close button not found after creation');
      }

      // Create bound event handler for cleanup
      const boundHandleClose = handleCloseClick.bind(null, message);
      closeBtn.addEventListener('click', boundHandleClose);

      // Store reference for cleanup
      initializedMessages.set(message, {
        closeHandler: boundHandleClose,
        closeButton: closeBtn
      });

      // Trigger custom event
      const initEvent = new CustomEvent('solo:messageInitialized', {
        detail: { message: message },
        bubbles: true
      });
      message.dispatchEvent(initEvent);

    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Theme: Failed to initialize message close button', error);
      }
    }
  };

  /**
   * Drupal behavior for Solo theme messages.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches close button functionality to messages.
   * @prop {Drupal~behaviorDetach} detach
   *   Removes close button functionality and cleans up event listeners.
   */
  Drupal.behaviors.soloMessages = {
    attach: function (context, settings) {
      // Use once() to ensure single initialization per element
      const messages = once('solo-messages', CONFIG.selectors.message, context);

      // Process each message
      messages.forEach(function (message) {
        closeMessage(message);
      });

      // Log initialization in development mode
      if (settings.solo && settings.solo.debug) {
        if (messages.length > 0 && window.console && console.log) {
          console.log(`Solo Theme: Initialized ${messages.length} message(s)`);
        }
      }
    },

    detach: function (context, settings, trigger) {
      // Only clean up if not doing a full page unload
      if (trigger !== 'unload') {
        // Find all messages in the context being detached
        const messages = context.querySelectorAll
          ? context.querySelectorAll(CONFIG.selectors.message)
          : [];

        // Clean up each message
        messages.forEach(function (message) {
          if (initializedMessages.has(message)) {
            cleanupMessage(message);

            // Remove the close button wrapper
            const closeBtnWrapper = message.querySelector(`.${CONFIG.selectors.buttonWrapper}`);
            if (closeBtnWrapper && closeBtnWrapper.parentNode) {
              closeBtnWrapper.parentNode.removeChild(closeBtnWrapper);
            }

            // Remove the once() marker
            if (message.dataset.onceMessages) {
              delete message.dataset.onceMessages;
            }
          }
        });

        // Log cleanup in development mode
        if (settings.solo && settings.solo.debug && messages.length > 0) {
          if (window.console && console.log) {
            console.log(`Solo Theme: Cleaned up ${messages.length} message(s)`);
          }
        }
      }
    }
  };

  /**
   * Public API for programmatic message closing.
   *
   * @namespace
   */
  Drupal.solo.messages = {
    /**
     * Programmatically close a message.
     *
     * @param {HTMLElement|string} messageOrId - Message element or ID.
     * @return {boolean} True if message was closed, false otherwise.
     */
    close: function (messageOrId) {
      try {
        const message = typeof messageOrId === 'string'
          ? document.getElementById(messageOrId)
          : messageOrId;

        if (message && message.classList) {
          const closeBtn = message.querySelector(`.${CONFIG.selectors.closeButton}`);
          if (closeBtn) {
            closeBtn.click();
            return true;
          }
        }
        return false;
      } catch (error) {
        if (window.console && console.error) {
          console.error('Solo Theme: Failed to close message', error);
        }
        return false;
      }
    },

    /**
     * Close all messages.
     *
     * @return {number} Number of messages closed.
     */
    closeAll: function () {
      let count = 0;
      try {
        const messages = document.querySelectorAll(CONFIG.selectors.message);
        messages.forEach(function (message) {
          if (Drupal.solo.messages.close(message)) {
            count++;
          }
        });
      } catch (error) {
        if (window.console && console.error) {
          console.error('Solo Theme: Failed to close all messages', error);
        }
      }
      return count;
    },

    /**
     * Get configuration (read-only).
     *
     * @return {Object} Configuration object.
     */
    getConfig: function () {
      // Return a frozen copy to prevent modifications
      return Object.freeze(Object.assign({}, CONFIG));
    }
  };

  // Legacy API support for backward compatibility
  Drupal.solo.closeMessage = closeMessage;

})(Drupal, drupalSettings, once);
