<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  checkLoginStatus()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

// 检查登录状态
function checkLoginStatus() {
  // 支持新的 accessToken 和旧的 token 字段
  const accessToken = uni.getStorageSync('accessToken')
  const legacyToken = uni.getStorageSync('token')
  const hasToken = accessToken || legacyToken

  const pages = getCurrentPages()
  const currentPage = pages.length > 0 ? pages[pages.length - 1] : null
  const currentPath = currentPage ? currentPage.route : ''

  // 如果当前不在认证页面，且没有 token，则跳转到登录页
  if (!hasToken && !currentPath.startsWith('pages/auth/')) {
    uni.reLaunch({
      url: '/pages/auth/login'
    })
  }
}
</script>

<style lang="scss">
/* 每个页面公共css */
</style>
