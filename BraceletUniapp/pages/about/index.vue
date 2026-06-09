<template>
  <view class="page">
    <!-- 品牌区 -->
    <view class="brand-section">
      <view class="brand-logo">
        <image class="logo-img" src="/static/logo/brand_logo.jpg" mode="aspectFill" />
      </view>
      <view class="brand-name">拾光手串</view>
      <view class="brand-slogan">每一颗珠子，都承载一段时光</view>
    </view>

    <!-- 装饰分隔线 -->
    <view class="divider">
      <view class="divider-line"></view>
      <view class="divider-dot"></view>
      <view class="divider-line"></view>
    </view>

    <!-- 品牌介绍 -->
    <view class="intro-section">
      <view class="section-label">关于品牌</view>
      <view class="intro-text">
        拾光手串创立于2020年，专注于天然材质手串的设计与定制。我们相信，每一串手链都承载着独特的情感与记忆。
      </view>
      <view class="intro-text">
        从原料挑选到成品打磨，每一步都倾注了匠人的专注与热忱。无论是自己佩戴还是馈赠亲友，拾光手串都是您的品质之选。
      </view>
    </view>

    <!-- 特点卡片 -->
    <view class="features-grid">
      <view class="feature-card">
        <view class="feature-icon" style="background: #F9F3EC;">
          <text class="u-iconfont" style="font-size: 40rpx; color: #D4B48C;">&#xe673;</text>
        </view>
        <view class="feature-title">DIY定制</view>
        <view class="feature-desc">自由搭配珠子，创造专属手串</view>
      </view>
      <view class="feature-card">
        <view class="feature-icon" style="background: #EDF5EE;">
          <text class="u-iconfont" style="font-size: 40rpx; color: #7AB88A;">&#xe617;</text>
        </view>
        <view class="feature-title">天然材质</view>
        <view class="feature-desc">精选天然宝石与木材，品质保障</view>
      </view>
      <view class="feature-card">
        <view class="feature-icon" style="background: #EEF4FC;">
          <text class="u-iconfont" style="font-size: 40rpx; color: #7A9EC9;">&#xe64d;</text>
        </view>
        <view class="feature-title">匠心工艺</view>
        <view class="feature-desc">纯手工打磨，细节精益求精</view>
      </view>
      <view class="feature-card">
        <view class="feature-icon" style="background: #F5F0EC;">
          <text class="u-iconfont" style="font-size: 40rpx; color: #8B6E4E;">&#xe751;</text>
        </view>
        <view class="feature-title">专属服务</view>
        <view class="feature-desc">一对一设计顾问，贴心服务</view>
      </view>
    </view>

    <!-- 联系信息 -->
    <view class="contact-section">
      <view class="contact-item">
        <view class="contact-icon">
          <text class="u-iconfont" style="font-size: 28rpx; color: #ffffff;">&#xe614;</text>
        </view>
        <text class="contact-text">微信客服：{{ wechatId }}</text>
      </view>
      <view class="contact-item">
        <view class="contact-icon">
          <text class="u-iconfont" style="font-size: 28rpx; color: #ffffff;">&#xe635;</text>
        </view>
        <text class="contact-text">服务时间：周一至周六 9:00-18:00</text>
      </view>
    </view>

    <!-- 底部版权 -->
    <view class="footer">
      <text class="footer-text">© 2020-2026 拾光手串 · 匠心定制</text>
    </view>
  </view>
</template>

<script setup>
import { CUSTOMER_SERVICE_WECHAT_ID } from '../../config.js'

const wechatId = CUSTOMER_SERVICE_WECHAT_ID
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.u-iconfont {
  font-family: "uicon-iconfont";
  text-decoration: none;
  text-align: center;
}

.page {
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: calc(80rpx + env(safe-area-inset-bottom));
}

/* ========== 品牌区 ========== */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-2xl $space-lg $space-xl;
}

.brand-logo {
  width: 160rpx;
  height: 160rpx;
  background: #ffffff;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-lg;
  box-shadow: 0 8rpx 32rpx rgba(74, 55, 40, 0.10);
  border: 1rpx solid #e8e0d5;
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $text-primary;
  letter-spacing: 6rpx;
  margin-bottom: $space-sm;
}

.brand-slogan {
  font-size: $text-sm;
  color: $text-tertiary;
  letter-spacing: 2rpx;
}

/* ========== 分隔线 ========== */
.divider {
  display: flex;
  align-items: center;
  padding: 0 $space-2xl;
  margin-bottom: $space-xl;
  gap: $space-sm;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #e8e0d5);
}

.divider-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #D4B48C;
}

/* ========== 品牌介绍 ========== */
.intro-section {
  padding: 0 $space-xl;
  margin-bottom: $space-xl;
}

.section-label {
  font-size: $text-sm;
  color: #D4B48C;
  font-weight: $font-bold;
  letter-spacing: 4rpx;
  margin-bottom: $space-md;
}

.intro-text {
  font-size: $text-base;
  color: $text-secondary;
  line-height: 1.8;
  margin-bottom: $space-md;
  text-align: justify;
}

/* ========== 特点卡片 ========== */
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-md;
  padding: 0 $space-md;
  margin-bottom: $space-xl;
}

.feature-card {
  background: #ffffff;
  border-radius: $radius-lg;
  padding: $space-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1rpx solid #e8e0d5;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.04);
  transition: all 0.2s ease;

  &:active { transform: scale(0.97); }
}

.feature-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-sm;
}

.feature-title {
  font-size: $text-base;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.feature-desc {
  font-size: $text-xs;
  color: $text-tertiary;
  line-height: 1.5;
}

/* ========== 联系信息 ========== */
.contact-section {
  padding: 0 $space-md;
  margin-bottom: $space-xl;
}

.contact-item {
  background: #ffffff;
  border-radius: $radius-md;
  padding: $space-md $space-lg;
  display: flex;
  align-items: center;
  gap: $space-md;
  margin-bottom: $space-sm;
  border: 1rpx solid #e8e0d5;
}

.contact-icon {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-text {
  font-size: $text-sm;
  color: $text-primary;
  font-weight: $font-medium;
}

/* ========== 底部版权 ========== */
.footer {
  padding: $space-xl 0;
  text-align: center;
}

.footer-text {
  font-size: $text-xs;
  color: $text-tertiary;
  letter-spacing: 2rpx;
}
</style>
