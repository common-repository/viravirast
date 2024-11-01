<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// setting link on plugins page
function viravirast_add_settings_link( $links ){
  $settings_link = '<a href="admin.php?page=viravirast">' . __('Settings') . '</a>';
  array_push( $links, $settings_link);
  return $links;
}
$filter_name = "plugin_action_links_" . plugin_basename( __FILE__ );
add_filter($filter_name, 'viravirast_add_settings_link');