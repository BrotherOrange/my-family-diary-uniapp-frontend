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
  const token = uni.getStorageSync('token')
  const pages = getCurrentPages()
  const currentPage = pages.length > 0 ? pages[pages.length - 1] : null
  const currentPath = currentPage ? currentPage.route : ''

  // 如果当前不在登录页，且没有 token，则跳转到登录页
  if (!token && currentPath !== 'pages/login/login') {
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }
}
</script>

<style lang="scss">
/* 每个页面公共css */
</style>
