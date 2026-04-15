((Drupal) => {
  'use strict';
  Drupal.solo = Drupal.solo || {};
  Drupal.solo.keyboard = Drupal.solo.keyboard || {};

  class KeyboardMegamenuModule {
    constructor(core) {
      this.core = core;
      this.menubar = core.menubar;
      this.handleMegamenuKeydown = this.handleMegamenuKeydown.bind(this);
    }

    init() {
      if (!this.core.templateInfo.isMegamenu) return;
      this.enhanceMegamenuNavigation();
    }

    enhanceMegamenuNavigation() {
      const megaMenus = this.menubar.querySelectorAll('.sub-mega, .sub__mega, [class*="sub-mega"]');
      megaMenus.forEach(megaMenu => {
        megaMenu.querySelectorAll('a, button').forEach(item => {
          item.addEventListener('keydown', this.handleMegamenuKeydown);
        });
      });
    }

    handleMegamenuKeydown(event) {
      const megaMenu = event.target.closest('.sub-mega, .sub__mega, [class*="sub-mega"]');
      if (!megaMenu) return;

      const columns = this.getMegamenuColumns(megaMenu);
      const position = this.findItemPosition(event.target, columns);
      if (!position) return;

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          event.stopPropagation();
          this.navigateColumns(position, columns, 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          event.stopPropagation();
          this.navigateColumns(position, columns, -1);
          break;
      }
    }

    getMegamenuColumns(megaMenu) {
      const columns = [];
      const columnElements = megaMenu.querySelectorAll(':scope > li, .megamenu-column');

      columnElements.forEach(column => {
        const items = Array.from(column.querySelectorAll('a, button'))
          .filter(item => this.isVisible(item) && !item.closest('ul ul'));
        if (items.length > 0) {
          columns.push(items);
        }
      });

      return columns;
    }

    findItemPosition(item, columns) {
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const itemIndex = columns[colIndex].indexOf(item);
        if (itemIndex !== -1) {
          return { column: colIndex, item: itemIndex };
        }
      }
      return null;
    }

    navigateColumns(position, columns, direction) {
      const utils = this.core.getModule('utils');
      const isRTL = utils?.isRTL() || false;
      const actualDirection = isRTL ? -direction : direction;

      let targetColumn = position.column + actualDirection;
      if (targetColumn < 0) targetColumn = columns.length - 1;
      if (targetColumn >= columns.length) targetColumn = 0;

      const targetItems = columns[targetColumn];
      if (targetItems && targetItems.length > 0) {
        const targetIndex = Math.min(position.item, targetItems.length - 1);
        const targetItem = targetItems[targetIndex];
        if (targetItem) {
          targetItem.focus();
          const focusModule = this.core.getModule('focus');
          if (focusModule) {
            focusModule.updateRovingTabindex(targetItem);
          }
        }
      }
    }

    isVisible(element) {
      const utils = this.core.getModule('utils');
      return utils ? utils.isVisible(element) : (element.offsetParent !== null);
    }

    destroy() {
      if (!this.core.templateInfo.isMegamenu) return;

      const megaMenus = this.menubar.querySelectorAll('.sub-mega, .sub__mega, [class*="sub-mega"]');
      megaMenus.forEach(megaMenu => {
        megaMenu.querySelectorAll('a, button').forEach(item => {
          item.removeEventListener('keydown', this.handleMegamenuKeydown);
        });
      });
    }
  }

  Drupal.solo.keyboard.megamenu = KeyboardMegamenuModule;
})(Drupal);
