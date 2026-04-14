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

// Highlighted region.
if (array_key_exists("highlighted", $updated_regions["mix"])) {

  $region = "highlighted";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure the highlighted region display, accessibility, and styling options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["highlighted_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-region-configuration",
  ];

  // Region Configuration Tab.
  $form["solo_settings"]["settings_{$region}"]["region_configuration"] = [
    "#type" => "details",
    "#title" => t("Region Configuration"),
    "#group" => "highlighted_tabs",
    "#weight" => -10,
    "#id" => "edit-region-configuration",
  ];

  $form["solo_settings"]["settings_{$region}"]["region_configuration"]["site_regions_highlighted_disable"] = _disable_region("highlighted");
  $form["solo_settings"]["settings_{$region}"]["region_configuration"]["enable_aria_highlighted"] = [
    "#type" => "checkbox",
    "#title" => t("Enable ARIA Landmark for Highlighted Region"),
    "#default_value" => theme_get_setting("enable_aria_highlighted") ?? 0,
    "#description" => t("Adds <code>role='region'</code> and <code>aria-label</code> to the highlighted region for improved accessibility. Enable only if this region consistently contains important, navigable content."),
  ];
  $form["solo_settings"]["settings_{$region}"]["region_configuration"]["classes_{$region}"] = _generate_css_classes($region, $label);

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "highlighted_tabs",
    "#weight" => -8,
    '#attributes' => [
      'class' => ['solo-color-panel'],
      'data-solo-panel' => 'colors',
    ],
  ];

  foreach ($attributes as $attribute_key => $attribute_label) {
    $form["solo_settings"]["settings_{$region}"]["color_settings"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
  }

}
