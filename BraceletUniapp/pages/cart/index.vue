<template>
  <view class="page">
    <!-- 未登录提示 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="icon">
        <IconFont type="locked-filled" size="100" color="#fff"></IconFont>
      </view>
      <view class="tip">请先登录查看购物车</view>
      <button class="login-btn" @click="goToLogin">去登录</button>
    </view>
    
    <template v-else>
      <!-- 空状态 -->
      <view v-if="!items.length" class="empty-state">
        <view class="empty-content">
          <view class="empty-icon-box">
            <IconFont type="cart-filled" size="140" color="#C9A86C"></IconFont>
            <view class="empty-circle"></view>
          </view>
          <text class="empty-title">购物车空空如也</text>
          <text class="empty-desc">快去挑选心仪的手链吧～</text>
          <button class="go-shopping-btn" @click="goShopping">
            去逛逛
          </button>
        </view>
      </view>

      <view v-else class="list">
      <view v-for="i in items" :key="i.id" class="row" :class="{updating: updating, deleting: deleting, 'diy-item': i.isDiy}">
        <view class="thumb">
          <image v-if="i.imageUrl" :src="i.imageUrl" mode="aspectFill" class="thumb-img" />
          <view v-if="i.isDiy" class="diy-badge">DIY</view>
        </view>
        <view class="meta">
          <view class="title">{{ i.title }}</view>
          <view class="price">¥{{ i.price }}</view>
          <!-- DIY商品不显示数量调整 -->
          <view v-if="!i.isDiy" class="stepper">
            <view class="s-btn" :class="{disabled: updating || deleting}" @click="dec(i)">-</view>
            <input class="ipt" type="number" v-model.number="i.quantity" @blur="apply(i)" :disabled="updating || deleting" />
            <view class="s-btn" :class="{disabled: updating || deleting}" @click="inc(i)">+</view>
          </view>
          <view v-else class="diy-info">
            <text class="diy-quantity">数量: {{ i.quantity }}</text>
            <text v-if="i.diySize" class="diy-size">手围: {{ i.diySize }}cm</text>
          </view>
        </view>
        <view class="remove" :class="{disabled: updating || deleting}" @click="removeItem(i)">×</view>
      </view>
    </view>

    <!-- 底部结算栏 - 仅在有商品时显示 -->
    <view v-if="isLoggedIn && items.length > 0" class="bar">
      <view class="total">合计：<text class="money">¥{{ total }}</text></view>
      <button class="checkout" @click="goCheckout">去结算</button>
    </view>
    </template>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { cartDelete, cartList, cartUpdate, isLoggedIn as checkLogin } from '../../api/index.js'
import { updateCartBadge, updateCartBadgeNow } from '../../utils/cartBadge.js'
import { debugCartBadge } from '../../utils/debugCartBadge.js'
import { resolveImageUrl } from '../../utils/imageHelper.js'

const isLoggedIn = ref(false)
const items = ref([])
const updating = ref(false) // 正在更新中
const deleting = ref(false) // 正在删除中

const total = computed(() => {
  return items.value.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0).toFixed(2)
})

// 检查登录状态
function checkLoginStatus() {
  isLoggedIn.value = checkLogin()
  console.log('购物车登录状态:', isLoggedIn.value)
}

// 跳转登录
function goToLogin() {
  uni.reLaunch({ url: '/pages/index/index' })
}

async function load() {
  // 先检查登录状态
  checkLoginStatus()
  
  // 如果未登录，不加载购物车数据
  if (!isLoggedIn.value) {
    console.log('未登录，跳过加载购物车数据')
    return
  }
  
  try {
    const res = await cartList()
    console.log('购物车数据:', res)
    
    let list = res.items || []
    // 处理图片链接，过滤掉无效商品（没有标题或ID的）
    list = list.map(item => {
      let imageUrl = item.coverImage || item.imageUrl || item.image || ''
      imageUrl = resolveImageUrl(imageUrl)
      
      // 处理DIY商品数据
      if (item.isDiy && item.diyData) {
        try {
          const diyInfo = JSON.parse(item.diyData)
          return {
            ...item,
            imageUrl: diyInfo.imageUrl || imageUrl,
            diySize: diyInfo.size,
            diyBeads: diyInfo.beads || []
          }
        } catch (e) {
          console.error('解析DIY数据失败:', e)
        }
      }
      
      return { ...item, imageUrl }
    })
    // .filter(item => {
    //   // 过滤掉无效商品：必须有标题
    //   const hasTitle = item.title && String(item.title).trim() !== ''
    //   // DIY商品(productId为负数)也是有效的，普通商品需要有有效的productId
    //   const isDiy = item.isDiy || (item.productId !== undefined && item.productId !== null && item.productId < 0)
    //   const hasValidId = isDiy || (item.productId !== undefined && item.productId !== null && item.productId > 0)
    //   return hasTitle && hasValidId
    // })
    
    items.value = list
    // 立即更新购物车角标
    updateCartBadgeNow()
  } catch (e) {
    console.error('加载购物车失败:', e)
    // 如果是401错误，说明token失效
    if (e.code === 401) {
      isLoggedIn.value = false
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
    }
  }
}

async function removeItem(item) {
  if (deleting.value || updating.value) {
    console.log('操作进行中，请稍后')
    return
  }
  
  deleting.value = true
  try {
    // 调用API删除商品（支持普通商品和DIY商品）
    // 如果有id字段优先使用id（DIY商品通过id删除），否则使用productId
    const productId = item.productId
    const id = item.id
    await cartDelete(productId, id)
    
    await load()
    // 立即更新购物车角标
    updateCartBadgeNow()
    uni.showToast({ title: '已删除', icon: 'success', duration: 1000 })
  } catch (e) {
    console.error('删除失败:', e)
    uni.showToast({ title: '删除失败', icon: 'none' })
  } finally {
    deleting.value = false
  }
}

// 去结算 - 跳转到订单确认页
function goCheckout() {
  if (!items.value || items.value.length === 0) {
    uni.showToast({ title: '购物车为空', icon: 'none' })
    return
  }
  
  uni.navigateTo({ url: '/pages/order/confirm' })
}

// 去逛逛 - 跳转到首页
function goShopping() {
  uni.switchTab({ url: '/pages/index/index' })
}

async function apply(i) {
  if (updating.value) return
  
  updating.value = true
  const pid = i.productId || i.id
  const qty = Math.max(1, Number(i.quantity || 1))
  i.quantity = qty
  
  try {
    await cartUpdate(pid, qty)
    // 更新购物车角标
    updateCartBadge()
  } catch (e) {
    console.error('更新数量失败:', e)
  } finally {
    updating.value = false
  }
}

async function inc(i) {
  if (updating.value) {
    console.log('更新中，请稍后')
    return
  }
  
  updating.value = true
  const pid = i.productId || i.id
  const qty = Number(i.quantity || 1) + 1
  i.quantity = qty
  
  try {
    await cartUpdate(pid, qty)
    // 更新购物车角标
    updateCartBadge()
  } catch (e) {
    console.error('增加数量失败:', e)
    // 恢复原数量
    i.quantity = qty - 1
  } finally {
    updating.value = false
  }
}

async function dec(i) {
  if (updating.value) {
    console.log('更新中，请稍后')
    return
  }
  
  updating.value = true
  const pid = i.productId || i.id
  const oldQty = Number(i.quantity || 1)
  const qty = Math.max(1, oldQty - 1)
  i.quantity = qty
  
  try {
    await cartUpdate(pid, qty)
    // 更新购物车角标
    updateCartBadge()
  } catch (e) {
    console.error('减少数量失败:', e)
    // 恢复原数量
    i.quantity = oldQty
  } finally {
    updating.value = false
  }
}

onShow(() => {
  load()
})

// 开发环境暴露调试函数
if (typeof window !== 'undefined') {
  window.debugCartBadge = debugCartBadge
}
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.page { 
  padding-bottom: 180rpx; 
  background: linear-gradient(180deg, $bg-primary 0%, #FAF8F5 40%, #F8F6F3 100%);
  min-height: 100vh; 
  box-sizing: border-box;
  position: relative;
  
  /* 顶部装饰光晕 */
  &::before {
    content: '';
    position: fixed;
    top: -150rpx;
    left: -100rpx;
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, rgba(201, 168, 108, 0.1) 0%, rgba(201, 168, 108, 0.03) 50%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
}

/* ========== 登录提示样式 - 全新设计 ========== */
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 48rpx;
  min-height: 60vh;
}
.login-prompt .icon {
  width: 180rpx;
  height: 180rpx;
  background: linear-gradient(135deg, $primary-light 0%, $primary 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
  box-shadow: 0 16rpx 48rpx rgba(201, 168, 108, 0.25);
  position: relative;
  
  /* 内圈装饰 */
  &::after {
    content: '';
    position: absolute;
    inset: 16rpx;
    border: 3rpx dashed rgba(255,255,255,0.4);
    border-radius: 50%;
  }
}
.login-prompt .tip {
  font-size: $text-lg;
  color: $text-secondary;
  margin-bottom: $space-xs;
  font-weight: $font-medium;
}
.login-prompt .sub-tip {
  font-size: $text-sm;
  color: $text-tertiary;
  margin-bottom: 64rpx;
}
.login-prompt .login-btn {
  background: $primary-gradient;
  color: $text-white;
  border-radius: $radius-full;
  padding: 0 80rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: $text-md;
  font-weight: $font-semibold;
  border: none;
  box-shadow: 0 8rpx 32rpx rgba(201, 168, 108, 0.4);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba(201, 168, 108, 0.3);
  }
}

/* ========== 空状态 - 精致设计 ========== */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 0 48rpx;
  position: relative;
  
  /* 装饰性背景圆 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500rpx;
    height: 500rpx;
    background: radial-gradient(circle, rgba(201, 168, 108, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.empty-icon-box {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(201, 168, 108, 0.1) 0%, rgba(201, 168, 108, 0.02) 100%);
  border: 2rpx dashed rgba(201, 168, 108, 0.2);
}

.empty-icon {
  font-size: 80rpx;
  z-index: 1;
  color: $primary;
}

.empty-title {
  font-size: $text-lg;
  color: $text-primary;
  font-weight: $font-semibold;
  margin-bottom: $space-sm;
}

.empty-desc {
  font-size: $text-base;
  color: $text-tertiary;
  margin-bottom: 64rpx;
}

.go-shopping-btn {
  background: $primary-gradient;
  color: $text-white;
  border-radius: $radius-full;
  padding: 0 80rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: $text-md;
  font-weight: $font-semibold;
  border: none;
  box-shadow: 0 8rpx 32rpx rgba(201, 168, 108, 0.35);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba(201, 168, 108, 0.25);
  }
}
/* ========== 购物车列表 - 优化设计 ========== */
.list { 
  padding: $space-lg; 
  display: flex; 
  flex-direction: column; 
  gap: $space-md; 
}

.row { 
  background: $bg-card; 
  border-radius: $radius-md; 
  padding: $space-md; 
  display: flex; 
  gap: $space-md; 
  align-items: center; 
  box-shadow: $shadow-md; 
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
  
  &:active {
    box-shadow: $shadow-lg;
    transform: translateY(-2rpx);
  }
}

.row.updating { opacity: 0.6; }
.row.deleting { opacity: 0.3; transform: translateX(-20rpx); }

.thumb { 
  width: 160rpx; 
  height: 160rpx; 
  background: $bg-secondary; 
  border-radius: $radius-sm; 
  overflow: hidden; 
  position: relative;
  box-shadow: $shadow-sm;
}

.thumb-img { 
  width: 100%; 
  height: 100%; 
  border-radius: $radius-sm; 
}

.meta { 
  flex: 1; 
  min-width: 0;
}

.title { 
  font-size: $text-base; 
  color: $text-primary; 
  font-weight: $font-medium;
  @include text-ellipsis;
}

.price { 
  color: $error; 
  font-weight: $font-bold; 
  font-size: $text-md;
  margin-top: $space-xs; 
}

.remove { 
  width: 56rpx; 
  height: 56rpx; 
  line-height: 56rpx; 
  text-align: center; 
  border-radius: 50%; 
  background: $bg-secondary; 
  color: $text-tertiary; 
  cursor: pointer; 
  transition: all 0.2s ease;
  font-size: 32rpx;
  
  &:active { 
    background: $error; 
    color: $text-white; 
  }
}

.remove.disabled { 
  opacity: 0.4; 
  pointer-events: none; 
}

.stepper { 
  margin-top: $space-sm; 
  display: flex; 
  align-items: center; 
}

.s-btn { 
  width: 56rpx; 
  height: 56rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: $bg-secondary; 
  border-radius: $radius-sm; 
  font-size: 32rpx; 
  color: $text-primary; 
  cursor: pointer; 
  transition: all 0.2s ease;
  font-weight: $font-semibold;
  
  &:active { 
    background: $primary-light; 
    color: $primary-dark;
  }
}

.s-btn.disabled { 
  opacity: 0.4; 
  pointer-events: none; 
}

.ipt { 
  width: 80rpx; 
  margin: 0 $space-sm; 
  text-align: center; 
  height: 56rpx; 
  border: 2rpx solid $border-color; 
  border-radius: $radius-sm; 
  font-size: $text-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.ipt:disabled { 
  background: $bg-secondary; 
  color: $text-tertiary; 
}

/* ========== DIY商品样式 - 优化设计 ========== */
.diy-item { 
  background: linear-gradient(135deg, #FFF9F5 0%, $bg-card 100%); 
  border: 2rpx solid rgba(201, 168, 108, 0.3);
  position: relative;
  
  /* 左侧装饰条 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20rpx;
    bottom: 20rpx;
    width: 6rpx;
    background: $primary-gradient;
    border-radius: 0 3rpx 3rpx 0;
  }
}

.diy-badge { 
  position: absolute; 
  top: 12rpx; 
  left: 12rpx; 
  background: $primary-gradient; 
  color: $text-white; 
  font-size: 20rpx; 
  padding: 6rpx 16rpx; 
  border-radius: $radius-full; 
  font-weight: $font-semibold;
  box-shadow: $shadow-sm;
  z-index: 1;
}

.diy-info { 
  margin-top: $space-sm; 
  display: flex; 
  flex-direction: column; 
  gap: $space-xs; 
}

.diy-quantity { 
  font-size: $text-sm; 
  color: $text-secondary; 
}

.diy-size { 
  font-size: $text-sm; 
  color: $primary-dark;
  font-weight: $font-medium;
  background: $primary-light;
  padding: 4rpx 12rpx;
  border-radius: $radius-full;
  display: inline-block;
  width: fit-content;
}

/* ========== 底部结算栏 - 优化设计 ========== */
.bar { 
  position: fixed; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  background: $bg-card; 
  padding: $space-md $space-lg calc($space-md + env(safe-area-inset-bottom)); 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  box-shadow: 0 -8rpx 32rpx rgba(0,0,0,0.08);
  z-index: 100;
}

.total { 
  color: $text-primary; 
  font-size: $text-base;
  font-weight: $font-medium;
}

.money { 
  color: $error; 
  font-weight: $font-bold;
  font-size: $text-lg;
}

.checkout { 
  background: $primary-gradient; 
  color: $text-white; 
  border-radius: $radius-full; 
  padding: 0 48rpx; 
  height: 80rpx; 
  line-height: 80rpx; 
  font-weight: $font-semibold;
  font-size: $text-md;
  box-shadow: 0 8rpx 24rpx rgba(201, 168, 108, 0.35);
  border: none;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba(201, 168, 108, 0.25);
  }
  
  &[disabled] {
    background: $bg-secondary;
    color: $text-tertiary;
    box-shadow: none;
  }
}
</style>
