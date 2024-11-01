<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function viravirast_admin_styles($hook){
  wp_register_style(
    "viravirast-admin",
    VIRAVIRAST_DIR_URL . "admin/css/viravirast-admin-styles.css",
    [],
    filemtime(VIRAVIRAST_DIR . "admin/css/viravirast-admin-styles.css")
  );
  
  wp_register_style(
    "viravirast-bootstrap-additional",
    VIRAVIRAST_DIR_URL . "admin/css/bootstrap/bootstrap-additional.css",
    filemtime(VIRAVIRAST_DIR . "admin/css/bootstrap/bootstrap-additional.css")
  );

  $VIRAVIRAST_DIR_URL = VIRAVIRAST_DIR_URL;
  $svgPaths = "
    :root{
      --viravirast-arrow-left-url: url({$VIRAVIRAST_DIR_URL}admin/images/arrow-left.svg);
      --viravirast-loader-url: url({$VIRAVIRAST_DIR_URL}admin/images/loader.svg);
      --viravirast-trash-url: url({$VIRAVIRAST_DIR_URL}admin/images/trash.svg);
    }
  ";
  wp_add_inline_style( 'viravirast-admin', $svgPaths );

  wp_enqueue_style('viravirast-bootstrap-additional');
  wp_enqueue_style('viravirast-admin');
}
add_action('admin_enqueue_scripts', 'viravirast_admin_styles');