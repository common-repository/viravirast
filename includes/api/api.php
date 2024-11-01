<?php 
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class VIRAVIRAST_API{
  public $headers = array(
    'Content-Type'=> 'application/json',
    'timeout' => "20000"
  );
  
  // none async APIs
  function get($url, $payload=array()){
    $this->headers["token"] = viravirastGetOption("token");
    $this->headers["userId"] = viravirastGetOption("userId");
    $response = wp_remote_get( 
      esc_url_raw($url),
      array(
        'body'    => $payload,
        'headers' => $this->headers 
      )
    );

    if( is_wp_error( $response ) ) {
      $error_message = $response->get_error_message();
      $response_code = wp_remote_retrieve_response_code( $response );
      $response_code = $response_code ? $response_code : 500;
      $errors = array(
        'status' => $response_code,
        'body' => $error_message
      );
    }
    $response_code = wp_remote_retrieve_response_code( $response );
    $response_body = json_decode( wp_remote_retrieve_body( $response ), true );
    return array('status'=>$response_code, 'body'=>$response_body);
  }

  function post($url, $payload=array()){
    $this->headers["token"] = viravirastGetOption("token");
    $this->headers["userId"] = viravirastGetOption("userId");
    $this->headers["authorization"] = "Bearer ".viravirastGetOption("token");

    $requestArray = array(
      'body'    => wp_json_encode($payload),
      'headers' => $this->headers ,
      "timeout" => '20000'
    );
    
    $response = wp_remote_post( 
      esc_url_raw($url),
      $requestArray
    );

    if( is_wp_error( $response ) ) {
      $error_message = $response->get_error_message();
      $response_code = wp_remote_retrieve_response_code( $response );
      $response_code = $response_code ? $response_code : 500;
      $errors = array(
        'status' => $response_code,
        'body' => $error_message,
      );
      return $errors;
    }

    $response_code = wp_remote_retrieve_response_code( $response );
    $response_body = json_decode( wp_remote_retrieve_body( $response ), true );
    return array('status'=>$response_code, 'body'=>$response_body);
  }

  function delete($url, $payload=array()){
    $this->headers["token"] = get_option("viravirast_access_token");
    $this->headers["userId"] = viravirastGetOption("userId");
    $requestArray = array(
      'method'  => "DELETE",
      'body'    => wp_json_encode($payload),
      'headers' => $this->headers 
    );

    $response = wp_remote_post( 
      esc_url_raw($url),
      $requestArray
    );

    if( is_wp_error( $response ) ) {
      $error_message = $response->get_error_message();
      $response_code = wp_remote_retrieve_response_code( $response );
      $response_code = $response_code ? $response_code : 500;
      $errors = array(
        'status' => $response_code,
        'body' => $error_message
      );
    }

    $response_code = wp_remote_retrieve_response_code( $response );
    $response_body = json_decode( wp_remote_retrieve_body( $response ), true );
    return array('status'=>$response_code, 'body'=>$response_body);
  }

  function patch($url, $payload=array()){
    $this->headers["token"] = viravirastGetOption("token");
    $this->headers["userId"] = viravirastGetOption("userId");
    $requestArray = array(
      'method'  => "PATCH",
      'body'    => wp_json_encode($payload),
      'headers' => $this->headers 
    );

    $response = wp_remote_post( 
      esc_url_raw($url),
      $requestArray
    );

    if( is_wp_error( $response ) ) {
      $error_message = $response->get_error_message();
      $response_code = wp_remote_retrieve_response_code( $response );
      $response_code = $response_code ? $response_code : 500;
      $errors = array(
        'status' => $response_code,
        'body' => $error_message
      );
      return $errors;
    }

    $response_code = wp_remote_retrieve_response_code( $response );
    $response_body = json_decode( wp_remote_retrieve_body( $response ), true );
    return array('status'=>$response_code, 'body'=>$response_body);
  }

  
}

function viraVirastBadRequest($body="Bad Request"){
  print_r(
    json_encode( array(
      'status' => 400,
      'body' => $body,
    ))
  );
  wp_die();
}

function viravirastSanitizeArray($raw_array){
  return array_map( function($value) {
    if( is_string($value) ) return sanitize_text_field($value);
    if( is_int($value) ) return intval($value);
    if( is_bool($value) ) return boolval($value);
    if( is_array($value)) return viravirastSanitizeArray($value);
  }, $raw_array );
}

include(VIRAVIRAST_DIR.'includes/api/spellcheck.php');