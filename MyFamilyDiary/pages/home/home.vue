<template>
  <view class="container">
    <view class="placeholder">
      <text class="placeholder-text">首页</text>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'

// 使用 onShow，tabBar 页面切换时会触发
onShow(() => {
  checkLogin()
})

function checkLogin() {
  // 支持新的 accessToken 和旧的 token 字段
  const accessToken = uni.getStorageSync('accessToken')
  const legacyToken = uni.getStorageSync('token')
  if (!accessToken && !legacyToken) {
    uni.reLaunch({ url: '/pages/auth/login' })
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #FFE8E0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder {
  .placeholder-text {
    font-size: 36rpx;
    color: #999999;
  }
}
</style>
