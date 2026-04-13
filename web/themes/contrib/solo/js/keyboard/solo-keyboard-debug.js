((Drupal, drupalSettings) => {
  'use strict';

  const isDevelopment = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('.local') ||
                       drupalSettings?.solo?.debug === true;

  if (!isDevelopment) return;

  console.log('%cSolo Keyboard Debug: Enabled', 'color: green; font-weight: bold');

  window.soloKeyboardDebug = {
    checkMenuState: (selector = '.solo-keyboard-enabled') => {
      const wrapper = document.querySelector(selector);
      if (!wrapper) {
        console.error('Menu wrapper not found');
        return;
      }

      console.group('%c🔍 Menu State', 'color: blue; font-weight: bold');
      console.log('Wrapper:', wrapper);
      console.log('Classes:', Array.from(wrapper.classList));
      console.log('Template Info:', wrapper._soloKeyboardInstance?.templateInfo);

      const menubar = wrapper.querySelector('[role="menubar"]');
      console.log('Menubar:', menubar);
      console.log('Is Open:', menubar?.classList.contains('toggled'));

      const buttons = wrapper.querySelectorAll('.dropdown-toggler');
      console.log('Dropdown buttons:', buttons.length);

      buttons.forEach((button, i) => {
        const submenu = button.nextElementSibling;
        console.group(`Button ${i}:`);
        console.log('Button:', button);
        console.log('Aria-expanded:', button.getAttribute('aria-expanded'));
        console.log('Submenu:', submenu);
        console.log('Submenu toggled:', submenu?.classList.contains('toggled'));
        console.groupEnd();
      });
      console.groupEnd();
    },

    checkKeyboardEvent: () => {
      document.addEventListener('keydown', (e) => {
        if (e.target.closest('.solo-keyboard-enabled') && (e.key === 'Enter' || e.key === ' ')) {
          console.log('Key pressed:', e.key);
          console.log('Target element:', e.target);
          console.log('Tag name:', e.target.tagName);
          console.log('Href:', e.target.getAttribute('href'));
          console.log('Role:', e.target.getAttribute('role'));
          console.log('Tabindex:', e.target.getAttribute('tabindex'));
          console.log('Default prevented:', e.defaultPrevented);
        }
      }, true);
    },

    testKeyboardNav: () => {
      console.log('%c⌨️ Keyboard Navigation Test', 'color: orange; font-weight: bold');
      console.log('Press Tab to start navigation');
      console.log('Use arrow keys to navigate');
      console.log('Press Escape to close submenus');
    }
  };

  console.log('%cDebug commands:', 'color: green; font-style: italic');
  console.log('soloKeyboardDebug.checkMenuState()');
  console.log('soloKeyboardDebug.checkFocusableItems()');
  console.log('soloKeyboardDebug.checkKeyboardEvent()');
  console.log('soloKeyboardDebug.testKeyboardNav()');

})(Drupal, drupalSettings);
