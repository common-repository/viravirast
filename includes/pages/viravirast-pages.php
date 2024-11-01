<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function viravirast_settings_page() {
  $IS_LOGEDIN = get_option("viravirast_access_token") ? true : false;
  add_menu_page(
    __('ViraVirast', 'viravirast'), //Plugin Name
    __('ViraVirast', 'viravirast'), //Plugin Menu
    'manage_options',
    'viravirast', //page name
    'viravirast_settings_page_markup', //callback function
    plugin_dir_url(__FILE__) . 'icon.png', // icon
    100
  );

}
add_action('admin_menu', 'viravirast_settings_page');

function viravirast_settings_page_markup() {

  if (!current_user_can('manage_options')) {
    return;
  }
  ?>
<div class="viravirast" dir="rtl">

  <?php
if (viravirastGetOption("token")) {
    ?>
  <div class="viravirast-login-form"
    style="padding: 40px 30px; display:flex; align-items:center; flex-direction:column">
    <h3 class='vv-font' style='text-align: center;--font:32px'>تنظیمات</h3>
    <?php
$DoMeaningChecke = viravirastGetOption("DoMeaningChecke") != "false" ? "true" : "false";
    $DoPersianAutomaticPunctuation = viravirastGetOption("DoPersianAutomaticPunctuation") != "false" ? "true" : "false";
    $PersianSpellCheck = viravirastGetOption("PersianSpellCheck") != "false" ? "true" : "false";
    $DoStructureChecker = viravirastGetOption("DoStructureChecker") != "false" ? "true" : "false";

    $basicCheck = viravirastGetOption("basicCheck") != "false" ? "true" : "false";
    $advancedCheck = viravirastGetOption("advancedCheck") == "true" ? "true" : "false";

    ?>

    <div class="vv-setting">
      <div onClick="viravirastToggleSetting(this, 'basicCheck')"
        class="vv-is-basic <?php echo $basicCheck != 'false' ? 'is-active' : '' ?>">
        <img src="<?php echo esc_html(VIRAVIRAST_DIR_URL) ?>/admin/images/settings/do-structure-checker.png" alt="">
        <span>ویرایش پایه</span>
      </div>
      <div onClick="viravirastToggleSetting(this, 'advancedCheck')"
        class="vv-is-advanced <?php echo $advancedCheck != 'true' ? '' : 'is-active' ?>">
        <img src="<?php echo esc_html(VIRAVIRAST_DIR_URL) ?>/admin/images/settings/do-meaning-checke.png" alt="">
        <span>ویرایش حرفه‌ای</span>
      </div>
    </div>
    <div class="viravirast-toggler-settings" style="align-self:start; margin-top: 24px; min-height:33px"></div>
    <script>
    addToggler()
    </script>
    <button class="vv-font vv-button vv-logout-button" style="max-width:400px; margin-top:30px;"
      onClick="viravirastLogout(this)">خروج</button>
  </div>
  <?php
} else {
    ?>

  <form action="" class="viravirast-login-form" novalidate dir="rtl">
    <div class="vv-row">

      <div class="vv-col vv-login-right" style="--col:3.8; border-left: 1px solid var(--viravirast-gray-100)">
        <img src="<?php echo esc_html(VIRAVIRAST_DIR_URL) ?>/admin/images/login.png" alt="">
      </div>

      <div class="vv-col vv-login-left" style="--col:8.2">
        <img src="<?php echo esc_html(VIRAVIRAST_DIR_URL) ?>/admin/images/logo.png" alt="ViraVirast Logo">

        <div class="vv-inner-left">
          <div class="vv-step-1">
            <h3 class="vv-font">به ویراویراست خوش آمدید</h3>
            <p class="vv-font">لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک
              است چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد
              نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد کتابهای زیادی در شصت و سه درصد گذشته حال و
              آینده شناخت فراوان جامعه و متخصصان را می طلبد</p>
            <button class="vv-font vv-button" type="button" onclick="viravirastChangeStepTo(2)">ورود یا ثبت‌نام</button>
          </div>

          <div class="vv-step-2" style="display:none">
            <h3 class="vv-font">ورود به ویراویراست</h3>
            <div class="vv-input-wrapper">
              <input type="text" id="login_username" class="vv-font" required placeholder="شماره موبایل">
            </div>

            <div class="vv-input-wrapper vv-font">
              <input type="password" id="login_password" class="vv-font" required placeholder="رمز عبور">
              <span class="form-helper-text invalid-feedback">نام کاربری یا رمز عبور اشتباه است</span>
            </div>

            <div style="display: flex; gap:10px;">
              <button type="submit" class="vv-font vv-button">ورود</button>
              <a class="vv-font vv-button vv-button-secondary" href="<?php echo esc_html(VIRAVIRAST_SIGNUP_PATH) ?>"
                target="_blank">ثبت‌نام</a>
            </div>
          </div>
        </div>

      </div>
    </div>

  </form>
  <?php
}
  ?>
</div>
<?php
}