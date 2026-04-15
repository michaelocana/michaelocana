((Drupal) => {
  'use strict';
  Drupal.solo = Drupal.solo || {};
  Drupal.solo.keyboard = Drupal.solo.keyboard || {};

  class KeyboardUtilsModule {
    constructor(core) {
      this.core = core;
    }

    init() {}

    isVisible(element) {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.display !== 'none' &&
             style.visibility !== 'hidden' &&
             style.opacity !== '0' &&
             element.offsetParent !== null;
    }

    isInteractive(element) {
      if (!element) return false;
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'li') return false;

      const isInteractiveTag = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName);
      const hasTabindex = element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1';
      const isContentEditable = element.getAttribute('contenteditable') === 'true';

      return isInteractiveTag || hasTabindex || isContentEditable;
    }

    getClosestMenuItem(element) {
      const li = element.closest('li');
      if (!li) return null;

      const link = li.querySelector(':scope > a');
      const button = li.querySelector(':scope > button');

      return link || button;
    }

    getAllMenuItems(container = this.core.menubar) {
      return Array.from(container.querySelectorAll('a[role="menuitem"], button[role="menuitem"]'))
        .filter(item => this.isVisible(item));
    }

    getNextMenuItem(current, items) {
      const index = items.indexOf(current);
      if (index === -1) return null;
      return items[(index + 1) % items.length];
    }

    getPreviousMenuItem(current, items) {
      const index = items.indexOf(current);
      if (index === -1) return null;
      return items[(index - 1 + items.length) % items.length];
    }

    getFirstItem(container) {
      if (!container) return null;
      const items = container.querySelectorAll(':scope > li > a, :scope > li > button');
      for (let item of items) {
        if (this.isVisible(item)) return item;
      }
      return null;
    }

    getLastItem(container) {
      if (!container) return null;
      const items = Array.from(container.querySelectorAll(':scope > li > a, :scope > li > button'));
      for (let i = items.length - 1; i >= 0; i--) {
        if (this.isVisible(items[i])) return items[i];
      }
      return null;
    }

    normalizeKey(event) {
      return event.key || String.fromCharCode(event.keyCode);
    }

    isRTL() {
      return document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
    }

    announce(message, priority = 'polite') {
      if (Drupal.announce) {
        Drupal.announce(message);
      } else {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }
    }

    destroy() {}
  }

  Drupal.solo.keyboard.utils = KeyboardUtilsModule;
})(Drupal);
