<template>
  <view class="login-container">
    <!-- Loading State -->
    <view class="form-section" v-if="pageLoading">
      <view class="loading-state">
        <text>正在初始化...</text>
      </view>
    </view>

    <!-- Login Form -->
    <view class="form-section" v-else>
      <!-- Error State -->
      <view v-if="initError" class="error-state">
        <text class="error-text">{{ initError }}</text>
        <button class="retry-btn" @tap="initWeChatLogin">重试</button>
      </view>

      <!-- 老用户登录 -->
      <view v-else-if="existingUser" class="password-form">
        <!-- 显示用户头像和昵称 -->
        <view class="user-info-section">
          <image
            class="user-avatar"
            :src="existingUser.avatarUrl || '/static/logo.png'"
            mode="aspectFill"
          ></image>
          <text class="user-name">{{ existingUser.username }}</text>
          <text class="welcome-text">欢迎回来</text>
        </view>

        <view class="input-group">
          <text class="input-label">密码</text>
          <input
            class="input-field"
            type="text"
            :password="true"
            v-model="password"
            placeholder="请输入密码"
            maxlength="30"
          />
        </view>

        <button class="submit-btn" :loading="loading" @tap="handleLogin">
          登录
        </button>
      </view>

      <!-- 新用户注册 -->
      <view v-else class="password-form">
        <view class="register-title">
          <text class="title-text">新用户注册</text>
          <text class="title-desc">完善信息开始使用</text>
        </view>

        <!-- Avatar Section -->
        <view class="avatar-section">
          <!-- #ifdef MP-WEIXIN -->
          <button
            class="avatar-btn"
            open-type="chooseAvatar"
            @chooseavatar="onChooseAvatar"
          >
            <image
              class="avatar-preview"
              :src="avatarUrl || '/static/logo.png'"
              mode="aspectFill"
            ></image>
            <view class="avatar-edit-icon">
              <text>+</text>
            </view>
          </button>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <view class="avatar-wrapper" @tap="chooseLocalImage">
            <image
              class="avatar-preview"
              :src="avatarUrl || '/static/logo.png'"
              mode="aspectFill"
            ></image>
            <view class="avatar-edit-icon">
              <text>+</text>
            </view>
          </view>
          <!-- #endif -->
          <text class="avatar-hint">点击选择头像</text>
        </view>

        <!-- Username -->
        <view class="input-group">
          <text class="input-label">用户名</text>
          <!-- #ifdef MP-WEIXIN -->
          <input
            class="input-field"
            type="nickname"
            v-model="username"
            placeholder="请输入昵称（点击可选微信昵称）"
            maxlength="20"
            @blur="onNicknameBlur"
          />
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <input
            class="input-field"
            type="text"
            v-model="username"
            placeholder="请输入用户名"
            maxlength="20"
          />
          <!-- #endif -->
        </view>

        <view class="input-group">
          <text class="input-label">手机号</text>
          <input
            class="input-field"
            type="number"
            v-model="phone"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>

        <view class="input-group">
          <text class="input-label">生日</text>
          <picker mode="date" :value="birthday" :end="today" @change="onBirthdayChange">
            <view class="input-field picker-field">
              <text :class="{ placeholder: !birthday }">
                {{ birthday || '请选择生日' }}
              </text>
            </view>
          </picker>
        </view>

        <view class="input-group">
          <text class="input-label">密码</text>
          <input
            class="input-field"
            type="text"
            :password="true"
            v-model="password"
            placeholder="请输入密码（8-30位）"
            maxlength="30"
          />
        </view>

        <view class="input-group">
          <text class="input-label">确认密码</text>
          <input
            class="input-field"
            type="text"
            :password="true"
            v-model="confirmPassword"
            placeholder="请再次输入密码"
            maxlength="30"
          />
        </view>

        <button class="submit-btn" :loading="loading" @tap="handleRegister">
          注册
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { login, register, code2Session, checkUserExists } from '@/api/auth'

// 响应式状态
const openId = ref('')
const password = ref('')
const confirmPassword = ref('')
const username = ref('')
const phone = ref('')
const birthday = ref('')
const avatarUrl = ref('')
const existingUser = ref(null) // 已注册用户信息 { username, avatarUrl }
const loading = ref(false)
const pageLoading = ref(true)
const initError = ref('')

// 计算属性
const today = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

// 页面加载
onLoad(() => {
  const token = uni.getStorageSync('token')
  if (token) {
    navigateToHome()
    return
  }
  initWeChatLogin()
})

// Initialize WeChat login (silent)
function initWeChatLogin() {
  pageLoading.value = true
  initError.value = ''
  existingUser.value = null

  // #ifdef MP-WEIXIN
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      console.log('uni.login success, code:', loginRes.code)
      try {
        // 1. 获取 openId
        const sessionRes = await code2Session(loginRes.code)
        console.log('code2Session response:', sessionRes)
        openId.value = sessionRes.data.openId

        // 2. 检查用户是否已注册
        const checkRes = await checkUserExists(openId.value)
        console.log('checkUserExists response:', checkRes)

        if (checkRes.data.registered) {
          // 老用户，显示头像和昵称
          existingUser.value = {
            username: checkRes.data.username,
            avatarUrl: checkRes.data.avatarUrl
          }
        }
        // 新用户，existingUser 保持 null，显示注册表单

        pageLoading.value = false
      } catch (err) {
        console.error('初始化失败:', err)
        initError.value = '初始化失败，请重试'
        pageLoading.value = false
      }
    },
    fail: (err) => {
      console.error('uni.login fail:', err)
      initError.value = '微信登录失败，请重试'
      pageLoading.value = false
    }
  })
  // #endif

  // #ifdef H5
  setTimeout(async () => {
    openId.value = 'test_open_id_h5'
    try {
      const checkRes = await checkUserExists(openId.value)
      if (checkRes.data.registered) {
        existingUser.value = {
          username: checkRes.data.username,
          avatarUrl: checkRes.data.avatarUrl
        }
      }
    } catch (err) {
      console.log('H5 check user failed, showing register form')
    }
    pageLoading.value = false
  }, 500)
  // #endif
}

// 微信头像选择回调（新API）
function onChooseAvatar(e) {
  console.log('onChooseAvatar:', e.detail)
  avatarUrl.value = e.detail.avatarUrl
}

// 昵称输入框失焦回调
function onNicknameBlur(e) {
  console.log('onNicknameBlur:', e.detail)
  // 昵称会自动填入 v-model
}

// 非微信环境选择本地图片
function chooseLocalImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      console.log('chooseImage success:', res)
      avatarUrl.value = res.tempFilePaths[0]
    }
  })
}

// Handle birthday picker change
function onBirthdayChange(e) {
  birthday.value = e.detail.value
}

// Validate phone number
function isValidPhone(phoneNum) {
  return /^1[3-9]\d{9}$/.test(phoneNum)
}

// 老用户登录
async function handleLogin() {
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await login(openId.value, password.value)
    uni.setStorageSync('token', res.data.token)
    // 保存用户信息（后端已返回 openId 和 avatarUrl）
    uni.setStorageSync('userInfo', res.data)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      navigateToHome()
    }, 1500)
  } catch (err) {
    console.error('登录失败:', err)
  } finally {
    loading.value = false
  }
}

// 新用户注册
async function handleRegister() {
  // 表单验证
  if (!username.value) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!isValidPhone(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!birthday.value) {
    uni.showToast({ title: '请选择生日', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (password.value.length < 8 || password.value.length > 30) {
    uni.showToast({ title: '密码长度需要8-30位', icon: 'none' })
    return
  }
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await register({
      openId: openId.value,
      username: username.value,
      password: password.value,
      phone: phone.value,
      birthday: birthday.value
    })
    uni.showToast({ title: '注册成功', icon: 'success' })

    // 注册成功后，设置为老用户状态，等待输入密码登录
    existingUser.value = {
      username: username.value,
      avatarUrl: avatarUrl.value
    }
    password.value = ''
  } catch (err) {
    console.error('注册失败:', err)
  } finally {
    loading.value = false
  }
}

// Navigate to home page
function navigateToHome() {
  uni.switchTab({ url: '/pages/home/home' })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  padding: 40rpx;
  background: #FFE8E0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-section {
  background: #FFEDE8;
  border-radius: 30rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(255, 154, 139, 0.15);
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  color: #666666;
  font-size: 28rpx;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;

  .error-text {
    color: #FF6B6B;
    font-size: 28rpx;
    margin-bottom: 30rpx;
  }
}

.retry-btn {
  background: #FF9A8B;
  color: #ffffff;
  font-size: 28rpx;
  padding: 20rpx 60rpx;
  border-radius: 16rpx;
  border: none;

  &::after {
    border: none;
  }
}

/* User Info Section (老用户登录) */
.user-info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;

  .user-avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 4rpx solid #FFE0D9;
    margin-bottom: 20rpx;
  }

  .user-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 8rpx;
  }

  .welcome-text {
    font-size: 26rpx;
    color: #999999;
  }
}

/* Register Title (新用户注册) */
.register-title {
  text-align: center;
  margin-bottom: 30rpx;

  .title-text {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 8rpx;
  }

  .title-desc {
    font-size: 26rpx;
    color: #999999;
  }
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;

  .avatar-hint {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #999999;
  }
}

.avatar-btn {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  overflow: visible;

  &::after {
    border: none;
  }
}

.avatar-wrapper {
  position: relative;
  width: 140rpx;
  height: 140rpx;
}

.avatar-preview {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid #FFE0D9;
}

.avatar-edit-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 40rpx;
  height: 40rpx;
  background: #FF9A8B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    color: #ffffff;
    font-size: 28rpx;
    font-weight: bold;
  }
}

/* Input Group */
.input-group {
  margin-bottom: 24rpx;

  .input-label {
    display: block;
    font-size: 26rpx;
    color: #666666;
    margin-bottom: 12rpx;
  }
}

.input-field {
  width: 100%;
  height: 84rpx;
  padding: 0 24rpx;
  border: 2rpx solid #FFD4C9;
  border-radius: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background: #FFF8F5;

  &:focus {
    border-color: #FF9A8B;
  }
}

.picker-field {
  display: flex;
  align-items: center;
  background: #FFF8F5;

  .placeholder {
    color: #999999;
  }
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #FF9A8B;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 20rpx;
  border: none;
  margin-top: 16rpx;

  &::after {
    border: none;
  }
}
</style>
