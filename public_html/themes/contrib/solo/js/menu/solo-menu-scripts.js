/**
 * @file
 * Solo - Optimized version with state manager integration
 *
 * Filename:     solo-menu-scripts.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal, drupalSettings, once) => {
  'use strict';

  // Component name for state manager
  const COMPONENT_NAME = 'scripts';

  // Register component with state manager
  if (Drupal.solo.menuState) {
    Drupal.solo.menuState.registerComponent(COMPONENT_NAME, {
      name: 'Solo Menu Scripts',
      version: '1.0'
    });
  }

  Drupal.behaviors.globalMenu = {
    attach: function (context, settings) {
      // Use once to prevent duplicate processing
      const menus = once('solo-menu-init', '#primary-menu', context);

      menus.forEach(mainNavigation => {
        // Check for required navigation structure
        if (!mainNavigation.querySelector('.solo-inner .navigation__menubar')) {
          return;
        }

        // Initialize sticky navigation
        let origOffsetY = mainNavigation.offsetTop;
        let scrollTicking = false;

        // Optimized scroll handler with RAF throttling
        const handleScroll = () => {
          if (!scrollTicking) {
            window.requestAnimationFrame(() => {
              mainNavigation.classList.toggle('solo-sticky', window.scrollY > origOffsetY);
              scrollTicking = false;
            });
            scrollTicking = true;
          }
        };

        // Use state manager for resize handling if available
        if (Drupal.solo.menuState) {
          Drupal.solo.menuState.addResizeHandler(COMPONENT_NAME, (screenInfo) => {
            origOffsetY = mainNavigation.offsetTop;
          }, 250);
        } else {
          // Fallback to traditional resize handler
          let resizeTimeout;
          const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
              origOffsetY = mainNavigation.offsetTop;
            }, 250);
          };

          mainNavigation._soloResizeHandler = handleResize;
          window.addEventListener('resize', handleResize);
        }

        // Store handlers for potential cleanup
        mainNavigation._soloHandlers = {
          scroll: handleScroll
        };

        // Attach scroll event listener
        window.addEventListener('scroll', handleScroll, { passive: true });
      });

      // Apply background colors to submenus (only process new elements)
      const submenus = once('solo-submenu-bg', '.solo-inner nav .navigation__menubar ul', context);

      submenus.forEach(submenu => {
        const closestParent = submenu.closest('.page-wrapper > div, .page-wrapper > header');
        if (closestParent) {
          const bgColor = window.getComputedStyle(closestParent).backgroundColor;
          submenu.style.backgroundColor = bgColor || 'transparent';
        }
      });
    },

    detach: function (context, settings, trigger) {
      // Clean up event listeners on detach
      if (trigger === 'unload') {
        const menus = once.find('solo-menu-init', context);

        menus.forEach(mainNavigation => {
          if (mainNavigation._soloHandlers) {
            window.removeEventListener('scroll', mainNavigation._soloHandlers.scroll);
            delete mainNavigation._soloHandlers;
          }

          // Clean up resize handler if not using state manager
          if (mainNavigation._soloResizeHandler && !Drupal.solo.menuState) {
            window.removeEventListener('resize', mainNavigation._soloResizeHandler);
            delete mainNavigation._soloResizeHandler;
          }
        });

        // Unregister from state manager
        if (Drupal.solo.menuState) {
          Drupal.solo.menuState.unregisterComponent(COMPONENT_NAME);
        }
      }
    }
  };
})(Drupal, drupalSettings, once);
