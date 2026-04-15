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

if ($updated_regions["top"]) {

  $region_label = implode(", ", $updated_regions["top"]);

  $form["solo_settings"]["settings_top_container"] = [
    "#type" => "details",
    "#title" => t("<strong class='status'>Top Containers</strong> Settings - Solo Theme"),
    "#collapsible" => TRUE,
    "#collapsed" => TRUE,
    "#description"   => t("<p>The settings for @region_label.</p>", ["@region_label" => $region_label]),
  ];

  // Create vertical tabs container.
  $form["solo_settings"]["settings_top_container"]["top_container_tabs"] = [
    "#type" => "vertical_tabs",
    "#default_tab" => "edit-layout-settings",
  ];

  foreach ($updated_regions["top"] as $region => $label) {

    if ($region == "container") {
      $region        = "top_container";
      $layout_region = "top";

      // Layout Settings Tab.
      $form["solo_settings"]["settings_top_container"]["layout_settings"] = [
        "#type" => "details",
        "#title" => t("Layout Settings"),
        "#group" => "top_container_tabs",
        "#weight" => -10,
        "#id" => "edit-layout-settings",
      ];

      // Global layout options for top region.
      $form["solo_settings"]["settings_top_container"]["layout_settings"]["top_2col"] = _create_region_layout_radio_two($layout_region, $variables);
      $form["solo_settings"]["settings_top_container"]["layout_settings"]["top_3col"] = _create_region_layout_radio_three($layout_region);

      // Enable per-content-type layout override.
      $form["solo_settings"]["settings_top_container"]["layout_settings"]["enable_per_type_layout_top"] = [
        "#type" => "checkbox",
        "#title" => t("Enable per-content-type layouts for Top region"),
        "#default_value" => theme_get_setting("enable_per_type_layout_top"),
      ];

      foreach ($content_types as $type_id => $type_label) {
        $form["solo_settings"]["settings_top_container"]["layout_settings"]["solo_layout_top_per_type"][$type_id] = [
          "#type" => "details",
          "#title" => t("Layout for @label", ["@label" => $type_label]),
          "#open" => FALSE,
          "#states" => [
            "visible" => [
              ":input[name='enable_per_type_layout_top']" => ["checked" => TRUE],
            ],
          ],
        ];

        // 2-column override.
        $layout_2col = _create_region_layout_radio_two($layout_region, $variables);
        $layout_2col["#title"] = t("Two-column layout (override)");
        $layout_2col["#default_value"] = _solo_get_layout_default($layout_region, "2col", $type_id);
        $form["solo_settings"]["settings_top_container"]["layout_settings"]["solo_layout_top_per_type"][$type_id]["solo_layout_top_2col_$type_id"] = $layout_2col;

        // 3-column override.
        $layout_3col = _create_region_layout_radio_three($layout_region);
        $layout_3col["#title"] = t("Three-column layout (override)");
        $layout_3col["#default_value"] = _solo_get_layout_default($layout_region, "3col", $type_id);
        $form["solo_settings"]["settings_top_container"]["layout_settings"]["solo_layout_top_per_type"][$type_id]["solo_layout_top_3col_$type_id"] = $layout_3col;
      }

      // Styling & Design Tab.
      $form["solo_settings"]["settings_top_container"]["styling_design"] = [
        "#type" => "details",
        "#title" => t("Styling & Design"),
        "#group" => "top_container_tabs",
        "#weight" => -8,
      ];

      $form["solo_settings"]["settings_top_container"]["styling_design"]["site_regions_top_rounded"] = _rounded_region($layout_region);
      $form["solo_settings"]["settings_top_container"]["styling_design"]["site_regions_top_border"] = _border_region($layout_region);
      $form["solo_settings"]["settings_top_container"]["styling_design"]["site_regions_top_animate_border"] = _animate_region_border($layout_region);
      $form["solo_settings"]["settings_top_container"]["styling_design"]["site_regions_top_animate_hover"] = _animate_region_hover($layout_region);
      $form["solo_settings"]["settings_top_container"]["styling_design"]["classes_{$region}"] = _generate_css_classes($region, $label);

      // Accessibility & Behavior Tab.
      $form["solo_settings"]["settings_top_container"]["accessibility_behavior"] = [
        "#type" => "details",
        "#title" => t("Accessibility & Behavior"),
        "#group" => "top_container_tabs",
        "#weight" => -6,
      ];

      $form["solo_settings"]["settings_top_container"]["accessibility_behavior"]["site_regions_top_disable"] = _disable_region($layout_region);
      $form["solo_settings"]["settings_top_container"]["accessibility_behavior"]["enable_aria_top"] = [
        "#type" => "checkbox",
        "#title" => t("Enable ARIA Landmark for Top Container"),
        "#default_value" => theme_get_setting("enable_aria_top") ?? 0,
        "#description" => t("Adds <code>role='region'</code> and <code>aria-label</code> to the top container for improved accessibility. Enable only if this region consistently contains important, navigable content."),
      ];

      // Color Settings Tab.
      $form["solo_settings"]["settings_top_container"]["color_settings_tab"] = [
        "#type" => "details",
        "#title" => t("Color Settings"),
        "#group" => "top_container_tabs",
        "#weight" => -4,
        '#attributes' => [
        'class' => ['solo-color-panel'],
        'data-solo-panel' => 'colors',
      ],
      ];

      foreach ($attributes as $attribute_key => $attribute_label) {
        $form["solo_settings"]["settings_top_container"]["color_settings_tab"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
      }
    }
    else {
      // Individual Region Settings Tab.
      $form["solo_settings"]["settings_top_container"]["region_{$region}"] = [
        "#type" => "details",
        "#title" => t("@label Settings", ["@label" => $label]),
        "#group" => "top_container_tabs",
        "#weight" => 0,
      ];

      $form["solo_settings"]["settings_top_container"]["region_{$region}"]["classes_{$region}"] = _generate_css_classes($region, $label);

      $form["solo_settings"]["settings_top_container"]["region_{$region}"]["align_{$region}"] = [
        "#title" => t("Region Block Alignment Option"),
        "#type" => "select",
        "#options" => _alignment_region($region),
        "#default_value" => theme_get_setting("align_{$region}") ?? "region-left",
        "#description" => t("<p>By default, block content is left-aligned. This feature allows theme users to align blocks to the center or right within specific regions through region-level configuration. (Large screen only).</p>"),
      ];

      // Color Settings for Individual Regions.
      $form["solo_settings"]["settings_top_container"]["region_{$region}"]["color_settings"] = [
        "#type" => "details",
        "#title" => t("Color Settings"),
        "#open" => FALSE,
        "#description" => t("Configure colors for background, text, links, buttons, and other visual elements in this region."),
        '#attributes' => [
          'class' => ['solo-color-panel'],
          'data-solo-panel' => 'colors',
        ],
      ];

      foreach ($attributes as $attribute_key => $attribute_label) {
        $form["solo_settings"]["settings_top_container"]["region_{$region}"]["color_settings"]["settings_{$region}_{$attribute_key}"] = _generate_form_element($region, $label, $attribute_key, $attribute_label);
      }
    }
  }
}
