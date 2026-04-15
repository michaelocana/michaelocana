/**
 * @file
 * Solo Menu Mobile - Refactored with State Manager
 *
 * Filename:     solo-menu-mobile.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal, drupalSettings, once) => {
  'use strict';

  // Component name for state manager
  const COMPONENT_NAME = 'mobile';

  let currentLayout = Drupal.solo.getLayout();
  let previousLayout = currentLayout;
  const animations = Drupal.solo.animations;

  // Register component with state manager
  if (Drupal.solo.menuState) {
    Drupal.solo.menuState.registerComponent(COMPONENT_NAME, {
      name: 'Solo Mobile Menu',
      version: '1.0'
    });
  }

  const brNum = Drupal.solo.getBreakpointNumber('mn');

  /**
   * Gets the current window width using state manager
   * @returns {number} Current window width
   */
  const getCurrentWidth = () => Drupal.solo.menuState.getCurrentWidth();


  /**
   * Updates tabindex of first-level menu items using state manager
   * @param {HTMLElement} menuElement - The menu element
   * @param {string} tabindexValue - The tabindex value to set
   */
  const updateFirstLevelTabindex = (menuElement, tabindexValue) => {
    if (!menuElement) return;
    const isOpen = tabindexValue === '0';
    Drupal.solo.menuState.updateMenuTabindex(menuElement.querySelector('ul.navigation__responsive'), isOpen, COMPONENT_NAME);
  };

  /**
   * Updates aria-hidden attribute using state manager
   * @param {HTMLElement} menuElement - The menu element
   * @param {string} hiddenValue - The aria-hidden value
   */
  const updateAriaHidden = (menuElement, hiddenValue) => {
    if (!menuElement) return;
    Drupal.solo.menuState.setHidden(menuElement, hiddenValue === 'true', COMPONENT_NAME);
  };

  /**
   * Opens the mobile menu with coordinated state
   * @param {string} navTagId - The navigation element ID
   */
  const openMobileMenu = navTagId => {
    const navigationMenubarClass = Drupal.solo.getNavigationMenubarClass(navTagId);
    const subMenuClasses = Drupal.solo.getSubMenuClasses(navTagId);

    subMenuClasses?.forEach((subMenu) => {
      Drupal.solo.hideSubMenus(subMenu, COMPONENT_NAME);
      Drupal.solo.revertIcons(navTagId);
    });

    // Use state manager for coordinated open if available
    if (Drupal.solo.menuState && navigationMenubarClass) {
      Drupal.solo.menuState.coordinateMenuOperation('open', navigationMenubarClass, COMPONENT_NAME);
    }

    Drupal.solo.slideDown(navigationMenubarClass, animations.slideDown, 'block', COMPONENT_NAME);

    const menuElement = document.getElementById(navTagId);
    if (menuElement) {
      updateAriaHidden(menuElement, 'false');
      updateFirstLevelTabindex(menuElement, '0');
    }
  };

  /**
   * Closes the mobile menu with coordinated state
   * @param {string} navTagId - The navigation element ID
   */
  const closeMobileMenu = navTagId => {
    const navigationMenubarClass = Drupal.solo.getNavigationMenubarClass(navTagId);
    const subMenuClasses = Drupal.solo.getSubMenuClasses(navTagId);

    subMenuClasses?.forEach((subMenu) => {
      Drupal.solo.hideSubMenus(subMenu, COMPONENT_NAME);
      Drupal.solo.revertIcons(navTagId);
    });

    // Use state manager for coordinated close if available
    if (Drupal.solo.menuState && navigationMenubarClass) {
      Drupal.solo.menuState.coordinateMenuOperation('close', navigationMenubarClass, COMPONENT_NAME);
    }

    Drupal.solo.slideUp(navigationMenubarClass, animations.slideDown, COMPONENT_NAME);

    const menuElement = document.getElementById(navTagId);
    if (menuElement) {
      updateAriaHidden(menuElement, 'true');
      updateFirstLevelTabindex(menuElement, '-1');
    }
  };

  /**
   * Gets mobile navigation type information
   * @param {HTMLElement} hamburgerIcon - The hamburger icon element
   * @returns {Array} Array containing [hamburgerIconChild, navTagId, menuElement]
   */
  const getMobileNavType = (hamburgerIcon) => {
    if (!hamburgerIcon) return [null, null, null];

    const hamburgerIconChild = hamburgerIcon;
    const navElement = hamburgerIcon.closest('nav');

    if (!navElement) {
      console.warn('Navigation element not found for hamburger icon');
      return [hamburgerIconChild, null, null];
    }

    const navTagId = navElement.id;
    const menuElement = document.getElementById(navTagId);

    return [hamburgerIconChild, navTagId, menuElement];
  };

  /**
   * Handles hamburger icon click with state coordination
   * @param {HTMLElement} hamburgerIcon - The hamburger icon element
   */
  const hamburgerIconIsClicked = (hamburgerIcon) => {
    const [hamburgerIconChild, navTagId] = getMobileNavType(hamburgerIcon);

    if (!navTagId) return;

    // Get menu state - prefer state manager if available
    const navigationMenubar = document.querySelector(`#${navTagId} .navigation__menubar`);
    if (!navigationMenubar) return;

    let isOpen = false;
    if (Drupal.solo.menuState) {
      const state = Drupal.solo.menuState.getMenuState(navigationMenubar);
      isOpen = state.isOpen;
    } else {
      isOpen = navigationMenubar.classList.contains('toggled');
    }

    if (!isOpen) {
      // Update button state using state manager if available
      if (hamburgerIconChild) {
        Drupal.solo.menuState.setExpanded(hamburgerIconChild, true, COMPONENT_NAME);
      }
      hamburgerIcon.classList.add('toggled');
      openMobileMenu(navTagId);
    } else {
      // Update button state using state manager if available
      if (hamburgerIconChild) {
        Drupal.solo.menuState.setExpanded(hamburgerIconChild, false, COMPONENT_NAME);
      }
      hamburgerIcon.classList.remove('toggled');
      closeMobileMenu(navTagId);
    }
  };

  /**
   * Adds aria-controls attribute to button
   * @param {HTMLElement} hamburgerIcon - The hamburger icon element
   */
  const addAriaControlToButton = (hamburgerIcon) => {
    const [hamburgerIconChild, navTagId] = getMobileNavType(hamburgerIcon);

    if (!navTagId || !hamburgerIconChild) return;

    const ariaControl = document.querySelector(
      `#${navTagId} .navigation__responsive`)?.getAttribute('id');

    if (ariaControl) {
      const currentWidth = getCurrentWidth();

      if (currentWidth <= brNum) {
        Drupal.solo.menuState.setAriaAttribute(hamburgerIconChild, 'aria-controls', ariaControl, COMPONENT_NAME);
      } else {
        hamburgerIconChild.removeAttribute('aria-controls');
      }
    }
  };

  /**
   * Updates hamburger button tabindex based on screen size
   * @param {NodeList|Array} hamburgerIcons - Collection of hamburger icons
   */
  const updateHamburgerTabindex = (hamburgerIcons) => {
    const currentWidth = getCurrentWidth();
    hamburgerIcons.forEach(button => {
      Drupal.solo.menuState.setTabindex(button, currentWidth <= brNum ? '0' : '-1', COMPONENT_NAME);
    });
  };
  /**
   * Updates tabindex for large screens
   */
  const updateTabindexForLargeScreens = () => {
    const currentWidth = getCurrentWidth();

    if (currentWidth > brNum) {
      const menuElement = document.querySelector('.navigation__responsive');
      if (menuElement) {
        updateFirstLevelTabindex(menuElement, '0');
        updateAriaHidden(menuElement, 'false');
      }
    }
  };

  /**
   * Closes menu on resize
   * @param {HTMLElement} hamburgerIcon - The hamburger icon element
   */
  const closeOnResize = (hamburgerIcon) => {
    const [hamburgerIconChild, navTagId] = getMobileNavType(hamburgerIcon);

    if (!navTagId) return;

    if (hamburgerIconChild) {
      Drupal.solo.menuState.setExpanded(hamburgerIconChild, false, COMPONENT_NAME);
    }

    hamburgerIcon.classList.remove('toggled');
    closeMobileMenu(navTagId);
  };

  /**
   * Resets all menus on resize
   * @param {NodeList|Array} hamburgerIcons - Collection of hamburger icons
   */
  const resetMenusOnResize = (hamburgerIcons) => {
    hamburgerIcons?.forEach((hamburgerIcon) => {
      closeOnResize(hamburgerIcon);
    });
  };

  /**
   * Processes hamburger icons to add aria controls
   * @param {NodeList|Array} hamburgerIcons - Collection of hamburger icons
   */
  function processHamburgerIcons(hamburgerIcons) {
    hamburgerIcons.forEach((hamburgerIcon) => {
      addAriaControlToButton(hamburgerIcon);
    });
  }

  /**
   * Updates all menu states (consolidates common operations)
   * @param {NodeList|Array} hamburgerIcons - Collection of hamburger icons
   */
  function updateMenuStates(hamburgerIcons) {
    processHamburgerIcons(hamburgerIcons);
    updateHamburgerTabindex(hamburgerIcons);
    updateTabindexForLargeScreens();
  }

  /**
   * Creates resize handler
   * @param {NodeList|Array} hamburgerIcons - Collection of hamburger icons
   * @returns {Function} Resize handler
   */
  function createResizeHandler(hamburgerIcons) {
    return (screenInfo) => {
      currentLayout = Drupal.solo.getLayout();

      // Use screenInfo from state manager if available
      const isSmallScreen = screenInfo ? screenInfo.isSmallScreen : (getCurrentWidth() <= brNum);

      if (isSmallScreen && previousLayout !== currentLayout) {
        resetMenusOnResize(hamburgerIcons);
        previousLayout = currentLayout;
      }

      updateMenuStates(hamburgerIcons);
    };
  }

  const clickHandlers = new WeakMap();

  /**
   * Initializes hamburger menu functionality
   * @param {NodeList|Array} hamburgerIcons - Collection of hamburger icons
   */
  function initHamburgerMenu(hamburgerIcons) {
    // Add click handlers
    hamburgerIcons.forEach((hamburgerIcon) => {
      const handler = () => {
        Drupal.solo.clickedHandler(() => {
          hamburgerIconIsClicked(hamburgerIcon);
        });
      };
      clickHandlers.set(hamburgerIcon, handler);
      hamburgerIcon.addEventListener('click', handler);
    });

    // Initial setup
    updateMenuStates(hamburgerIcons);

    // Register resize handler with state manager if available
    if (Drupal.solo.menuState) {
      Drupal.solo.menuState.addResizeHandler(COMPONENT_NAME, createResizeHandler(hamburgerIcons), 250);
    } else {
      // Fallback to traditional resize handler
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          createResizeHandler(hamburgerIcons)();
        }, 250);
      });
    }
  }

  Drupal.behaviors.mobileMenu = {
    attach: function(context) {
      // Try once via Drupal context
      const hamburgerIcons = once('soloHamburgerInit',
        '.mobile-nav button', context);

      if (hamburgerIcons.length > 0) {
        initHamburgerMenu(hamburgerIcons);
      } else {
        // Retry after full page load in case the menu was injected late (e.g. Admin Toolbar)
        window.addEventListener('load', () => {
          const fallbackIcons = once('soloHamburgerLateInit',
            '.mobile-nav button');
          if (fallbackIcons.length > 0) {
            initHamburgerMenu(fallbackIcons);
          }
        });
      }
    },

    detach: function(context, settings, trigger) {
      if (trigger === 'unload') {
        const hamburgerIcons = once.filter('soloHamburgerInit', '.mobile-nav button', context)
          .concat(once.filter('soloHamburgerLateInit', '.mobile-nav button'));

        hamburgerIcons.forEach(icon => {
          const handler = clickHandlers.get(icon);
          if (handler) {
            icon.removeEventListener('click', handler);
            clickHandlers.delete(icon);
          }
        });

        if (Drupal.solo.menuState) {
          Drupal.solo.menuState.unregisterComponent(COMPONENT_NAME);
        }
      }
    }
  };
})(Drupal, drupalSettings, once);
