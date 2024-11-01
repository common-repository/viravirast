<?php
/*
 * Plugin Name: ViraVirast
 * Plugin URL: https://viravirast.ir/
 * Description: ...
 * Version: 3.8.0
 * Author: ViraVirast
 * Text Domain: viravirast
 * Domain Path: /languages
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html

 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>

 */


if (!defined('WPINC')) {
  die;
}

//constants
define('VIRAVIRAST_DIR', plugin_dir_path(__FILE__));
define('VIRAVIRAST_DIR_URL', plugin_dir_url(__FILE__));
define('VIRAVIRAST_SIGNUP_PATH', "https://viravirast.ir/Auth/SignUp");

// api
include VIRAVIRAST_DIR . 'includes/api/api.php';

//assets
include VIRAVIRAST_DIR . 'includes/assets/viravirast-styles.php';
include VIRAVIRAST_DIR . 'includes/assets/viravirast-scripts.php';

//pages
include VIRAVIRAST_DIR . 'includes/pages/viravirast-pages.php';

// settings
include VIRAVIRAST_DIR . 'includes/viravirast-settings.php';

$DEFAULT_VALUES = array();
$EVENTS = array();

function viravirastGetOption($name) {
  $options = get_option("viravirast");
  if (empty($options)) {
    return false;
  } else {
    if (array_key_exists($name, $options)) {
      return $options[$name];
    } else {
      return null;
    }
  }
}

function viravirastSetOption($name, $value) {
  $options = get_option("viravirast");
  if (empty($options)) {
    $options = array();
  }
  $options[$name] = $value;
  update_option("viravirast", $options);
}

class Viravirast {
  protected $EVENTS;
  protected $DEFAULT_VALUES;
  protected $process_single;

  public function __construct($EVENTS, $DEFAULT_VALUES) {
    $this->EVENTS = $EVENTS;
    $this->DEFAULT_VALUES = $DEFAULT_VALUES;
    add_action('plugins_loaded', array($this, 'init'));
  }

  public function init() {
    //
  }
}

new Viravirast($EVENTS, $DEFAULT_VALUES);