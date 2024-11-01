const viravirastLogout = (elem) => {
  try {
    // elem.prop('disabled', true);
    jQuery.post(
      ajaxurl,
      {
        action: "viravirast_logout",
        data: {},
      },
      function (res) {
        viravirastRedirectTo("viravirast");
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const viravirastChangeStepTo = (step) => {
  if (step == 1) {
    jQuery(".vv-step-1").show();
    jQuery(".vv-step-2").hide();
  } else {
    jQuery(".vv-step-1").hide();
    jQuery(".vv-step-2").show();
  }
};

viravirastIsSettingLoading = false;
let basicState = false;
let advancedState = false;
const viravirastToggleSetting = (element, settingName) => {
  const viravirastAvailableSettings = ["basicCheck", "advancedCheck"];
  if (viravirastAvailableSettings.includes(settingName)) {
    if (!viravirastIsSettingLoading) {
      if ([...element.classList].includes("is-active")) {
        if (settingName == "basicCheck") {
          basicState = false;
        } else if (settingName == "advancedCheck") {
          advancedState = false;
        }
      } else {
        if (settingName == "basicCheck") {
          basicState = true;
        } else if (settingName == "advancedCheck") {
          advancedState = true;
        }
      }
      viravirastIsSettingLoading = true;
      element.classList.toggle("is-active");
      element.parentNode.classList.add("is-loading");
      if (settingName == "advancedCheck" && advancedState == true) {
        Noti({
          status: "error",
          content:
            "ویرایش پیشرفته، جمله‌بندی‌ و ساختار متن شما را با هوش مصنوعی قدرتمند پردازش می‌کند؛ بنابراین ممکن است پردازش هر پاراگراف بین ۷ تا ۱۵ ثانیه زمان ببرد.",
          timer: 20000,
          animation: true,
          progress: true,
          bgcolor: "linear-gradient(60deg,#1C39BB,#1C39BB)",
          icon: "show",
        });
      }
      if (settingName == "basicCheck" && basicState == true) { 
        Noti({
          status: "error",
          content:
            "ویرایش پایه، فاصله‌بندی واژه‌ها و غلط‌های املایی را با درک معنا اصلاح می‌کند.",
          timer: 20000,
          animation: true,
          progress: true,
          bgcolor: "linear-gradient(60deg,#00A693,#00A693)",
          icon: "show",
        });
      }
      try {
        jQuery.post(
          ajaxurl,
          {
            action: "viravirast_toggleSetting",
            settingName: settingName,
          },
          function (res) {
            element.parentNode.classList.remove("is-loading");
            viravirastIsSettingLoading = false;
            if (settingName == "advancedCheck" && advancedState) {
              document
                .querySelector(".vv-is-advanced")
                .classList.add("is-active");
            } else if (settingName == "advancedCheck" && !advancedState) {
              document
                .querySelector(".vv-is-advanced")
                .classList.remove("is-active");
            }
            if (settingName == "basicCheck" && basicState) {
              document.querySelector(".vv-is-basic").classList.add("is-active");
            } else if (settingName == "basicCheck" && !basicState) {
              document
                .querySelector(".vv-is-basic")
                .classList.remove("is-active");
            }
          }
        );
      } catch (err) {
        viravirastIsSettingLoading = false;
        element.classList.toggle("is-active");
        element.parentNode.classList.remove("is-loading");
        console.log(err);
      }
    }
  }
};

jQuery(() => {
  let $ = jQuery;

  $(".viravirast-login-form").on("submit", async (e) => {
    e.preventDefault();

    const form = $(e.target);
    form.addClass("viravirast-was-validated");
    const submit = form.closest("form").find(":submit");

    const email = $(e.target.elements["login_username"]);
    const password = $(e.target.elements["login_password"]);

    if (!email.is(":valid") || !password.is(":valid")) {
      return;
    }

    const data = {
      username: email.val(),
      password: btoa(password.val()),
    };
    try {
      submit.prop("disabled", true);
      $.post(
        ajaxurl,
        {
          action: "viravirast_authenticate",
          data: data,
        },
        function (res) {
          if (res.status == 200 || res.status == 201) {
            console.log("logged in successfully", "should redirect...");
            viravirastRedirectTo("viravirast");
          } else if (res.status == 401) {
            console.log("unauthorized");
            // email.addClass("is-invalid");
            password.addClass("is-invalid");
            submit.prop("disabled", false);
          } else {
            console.log("something went wrong");
            // email.addClass("is-invalid");
            password.addClass("is-invalid");
            submit.prop("disabled", false);
          }
        }
      );
    } catch (err) {
      console.log(err);
      submit.prop("disabled", false);
    }
  });
});
