<?php
/*
 *  Define View hook
 */

/**
 * Implements hook_views_plugins().
 */
function mod_style_view_map_views_plugins()
{
    $plugin = array(
        'style' => array(
            'style_view_map' => array(
                'title' => t('Style View Map'),
                'help' => t('Displays a View style map.'),
                'handler' => 'mod_plugin_style_view_map',
                'path' => drupal_get_path('module', 'mod_style_view_map') . '/includes',
                'theme' => 'views_view_style_map',
                'uses fields' => TRUE,
                'uses row plugin' => FALSE,
                'uses options' => TRUE,
                'uses grouping' => FALSE,
                'type' => 'normal',
                'even empty' => TRUE,
            ),
        ),
    );

    return $plugin;
}