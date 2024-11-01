const viravirast__get_current_user = async () => {
  try {
    const response = await jQuery.ajax({
      "type": "GET",
      "url": ajaxurl,
      "data": {
        "action": "viravirast_current_user",
        "data": {},
      }
    });
    const res = JSON.parse(response)
    if (res.status == 200 || res.status == 201) {
      return res.body;
    } else {
      console.log("something went wrong");
    }
  } catch (err) {
    console.log(err);
  }
  return false;
}