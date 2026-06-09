<template>
  <view class="page">
    <view class="header">
      <text class="title">联系客服</text>
    </view>

    <view class="content">
      <view class="qr-container">
        <image
          class="qr-code"
          :src="qrCodeUrl"
          mode="aspectFit"
          show-menu-by-longpress="true"
          @error="onImageError"
        />
        <text class="tip">长按识别二维码添加客服微信</text>
      </view>

      <view class="wechat-id-row" @click="copyWechatId">
        <text class="wechat-id-label">客服微信号</text>
        <text class="wechat-id-value">{{ wechatId }}</text>
        <text class="wechat-id-copy">复制</text>
      </view>
    </view>

    <view class="tips">
      <view class="tip-item">
        <text class="tip-icon">📱</text>
        <text class="tip-text">扫描二维码或搜索微信号添加客服</text>
      </view>
      <view class="tip-item">
        <text class="tip-icon">💬</text>
        <text class="tip-text">获取专属购物建议和售后服务</text>
      </view>
      <view class="tip-item">
        <text class="tip-icon">⏰</text>
        <text class="tip-text">工作时间：9:00-22:00</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { CUSTOMER_SERVICE_QR_PATH, CUSTOMER_SERVICE_WECHAT_ID } from '../../config.js'

const qrCodeUrl = ref(CUSTOMER_SERVICE_QR_PATH)
const wechatId = ref(CUSTOMER_SERVICE_WECHAT_ID)

function copyWechatId() {
  uni.setClipboardData({
    data: wechatId.value,
    success: () => {
      uni.showToast({ title: '微信号已复制', icon: 'success' })
    }
  })
}

function onImageError() {
  uni.showToast({ title: '二维码加载失败', icon: 'none' })
}
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $bg-primary;
  padding: $space-lg;
  padding-bottom: 180rpx;
}

.header {
  margin-bottom: $space-xl;
  text-align: center;
}

.title {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.content {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $space-xl $space-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: $shadow-sm;
  border: 1rpx solid $border-light;
  margin-bottom: $space-lg;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $space-lg;
}

.qr-code {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: $space-md;
  border-radius: $radius-lg;
  background: $bg-secondary;
}

.tip {
  font-size: $text-base;
  color: $text-secondary;
  text-align: center;
}

.wechat-id-row {
  display: flex;
  align-items: center;
  gap: $space-sm;
  width: 100%;
  padding: $space-md $space-lg;
  background: $bg-secondary;
  border-radius: $radius-lg;
  box-sizing: border-box;
}

.wechat-id-label {
  font-size: $text-sm;
  color: $text-secondary;
  flex-shrink: 0;
}

.wechat-id-value {
  flex: 1;
  font-size: $text-md;
  font-weight: $font-semibold;
  color: $text-primary;
}

.wechat-id-copy {
  font-size: $text-sm;
  color: #D4B48C;
  flex-shrink: 0;
}

.tips {
  padding: 0;
}

.tip-item {
  display: flex;
  align-items: center;
  margin-bottom: $space-md;
  background: $bg-card;
  padding: $space-lg;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  border: 1rpx solid $border-light;
}

.tip-icon {
  font-size: 40rpx;
  margin-right: $space-md;
}

.tip-text {
  font-size: $text-base;
  color: $text-secondary;
}
</style>
