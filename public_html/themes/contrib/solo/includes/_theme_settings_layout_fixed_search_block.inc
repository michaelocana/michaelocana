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

// Fixed search region.
if (array_key_exists("fixed_search_block", $updated_regions["mix"])) {

  $region = "fixed_search_block";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure the fixed search block styling and behavior options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["fixed_search_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-search-configuration",
  ];

  // Search Configuration Tab.
  $form["solo_settings"]["settings_{$region}"]["search_configuration"] = [
    "#type" => "details",
    "#title" => t("Search Configuration"),
    "#group" => "fixed_search_tabs",
    "#weight" => -10,
    "#id" => "edit-search-configuration",
  ];

  $form["solo_settings"]["settings_{$region}"]["search_configuration"]["classes_{$region}"] = _generate_css_classes($region, $label);

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings_tab"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "fixed_search_tabs",
    "#weight" => -8,
      '#attributes' => [
      'class' => ['solo-color-panel'],
      'data-solo-panel' => 'colors',
    ],
  ];

  foreach ($attributes as $attribute_key => $attribute_label) {
    $form["solo_settings"]["settings_{$region}"]["color_settings_tab"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
  }

}
