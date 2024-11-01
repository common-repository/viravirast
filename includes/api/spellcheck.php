<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

add_action('wp_ajax_viravirast_logout', "viravirast_logout");
function viravirast_logout() {

  viravirastSetOption("token", "");
  $res = array(
    "status" => 200,
  );

  wp_send_json($res);
  wp_die();
}
add_action('wp_ajax_viravirast_toggleSetting', "viravirast_toggleSetting");
function viravirast_toggleSetting() {
  $settingName = sanitize_text_field($_REQUEST['settingName']);

  $settingStatus = viravirastGetOption($settingName);
  $settingStatus = $settingStatus == "true" ? "false" : "true";
  viravirastSetOption($settingName, $settingStatus);
  $res = array(
    "name" => $settingName,
    "data" => $settingStatus,
    "status" => 200,
  );

  wp_send_json($res);
  wp_die();
}

add_action('wp_ajax_viravirast_toggleEnabled', "viravirast_toggleEnabled");
function viravirast_toggleEnabled() {
  $en = sanitize_text_field($_REQUEST['enabled']);
  if ($en == "false") {
    $enabled = "false";
  } else {
    $enabled = "true";
  }

  viravirastSetOption("enabled", $enabled);
  $res = array(
    "status" => 200,
  );

  wp_send_json($res);
  wp_die();
}

add_action('wp_ajax_viravirast_authenticate', "viravirast_authenticate");
function viravirast_authenticate() {
  $VIRAVIRAST_API = new VIRAVIRAST_API();
  $raw_data = viravirastSanitizeArray($_REQUEST['data']);

  // {
  //  username: string,
  //  password string,
  // }
  $username = $raw_data["username"];
  $password = $raw_data["password"];

  if (empty($username) || empty($password)) {
    viraVirastBadRequest();
  }

  $data = array(
    "username" => $username,
    "password" => $password,
  );

  $res = $VIRAVIRAST_API->post("https://viravirast.ir/authuser/api/Authentication/authenticate", $data);

  if ($res["status"] == 200) {
    viravirastSetOption("token", $res["body"]["data"]["token"]);
    viravirastSetOption("userId", $res["body"]["data"]["id"]);
  }
  wp_send_json($res);
  wp_die();
}

add_action('wp_ajax_viravirast_validate_text', "viravirast_validate_text");
function viravirast_validate_text() {
  $VIRAVIRAST_API = new VIRAVIRAST_API();
  $data = viravirastSanitizeArray($_REQUEST['data']);

  // {
  //   "Text": "{{Your_Text}}",
  //   "editingtype":
  // {
  // "DoMeaningChecker": true,
  // "DoPersianAutomaticPunctuation": true,
  // "PersianSpellCheck": true,
  // "DoStructureChecker": true
  // }
  // }

  $doBasicCheck = viravirastGetOption("basicCheck");
  $doAdvancedCheck = viravirastGetOption("advancedCheck");
  $payload = array(
    "Text" => $data["Text"],
    "editingtype" => array(
      "DoPreProcess" => false,
      "DoMeaningChecker" => $doBasicCheck != "false",
      "DoPersianAutomaticPunctuation" => $doBasicCheck != "false",
      "DoStructEdit" => $doAdvancedCheck == "true",
      "PersianSpellCheck" => $doBasicCheck != "false",
      "DoStructureChecker" => $doBasicCheck != "false",
    ),
  );

  $res = $VIRAVIRAST_API->post("https://viravirast.ir/API/Vira/Editing", $payload);

  wp_send_json($res);
  wp_die();
}

add_action('wp_ajax_viravirast_ignore_word', "viravirast_ignore_word");
function viravirast_ignore_word() {
  $VIRAVIRAST_API = new VIRAVIRAST_API();
  $word = sanitize_text_field($_REQUEST['word']);

  // {
  //   "UserId": "{{user_id}}",
  //   "Word": "{{word_to_ignore}}",
  // }

  $userId = viravirastGetOption("userId");
  $payload = array(
    "UserId" => $userId,
    "Word" => $word,
  );

  $res = $VIRAVIRAST_API->post("https://viravirast.ir/Personalization/api/IgnoredWords/" . $userId, $payload);

  wp_send_json($res);
  wp_die();
}

add_action('wp_ajax_viravirast_test', "viravirast_test");
function viravirast_test() {
  $VIRAVIRAST_API = new VIRAVIRAST_API();
  $res = $VIRAVIRAST_API->get("/auth/test");
  wp_send_json($res);
  wp_die();
}