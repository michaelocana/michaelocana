((Drupal) => {
  'use strict';
  Drupal.solo = Drupal.solo || {};
  Drupal.solo.keyboard = Drupal.solo.keyboard || {};

  const COMPONENT_NAME = 'keyboard-focus';

  class KeyboardFocusModule {
    constructor(core) {
      this.core = core;
      this.menubar = core.menubar;
      this.handleFocus = this.handleFocus.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
    }

    init() {
      this.bindFocusEvents();
    }

    bindFocusEvents() {
      this.core.menuItems.forEach(item => {
        item.addEventListener('focus', this.handleFocus);
        item.addEventListener('blur', this.handleBlur);
      });
    }

    handleFocus(event) {
      const item = event.target;
      const parser = this.core.getModule('templateParser');

      if (parser?.shouldAutoOpen(item)) {
        const itemStructure = parser.getItemStructure(item);
        if (itemStructure?.hasSubmenu && itemStructure.submenu && !itemStructure.submenu.classList.contains('toggled')) {
          setTimeout(() => {
            if (!itemStructure.submenu.classList.contains('toggled') && itemStructure.button) {
              if (Drupal.solo.menuOperations) {
                const isMenubar = itemStructure.button.parentElement.classList.contains('nav__menubar-item');
                if (isMenubar) {
                  Drupal.solo.menuOperations.openMenubar(itemStructure.button, itemStructure.submenu);
                } else {
                  Drupal.solo.menuOperations.openSubMenu(itemStructure.button, itemStructure.submenu);
                }

                // For hover menus, make submenu items focusable via Tab
                const isHoverMode = this.core.templateInfo.interactionMode === 'hover';
                const isSmallScreen = this.core.isSmallScreen();

                if (isHoverMode && !isSmallScreen) {
                  setTimeout(() => {
                    const submenuItems = itemStructure.submenu.querySelectorAll(':scope > li > a, :scope > li > button');
                    submenuItems.forEach(submenuItem => {
                      if (Drupal.solo.menuState) {
                        Drupal.solo.menuState.setTabindex(submenuItem, '0', 'keyboard-focus');
                      } else {
                        submenuItem.setAttribute('tabindex', '0');
                      }
                    });
                  }, 50);
                }
              } else {
                itemStructure.button.click();
              }
            }
          }, 50);
        }
      }

      item.classList.add('solo-keyboard-focus');
      this.updateRovingTabindex(item);
    }

    handleBlur(event) {
      event.target.classList.remove('solo-keyboard-focus');
    }

    updateRovingTabindex(newFocus) {
      const container = newFocus.closest('[role="menubar"], [role="menu"]');
      if (!container) return;

      const isSmallScreen = this.core.isSmallScreen();
      const isMenubarOpen = this.menubar.classList.contains('toggled');

      if (isSmallScreen && !isMenubarOpen && container === this.menubar) {
        return;
      }

      // Check if we're in hover mode
      const isHoverMode = this.core.templateInfo.interactionMode === 'hover';

      if (isHoverMode && !isSmallScreen) {
        // For hover menus, don't use roving tabindex - allow natural Tab flow
        // Just ensure the focused item is focusable
        if (Drupal.solo.menuState) {
          Drupal.solo.menuState.setTabindex(newFocus, '0', 'keyboard-focus');
        } else {
          newFocus.setAttribute('tabindex', '0');
        }

        // Make sure any open submenus remain in tab order
        const openSubmenus = container.querySelectorAll('ul.sub__menu.toggled');
        openSubmenus.forEach(submenu => {
          const submenuItems = submenu.querySelectorAll(':scope > li > a, :scope > li > button');
          submenuItems.forEach(item => {
            if (Drupal.solo.menuState) {
              Drupal.solo.menuState.setTabindex(item, '0', 'keyboard-focus');
            } else {
              item.setAttribute('tabindex', '0');
            }
          });
        });

        return;
      }

      // Original roving tabindex behavior for click menus
      container.querySelectorAll(':scope > li > a, :scope > li > button').forEach(item => {
        const currentTabindex = item.getAttribute('tabindex');
        if (currentTabindex !== null) {
          const tabindexValue = item === newFocus ? '0' : '-1';
          if (Drupal.solo.menuState) {
            Drupal.solo.menuState.setTabindex(item, tabindexValue, 'keyboard-focus');
          } else {
            item.setAttribute('tabindex', tabindexValue);
          }
        }
      });
    }

    destroy() {
      this.core.menuItems.forEach(item => {
        item.removeEventListener('focus', this.handleFocus);
        item.removeEventListener('blur', this.handleBlur);
      });
    }
  }

  Drupal.solo.keyboard.focus = KeyboardFocusModule;
})(Drupal);
