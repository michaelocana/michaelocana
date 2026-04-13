((Drupal) => {
  'use strict';
  Drupal.solo = Drupal.solo || {};
  Drupal.solo.keyboard = Drupal.solo.keyboard || {};

  class NavigationModule {
    constructor(core) {
      this.core = core;
      this.menuWrapper = core.menuWrapper;
      this.menubar = core.menubar;
      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleMobileNavClick = this.handleMobileNavClick.bind(this);
      this.timeouts = new Set();
    }

    init() {
      this.bindEventListeners();
      this.setupMobileNav();
    }

    bindEventListeners() {
      this.core.menuItems.forEach(item => {
        item.addEventListener('keydown', this.handleKeydown);
      });
    }

    setupMobileNav() {
      if (this.core.mobileNavButton) {
        this.core.mobileNavButton.addEventListener('click', this.handleMobileNavClick);
      }
    }

    setTimeoutSafe(callback, delay) {
      const timeoutId = setTimeout(() => {
        this.timeouts.delete(timeoutId);
        callback();
      }, delay);
      this.timeouts.add(timeoutId);
      return timeoutId;
    }

    handleMobileNavClick() {
      this.setTimeoutSafe(() => {
        const isOpen = this.menubar.classList.contains('toggled') || this.menubar.classList.contains('is-active');
        if (isOpen) {
          const firstItem = this.getFirstFocusableItem(this.menubar);
          if (firstItem) firstItem.focus();
        }
      }, 100);
    }

    handleKeydown(event) {
      const key = event.key;
      const target = event.target;
      const parser = this.core.getModule('templateParser');
      const itemStructure = parser?.getItemStructure(target);
      const isSidebar = this.core.templateInfo.isSidebar;

      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape'].includes(key)) {
        event.preventDefault();
      }

      switch (key) {
        case 'Tab':
          // Check if we're in hover mode
          const isHoverMode = this.core.templateInfo.interactionMode === 'hover';
          const isSmallScreen = this.core.isSmallScreen();

          if (isHoverMode && !isSmallScreen) {
            // For hover menus on large screens: Allow natural Tab flow
            // Don't prevent default - let Tab work naturally

            // But ensure opened submenus have proper tabindex
            const currentSubmenu = target.closest('[role="menu"]');
            if (currentSubmenu && currentSubmenu !== this.menubar) {
              // We're in a submenu - ensure all items are focusable
              const submenuItems = currentSubmenu.querySelectorAll(':scope > li > a, :scope > li > button');
              submenuItems.forEach(item => {
                if (item.getAttribute('tabindex') === '-1') {
                  this.setTabindexSafe(item, '0');
                }
              });
            }

            // If tabbing forward and there's an open submenu, make sure it's in tab order
            if (!event.shiftKey) {
              const openSubmenu = target.parentElement?.querySelector(':scope > ul.sub__menu.toggled');
              if (openSubmenu) {
                const firstSubmenuItem = openSubmenu.querySelector(':scope > li > a, :scope > li > button');
                if (firstSubmenuItem && firstSubmenuItem.getAttribute('tabindex') === '-1') {
                  this.setTabindexSafe(firstSubmenuItem, '0');
                }
              }
            }

            // Don't prevent default - allow natural Tab navigation
            return;
          } else {
            // For click menus or small screens: Use custom top-level navigation
            event.preventDefault();
            this.navigateTopLevel(target, !event.shiftKey);
          }
          break;

        case 'Enter':
          if (target.tagName === 'A') {
            event.preventDefault();
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            target.dispatchEvent(clickEvent);
          } else if (target.tagName === 'BUTTON') {
            event.preventDefault();
            this.handleButtonActivation(target, itemStructure);
          }
          break;

        case ' ':
          event.preventDefault();
          if (target.tagName === 'A') {
            target.click();
          } else if (target.tagName === 'BUTTON') {
            this.handleButtonActivation(target, itemStructure);
          }
          break;

        case 'ArrowRight':
          if (isSidebar) {
            this.openSubmenu(target, itemStructure);
          } else {
            this.navigateHorizontal(target, 1);
          }
          break;

        case 'ArrowLeft':
          if (isSidebar) {
            this.exitSubmenu(target);
          } else {
            this.navigateHorizontal(target, -1);
          }
          break;

        case 'ArrowDown':
          this.navigateVertical(target, 1, itemStructure);
          break;

        case 'ArrowUp':
          this.navigateVertical(target, -1, itemStructure);
          break;

        case 'Escape':
          this.handleEscape(target);
          break;

        case 'Home':
        case 'End':
          this.navigateToEnd(target, key === 'Home');
          break;
      }
    }

    navigateTopLevel(current, forward) {
      const topLevelItems = Array.from(this.menubar.querySelectorAll(':scope > li > a, :scope > li > button'))
        .filter(item => item.offsetParent !== null);

      const currentIndex = topLevelItems.indexOf(current);
      let targetIndex;

      if (currentIndex === -1) {
        const parentLi = current.closest('li');
        const topLevelFocus = this.getPrimaryFocusElement(parentLi?.closest('.nav__menubar-item') || parentLi);
        targetIndex = topLevelItems.indexOf(topLevelFocus);
      } else {
        targetIndex = currentIndex;
      }

      if (forward) {
        targetIndex = (targetIndex + 1) % topLevelItems.length;
      } else {
        targetIndex = (targetIndex - 1 + topLevelItems.length) % topLevelItems.length;
      }

      if (topLevelItems[targetIndex]) {
        topLevelItems[targetIndex].focus();
      }
    }

    handleButtonActivation(target, itemStructure) {
      if (target.classList.contains('mobile-menubar-toggler-button')) {
        target.click();
        return;
      }

      // Always use menuOperations when available
      if (Drupal.solo.menuOperations && itemStructure) {
        const subMenu = itemStructure.submenu;
        const button = itemStructure.button || target;

        if (subMenu && button) {
          const isMenubar = button.parentElement.classList.contains('nav__menubar-item');
          const isToggled = subMenu.classList.contains('toggled');

          if (isToggled) {
            if (isMenubar) {
              Drupal.solo.menuOperations.closeMenubar(button, subMenu);
            } else {
              Drupal.solo.menuOperations.closeSubMenu(button, subMenu);
            }
          } else {
            if (isMenubar) {
              Drupal.solo.menuOperations.openMenubar(button, subMenu);
            } else {
              Drupal.solo.menuOperations.openSubMenu(button, subMenu);
            }
          }
          return;
        }
      }

      // Fallback only if menuOperations not available
      if (itemStructure?.button) {
        itemStructure.button.click();
      } else if (target.tagName === 'BUTTON') {
        target.click();
      }
    }

    navigateHorizontal(current, direction) {
      const parser = this.core.getModule('templateParser');
      const itemStructure = parser?.getItemStructure(current);

      if (itemStructure?.type === 'split') {
        if (direction === 1 && current === itemStructure.link && itemStructure.button) {
          itemStructure.button.focus();
          return;
        }
        if (direction === -1 && current === itemStructure.button && itemStructure.link) {
          itemStructure.link.focus();
          return;
        }
      }

      const currentLi = current.closest('li');
      const container = currentLi?.parentElement;
      if (!container) return;

      const items = Array.from(container.children).filter(li => li.tagName === 'LI');
      const currentIndex = items.indexOf(currentLi);

      const nextIndex = direction === 1 ?
        (currentIndex + 1) % items.length :
        (currentIndex - 1 + items.length) % items.length;

      const nextLi = items[nextIndex];
      if (nextLi) {
        const nextItemStructure = parser?.getItemStructure(nextLi);
        const focusTarget = this.getPrimaryFocusElement(nextLi, nextItemStructure);
        if (focusTarget) focusTarget.focus();
      }
    }

    getPrimaryFocusElement(li, itemStructure) {
      if (!itemStructure) {
        itemStructure = this.core.getModule('templateParser')?.getItemStructure(li);
      }

      if (itemStructure?.link) {
        return itemStructure.link;
      } else if (itemStructure?.button) {
        return itemStructure.button;
      }

      return li.querySelector(':scope > a, :scope > button');
    }

    navigateVertical(current, direction, itemStructure) {
      if (current === this.core.mobileNavButton && direction === 1) {
        if (!this.menubar.classList.contains('toggled')) {
          current.click();

          this.setTimeoutSafe(() => {
            const firstItem = this.getFirstFocusableItem(this.menubar);
            if (firstItem) firstItem.focus();
          }, 100);
        } else {
          const firstItem = this.getFirstFocusableItem(this.menubar);
          if (firstItem) firstItem.focus();
        }
        return;
      }

      if (direction === 1 && itemStructure?.hasSubmenu && itemStructure.button && current === itemStructure.button) {
        if (!itemStructure.submenu.classList.contains('toggled')) {
          this.openSubmenu(current, itemStructure);
        } else {
          const firstChild = this.getFirstFocusableItem(itemStructure.submenu);
          if (firstChild) firstChild.focus();
        }
        return;
      }

      if (direction === 1 && itemStructure?.type === 'split' && current === itemStructure.link && itemStructure.button) {
        itemStructure.button.focus();
        return;
      }

      const container = current.closest('[role="menubar"], [role="menu"]');
      const items = this.getAllFocusableItems(container);
      const currentIndex = items.indexOf(current);

      if (direction === -1 && currentIndex === 0 && this.core.mobileNavButton && this.core.isSmallScreen()) {
        const parentMenu = container.closest('[role="menu"]');
        if (!parentMenu) {
          this.core.mobileNavButton.focus();
          return;
        }
      }

      const newIndex = direction === 1 ?
        (currentIndex + 1) % items.length :
        (currentIndex - 1 + items.length) % items.length;

      if (items[newIndex]) {
        items[newIndex].focus();
      }
    }

    setTabindexSafe(element, value) {
      if (Drupal.solo.menuState) {
        Drupal.solo.menuState.setTabindex(element, value, 'keyboard-navigation');
      } else {
        element.setAttribute('tabindex', value);
      }
    }

    openSubmenu(trigger, itemStructure) {
      if (!itemStructure?.submenu) return;

      // Always prefer menuOperations over click
      if (Drupal.solo.menuOperations && itemStructure.button) {
        const isMenubar = itemStructure.button.parentElement.classList.contains('nav__menubar-item');
        if (isMenubar) {
          Drupal.solo.menuOperations.openMenubar(itemStructure.button, itemStructure.submenu);
        } else {
          Drupal.solo.menuOperations.openSubMenu(itemStructure.button, itemStructure.submenu);
        }

        // Focus handling after operation
        this.setTimeoutSafe(() => {
          // For hover menus, make submenu items focusable via Tab
          const isHoverMode = this.core.templateInfo.interactionMode === 'hover';
          const isSmallScreen = this.core.isSmallScreen();

          if (isHoverMode && !isSmallScreen) {
            const submenuItems = itemStructure.submenu.querySelectorAll(':scope > li > a, :scope > li > button');
            submenuItems.forEach(item => {
              this.setTabindexSafe(item, '0');
            });
          }

          const firstItem = this.getFirstFocusableItem(itemStructure.submenu);
          if (firstItem) firstItem.focus();
        }, 100);
      } else if (itemStructure.button) {
        // Fallback only
        itemStructure.button.click();

        this.setTimeoutSafe(() => {
          const firstItem = this.getFirstFocusableItem(itemStructure.submenu);
          if (firstItem) firstItem.focus();
        }, 100);
      }
    }

    exitSubmenu(current) {
      const submenu = current.closest('[role="menu"]');
      if (!submenu || submenu === this.menubar) return;

      const parentLi = submenu.closest('li');
      const parser = this.core.getModule('templateParser');
      const parentStructure = parser?.getItemStructure(parentLi);
      const parentButton = parentStructure?.button || parentLi?.querySelector(':scope > button.dropdown-toggler');

      if (parentButton) {
        parentButton.focus();
        if (submenu.classList.contains('toggled')) {
          if (Drupal.solo.menuOperations) {
            Drupal.solo.menuOperations.closeSubMenu(parentButton, submenu);
          } else {
            parentButton.click();
          }
        }
      } else {
        const parentFocus = this.getPrimaryFocusElement(parentLi, parentStructure);
        if (parentFocus) {
          parentFocus.focus();
        }
      }
    }

    handleEscape(current) {
      const submenu = current.closest('[role="menu"]');
      if (submenu && submenu !== this.menubar) {
        this.exitSubmenu(current);
      } else if (this.core.isSmallScreen() && this.core.mobileNavButton) {
        if (this.menubar.classList.contains('toggled')) {
          this.core.mobileNavButton.click();
        }
        this.core.mobileNavButton.focus();
      }
    }

    navigateToEnd(current, toFirst) {
      const container = current.closest('[role="menubar"], [role="menu"]');
      const items = this.getAllFocusableItems(container);
      const target = toFirst ? items[0] : items[items.length - 1];
      if (target) target.focus();
    }

    getAllFocusableItems(container) {
      if (!container) return [];
      return Array.from(container.querySelectorAll(':scope > li > a, :scope > li > button'))
        .filter(item => item.offsetParent !== null);
    }

    getFirstFocusableItem(container) {
      const items = this.getAllFocusableItems(container);
      return items[0] || null;
    }

    destroy() {
      this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
      this.timeouts.clear();
      this.core.menuItems.forEach(item => {
        item.removeEventListener('keydown', this.handleKeydown);
      });
      if (this.core.mobileNavButton) {
        this.core.mobileNavButton.removeEventListener('click', this.handleMobileNavClick);
      }
    }

  }

  Drupal.solo.keyboard.navigation = NavigationModule;
})(Drupal);
