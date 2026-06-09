<template>
  <view class="page">
    <!-- 收货地址 -->
    <view class="section">
      <view class="section-title">收货地址</view>
      <view v-if="!selectedAddress" class="no-address" @click="goSelectAddress">
        <view class="addr-icon-wrap">
          <text class="u-iconfont" style="font-size: 32rpx; color: #ffffff;">&#xe64e;</text>
        </view>
        <text class="addr-tip">请选择收货地址</text>
        <text class="addr-arrow">›</text>
      </view>
      <view v-else class="address-card" @click="goSelectAddress">
        <view class="addr-icon-wrap">
          <text class="u-iconfont" style="font-size: 32rpx; color: #ffffff;">&#xe64e;</text>
        </view>
        <view class="addr-info">
          <view class="addr-header">
            <text class="addr-name">{{ selectedAddress.name }}</text>
            <text class="addr-phone">{{ selectedAddress.phone }}</text>
          </view>
          <text class="addr-detail">{{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}</text>
        </view>
        <text class="addr-arrow">›</text>
      </view>
    </view>

    <!-- 商品清单 -->
    <view class="section">
      <view class="section-title">商品清单</view>

      <view v-if="orderMode === 'diy'" class="goods-list">
        <view class="goods-item">
          <image v-if="designImage" class="goods-thumb" :src="designImage" mode="aspectFill" @click="previewDesign" @error="onDesignImageError" />
          <view v-else class="goods-thumb goods-thumb-empty">暂无设计图</view>
          <view class="goods-info">
            <view class="goods-name">DIY商品：{{ diyName || '未命名' }}</view>
            <view class="goods-price-row">
              <text class="goods-price">¥{{ totalAmount }}</text>
              <text class="goods-qty">x1</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="goods-list">
        <view class="goods-item" v-for="item in cartItems" :key="item.id">
          <image v-if="item.imageUrl || item.image" class="goods-thumb" :src="item.imageUrl || item.image" mode="aspectFill" />
          <view v-else class="goods-thumb" :style="{background: item.color || '#F2EDE4'}"></view>
          <view class="goods-info">
            <view class="goods-name">{{ item.title }}</view>
            <view class="goods-price-row">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- DIY信息 -->
    <view class="section" v-if="orderMode === 'diy'">
      <view class="section-title">DIY信息</view>
      <view class="diy-row">
        <text class="diy-label">作品名称</text>
        <input class="diy-input" type="text" v-model="diyName" placeholder="请输入作品名称" maxlength="20" />
      </view>
      <view class="diy-row">
        <text class="diy-label">设计图</text>
        <image v-if="designImage" :src="designImage" mode="aspectFit" class="small-preview" @click="previewDesign" @error="onDesignImageError" />
        <view v-else class="small-preview small-preview-empty">暂无设计图</view>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="section">
      <view class="section-title">订单备注</view>
      <input class="remark-input" type="text" v-model="remark" placeholder="选填，请先和商家协商一致" />
    </view>

    <!-- 金额明细 -->
    <view class="section amount-section">
      <view class="amount-row">
        <text class="amount-label">商品金额</text>
        <text class="amount-value">¥{{ totalAmount }}</text>
      </view>
      <view class="amount-row">
        <text class="amount-label">运费</text>
        <text class="amount-value">¥{{ shippingFee.toFixed(2) }}</text>
      </view>
      <view class="amount-row total-row">
        <text class="amount-label total-label">实付款</text>
        <text class="amount-value total-value">¥{{ finalAmount }}</text>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view class="submit-bar">
      <view class="submit-total">
        <text class="submit-total-label">合计：</text>
        <text class="submit-total-money">¥{{ finalAmount }}</text>
      </view>
      <button class="submit-btn" :disabled="!selectedAddress || submitting" @click="submitOrder">
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { addressList, cartAdd, cartList, clearCart, createDiyOrder, orderCreate } from '../../api/index.js'
import { extractUploadPath, resolveImageUrl, toRelativeImagePath } from '../../utils/imageHelper.js'

const cartItems = ref([])
const selectedAddress = ref(null)
const submitting = ref(false)
const orderMode = ref('cart')
const diyItems = ref([])
const designImage = ref('')
const designImageRaw = ref('')
const designImageTriedRemote = ref(false)
const remark = ref('')
const diyName = ref('')

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0).toFixed(2)
})

const shippingFee = computed(() => {
  if (!selectedAddress.value || !selectedAddress.value.province) return 0
  const province = selectedAddress.value.province
  if (province.includes('新疆') || province.includes('西藏')) return 15
  return 0
})

const finalAmount = computed(() => {
  return (Number(totalAmount.value) + shippingFee.value).toFixed(2)
})

const classificationDetails = ref({})
const orderCategories = ref('')
const beadDescription = ref('')

onLoad(async (options) => {
  if (options.mode === 'diy') {
    orderMode.value = 'diy'
    try {
      const data = uni.getStorageSync('diy_order_data')
      if (data && data.items) {
        diyItems.value = data.items
        cartItems.value = data.items
        designImageRaw.value = data.designImage || ''
        // 优先使用本地临时预览图（上传后立即展示，不依赖网络）
        designImage.value = data.designImagePreview || resolveImageUrl(designImageRaw.value)
        beadDescription.value = data.beadDescription || ''
        for (let i = 1; i <= 8; i++) {
          if (data[`classificationDetail${i}`]) classificationDetails.value[i] = data[`classificationDetail${i}`]
        }
        orderCategories.value = data.categories || ''
      }
      if (options.size) remark.value = `手链尺寸: ${options.size}cm`
    } catch (e) {}
  } else if (options.mode === 'direct') {
    orderMode.value = 'direct'
    try {
      const item = uni.getStorageSync('direct_buy_item')
      if (item) {
        item.imageUrl = resolveImageUrl(item.imageUrl)
        item.image = resolveImageUrl(item.image)
        cartItems.value = [item]
      }
    } catch (e) {}
  } else {
    await loadCartItems()
  }
  await loadDefaultAddress()
})

function onDesignImageError() {
  if (!designImageTriedRemote.value && designImageRaw.value) {
    designImageTriedRemote.value = true
    designImage.value = resolveImageUrl(designImageRaw.value)
  }
}

function previewDesign() {
  if (designImage.value) uni.previewImage({ urls: [designImage.value] })
}

async function loadCartItems() {
  try {
    const res = await cartList()
    const items = res.items || []
    cartItems.value = items.map(item => {
      let imageUrl = item.imageUrl || item.image || ''
      return { ...item, imageUrl: resolveImageUrl(imageUrl), image: resolveImageUrl(imageUrl) }
    })
    if (cartItems.value.length === 0) {
      uni.showToast({ title: '购物车为空', icon: 'none' })
      setTimeout(() => { uni.navigateBack() }, 1500)
    }
  } catch (e) {}
}

async function loadDefaultAddress() {
  try {
    const res = await addressList()
    const addresses = Array.isArray(res) ? res : (res.data || [])
    selectedAddress.value = addresses.find(addr => addr.isDefault) || addresses[0] || null
  } catch (e) {}
}

function goSelectAddress() {
  uni.navigateTo({
    url: '/pages/address/select',
    events: { selectAddress: (address) => { selectedAddress.value = address } }
  })
}

async function submitOrder() {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  if (submitting.value) return
  submitting.value = true
  uni.showLoading({ title: '提交中...' })

  const addr = selectedAddress.value
  const addrFields = {
    receiverName: addr.name, receiverPhone: addr.phone,
    receiverProvince: addr.province, receiverCity: addr.city,
    receiverDistrict: addr.district, receiverDetail: addr.detail,
  }

  try {
    let res
    if (orderMode.value === 'diy') {
      const currentDiyName = diyName.value || '我的设计'
      const items = diyItems.value.map(item => ({
        productId: item.productId || item.id || 0, title: currentDiyName,
        price: item.price, quantity: item.quantity
      }))
      let desc = beadDescription.value
      if (!desc) {
        desc = `分类:${orderCategories.value || ''}`
        if (classificationDetails.value[1]) {
          const detail = classificationDetails.value[1]
          desc += ` ${(typeof detail === 'object' && detail.name) ? detail.name : detail}`
        }
      }
      res = await createDiyOrder({
        ...addrFields, remark: remark.value || 'DIY设计订单',
        items, diyImage: toRelativeImagePath(designImageRaw.value || designImage.value), diyName: diyName.value || '我的设计',
        description: desc.trim(), designId: 0, shippingFee: shippingFee.value
      })
    } else if (orderMode.value === 'direct') {
      try { await clearCart() } catch (e) {}
      for (const item of cartItems.value) {
        const pid = item.productId || item.id
        if (pid) await cartAdd(Number(pid), Number(item.quantity || 1))
      }
      res = await orderCreate({ addressId: addr.id, ...addrFields, remark: remark.value || '直接购买订单', shippingFee: shippingFee.value })
    } else {
      res = await orderCreate({ addressId: addr.id, ...addrFields, shippingFee: shippingFee.value })
    }

    uni.hideLoading()
    const orderId = res.order?.id || res.id || res.order?.orderId || res.orderId
    if (!orderId) {
      uni.showToast({ title: '订单创建失败', icon: 'none' })
      return
    }
    try { uni.setStorageSync('order_expire_' + orderId, Date.now() + 30 * 60 * 1000) } catch (e) {}
    uni.showToast({ title: '订单创建成功', icon: 'success' })
    setTimeout(() => { uni.redirectTo({ url: '/pages/order/detail?id=' + orderId }) }, 1500)
  } catch (e) {
    uni.hideLoading()
    console.error('创建订单失败:', e)
    uni.showToast({ title: e.message || '创建订单失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
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
  padding-bottom: 160rpx;
}

.section {
  background: #ffffff;
  padding: $space-lg;
  margin-bottom: $space-sm;
}

.section-title {
  font-size: $text-md;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-lg;
}

/* ========== 地址 ========== */
.no-address, .address-card {
  display: flex;
  align-items: center;
  gap: $space-md;
}

.addr-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.no-address .addr-tip {
  flex: 1;
  font-size: $text-base;
  color: $text-primary;
  font-weight: $font-medium;
}

.addr-info {
  flex: 1;
}

.addr-header {
  display: flex;
  align-items: center;
  gap: $space-md;
  margin-bottom: 8rpx;
}

.addr-name {
  font-size: $text-md;
  font-weight: $font-semibold;
  color: $text-primary;
}

.addr-phone {
  font-size: $text-sm;
  color: $text-secondary;
}

.addr-detail {
  font-size: $text-sm;
  color: $text-tertiary;
  line-height: 1.5;
}

.addr-arrow {
  font-size: $text-xl;
  color: $text-tertiary;
  flex-shrink: 0;
}

/* ========== 商品列表 ========== */
.goods-list {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.goods-item {
  display: flex;
  gap: $space-md;
  align-items: flex-start;
}

.goods-thumb {
  width: 140rpx;
  height: 140rpx;
  background: $bg-secondary;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.goods-thumb-empty,
.small-preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $text-xs;
  color: $text-tertiary;
  text-align: center;
  line-height: 1.4;
  padding: 8rpx;
  box-sizing: border-box;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rpx 0;
  min-height: 120rpx;
}

.goods-name {
  font-size: $text-base;
  color: $text-primary;
  font-weight: $font-medium;
  line-height: 1.4;
}

.goods-price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.goods-price {
  font-size: $text-md;
  font-weight: $font-bold;
  color: #D4B48C;
}

.goods-qty {
  font-size: $text-sm;
  color: $text-tertiary;
}

/* ========== DIY信息 ========== */
.diy-row {
  display: flex;
  align-items: center;
  gap: $space-md;
  margin-bottom: $space-md;

  &:last-child { margin-bottom: 0; }
}

.diy-label {
  width: 140rpx;
  font-size: $text-base;
  color: $text-secondary;
  flex-shrink: 0;
}

.diy-input {
  flex: 1;
  height: 80rpx;
  background: $bg-secondary;
  border-radius: $radius-md;
  padding: 0 $space-md;
  font-size: $text-base;
  color: $text-primary;
  box-sizing: border-box;
}

.small-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-md;
  background: $bg-secondary;
}

/* ========== 备注 ========== */
.remark-input {
  width: 100%;
  height: 80rpx;
  background: $bg-secondary;
  border-radius: $radius-md;
  padding: 0 $space-md;
  font-size: $text-base;
  color: $text-primary;
  box-sizing: border-box;
}

/* ========== 金额 ========== */
.amount-section {
  background: #ffffff;
  padding: $space-lg;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-xs 0;
  font-size: $text-base;
}

.amount-label { color: $text-secondary; }
.amount-value { color: $text-primary; }

.total-row {
  border-top: 1rpx solid #e8e0d5;
  padding-top: $space-md;
  margin-top: $space-sm;
}

.total-label {
  font-size: $text-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.total-value {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: #D4B48C;
}

/* ========== 底部提交栏 ========== */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-md $space-lg calc($space-md + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #e8e0d5;
  box-shadow: 0 -4rpx 24rpx rgba(74, 55, 40, 0.06);
  z-index: 100;
}

.submit-total {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.submit-total-label {
  font-size: $text-base;
  color: $text-secondary;
}

.submit-total-money {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: #D4B48C;
}

.submit-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  font-size: $text-md;
  font-weight: $font-semibold;
  border-radius: $radius-full;
  border: none;
  padding: 0 48rpx;
  height: 80rpx;
  line-height: 80rpx;
  box-shadow: 0 8rpx 24rpx rgba(212, 180, 140, 0.25);
  margin: 0;

  &::after { border: none; }
  &[disabled] { background: #e8e0d5; color: #9a8b7a; box-shadow: none; }
}
</style>
