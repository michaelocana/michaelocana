/**
 * @file
 * Solo Color Picker functionality.
 *
 * Filename:     solo-color-picker.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
(function (Drupal, drupalSettings, once) {
  'use strict';

  // Store references for cleanup
  const eventListeners = new WeakMap();

  // Counter for unique IDs
  let colorInputCounter = 0;

  /**
   * Validates if a color value is complete and valid.
   *
   * @param {string} value - The color value to validate.
   * @return {boolean} - Whether the color is valid.
   */
  const isValidColor = (value) => {
    if (!value || value === '') {
      return true; // Empty is valid (unset state)
    }
    // Only complete hex colors
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexPattern.test(value);
  };

  /**
   * Converts #RGB to #RRGGBB format for color input compatibility.
   *
   * @param {string} value - The hex color value.
   * @return {string} - Normalized hex color or original value.
   */
  const toSixDigitHex = (value) => {
    // precondition: value is '' or valid #RGB/#RRGGBB (per isValidColor)
    if (!value) return value;

    const m = /^#([A-Fa-f0-9]{3})$/.exec(value);
    if (m) {
      const [r, g, b] = m[1].split('');
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return value.toUpperCase(); // normalize casing
  };

  /**
   * Input event callback to keep text & color inputs in sync.
   *
   * @param {HTMLElement} changedInput - Input element changed by user.
   * @param {HTMLElement} inputToSync - Input element to synchronize.
   */
  const synchronizeInputs = (changedInput, inputToSync) => {
    try {
      const value = changedInput.value;

      // Only sync if value is valid or empty
      if (isValidColor(value)) {
        requestAnimationFrame(() => {
          // For empty values, reset color input to default
          if (value === '') {
            if (inputToSync.type === 'color') {
              inputToSync.value = '#000000'; // Color inputs can't be empty
            } else {
              inputToSync.value = '';
            }
          } else {
            // Normalize hex for color inputs
            inputToSync.value = (inputToSync.type === 'color')
              ? toSixDigitHex(value)
              : value;
          }

          // Always update data attributes to maintain state
          changedInput.setAttribute('data-solo-custom-color', value);
          inputToSync.setAttribute('data-solo-custom-color', value);
        });
      }
      // If invalid, don't sync - let user continue typing
    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Color Picker: Error synchronizing inputs', error);
      }
    }
  };

  /**
   * Creates a color input element based on text input.
   *
   * @param {HTMLElement} textInput - The text input element.
   * @return {HTMLElement|null} - The created color input or null on error.
   */
  const createColorInput = (textInput) => {
    try {
      const colorInput = document.createElement('input');
      colorInput.type = 'color';

      // Generate deterministic ID
      const baseId = textInput.id || 'solo-color-picker';
      colorInput.id = `${baseId}-color-${++colorInputCounter}`;

      // Maintain exact same classes for backward compatibility
      colorInput.classList.add(
        'form-color',
        'form-element',
        'form-element--type-color',
        'form-element--api-color'
      );

      // Set initial value - normalize hex for color input
      const textValue = textInput.value;
      if (textValue && isValidColor(textValue)) {
        colorInput.value = toSixDigitHex(textValue);
      } else {
        colorInput.value = '#000000';
      }

      // Don't set name attribute to avoid form submission side effects
      // Visual-only companion inputs typically don't need names

      const customColor = textInput.getAttribute('data-solo-custom-color') || textValue || '';
      colorInput.setAttribute('data-solo-custom-color', customColor);

      return colorInput;
    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Color Picker: Error creating color input', error);
      }
      return null;
    }
  };

  /**
   * Updates label to work with both inputs while maintaining click behavior.
   *
   * @param {HTMLElement} textInput - The text input element.
   * @param {HTMLElement} colorInput - The color input element.
   * @param {HTMLElement} context - The context element for scoped queries.
   */
  const updateLabelAttributes = (textInput, colorInput, context) => {
    try {
      const fieldID = textInput.id;
      if (!fieldID) return;

      const scope = context || document;
      const label = scope.querySelector(`label[for="${fieldID}"]`);
      if (!label) return;

      // Avoid double-wrapping
      let wrapper = textInput.closest('.solo-color-picker-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'solo-color-picker-wrapper';
        if (!textInput.parentNode) {return;}
        textInput.parentNode.insertBefore(wrapper, textInput);
        wrapper.appendChild(textInput);
        wrapper.appendChild(colorInput);
      } else if (!wrapper.contains(colorInput)) {
        wrapper.appendChild(colorInput);
      }

      // Share the label with both inputs; keep the "for" intact
      if (!label.id) {
        label.id = `${fieldID}-label`;
      }
      textInput.setAttribute('aria-labelledby', label.id);
      colorInput.setAttribute('aria-labelledby', label.id);
    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Color Picker: Error updating label attributes', error);
      }
    }
  };

  /**
   * Adds input event listeners with proper namespacing.
   *
   * @param {HTMLElement} textInput - The text input element.
   * @param {HTMLElement} colorInput - The color input element.
   */
  const addInputEventListener = (textInput, colorInput) => {
    try {
      let textTimeout;

      const textInputHandler = () => {
        clearTimeout(textTimeout);
        textTimeout = setTimeout(() => {
          synchronizeInputs(textInput, colorInput);
        }, 300);
      };

      const colorInputHandler = () => {
        // Intentional selections should sync immediately
        synchronizeInputs(colorInput, textInput);
      };

      // Define the change handler once
      const textChangeHandler = () => synchronizeInputs(textInput, colorInput);
      const colorChangeHandler = colorInputHandler; // Same reference

      textInput.addEventListener('input', textInputHandler);
      colorInput.addEventListener('input', colorInputHandler);
      textInput.addEventListener('change', textChangeHandler);
      colorInput.addEventListener('change', colorChangeHandler);

      eventListeners.set(textInput, {
        textInput: textInputHandler,
        textChange: textChangeHandler,
        colorInput: colorInputHandler,
        colorChange: colorChangeHandler,
        clearTextTimeout: () => clearTimeout(textTimeout),
      });
    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Color Picker: Error adding event listeners', error);
      }
    }
  };

  /**
   * Removes event listeners for cleanup.
   *
   * @param {HTMLElement} textInput - The text input element.
   * @param {HTMLElement} colorInput - The color input element.
   */
  const removeInputEventListener = (textInput, colorInput) => {
    try {
      const listeners = eventListeners.get(textInput);
      if (!listeners) return;

      textInput.removeEventListener('input', listeners.textInput);
      textInput.removeEventListener('change', listeners.textChange);
      colorInput.removeEventListener('input', listeners.colorInput);
      colorInput.removeEventListener('change', listeners.colorChange);
      listeners.clearTextTimeout?.();

      eventListeners.delete(textInput);
    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Color Picker: Error removing event listeners', error);
      }
    }
  };

  /**
   * Initializes a color picker for a text input.
   *
   * @param {HTMLElement} textInput - The text input element.
   * @param {HTMLElement} context - The context element.
   */
  const initColorPicker = (textInput, context) => {
    try {
      // Defensive check
      if (!textInput || textInput.nodeType !== 1) {
        return;
      }

      const colorInput = createColorInput(textInput);
      if (!colorInput) {
        return;
      }

      // Store reference for cleanup using the ID we created
      textInput.setAttribute('data-solo-color-input-id', colorInput.id);

      // Insert color input after text input (before wrapping)
      textInput.after(colorInput);

      updateLabelAttributes(textInput, colorInput, context);
      addInputEventListener(textInput, colorInput);

    } catch (error) {
      if (window.console && console.error) {
        console.error('Solo Color Picker: Error initializing color picker', error);
      }
    }
  };

  /**
   * Solo Color Picker behavior.
   *
   * @type {Drupal~behavior}
   * @prop {Drupal~behaviorAttach} attach
   *   Initializes color picker fields.
   * @prop {Drupal~behaviorDetach} detach
   *   Cleans up color picker fields.
   */
  Drupal.behaviors.soloColorPicker = {
    attach: function (context, settings) {
      // Use context for AJAX compatibility
      const colorTextInputs = once(
        'solo-color-picker',
        '[data-drupal-selector="solo-color-picker"] input[type="text"]',
        context
      );

      // Initialize each color picker with context
      colorTextInputs.forEach((textInput) => {
        initColorPicker(textInput, context);
      });
    },

    detach: function (context, settings, trigger) {
      // Keep widget intact when nodes are merely moved in the DOM.
      if (trigger === 'move') {
        return;
      }

      if (trigger === 'unload') {
        const candidates = context.querySelectorAll(
          '[data-drupal-selector="solo-color-picker"] input[type="text"]'
        );
        const processedInputs = once.filter('solo-color-picker', candidates);

        processedInputs.forEach(function (textInput) {
          try {
            const colorInputId = textInput.getAttribute('data-solo-color-input-id');
            if (!colorInputId) return;
            const colorInput = document.getElementById(colorInputId);
            if (!colorInput) return;

            removeInputEventListener(textInput, colorInput);

            const wrapper = colorInput.closest('.solo-color-picker-wrapper');
            if (wrapper && wrapper.parentNode) {
              wrapper.parentNode.insertBefore(textInput, wrapper);
              wrapper.remove(); // removes color input with it
            } else {
              colorInput.remove();
            }
          } catch (error) {
            console.error('Solo Color Picker: Error during detach', error);
          }
        });

        // Remove once marker only when unloading.
        once.remove('solo-color-picker', processedInputs);
      }
    }

  };

})(Drupal, drupalSettings, once);
