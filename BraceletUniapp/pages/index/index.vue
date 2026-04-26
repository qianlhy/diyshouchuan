<template>
  <view class="page">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar"></view>

    <!-- 用户信息头部 -->
    <view class="user-header">
      <!-- 已登录状态 -->
      <block v-if="user">
        <image class="avatar" :src="user.avatarUrl || '/static/tabbar/mine.png'" mode="aspectFill"></image>
        <view class="user-info">
          <text class="nickname">{{ user.nickName || '微信用户' }}</text>
          <text class="welcome-text">欢迎回来，开始你的创作之旅</text>
        </view>
      </block>
      
      <!-- 未登录状态 -->
      <block v-else>
        <view class="info-icon-wrapper">
          <IconFont type="person-filled" size="88" color="#fff"></IconFont>
        </view>
        <view class="user-info">
          <text class="nickname">Hi，欢迎光临</text>
          <text class="welcome-text">登录后可同步设计与订单</text>
        </view>
        <button class="login-btn" @click="handleUserClick">微信登录</button>
      </block>
    </view>

    <!-- 轮播图 -->
    <view class="banner-section">
      <swiper 
        class="banner-swiper" 
        circular 
        :indicator-dots="true" 
        :autoplay="true" 
        :interval="4000" 
        :duration="500"
        indicator-active-color="#ffffff"
        indicator-color="rgba(255,255,255,0.6)"
      >
        <swiper-item v-for="(item, index) in banners" :key="item.id || index">
          <image 
            class="banner-image" 
            :src="item.imageUrl" 
            mode="aspectFill" 
            @click="onBannerClick(item)"
          ></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 功能卡片区域 -->
    <view class="action-section">
      <!-- DIY定制 -->
      <view class="action-card diy-card" @click="goDesign">
        <view class="icon-wrapper diy-icon-bg">
          <IconFont type="color" size="64" color="#fff"></IconFont>
        </view>
        <view class="card-text">
          <text class="card-title">DIY定制</text>
          <text class="card-subtitle">设计专属手链</text>
        </view>
      </view>

      <!-- 成品选购 -->
      <view class="action-card shop-card" @click="goProducts">
        <view class="icon-wrapper shop-icon-bg">
          <IconFont type="shop" size="64" color="#fff"></IconFont>
        </view>
        <view class="card-text">
          <text class="card-title">成品选购</text>
          <text class="card-subtitle">精选成品手链</text>
        </view>
      </view>
    </view>

    <!-- 底部Slogan -->
    <view class="footer">
      <text class="footer-text">拾光手串 · 匠心定制</text>
    </view>

    <!-- 完善资料弹窗 -->
    <view v-if="showEditProfile" class="overlay">
      <view class="edit-popup">
        <text class="popup-title">完善个人资料</text>
        
        <view class="form-item">
          <text class="form-label">头像</text>
          <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="avatar-preview" :src="tempAvatarUrl || '/static/tabbar/mine.png'" mode="aspectFill"></image>
            <text class="avatar-tip">点击更换</text>
          </button>
        </view>
        
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input type="nickname" class="nickname-input" v-model="tempNickname" placeholder="请输入昵称" @blur="onNicknameBlur" />
        </view>
        
        <button class="confirm-btn" @click="confirmLogin">确认登录</button>
        <text class="skip-btn" @click="skipLogin">跳过，使用默认</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { getBannerList, loginWithWeixinCode, userGet, userSet } from '../../api/index.js'
import { resolveImageUrl } from '../../utils/imageHelper.js'

const banners = ref([])
const user = ref(null)

// 登录弹窗相关状态
const showEditProfile = ref(false)
const tempAvatarUrl = ref('')
const tempNickname = ref('')

const loadBanners = async () => {
  try {
    const list = await getBannerList()
    console.log('Banner list:', list)
    if (Array.isArray(list)) {
      // Process image URLs
      banners.value = list.map(item => {
        let imageUrl = item.imageUrl || ''
        imageUrl = resolveImageUrl(imageUrl)
        return {
          ...item,
          imageUrl
        }
      })
    }
  } catch (e) {
    console.error('获取轮播图失败', e)
    // Fallback or empty state
  }
}

const checkLogin = () => {
  user.value = userGet()
}

const handleUserClick = () => {
  if (!user.value) {
    showEditProfile.value = true
    tempNickname.value = '微信用户'
    tempAvatarUrl.value = ''
  }
}

const onChooseAvatar = (e) => {
  const { avatarUrl } = e.detail
  tempAvatarUrl.value = avatarUrl
}

const onNicknameBlur = (e) => {
  tempNickname.value = e.detail.value
}

const confirmLogin = () => {
  const userInfo = {
    nickName: tempNickname.value || '微信用户',
    avatarUrl: tempAvatarUrl.value || ''
  }
  performLogin(userInfo)
}

const skipLogin = () => {
  const userInfo = {
    nickName: '微信用户',
    avatarUrl: ''
  }
  performLogin(userInfo)
}

const performLogin = (userInfo) => {
  // 模拟登录成功，先保存本地
  userSet(userInfo)
  user.value = userInfo
  showEditProfile.value = false
  
  // 调用后端登录
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
       if (loginRes.code) {
         try {
           await loginWithWeixinCode(loginRes.code, userInfo)
         } catch(e) {
           console.error('后端登录失败', e)
         }
       }
    }
  })
}

const onBannerClick = (item) => {
  if (item.link) {
    // Determine if link is a tabbar page or normal page
    const tabbarPages = [
      '/pages/index/index',
      '/pages/design/index',
      '/pages/cart/index',
      '/pages/mine/index'
    ]
    if (tabbarPages.includes(item.link)) {
      uni.switchTab({ url: item.link })
    } else {
      uni.navigateTo({ url: item.link })
    }
  }
}

const goDesign = () => {
  uni.switchTab({
    url: '/pages/design/index'
  })
}

const goProductList = () => {
  // 假设严选是商品列表页，且可能传递某个分类ID
  // 如果没有特定分类，直接跳转
  uni.navigateTo({
    url: '/pages/product/list'
  })
}

onShow(() => {
  checkLogin()
  // 延迟检查自动登录，确保App.vue中的自动登录已完成
  // 自动登录需要调用微信接口，可能需要较长时间
  setTimeout(() => {
    checkLogin()
  }, 1000)
  
  // 再次检查，确保万无一失
  setTimeout(() => {
    checkLogin()
  }, 2000)
})

onMounted(() => {
  loadBanners()
  checkLogin()
})
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.page {
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-primary 0%, #FAF8F5 30%, #F5F3F0 70%, #F0EEE9 100%);
  padding: 0 $space-lg;
  box-sizing: border-box;
  position: relative;
  
  /* 顶部金色光晕装饰 */
  &::before {
    content: '';
    position: fixed;
    top: -100rpx;
    right: -100rpx;
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, rgba(201, 168, 108, 0.12) 0%, rgba(201, 168, 108, 0.04) 40%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  
  /* 底部装饰性纹理 */
  &::after {
    content: '';
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 300rpx;
    background: linear-gradient(to top, rgba(201, 168, 108, 0.03) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }
}

.status-bar {
  height: var(--status-bar-height);
  width: 100%;
}

/* ========== 用户头部 - 全新设计 ========== */
.user-header {
  display: flex;
  align-items: center;
  padding: $space-lg;
  background: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: $space-md;
  box-shadow: $shadow-md;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: $space-md;
  background-color: $bg-secondary;
  border: 4rpx solid $bg-card;
  box-shadow: $shadow-sm;
  transition: transform 0.3s ease;
}

.info-icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: $space-md;
  background: linear-gradient(135deg, $primary-light 0%, $primary 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid $bg-card;
  box-shadow: $shadow-sm;
  transition: transform 0.3s ease;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nickname {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-xs;
  letter-spacing: 1rpx;
}

.welcome-text {
  font-size: $text-sm;
  color: $text-tertiary;
}

.login-btn {
  margin: 0;
  padding: 0 $space-lg;
  height: 64rpx;
  line-height: 64rpx;
  background: $primary-gradient;
  color: $text-white;
  font-size: $text-base;
  font-weight: $font-medium;
  border-radius: $radius-full;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(201, 168, 108, 0.3);
  transition: all 0.2s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 2rpx 8rpx rgba(201, 168, 108, 0.2);
  }
}

/* ========== 轮播图 - 优化高度比例 ========== */
.banner-section {
  width: 100%;
  margin-bottom: $space-lg;
  
  swiper {
    height: 360rpx;  /* 从690rpx调整为360rpx，16:9比例更合适 */
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-md;
    
    .banner-image {
      width: 100%;
      height: 100%;
      border-radius: $radius-lg;
    }
  }
  
  /* 轮播指示器样式优化 */
  .wx-swiper-dot {
    width: 8rpx !important;
    height: 8rpx !important;
    background: rgba(255, 255, 255, 0.5) !important;
    border-radius: 4rpx !important;
    transition: all 0.3s ease;
  }
  
  .wx-swiper-dot-active {
    width: 24rpx !important;
    background: $primary !important;
  }
}

/* 弹窗样式 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-popup {
  width: 600rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.popup-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
}

.form-item {
  width: 100%;
  margin-bottom: 30rpx;
  
  .form-label {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
    display: block;
  }
}

.avatar-wrapper {
  width: 100%;
  height: 200rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px dashed #ddd;
  
  &::after {
    border: none;
  }
  
  .avatar-preview {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-bottom: 10rpx;
  }
  
  .avatar-tip {
    font-size: 24rpx;
    color: #999;
  }
}

.nickname-input {
  width: 100%;
  height: 88rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #cda274;
  color: #fff;
  font-size: 30rpx;
  border-radius: 44rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  
  &::after {
    border: none;
  }
}

.skip-btn {
  font-size: 26rpx;
  color: #999;
  padding: 10rpx;
}

/* ========== 功能卡片 - 全新设计 ========== */
.action-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: $space-xl;
  gap: $space-md;
}

.action-card {
  flex: 1;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-xl 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  /* 顶部装饰线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: $primary-gradient;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:active {
    transform: translateY(-4rpx);
    box-shadow: $shadow-lg;
    
    &::before {
      transform: scaleX(1);
    }
  }
}

.icon-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-md;
  position: relative;
  
  /* 内圈装饰 */
  &::after {
    content: '';
    position: absolute;
    inset: 8rpx;
    border-radius: 50%;
    border: 2rpx dashed rgba(255, 255, 255, 0.5);
  }
}

.diy-icon-bg {
  background: linear-gradient(135deg, $secondary-light 0%, $secondary 100%);
  box-shadow: 0 8rpx 24rpx rgba(139, 154, 124, 0.3);
}

.select-icon-bg {
  background: linear-gradient(135deg, $accent-light 0%, $accent 100%);
  box-shadow: 0 8rpx 24rpx rgba(212, 165, 165, 0.3);
}

.card-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-title {
  font-size: $text-md;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-xs;
}

.card-subtitle {
  font-size: $text-sm;
  color: $text-tertiary;
}

/* ========== 底部 - 优化样式 ========== */
.footer {
  width: 100%;
  text-align: center;
  padding-bottom: $space-xl;
  padding-top: $space-lg;
}

.footer-text {
  font-size: $text-sm;
  color: $text-tertiary;
  letter-spacing: 4rpx;
  position: relative;
  display: inline-block;
  
  /* 两侧装饰线 */
  &::before,
  &::after {
    content: '·';
    margin: 0 $space-sm;
    color: $primary-light;
  }
}
</style>
