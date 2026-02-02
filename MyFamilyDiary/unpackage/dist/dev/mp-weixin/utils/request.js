"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "https://service.jihao-family.com";
function generateTraceId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function request(options) {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    const header = {
      "Content-Type": "application/json",
      "x-trace-id": generateTraceId()
    };
    if (options.auth && token) {
      header["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data);
        } else {
          let errorMsg = "请求失败";
          if (res.data.errors) {
            errorMsg = typeof res.data.errors === "string" ? res.data.errors : res.data.errors[0] || res.data.message;
          } else if (res.data.message) {
            errorMsg = res.data.message;
          }
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none"
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({
          title: "网络错误，请检查网络连接",
          icon: "none"
        });
        reject(err);
      }
    });
  });
}
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
