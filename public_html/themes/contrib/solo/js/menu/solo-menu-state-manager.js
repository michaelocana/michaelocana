/**
 * @file
 * Solo Menu State Manager - Centralized state and conflict resolution
 *
 * This module provides centralized state management and coordination
 * between different Solo menu components to prevent conflicts.
 */
((Drupal, drupalSettings) => {
  'use strict';

  // Initialize Solo namespace if not exists
  Drupal.solo = Drupal.solo || {};

  /**
   * Centralized State Manager for Solo Menus
   */
  Drupal.solo.menuState = {
    // Track active components
    activeComponents: new Set(),

    // Track resize handlers
    resizeHandlers: new Map(),
    resizeTimeout: null,

    // Track ARIA states
    ariaStates: new Map(),

    // Track tabindex states
    tabindexStates: new Map(),

    activeOperations: new Map(),

    // Screen size cache
    screenSize: {
      width: 0,
      breakpoint: null,
      isSmallScreen: false
    },

    /**
     * Register a component
     */
    registerComponent(componentName, component) {
      this.activeComponents.add(componentName);
      // console.log(`Solo Menu: Registered component ${componentName}`);
    },

    /**
     * Unregister a component
     */
    unregisterComponent(componentName) {
      this.activeComponents.delete(componentName);
      this.resizeHandlers.delete(componentName);
    },

    /**
     * Get current width (single source of truth)
     */
    getCurrentWidth() {
      return window.innerWidth ||
             document.documentElement.clientWidth ||
             document.body.clientWidth ||
             0;
    },

    /**
     * Update screen size cache
     */
    updateScreenSize() {
      const pageWrapper = document.querySelector('.page-wrapper');
      if (!pageWrapper) return;

      this.screenSize.width = this.getCurrentWidth();
      this.screenSize.breakpoint = Drupal.solo.getMyBreakpoints(pageWrapper, 'mn');
      this.screenSize.isSmallScreen = this.screenSize.width <= this.screenSize.breakpoint;
    },

    /**
     * Add resize handler with deduplication
     */
    addResizeHandler(componentName, handler, delay = 250) {
      this.resizeHandlers.set(componentName, { handler, delay });

      // Remove existing global handler
      if (this.globalResizeHandler) {
        window.removeEventListener('resize', this.globalResizeHandler);
      }

      // Create new debounced global handler
      this.globalResizeHandler = () => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          this.updateScreenSize();

          // Call all registered handlers
          this.resizeHandlers.forEach(({ handler }) => {
            try {
              handler(this.screenSize);
            } catch (error) {
              console.error('Solo Menu: Error in resize handler', error);
            }
          });
        }, Math.max(...Array.from(this.resizeHandlers.values()).map(h => h.delay)));
      };

      window.addEventListener('resize', this.globalResizeHandler);
    },

    /**
     * Set ARIA attribute with conflict resolution
     */
    setAriaAttribute(element, attribute, value, componentName) {
      if (!element || !(element instanceof HTMLElement)) return;

      const key = `${element.id || element.className}-${attribute}`;
      const currentOwner = this.ariaStates.get(key);

      // Log conflicts for debugging (only in dev mode)
      if (currentOwner && currentOwner !== componentName && drupalSettings?.solo?.debug) {
        console.debug(`Solo Menu: ARIA conflict - ${attribute} on element, current: ${currentOwner}, new: ${componentName}`);
      }

      // Set the attribute and track ownership
      element.setAttribute(attribute, value);
      this.ariaStates.set(key, componentName);

      // Notify other components of the change
      this.notifyAriaChange(element, attribute, value, componentName);
    },

    /**
     * Simplified ARIA expanded helper
     */
    setExpanded(element, isExpanded, componentName = 'unknown') {
      this.setAriaAttribute(element, 'aria-expanded', isExpanded ? 'true' : 'false', componentName);
    },

    /**
     * Simplified ARIA hidden helper
     */
    setHidden(element, isHidden, componentName = 'unknown') {
      this.setAriaAttribute(element, 'aria-hidden', isHidden ? 'true' : 'false', componentName);
    },

    /**
     * Set tabindex with conflict resolution
     */
    setTabindex(element, value, componentName) {
      if (!element || !(element instanceof HTMLElement)) return;

      const key = element.id || element.className || element.tagName;
      const currentState = this.tabindexStates.get(key);

      // Priority rules
      const priorities = {
        'keyboard': 3,  // Keyboard navigation has highest priority
        'mobile': 2,
        'sidebar': 2,
        'default': 1
      };

      const currentPriority = currentState ? priorities[currentState.component] || 1 : 0;
      const newPriority = priorities[componentName] || 1;

      // Only update if new component has equal or higher priority
      if (newPriority >= currentPriority) {
        element.setAttribute('tabindex', value);
        this.tabindexStates.set(key, {
          component: componentName,
          value: value,
          timestamp: Date.now()
        });
      }
    },

    /**
     * Unified menu tabindex helper
     */
    updateMenuTabindex(container, isOpen, componentName = 'unknown') {
      if (!container) return;

      const items = container.querySelectorAll(':scope > li > a, :scope > li > button');
      items.forEach(item => {
        this.setTabindex(item, isOpen ? '0' : '-1', componentName);
      });
    },

    /**
     * Unified hide submenu helper
     */
    hideSubmenu(subMenu, componentName = 'unknown') {
      if (!subMenu) return;

      Drupal.solo.slideUp(subMenu, Drupal.solo.animations.slideUp, componentName);
      this.setHidden(subMenu, true, componentName);

      const toggler = subMenu.previousElementSibling;
      if (toggler?.classList.contains('dropdown-toggler')) {
        this.setExpanded(toggler, false, componentName);
      }
    },

    /**
     * Notify components of ARIA changes
     */
    notifyAriaChange(element, attribute, value, changedBy) {
      // Dispatch custom event for other components to listen to
      element.dispatchEvent(new CustomEvent('solo-aria-change', {
        detail: { attribute, value, changedBy },
        bubbles: true
      }));
    },

    /**
     * Get consistent menu state
     */
    getMenuState(menuElement) {
      const isOpen = menuElement.classList.contains('toggled');
      const ariaExpanded = menuElement.getAttribute('aria-expanded') === 'true';
      const ariaHidden = menuElement.getAttribute('aria-hidden') === 'false';

      // Resolve conflicts - classList.toggled is source of truth
      if (isOpen !== ariaExpanded || isOpen === ariaHidden) {
        if (drupalSettings?.solo?.debug) {
          console.debug('Solo Menu: Resolving state conflict for', menuElement);
        }
        this.setAriaAttribute(menuElement, 'aria-expanded', isOpen ? 'true' : 'false', 'state-resolver');
        this.setAriaAttribute(menuElement, 'aria-hidden', isOpen ? 'false' : 'true', 'state-resolver');
      }

      return { isOpen, ariaExpanded: isOpen, ariaHidden: !isOpen };
    },

    shouldProceedWithOperation(menuElement, componentName, operation) {
      const menuId = menuElement.id || menuElement.className;
      const activeOp = this.activeOperations.get(menuId);

      if (!activeOp) return true;

      // Priority rules (keyboard has highest priority when enabled)
      const priorities = {
        'keyboard': 4,
        'mobile': 3,
        'sidebar': 2,
        'scripts': 1,
        'main': 1,
        'repositions': 1
      };

      const currentPriority = priorities[activeOp.component] || 1;
      const newPriority = priorities[componentName] || 1;

      // Higher priority can interrupt, equal priority must wait
      return newPriority > currentPriority;
    },

    /**
     * Coordinate menu operations
     */
    coordinateMenuOperation(operation, menuElement, componentName) {
      if (!this.shouldProceedWithOperation(menuElement, componentName, operation)) {
        return; // Skip operation if lower priority
      }

      const menuId = menuElement.id || menuElement.className;
      this.activeOperations.set(menuId, {
        component: componentName,
        operation: operation,
        timestamp: Date.now()
      });

      const operations = {
        'open': () => {
          menuElement.classList.add('toggled');
          this.setAriaAttribute(menuElement, 'aria-expanded', 'true', componentName);
          this.setAriaAttribute(menuElement, 'aria-hidden', 'false', componentName);
        },
        'close': () => {
          menuElement.classList.remove('toggled');
          this.setAriaAttribute(menuElement, 'aria-expanded', 'false', componentName);
          this.setAriaAttribute(menuElement, 'aria-hidden', 'true', componentName);
        },
        'toggle': () => {
          const { isOpen } = this.getMenuState(menuElement);
          this.coordinateMenuOperation(isOpen ? 'close' : 'open', menuElement, componentName);
        }
      };

      if (operations[operation]) {
        operations[operation]();
      }

      // Clear operation after completion
      setTimeout(() => {
        if (this.activeOperations.get(menuId)?.timestamp === this.activeOperations.get(menuId)?.timestamp) {
          this.activeOperations.delete(menuId);
        }
      }, 50);
    },

    /**
     * Clean up on unload
     */
    cleanup() {
      if (this.globalResizeHandler) {
        window.removeEventListener('resize', this.globalResizeHandler);
      }
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeHandlers.clear();
      this.ariaStates.clear();
      this.tabindexStates.clear();
      this.activeComponents.clear();
    }
  };

  // Initialize screen size
  Drupal.solo.menuState.updateScreenSize();

  // Expose utility functions through state manager for consistency
  Drupal.solo.getCurrentWidth = () => Drupal.solo.menuState.getCurrentWidth();

  // Override potentially conflicting functions
  const originalHideSubMenus = Drupal.solo.hideSubMenus;
  Drupal.solo.hideSubMenus = (submenu, componentName = 'unknown') => {
    if (originalHideSubMenus) {
      originalHideSubMenus(submenu);
    }
    Drupal.solo.menuState.coordinateMenuOperation('close', submenu, componentName);
  };

  // Listen for Drupal behaviors detach
  if (window.addEventListener) {
    window.addEventListener('beforeunload', () => {
      Drupal.solo.menuState.cleanup();
    });
  }

})(Drupal, drupalSettings);
