<template>
  <view class="page">
    <!-- 顶部黄色背景区 -->
    <view class="user-card">
      <view class="user-info">
        <image v-if="user && user.avatarUrl" class="avatar" :src="user.avatarUrl" mode="aspectFill" />
        <image v-else class="avatar" src="/static/tabbar/mine.png" mode="aspectFill" />
        
        <view class="text-info">
          <view class="nickname">{{ user ? user.nickName : '微信用户' }}</view>
          <view class="welcome">{{ user ? '欢迎回来' : '点击登录' }}</view>
        </view>
      </view>
      
      <button v-if="user" class="edit-btn" @click="openEditProfile">编辑资料</button>
      <button v-else class="edit-btn" @click="handleLogin">去登录</button>
    </view>

    <!-- 订单区域 -->
    <view class="panel order-panel">
      <view class="panel-header" @click="goAllOrders">
        <text class="panel-title">我的订单</text>
        <view class="panel-more">
          <text>全部订单</text>
          <text class="arrow"> → </text>
        </view>
      </view>
      
      <view class="order-grid">
        <view class="order-item" @click.stop="goOrders(0)">
          <view class="icon-box bg-warm">
            <view class="icon-inner">
              <IconFont type="wallet-filled" size="48" color="#C9A86C"></IconFont>
            </view>
            <view class="badge" v-if="count.s0">{{ count.s0 }}</view>
          </view>
          <text class="order-text">待支付</text>
        </view>
        
        <view class="order-item" @click.stop="goOrders(1)">
          <view class="icon-box bg-soft">
            <view class="icon-inner">
              <IconFont type="checkbox-filled" size="48" color="#8B9A7C"></IconFont>
            </view>
            <view class="badge" v-if="count.s1">{{ count.s1 }}</view>
          </view>
          <text class="order-text">已支付</text>
        </view>
        
        <view class="order-item" @click.stop="goOrders(2)">
          <view class="icon-box bg-cool">
            <view class="icon-inner">
              <IconFont type="paperplane-filled" size="48" color="#7A9BA8"></IconFont>
            </view>
            <view class="badge" v-if="count.s2">{{ count.s2 }}</view>
          </view>
          <text class="order-text">已发货</text>
        </view>
        
        <view class="order-item" @click.stop="goOrders(3)">
          <view class="icon-box bg-gold">
            <view class="icon-inner">
              <IconFont type="star-filled" size="48" color="#C9A86C"></IconFont>
            </view>
            <view class="badge" v-if="count.s3">{{ count.s3 }}</view>
          </view>
          <text class="order-text">已完成</text>
        </view>
      </view>
    </view>

    <!-- 功能卡片区域 -->
    <view class="func-grid">
      <!-- 地址管理 - 粉色 -->
      <view class="func-card card-pink" @click="goAddress">
        <view class="card-icon-box">
          <IconFont type="location-filled" size="56" color="#B8958A"></IconFont>
        </view>
        <text class="card-name">地址管理</text>
      </view>
      
      <!-- 联系客服 - 紫色 -->
      <view class="func-card card-purple" @click="contact">
        <view class="card-icon-box">
          <IconFont type="staff-filled" size="56" color="#9B8AB8"></IconFont>
        </view>
        <text class="card-name">联系客服</text>
      </view>
      
      <!-- 设置 - 蓝色 -->
      <view class="func-card card-blue" @click="goSetting">
        <view class="card-icon-box">
          <IconFont type="settings-filled" size="56" color="#7A9BB8"></IconFont>
        </view>
        <text class="card-name">设置</text>
      </view>
      
      <!-- 关于我们 - 绿色 -->
      <view class="func-card card-green" @click="about">
        <view class="card-icon-box">
          <IconFont type="info-filled" size="56" color="#7AB89B"></IconFont>
        </view>
        <text class="card-name">关于我们</text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section" v-if="user">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <view v-if="showQR" class="mask" @click="showQR=false">
      <view class="qr-modal" @click.stop>
        <view class="qr-title">客服微信</view>
        <view class="qr-box">
          <image v-if="qrUrl" class="qr" :src="qrUrl" mode="widthFix" show-menu-by-longpress="true" @click="previewQR" />
          <view v-else class="qr-placeholder">
            <IconFont type="scan" size="96" color="#ccc"></IconFont>
            <text class="qr-placeholder-text">请放入客服二维码图片\nstatic/CustomerService/qr.jpg</text>
          </view>
        </view>
        <view class="qr-tips">长按识别二维码添加</view>
        <button class="qr-close" @click="showQR=false">关闭</button>
      </view>
    </view>

    <!-- 编辑资料弹窗 -->
    <view v-if="showEditProfile" class="mask" @click="showEditProfile=false">
      <view class="edit-modal" @click.stop>
        <view class="modal-title">编辑资料</view>
        
        <view class="form-item">
          <view class="label">头像</view>
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="avatar-preview" :src="tempAvatarUrl || user.avatarUrl || '/static/tabbar/mine.png'" mode="aspectFill" />
            <view class="avatar-tip">点击选择头像</view>
          </button>
        </view>
        
        <view class="form-item">
          <view class="label">昵称</view>
          <input 
            class="nickname-input" 
            type="nickname" 
            v-model="tempNickName" 
            placeholder="请输入昵称" 
            :maxlength="20"
          />
        </view>
        
        <view class="modal-btns">
          <button class="cancel-btn" @click="cancelEdit">取消</button>
          <button class="save-btn" @click="saveProfile">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { loginWithWeixinCode, logout, orderList, userGet } from '../../api/index.js'

const count = ref({ s0: 0, s1: 0, s2: 0, s3: 0 })
const showQR = ref(false)
const qrUrl = '/static/CustomerService/qr.jpg' // 请将客服二维码图片放到此路径
const user = ref(null)
const showEditProfile = ref(false)
const tempAvatarUrl = ref('')
const tempNickName = ref('')

async function loadOrders() {
  if (!user.value) {
    count.value = { s0: 0, s1: 0, s2: 0, s3: 0 }
    return
  }

  try {
    console.log('🔄 开始加载订单数据...')
    
    // 查询所有状态的订单
    const res = await orderList({ page: 1, size: 100 })
    console.log('📦 订单API返回:', res)
    
    // 处理后端返回的数据格式
    let orders = []
    if (res && res.orders) {
      // {orders: Array, page: number, size: number, total: number} 格式
      orders = res.orders
    } else if (res && res.records) {
      // PageHelper分页格式
      orders = res.records
    } else if (Array.isArray(res)) {
      orders = res
    } else if (res && res.data) {
      if (res.data.orders) {
        orders = res.data.orders
      } else {
        orders = Array.isArray(res.data) ? res.data : (res.data.records || [])
      }
    }
    
    console.log('📋 订单列表总数:', orders.length)
    
    // 统计各状态订单数量
    const newCount = {
      s0: orders.filter(o => o.status === 0).length,
      s1: orders.filter(o => o.status === 1 || o.status === 4).length, // 已支付 + 退款审核中
      s2: orders.filter(o => o.status === 2).length,
      s3: orders.filter(o => o.status === 3).length,
    }
    
    console.log('📊 订单统计 - 待支付:', newCount.s0, '已支付:', newCount.s1, '已发货:', newCount.s2, '已完成:', newCount.s3)
    
    count.value = newCount
    
    console.log('✅ 订单数据加载完成')
  } catch (e) {
    console.error('❌ 加载订单失败:', e)
  }
}

onMounted(() => { 
  user.value = userGet()
  loadOrders() 
})

// 每次显示页面时重新加载订单
onShow(() => {
  console.log('我的页面显示，重新加载订单')
  user.value = userGet() // 确保用户信息也是最新的
  // 增加小延迟，确保后端订单状态已更新
  setTimeout(() => {
    loadOrders()
  }, 300)
})

function handleLogin() {
  uni.showLoading({ title: '正在登录...' })
  
  // 1. 获取微信登录 code
  uni.login({
    provider: 'weixin',
    success: (loginRes) => {
      console.log('Login Code:', loginRes.code)
      
      // 2. 获取用户信息 (需要用户触发)
      uni.getUserProfile({
        desc: '用于完善会员资料',
        success: async (profileRes) => {
          console.log('User Profile:', profileRes.userInfo)
          
          try {
            // 3. 调用后端登录接口
            const res = await loginWithWeixinCode(loginRes.code, profileRes.userInfo)
            console.log('Login API Response:', res)
            
            if (res && res.token) {
              // 登录成功，更新本地状态
              user.value = {
                id: res.id,
                nickName: res.nickname,
                avatarUrl: res.avatar,
                openid: res.openid
              }
              uni.showToast({ title: '登录成功', icon: 'success' })
              
              // 重新加载订单
              loadOrders()
            } else {
              throw new Error(res.msg || '登录失败')
            }
          } catch (e) {
            console.error('Login Error:', e)
            uni.showToast({ title: '登录失败: ' + (e.message || '未知错误'), icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        },
        fail: (err) => {
          console.error('GetUserProfile Failed:', err)
          uni.hideLoading()
          uni.showToast({ title: '用户取消授权', icon: 'none' })
        }
      })
    },
    fail: (err) => {
      console.error('Uni Login Failed:', err)
      uni.hideLoading()
      uni.showToast({ title: '启动登录失败', icon: 'none' })
    }
  })
}

function goAllOrders() { 
  if (!user.value) return handleLogin()
  uni.navigateTo({ url: '/pages/order/list' }) 
}
function goOrders(status) { 
  if (!user.value) return handleLogin()
  uni.navigateTo({ url: '/pages/order/list?status=' + status }) 
}
function goAddress() { 
  if (!user.value) return handleLogin()
  uni.navigateTo({ url: '/pages/address/list' }) 
}
function contact() { uni.navigateTo({ url: '/pages/customer-service/index' }) }
function goSetting() { uni.navigateTo({ url: '/pages/setting/index' }) }
function about() { uni.navigateTo({ url: '/pages/about/index' }) }

async function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    confirmText: '退出',
    confirmColor: '#ff6600',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在退出...' })
        try {
          await logout()
          user.value = null
          uni.hideLoading()
          uni.showToast({ title: '已退出登录', icon: 'success' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/index/index' })
          }, 1500)
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: '退出失败', icon: 'none' })
        }
      }
    }
  })
}
function previewQR() {
  if (!qrUrl) { uni.showToast({ title: '请先放入二维码图片', icon: 'none' }); return; }
  try { uni.previewImage({ urls: [qrUrl] }) } catch (e) { uni.showToast({ title: '预览失败', icon: 'none' }) }
}

// 打开编辑资料弹窗
function openEditProfile() {
  // 预填充当前昵称
  tempNickName.value = user.value?.nickName || ''
  tempAvatarUrl.value = ''
  showEditProfile.value = true
}

// 选择头像
function onChooseAvatar(e) {
  console.log('选择头像:', e)
  const { avatarUrl } = e.detail
  if (avatarUrl) {
    tempAvatarUrl.value = avatarUrl
    console.log('临时头像已设置:', avatarUrl)
  }
}

// 取消编辑
function cancelEdit() {
  showEditProfile.value = false
  tempAvatarUrl.value = ''
  tempNickName.value = ''
}

// 保存资料
function saveProfile() {
  const newAvatar = tempAvatarUrl.value || user.value.avatarUrl
  const newNickName = tempNickName.value.trim() || user.value.nickName
  
  if (!newNickName || newNickName.length === 0) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  
  console.log('保存资料: 头像=', newAvatar, ', 昵称=', newNickName)
  
  // 更新用户信息
  const updatedUser = {
    ...user.value,
    avatarUrl: newAvatar,
    nickName: newNickName
  }
  
  try {
    uni.setStorageSync('user', updatedUser)
    user.value = updatedUser
    console.log('资料保存成功:', updatedUser)
    uni.showToast({ title: '保存成功', icon: 'success' })
    showEditProfile.value = false
    tempAvatarUrl.value = ''
    tempNickName.value = ''
  } catch (e) {
    console.error('保存失败:', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.page { 
  padding: $space-lg; 
  background: linear-gradient(180deg, $bg-primary 0%, #FAF8F5 50%, #F8F6F3 100%);
  min-height: 100vh; 
  box-sizing: border-box;
  position: relative;
  
  /* 顶部装饰性光晕 */
  &::before {
    content: '';
    position: fixed;
    top: -200rpx;
    right: -100rpx;
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, rgba(201, 168, 108, 0.08) 0%, transparent 60%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  
  /* 底部装饰性光晕 */
  &::after {
    content: '';
    position: fixed;
    bottom: -150rpx;
    left: -80rpx;
    width: 300rpx;
    height: 300rpx;
    background: radial-gradient(circle, rgba(139, 154, 124, 0.06) 0%, transparent 60%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
}

/* ========== 顶部用户信息卡片 - 全新设计 ========== */
.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $primary-gradient;
  border-radius: $radius-lg;
  padding: $space-xl $space-xl;
  box-shadow: 0 12rpx 40rpx rgba(201, 168, 108, 0.25);
  margin-bottom: $space-lg;
  position: relative;
  overflow: hidden;
  
  /* 装饰性光晕 */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300rpx;
    height: 300rpx;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    border-radius: 50%;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: $space-md;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: $bg-card;
  border-radius: 50%;
  border: 4rpx solid rgba(255,255,255,0.5);
  box-shadow: $shadow-md;
}

.text-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-xs;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.05);
}

.welcome {
  font-size: $text-base;
  color: rgba(0,0,0,0.6);
}

.edit-btn {
  margin: 0;
  padding: 0 $space-md;
  height: 64rpx;
  line-height: 64rpx;
  background: rgba(255,255,255,0.95);
  color: $primary-dark;
  font-size: $text-base;
  font-weight: $font-semibold;
  border-radius: $radius-full;
  border: none;
  box-shadow: $shadow-sm;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.96);
    background: $bg-card;
  }
}

/* ========== 面板通用样式 ========== */
.panel {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  margin-bottom: $space-lg;
  padding: $space-lg;
  transition: box-shadow 0.3s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-lg;
  padding: 0 $space-xs;
}

.panel-title {
  font-size: $text-md;
  font-weight: $font-bold;
  color: $text-primary;
  position: relative;
  padding-left: $space-sm;
  
  /* 左侧装饰线 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6rpx;
    height: 28rpx;
    background: $primary-gradient;
    border-radius: 3rpx;
  }
}

.panel-more {
  display: flex;
  align-items: center;
  color: $text-tertiary;
  font-size: $text-sm;
  gap: $space-xs;
  transition: color 0.2s ease;
  
  &:active {
    color: $primary;
  }
}

.arrow {
  font-size: $text-sm;
  color: $primary;
}

/* ========== 订单网格 - 精致设计 ========== */
.order-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-md;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-sm;
  padding: $space-sm 0;
  border-radius: $radius-md;
  transition: all 0.2s ease;
  
  &:active {
    background: $bg-hover;
    transform: scale(0.98);
  }
}

.icon-box {
  width: 84rpx;
  height: 84rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: $bg-card;
  border: 2rpx solid $border-light;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  transition: all 0.3s ease;
}

.icon-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 订单状态配色 - 极简精致风格 */
.bg-warm { 
  border-color: rgba(201, 168, 108, 0.4);
  background: linear-gradient(135deg, rgba(201, 168, 108, 0.05) 0%, transparent 100%);
}
.bg-soft { 
  border-color: rgba(139, 154, 124, 0.4);
  background: linear-gradient(135deg, rgba(139, 154, 124, 0.05) 0%, transparent 100%);
}
.bg-cool { 
  border-color: rgba(122, 155, 168, 0.4);
  background: linear-gradient(135deg, rgba(122, 155, 168, 0.05) 0%, transparent 100%);
}
.bg-gold { 
  border-color: rgba(201, 168, 108, 0.4);
  background: linear-gradient(135deg, rgba(201, 168, 108, 0.05) 0%, transparent 100%);
}

.order-text {
  font-size: $text-sm;
  color: $text-secondary;
  font-weight: $font-medium;
  letter-spacing: 1rpx;
}

.badge {
  position: absolute;
  right: -4rpx;
  top: -4rpx;
  min-width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: $text-white;
  border-radius: $radius-full;
  font-size: 20rpx;
  font-weight: $font-semibold;
  padding: 0 10rpx;
  border: 3rpx solid $bg-card;
  box-shadow: $shadow-sm;
}

/* ========== 功能卡片网格 - 精致设计 ========== */
.func-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-md;
  margin-bottom: $space-xl;
}

.func-card {
  height: 140rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  padding: 0 $space-lg;
  gap: $space-md;
  background: $bg-card;
  border: 1rpx solid $border-light;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
    border-color: rgba(201, 168, 108, 0.2);
  }
}

/* 左侧色条装饰 */
.card-pink { border-left: 4rpx solid #D4B8A8; }
.card-purple { border-left: 4rpx solid #B8A8C8; }
.card-blue { border-left: 4rpx solid #A8B8C8; }
.card-green { border-left: 4rpx solid #A8C8B8; }

.card-icon-box {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $bg-secondary 0%, $bg-primary 100%);
  border-radius: $radius-sm;
  flex-shrink: 0;
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.03);
}

.card-name {
  font-size: $text-base;
  color: $text-primary;
  font-weight: $font-medium;
}

/* ========== 退出登录按钮 ========== */
.logout-section {
  padding: 0 $space-xs;
  margin-bottom: $space-xl;
}

.logout-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: $bg-card;
  color: $error;
  font-size: $text-md;
  font-weight: $font-semibold;
  border-radius: $radius-lg;
  border: none;
  box-shadow: $shadow-md;
  transition: all 0.2s ease;
  
  &:active {
    background: $error-light;
    transform: scale(0.98);
  }
}

/* 弹窗样式 */
.mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.qr-modal { width: 80%; background: #fff; border-radius: 20rpx; padding: 24rpx; box-shadow: 0 10rpx 24rpx rgba(0,0,0,0.2); display: flex; flex-direction: column; align-items: center; }
.qr-title { font-size: 30rpx; font-weight: 700; color: #333; margin-bottom: 10rpx; }
.qr-box { display: flex; align-items: center; justify-content: center; }
.qr { width: 520rpx; height: 520rpx; background: #e9eef3; border-radius: 12rpx; }
.qr-placeholder { width: 520rpx; height: 520rpx; background: #f5f5f5; border-radius: 12rpx; border: 2rpx dashed #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.qr-placeholder-text { font-size: 24rpx; color: #bbb; text-align: center; margin-top: 16rpx; line-height: 1.6; }
.qr-tips { color: #666; margin: 12rpx 0 4rpx; }
.qr-close { margin-top: 6rpx; background: #ffd84c; color: #333; border-radius: 999rpx; padding: 0 28rpx; height: 72rpx; line-height: 72rpx; font-weight: 600; }

.edit-modal { width: 85%; background: #fff; border-radius: 20rpx; padding: 32rpx 28rpx; box-shadow: 0 10rpx 24rpx rgba(0,0,0,0.2); }
.modal-title { font-size: 32rpx; font-weight: 700; color: #333; text-align: center; margin-bottom: 28rpx; }
.form-item { margin-bottom: 24rpx; }
.form-item .label { font-size: 26rpx; color: #666; margin-bottom: 12rpx; }
.avatar-btn { width: 100%; background: #f7f7f7; border-radius: 12rpx; padding: 20rpx; display: flex; flex-direction: column; align-items: center; gap: 12rpx; border: 1px dashed #ddd; }
.avatar-preview { width: 120rpx; height: 120rpx; border-radius: 50%; background: #e0e0e0; }
.avatar-tip { font-size: 24rpx; color: #999; }
.nickname-input { width: 100%; height: 80rpx; line-height: 80rpx; background: #f7f7f7; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; color: #333; box-sizing: border-box; }
.modal-btns { display: flex; gap: 16rpx; margin-top: 32rpx; }
.cancel-btn, .save-btn { flex: 1; height: 80rpx; line-height: 80rpx; border-radius: 12rpx; font-size: 28rpx; font-weight: 600; border: none; }
.cancel-btn { background: #f0f0f0; color: #666; }
.save-btn { background: #ffd84c; color: #333; }
</style>
