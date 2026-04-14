/**
 * @file
 * Solo Theme - Full Opacity Animation
 *
 * Provides fade-in animation effects on scroll for elements with the
 * 'fade-inner' class. Implements smooth opacity transitions based on
 * viewport position with performance optimizations.
 *
 * Filename:     solo-full-opacity.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com
 * Refactored:   Following Drupal JavaScript best practices
 */

(function (Drupal, drupalSettings, once) {
  'use strict';

  /**
   * Solo theme opacity animation behavior.
   *
   * @namespace Drupal.behaviors.soloFullOpacity
   *
   * @prop {Function} attach
   *   Attaches the fade animation behavior to fade-inner elements.
   * @prop {Function} detach
   *   Detaches the behavior and cleans up event listeners.
   */
  Drupal.behaviors.soloFullOpacity = {
    // Store references for cleanup
    instances: new WeakMap(),

    /**
     * Attach the fade opacity behavior.
     *
     * @param {HTMLDocument|HTMLElement} context
     *   The context for attaching the behavior.
     * @param {object} settings
     *   The drupalSettings object.
     */
    attach: function (context, settings) {
      // Skip if in Layout Builder mode
      if (document.getElementById('layout-builder')) {
        return;
      }

      // Process each fade-inner container only once
      const fadeContainers = once('solo-full-opacity', '.fade-inner', context);

      if (fadeContainers.length === 0) {
        return;
      }

      // Check viewport and preferences
      const viewportCheck = this.checkViewportAndPreferences();

      // If animations should be disabled, set full opacity and exit
      if (viewportCheck.shouldDisable) {
        fadeContainers.forEach((el) => {
          el.style.opacity = '1';
          el.style.transition = 'none';
          el.classList.add('solo-full-opacity-processed');
          el.classList.add('solo-full-opacity-disabled');
        });
        return;
      }

      // Initialize the animation handler
      const animationHandler = this.createAnimationHandler(fadeContainers, viewportCheck.breakpoint);

      if (!animationHandler) {
        return;
      }

      // Store the handler instance for cleanup
      fadeContainers.forEach(element => {
        this.instances.set(element, animationHandler);
      });

      // Initial fade calculation
      animationHandler.calculateFade();

      // Attach event listeners
      window.addEventListener('scroll', animationHandler.throttledFadeCalculation, { passive: true });
      window.addEventListener('resize', animationHandler.debouncedRecalculate, { passive: true });
      window.addEventListener('load', animationHandler.debouncedRecalculate, { passive: true });

      // Add orientationchange for mobile devices
      if ('orientationchange' in window) {
        window.addEventListener('orientationchange', animationHandler.debouncedRecalculate, { passive: true });
      }
    },

    /**
     * Detach the behavior and clean up.
     *
     * @param {HTMLDocument|HTMLElement} context
     *   The context being detached.
     * @param {object} settings
     *   The drupalSettings object.
     * @param {string} trigger
     *   The trigger for the detach ('unload', 'move', 'serialize').
     */
    detach: function (context, settings, trigger) {
      if (trigger === 'unload') {
        // Find all processed elements and clean up
        const processedElements = context.querySelectorAll('.fade-inner.solo-full-opacity-processed');

        processedElements.forEach(element => {
          const handler = this.instances.get(element);
          if (handler) {
            // Remove all event listeners
            window.removeEventListener('scroll', handler.throttledFadeCalculation);
            window.removeEventListener('resize', handler.debouncedRecalculate);
            window.removeEventListener('load', handler.debouncedRecalculate);

            if ('orientationchange' in window) {
              window.removeEventListener('orientationchange', handler.debouncedRecalculate);
            }

            // Cancel any pending animations
            if (handler.animationFrame) {
              cancelAnimationFrame(handler.animationFrame);
            }

            // Disconnect IntersectionObserver if it exists
            if (handler.observer) {
              handler.observer.disconnect();
            }

            // Clean up instance reference
            this.instances.delete(element);
          }

          // Remove processed classes
          element.classList.remove('solo-full-opacity-processed', 'solo-full-opacity-disabled');
        });
      }
    },

    /**
     * Checks viewport size and user preferences.
     *
     * @return {object}
     *   Object containing shouldDisable flag and breakpoint value.
     */
    checkViewportAndPreferences: function () {
      // Get breakpoint with safe fallback
      let breakpoint = 577; // default

      try {
        if (Drupal && Drupal.solo && typeof Drupal.solo.getBreakpointNumber === 'function') {
          breakpoint = Drupal.solo.getBreakpointNumber('mn');
        }
      } catch (error) {
        // Use default if breakpoint helper fails
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('Solo theme: Could not get breakpoint, using default', error);
        }
      }

      // Check if viewport is narrow
      const isNarrow = window.matchMedia
        ? window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
        : (window.innerWidth < breakpoint);

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      return {
        shouldDisable: isNarrow || prefersReducedMotion,
        breakpoint: breakpoint,
        isNarrow: isNarrow,
        prefersReducedMotion: prefersReducedMotion
      };
    },

    /**
     * Creates an animation handler with all necessary methods.
     *
     * @param {NodeList|Array} elements
     *   The elements to animate.
     * @param {number} breakpoint
     *   The responsive breakpoint value.
     *
     * @return {object|null}
     *   The animation handler object or null if creation fails.
     */
    createAnimationHandler: function (elements, breakpoint) {
      try {
        // Configuration with sensible defaults
        const config = {
          animationHeightRatio: drupalSettings.solo?.fullOpacity?.animationHeightRatio || 0.15,
          fadeInDuration: drupalSettings.solo?.fullOpacity?.fadeInDuration || '1s',
          fadeOutDuration: drupalSettings.solo?.fullOpacity?.fadeOutDuration || '0.5s',
          throttleDelay: drupalSettings.solo?.fullOpacity?.throttleDelay || 16, // ~60fps
          debounceDelay: drupalSettings.solo?.fullOpacity?.debounceDelay || 250,
          useIntersectionObserver: drupalSettings.solo?.fullOpacity?.useIntersectionObserver !== false
        };

        // Calculate animation metrics
        let animationHeight = window.innerHeight * config.animationHeightRatio;
        let ratio = this.calculateRatio(animationHeight);
        let animationFrame = null;

        // Convert NodeList to Array for better performance
        const elementArray = Array.from(elements);

        // Cache element data for performance
        const elementCache = elementArray.map(element => {
          // Set initial opacity
          element.style.opacity = '0';
          element.classList.add('solo-full-opacity-processed');

          return {
            element: element,
            height: element.offsetHeight,
            offset: 0,
            isInViewport: false
          };
        });

        /**
         * Updates cached offsets for all elements.
         */
        const updateOffsets = () => {
          elementCache.forEach(item => {
            if (item.element.isConnected) {
              const rect = item.element.getBoundingClientRect();
              item.offset = rect.top + window.pageYOffset;
              item.height = rect.height;
            }
          });
        };

        /**
         * Calculates fade opacity for all elements.
         */
        const calculateFade = () => {
          try {
            // Cancel any pending animation frame
            if (animationFrame) {
              cancelAnimationFrame(animationFrame);
            }

            const windowBottom = window.pageYOffset + window.innerHeight;

            // Use requestAnimationFrame for smooth animations
            animationFrame = requestAnimationFrame(() => {
              const workset = (observer)
                ? elementCache.filter(i => i.isInViewport)
                : elementCache;
              workset.forEach(item => {
                if (!item.element.isConnected) {
                  return; // Skip if element is no longer in DOM
                }

                const opacity = this.calculateOpacity(
                  item.offset,
                  windowBottom,
                  animationHeight,
                  ratio
                );

                const transition = opacity === 1
                  ? `opacity ${config.fadeInDuration} linear`
                  : `opacity ${config.fadeOutDuration} linear`;

                // Only update if values have changed to avoid reflows
                if (item.element.style.opacity !== String(opacity)) {
                  if (item.element.style.transition !== transition) {
                    item.element.style.transition = transition;
                  }
                  item.element.style.opacity = String(opacity);
                }
              });
            });
          } catch (error) {
            if (typeof console !== 'undefined' && console.error) {
              console.error('Solo theme: Error calculating fade opacity', error);
            }
          }
        };

        /**
         * Checks if animations should be disabled and handles the transition.
         */
        const checkAndToggleAnimations = () => {
          const viewportCheck = this.checkViewportAndPreferences();

          if (viewportCheck.shouldDisable) {
            // Disable animations - set all elements to full opacity
            elementCache.forEach(item => {
              if (item.element.isConnected) {
                item.element.style.transition = 'opacity 0.3s ease';
                item.element.style.opacity = '1';
                item.element.classList.add('solo-full-opacity-disabled');
              }
            });
            return false; // Animations disabled
          } else {
            // Re-enable animations if they were disabled
            elementCache.forEach(item => {
              if (item.element.isConnected && item.element.classList.contains('solo-full-opacity-disabled')) {
                item.element.classList.remove('solo-full-opacity-disabled');
              }
            });
            return true; // Animations enabled
          }
        };

        /**
         * Recalculates animation metrics on resize.
         */
        const recalculate = () => {
          // Check if animations should be active
          if (!checkAndToggleAnimations()) {
            return; // Exit if animations are disabled
          }

          animationHeight = window.innerHeight * config.animationHeightRatio;
          ratio = this.calculateRatio(animationHeight);
          updateOffsets();
          calculateFade();
        };

        // Create throttled and debounced versions
        const throttledFadeCalculation = this.throttle(calculateFade, config.throttleDelay);

        const debouncedRecalculate = this.debounce(recalculate, config.debounceDelay);

        // Initial setup
        updateOffsets();

        // Use IntersectionObserver if available and enabled
        let observer = null;
        if (config.useIntersectionObserver && 'IntersectionObserver' in window) {
          try {
            observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                const cacheItem = elementCache.find(item => item.element === entry.target);
                if (cacheItem) {
                  cacheItem.isInViewport = entry.isIntersecting;
                }
              });
              // Only calculate fade for visible elements
              calculateFade();
            }, {
              rootMargin: `${animationHeight}px 0px ${animationHeight}px 0px`,
              threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
            });

            // Observe all elements
            elementCache.forEach(item => {
              observer.observe(item.element);
            });
          } catch (error) {
            // Fallback to scroll-based detection
            observer = null;
          }
        }

        return {
          calculateFade: calculateFade,
          throttledFadeCalculation: throttledFadeCalculation,
          debouncedRecalculate: debouncedRecalculate,
          updateOffsets: updateOffsets,
          animationFrame: animationFrame,
          observer: observer
        };

      } catch (error) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('Solo theme: Failed to create animation handler', error);
        }
        return null;
      }
    },

    /**
     * Calculates the ratio for opacity transitions.
     *
     * @param {number} animationHeight
     *   The height of the animation zone.
     *
     * @return {number}
     *   The calculated ratio.
     */
    calculateRatio: function (animationHeight) {
      // Prevent division by zero
      if (animationHeight <= 0) {
        return 0;
      }
      return Math.round((1 / animationHeight) * 10000) / 10000;
    },

    /**
     * Calculates opacity based on element position.
     *
     * @param {number} objectTop
     *   The top position of the object.
     * @param {number} windowBottom
     *   The bottom position of the viewport.
     * @param {number} animationHeight
     *   The height of the animation zone.
     * @param {number} ratio
     *   The opacity change ratio.
     *
     * @return {number}
     *   The calculated opacity (0-1).
     */
    calculateOpacity: function (objectTop, windowBottom, animationHeight, ratio) {
      // Element is above the animation zone - fully visible
      if (objectTop < windowBottom - animationHeight) {
        return 1;
      }

      // Element is below the viewport - hidden
      if (objectTop >= windowBottom) {
        return 0;
      }

      // Element is in the animation zone - calculate opacity
      const opacity = (windowBottom - objectTop) * ratio;

      // Clamp between 0 and 1
      return Math.max(0, Math.min(1, opacity));
    },

    /**
     * Throttle function to limit execution frequency.
     *
     * @param {Function} func
     *   The function to throttle.
     * @param {number} delay
     *   The throttle delay in milliseconds.
     *
     * @return {Function}
     *   The throttled function.
     */
    throttle: function (func, delay) {
      let timeoutId;
      let lastExecTime = 0;

      return function throttled() {
        const context = this;
        const args = arguments;
        const currentTime = Date.now();

        const execute = () => {
          lastExecTime = Date.now();
          func.apply(context, args);
        };

        const remaining = delay - (currentTime - lastExecTime);

        clearTimeout(timeoutId);

        if (remaining <= 0 || remaining > delay) {
          execute();
        } else {
          timeoutId = setTimeout(execute, remaining);
        }
      };
    },

    /**
     * Debounce function to delay execution until after wait period.
     *
     * @param {Function} func
     *   The function to debounce.
     * @param {number} wait
     *   The debounce delay in milliseconds.
     *
     * @return {Function}
     *   The debounced function.
     */
    debounce: function (func, wait) {
      let timeoutId;

      return function debounced() {
        const context = this;
        const args = arguments;

        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          func.apply(context, args);
        }, wait);
      };
    }
  };

})(Drupal, drupalSettings, once);
