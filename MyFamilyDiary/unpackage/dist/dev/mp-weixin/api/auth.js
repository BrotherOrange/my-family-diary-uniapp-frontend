"use strict";
require("../common/vendor.js");
const utils_request = require("../utils/request.js");
function login(openId, password) {
  return utils_request.request({
    url: "/v1/login",
    method: "POST",
    data: { openId, password }
  });
}
function register(data) {
  return utils_request.request({
    url: "/v1/register",
    method: "POST",
    data
  });
}
function code2Session(code) {
  return utils_request.request({
    url: "/v1/wechat/account/code2session",
    method: "POST",
    data: { code }
  });
}
function checkUserExists(openId) {
  return utils_request.request({
    url: "/v1/user/exists",
    method: "GET",
    data: { openId }
  });
}
exports.checkUserExists = checkUserExists;
exports.code2Session = code2Session;
exports.login = login;
exports.register = register;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/auth.js.map
