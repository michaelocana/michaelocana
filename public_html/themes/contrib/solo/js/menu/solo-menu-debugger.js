/**
 * @file
 * Solo Menu Debugger - Development tool for identifying conflicts
 *
 * Add this file during development to track menu state changes
 * and identify conflicts between components.
 */
((Drupal) => {
  'use strict';

  // Only run in development (check for debug flag or localhost)
  const isDevelopment = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('.local') ||
                       drupalSettings?.solo?.debug === true;

  if (!isDevelopment) {
    console.log('Solo Menu Debugger: Disabled in production');
    return;
  }

  console.log('%cSolo Menu Debugger: Enabled', 'color: green; font-weight: bold');

  // Initialize debugger namespace
  Drupal.solo = Drupal.solo || {};
  Drupal.solo.debugger = {
    // Track all state changes
    stateLog: [],

    // Track conflicts
    conflicts: [],

    // Track performance
    performance: {
      resizeCount: 0,
      animationCount: 0,
      stateChangeCount: 0
    },

    /**
     * Log state changes
     */
    logStateChange(component, action, element, details) {
      const entry = {
        timestamp: new Date().toISOString(),
        component,
        action,
        element: element?.id || element?.className || 'unknown',
        details,
        stackTrace: new Error().stack
      };

      this.stateLog.push(entry);
      this.performance.stateChangeCount++;

      // Console output with styling
      console.groupCollapsed(
        `%c[${component}] ${action}`,
        'color: white; font-weight: bold'
      );
      console.log('Element:', element);
      console.log('Details:', details);
      console.trace();
      console.groupEnd();
    },

    /**
     * Log conflicts
     */
    logConflict(type, components, element, details) {
      const conflict = {
        timestamp: new Date().toISOString(),
        type,
        components,
        element: element?.id || element?.className || 'unknown',
        details
      };

      this.conflicts.push(conflict);

      // Console warning with styling
      console.groupCollapsed(
        `%c⚠️ CONFLICT: ${type}`,
        'color: red; font-weight: bold; font-size: 14px'
      );
      console.warn('Components involved:', components);
      console.warn('Element:', element);
      console.warn('Details:', details);
      console.trace();
      console.groupEnd();
    },

    /**
     * Monitor ARIA attributes
     */
    monitorAria() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' &&
              mutation.attributeName?.startsWith('aria-')) {

            const oldValue = mutation.oldValue;
            const newValue = mutation.target.getAttribute(mutation.attributeName);

            // Check for rapid changes (potential conflict)
            const recentChanges = this.stateLog.filter(log =>
              log.element === (mutation.target.id || mutation.target.className) &&
              log.action === 'aria-change' &&
              Date.now() - new Date(log.timestamp).getTime() < 100
            );

            if (recentChanges.length > 0) {
              this.logConflict(
                'Rapid ARIA Change',
                recentChanges.map(c => c.component),
                mutation.target,
                {
                  attribute: mutation.attributeName,
                  oldValue,
                  newValue,
                  changeCount: recentChanges.length + 1
                }
              );
            }
          }
        });
      });

      // Observe all menu elements
      document.querySelectorAll('.solo-menu').forEach(menu => {
        observer.observe(menu, {
          attributes: true,
          attributeOldValue: true,
          subtree: true,
          attributeFilter: ['aria-expanded', 'aria-hidden', 'aria-controls']
        });
      });
    },

    /**
     * Monitor tabindex changes
     */
    monitorTabindex() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' &&
              mutation.attributeName === 'tabindex') {

            this.logStateChange(
              'unknown',
              'tabindex-change',
              mutation.target,
              {
                oldValue: mutation.oldValue,
                newValue: mutation.target.getAttribute('tabindex')
              }
            );
          }
        });
      });

      // Observe all interactive elements
      document.querySelectorAll('.solo-menu a, .solo-menu button').forEach(element => {
        observer.observe(element, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: ['tabindex']
        });
      });
    },

    /**
     * Monitor resize events
     */
    monitorResize() {
      let resizeCount = 0;
      const originalAddEventListener = window.addEventListener;

      window.addEventListener = function(event, handler, options) {
        if (event === 'resize') {
          resizeCount++;
          console.log(
            `%c📐 Resize listener #${resizeCount} added`,
            'color: orange',
            new Error().stack
          );
        }
        return originalAddEventListener.call(this, event, handler, options);
      };
    },

    /**
     * Monitor animations
     */
    monitorAnimations() {
      const originalSlideUp = Drupal.solo.slideUp;
      const originalSlideDown = Drupal.solo.slideDown;

      Drupal.solo.slideUp = (element, ...args) => {
        this.performance.animationCount++;
        this.logStateChange('animation', 'slideUp', element, { args });
        return originalSlideUp(element, ...args);
      };

      Drupal.solo.slideDown = (element, ...args) => {
        this.performance.animationCount++;
        this.logStateChange('animation', 'slideDown', element, { args });
        return originalSlideDown(element, ...args);
      };
    },

    /**
     * Generate debug report
     */
    generateReport() {
      console.group('%c📊 Solo Menu Debug Report', 'color: green; font-size: 16px; font-weight: bold');

      // Summary
      console.group('Summary');
      console.log('Total state changes:', this.performance.stateChangeCount);
      console.log('Total conflicts:', this.conflicts.length);
      console.log('Animation calls:', this.performance.animationCount);
      console.groupEnd();

      // Conflicts by type
      console.group('Conflicts by Type');
      const conflictsByType = this.conflicts.reduce((acc, conflict) => {
        acc[conflict.type] = (acc[conflict.type] || 0) + 1;
        return acc;
      }, {});
      console.table(conflictsByType);
      console.groupEnd();

      // Recent conflicts
      if (this.conflicts.length > 0) {
        console.group('Recent Conflicts (last 5)');
        this.conflicts.slice(-5).forEach(conflict => {
          console.log(`${conflict.timestamp}: ${conflict.type}`, conflict);
        });
        console.groupEnd();
      }

      // Performance metrics
      console.group('Performance Metrics');
      console.log('State changes per minute:',
        (this.performance.stateChangeCount / (Date.now() - this.startTime) * 60000).toFixed(2)
      );
      console.groupEnd();

      console.groupEnd();
    },

    /**
     * Start debugging
     */
    start() {
      this.startTime = Date.now();
      this.monitorAria();
      this.monitorTabindex();
      this.monitorResize();
      this.monitorAnimations();

      // Set up report generation
      window.soloMenuReport = () => this.generateReport();

      // Auto-report on page unload
      window.addEventListener('beforeunload', () => {
        if (this.conflicts.length > 0) {
          console.warn('Solo Menu: Conflicts detected during session:', this.conflicts);
        }
      });

      console.log('%cSolo Menu Debugger started. Type soloMenuReport() in console for report.',
        'color: green; font-style: italic'
      );
    },

    /**
     * Visual conflict indicator
     */
    showVisualIndicator(element, type) {
      if (!element || !element.style) return;

      const originalOutline = element.style.outline;
      element.style.outline = '3px solid red';
      element.setAttribute('data-solo-conflict', type);

      setTimeout(() => {
        element.style.outline = originalOutline;
        element.removeAttribute('data-solo-conflict');
      }, 2000);
    }
  };

  // Auto-start debugger
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      Drupal.solo.debugger.start();
    });
  } else {
    Drupal.solo.debugger.start();
  }

  // Expose debugging functions globally for console access
  window.soloDebug = {
    logs: () => Drupal.solo.debugger.stateLog,
    conflicts: () => Drupal.solo.debugger.conflicts,
    report: () => Drupal.solo.debugger.generateReport(),
    clear: () => {
      Drupal.solo.debugger.stateLog = [];
      Drupal.solo.debugger.conflicts = [];
      console.log('Solo debugger cleared');
    }
  };

})(Drupal);
