/**
 * @file
 * Contains utility functions for Solo module.
 *
 * Filename: solo-utils.js
 * Website: https://www.flashwebcenter.com
 * Developer: Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal, drupalSettings, once) => {
  'use strict';

  /**
   * Solo helper functions namespace.
   *
   * @namespace
   */
  Drupal.solo = Drupal.solo || {};

  Drupal.solo.animations = {
    slideUp: drupalSettings.solo?.slideUpSpeed || 350,
    slideDown: drupalSettings.solo?.slideDownSpeed || 500,
    megaMenu: drupalSettings.solo?.megaMenuSpeed || 800,
    reset: drupalSettings.solo?.slideUpSpeed || 350,
    clickDelay: 500
  };

  const animations = Drupal.solo.animations;
  const prefersReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BREAKPOINTS = {
    XS: 576,
    SM: 768,
    MD: 992,
    LG: 1200,
    XL: 1400
  };

  const SELECTORS = {
    PAGE_WRAPPER: '.page-wrapper',
    SOLO_MENUS: '.solo-inner nav ul:not(.field ul)',
    SOLO_MENUS_ALL: '.solo-inner nav ul', // For filtering approach
    FILE_UPLOAD_WRAPPER: '.solo-file-upload-wrapper',
    FILE_INPUT: '.solo-file-native',
    FILE_NAME: '.solo-file-name',
    SEARCH_DETAILS: '.search-form details.search-advanced',
    DETAILS_WRAPPER: '.details-wrapper'
  };

  // Store active animations for cleanup
  const activeAnimations = new WeakMap();

  /**
   * CSS styles for collapsed state.
   * @const {Object}
   */
  const cssStyles = {
    overflow: 'hidden',
    height: '0',
    paddingTop: '0',
    paddingBottom: '0',
    marginTop: '0',
    marginBottom: '0'
  };

  /**
   * Removes inline styles from an element.
   * @param {HTMLElement} target - The target element.
   */
  const removeStyles = (target) => {
    if (!target || !(target instanceof HTMLElement)) {
      console.warn('Solo: Invalid target element provided to removeStyles');
      return;
    }

    // Hyphenated property names for removeProperty()
    const props = ['height','padding-top','padding-bottom','margin-top','margin-bottom', 'overflow','transition-duration','transition-property','transition-timing-function','box-sizing'];

    try {
      props.forEach((p) => target.style.removeProperty(p));
    } catch (error) {
      console.error('Solo: Error removing styles', error);
    }
  };
  Drupal.solo.removeStyles = removeStyles;

  /**
   * Updates tabindex for menu items based on state.
   * Uses state manager for coordination.
   * @param {HTMLElement} target - The target container element.
   * @param {boolean} isOpen - Whether the menu is open.
   * @param {string} componentName - The component making the change.
   */
  const updateTabindex = (target, isOpen, componentName = 'utils') => {
    if (!target || !(target instanceof HTMLElement)) {
      return;
    }

    try {
      if (Drupal.solo.menuState) {
        Drupal.solo.menuState.updateMenuTabindex(target, isOpen, componentName);
      } else {
        // Fallback for backward compatibility
        const firstLevelItems = target.querySelectorAll(':scope > li > a, :scope > li > button');
        firstLevelItems.forEach(item => {
          item.setAttribute('tabindex', isOpen ? '0' : '-1');
        });
      }
    } catch (error) {
      console.error('Solo: Error updating tabindex', error);
    }
  };

  /**
   * Clears animation timeout for an element.
   * @param {HTMLElement} element - The element with active animation.
   */
  const clearAnimationTimeout = (element) => {
    const timeoutId = activeAnimations.get(element);
    if (timeoutId) {
      clearTimeout(timeoutId);
      activeAnimations.delete(element);
    }
  };

  /**
   * Slides up an element with animation.
   * @param {HTMLElement} target - The target element to slide up.
   * @param {number} [duration=600] - Animation duration in milliseconds.
   * @param {string} [componentName='utils'] - The component making the change.
   * @returns {boolean} Success status.
   */
  const slideUp = (target, duration = animations.slideUp, componentName = 'utils') => {
    if (!target || !(target instanceof HTMLElement)) {
      console.warn('Solo: Invalid target element provided to slideUp');
      return false;
    }

    // Clear any existing animation
    clearAnimationTimeout(target);

    if (prefersReducedMotion()) {
      target.classList.remove('toggled');
      if (Drupal.solo.menuState) {
        Drupal.solo.menuState.setHidden(target, false, componentName);
      } else {
        target.setAttribute('aria-hidden', 'true');
      }
      updateTabindex(target, false, componentName);
      target.style.display = 'none';
      removeStyles(target);
      Drupal.announce(Drupal.t('Content collapsed'));
      return true;
    }

    try {
      // Set transition properties
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = `${duration}ms`;
      target.style.transitionTimingFunction = 'ease-in-out';
      target.style.boxSizing = 'border-box';
      target.style.height = `${target.offsetHeight}px`;

      // Force reflow
      void target.offsetHeight;

      // Update classes and ARIA using state manager
      target.classList.remove('toggled');
      if (Drupal.solo.menuState) {
        Drupal.solo.menuState.setHidden(target, false, componentName);
      } else {
        target.setAttribute('aria-hidden', 'true');
      }
      updateTabindex(target, false, componentName);

      // Apply collapsed styles
      Object.keys(cssStyles).forEach(style => {
        target.style[style] = cssStyles[style];
      });

      // Cleanup after animation
      const timeoutId = setTimeout(() => {
        if (target && target.parentNode) {
          target.style.display = 'none';
          removeStyles(target);
          activeAnimations.delete(target);
          // Announce after animation completes to avoid timing issues
          Drupal.announce(Drupal.t('Content collapsed'));
        }
      }, duration);

      activeAnimations.set(target, timeoutId);
      return true;
    } catch (error) {
      console.error('Solo: Error in slideUp animation', error);
      return false;
    }
  };
  Drupal.solo.slideUp = slideUp;

  /**
   * Slides down an element with animation.
   * @param {HTMLElement} target - The target element to slide down.
   * @param {number} [duration=600] - Animation duration in milliseconds.
   * @param {string} [menuDisplay='block'] - Display value when shown.
   * @param {string} [componentName='utils'] - The component making the change.
   * @returns {boolean} Success status.
   */
  const slideDown = (target, duration = animations.slideDown, menuDisplay = 'block', componentName = 'utils') => {
    if (!target || !(target instanceof HTMLElement)) {
      console.warn('Solo: Invalid target element provided to slideDown');
      return false;
    }

    // Clear any existing animation
    clearAnimationTimeout(target);

    if (prefersReducedMotion()) {
      target.style.display = menuDisplay;
      target.classList.add('toggled');
      if (Drupal.solo.menuState) {
        Drupal.solo.menuState.setAriaAttribute(target, 'aria-hidden', 'false', componentName);
      } else {
        target.setAttribute('aria-hidden', 'false');
      }
      updateTabindex(target, true, componentName);
      removeStyles(target);
      Drupal.announce(Drupal.t('Content expanded'));
      return true;
    }

    try {
      target.style.removeProperty('display');
      let currentDisplay = window.getComputedStyle(target).display;

      if (currentDisplay === 'none') {
        currentDisplay = menuDisplay;
      }

      target.style.display = menuDisplay;
      let height = target.offsetHeight;
      height = Math.round(height);

      // Apply collapsed styles first
      Object.keys(cssStyles).forEach(style => {
        target.style[style] = cssStyles[style];
      });

      // Force reflow
      void target.offsetHeight;

      // Set transition properties
      target.style.boxSizing = 'border-box';
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = `${duration}ms`;
      target.style.transitionTimingFunction = 'ease-in-out';
      target.style.height = `${height}px`;

      // Update classes and ARIA using state manager
      target.classList.add('toggled');
      if (Drupal.solo.menuState) {
        Drupal.solo.menuState.setAriaAttribute(target, 'aria-hidden', 'false', componentName);
      } else {
        target.setAttribute('aria-hidden', 'false');
      }
      updateTabindex(target, true, componentName);

      // Remove padding and margin restrictions
      ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom'].forEach(property => {
        target.style.removeProperty(property);
      });

      // Cleanup after animation
      const timeoutId = setTimeout(() => {
        if (target && target.parentNode) {
          ['height', 'overflow', 'transition-duration', 'transition-property', 'transition-timing-function', 'box-sizing'].forEach(property =>
            target.style.removeProperty(property));
          activeAnimations.delete(target);
          // Announce after animation completes to avoid timing issues
          Drupal.announce(Drupal.t('Content expanded'));
        }
      }, duration);

      activeAnimations.set(target, timeoutId);
      return true;
    } catch (error) {
      console.error('Solo: Error in slideDown animation', error);
      return false;
    }
  };
  Drupal.solo.slideDown = slideDown;

  /**
   * Toggles slide animation on an element.
   * @param {HTMLElement} target - The target element to toggle.
   * @param {number} [duration=500] - Animation duration in milliseconds.
   * @param {string} [componentName='utils'] - The component making the change.
   * @returns {boolean} Success status.
   */
  const slideToggle = (target, duration = animations.slideUp, componentName = 'utils') => {
    if (!target || !(target instanceof HTMLElement)) {
      console.warn('Solo: Invalid target element provided to slideToggle');
      return false;
    }

    // Prevent rapid toggling during animation
    if (activeAnimations.has(target)) {
      return false;
    }

    if (!target.classList.contains('toggled')) {
      return slideDown(target, duration, 'flex', componentName);
    } else {
      return slideUp(target, duration, componentName);
    }
  };
  Drupal.solo.slideToggle = slideToggle;

  /**
   * Gets the current viewport width.
   * Uses state manager if available for consistency.
   * @returns {number} Current width in pixels.
   */
  const getCurrentWidth = () => {
    if (Drupal.solo.menuState) {
      return Drupal.solo.menuState.getCurrentWidth();
    }
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
  };

  /**
   * Calculates the depth of a menu element.
   * @param {HTMLElement} element - The menu element.
   * @returns {number} The depth level (starts at 1).
   */
  const calculateDepth = (element) => {
    if (!element || !(element instanceof HTMLElement)) {
      return 1;
    }

    let depth = 1;
    let parent = element.parentElement;

    while (parent) {
      if (parent.tagName.toLowerCase() === 'ul') {
        depth++;
      }
      parent = parent.parentElement;
    }

    return depth;
  };
  Drupal.solo.calculateDepth = calculateDepth;

  /**
   * Adds depth-based classes to menu elements.
   * @param {HTMLElement} element - The menu element.
   * @param {number} depth - The depth level.
   */
  const addClassAccordingToDepth = (element, depth) => {
    if (!element || !(element instanceof HTMLElement)) {
      return;
    }

    try {
      element.classList.add(`ul-${depth}`);

      const children = element.children;
      for (let i = 0; i < children.length; i++) {
        if (children[i] instanceof HTMLElement) {
          children[i].classList.add(`li-${depth}`);
        }
      }
    } catch (error) {
      console.error('Solo: Error adding depth classes', error);
    }
  };

  /**
   * Gets breakpoint value from element classes.
   * @param {HTMLElement} element - The element to check.
   * @param {string} mn - The breakpoint prefix.
   * @returns {number} The breakpoint value in pixels.
   */
  const getMyBreakpoints = (element, mn) => {
    if (!element || !(element instanceof HTMLElement)) {
      return BREAKPOINTS.MD; // Default breakpoint
    }

    const classes = [
      `${mn}-${BREAKPOINTS.XS}`,
      `${mn}-${BREAKPOINTS.SM}`,
      `${mn}-${BREAKPOINTS.MD}`,
      `${mn}-${BREAKPOINTS.LG}`,
      `${mn}-${BREAKPOINTS.XL}`
    ];

    const classList = Array.from(element.classList);
    const foundClass = classList.find(c => classes.includes(c));

    if (foundClass) {
      const parts = foundClass.split('-');
      const value = parseInt(parts[parts.length - 1], 10);
      return isNaN(value) ? BREAKPOINTS.MD : value;
    }

    return BREAKPOINTS.MD;
  };
  Drupal.solo.getMyBreakpoints = getMyBreakpoints;

  /**
   * Get breakpoint number based on the specified class and breakpoint prefix.
   * @param {string} [breakpointPrefix='mn'] - The prefix for the breakpoint.
   * @returns {number} The numeric breakpoint value.
   */
  Drupal.solo.getBreakpointNumber = (breakpointPrefix = 'mn') => {
    const pageClass = document.querySelector(SELECTORS.PAGE_WRAPPER);
    if (!pageClass) {
      console.warn('Solo: Page wrapper element not found');
      return BREAKPOINTS.MD;
    }
    return Drupal.solo.getMyBreakpoints(pageClass, breakpointPrefix);
  };

  /**
   * Determines the current layout based on breakpoints.
   * @returns {string} 'large' if layout is large, 'small' otherwise.
   */
  const getLayout = () => {
    const pageClass = document.querySelector(SELECTORS.PAGE_WRAPPER);
    if (!pageClass) {
      console.warn('Solo: Page wrapper element not found');
      return 'small';
    }

    const brNum = Drupal.solo.getMyBreakpoints(pageClass, 'mn');
    const currentWidth = getCurrentWidth();

    return currentWidth > brNum ? 'large' : 'small';
  };
  Drupal.solo.getLayout = getLayout;

  /**
   * Drupal behavior to add classes based on menu depth.
   */
  Drupal.behaviors.soloMenuDepth = {
    attach: (context, settings) => {
      try {
        // Option 1: Use the :not() selector (default)
        const allMenus = once('soloMenuDepth', SELECTORS.SOLO_MENUS_ALL, context);
        const menus = allMenus.filter((menu) => !menu.closest('.field'));

        menus.forEach((element) => {
          const depth = calculateDepth(element);
          addClassAccordingToDepth(element, depth);
        });
      } catch (error) {
        console.error('Solo: Error in soloMenuDepth behavior', error);
      }
    },
    detach: (context, settings, trigger) => {
      if (trigger === 'unload') {
        try {
          const allProcessed = once.filter('soloMenuDepth', SELECTORS.SOLO_MENUS_ALL, context);
          const processedMenus = allProcessed.filter((menu) => !menu.closest('.field'));

          processedMenus.forEach((element) => {
            Array.from(element.classList).forEach((cn) => {
              if (/^ul-\d+$/.test(cn)) element.classList.remove(cn);
            });
            Array.from(element.children).forEach((child) => {
              if (child instanceof HTMLElement) {
                Array.from(child.classList).forEach((cn) => {
                  if (/^li-\d+$/.test(cn)) child.classList.remove(cn);
                });
              }
            });
          });

          once.remove('soloMenuDepth', SELECTORS.SOLO_MENUS_ALL, context);
        } catch (error) {
          console.error('Solo: Error in soloMenuDepth detach', error);
        }
      }
    }

  };

  /**
   * Drupal behavior for file upload enhancement.
   */
  Drupal.behaviors.soloFileUpload = {
    handlers: new WeakMap(),

    attach(context) {
      try {
        const wrappers = once('solo-file-upload', SELECTORS.FILE_UPLOAD_WRAPPER, context);

        wrappers.forEach(wrapper => {
          const input = wrapper.querySelector(SELECTORS.FILE_INPUT);
          const fileName = wrapper.querySelector(SELECTORS.FILE_NAME);

          if (!input || !fileName) {
            console.warn('Solo: File upload elements not found in wrapper');
            return;
          }

          const handler = (event) => {
            try {
              if (input.files && input.files.length > 0) {
                const file = input.files[0];
                fileName.textContent = file.name;
                // Announce file selection to screen readers
                Drupal.announce(Drupal.t('File selected: @filename', {'@filename': file.name}));
              } else {
                fileName.textContent = Drupal.t('No file chosen');
              }
            } catch (error) {
              console.error('Solo: Error handling file selection', error);
              fileName.textContent = Drupal.t('Error selecting file');
            }
          };

          // Store handler reference for cleanup
          this.handlers.set(input, handler);
          input.addEventListener('change', handler);
        });
      } catch (error) {
        console.error('Solo: Error in soloFileUpload behavior', error);
      }
    },

    detach(context, settings, trigger) {
      if (trigger === 'unload') {
        try {
          const wrappers = once.filter('solo-file-upload', SELECTORS.FILE_UPLOAD_WRAPPER, context);

          wrappers.forEach(wrapper => {
            const input = wrapper.querySelector(SELECTORS.FILE_INPUT);
            if (input) {
              const handler = this.handlers.get(input);
              if (handler) {
                input.removeEventListener('change', handler);
                this.handlers.delete(input);
              }
            }
          });

          once.remove('solo-file-upload', SELECTORS.FILE_UPLOAD_WRAPPER, context);
        } catch (error) {
          console.error('Solo: Error in soloFileUpload detach', error);
        }
      }
    }
  };

  /**
   * Drupal behavior for search form animation.
   */
  Drupal.behaviors.soloSearchAnimation = {
    handlers: new WeakMap(),

    attach: (context, settings) => {
      const behavior = Drupal.behaviors.soloSearchAnimation; // capture

      try {
        const detailsElements = once('soloDetailsAnimation', SELECTORS.SEARCH_DETAILS, context);
        detailsElements?.forEach((detail) => {
          const wrapper = detail.querySelector(SELECTORS.DETAILS_WRAPPER);
          if (!wrapper) {
            console.warn('Solo: Details wrapper not found');
            return;
          }

          // Always ensure transition is defined (whether open or closed initially)
          wrapper.style.transition = 'height 0.3s ease-in-out, opacity 0.3s ease-in-out';

          // Initial state
          if (!detail.open) {
            wrapper.style.height = '0';
            wrapper.style.opacity = '0';
            wrapper.style.overflow = 'hidden';
          } else {
            // Ensure we don't end up with "auto" + no transition on first toggle.
            wrapper.style.overflow = 'hidden';
            wrapper.style.height = 'auto';
            wrapper.style.opacity = '1';
          }

          const transitionEndHandler = (event) => {
            if (event.target === wrapper && detail.open) {
              wrapper.style.height = 'auto';
            }
          };

          const toggleHandler = () => {
            try {
              if (detail.open) {
                const contentHeight = wrapper.scrollHeight + 'px';
                // From 0 -> actual height
                wrapper.style.height = contentHeight;
                wrapper.style.opacity = '1';
                // Defer announcement to avoid timing conflicts
                setTimeout(() => {
                  Drupal.announce(Drupal.t('Search options expanded'));
                }, 100);
                wrapper.addEventListener('transitionend', transitionEndHandler, { once: true });
              } else {
                // From current height -> 0
                wrapper.style.height = wrapper.scrollHeight + 'px';
                requestAnimationFrame(() => {
                  wrapper.style.height = '0';
                  wrapper.style.opacity = '0';
                });
                // Defer announcement to avoid timing conflicts
                setTimeout(() => {
                  Drupal.announce(Drupal.t('Search options collapsed'));
                }, 100);
              }
            } catch (error) {
              console.error('Solo: Error in search animation', error);
            }
          };

          // Store handlers for cleanup
          behavior.handlers.set(detail, { toggleHandler, transitionEndHandler });
          detail.addEventListener('toggle', toggleHandler);
        });
      } catch (error) {
        console.error('Solo: Error in soloSearchAnimation behavior', error);
      }
    },

    detach: (context, settings, trigger) => {
      if (trigger === 'unload') {
        const behavior = Drupal.behaviors.soloSearchAnimation;

        try {
          const detailsElements = once.filter('soloDetailsAnimation', SELECTORS.SEARCH_DETAILS, context);
          detailsElements?.forEach((detail) => {
            const handlers = behavior.handlers.get(detail);
            if (handlers) {
              detail.removeEventListener('toggle', handlers.toggleHandler);
              const wrapper = detail.querySelector(SELECTORS.DETAILS_WRAPPER);
              if (wrapper) {
                wrapper.removeEventListener('transitionend', handlers.transitionEndHandler);
              }
              behavior.handlers.delete(detail);
            }
          });
          once.remove('soloDetailsAnimation', SELECTORS.SEARCH_DETAILS, context);
        } catch (error) {
          console.error('Solo: Error in soloSearchAnimation detach', error);
        }
      }
    }
  };

  // Cleanup function for module unload
  if (typeof Drupal.solo.cleanup === 'undefined') {
    Drupal.solo.cleanup = () => {
      // Clear all active animations
      activeAnimations.forEach((timeoutId, element) => {
        clearTimeout(timeoutId);
      });
      activeAnimations.clear();
    };
  }

})(Drupal, drupalSettings, once);
