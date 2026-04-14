((Drupal) => {
  'use strict';
  Drupal.solo = Drupal.solo || {};
  Drupal.solo.keyboard = Drupal.solo.keyboard || {};

  class TemplateParserModule {
    constructor(core) {
      this.core = core;
      this.menubar = core.menubar;
      this.templateInfo = core.templateInfo;
    }

    init() {
      // Ensure accessibility compliance on initialization
      this.ensureAccessibilityCompliance();
    }

    getItemStructure(element) {
      if (!element || !(element instanceof HTMLElement)) return null;

      let li;

      if (element.tagName === 'LI') {
        li = element;
      } else {
        li = element.closest('li');
      }

      if (!li) return null;

      const link = li.querySelector(':scope > a');
      const button = li.querySelector(':scope > button.dropdown-toggler');
      const nolink = li.querySelector(':scope > span.nav__menu-nolink');
      const submenu = li.querySelector(':scope > ul');

      let type = 'unknown';
      if (link && button) {
        type = 'split';
      } else if (link && !button) {
        type = 'link';
      } else if (!link && button) {
        type = 'button';
      } else if (nolink) {
        type = 'nolink';
      }

      return {
        li: li,
        link: link,
        button: button,
        nolink: nolink,
        submenu: submenu,
        hasSubmenu: !!submenu,
        type: type,
        isExpanded: submenu ? submenu.classList.contains('toggled') : false,
        isMenubarItem: li.classList.contains('nav__menubar-item'),
        isActive: li.classList.contains('is-active')
      };
    }

    shouldAutoOpen(element) {
      if (this.core.isSmallScreen()) {
        return false;
      }

      const isHoverMode = this.templateInfo.interactionMode === 'hover';
      if (!isHoverMode) {
        return false;
      }

      const itemStructure = this.getItemStructure(element);
      if (!itemStructure || !itemStructure.hasSubmenu) {
        return false;
      }

      return element === itemStructure.link || element === itemStructure.button;
    }

    getMenuLevel(element) {
      if (!element) return 0;

      let level = 0;
      let current = element.closest('ul');

      while (current) {
        if (current.hasAttribute('role')) {
          level++;
        }
        current = current.parentElement?.closest('ul');
      }

      return level;
    }

    isMenuItem(element) {
      if (!element) return false;
      return element.getAttribute('role') === 'menuitem' ||
             element.tagName === 'A' ||
             (element.tagName === 'BUTTON' && element.classList.contains('dropdown-toggler'));
    }

    getSubmenuDirection(element) {
      const isSidebar = this.templateInfo.isSidebar;
      const isRTL = document.documentElement.dir === 'rtl';

      if (isSidebar) {
        return isRTL ? 'left' : 'right';
      }

      return 'down';
    }

    ensureAccessibilityCompliance() {
      if (!this.menubar) return;
      // Ensure all menu items have proper roles
      this.menubar.querySelectorAll('a, button').forEach(item => {
        const role = item.getAttribute('role');
        if (!role || role !== 'menuitem') {
          item.setAttribute('role', 'menuitem');
        }

        // Ensure focus-visible support
        if (!item.classList.contains('solo-menu-item')) {
          item.classList.add('solo-menu-item');
        }
      });

      // Ensure proper menu structure
      this.menubar.querySelectorAll('ul').forEach(ul => {
        if (!ul.hasAttribute('role')) {
          const isTopLevel = ul === this.menubar;
          ul.setAttribute('role', isTopLevel ? 'menubar' : 'menu');
        }
      });

      // Ensure li elements have role="none"
      this.menubar.querySelectorAll('li').forEach(li => {
        if (!li.hasAttribute('role')) {
          li.setAttribute('role', 'none');
        }
      });

      // Ensure proper ARIA labels on menu regions
      if (!this.menubar.hasAttribute('aria-label')) {
        const menuLabel = this.templateInfo.isPrimary ?
          Drupal.t('Main navigation') :
          Drupal.t('Navigation menu');
        this.menubar.setAttribute('aria-label', menuLabel);
      }

      // Ensure buttons have proper ARIA attributes
      this.menubar.querySelectorAll('button.dropdown-toggler').forEach(button => {
        if (Drupal.solo.menuState) {
          Drupal.solo.menuState.setAriaAttribute(button, 'aria-haspopup', 'true', 'templateParser');
          Drupal.solo.menuState.setAriaAttribute(button, 'aria-expanded', 'false', 'templateParser');
        }

      });

      // Ensure submenus have proper initial state
      this.menubar.querySelectorAll('ul[role="menu"]').forEach(submenu => {
        if (!submenu.hasAttribute('aria-hidden')) {
          const isOpen = submenu.classList.contains('toggled');
          if (Drupal.solo.menuState) {
            Drupal.solo.menuState.setAriaAttribute(submenu, 'aria-hidden', isOpen ? 'false' : 'true', 'templateParser');
          }
        }
      });
    }

    validateMenuStructure() {
      const errors = [];

      // Check for proper nesting
      this.menubar.querySelectorAll('ul ul').forEach(submenu => {
        if (!submenu.parentElement || submenu.parentElement.tagName !== 'LI') {
          errors.push('Submenu not properly nested within LI element');
        }
      });

      // Check for menu items without focusable elements
      this.menubar.querySelectorAll('li').forEach(li => {
        const focusable = li.querySelector(':scope > a, :scope > button');
        if (!focusable && !li.querySelector('ul')) {
          errors.push('Menu item without focusable element');
        }
      });

      if (errors.length > 0 && window.console && console.warn) {
        console.warn('Solo Keyboard: Menu structure validation errors:', errors);
      }

      return errors.length === 0;
    }

    destroy() {
      // No cleanup needed for parser module
    }
  }

  Drupal.solo.keyboard.templateParser = TemplateParserModule;
})(Drupal);
