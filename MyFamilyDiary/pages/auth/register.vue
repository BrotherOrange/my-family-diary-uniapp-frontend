<template>
  <view class="register-container">
    <view class="form-section">
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { register } from '@/api/auth'

const openId = ref('')
const username = ref('')
const phone = ref('')
const birthday = ref('')
const password = ref('')
const confirmPassword = ref('')
const avatarUrl = ref('')
const loading = ref(false)

const today = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

onLoad((options) => {
  if (options.openId) {
    openId.value = options.openId
  } else {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/auth/login' })
    }, 1500)
  }
})

function onChooseAvatar(e) {
  console.log('onChooseAvatar:', e.detail)
  avatarUrl.value = e.detail.avatarUrl
}

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

function onBirthdayChange(e) {
  birthday.value = e.detail.value
}

function isValidPhone(phoneNum) {
  return /^1[3-9]\d{9}$/.test(phoneNum)
}

async function handleRegister() {
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
    uni.showToast({ title: '注册成功，请登录', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/auth/login' })
    }, 1500)
  } catch (err) {
    console.error('注册失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-container {
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
