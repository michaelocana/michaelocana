((Drupal) => {
  'use strict';
  Drupal.solo = Drupal.solo || {};
  Drupal.solo.keyboard = Drupal.solo.keyboard || {};

  const COMPONENT_NAME = 'keyboard-aria';

  class KeyboardAriaModule {
    constructor(core) {
      this.core = core;
      this.menubar = core.menubar;
      this.observers = [];
    }

    init() {
      this.observeAriaChanges();
      this.ensureProperRoles();
    }

    ensureProperRoles() {
      // Ensure all <li> elements have role="none" - ARIA best practice
      this.menubar.querySelectorAll('li').forEach(li => {
        if (!li.hasAttribute('role') || li.getAttribute('role') !== 'none') {
          li.setAttribute('role', 'none');
        }

        // Remove any incorrectly placed ARIA attributes from li elements
        if (li.hasAttribute('aria-haspopup')) {
          li.removeAttribute('aria-haspopup');
        }
        if (li.hasAttribute('aria-expanded')) {
          li.removeAttribute('aria-expanded');
        }
      });

      // Ensure all interactive elements have proper roles
      this.menubar.querySelectorAll('a, button').forEach(item => {
        if (!item.hasAttribute('role') && (item.tagName === 'A' || item.classList.contains('dropdown-toggler'))) {
          item.setAttribute('role', 'menuitem');
        }

        // Move aria-haspopup and aria-expanded from parent li to button if needed
        const parentLi = item.closest('li');
        if (parentLi && item.classList.contains('dropdown-toggler')) {
          if (parentLi.hasAttribute('aria-haspopup')) {
            item.setAttribute('aria-haspopup', 'true');
            parentLi.removeAttribute('aria-haspopup');
          }
          if (parentLi.hasAttribute('aria-expanded')) {
            item.setAttribute('aria-expanded', parentLi.getAttribute('aria-expanded'));
            parentLi.removeAttribute('aria-expanded');
          }
        }
      });
    }

    observeAriaChanges() {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
            // FIX: Prevent redundant calls by checking if value actually changed
            const oldValue = mutation.oldValue;
            const newValue = mutation.target.getAttribute('aria-expanded');
            if (oldValue !== newValue) {
              this.syncAriaStates(mutation.target);
            }
          }
        });
      });

      this.menubar.querySelectorAll('button.dropdown-toggler').forEach(button => {
        observer.observe(button, {
          attributes: true,
          attributeFilter: ['aria-expanded'],
          attributeOldValue: true // Track old values to prevent redundant updates
        });
        this.observers.push({ element: button, observer });
      });
    }

    syncAriaStates(button) {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const submenu = button.nextElementSibling;

      if (submenu && submenu.tagName === 'UL') {
        // Only update if value differs from current state
        const currentHidden = submenu.getAttribute('aria-hidden');
        const newHidden = isExpanded ? 'false' : 'true';

        if (currentHidden !== newHidden) {
          if (Drupal.solo.menuState) {
            Drupal.solo.menuState.setAriaAttribute(submenu, 'aria-hidden', newHidden, COMPONENT_NAME);
          } else {
            submenu.setAttribute('aria-hidden', newHidden);
          }
        }
      }

      // FIXED: Remove aria-expanded from parent li - it should only be on the button
      const parentLi = button.closest('li');
      if (parentLi && parentLi.hasAttribute('aria-expanded')) {
        parentLi.removeAttribute('aria-expanded');
      }

      // Announce the menu state change
      this.announceMenuChange(button, isExpanded);
    }

    announceMenuChange(element, isOpen) {
      const parser = this.core.getModule('templateParser');
      const itemStructure = parser?.getItemStructure(element);

      if (itemStructure?.link || itemStructure?.button) {
        const textElement = itemStructure.link || itemStructure.button;
        const text = textElement.textContent.trim();

        if (Drupal.announce) {
          Drupal.announce(Drupal.t('@item submenu @state', {
            '@item': text,
            '@state': isOpen ? 'opened' : 'closed'
          }));
        }
      }
    }

    destroy() {
      this.observers.forEach(({ observer }) => observer.disconnect());
      this.observers = [];
    }
  }

  Drupal.solo.keyboard.aria = KeyboardAriaModule;
})(Drupal);
