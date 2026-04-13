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

// Footer menu region.
if (array_key_exists("footer_menu", $updated_regions["mix"])) {

  $region = "footer_menu";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure the footer menu styling and accessibility options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["footer_menu_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-menu-configuration",
  ];

  // Menu Configuration Tab.
  $form["solo_settings"]["settings_{$region}"]["menu_configuration"] = [
    "#type" => "details",
    "#title" => t("Menu Configuration"),
    "#group" => "footer_menu_tabs",
    "#weight" => -10,
    "#id" => "edit-menu-configuration",
  ];

  $form["solo_settings"]["settings_{$region}"]["menu_configuration"]["classes_{$region}"] = _generate_css_classes($region, $label);

  // Accessibility Tab.
  $form["solo_settings"]["settings_{$region}"]["accessibility"] = [
    "#type" => "details",
    "#title" => t("Accessibility"),
    "#group" => "footer_menu_tabs",
    "#weight" => -8,
  ];

  $form["solo_settings"]["settings_{$region}"]["accessibility"]["skip_footer_content"] = [
    "#type" => "checkbox",
    "#title" => t("Enable skip to footer link"),
    "#default_value" => theme_get_setting("skip_footer_content"),
  ];

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings_tab"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "footer_menu_tabs",
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
