<template>
  <view class="page">
    <!-- 顶部返回 -->
    <view class="header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="title">微信登录</text>
      <view class="placeholder"></view>
    </view>

    <!-- 登录卡片 -->
    <view class="login-card">
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">拾光手串</text>
        <text class="slogan">匠心定制 · 独一无二</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="label">头像</text>
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image 
              class="avatar" 
              :src="avatarUrl || '/static/tabbar/mine.png'" 
              mode="aspectFill" 
            />
            <text class="tip">点击选择</text>
          </button>
        </view>

        <view class="form-item">
          <text class="label">昵称</text>
          <input
            class="nickname-input"
            type="nickname"
            v-model="nickName"
            placeholder="请输入昵称"
            maxlength="20"
          />
        </view>
      </view>

      <view class="agreement-row" @click="toggleAgreement">
        <view class="checkbox" :class="{ checked: agreedPrivacy }">
          <text v-if="agreedPrivacy" class="check-icon">✓</text>
        </view>
        <view class="agreement-text">
          <text>我已阅读并同意</text>
          <text class="link" @click.stop="showPrivacy">《隐私政策》</text>
          <text>和</text>
          <text class="link" @click.stop="showTerms">《用户服务协议》</text>
        </view>
      </view>

      <button
        class="login-btn"
        :class="{ disabled: !agreedPrivacy }"
        @click="handleLogin"
      >微信授权登录</button>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { wechatLogin } from '../../utils/auth.js';

const nickName = ref('')
const avatarUrl = ref('')
const redirectUrl = ref('')
const agreedPrivacy = ref(false)

onLoad((options) => {
  // 获取跳转回来的页面地址
  if (options.redirect) {
    redirectUrl.value = decodeURIComponent(options.redirect)
  }
  // 设置默认昵称
  nickName.value = '微信用户'
})

function onChooseAvatar(e) {
  const { avatarUrl: url } = e.detail
  if (url) {
    avatarUrl.value = url
  }
}

function toggleAgreement() {
  agreedPrivacy.value = !agreedPrivacy.value
}

async function handleLogin() {
  if (!agreedPrivacy.value) {
    uni.showToast({ title: '请先阅读并勾选同意协议', icon: 'none' })
    return
  }

  if (!nickName.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  try {
    const res = await wechatLogin({
      nickName: nickName.value,
      avatarUrl: avatarUrl.value
    })
    
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    // 触发登录成功事件
    uni.$emit('loginSuccess', res)
    
    // 如果有跳转地址，延迟后跳转
    setTimeout(() => {
      if (redirectUrl.value) {
        uni.redirectTo({ url: redirectUrl.value })
      } else {
        uni.navigateBack()
      }
    }, 1000)
  } catch (e) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  }
}

function goBack() {
  uni.navigateBack()
}

function showPrivacy() {
  uni.navigateTo({ url: '/pages/privacy/index' })
}

function showTerms() {
  uni.navigateTo({ url: '/pages/terms/index' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9F6F2;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
  
  .back-btn {
    font-size: 48rpx;
    color: #4A3728;
    padding: 0 20rpx;
  }
  
  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #4A3728;
  }
  
  .placeholder {
    width: 80rpx;
  }
}

.login-card {
  margin: 40rpx 30rpx;
  padding: 60rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  
  .logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 24rpx;
    margin-bottom: 20rpx;
  }
  
  .app-name {
    font-size: 40rpx;
    font-weight: 700;
    color: #4A3728;
    margin-bottom: 8rpx;
  }
  
  .slogan {
    font-size: 26rpx;
    color: #9a8b7a;
  }
}

.form-section {
  margin-bottom: 60rpx;
}

.form-item {
  margin-bottom: 40rpx;
  
  .label {
    display: block;
    font-size: 28rpx;
    color: #4A3728;
    margin-bottom: 16rpx;
    font-weight: 500;
  }
}

.avatar-btn {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f5f0ec;
  border-radius: 16rpx;
  
  &::after {
    border: none;
  }
  
  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }
  
  .tip {
    font-size: 28rpx;
    color: #9a8b7a;
  }
}

.nickname-input {
  height: 90rpx;
  padding: 0 24rpx;
  background: #f5f0ec;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #4A3728;
}

.login-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: #07C160;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.9;
  }

  &.disabled {
    background: #b8dfc8;
    color: rgba(255, 255, 255, 0.9);
  }
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #D4B48C;
  border-radius: 6rpx;
  margin-right: 16rpx;
  margin-top: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #fff;

  &.checked {
    background: #D4B48C;
    border-color: #D4B48C;
  }
}

.check-icon {
  font-size: 22rpx;
  color: #fff;
  line-height: 1;
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #9a8b7a;
  line-height: 1.8;

  .link {
    color: #D4B48C;
  }
}
</style>
