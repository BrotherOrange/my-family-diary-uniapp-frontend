"use strict";
const utils_request = require("../utils/request.js");
function uploadAvatar(openId, base64Image) {
  return utils_request.request({
    url: "/v1/cos/avatar/upload",
    method: "POST",
    data: { openId, base64Image },
    auth: true
  });
}
exports.uploadAvatar = uploadAvatar;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/cos.js.map
