/**
 * @file
 * Solo
 *
 * Filename:     solo-form-theme-settings.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal) => {
  "use strict";

  // Close details on load
  const formDetails = document.querySelectorAll(".system-theme-settings>details");
  formDetails.forEach((formDetail) => {
    formDetail.removeAttribute("open");
  });

  Drupal.behaviors.soloFormThemeSettings = {
    attach: function(context, settings) {

      // ========== NEW: TOGGLE ALL ACCORDIONS BUTTON ==========
      const createToggleAllButton = () => {
        const themeForm = context.querySelector("form.system-theme-settings");
        const firstAccordion = context.querySelector("form.system-theme-settings > details.form-wrapper");

        if (themeForm && firstAccordion && !context.querySelector("#solo-accordion-toggle-all")) {
          // Create button container
          const buttonContainer = document.createElement("div");
          buttonContainer.className = "form-item form-item--button-container solo-accordion-toggle-container";

          // Create the toggle button
          const toggleButton = document.createElement("button");
          toggleButton.id = "solo-accordion-toggle-all";
          toggleButton.type = "button";
          toggleButton.className = "button button--small solo-accordion-toggle-button";
          toggleButton.textContent = "Expand All Sections";
          toggleButton.setAttribute("data-state", "collapsed");

          // Create help text
          const helpText = document.createElement("div");
          helpText.className = "description solo-accordion-toggle-help";
          helpText.textContent = "Quickly expand or collapse all theme setting sections below.";

          buttonContainer.appendChild(toggleButton);
          buttonContainer.appendChild(helpText);

          // Insert before the first accordion
          firstAccordion.parentNode.insertBefore(buttonContainer, firstAccordion);

          // Add click event listener
          toggleButton.addEventListener("click", function() {
            const currentState = this.getAttribute("data-state");
            const allAccordions = context.querySelectorAll("form.system-theme-settings > details.form-wrapper");

            if (currentState === "collapsed") {
              // Expand all accordions
              allAccordions.forEach(accordion => {
                accordion.setAttribute("open", "true");
              });

              this.textContent = "Collapse All Sections";
              this.setAttribute("data-state", "expanded");
              helpText.textContent = "All sections are now expanded. Click to collapse them.";

            } else {
              // Collapse all accordions
              allAccordions.forEach(accordion => {
                accordion.removeAttribute("open");
              });

              this.textContent = "Expand All Sections";
              this.setAttribute("data-state", "collapsed");
              helpText.textContent = "All sections are now collapsed. Click to expand them.";
            }
          });

          // Update button state based on accordion states
          const updateButtonState = () => {
            const allAccordions = context.querySelectorAll("form.system-theme-settings > details.form-wrapper");
            const openAccordions = context.querySelectorAll("form.system-theme-settings > details.form-wrapper[open]");

            if (openAccordions.length === 0) {
              toggleButton.textContent = "Expand All Sections";
              toggleButton.setAttribute("data-state", "collapsed");
              helpText.textContent = "Quickly expand or collapse all theme setting sections below.";
            } else if (openAccordions.length === allAccordions.length) {
              toggleButton.textContent = "Collapse All Sections";
              toggleButton.setAttribute("data-state", "expanded");
              helpText.textContent = "All sections are expanded. Click to collapse them.";
            } else {
              toggleButton.textContent = "Expand All Sections";
              toggleButton.setAttribute("data-state", "mixed");
              helpText.textContent = `${openAccordions.length} of ${allAccordions.length} sections are open.`;
            }
          };

          // Listen for accordion toggle events to update button state
          const allAccordions = context.querySelectorAll("form.system-theme-settings > details.form-wrapper");
          allAccordions.forEach(accordion => {
            accordion.addEventListener("toggle", () => {
              setTimeout(updateButtonState, 50);
            });
          });

          // Initial state update
          setTimeout(updateButtonState, 100);
        }
      };

      // Create the toggle button
      createToggleAllButton();

      // ========== EXISTING THEME CATEGORY FUNCTIONALITY ==========
      const categorySelect = context.querySelector("#edit-theme-category");
      if (categorySelect) {
        const themeSelect = context.querySelector("#edit-predefined-current-theme");
        if (themeSelect) {
          // Initialize once
          if (categorySelect.getAttribute("data-solo-theme-settings-processed") !== "true") {
            categorySelect.setAttribute("data-solo-theme-settings-processed", "true");
            // Clone original options
            const initialOptions = Array.from(themeSelect.options);
            // Function to filter theme options based on selected category
            const filterThemeOptions = (selectedCategory) => {
              themeSelect.innerHTML = "";
              if (selectedCategory !== "none") {
                initialOptions.forEach((option) => {
                  if (option.value.startsWith(selectedCategory + "|")) {
                    themeSelect.appendChild(option.cloneNode(true));
                  }
                });
              }
            };
            // Filter options on category change
            categorySelect.addEventListener("change", function() {
              filterThemeOptions(this.value);
            });
            // Also filter options based on the default value or current value
            filterThemeOptions(categorySelect.value);
          }
        }
      }

      // ========== EXISTING VERTICAL TABS & ACCORDION FUNCTIONALITY ==========

      // Force ALL theme settings accordions to be collapsed on page load
      const allAccordions = context.querySelectorAll("form.system-theme-settings > details.form-wrapper");

      allAccordions.forEach(accordion => {
        if (!accordion.hasAttribute("data-solo-accordion-processed")) {
          accordion.setAttribute("data-solo-accordion-processed", "true");

          // Force close immediately
          accordion.removeAttribute("open");

          // Also try with a slight delay in case Drupal overrides it
          setTimeout(() => {
            accordion.removeAttribute("open");
          }, 50);
        }
      });

      // Handle vertical tabs behavior within accordions - completely dynamic
      const verticalTabsContainers = context.querySelectorAll("form.system-theme-settings > details.form-wrapper .vertical-tabs");

      verticalTabsContainers.forEach((verticalTabsContainer) => {
        if (!verticalTabsContainer.hasAttribute("data-solo-vertical-tabs-processed")) {
          verticalTabsContainer.setAttribute("data-solo-vertical-tabs-processed", "true");

          const initializeFirstTab = () => {
            const tabMenu = verticalTabsContainer.querySelector(".vertical-tabs__menu");
            const tabPanes = verticalTabsContainer.querySelectorAll(".vertical-tabs__items .vertical-tabs__pane");
            const menuItems = verticalTabsContainer.querySelectorAll(".vertical-tabs__menu .vertical-tabs__menu-item");
            const menuLinks = verticalTabsContainer.querySelectorAll(".vertical-tabs__menu .vertical-tabs__menu-link");

            if (tabMenu && tabPanes.length > 0 && menuItems.length > 0) {
              // Hide all tab panes first (use classes for animation)
              tabPanes.forEach(pane => {
                pane.classList.remove("is-active");
                pane.style.display = "block"; // Keep in DOM for animations
                pane.removeAttribute("open");
              });

              // Remove active states from all menu items
              menuItems.forEach(item => {
                item.classList.remove("is-selected");
              });

              // Show first tab pane and activate first menu item
              if (tabPanes[0] && menuItems[0]) {
                // Show the first panel with animation class
                tabPanes[0].style.display = "block";
                tabPanes[0].classList.add("is-active");
                tabPanes[0].setAttribute("open", "true");

                // Activate the first menu item
                menuItems[0].classList.add("is-selected");

                // Update hidden input if it exists
                const hiddenInput = verticalTabsContainer.querySelector("input[type=\"hidden\"][name$=\"__active_tab\"]");
                if (hiddenInput && tabPanes[0].id) {
                  hiddenInput.value = tabPanes[0].id;
                }
              }
            }
          };

          // Initialize immediately
          initializeFirstTab();

          // Also initialize after short delays to override Drupal's JS
          setTimeout(initializeFirstTab, 100);
          setTimeout(initializeFirstTab, 300);

          // Handle tab clicking - completely dynamic
          const menuLinks = verticalTabsContainer.querySelectorAll(".vertical-tabs__menu .vertical-tabs__menu-link");
          const tabPanes = verticalTabsContainer.querySelectorAll(".vertical-tabs__items .vertical-tabs__pane");
          const menuItems = verticalTabsContainer.querySelectorAll(".vertical-tabs__menu .vertical-tabs__menu-item");

          menuLinks.forEach(link => {
            link.addEventListener("click", function(e) {
              e.preventDefault();

              const clickedMenuItem = this.closest(".vertical-tabs__menu-item");
              const targetPane = this.getAttribute("href");

              if (targetPane && clickedMenuItem) {
                // Hide all panes and remove active states
                tabPanes.forEach(pane => {
                  pane.classList.remove("is-active");
                  pane.removeAttribute("open");
                });
                menuItems.forEach(item => {
                  item.classList.remove("is-selected");
                });

                // Show clicked pane and set active state
                const targetPaneElement = context.querySelector(targetPane);
                if (targetPaneElement) {
                  targetPaneElement.style.display = "block";
                  targetPaneElement.classList.add("is-active");
                  targetPaneElement.setAttribute("open", "true");
                }
                clickedMenuItem.classList.add("is-selected");

                // Update hidden input
                const hiddenInput = verticalTabsContainer.querySelector("input[type=\"hidden\"][name$=\"__active_tab\"]");
                if (hiddenInput) {
                  hiddenInput.value = targetPane.replace("#", "");
                }
              }
            });
          });

          // Watch for changes and re-initialize if needed
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === "attributes" && (mutation.attributeName === "class" || mutation.attributeName === "style")) {
                const targetElement = mutation.target;
                if (targetElement.classList.contains("vertical-tabs__pane") && !targetElement.classList.contains("is-active")) {
                  // Check if this pane should be visible (its menu item is selected)
                  const targetId = "#" + targetElement.id;
                  const correspondingMenuItem = verticalTabsContainer.querySelector(`a[href="${targetId}"]`)?.closest(".vertical-tabs__menu-item");
                  if (correspondingMenuItem && correspondingMenuItem.classList.contains("is-selected")) {
                    targetElement.style.display = "block";
                    targetElement.classList.add("is-active");
                    targetElement.setAttribute("open", "true");
                  }
                }
              }
            });
          });

          // Observe all tab panes for this vertical tabs container
          tabPanes.forEach(pane => {
            observer.observe(pane, { attributes: true, attributeFilter: ["style", "class"] });
          });
        }
      });

      // When accordions are opened, ensure proper vertical tab behavior - completely dynamic
      allAccordions.forEach(accordion => {
        if (!accordion.hasAttribute("data-solo-accordion-toggle-processed")) {
          accordion.setAttribute("data-solo-accordion-toggle-processed", "true");

          accordion.addEventListener("toggle", function() {
            if (this.hasAttribute("open")) {
              // Small delay to ensure DOM is ready
              setTimeout(() => {
                const verticalTabs = this.querySelector(".vertical-tabs");
                if (verticalTabs) {
                  const tabPanes = verticalTabs.querySelectorAll(".vertical-tabs__items .vertical-tabs__pane");
                  const menuItems = verticalTabs.querySelectorAll(".vertical-tabs__menu .vertical-tabs__menu-item");

                  // Hide all tabs first
                  tabPanes.forEach(pane => {
                    pane.classList.remove("is-active");
                    pane.removeAttribute("open");
                  });
                  menuItems.forEach(item => {
                    item.classList.remove("is-selected");
                  });

                  // Show first tab and activate first menu item
                  if (tabPanes[0] && menuItems[0]) {
                    tabPanes[0].style.display = "block";
                    tabPanes[0].classList.add("is-active");
                    tabPanes[0].setAttribute("open", "true");
                    menuItems[0].classList.add("is-selected");

                    // Update hidden input
                    const hiddenInput = verticalTabs.querySelector("input[type=\"hidden\"][name$=\"__active_tab\"]");
                    if (hiddenInput && tabPanes[0].id) {
                      hiddenInput.value = tabPanes[0].id;
                    }
                  }
                }
              }, 100);
            }
          });
        }
      });
    }
  };
})(Drupal);
