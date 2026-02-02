"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const openId = common_vendor.ref("");
    const password = common_vendor.ref("");
    const confirmPassword = common_vendor.ref("");
    const username = common_vendor.ref("");
    const phone = common_vendor.ref("");
    const birthday = common_vendor.ref("");
    const avatarUrl = common_vendor.ref("");
    const existingUser = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const pageLoading = common_vendor.ref(true);
    const initError = common_vendor.ref("");
    const today = common_vendor.computed(() => {
      const date = /* @__PURE__ */ new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    });
    common_vendor.onLoad(() => {
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        navigateToHome();
        return;
      }
      initWeChatLogin();
    });
    function initWeChatLogin() {
      pageLoading.value = true;
      initError.value = "";
      existingUser.value = null;
      common_vendor.index.login({
        provider: "weixin",
        success: async (loginRes) => {
          common_vendor.index.__f__("log", "at pages/login/login.vue:210", "uni.login success, code:", loginRes.code);
          try {
            const sessionRes = await api_auth.code2Session(loginRes.code);
            common_vendor.index.__f__("log", "at pages/login/login.vue:214", "code2Session response:", sessionRes);
            openId.value = sessionRes.data.openId;
            const checkRes = await api_auth.checkUserExists(openId.value);
            common_vendor.index.__f__("log", "at pages/login/login.vue:219", "checkUserExists response:", checkRes);
            if (checkRes.data.registered) {
              existingUser.value = {
                username: checkRes.data.username,
                avatarUrl: checkRes.data.avatarUrl
              };
            }
            pageLoading.value = false;
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/login/login.vue:232", "初始化失败:", err);
            initError.value = "初始化失败，请重试";
            pageLoading.value = false;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/login/login.vue:238", "uni.login fail:", err);
          initError.value = "微信登录失败，请重试";
          pageLoading.value = false;
        }
      });
    }
    function onChooseAvatar(e) {
      common_vendor.index.__f__("log", "at pages/login/login.vue:266", "onChooseAvatar:", e.detail);
      avatarUrl.value = e.detail.avatarUrl;
    }
    function onNicknameBlur(e) {
      common_vendor.index.__f__("log", "at pages/login/login.vue:272", "onNicknameBlur:", e.detail);
    }
    function onBirthdayChange(e) {
      birthday.value = e.detail.value;
    }
    function isValidPhone(phoneNum) {
      return /^1[3-9]\d{9}$/.test(phoneNum);
    }
    async function handleLogin() {
      if (!password.value) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      loading.value = true;
      try {
        const res = await api_auth.login(openId.value, password.value);
        common_vendor.index.setStorageSync("token", res.data.token);
        common_vendor.index.setStorageSync("userInfo", res.data);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          navigateToHome();
        }, 1500);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:317", "登录失败:", err);
      } finally {
        loading.value = false;
      }
    }
    async function handleRegister() {
      if (!username.value) {
        common_vendor.index.showToast({ title: "请输入用户名", icon: "none" });
        return;
      }
      if (!phone.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!isValidPhone(phone.value)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (!birthday.value) {
        common_vendor.index.showToast({ title: "请选择生日", icon: "none" });
        return;
      }
      if (!password.value) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      if (password.value.length < 8 || password.value.length > 30) {
        common_vendor.index.showToast({ title: "密码长度需要8-30位", icon: "none" });
        return;
      }
      if (password.value !== confirmPassword.value) {
        common_vendor.index.showToast({ title: "两次密码输入不一致", icon: "none" });
        return;
      }
      loading.value = true;
      try {
        await api_auth.register({
          openId: openId.value,
          username: username.value,
          password: password.value,
          phone: phone.value,
          birthday: birthday.value
        });
        common_vendor.index.showToast({ title: "注册成功", icon: "success" });
        existingUser.value = {
          username: username.value,
          avatarUrl: avatarUrl.value
        };
        password.value = "";
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:373", "注册失败:", err);
      } finally {
        loading.value = false;
      }
    }
    function navigateToHome() {
      common_vendor.index.switchTab({ url: "/pages/home/home" });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: pageLoading.value
      }, pageLoading.value ? {} : common_vendor.e({
        b: initError.value
      }, initError.value ? {
        c: common_vendor.t(initError.value),
        d: common_vendor.o(initWeChatLogin)
      } : existingUser.value ? {
        f: existingUser.value.avatarUrl || "/static/logo.png",
        g: common_vendor.t(existingUser.value.username),
        h: password.value,
        i: common_vendor.o(($event) => password.value = $event.detail.value),
        j: loading.value,
        k: common_vendor.o(handleLogin)
      } : {
        l: avatarUrl.value || "/static/logo.png",
        m: common_vendor.o(onChooseAvatar),
        n: common_vendor.o(onNicknameBlur),
        o: username.value,
        p: common_vendor.o(($event) => username.value = $event.detail.value),
        q: phone.value,
        r: common_vendor.o(($event) => phone.value = $event.detail.value),
        s: common_vendor.t(birthday.value || "请选择生日"),
        t: !birthday.value ? 1 : "",
        v: birthday.value,
        w: today.value,
        x: common_vendor.o(onBirthdayChange),
        y: password.value,
        z: common_vendor.o(($event) => password.value = $event.detail.value),
        A: confirmPassword.value,
        B: common_vendor.o(($event) => confirmPassword.value = $event.detail.value),
        C: loading.value,
        D: common_vendor.o(handleRegister)
      }, {
        e: existingUser.value
      }));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
