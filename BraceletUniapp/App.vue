<template>
  <view />
</template>

<script>
import { checkAndAutoLogin } from './api/index.js'
import { updateCartBadgeNow } from './utils/cartBadge.js'

export default {
  onLaunch() {
    const splashWatched = uni.getStorageSync('splash_watched')
    if (!splashWatched) {
      uni.reLaunch({ url: '/pages/splash/index' })
      return
    }

    setTimeout(() => {
      updateCartBadgeNow()
    }, 500)

    checkAndAutoLogin().then((success) => {
      if (success) {
        console.log('[App] 自动登录成功')
      }
    })
  },
  onShow() {
    updateCartBadgeNow()

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

/* 加载 uView Plus 字体图标 */
@font-face {
  font-family: 'uicon-iconfont';
  src: url('https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf') format('truetype');
}

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
