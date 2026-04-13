<?php

/**
 * @file
 * Solo Theme.
 *
 * Filename:     solo.theme
 * Website:      http://www.flashwebcenter.com
 * Description:  template
 * Author:       Alaa Haddad http://www.alaahaddad.com.
 */

// Popup login block region.
if (array_key_exists("popup_login_block", $updated_regions["mix"])) {

  $region = "popup_login_block";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure the popup login functionality, styling, and advanced behavior options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["popup_login_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-popup-configuration",
  ];

  // Popup Configuration Tab.
  $form["solo_settings"]["settings_{$region}"]["popup_configuration"] = [
    "#type" => "details",
    "#title" => t("Popup Configuration"),
    "#group" => "popup_login_tabs",
    "#weight" => -10,
    "#id" => "edit-popup-configuration",
  ];

  $form["solo_settings"]["settings_{$region}"]["popup_configuration"]["classes_{$region}"] = _generate_css_classes($region, $label);

  $form["solo_settings"]["settings_{$region}"]["popup_configuration"]["header_popup_login"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to login via a popup block. <strong><a class='error' href='/admin/structure/block'>The User Login Block Must Be Enabled</a></strong>"),
    "#description" => t("This feature provides an option for users to login via a popup block. When the user checks the box labeled 'Login in a Popup Block', instead of being redirected to a separate login page, a popup block will appear on the current page. This popup block will contain the necessary fields for the user to enter their login credentials."),
    "#default_value" => theme_get_setting("header_popup_login"),
  ];

  $form["solo_settings"]["settings_{$region}"]["popup_configuration"]["header_login_links"] = [
    "#type" => "textfield",
    "#title" => t("You can change the login word."),
    "#default_value" => theme_get_setting("header_login_links") ?? "Login",
    "#states" => [
      "visible" => [
        ":input[name='header_popup_login']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Advanced Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["advanced_settings"] = [
    "#type" => "details",
    "#title" => t("Advanced Settings"),
    "#group" => "popup_login_tabs",
    "#weight" => -8,
  ];

  // Style method setting.
  $form["solo_settings"]["settings_{$region}"]["advanced_settings"]["popup_login_use_inline_styles"] = [
    "#type" => "checkbox",
    "#title" => t("Use inline styles"),
    "#description" => t("Use inline styles for z-index and display. Uncheck this if you experience conflicts with other modules that modify styles. When unchecked, CSS classes and variables will be used instead. <strong>Note: Checking this option will enable additional settings below and in the Accessibility & Behavior tab.</strong>"),
    "#default_value" => theme_get_setting("popup_login_use_inline_styles") ?? FALSE,
    "#states" => [
      "visible" => [
        ":input[name='header_popup_login']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Animation duration.
  $form["solo_settings"]["settings_{$region}"]["advanced_settings"]["popup_login_animation_duration"] = [
    "#type" => "number",
    "#title" => t("Animation duration (milliseconds)"),
    "#description" => t("Duration of open/close animations in milliseconds. Default: 300ms"),
    "#default_value" => theme_get_setting("popup_login_animation_duration") ?? 300,
    "#min" => 0,
    "#max" => 1000,
    "#step" => 50,
    "#field_suffix" => t("ms"),
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Z-index setting.
  $form["solo_settings"]["settings_{$region}"]["advanced_settings"]["popup_login_z_index"] = [
    "#type" => "number",
    "#title" => t("Z-index"),
    "#description" => t("The z-index value for the popup overlay. Adjust if the popup appears behind other elements."),
    "#default_value" => theme_get_setting("popup_login_z_index") ?? 10000,
    "#min" => 1,
    "#max" => 999999,
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Overlay opacity.
  $form["solo_settings"]["settings_{$region}"]["advanced_settings"]["popup_login_overlay_opacity"] = [
    "#type" => "number",
    "#title" => t("Overlay opacity"),
    "#description" => t("The opacity of the background overlay (0-100)."),
    "#default_value" => theme_get_setting("popup_login_overlay_opacity") ?? 50,
    "#min" => 0,
    "#max" => 100,
    "#field_suffix" => "%",
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Custom trigger selectors.
  $form["solo_settings"]["settings_{$region}"]["advanced_settings"]["popup_login_custom_triggers"] = [
    "#type" => "textfield",
    "#title" => t("Custom trigger selectors"),
    "#description" => t("Additional CSS selectors for elements that should trigger the login popup. Separate multiple selectors with commas. Example: .my-login-button, #custom-login-link"),
    "#default_value" => theme_get_setting("popup_login_custom_triggers") ?? "",
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Accessibility & Behavior Tab.
  $form["solo_settings"]["settings_{$region}"]["accessibility_behavior"] = [
    "#type" => "details",
    "#title" => t("Accessibility & Behavior"),
    "#group" => "popup_login_tabs",
    "#weight" => -6,
  ];

  // Close on escape key.
  $form["solo_settings"]["settings_{$region}"]["accessibility_behavior"]["popup_login_close_on_escape"] = [
    "#type" => "checkbox",
    "#title" => t("Close on Escape key"),
    "#description" => t("Allow users to close the popup by pressing the Escape key."),
    "#default_value" => theme_get_setting("popup_login_close_on_escape") ?? TRUE,
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Close on outside click.
  $form["solo_settings"]["settings_{$region}"]["accessibility_behavior"]["popup_login_close_on_outside_click"] = [
    "#type" => "checkbox",
    "#title" => t("Close on outside click"),
    "#description" => t("Close the popup when clicking outside of the login form."),
    "#default_value" => theme_get_setting("popup_login_close_on_outside_click") ?? TRUE,
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Focus trap.
  $form["solo_settings"]["settings_{$region}"]["accessibility_behavior"]["popup_login_focus_trap"] = [
    "#type" => "checkbox",
    "#title" => t("Enable focus trap"),
    "#description" => t("Trap keyboard focus within the popup for better accessibility. Recommended for WCAG compliance."),
    "#default_value" => theme_get_setting("popup_login_focus_trap") ?? TRUE,
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Screen reader announcements.
  $form["solo_settings"]["settings_{$region}"]["accessibility_behavior"]["popup_login_announce_to_screen_readers"] = [
    "#type" => "checkbox",
    "#title" => t("Announce to screen readers"),
    "#description" => t("Announce popup state changes to screen reader users for better accessibility."),
    "#default_value" => theme_get_setting("popup_login_announce_to_screen_readers") ?? TRUE,
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Return focus on close.
  $form["solo_settings"]["settings_{$region}"]["accessibility_behavior"]["popup_login_return_focus_on_close"] = [
    "#type" => "checkbox",
    "#title" => t("Return focus on close"),
    "#description" => t("Return keyboard focus to the element that triggered the popup when it closes."),
    "#default_value" => theme_get_setting("popup_login_return_focus_on_close") ?? TRUE,
    "#states" => [
      "visible" => [
        ":input[name='popup_login_use_inline_styles']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings_tab"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "popup_login_tabs",
    "#weight" => -4,
    '#attributes' => [
      'class' => ['solo-color-panel'],
      'data-solo-panel' => 'colors',
    ],
  ];

  foreach ($attributes as $attribute_key => $attribute_label) {
    $form["solo_settings"]["settings_{$region}"]["color_settings_tab"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
  }

}
