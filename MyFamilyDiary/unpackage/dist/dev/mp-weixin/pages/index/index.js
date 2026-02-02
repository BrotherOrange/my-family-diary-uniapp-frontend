"use strict";
const common_vendor = require("../../common/vendor.js");
const api_cos = require("../../api/cos.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const uploading = common_vendor.ref(false);
    common_vendor.onLoad(() => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        navigateToLogin();
        return;
      }
      userInfo.value = common_vendor.index.getStorageSync("userInfo") || {};
    });
    function previewAvatar() {
      const avatarUrl = userInfo.value.avatarUrl || "/static/logo.png";
      if (avatarUrl.startsWith("/static/")) {
        common_vendor.index.showToast({ title: "暂无头像", icon: "none" });
        return;
      }
      common_vendor.index.previewImage({
        current: avatarUrl,
        urls: [avatarUrl]
      });
    }
    async function onChooseAvatar(e) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:89", "onChooseAvatar:", e.detail);
      const { avatarUrl } = e.detail;
      if (avatarUrl) {
        await uploadAndUpdateAvatar(avatarUrl);
      }
    }
    async function uploadAndUpdateAvatar(tempFilePath) {
      if (uploading.value)
        return;
      uploading.value = true;
      common_vendor.index.showLoading({ title: "上传中..." });
      try {
        const base64Image = await imageToBase64(tempFilePath);
        const openId = userInfo.value.openId;
        if (!openId) {
          throw new Error("用户信息异常，请重新登录");
        }
        const res = await api_cos.uploadAvatar(openId, base64Image);
        const newAvatarUrl = res.data;
        userInfo.value.avatarUrl = newAvatarUrl;
        common_vendor.index.setStorageSync("userInfo", userInfo.value);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "头像更新成功", icon: "success" });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:138", "上传头像失败:", err);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: err.message || "上传失败，请重试", icon: "none" });
      } finally {
        uploading.value = false;
      }
    }
    function imageToBase64(filePath) {
      return new Promise((resolve, reject) => {
        const fs = common_vendor.index.getFileSystemManager();
        fs.readFile({
          filePath,
          encoding: "base64",
          success: (res) => {
            resolve("data:image/png;base64," + res.data);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出登录吗？",
        confirmText: "确定",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userInfo");
            navigateToLogin();
          }
        }
      });
    }
    function navigateToLogin() {
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value
      }, userInfo.value ? {
        b: userInfo.value.avatarUrl || "/static/logo.png",
        c: common_vendor.o(onChooseAvatar),
        d: common_vendor.o(() => {
        }),
        e: common_vendor.o(previewAvatar),
        f: common_vendor.t(userInfo.value.username || "用户"),
        g: common_vendor.t(userInfo.value.status || "欢迎回来！")
      } : {}, {
        h: common_vendor.o(handleLogout)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
