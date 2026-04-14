/**
 * @file
 * Solo Menu System - Refactored with State Manager
 *
 * Filename:     solo-menu.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal, drupalSettings, once) => {
  'use strict';

  // Component name for state manager
  const COMPONENT_NAME = 'main';

  const animations = Drupal.solo.animations;

  // Register component with state manager
  if (Drupal.solo.menuState) {
    Drupal.solo.menuState.registerComponent(COMPONENT_NAME, {
      name: 'Solo Main Menu',
      version: '1.0'
    });
  }

  // Configuration
  const CONFIG = {
    selectors: {
      menuBar: '.solo-inner .solo-menu .navigation__menubar',
      subMenus: '.solo-inner .solo-menu .navigation__menubar ul',
      svgIcons: '.solo-inner .solo-menu .navigation__menubar .toggler-icon>svg',
      megaMenuClick: {
        big: '.solo-inner .solo-menu.navigation-responsive-click .navigation__megamenu>li>.dropdown-toggler',
        small: '.solo-inner .solo-menu.navigation-responsive-click .navigation__megamenu li .dropdown-toggler'
      },
      megaMenuHover: '.solo-inner .solo-menu.navigation-responsive-hover .navigation__megamenu li .dropdown-toggler',
      responsiveHover: '.solo-inner .solo-menu.navigation-responsive-hover .navigation__menubar:not(.navigation__megamenu) .dropdown-toggler',
      responsiveClick: '.solo-inner .solo-menu.navigation-responsive-click .navigation__menubar:not(.navigation__megamenu) .dropdown-toggler',
      default: '.solo-inner .solo-menu .navigation__default .dropdown-toggler',
      sidebarHover: '.solo-inner .solo-menu.navigation-sidebar-hover li .dropdown-toggler',
      sidebarClick: '.solo-inner .solo-menu.navigation-sidebar-click li .dropdown-toggler'
    }
  };

  // Arrow rotation mappings
  const ARROW_ROTATIONS = {
    'default': 'rotate(180deg)',
    'ltr-right': 'rotate(-90deg)',
    'ltr-left': 'rotate(90deg)',
    'rtl-right': 'rotate(90deg)',
    'rtl-left': 'rotate(-90deg)'
  };

  // State management
  const state = {
    resizeHandler: null,
    isClicked: false,
    currentWidth: 0,
    currentLayout: null,
    previousLayout: null,
    brNum: 0
  };

  const getCurrentWidth = () => Drupal.solo.menuState.getCurrentWidth()

  // Utility functions
  const utils = {
    querySelectorElements: (selector, context) => context.querySelectorAll(selector) ?? null,

    hasParentWithClass: (element, className) => !!element.closest(`.${className}`),

    getNavTagId: (dropdownTogglerButton) => dropdownTogglerButton.closest('nav')?.id,

    getRotated: (dropdownTogglerButton) => dropdownTogglerButton.querySelector('.toggler-icon svg'),

    setSubMenuAttributes: (element, attributes) => {
      for (const key in attributes) {
        if (Drupal.solo.menuState && key.startsWith('aria-')) {
          Drupal.solo.menuState.setAriaAttribute(element, key, attributes[key], COMPONENT_NAME);
        } else {
          element.setAttribute(key, attributes[key]);
        }
      }
    },

    delay: (duration) => new Promise(resolve => setTimeout(resolve, duration))
  };

  // Click handler with debounce
  const clickedHandler = async (callback) => {
    if (!state.isClicked) {
      state.isClicked = true;
      await callback();
      await utils.delay(animations.clickDelay);
      state.isClicked = false;
    }
  };

  // Arrow direction logic
  const getArrowDirection = (verticalNav) => {
    const shouldRotate = state.currentWidth >= state.brNum && !verticalNav;

    if (!shouldRotate) {
      return ARROW_ROTATIONS.default;
    }

    const isRtl = document.documentElement.dir === 'rtl';
    const isExpandLeft = document.querySelector('#primary-menu .expand-left') !== null;

    const key = `${isRtl ? 'rtl' : 'ltr'}-${isExpandLeft ? 'left' : 'right'}`;
    return ARROW_ROTATIONS[key];
  };

  // Menu visibility functions
  const menuVisibility = {
    hideSubMenus: (subMenu) => {
      Drupal.solo.menuState.hideSubmenu(subMenu, COMPONENT_NAME);
    },

    closeMenuHelper: (rotated, dropdownTogglerButton, subMenu) => {
      rotated.style.removeProperty('transform');
      Drupal.solo.menuState.setExpanded(dropdownTogglerButton, false, COMPONENT_NAME);
      Drupal.solo.slideUp(subMenu, animations.slideUp, COMPONENT_NAME);
    },

    openMenuHelper: (dropdownTogglerButton, subMenu) => {
      state.currentWidth = getCurrentWidth(); // Use the existing function

      if (subMenu.classList.contains('sub-mega') && state.currentWidth >= state.brNum) {
        Drupal.solo.slideDown(subMenu, animations.megaMenu, 'grid', COMPONENT_NAME);
      } else {
        Drupal.solo.slideDown(subMenu, animations.slideDown, 'block', COMPONENT_NAME);
      }

      Drupal.solo.menuState.setExpanded(dropdownTogglerButton, true, COMPONENT_NAME);
    }
  };

  // Icon management
  const iconManagement = {
    revertIcons: (navId) => {
      const svgIcons = document.querySelectorAll(`.solo-inner #${navId} .toggler-icon svg`);
      svgIcons.forEach(svgIcon => svgIcon.style.removeProperty('transform'));
    },

    resetSubMenus: (siteSubMenus, svgIcons) => {
      svgIcons.forEach(el => el.style.removeProperty('transform'));
      siteSubMenus.forEach(el => Drupal.solo.slideUp(el, animations.slideUp, COMPONENT_NAME));

      setTimeout(() => {
        siteSubMenus.forEach(el => el.style.removeProperty('transform'));
      }, animations.reset);
    },

    resetSpecificSubMenus: (specificSubMenus, specificSvgIcons) => {
      specificSvgIcons.forEach(el => el.style.removeProperty('transform'));
      specificSubMenus.forEach(el => Drupal.solo.slideUp(el, animations.slideUp, COMPONENT_NAME));

      setTimeout(() => {
        specificSubMenus.forEach(el => el.style.removeProperty('transform'));
      }, animations.reset);
    }
  };

  // Menu operations
  const menuOperations = {
    openMenubar: (dropdownTogglerButton, subMenu) => {
      const navTagId = utils.getNavTagId(dropdownTogglerButton);
      const subMenuClasses = Drupal.solo.getSubMenuClasses(navTagId);
      const rotated = utils.getRotated(dropdownTogglerButton);

      subMenuClasses?.forEach(subMenuClass => {
        if (subMenuClass !== subMenu) {
          menuVisibility.hideSubMenus(subMenuClass);
          iconManagement.revertIcons(navTagId);
        }
      });

      rotated.style.transform = ARROW_ROTATIONS.default;
      menuVisibility.openMenuHelper(dropdownTogglerButton, subMenu);
    },

    closeMenubar: (dropdownTogglerButton, subMenu) => {
      const navTagId = utils.getNavTagId(dropdownTogglerButton);
      const subMenuClasses = Drupal.solo.getSubMenuClasses(navTagId);
      const rotated = utils.getRotated(dropdownTogglerButton);

      subMenuClasses?.forEach(subMenuClass => {
        menuVisibility.hideSubMenus(subMenuClass);
        iconManagement.revertIcons(navTagId);
      });

      menuVisibility.closeMenuHelper(rotated, dropdownTogglerButton, subMenu);
    },

    openSubMenu: (dropdownTogglerButton, subMenu) => {
      const togglerSibling = dropdownTogglerButton.closest('.solo-inner .solo-menu ul');
      const nestedSubMenus = [...togglerSibling.querySelectorAll(':scope > li > ul.sub__menu')];
      const nestedTogglers = [...togglerSibling.querySelectorAll(':scope > li > button.dropdown-toggler svg')];
      const rotated = utils.getRotated(dropdownTogglerButton);
      const verticalNav = subMenu.closest('.navigation-sidebar');

      // Close siblings and revert icons
      nestedSubMenus.forEach(nestedSubMenu => {
        if (nestedSubMenu !== subMenu) {
          menuVisibility.hideSubMenus(nestedSubMenu);
        }
      });

      nestedTogglers.forEach(nestedToggler => {
        if (nestedToggler !== dropdownTogglerButton) {
          nestedToggler.style.removeProperty('transform');
        }
      });

      rotated.style.transform = getArrowDirection(verticalNav);
      menuVisibility.openMenuHelper(dropdownTogglerButton, subMenu);
    },

    closeSubMenu: (dropdownTogglerButton, subMenu) => {
      const rotated = utils.getRotated(dropdownTogglerButton);
      menuVisibility.closeMenuHelper(rotated, dropdownTogglerButton, subMenu);

      // Clean up flipped classes and attributes
      const parentLi = dropdownTogglerButton.closest('li.has-sub__menu');
      parentLi?.classList.remove('submenu-flipped-left', 'submenu-flipped-right');

      if (subMenu?.dataset.flipped) {
        delete subMenu.dataset.flipped;
      }

      // Close nested submenus
      const nestedSubMenus = subMenu.querySelectorAll('ul.sub__menu');
      const nestedTogglers = subMenu.querySelectorAll('button.dropdown-toggler');

      nestedSubMenus.forEach(nested => {
        Drupal.solo.slideUp(nested, animations.slideUp, COMPONENT_NAME);
        nested.classList.remove('toggled');
      });

      nestedTogglers.forEach(toggler => {
        const icon = toggler.querySelector('.toggler-icon svg');
        icon?.style.removeProperty('transform');
        Drupal.solo.menuState.setExpanded(toggler, false, COMPONENT_NAME);
      });
    }
  };

  // Event handlers
  const eventHandlers = {
    clickHandlers: new WeakMap(),

    dropdownTogglerButtonIsClicked: (dropdownTogglerButton, subMenu) => {
      clickedHandler(() => {
        const isMenubar = dropdownTogglerButton.parentElement.classList.contains('nav__menubar-item');
        let isToggled = false;

        if (Drupal.solo.menuState) {
          const state = Drupal.solo.menuState.getMenuState(subMenu);
          isToggled = state.isOpen;
        } else {
          isToggled = subMenu.classList.contains('toggled');
        }

        if (isMenubar) {
          isToggled ? menuOperations.closeMenubar(dropdownTogglerButton, subMenu)
                    : menuOperations.openMenubar(dropdownTogglerButton, subMenu);
        } else {
          isToggled ? menuOperations.closeSubMenu(dropdownTogglerButton, subMenu)
                    : menuOperations.openSubMenu(dropdownTogglerButton, subMenu);
        }
      });
    },

    addRemoveListener: function(event) {
      const button = event.currentTarget;
      const subMenu = button.nextElementSibling;
      eventHandlers.dropdownTogglerButtonIsClicked(button, subMenu);
    },

    addEventListenerToButtons: (buttons) => {
      buttons.forEach(button => {
        // Create handler if not exists
        if (!eventHandlers.clickHandlers.has(button)) {
          const handler = eventHandlers.addRemoveListener;
          eventHandlers.clickHandlers.set(button, handler);
          button.addEventListener('click', handler);
        }
      });
    },

    removeEventListenerToButtons: (buttons) => {
      buttons.forEach(button => {
        const handler = eventHandlers.clickHandlers.get(button);
        if (handler) {
          button.removeEventListener('click', handler);
          eventHandlers.clickHandlers.delete(button);
          console.log('Removing listeners from', buttons.length, 'buttons');
        }
      });
    }
  };

  // Hover functionality
  const addHoverFunctionality = () => {
    if (getCurrentWidth() < state.brNum) return;

    const hoverMenus = document.querySelector('.navigation-responsive-hover');
    if (!hoverMenus) return;

    const menuItems = document.querySelectorAll('.navigation-responsive-hover li.has-sub__menu');

    menuItems.forEach(item => {
      if (item.hasAttribute('data-hover-added')) return;

      const toggler = item.querySelector(':scope > button.dropdown-toggler');
      const subMenu = item.querySelector(':scope > ul');

      if (toggler && subMenu) {
        item.addEventListener('mouseenter', () => {
          Drupal.solo.menuState.setExpanded(toggler, true, COMPONENT_NAME);
          Drupal.solo.menuState.setHidden(subMenu, false, COMPONENT_NAME);
        });

        item.addEventListener('mouseleave', () => {
          Drupal.solo.menuState.setExpanded(toggler, false, COMPONENT_NAME);
          Drupal.solo.menuState.setHidden(subMenu, true, COMPONENT_NAME);
        });
      }

      item.setAttribute('data-hover-added', 'true');
    });
  };

  // Close submenus on outside click
  const closeSubMenusOnClick = () => {
    const navMenus = [
      '.solo-inner .solo-menu.navigation-responsive-click .navigation__menubar',
      '#primary-sidebar-menu .navigation__menubar'
    ];

    document.addEventListener('click', (event) => {
      clickedHandler(() => {
        const isInsideMenu = navMenus.some(selector => event.target.closest(selector));

        if (!isInsideMenu) {
          const specificNavMenus = document.querySelectorAll(navMenus.join(', '));
          const specificSubMenus = [];
          const specificSvgIcons = [];

          specificNavMenus.forEach(menu => {
            specificSubMenus.push(...menu.querySelectorAll('ul.navigation__menubar ul'));
            specificSvgIcons.push(...menu.querySelectorAll('.toggler-icon svg'));
          });

          iconManagement.resetSpecificSubMenus(specificSubMenus, specificSvgIcons);
        }
      });
    });
  };

  // Menu helper for responsive behavior
  const menusHelper = (currentWidth) => {
    const buttons = {
      mmClickSmall: document.querySelectorAll(CONFIG.selectors.megaMenuClick.small),
      mmClickBig: document.querySelectorAll(CONFIG.selectors.megaMenuClick.big),
      mmHoverSmall: document.querySelectorAll(CONFIG.selectors.megaMenuHover),
      navigationSidebarHover: document.querySelectorAll(CONFIG.selectors.sidebarHover),
      navigationResponsiveHover: document.querySelectorAll(CONFIG.selectors.responsiveHover)
    };

    const largeScreenActions = [
      { remove: buttons.mmClickSmall, add: buttons.mmClickBig },
      { remove: buttons.mmHoverSmall, add: null },
      { remove: buttons.navigationSidebarHover, add: null },
      { remove: buttons.navigationResponsiveHover, add: null }
    ];

    const smallScreenActions = [
      { remove: buttons.mmClickBig, add: buttons.mmClickSmall },
      { remove: null, add: buttons.mmHoverSmall },
      { remove: null, add: buttons.navigationSidebarHover },
      { remove: null, add: buttons.navigationResponsiveHover }
    ];

    const siteMenuBars = document.querySelectorAll(CONFIG.selectors.menuBar);
    siteMenuBars.forEach(siteMenuBar => siteMenuBar.removeAttribute('style'));

    const actions = currentWidth >= state.brNum ? largeScreenActions : smallScreenActions;

    actions.forEach(({ remove, add }) => {
      if (remove) eventHandlers.removeEventListenerToButtons(remove);
      if (add) eventHandlers.addEventListenerToButtons(add);
    });
  };

  // Active menu item marking
  const markActiveMenuItem = () => {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.views-page .navigation__menubar li a');

    links?.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        let currentElement = link;

        while (currentElement && !currentElement.matches('ul.navigation__menubar')) {
          if (currentElement.tagName === 'LI') {
            currentElement.classList.add('is-active');
          }
          currentElement = currentElement.parentElement;
        }
      }
    });
  };

  // Expose public API
  const exposePublicAPI = () => {
    // Utility functions
    Drupal.solo.clickedHandler = clickedHandler;
    Drupal.solo.hideSubMenus = menuVisibility.hideSubMenus;
    Drupal.solo.revertIcons = iconManagement.revertIcons;

    // DOM query helpers
    Drupal.solo.getNavigationMenubarClass = (menuBar) =>
      document.querySelector(`.solo-inner #${menuBar} .navigation__menubar`);

    Drupal.solo.getSubMenuClasses = (subMenus) =>
      document.querySelectorAll(`.solo-inner #${subMenus} .navigation__menubar ul.sub__menu`);

    // Menu operations (for keyboard support)
    Drupal.solo.menuOperations = menuOperations;
    Drupal.solo.menuVisibility = menuVisibility;
    Drupal.solo.eventHandlers = eventHandlers;
  };

  // Main behavior
  Drupal.behaviors.menuAction = {
    attach: function(context, settings) {
      // Initialize state
      state.brNum = Drupal.solo.getBreakpointNumber('mn');
      state.previousLayout = Drupal.solo.getLayout();
      state.currentWidth = getCurrentWidth();
      state.currentLayout = state.previousLayout;

      // Get elements with context
      const elements = {
        siteMenuBars: utils.querySelectorElements(CONFIG.selectors.menuBar, context),
        siteSubMenus: utils.querySelectorElements(CONFIG.selectors.subMenus, context),
        svgIcons: utils.querySelectorElements(CONFIG.selectors.svgIcons, context),
        navigationDefault: utils.querySelectorElements(CONFIG.selectors.default, context),
        navigationResponsiveClick: utils.querySelectorElements(CONFIG.selectors.responsiveClick, context),
        navigationSidebarClick: utils.querySelectorElements(CONFIG.selectors.sidebarClick, context)
      };

      // Add focus class on menubar click
      elements.siteMenuBars.forEach(siteMenuBar => {
        siteMenuBar.addEventListener('click', () => {
          const sideMenu = 'navigation-sidebar';
          const shouldRemoveFocus = utils.hasParentWithClass(siteMenuBar, sideMenu) ||
                                   state.currentWidth <= state.brNum;

          siteMenuBar.classList[shouldRemoveFocus ? 'remove' : 'add']('focus-in');
        });
      });

      // Initialize components
      markActiveMenuItem();
      addHoverFunctionality();

      // Add event listeners
      eventHandlers.addEventListenerToButtons(elements.navigationDefault);
      eventHandlers.addEventListenerToButtons(elements.navigationResponsiveClick);
      eventHandlers.addEventListenerToButtons(elements.navigationSidebarClick);

      // Initialize responsive behavior
      menusHelper(state.currentWidth);

      // Handle resize events using state manager if available
      if (Drupal.solo.menuState) {
        Drupal.solo.menuState.addResizeHandler(COMPONENT_NAME, (screenInfo) => {
          state.currentLayout = Drupal.solo.getLayout();
          state.currentWidth = screenInfo.width;

          if (state.previousLayout !== state.currentLayout) {
            menusHelper(state.currentWidth);
            iconManagement.resetSubMenus(elements.siteSubMenus, elements.svgIcons);
            state.previousLayout = state.currentLayout;
          }

          addHoverFunctionality();
        }, 250);
        } else {
          state.resizeHandler = () => {
            state.currentLayout = Drupal.solo.getLayout();
            state.currentWidth = getCurrentWidth();

            if (state.previousLayout !== state.currentLayout) {
              menusHelper(state.currentWidth);
              iconManagement.resetSubMenus(elements.siteSubMenus, elements.svgIcons);
              state.previousLayout = state.currentLayout;
            }

            addHoverFunctionality();
          };

          window.addEventListener('resize', state.resizeHandler);
        }

      // Initialize close on outside click
      closeSubMenusOnClick();

      // Expose public API
      exposePublicAPI();
    },

    detach: function(context, settings, trigger) {
      if (trigger === 'unload') {
        const buttons = context.querySelectorAll('.dropdown-toggler');
        eventHandlers.removeEventListenerToButtons(buttons);

        if (state.resizeHandler) {
          window.removeEventListener('resize', state.resizeHandler);
          state.resizeHandler = null;
        }

        if (Drupal.solo.menuState) {
          Drupal.solo.menuState.unregisterComponent(COMPONENT_NAME);
        }

        eventHandlers.clickHandlers = new WeakMap();
      }
    }

  };
})(Drupal, drupalSettings, once);
