<template>
  <view class="container">
    <view class="user-card" v-if="userInfo">
      <view class="avatar-container" @tap="previewAvatar">
        <image class="avatar" :src="userInfo.avatarUrl || '/static/logo.png'" mode="aspectFill" @error="onAvatarError"></image>
        <!-- #ifdef MP-WEIXIN -->
        <button
          class="avatar-change-btn"
          open-type="chooseAvatar"
          @chooseavatar="onChooseAvatar"
          @tap.stop
        >
          <text class="change-icon">&#x270E;</text>
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="avatar-change-btn" @tap.stop="chooseAvatar">
          <text class="change-icon">&#x270E;</text>
        </view>
        <!-- #endif -->
      </view>
      <view class="user-details">
        <text class="username">{{ userInfo.username || '用户' }}</text>
        <text class="status">{{ userInfo.status || '欢迎回来！' }}</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item">
        <text class="menu-icon">&#x1F4DD;</text>
        <text class="menu-text">写日记</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">&#x1F4DA;</text>
        <text class="menu-text">我的日记</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">&#x1F468;&#x200D;&#x1F469;&#x200D;&#x1F467;</text>
        <text class="menu-text">家庭成员</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">&#x2699;&#xFE0F;</text>
        <text class="menu-text">设置</text>
      </view>
    </view>

    <button class="logout-btn" @tap="handleLogout">退出登录</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { uploadAvatar, getAvatarUrl } from '@/api/cos'
import { logout } from '@/api/auth'

// 响应式状态
const userInfo = ref(null)
const uploading = ref(false)
let avatarRetrying = false
let lastAvatarRetryUrl = ''

async function refreshAvatarUrl(options = {}) {
  if (!userInfo.value || !userInfo.value.openId) {
    if (options.fromError) {
      avatarRetrying = false
    }
    return
  }

  try {
    const res = await getAvatarUrl(userInfo.value.openId)
    if (res.data) {
      userInfo.value.avatarUrl = res.data
      uni.setStorageSync('userInfo', userInfo.value)
    }
  } catch (e) {
    console.log('刷新头像URL失败', e)
  } finally {
    if (options.fromError) {
      avatarRetrying = false
    }
  }
}

// 使用 onShow 而不是 onLoad，因为 tabBar 页面切换时只触发 onShow
onShow(async () => {
  // Check login status (支持新旧token字段)
  const accessToken = uni.getStorageSync('accessToken')
  const legacyToken = uni.getStorageSync('token')
  if (!accessToken && !legacyToken) {
    navigateToLogin()
    return
  }

  // Get user info
  userInfo.value = uni.getStorageSync('userInfo') || {}

  // 刷新头像URL（URL有24小时过期时间，需要定期刷新）
  await refreshAvatarUrl()
})

// 预览头像大图
function previewAvatar() {
  const avatarUrl = userInfo.value.avatarUrl || '/static/logo.png'
  // 本地图片无法预览，给出提示
  if (avatarUrl.startsWith('/static/')) {
    uni.showToast({ title: '暂无头像', icon: 'none' })
    return
  }
  uni.previewImage({
    current: avatarUrl,
    urls: [avatarUrl]
  })
}

function onAvatarError() {
  if (!userInfo.value || !userInfo.value.openId) {
    return
  }
  const avatarUrl = userInfo.value.avatarUrl || ''
  if (!avatarUrl || avatarUrl.startsWith('/static/')) {
    return
  }
  if (avatarRetrying || avatarUrl === lastAvatarRetryUrl) {
    return
  }
  avatarRetrying = true
  lastAvatarRetryUrl = avatarUrl
  refreshAvatarUrl({ fromError: true })
}

// 微信头像选择回调
async function onChooseAvatar(e) {
  console.log('onChooseAvatar:', e.detail)
  const { avatarUrl } = e.detail
  if (avatarUrl) {
    await uploadAndUpdateAvatar(avatarUrl)
  }
}

// 非微信平台选择图片
function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['original'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      console.log('chooseImage success:', res)
      const tempFilePath = res.tempFilePaths[0]
      await uploadAndUpdateAvatar(tempFilePath)
    }
  })
}

// 上传并更新头像
async function uploadAndUpdateAvatar(tempFilePath) {
  if (uploading.value) return
  uploading.value = true

  uni.showLoading({ title: '上传中...' })

  try {
    // 将图片转为 Base64
    const base64Image = await imageToBase64(tempFilePath)

    // 获取 openId
    const openId = userInfo.value.openId
    if (!openId) {
      throw new Error('用户信息异常，请重新登录')
    }

    // 上传到服务器
    const res = await uploadAvatar(openId, base64Image)
    const newAvatarUrl = res.data

    // 更新本地数据
    userInfo.value.avatarUrl = newAvatarUrl
    uni.setStorageSync('userInfo', userInfo.value)

    uni.hideLoading()
    uni.showToast({ title: '头像更新成功', icon: 'success' })
  } catch (err) {
    console.error('上传头像失败:', err)
    uni.hideLoading()
    uni.showToast({ title: err.message || '上传失败，请重试', icon: 'none' })
  } finally {
    uploading.value = false
  }
}

// 图片转 Base64（统一使用 png 格式前缀）
function imageToBase64(filePath) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    const fs = uni.getFileSystemManager()
    fs.readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {
        // 统一使用 png 前缀，后端会保存为 .png 文件
        resolve('data:image/png;base64,' + res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
    // #endif
    // #ifdef H5
    // H5 环境使用 canvas 转换
    uni.getImageInfo({
      src: filePath,
      success: (info) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          // 头像尺寸
          const maxSize = 400
          let width = img.width
          let height = img.height
          const minSide = Math.min(width, height)
          const targetSize = Math.min(minSide, maxSize)
          canvas.width = targetSize
          canvas.height = targetSize
          // 居中裁剪为正方形
          const sx = (width - minSide) / 2
          const sy = (height - minSide) / 2
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize)
          // 返回带前缀的 base64
          const base64 = canvas.toDataURL('image/png')
          resolve(base64)
        }
        img.onerror = reject
        img.src = filePath
      },
      fail: reject
    })
    // #endif
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    confirmText: '确定',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用后端登出接口，使Token失效
          await logout()
        } catch (e) {
          // 即使接口失败也继续清除本地数据
          console.log('登出接口调用失败', e)
        }
        // 清除本地存储
        uni.removeStorageSync('accessToken')
        uni.removeStorageSync('refreshToken')
        uni.removeStorageSync('userInfo')
        // 兼容旧的token字段
        uni.removeStorageSync('token')
        navigateToLogin()
      }
    }
  })
}

function navigateToLogin() {
  uni.reLaunch({
    url: '/pages/auth/login'
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 30rpx;
  padding-top: 60rpx;
  background: #FFE8E0;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: #FF9A8B;
  border-radius: 24rpx;
  margin-bottom: 40rpx;
}

.avatar-container {
  position: relative;
  margin-right: 30rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.6);
  }
}

.avatar-change-btn {
  position: absolute;
  right: -8rpx;
  bottom: -8rpx;
  width: 44rpx;
  height: 44rpx;
  min-height: 44rpx;
  padding: 0;
  margin: 0;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  border: none;
  line-height: 1;

  &::after {
    border: none;
  }

  .change-icon {
    font-size: 24rpx;
    color: #FF7B6B;
  }
}

.user-details {
  flex: 1;

  .username {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 10rpx;
  }

  .status {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.menu-list {
  background: #FFEDE8;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(255, 154, 139, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  border-bottom: 1rpx solid #FFF0EB;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #FFE0D9;
  }

  .menu-icon {
    font-size: 44rpx;
    margin-right: 30rpx;
  }

  .menu-text {
    font-size: 32rpx;
    color: #333333;
  }
}

.logout-btn {
  margin-top: 60rpx;
  background: #FF7B6B;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 20rpx;
  border: none;

  &::after {
    border: none;
  }
}
</style>
