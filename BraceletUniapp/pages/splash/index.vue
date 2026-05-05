<template>
  <view class="splash-page">
    <!-- 顶部装饰 -->
    <view class="top-decor">
      <view class="decor-circle c1"></view>
      <view class="decor-circle c2"></view>
    </view>

    <!-- 品牌中心 -->
    <view class="brand-center">
      <view class="brand-logo">
        <image class="logo-img" src="/static/ack.webp" mode="aspectFit" />
      </view>
      <view class="brand-name">拾光手串</view>
      <view class="brand-slogan">每一颗珠子，都承载一段时光</view>
      <view class="brand-desc">天然材质 · DIY定制 · 匠心工艺</view>
    </view>

    <!-- 装饰线 -->
    <view class="divider-row">
      <view class="d-line"></view>
      <view class="d-dot"></view>
      <view class="d-line"></view>
    </view>

    <!-- 底部跳过按钮 -->
    <view class="skip-wrap">
      <view class="skip-btn" @click="handleSkip">
        <text class="skip-text">跳过</text>
      </view>
    </view>
  </view>
</template>

<script setup>
function handleSkip() {
  uni.setStorageSync('splash_watched', '1')
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $bg-primary;
}

.splash-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FDF8F3 0%, #FAF7F2 40%, #F5F0E8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* ========== 顶部装饰 ========== */
.top-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  pointer-events: none;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}

.decor-circle.c1 {
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, #E8D5B8, transparent);
  top: -100rpx;
  right: -60rpx;
}

.decor-circle.c2 {
  width: 200rpx;
  height: 200rpx;
  background: radial-gradient(circle, #D4B48C, transparent);
  top: 40rpx;
  left: -80rpx;
  opacity: 0.15;
}

/* ========== 品牌中心 ========== */
.brand-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  z-index: 1;
}

.brand-logo {
  width: 200rpx;
  height: 200rpx;
  background: #ffffff;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-xl;
  box-shadow: 0 12rpx 48rpx rgba(74, 55, 40, 0.12);
  border: 1rpx solid #e8e0d5;
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $text-primary;
  letter-spacing: 8rpx;
  margin-bottom: $space-md;
}

.brand-slogan {
  font-size: $text-base;
  color: $text-secondary;
  letter-spacing: 2rpx;
  margin-bottom: $space-sm;
}

.brand-desc {
  font-size: $text-sm;
  color: #D4B48C;
  font-weight: $font-semibold;
  letter-spacing: 4rpx;
}

/* ========== 分隔装饰 ========== */
.divider-row {
  display: flex;
  align-items: center;
  gap: $space-sm;
  margin-top: 100rpx;
  padding: 0 $space-2xl;
  width: 100%;
  box-sizing: border-box;
}

.d-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #e8e0d5, transparent);
}

.d-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #D4B48C;
}

/* ========== 底部跳过 ========== */
.skip-wrap {
  position: absolute;
  bottom: 60rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.skip-btn {
  width: 160rpx;
  height: 64rpx;
  background: rgba(212, 180, 140, 0.15);
  border: 1rpx solid rgba(212, 180, 140, 0.3);
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8rpx);
  transition: all 0.2s ease;

  &:active { background: rgba(212, 180, 140, 0.3); transform: scale(0.95); }
}

.skip-text {
  font-size: $text-sm;
  color: #D4B48C;
  font-weight: $font-semibold;
  letter-spacing: 2rpx;
}
</style>
