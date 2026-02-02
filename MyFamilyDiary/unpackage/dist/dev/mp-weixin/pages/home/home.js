"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "home",
  setup(__props) {
    common_vendor.onShow(() => {
      checkLogin();
    });
    function checkLogin() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.reLaunch({ url: "/pages/login/login" });
      }
    }
    return (_ctx, _cache) => {
      return {};
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
