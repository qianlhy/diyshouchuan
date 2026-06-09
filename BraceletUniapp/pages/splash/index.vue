<template>
  <view class="splash-page">
    <!-- 视频背景 -->
    <view class="video-container">
      <video
        class="bg-video"
        src="https://www.tongxinyuan123.com/video/shouye.mp4"
        :autoplay="true"
        :loop="true"
        :muted="true"
        :controls="false"
        :show-progress="false"
        :show-fullscreen-btn="false"
        :show-play-btn="false"
        :show-center-play-btn="false"
        object-fit="cover"
        @error="onVideoError"
      ></video>
      <!-- 渐变遮罩 -->
      <view class="video-overlay"></view>
    </view>

    <!-- 品牌内容 -->
    <view class="brand-content">
      <view class="brand-logo">
        <image class="logo-img" src="/static/logo/brand_logo.jpg" mode="aspectFill" />
      </view>
      <view class="brand-name">拾光手串</view>
      <view class="brand-slogan">每一颗珠子，都承载一段时光</view>
      <view class="brand-tags">
        <text class="tag">天然材质</text>
        <text class="tag-dot">·</text>
        <text class="tag">DIY定制</text>
        <text class="tag-dot">·</text>
        <text class="tag">匠心工艺</text>
      </view>
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

function onVideoError(e) {
  console.error('视频加载失败:', e)
}
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.splash-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #1a1a1a;
}

/* ========== 视频背景 ========== */
.video-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

/* ========== 品牌内容 ========== */
.brand-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 60rpx;
}

.brand-logo {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.logo-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.brand-name {
  font-size: 56rpx;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 8rpx;
  margin-bottom: 24rpx;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.brand-slogan {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 4rpx;
  margin-bottom: 32rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.brand-tags {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.brand-tags .tag {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24rpx;
  backdrop-filter: blur(8rpx);
}

.brand-tags .tag-dot {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
}

/* ========== 底部跳过 ========== */
.skip-wrap {
  position: absolute;
  bottom: 80rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1;
}

.skip-btn {
  width: 160rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12rpx);
  transition: all 0.2s ease;

  &:active { 
    background: rgba(255, 255, 255, 0.25); 
    transform: scale(0.95); 
  }
}

.skip-text {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 500;
  letter-spacing: 4rpx;
}
</style>
