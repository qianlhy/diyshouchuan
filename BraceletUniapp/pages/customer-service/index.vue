<template>
  <view class="customer-service-page">
    <view class="header">
      <text class="title">联系客服</text>
    </view>

    <view class="content">
      <view class="qr-container" v-if="qrCodeUrl">
        <image 
          class="qr-code" 
          :src="qrCodeUrl" 
          mode="aspectFit"
          show-menu-by-longpress="true"
          @error="onImageError"
        ></image>
        <text class="tip">长按识别二维码添加客服微信</text>
      </view>

      <view class="empty" v-else-if="!loading">
        <text class="empty-text">客服二维码暂未配置</text>
        <text class="empty-tip">请联系管理员设置客服二维码</text>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
    </view>

    <view class="tips">
      <view class="tip-item">
        <text class="tip-icon">📱</text>
        <text class="tip-text">扫描二维码添加客服微信</text>
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
import { ref, onMounted } from 'vue'
import { getCustomerServiceQRCode } from '../../api/api.js'
import { resolveImageUrl } from '../../utils/imageHelper.js'

const loading = ref(true)
const qrCodeUrl = ref('')

onMounted(() => {
  loadQRCode()
})

async function loadQRCode() {
  loading.value = true
  try {
    const res = await getCustomerServiceQRCode()
    console.log('客服二维码响应:', res)
    
    if (res) {
      qrCodeUrl.value = resolveImageUrl(res)
      console.log('客服二维码URL:', qrCodeUrl.value)
    } else {
      console.log('未获取到客服二维码')
      qrCodeUrl.value = ''
    }
  } catch (error) {
    console.error('获取客服二维码失败:', error)
    uni.showToast({
      title: '获取客服信息失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function onImageError(e) {
  console.error('图片加载失败:', e)
  uni.showToast({
    title: '二维码加载失败',
    icon: 'none'
  })
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
  min-height: 500rpx;
  justify-content: center;
  box-shadow: $shadow-sm;
  border: 1rpx solid $border-light;
  margin-bottom: $space-lg;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: $space-lg;
  border-radius: $radius-lg;
  background: $bg-secondary;
}

.tip {
  font-size: $text-base;
  color: $text-secondary;
  text-align: center;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-md;
}

.empty-text {
  font-size: $text-lg;
  color: $text-primary;
  font-weight: $font-medium;
}

.empty-tip {
  font-size: $text-sm;
  color: $text-tertiary;
}

.loading {
  color: $text-tertiary;
  font-size: $text-base;
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
