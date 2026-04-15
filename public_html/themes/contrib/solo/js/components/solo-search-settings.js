/**
 * @file
 * Contains utility functions for Solo module.
 *
 * Filename: solo-search-settings.js
 * Website: https://www.flashwebcenter.com
 * Developer: Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal, drupalSettings, once) => {  // FIXED: Added drupalSettings parameter
  'use strict';
  Drupal.behaviors.soloSearchBlock = {
    attach: function (context) {
      // Fetch content types from drupalSettings.
      const contentTypes = drupalSettings?.solo?.searchContentTypes;
      // console.log('Content Types:', contentTypes, typeof contentTypes);
      // Validate contentTypes: Ensure it's an object and not empty.
      if (contentTypes && Object.keys(contentTypes).length > 0) {
        // Select the search block form using `once` to avoid duplicate bindings.
        const searchBlockForms = once('solo-search-block', '.solo-search-block-form', context);
        searchBlockForms.forEach((searchBlockForm) => {
          searchBlockForm.addEventListener('submit', function (event) {
            event.preventDefault();
            // FIXED: Get the search input value with error handling.
            const searchInputElement = searchBlockForm.querySelector('input[name="keys"]');
            if (!searchInputElement || !searchInputElement.value.trim()) {
              return; // Exit if no search term
            }
            const searchInput = searchInputElement.value.trim();

            // Initialize URL with the search term.
            let actionUrl = `/search/node?keys=${encodeURIComponent(searchInput)}`;
            // Add content types as filters.
            Object.entries(contentTypes).forEach(([key, value], index) => {
              const filterKey = `f[${index}]`;
              const filterValue = `type:${value}`;
              actionUrl += `&${encodeURIComponent(filterKey)}=${encodeURIComponent(filterValue)}`;
            });
            // Ensure 'advanced-form=1' is appended only once.
            if (!actionUrl.includes('advanced-form=1')) {
              actionUrl += `&advanced-form=1`;
            }
            // Redirect to the new URL.
            window.location.href = actionUrl;
          });
        });
      }
    },
  };
})(Drupal, drupalSettings, once);
