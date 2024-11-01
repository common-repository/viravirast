<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function viravirast_admin_scripts() {
  wp_register_script(
    "viravirast-alert",
    VIRAVIRAST_DIR_URL . "admin/js/alert.js",
    ['jquery', "viravirast-constants"],
    filemtime(VIRAVIRAST_DIR . "admin/js/alert.js")
  );
  wp_register_script(
    "viravirast-admin",
    VIRAVIRAST_DIR_URL . "admin/js/viravirast.js",
    ['jquery', "viravirast-constants", "viravirast-alert"],
    filemtime(VIRAVIRAST_DIR . "admin/js/viravirast.js")
  );
  wp_register_script(
    "viravirast-constants",
    VIRAVIRAST_DIR_URL . "admin/js/constants.js",
    ['jquery'],
    filemtime(VIRAVIRAST_DIR . "admin/js/constants.js")
  );
  wp_register_script(
    "viravirast-apis",
    VIRAVIRAST_DIR_URL . "admin/js/apis.js",
    ['jquery', "viravirast-constants", "viravirast-admin"],
    filemtime(VIRAVIRAST_DIR . "admin/js/apis.js")
  );
  wp_register_script(
    "viravirast-auth",
    VIRAVIRAST_DIR_URL . "admin/js/auth.js",
    ['jquery', "viravirast-constants", "viravirast-admin"],
    filemtime(VIRAVIRAST_DIR . "admin/js/auth.js")
  );

  $enabled = viravirastGetOption("enabled");
  $isAI = viravirastGetOption("advancedCheck");
  if ($enabled != "false") {
    $enabled = "true";
  }
  if ($isAI == "true") {
    $isAI = "true";
  }
  $const_VIRAVIRAST_DIR_URL = "
    const VIRAVIRAST_DIR_URL = '" . VIRAVIRAST_DIR_URL . "';
    const IS_VIRAVIRAST_ENABLED = '" . $enabled . "';
    const IS_VIRAVIRAST_AI = '" . $isAI . "';

    ";
  wp_add_inline_script('viravirast-constants', $const_VIRAVIRAST_DIR_URL, 'before');

  wp_enqueue_script('jquery');
  wp_enqueue_script('viravirast-constants');
  wp_enqueue_script('viravirast-admin');
  wp_enqueue_script('viravirast-apis');
  wp_enqueue_script('viravirast-auth');
  // wp_enqueue_script('viravirast-alert');

}
add_action('admin_enqueue_scripts', 'viravirast_admin_scripts', 100);