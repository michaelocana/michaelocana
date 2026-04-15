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

/**
 * The theme settings.
 */
$region = "credit_copyright";
$label = "credit & Copyright";

$form["solo_settings"]["settings_{$region}"] = [
  "#type" => "details",
  "#title" => t("<strong class='purple'>Copyright & Credit</strong> Settings - Solo Theme"),
  "#collapsible" => TRUE,
  "#collapsed" => TRUE,
  "#description" => t("Configure copyright text, footer links, and styling for credit/copyright section."),
];

// Create vertical tabs container.
$form["solo_settings"]["settings_{$region}"]["copyright_tabs"] = [
  "#type" => "vertical_tabs",
  "#default_tab" => "edit-copyright-content",
];

// Copyright & Link Settings Tab.
$form["solo_settings"]["settings_{$region}"]["copyright_content"] = [
  "#type" => "details",
  "#title" => t("Copyright & Link Settings"),
  "#group" => "copyright_tabs",
  "#weight" => -10,
  "#id" => "edit-copyright-content",
];

$form["solo_settings"]["settings_{$region}"]["copyright_content"]["classes_{$region}"] = _generate_css_classes($region, $label);

$form["solo_settings"]["settings_{$region}"]["copyright_content"]["footer_copyright"] = [
  "#type" => "textfield",
  "#title" => t("Enter Copyright Text"),
  "#description" => t("Type %year% instead of an actual number for a dynamic copyright year. (Copyright © %year% Company Name - All rights reserved)."),
  "#default_value" => theme_get_setting("footer_copyright"),
];

$form["solo_settings"]["settings_{$region}"]["copyright_content"]["footer_link"] = [
  "#type" => "textfield",
  "#title" => t("Enter Footer Link URL"),
  "#description" => t("Enter the URL for the footer link."),
  "#default_value" => theme_get_setting("footer_link"),
];

$form["solo_settings"]["settings_{$region}"]["copyright_content"]["footer_link_label"] = [
  "#type" => "textfield",
  "#title" => t("Enter Footer Link Label"),
  "#description" => t("Enter the Label for the footer link[Footer Link Label][Footer Link Text]."),
  "#default_value" => theme_get_setting("footer_link_label"),
];

$form["solo_settings"]["settings_{$region}"]["copyright_content"]["footer_link_text"] = [
  "#type" => "textfield",
  "#title" => t("Enter Footer Link Text"),
  "#description" => t("Enter the text for the footer link. This field is required if a URL is provided."),
  "#default_value" => theme_get_setting("footer_link_text"),
];

// Color Settings Tab.
$form["solo_settings"]["settings_{$region}"]["color_settings"] = [
  "#type" => "details",
  "#title" => t("Color Settings"),
  "#group" => "copyright_tabs",
  "#weight" => -8,
    '#attributes' => [
      'class' => ['solo-color-panel'],
      'data-solo-panel' => 'colors',
    ],
];

foreach ($attributes as $attribute_key => $attribute_label) {
  $form["solo_settings"]["settings_{$region}"]["color_settings"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
}
