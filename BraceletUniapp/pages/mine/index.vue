<template>
  <view class="page">
    <!-- 用户卡片 -->
    <view class="user-card">
      <view class="user-info" @click="handleUserClick">
        <image v-if="user && user.avatarUrl" class="avatar" :src="user.avatarUrl" mode="aspectFill" />
        <view class="avatar-placeholder" v-else>
          <text class="u-iconfont" style="font-size: 56rpx; color: #D4B48C;">&#xe614;</text>
        </view>
        <view class="user-text">
          <view class="user-name">{{ user ? user.nickName : '微信用户' }}</view>
          <view class="user-welcome">{{ user ? '欢迎回来' : '点击登录' }}</view>
        </view>
      </view>
      <view class="user-arrow">›</view>
    </view>

    <!-- 订单区域 -->
    <view class="panel">
      <view class="panel-header" @click="goAllOrders">
        <text class="panel-title">我的订单</text>
        <view class="panel-more">
          <text>全部订单</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="order-grid">
        <view class="order-item" @click.stop="goOrders(0)">
          <view class="icon-wrap">
            <text class="u-iconfont" style="font-size: 40rpx; color: #D4B48C;">&#xe690;</text>
          </view>
          <text class="order-label">待支付</text>
          <view class="badge" v-if="count.s0">{{ count.s0 }}</view>
        </view>

        <view class="order-item" @click.stop="goOrders(1)">
          <view class="icon-wrap">
            <text class="u-iconfont" style="font-size: 40rpx; color: #7A9EC9;">&#xe635;</text>
          </view>
          <text class="order-label">已支付</text>
          <view class="badge" v-if="count.s1">{{ count.s1 }}</view>
        </view>

        <view class="order-item" @click.stop="goOrders(2)">
          <view class="icon-wrap">
            <text class="u-iconfont" style="font-size: 40rpx; color: #7AB88A;">&#xe636;</text>
          </view>
          <text class="order-label">已发货</text>
          <view class="badge" v-if="count.s2">{{ count.s2 }}</view>
        </view>

        <view class="order-item" @click.stop="goOrders(3)">
          <view class="icon-wrap">
            <text class="u-iconfont" style="font-size: 40rpx; color: #D4A86A;">&#xe669;</text>
          </view>
          <text class="order-label">已完成</text>
          <view class="badge" v-if="count.s3">{{ count.s3 }}</view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goAddress">
        <view class="menu-left">
          <view class="menu-icon" style="background: #F9F3EC;">
            <text class="u-iconfont" style="font-size: 36rpx; color: #D4B48C;">&#xe64e;</text>
          </view>
          <text class="menu-label">地址管理</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="contact">
        <view class="menu-left">
          <view class="menu-icon" style="background: #F5F0EC;">
            <text class="u-iconfont" style="font-size: 36rpx; color: #8B6E4E;">&#xe751;</text>
          </view>
          <text class="menu-label">联系客服</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goSetting">
        <view class="menu-left">
          <view class="menu-icon" style="background: #F9F6F2;">
            <text class="u-iconfont" style="font-size: 36rpx; color: #A8B5C0;">&#xe64d;</text>
          </view>
          <text class="menu-label">设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="about">
        <view class="menu-left">
          <view class="menu-icon" style="background: #F5F0EC;">
            <text class="u-iconfont" style="font-size: 36rpx; color: #B8A99A;">&#xe71e;</text>
          </view>
          <text class="menu-label">关于我们</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="user">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 客服二维码弹窗 -->
    <view v-if="showQR" class="overlay" @click="showQR=false">
      <view class="qr-modal" @click.stop>
        <view class="qr-title">客服微信</view>
        <view class="qr-box">
          <image v-if="qrUrl" class="qr" :src="qrUrl" mode="widthFix" show-menu-by-longpress="true" @click="previewQR" />
          <view v-else class="qr-placeholder">
            <text class="u-iconfont" style="font-size: 80rpx; color: #9a8b7a;">&#xe662;</text>
            <text class="qr-placeholder-text">请放入客服二维码图片</text>
          </view>
        </view>
        <view class="qr-tips">长按识别二维码添加</view>
        <button class="qr-close" @click="showQR=false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { logout, orderList } from '../../api/index.js'
import { checkLogin, clearLoginInfo, getUserInfo, isLoggedIn } from '../../utils/auth.js'

const user = ref(null)
const count = ref({ s0: 0, s1: 0, s2: 0, s3: 0 })
const showQR = ref(false)
const qrUrl = ref('')

// 加载用户信息
function loadUser() {
  user.value = getUserInfo()
}

// 加载订单数量
async function loadOrders() {
  if (!isLoggedIn()) return
  
  try {
    const res = await orderList({ page: 1, size: 100 })
    let orders = []
    if (res && res.orders) orders = res.orders
    else if (res && res.records) orders = res.records
    else if (Array.isArray(res)) orders = res
    else if (res && res.data) {
      if (res.data.orders) orders = res.data.orders
      else orders = Array.isArray(res.data) ? res.data : (res.data.records || [])
    }
    count.value = {
      s0: orders.filter(o => o.status === 0).length,
      s1: orders.filter(o => o.status === 1).length,
      s2: orders.filter(o => o.status === 2).length,
      s3: orders.filter(o => o.status === 3).length,
    }
  } catch (e) {
    console.error('加载订单失败:', e)
  }
}

// 点击用户区域
function handleUserClick() {
  if (!isLoggedIn()) {
    // 未登录，跳转到登录页
    uni.navigateTo({ url: '/pages/login/index' })
  } else {
    // 已登录，可以编辑资料或显示信息
    uni.showActionSheet({
      itemList: ['编辑资料', '切换账号'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 编辑资料
          uni.navigateTo({ url: '/pages/profile/edit' })
        } else if (res.tapIndex === 1) {
          // 切换账号，先退出再登录
          handleLogout().then(() => {
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/login/index' })
            }, 500)
          })
        }
      }
    })
  }
}

// 跳转订单列表
function goAllOrders() {
  if (!checkLogin('/pages/order/list')) return
  uni.navigateTo({ url: '/pages/order/list' })
}

// 按状态筛选订单
function goOrders(status) {
  if (!checkLogin(`/pages/order/list?status=${status}`)) return
  uni.navigateTo({ url: `/pages/order/list?status=${status}` })
}

// 跳转地址管理
function goAddress() {
  if (!checkLogin('/pages/address/list')) return
  uni.navigateTo({ url: '/pages/address/list' })
}

// 联系客服
function contact() {
  uni.navigateTo({ url: '/pages/customer-service/index' })
}

// 跳转设置
function goSetting() {
  uni.navigateTo({ url: '/pages/setting/index' })
}

// 关于我们
function about() {
  uni.navigateTo({ url: '/pages/about/index' })
}

// 退出登录
async function handleLogout() {
  return new Promise((resolve) => {
    uni.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      confirmColor: '#D4B48C',
      success: async (res) => {
        if (res.confirm) {
          uni.showLoading({ title: '正在退出...' })
          try {
            await logout()
          } catch (e) {
            console.error('退出登录API失败:', e)
          }
          // 无论API调用成功与否，都清除本地登录状态
          clearLoginInfo()
          user.value = null
          uni.hideLoading()
          uni.showToast({ title: '已退出登录', icon: 'success' })
          resolve()
        }
      }
    })
  })
}

// 预览二维码
function previewQR() {
  if (!qrUrl.value) {
    uni.showToast({ title: '请先放入二维码图片', icon: 'none' })
    return
  }
  uni.previewImage({ urls: [qrUrl.value] })
}

// 页面显示时
onShow(() => {
  loadUser()
  loadOrders()
})
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.u-iconfont {
  font-family: "uicon-iconfont";
  text-decoration: none;
  text-align: center;
}

.page {
  padding: $space-md;
  min-height: 100vh;
  box-sizing: border-box;
  background: $bg-primary;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

/* ========== 用户卡片 ========== */
.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: $radius-lg;
  padding: $space-lg;
  border: 1rpx solid #e8e0d5;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.05);
  margin-bottom: $space-md;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $space-md;
  flex: 1;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 3rpx solid #e8e0d5;
}

.avatar-placeholder {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #F9F3EC;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #e8e0d5;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.user-welcome {
  font-size: $text-sm;
  color: $text-tertiary;
}

.user-arrow {
  font-size: $text-xl;
  color: $text-tertiary;
}

/* ========== 订单面板 ========== */
.panel {
  background: #ffffff;
  border-radius: $radius-lg;
  padding: $space-lg;
  border: 1rpx solid #e8e0d5;
  margin-bottom: $space-md;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-md;
  padding-bottom: $space-sm;
  border-bottom: 1rpx solid #f0ebe5;
}

.panel-title {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.panel-more {
  display: flex;
  align-items: center;
  font-size: $text-sm;
  color: $text-tertiary;
  
  .arrow {
    margin-left: 4rpx;
    font-size: $text-lg;
  }
}

.order-grid {
  display: flex;
  justify-content: space-between;
  padding: $space-sm 0;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 25%;
}

.icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #F9F6F2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.order-label {
  font-size: $text-sm;
  color: $text-secondary;
}

.badge {
  position: absolute;
  top: 0;
  right: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: #E57373;
  color: #fff;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== 菜单区域 ========== */
.menu-section {
  background: #ffffff;
  border-radius: $radius-lg;
  border: 1rpx solid #e8e0d5;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-md $space-lg;
  border-bottom: 1rpx solid #f5f0ec;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: $space-md;
}

.menu-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-label {
  font-size: $text-base;
  color: $text-primary;
}

.menu-arrow {
  font-size: $text-lg;
  color: $text-tertiary;
}

/* ========== 退出登录 ========== */
.logout-section {
  margin-top: $space-lg;
  padding: 0 $space-lg;
}

.logout-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: #fff;
  color: #E57373;
  font-size: $text-base;
  border-radius: $radius-lg;
  border: 1rpx solid #f0ebe5;
  
  &:active {
    background: #fafafa;
  }
}

/* ========== 二维码弹窗 ========== */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qr-modal {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  text-align: center;
}

.qr-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #4A3728;
  margin-bottom: 32rpx;
}

.qr-box {
  width: 360rpx;
  height: 360rpx;
  margin: 0 auto 24rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  overflow: hidden;
}

.qr {
  width: 100%;
  height: 100%;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qr-placeholder-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.qr-tips {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 32rpx;
}

.qr-close {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #f5f5f5;
  color: #333;
  font-size: 28rpx;
  border-radius: 12rpx;
}
</style>
