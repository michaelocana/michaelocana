/**
 * @file
 * Solo - Enhanced with performance, accessibility, state manager, and cleanup
 *
 * Filename:     solo-menu-repositions-submenus.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal, drupalSettings, once) => {
  'use strict';

  // Component name for state manager
  const COMPONENT_NAME = 'repositions';

  // Constants
  const SUBMENU_BUFFER = 30; // Buffer space for submenu positioning
  const RESIZE_DEBOUNCE_DELAY = 150; // Debounce delay for resize events
  let resizeHandler = null;

  // Register component with state manager
  if (Drupal.solo.menuState) {
    Drupal.solo.menuState.registerComponent(COMPONENT_NAME, {
      name: 'Solo Menu Repositions',
      version: '1.0'
    });
  }

  Drupal.behaviors.soloMenuFix = {
    attach: function(context) {
      const breakpoint = Drupal.solo.getBreakpointNumber('mn');
      let windowWidth = window.innerWidth;

      // Use state manager for screen size if available
      if (Drupal.solo.menuState) {
        windowWidth = Drupal.solo.menuState.screenSize.width;
      }

      // Quit if the screen is smaller than the breakpoint
      if (windowWidth < breakpoint) {
        return;
      }

      // Function 1: Get full window width
      const getWindowWidth = () => Drupal.solo.menuState.getCurrentWidth();

      // Function 2: Get full width of the `li`
      const getLiWidth = (li) => li.offsetWidth;

      // Function 3: Get X and Y position of the `li`
      const getLiPosition = (li) => li.getBoundingClientRect();

      // Function 4: Get full width of the opening submenu `ul`
      const getSubmenuWidth = (submenu) => submenu.offsetWidth;

      // Function 5: Get X and Y position of the submenu `ul`
      const getSubmenuPosition = (submenu) => submenu.getBoundingClientRect();

      // Function 6: Get space from `li` start to the left window edge
      const getSpaceLeft = (liRect) => liRect.left;

      // Function 7: Get space from `li` end to the right window edge
      const getSpaceRight = (liRect, windowWidth) => windowWidth - liRect.right;

      // Enhanced ARIA support function using state manager - FIXED
      const updateAriaAttributes = (li, submenu, isOpen = false) => {
        // Find the button within the li element
        const button = li.querySelector(':scope > button.dropdown-toggler');

        if (button) {
          // Update ARIA expanded state on the BUTTON, not the LI
          Drupal.solo.menuState.setExpanded(button, isOpen, COMPONENT_NAME);

          // Ensure button has aria-haspopup
          if (!button.hasAttribute('aria-haspopup')) {
            Drupal.solo.menuState.setAriaAttribute(button, 'aria-haspopup', 'true', COMPONENT_NAME);
          }
        }

        // Ensure submenu has proper ARIA attributes
        if (!submenu.hasAttribute('role')) {
          submenu.setAttribute('role', 'menu');
        }

        // Update ARIA hidden state on submenu
        Drupal.solo.menuState.setHidden(submenu, !isOpen, COMPONENT_NAME);

        // Ensure menu items have proper roles
        const menuItems = submenu.querySelectorAll(':scope > li');
        menuItems.forEach(item => {
          if (!item.hasAttribute('role')) {
            item.setAttribute('role', 'none');
          }
        });

        // Ensure links and buttons in submenu have menuitem role
        const interactiveItems = submenu.querySelectorAll(':scope > li > a, :scope > li > button');
        interactiveItems.forEach(item => {
          if (!item.hasAttribute('role')) {
            item.setAttribute('role', 'menuitem');
          }
        });
      };

      // Function to reposition second-level submenus
      const adjustSecondLevelSubmenu = (li) => {
        const windowWidth = getWindowWidth();
        if (windowWidth < breakpoint) return;

        const submenu = li.querySelector(':scope > .sub__menu');
        if (!submenu) return;

        submenu.style.visibility = 'hidden';
        const liRect = getLiPosition(li);
        const submenuWidth = getSubmenuWidth(submenu);
        const spaceLeft = getSpaceLeft(liRect);
        const spaceRight = getSpaceRight(liRect, windowWidth);

        if (submenuWidth + SUBMENU_BUFFER > spaceRight) {
          submenu.style.left = 'auto';
          submenu.style.right = '0';
          submenu.setAttribute('data-position', 'left');
        } else if (submenuWidth + SUBMENU_BUFFER > spaceLeft) {
          submenu.style.right = 'auto';
          submenu.style.left = '0';
          submenu.setAttribute('data-position', 'right');
        } else {
          submenu.style.left = '';
          submenu.style.right = '';
          submenu.removeAttribute('data-position');
        }

        submenu.style.visibility = 'visible';
        updateAriaAttributes(li, submenu, true);
      };

      // Function to reposition third-level submenus
      const adjustThirdLevelSubmenu = (li) => {
        const windowWidth = getWindowWidth();
        if (windowWidth < breakpoint) return;

        const submenu = li.querySelector(':scope > .sub__menu');
        if (!submenu) return;

        const parentLi = li.closest('li.has-sub__menu');
        if (!parentLi) return;

        submenu.style.visibility = 'hidden';
        const parentRect = getLiPosition(parentLi);
        const submenuWidth = getSubmenuWidth(submenu);
        const spaceLeft = getSpaceLeft(parentRect);
        const spaceRight = getSpaceRight(parentRect, windowWidth);

        // NEW: Dynamically get 4th-level submenu width (if present)
        const fourthLevelLi = submenu.querySelector('li.has-sub__menu');
        let fourthLevelWidth = 0;

        if (fourthLevelLi) {
          const fourthSubmenu = fourthLevelLi.querySelector(':scope > .sub__menu');
          if (fourthSubmenu) {
            const originalDisplay = fourthSubmenu.style.display;
            fourthSubmenu.style.visibility = 'hidden';
            fourthSubmenu.style.display = 'block';
            fourthLevelWidth = getSubmenuWidth(fourthSubmenu);
            // Restore only if originally hidden inline
            fourthSubmenu.style.display = originalDisplay;
            fourthSubmenu.style.visibility = '';
          }
        }

        const totalNeededWidth = submenuWidth + fourthLevelWidth + SUBMENU_BUFFER;

        if (totalNeededWidth > spaceRight && spaceLeft > spaceRight) {
          submenu.style.left = 'auto';
          submenu.style.right = '100%';
          submenu.dataset.flipped = 'left';
          li.classList.add('submenu-flipped-left');
          li.classList.remove('submenu-flipped-right');
          submenu.setAttribute('data-position', 'left');
        } else if (submenuWidth + SUBMENU_BUFFER > spaceLeft) {
          submenu.style.right = 'auto';
          submenu.style.left = '100%';
          submenu.dataset.flipped = 'right';
          li.classList.add('submenu-flipped-right');
          li.classList.remove('submenu-flipped-left');
          submenu.setAttribute('data-position', 'right');
        } else {
          submenu.style.left = '';
          submenu.style.right = '';
          submenu.removeAttribute('data-position');
        }

        submenu.style.visibility = 'visible';
        updateAriaAttributes(li, submenu, true);
      };

      const adjustFourthLevelSubmenu = (li) => {
        const windowWidth = getWindowWidth();
        if (windowWidth < breakpoint) return;

        const submenu = li.querySelector(':scope > .sub__menu');
        if (!submenu) return;

        const parentLi = li.closest('ul.sub__menu')?.closest('li.has-sub__menu');
        if (!parentLi) return;

        const parentSubmenu = parentLi.querySelector(':scope > .sub__menu');
        if (!parentSubmenu) return;

        submenu.style.visibility = 'hidden';

        // Determine if parent (3rd level) is flipped left
        const isParentFlippedLeft = parentSubmenu.dataset.flipped === 'left';

        if (isParentFlippedLeft) {
          submenu.style.left = 'auto';
          submenu.style.right = '100%';
          submenu.setAttribute('data-position', 'left');
        } else {
          submenu.style.right = 'auto';
          submenu.style.left = '100%';
          submenu.setAttribute('data-position', 'right');
        }

        submenu.style.visibility = 'visible';
        updateAriaAttributes(li, submenu, true);
      };

      // Enhanced event handler with ARIA support
      const createEventHandler = (adjustFunction) => {
        return function(event) {
          adjustFunction(this);

          // For keyboard navigation
          if (event.type === 'keydown') {
            const submenu = this.querySelector(':scope > .sub__menu');
            const button = this.querySelector(':scope > button.dropdown-toggler');

            if (submenu && button && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              const isExpanded = button.getAttribute('aria-expanded') === 'true';
              updateAriaAttributes(this, submenu, !isExpanded);
            }
          }
        };
      };

      // Refactored function to apply submenu fix with reduced duplication
      const applySubmenuFix = (menuSelector, adjustFunction) => {
        const elements = once('soloMenuFix',
          document.querySelectorAll(menuSelector, context)
        );

        elements.forEach((li) => {
          // Initialize ARIA attributes
          const submenu = li.querySelector(':scope > .sub__menu');
          const button = li.querySelector(':scope > button.dropdown-toggler');

          if (submenu && button) {
            // FIXED: Set aria-haspopup and aria-expanded on BUTTON, not LI
            Drupal.solo.menuState.setAriaAttribute(button, 'aria-haspopup', 'true', COMPONENT_NAME);
            Drupal.solo.menuState.setExpanded(button, false, COMPONENT_NAME);
            Drupal.solo.menuState.setHidden(submenu, true, COMPONENT_NAME);

            // Ensure li has role="none"
            if (!li.hasAttribute('role')) {
              li.setAttribute('role', 'none');
            }
          }

          // Create event handler
          const handler = createEventHandler(adjustFunction);

          // Add event listeners
          ['mouseenter', 'click', 'keydown'].forEach(eventType => {
            li.addEventListener(eventType, handler);
          });

          // Store handlers for cleanup
          li.dataset.soloMenuHandler = 'true';
        });
      };

      // Configuration for menu levels
      const menuConfigs = [
        {
          selector: '.primary-menu .navigation__primary > li.has-sub__menu',
          adjustFunction: adjustSecondLevelSubmenu
        },
        {
          selector: '.primary-menu .navigation__primary > li.has-sub__menu > ul > li.has-sub__menu',
          adjustFunction: adjustThirdLevelSubmenu
        },
        {
          selector: '.primary-menu .navigation__primary > li.has-sub__menu > ul > li.has-sub__menu > ul > li.has-sub__menu',
          adjustFunction: adjustFourthLevelSubmenu
        }
      ];

      // Apply fixes to all menu levels
      menuConfigs.forEach(config => {
        applySubmenuFix(config.selector, config.adjustFunction);
      });

      // Handle resize with state manager if available
      if (Drupal.solo.menuState) {
        Drupal.solo.menuState.addResizeHandler(COMPONENT_NAME, (screenInfo) => {
          if (screenInfo.width >= breakpoint) {
            menuConfigs.forEach(config => {
              applySubmenuFix(config.selector, config.adjustFunction);
            });
          }
        }, RESIZE_DEBOUNCE_DELAY);
      } else {
        let resizeTimeout;
        resizeHandler = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            if (window.innerWidth >= breakpoint) {
              menuConfigs.forEach(config => {
                applySubmenuFix(config.selector, config.adjustFunction);
              });
            }
          }, RESIZE_DEBOUNCE_DELAY);
        };

        window.addEventListener('resize', resizeHandler);
      }
    },

    // Cleanup method for proper event removal
    detach: function(context, settings, trigger) {
      if (trigger === 'unload') {
        if (Drupal.solo.menuState) {
          Drupal.solo.menuState.unregisterComponent(COMPONENT_NAME);
        }

        if (resizeHandler) {
          window.removeEventListener('resize', resizeHandler);
          resizeHandler = null;
        }

        const menuItems = document.querySelectorAll('[data-solo-menu-handler="true"]');
        menuItems.forEach(li => {
          const newLi = li.cloneNode(true);
          li.parentNode.replaceChild(newLi, li);
          delete newLi.dataset.soloMenuHandler;
        });
      }
    }
  };
})(Drupal, drupalSettings, once);
