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

// Breadcrumb region.
if (array_key_exists("breadcrumb", $updated_regions["mix"])) {

  $region = "breadcrumb";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure breadcrumb navigation display, behavior, and styling options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["breadcrumb_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-breadcrumb-configuration",
  ];

  // Breadcrumb Configuration Tab.
  $form["solo_settings"]["settings_{$region}"]["breadcrumb_configuration"] = [
    "#type" => "details",
    "#title" => t("Breadcrumb Configuration"),
    "#group" => "breadcrumb_tabs",
    "#weight" => -10,
    "#id" => "edit-breadcrumb-configuration",
  ];

  $form["solo_settings"]["settings_{$region}"]["breadcrumb_configuration"]["classes_{$region}"] = _generate_css_classes($region, $label);

  $form["solo_settings"]["settings_{$region}"]["breadcrumb_configuration"]["site_breadcrumb_pagetitle_off"] = [
    "#type" => "checkbox",
    "#title" => t("Exclude the page title from the Breadcrumb."),
    "#description" => t("By default, Drupal does not include the page title in the breadcrumb. Solo adds it as a custom feature, but you can disable it to revert to the default behavior. Enable this option to prevent the page title from being added to the breadcrumb trail. This setting applies to all content types, Views pages, taxonomy terms, and user profile pages."),
    "#default_value" => theme_get_setting("site_breadcrumb_pagetitle_off"),
  ];

  $form["solo_settings"]["settings_{$region}"]["breadcrumb_configuration"]["site_breadcrumb_scroll"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box to enable Breadcrumb scrolling (Prevent Wrap)"),
    "#default_value" => theme_get_setting("site_breadcrumb_scroll"),
  ];

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "breadcrumb_tabs",
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
