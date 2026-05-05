<template>
  <view class="tabbar">
    <view class="item" :class="{ active: active === 'home' }" @click="go('home')">
      <view class="icon" />
      <text>首页</text>
    </view>
    <view class="item" :class="{ active: active === 'design' }" @click="go('design')">
      <view class="icon" />
      <text>设计图纸</text>
    </view>
    <view class="item" :class="{ active: active === 'cart' }" @click="go('cart')">
      <view class="icon" />
      <text>购物车</text>
    </view>
    <view class="item" :class="{ active: active === 'mine' }" @click="go('mine')">
      <view class="icon" />
      <text>我的</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({ active: { type: String, default: '' } })

function go(key) {
  if (key === 'home') {
    uni.switchTab({ url: '/pages/index/index' })
  } else if (key === 'design') {
    uni.switchTab({ url: '/pages/design/index' })
  } else if (key === 'cart') {
    uni.switchTab({ url: '/pages/cart/index' })
  } else if (key === 'mine') {
    uni.switchTab({ url: '/pages/mine/index' })
  }
}
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 108rpx;
  background: #ffffff;
  border-top: 1rpx solid #e8e0d5;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}

.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9a8b7a;
  font-size: 20rpx;
  transition: all 0.2s ease;
  padding-top: 8rpx;

  .icon {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: #f0ebe3;
    margin-bottom: 4rpx;
    transition: all 0.2s ease;
  }
}

.item.active {
  color: #D4B48C;

  .icon {
    background: #f0e8d8;
  }
}
</style>
