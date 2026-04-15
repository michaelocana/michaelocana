/**
 * @file
 * Solo Menu ARIA Cleanup Utility
 *
 * This utility ensures proper ARIA compliance by cleaning up
 * incorrectly placed attributes and ensuring proper structure.
 */
((Drupal) => {
  'use strict';

  Drupal.solo = Drupal.solo || {};

  /**
   * ARIA Cleanup Utility
   * Fixes common ARIA issues in menu structures
   */
  Drupal.solo.ariaCleanup = {
    /**
     * Run the complete ARIA cleanup
     */
    run() {
      console.log('Solo Menu: Starting ARIA cleanup...');

      this.cleanupLiElements();
      this.ensureProperRoles();
      this.fixAriaAttributes();
      this.validateMenuStructure();

      console.log('Solo Menu: ARIA cleanup complete');
    },

    /**
     * Remove incorrectly placed ARIA attributes from li elements
     */
    cleanupLiElements() {
      const liElements = document.querySelectorAll('.solo-menu li');
      let cleaned = 0;

      liElements.forEach(li => {
        // Remove ARIA attributes that shouldn't be on li elements
        const attributesToRemove = ['aria-haspopup', 'aria-expanded', 'aria-controls'];

        attributesToRemove.forEach(attr => {
          if (li.hasAttribute(attr)) {
            // Try to move the attribute to the appropriate child element
            const button = li.querySelector(':scope > button.dropdown-toggler');
            if (button && !button.hasAttribute(attr)) {
              button.setAttribute(attr, li.getAttribute(attr));
            }
            li.removeAttribute(attr);
            cleaned++;
          }
        });

        // Ensure li has proper role
        if (!li.hasAttribute('role') ||
            (li.getAttribute('role') !== 'none' && li.getAttribute('role') !== 'presentation')) {
          li.setAttribute('role', 'none');
        }
      });

      if (cleaned > 0) {
        console.log(`Solo Menu: Cleaned ${cleaned} incorrectly placed ARIA attributes from li elements`);
      }
    },

    /**
     * Ensure all elements have proper ARIA roles
     */
    ensureProperRoles() {
      // Fix menubar roles
      document.querySelectorAll('.navigation__menubar').forEach(menubar => {
        if (!menubar.hasAttribute('role')) {
          const isTopLevel = !menubar.classList.contains('sub__menu');
          menubar.setAttribute('role', isTopLevel ? 'menubar' : 'menu');
        }
      });

      // Fix submenu roles
      document.querySelectorAll('.sub__menu').forEach(submenu => {
        if (!submenu.hasAttribute('role')) {
          submenu.setAttribute('role', 'menu');
        }
      });

      // Fix menuitem roles
      document.querySelectorAll('.solo-menu a, .solo-menu button.dropdown-toggler').forEach(item => {
        if (!item.hasAttribute('role')) {
          item.setAttribute('role', 'menuitem');
        }
      });
    },

    /**
     * Fix ARIA attributes on interactive elements
     */
    fixAriaAttributes() {
      // Fix dropdown togglers
      document.querySelectorAll('button.dropdown-toggler').forEach(button => {
        const submenu = button.nextElementSibling;

        // Ensure aria-haspopup
        if (submenu && submenu.tagName === 'UL' && !button.hasAttribute('aria-haspopup')) {
          button.setAttribute('aria-haspopup', 'true');
        }

        // Ensure aria-expanded
        if (submenu && !button.hasAttribute('aria-expanded')) {
          const isExpanded = submenu.classList.contains('toggled') ||
                           submenu.style.display !== 'none';
          button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        }

        // Ensure aria-controls
        if (submenu && submenu.id && !button.hasAttribute('aria-controls')) {
          button.setAttribute('aria-controls', submenu.id);
        }
      });

      // Fix submenu aria-hidden states
      document.querySelectorAll('.sub__menu').forEach(submenu => {
        if (!submenu.hasAttribute('aria-hidden')) {
          const isHidden = !submenu.classList.contains('toggled') &&
                          submenu.style.display === 'none';
          submenu.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
        }
      });
    },

    /**
     * Validate the menu structure and report issues
     */
    validateMenuStructure() {
      const issues = [];

      // Check for submenus not properly nested
      document.querySelectorAll('.sub__menu').forEach(submenu => {
        if (!submenu.parentElement || submenu.parentElement.tagName !== 'LI') {
          issues.push('Submenu not properly nested within LI element');
        }
      });

      // Check for menu items without interactive elements
      document.querySelectorAll('.solo-menu li').forEach(li => {
        const hasInteractive = li.querySelector(':scope > a, :scope > button');
        const hasSubmenu = li.querySelector(':scope > ul');

        if (!hasInteractive && !hasSubmenu) {
          issues.push(`Menu item without interactive element: ${li.textContent.trim()}`);
        }
      });

      // Check for orphaned ARIA references
      document.querySelectorAll('[aria-controls]').forEach(element => {
        const controlledId = element.getAttribute('aria-controls');
        if (controlledId && !document.getElementById(controlledId)) {
          issues.push(`aria-controls references non-existent ID: ${controlledId}`);
        }
      });

      // Report issues
      if (issues.length > 0) {
        console.warn('Solo Menu: Structure validation issues found:', issues);
      } else {
        console.log('Solo Menu: Structure validation passed');
      }

      return issues;
    },

    /**
     * Generate an accessibility report
     */
    generateReport() {
      const report = {
        totalMenus: document.querySelectorAll('.solo-menu').length,
        totalItems: document.querySelectorAll('.solo-menu li').length,
        totalButtons: document.querySelectorAll('.solo-menu button').length,
        totalLinks: document.querySelectorAll('.solo-menu a').length,
        ariaIssues: [],
        roleIssues: [],
        structureIssues: this.validateMenuStructure()
      };

      // Check for ARIA issues
      document.querySelectorAll('.solo-menu li[aria-haspopup], .solo-menu li[aria-expanded]').forEach(li => {
        report.ariaIssues.push(`LI element has ARIA attributes: ${li.className}`);
      });

      // Check for role issues
      document.querySelectorAll('.solo-menu li:not([role])').forEach(li => {
        report.roleIssues.push(`LI element missing role attribute`);
      });

      console.table(report);
      return report;
    }
  };

  // Auto-run on DOM ready if debug mode is enabled
  if (drupalSettings?.solo?.debug === true) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        Drupal.solo.ariaCleanup.run();
      });
    } else {
      Drupal.solo.ariaCleanup.run();
    }
  }

  // Expose commands for manual execution
  window.soloAriaCleanup = {
    run: () => Drupal.solo.ariaCleanup.run(),
    report: () => Drupal.solo.ariaCleanup.generateReport(),
    validate: () => Drupal.solo.ariaCleanup.validateMenuStructure()
  };

})(Drupal);
