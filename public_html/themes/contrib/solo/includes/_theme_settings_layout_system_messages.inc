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

// System message region.
if (array_key_exists("system_messages", $updated_regions["mix"])) {

  $region = "system_messages";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure system message display, background customization, and styling options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["system_messages_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-message-configuration",
  ];

  // Message Configuration Tab.
  $form["solo_settings"]["settings_{$region}"]["message_configuration"] = [
    "#type" => "details",
    "#title" => t("Message Configuration"),
    "#group" => "system_messages_tabs",
    "#weight" => -10,
    "#id" => "edit-message-configuration",
  ];

  $form["solo_settings"]["settings_{$region}"]["message_configuration"]["classes_{$region}"] = _generate_css_classes($region, $label);

  $form["solo_settings"]["settings_{$region}"]["message_configuration"]["system_messages_disable_dark"] = [
    "#type" => "checkbox",
    "#title" => t("Tick this box if you want to personalize the background of your system messages to match your brand. This will disable the default background."),
    "#default_value" => theme_get_setting("system_messages_disable_dark"),
  ];

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "system_messages_tabs",
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
