"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/home/home.js";
  "./pages/community/community.js";
  "./pages/mine/mine.js";
  "./pages/login/login.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      common_vendor.index.__f__("log", "at App.vue:5", "App Launch");
      checkLoginStatus();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at App.vue:10", "App Show");
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at App.vue:14", "App Hide");
    });
    function checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      const pages = getCurrentPages();
      const currentPage = pages.length > 0 ? pages[pages.length - 1] : null;
      const currentPath = currentPage ? currentPage.route : "";
      if (!token && currentPath !== "pages/login/login") {
        common_vendor.index.reLaunch({
          url: "/pages/login/login"
        });
      }
    }
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
