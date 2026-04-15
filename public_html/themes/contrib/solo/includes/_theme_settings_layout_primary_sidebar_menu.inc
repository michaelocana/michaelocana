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

// Primary Sidebar menu region.
if (array_key_exists("primary_sidebar_menu", $updated_regions["mix"])) {

  $region = "primary_sidebar_menu";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure the sidebar menu behavior, styling, and layout options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["sidebar_menu_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-menu-layout-styling",
  ];

  // Menu Layout & Styling Tab.
  $form["solo_settings"]["settings_{$region}"]["menu_layout_styling"] = [
    "#type" => "details",
    "#title" => t("Menu Layout & Styling"),
    "#group" => "sidebar_menu_tabs",
    "#weight" => -10,
    "#id" => "edit-menu-layout-styling",
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_layout_styling"]["classes_{$region}"] = _generate_css_classes($region, $label);

  $form["solo_settings"]["settings_{$region}"]["menu_layout_styling"]["primary_sidebar_menu_border"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box if you prefer to add border for each menu item"),
    "#default_value" => theme_get_setting("primary_sidebar_menu_border"),
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_layout_styling"]["primary_sidebar_menu_branding"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to display a clickable logo next to the close button. To also display the site name, add the class show-sitename to the field (CSS Classes Only)."),
    "#default_value" => theme_get_setting("primary_sidebar_menu_branding"),
  ];

  // Menu Behavior & Accessibility Tab.
  $form["solo_settings"]["settings_{$region}"]["menu_behavior_accessibility"] = [
    "#type" => "details",
    "#title" => t("Menu Behavior & Accessibility"),
    "#group" => "sidebar_menu_tabs",
    "#weight" => -8,
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_behavior_accessibility"]["primary_sidebar_menu_hover"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box if you prefer to show the sidebar main menu dropdowns when hovering over them with the mouse, instead of clicking. (Large screen only)"),
    "#default_value" => theme_get_setting("primary_sidebar_menu_hover"),
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_behavior_accessibility"]["primary_sidebar_menu_keyboard"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to enable Keyboard Compatibility for the sidebar menu."),
    "#default_value" => theme_get_setting("primary_sidebar_menu_keyboard"),
  ];

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings_tab"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "sidebar_menu_tabs",
    "#weight" => -6,
    '#attributes' => [
      'class' => ['solo-color-panel'],
      'data-solo-panel' => 'colors',
    ],
  ];

  foreach ($attributes as $attribute_key => $attribute_label) {
    $form["solo_settings"]["settings_{$region}"]["color_settings_tab"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
  }

}
