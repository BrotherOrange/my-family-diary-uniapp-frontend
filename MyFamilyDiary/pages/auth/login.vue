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
      <view v-else class="password-form">
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
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { login, code2Session, checkUserExists } from '@/api/auth'

const openId = ref('')
const password = ref('')
const existingUser = ref({ username: '', avatarUrl: '' })
const loading = ref(false)
const pageLoading = ref(true)
const initError = ref('')

onLoad(() => {
  // 检查是否已登录（支持新旧token字段）
  const accessToken = uni.getStorageSync('accessToken')
  const legacyToken = uni.getStorageSync('token')
  if (accessToken || legacyToken) {
    navigateToHome()
    return
  }
  initWeChatLogin()
})

function initWeChatLogin() {
  pageLoading.value = true
  initError.value = ''

  // #ifdef MP-WEIXIN
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      console.log('uni.login success, code:', loginRes.code)
      try {
        const sessionRes = await code2Session(loginRes.code)
        console.log('code2Session response:', sessionRes)
        openId.value = sessionRes.data.openId

        const checkRes = await checkUserExists(openId.value)
        console.log('checkUserExists response:', checkRes)

        if (checkRes.data.registered) {
          existingUser.value = {
            username: checkRes.data.username,
            avatarUrl: checkRes.data.avatarUrl
          }
          pageLoading.value = false
        } else {
          // 新用户，跳转到注册页
          uni.redirectTo({
            url: `/pages/auth/register?openId=${openId.value}`
          })
        }
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
        pageLoading.value = false
      } else {
        uni.redirectTo({
          url: `/pages/auth/register?openId=${openId.value}`
        })
      }
    } catch (err) {
      console.log('H5 check user failed, redirect to register')
      uni.redirectTo({
        url: `/pages/auth/register?openId=${openId.value}`
      })
    }
  }, 500)
  // #endif
}

async function handleLogin() {
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await login(openId.value, password.value)
    // 保存双Token
    uni.setStorageSync('accessToken', res.data.accessToken)
    uni.setStorageSync('refreshToken', res.data.refreshToken)
    // 保存用户信息（不包含token）
    const userInfo = {
      openId: res.data.openId,
      username: res.data.username,
      phone: res.data.phone,
      description: res.data.description,
      birthday: res.data.birthday,
      status: res.data.status,
      avatarUrl: res.data.avatarUrl
    }
    uni.setStorageSync('userInfo', userInfo)
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
