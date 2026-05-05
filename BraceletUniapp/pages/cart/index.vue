<template>
  <view class="page">
    <!-- 未登录提示 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="login-icon-wrap">
        <text class="u-iconfont" style="font-size: 100rpx; color: #ffffff;">&#xe979;</text>
      </view>
      <view class="login-title">请先登录</view>
      <view class="login-desc">登录后可查看购物车</view>
      <button class="login-btn" @click="goToLogin">去登录</button>
    </view>

    <template v-else>
      <!-- 空状态 -->
      <view v-if="!items.length" class="empty-state">
        <view class="empty-icon-wrap">
          <text class="u-iconfont" style="font-size: 100rpx; color: #D4B48C;">&#xe65d;</text>
        </view>
        <view class="empty-title">购物车空空如也</view>
        <view class="empty-desc">快去挑选心仪的手链吧</view>
        <button class="go-shopping-btn" @click="goShopping">去逛逛</button>
      </view>

      <!-- 购物车列表 -->
      <view v-else class="cart-list">
        <view v-for="i in items" :key="i.id" class="cart-row" :class="{updating: updating, deleting: deleting, 'diy-item': i.isDiy}">
          <view class="item-thumb">
            <image v-if="i.imageUrl" :src="i.imageUrl" mode="aspectFill" class="thumb-img" />
            <view v-if="i.isDiy" class="diy-badge">DIY</view>
          </view>
          <view class="item-meta">
            <view class="item-title">{{ i.title }}</view>
            <view class="item-price">¥{{ i.price }}</view>
            <view v-if="!i.isDiy" class="stepper">
              <view class="step-btn" :class="{disabled: updating || deleting}" @click="dec(i)">−</view>
              <input class="step-ipt" type="number" v-model.number="i.quantity" @blur="apply(i)" :disabled="updating || deleting" />
              <view class="step-btn" :class="{disabled: updating || deleting}" @click="inc(i)">+</view>
            </view>
            <view v-else class="diy-tags">
              <text class="diy-tag">数量: {{ i.quantity }}</text>
              <text class="diy-tag" v-if="i.diySize">手围: {{ i.diySize }}cm</text>
            </view>
          </view>
          <view class="remove-btn" :class="{disabled: updating || deleting}" @click="removeItem(i)">
            <text class="u-iconfont" style="font-size: 28rpx; color: #9a8b7a;">&#xe685;</text>
          </view>
        </view>
      </view>

      <!-- 底部结算栏 -->
      <view v-if="items.length > 0" class="bottom-bar">
        <view class="total-info">
          <text class="total-label">合计：</text>
          <text class="total-money">¥{{ total }}</text>
        </view>
        <button class="checkout-btn" @click="goCheckout">去结算</button>
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
const updating = ref(false)
const deleting = ref(false)

const total = computed(() => {
  return items.value.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0).toFixed(2)
})

function checkLoginStatus() {
  isLoggedIn.value = checkLogin()
}

function goToLogin() {
  uni.reLaunch({ url: '/pages/index/index' })
}

async function load() {
  checkLoginStatus()
  if (!isLoggedIn.value) return
  try {
    const res = await cartList()
    let list = res.items || []
    list = list.map(item => {
      let imageUrl = item.coverImage || item.imageUrl || item.image || ''
      imageUrl = resolveImageUrl(imageUrl)
      if (item.isDiy && item.diyData) {
        try {
          const diyInfo = JSON.parse(item.diyData)
          return { ...item, imageUrl: diyInfo.imageUrl || imageUrl, diySize: diyInfo.size, diyBeads: diyInfo.beads || [] }
        } catch (e) {}
      }
      return { ...item, imageUrl }
    })
    items.value = list
    updateCartBadgeNow()
  } catch (e) {
    console.error('加载购物车失败:', e)
    if (e.code === 401) {
      isLoggedIn.value = false
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
    }
  }
}

async function removeItem(item) {
  if (deleting.value || updating.value) return
  deleting.value = true
  try {
    const productId = item.productId
    const id = item.id
    await cartDelete(productId, id)
    await load()
    updateCartBadgeNow()
    uni.showToast({ title: '已删除', icon: 'success', duration: 1000 })
  } catch (e) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  } finally {
    deleting.value = false
  }
}

function goCheckout() {
  if (!items.value || items.value.length === 0) {
    uni.showToast({ title: '购物车为空', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/order/confirm' })
}

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
    updateCartBadge()
  } catch (e) {
    console.error('更新数量失败:', e)
  } finally {
    updating.value = false
  }
}

async function inc(i) {
  if (updating.value) return
  updating.value = true
  const pid = i.productId || i.id
  const qty = Number(i.quantity || 1) + 1
  i.quantity = qty
  try {
    await cartUpdate(pid, qty)
    updateCartBadge()
  } catch (e) {
    i.quantity = qty - 1
  } finally {
    updating.value = false
  }
}

async function dec(i) {
  if (updating.value) return
  updating.value = true
  const pid = i.productId || i.id
  const oldQty = Number(i.quantity || 1)
  const qty = Math.max(1, oldQty - 1)
  i.quantity = qty
  try {
    await cartUpdate(pid, qty)
    updateCartBadge()
  } catch (e) {
    i.quantity = oldQty
  } finally {
    updating.value = false
  }
}

onShow(() => { load() })

if (typeof window !== 'undefined') {
  window.debugCartBadge = debugCartBadge
}
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
  padding-bottom: 180rpx;
}

/* ========== 登录提示 ========== */
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $space-xl 0;
}

.login-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-xl;
  box-shadow: 0 8rpx 32rpx rgba(212, 180, 140, 0.25);
}

.login-title {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-sm;
}

.login-desc {
  font-size: $text-sm;
  color: $text-tertiary;
  margin-bottom: $space-xl;
}

.login-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  border-radius: $radius-full;
  padding: 0 80rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: $text-md;
  font-weight: $font-semibold;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(212, 180, 140, 0.25);

  &::after { border: none; }
  &:active { transform: scale(0.96); }
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $space-xl 0;
}

.empty-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  background: #ffffff;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-xl;
  box-shadow: 0 4rpx 20rpx rgba(74, 55, 40, 0.08);
  border: 1rpx solid #e8e0d5;
}

.empty-title {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-sm;
}

.empty-desc {
  font-size: $text-base;
  color: $text-tertiary;
  margin-bottom: $space-xl;
}

.go-shopping-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  border-radius: $radius-full;
  padding: 0 80rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: $text-md;
  font-weight: $font-semibold;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(212, 180, 140, 0.25);

  &::after { border: none; }
  &:active { transform: scale(0.96); }
}

/* ========== 购物车列表 ========== */
.cart-list {
  padding: $space-md;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.cart-row {
  background: #ffffff;
  border-radius: $radius-md;
  padding: $space-md;
  display: flex;
  gap: $space-md;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.05);
  border: 1rpx solid #e8e0d5;
  transition: all 0.3s ease;

  &:active { box-shadow: 0 4rpx 16rpx rgba(74, 55, 40, 0.1); }
}

.cart-row.updating { opacity: 0.6; }
.cart-row.deleting { opacity: 0.3; transform: translateX(-20rpx); }

.item-thumb {
  width: 160rpx;
  height: 160rpx;
  background: $bg-secondary;
  border-radius: $radius-sm;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.thumb-img {
  width: 100%;
  height: 100%;
}

.diy-badge {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  font-size: 18rpx;
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
  font-weight: $font-semibold;
}

.item-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $space-xs;
}

.item-title {
  font-size: $text-sm;
  color: $text-primary;
  font-weight: $font-medium;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  color: #D4B48C;
  font-weight: $font-bold;
  font-size: $text-md;
}

.stepper {
  display: flex;
  align-items: center;
  gap: $space-sm;
}

.step-btn {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-secondary;
  border-radius: $radius-sm;
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $text-primary;
  transition: all 0.2s ease;

  &:active { background: $primary-light; color: #ffffff; }
}

.step-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.step-ipt {
  width: 72rpx;
  height: 52rpx;
  text-align: center;
  background: $bg-secondary;
  border: 1rpx solid #e8e0d5;
  border-radius: $radius-sm;
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $text-primary;
}

.diy-tags {
  display: flex;
  align-items: center;
  gap: $space-xs;
  flex-wrap: wrap;
}

.diy-tag {
  font-size: $text-xs;
  color: $text-secondary;
  background: $bg-secondary;
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
}

.remove-btn {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-secondary;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:active { background: $error-light; }
}

.remove-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}

/* ========== DIY商品 ========== */
.diy-item {
  background: linear-gradient(135deg, #FFFDF9, #ffffff);
  border: 1rpx solid rgba(212, 180, 140, 0.2);
}

/* ========== 底部结算栏 ========== */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  padding: $space-md $space-lg calc($space-md + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 24rpx rgba(74, 55, 40, 0.06);
  border-top: 1rpx solid #e8e0d5;
  z-index: 100;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.total-label {
  font-size: $text-sm;
  color: $text-secondary;
}

.total-money {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: #D4B48C;
}

.checkout-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  border-radius: $radius-full;
  padding: 0 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-weight: $font-semibold;
  font-size: $text-md;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(212, 180, 140, 0.25);

  &::after { border: none; }
  &:active { transform: scale(0.96); }
}
</style>
