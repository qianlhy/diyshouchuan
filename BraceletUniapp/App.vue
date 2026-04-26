<template>
  <view />
</template>

<script>
import { checkAndAutoLogin } from './api/index.js'
import { updateCartBadgeNow } from './utils/cartBadge.js'

export default {
  onLaunch() {
    // 应用启动时立即更新购物车角标
    setTimeout(() => {
      updateCartBadgeNow()
    }, 500)
    
    // 应用启动时尝试自动登录
    checkAndAutoLogin().then((success) => {
      if (success) {
        console.log('[App] 自动登录成功')
      }
    })
  },
  onShow() {
    // 应用从后台进入前台时更新购物车角标
    updateCartBadgeNow()
    
    // 应用从后台进入前台时尝试自动登录
    checkAndAutoLogin().then((success) => {
      if (success) {
        console.log('[App] 自动登录成功')
      }
    })
  },
  onHide() {}
}
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';
@import '@/static/styles/animations.scss';

/* 全局页面样式 */
page {
  background-color: $bg-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 通用按钮重置 */
button {
  font-family: inherit;
}

button::after {
  border: none;
}

/* 图片默认样式 */
image {
  display: block;
}

/* 滚动条样式优化 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}
</style>
