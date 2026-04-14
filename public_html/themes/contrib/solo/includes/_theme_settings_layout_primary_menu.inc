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

// Primary Menu region.
if (array_key_exists("primary_menu", $updated_regions["mix"])) {

  $region = "primary_menu";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure the primary menu behavior, styling, and layout options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["primary_menu_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-menu-layout-alignment",
  ];

  // Menu Layout & Alignment Tab.
  $form["solo_settings"]["settings_{$region}"]["menu_layout_alignment"] = [
    "#type" => "details",
    "#title" => t("Menu Layout & Alignment"),
    "#group" => "primary_menu_tabs",
    "#weight" => -10,
    "#id" => "edit-menu-layout-alignment",
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_layout_alignment"]["primary_menu_depth_info"] = [
    "#type" => "item",
    "#title" => t("Menu depth support"),
    "#markup" => t("The Solo theme supports <strong>up to 4 levels of nested menu items</strong> in the primary menu block.
      Menus behave consistently across all levels and support both hover and click interactions on large screens.<br><br>
      <strong>Example structure:</strong><br>
      - Fruit<br>
      &nbsp;&nbsp;- Apple<br>
      &nbsp;&nbsp;&nbsp;&nbsp;- Red Apple<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Gala<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Delish<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Green<br><br>"),
  ];

  // Determine current alignment setting, with backward compatibility.
  $menu_alignment = theme_get_setting("primary_menu_alignment");

  if (!isset($menu_alignment) || $menu_alignment === "") {
    if (theme_get_setting("primary_menu_align_center")) {
      $menu_alignment = "center";
    }
    elseif (theme_get_setting("primary_menu_justify_content")) {
      $menu_alignment = "justify";
    }
    else {
      // Default to left-aligned.
      $menu_alignment = "none";
    }
  }

  // Define the select field with full descriptions.
  $form["solo_settings"]["settings_{$region}"]["menu_layout_alignment"]["primary_menu_alignment"] = [
    "#type" => "select",
    "#title" => t("Main menu block alignment (large screens only)"),
    "#description" => t("Controls how the entire main menu block is aligned within its parent container on large screens. It is aligned to the left by default. This feature is intended to align the entire block, not its children."),
    "#options" => [
      "none" => t("Left aligned (default) - Positions menu block to the left"),
      "center" => t("Center aligned - Centers menu block horizontally"),
      "justify" => t("Justify content - Stretches menu block to fill container"),
      "right" => t("Right aligned - Positions menu block to the right"),
    ],
    "#default_value" => $menu_alignment,
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_layout_alignment"]["primary_menu_branding"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to display a clickable logo next to the Main Menu. To also display the site name, add the class show-sitename to the field (CSS Classes Only)."),
    "#default_value" => theme_get_setting("primary_menu_branding"),
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_layout_alignment"]["classes_{$region}"] = _generate_css_classes($region, $label);

  // Menu Behavior Tab.
  $form["solo_settings"]["settings_{$region}"]["menu_behavior"] = [
    "#type" => "details",
    "#title" => t("Menu Behavior"),
    "#group" => "primary_menu_tabs",
    "#weight" => -8,
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_behavior"]["primary_menu_on_hover"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box if you prefer to show the main menu dropdowns when hovering over them with the mouse, instead of clicking. (Large screen only)"),
    "#default_value" => theme_get_setting("primary_menu_on_hover"),
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_behavior"]["primary_menu_expand_left"] = [
    "#type" => "checkbox",
    "#title" => t("For LTR languages, tick this box to make the dropdown menu open on the left instead of the default right. For RTL languages, ticking this box will make the dropdown open on the right instead of the default left, adjusting to the language direction. (Large screen only)"),
    "#default_value" => theme_get_setting("primary_menu_expand_left"),
  ];

  // Menu Styling Tab.
  $form["solo_settings"]["settings_{$region}"]["menu_styling"] = [
    "#type" => "details",
    "#title" => t("Menu Styling"),
    "#group" => "primary_menu_tabs",
    "#weight" => -6,
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_styling"]["primary_menu_border"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box if you prefer to add border for each menu item"),
    "#default_value" => theme_get_setting("primary_menu_border"),
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_styling"]["primary_menu_arrow_hover"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to hide dropdown arrows on hover menus. (Large screen only)"),
    "#description" => t("When enabled, the main menu expands dropdowns on hover. This option removes the arrow icons from parent menu items, reducing visual clutter and saving space, especially for menus with many items."),
    "#default_value" => theme_get_setting("primary_menu_arrow_hover"),
    "#states" => [
      "visible" => [
        ":input[name='primary_menu_on_hover']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Mega Menu Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["mega_menu_settings"] = [
    "#type" => "details",
    "#title" => t("Mega Menu Settings"),
    "#group" => "primary_menu_tabs",
    "#weight" => -4,
  ];

  $form["solo_settings"]["settings_{$region}"]["mega_menu_settings"]["primary_menu_megamenu"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to transform the main menu dropdowns into a Mega Menu."),
    "#description" => t("Megamenus necessitate the implementation of hierarchical three-level menus. In this structure, the second level of menu items is instrumental in defining the 'columns' for the megamenu. If the option 'Tick this box to display the second level as headers' is selected, the second level will be exhibited as a header for the third-level menu items."),
    "#default_value" => theme_get_setting("primary_menu_megamenu"),
  ];

  $form["solo_settings"]["settings_{$region}"]["mega_menu_settings"]["primary_menu_megamenu_layout"] = _create_megamenu_layout();

  $form["solo_settings"]["settings_{$region}"]["mega_menu_settings"]["primary_menu_submenu_header"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to display the second level as headers."),
    "#default_value" => theme_get_setting("primary_menu_submenu_header"),
    "#states" => [
      "visible" => [
        ":input[name='primary_menu_megamenu']" => ["checked" => TRUE],
      ],
    ],
  ];

  // Accessibility Tab.
  $form["solo_settings"]["settings_{$region}"]["accessibility"] = [
    "#type" => "details",
    "#title" => t("Accessibility"),
    "#group" => "primary_menu_tabs",
    "#weight" => -2,
  ];

  $form["solo_settings"]["settings_{$region}"]["accessibility"]["skip_navigation_content"] = [
    "#type" => "checkbox",
    "#title" => t("Enable skip to main navigation link"),
    "#default_value" => theme_get_setting("skip_navigation_content"),
  ];

  $form["solo_settings"]["settings_{$region}"]["accessibility"]["primary_menu_keyboard"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to enable Keyboard Compatibility for the main menu."),
    "#default_value" => theme_get_setting("primary_menu_keyboard"),
  ];

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings_tab"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "primary_menu_tabs",
    "#weight" => 0,
    '#attributes' => [
      'class' => ['solo-color-panel'],
      'data-solo-panel' => 'colors',
    ],
  ];

  foreach ($attributes as $attribute_key => $attribute_label) {
    $form["solo_settings"]["settings_{$region}"]["color_settings_tab"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
  }

}
