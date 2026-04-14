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

// Page title region.
if (array_key_exists("page_title", $updated_regions["mix"])) {

  $region = "page_title";
  $label = $updated_regions["mix"][$region];

  $form["solo_settings"]["settings_{$region}"] = [
    "#type" => "details",
    "#title" => t("<strong class='info'>@label</strong> Settings - Solo Theme", ["@label" => $label]),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description" => t("Configure page title typography, display effects, and styling options."),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_{$region}"]["page_title_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-typography-settings",
  ];

  // Typography Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["typography_settings"] = [
    "#type" => "details",
    "#title" => t("Typography Settings"),
    "#group" => "page_title_tabs",
    "#weight" => -10,
    "#id" => "edit-typography-settings",
  ];

  $form["solo_settings"]["settings_{$region}"]["typography_settings"]["site_pagetitle_font_size_s"] = [
    "#title" => t("Select the desired font size for the page title on small screen."),
    "#type" => "select",
    "#options" => _get_page_title_font_size(),
    "#default_value" => theme_get_setting("site_pagetitle_font_size_s"),
    "#description" => t("<p>Small Screen: You can adjust the page title's font size by choosing your preferred size in pixels or rem units. <strong>This setting follows the website's breakpoints, which can be found under Global Site Settings.</strong></p>"),
  ];

  $form["solo_settings"]["settings_{$region}"]["typography_settings"]["site_pagetitle_font_size_l"] = [
    "#title" => t("Select the desired font size for the page title on large screen."),
    "#type" => "select",
    "#options" => _get_page_title_font_size(),
    "#default_value" => theme_get_setting("site_pagetitle_font_size_l"),
    "#description" => t("<p>Large Screen: You can adjust the page title's font size by choosing your preferred size in pixels or rem units. <strong>This setting follows the website's breakpoints, which can be found under Global Site Settings.</strong></p>"),
  ];

  $form["solo_settings"]["settings_{$region}"]["typography_settings"]["site_pagetitle_google_font"] = [
    "#type" => "select",
    "#title" => t("<span class='status'>Page Title Fonts:</span> They are not applied to any html tags by default and they are only imported. Each font library has a CSS class that you can apply to any html tag. <a target='_blank' href='https://unitedstarsofamerica.com/node/394'>Click here to view a live demo for all available fonts.</a>"),
    "#description"   => t("There are 25 fonts, each with its own CSS class that can be applied to any HTML tag. For example, if you select Eagel Lake, the CSS class will be 'eagle-lake'."),
    "#options" => _get_name_title_google_font(),
    "#default_value" => theme_get_setting("site_pagetitle_google_font"),
  ];

  // Display & Effects Tab.
  $form["solo_settings"]["settings_{$region}"]["display_effects"] = [
    "#type" => "details",
    "#title" => t("Display & Effects"),
    "#group" => "page_title_tabs",
    "#weight" => -8,
  ];

  $form["solo_settings"]["settings_{$region}"]["display_effects"]["classes_{$region}"] = _generate_css_classes($region, $label);

  $form["solo_settings"]["settings_{$region}"]["display_effects"]["site_pagetitle_animate_on"] = [
    "#type" => "select",
    "#title" => t("Select the desired CSS text animation effects for the page title."),
    "#description" => t("Note that the animations are sorted based on their names (e.g., 'Aurora Wave', 'Dreamy Bloom', etc.)"),
    "#options" => _get_animate_page_title(),
    "#description" => t("You can apply the available CSS Text Animation Effects Classes to any HTML tag. The classes constructed as (animate-site-) then the animation name. Example: (animate-solo-aurora-wave) To see examples of all the CSS Text Animation Effects, <a target='_blank' href='https://unitedstarsofamerica.com/node/190'> Click here to view a live demo for all available aimations.</a>"),
    "#default_value" => theme_get_setting("site_pagetitle_animate_on"),
  ];

  $form["solo_settings"]["settings_{$region}"]["display_effects"]["site_pagetitle_center"] = [
    "#type" => "checkbox",
    "#title" => t("<strong>Tick this box to center Page Title</strong>."),
    "#default_value" => theme_get_setting("site_pagetitle_center"),
  ];

  // Color Settings Tab.
  $form["solo_settings"]["settings_{$region}"]["color_settings"] = [
    "#type" => "details",
    "#title" => t("Color Settings"),
    "#group" => "page_title_tabs",
    "#weight" => -6,
    '#attributes' => [
      'class' => ['solo-color-panel'],
      'data-solo-panel' => 'colors',
    ],
  ];

  foreach ($attributes as $attribute_key => $attribute_label) {
    $form["solo_settings"]["settings_{$region}"]["color_settings"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
  }

}
