<template>
  <view class="page">
    <!-- 顶部状态Tab -->
    <view class="status-tabs">
      <view
        class="status-tab"
        :class="{ active: activeStatus === -1 }"
        @click="switchStatus(-1)"
      >全部</view>
      <view
        class="status-tab"
        :class="{ active: activeStatus === 0 }"
        @click="switchStatus(0)"
      >待支付
        <view class="tab-badge" v-if="statusCount.s0">{{ statusCount.s0 }}</view>
      </view>
      <view
        class="status-tab"
        :class="{ active: activeStatus === 1 }"
        @click="switchStatus(1)"
      >已支付</view>
      <view
        class="status-tab"
        :class="{ active: activeStatus === 2 }"
        @click="switchStatus(2)"
      >已发货</view>
      <view
        class="status-tab"
        :class="{ active: activeStatus === 3 }"
        @click="switchStatus(3)"
      >已完成</view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list" v-if="orders.length > 0">
      <view class="order-card" v-for="order in orders" :key="order.id" @click="goDetail(order)">
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-id">订单号：{{ order.orderNo }}</text>
          <text class="order-status" :class="statusClass(order.status)">{{ statusText(order.status) }}</text>
        </view>

        <!-- 商品预览 -->
        <view class="order-goods" v-if="order.items && order.items.length">
          <view class="goods-preview" v-for="item in order.items.slice(0, 3)" :key="item.id || item.productId">
            <image
              v-if="item.imageUrl || item.image"
              :src="item.imageUrl || item.image"
              mode="aspectFill"
              class="goods-thumb"
            />
            <view v-else class="goods-thumb" style="background: #F2EDE4;"></view>
          </view>
          <view class="goods-count" v-if="order.items.length > 3">+{{ order.items.length - 3 }}</view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <view class="order-time">{{ formatTime(order.createTime) }}</view>
          <view class="order-right">
            <text class="order-total">¥{{ order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '0.00' }}</text>
            <view class="order-actions">
              <view v-if="order.status === 0" class="action-btn cancel-btn" @click.stop="cancelOrder(order)">取消</view>
              <view v-if="order.status === 0" class="action-btn pay-btn" @click.stop="goPay(order)">去支付</view>
              <view v-if="order.status === 2" class="action-btn express-btn" @click.stop="viewExpress(order)">查看物流</view>
              <view v-if="order.status === 3" class="action-btn confirm-btn" @click.stop="confirmReceive(order)">确认收货</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!orders.length && !loading">
      <text class="empty-icon">📦</text>
      <text class="empty-title">暂无相关订单</text>
      <button class="go-shopping-btn" @click="goShopping">去逛逛</button>
    </view>

    <!-- 加载中 -->
    <view class="loading-wrap" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { cancelOrder as apiCancelOrder, completeOrder, orderList } from '../../api/index.js'
import { resolveImageUrl } from '../../utils/imageHelper.js'
import { formatOrderTime, normalizeOrder } from '../../utils/orderHelper.js'
import { handleOrderPayment } from '../../utils/paymentHelper.js'

const orders = ref([])
const activeStatus = ref(-1)
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const statusCount = reactive({ s0: 0, s1: 0, s2: 0, s3: 0 })

const STATUS_TEXT = ['待支付', '已支付', '已发货', '已完成', '已取消']
const STATUS_CLASS = ['status-wait', 'status-paid', 'status-shipped', 'status-done', 'status-cancel']

function statusText(status) { return STATUS_TEXT[status] || '未知' }
function statusClass(status) { return STATUS_CLASS[status] || '' }

const formatTime = formatOrderTime

function goDetail(order) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}

function goShopping() {
  uni.switchTab({ url: '/pages/index/index' })
}

async function loadOrders(status = -1, pageNum = 1, reset = false) {
  if (loading.value && !reset) return
  loading.value = true

  try {
    const params = { page: pageNum, size: 10 }
    if (status !== -1) params.status = status

    const res = await orderList(params)
    let list = []
    if (res && res.orders) list = res.orders
    else if (res && res.records) list = res.records
    else if (Array.isArray(res)) list = res
    else if (res && res.data) {
      if (res.data.orders) list = res.data.orders
      else list = Array.isArray(res.data) ? res.data : (res.data.records || [])
    }

    list = list.map(o => {
      const normalized = normalizeOrder(o)
      const items = (normalized.items || []).map(item => ({
        ...item,
        imageUrl: resolveImageUrl(item.imageUrl || item.image || normalized.productImage),
        image: resolveImageUrl(item.imageUrl || item.image || normalized.productImage)
      }))
      if (!items.length && normalized.productImage) {
        items.push({
          imageUrl: resolveImageUrl(normalized.productImage),
          image: resolveImageUrl(normalized.productImage)
        })
      }
      return { ...normalized, items }
    })

    if (reset) orders.value = list
    else orders.value = [...orders.value, ...list]

    hasMore.value = list.length >= 10
    page.value = pageNum

    if (reset) {
      statusCount.s0 = list.filter(o => o.status === 0).length
      statusCount.s1 = list.filter(o => o.status === 1).length
      statusCount.s2 = list.filter(o => o.status === 2).length
      statusCount.s3 = list.filter(o => o.status === 3).length
    }
  } catch (e) {
    console.error('加载订单失败:', e)
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

async function switchStatus(s) {
  activeStatus.value = s
  await loadOrders(s, 1, true)
}

async function cancelOrder(order) {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    confirmText: '取消订单',
    confirmColor: '#D4836A',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiCancelOrder(order.id)
          uni.showToast({ title: '订单已取消', icon: 'success' })
          await loadOrders(activeStatus.value, 1, true)
        } catch (e) {
          uni.showToast({ title: e.message || '取消失败', icon: 'none' })
        }
      }
    }
  })
}

function goPay(order) {
  handleOrderPayment(order, () => {
    loadOrders(activeStatus.value, 1, true)
  })
}

function viewExpress(order) {
  uni.navigateTo({ url: `/pages/kuaidi/query?orderId=${order.id}` })
}

async function confirmReceive(order) {
  uni.showModal({
    title: '提示',
    content: '确认已收到货物吗？',
    confirmText: '确认收货',
    confirmColor: '#D4B48C',
    success: async (res) => {
      if (res.confirm) {
        try {
          await completeOrder(order.id)
          uni.showToast({ title: '已确认收货', icon: 'success' })
          await loadOrders(activeStatus.value, 1, true)
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

onLoad((options) => {
  const s = options && options.status !== undefined ? Number(options.status) : -1
  activeStatus.value = s
  loadOrders(s, 1, true)
})

onPullDownRefresh(() => { loadOrders(activeStatus.value, 1, true) })
onReachBottom(() => { if (hasMore.value) loadOrders(activeStatus.value, page.value + 1, false) })
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: 180rpx;
}

/* ========== 状态Tab ========== */
.status-tabs {
  display: flex;
  align-items: center;
  padding: $space-md $space-md 0;
  background: $bg-primary;
  gap: 0;
}

.status-tab {
  flex: 1;
  text-align: center;
  padding: 10rpx 0;
  font-size: $text-sm;
  color: $text-tertiary;
  font-weight: $font-medium;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.status-tab.active {
  color: #D4B48C;
  font-weight: $font-bold;
  border-bottom-color: #D4B48C;
}

.tab-badge {
  position: absolute;
  top: 0;
  right: 10rpx;
  min-width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  background: #D4B48C;
  color: #ffffff;
  border-radius: $radius-full;
  font-size: 18rpx;
  font-weight: $font-bold;
  padding: 0 4rpx;
}

/* ========== 订单卡片 ========== */
.order-list {
  padding: $space-md;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.order-card {
  background: #ffffff;
  border-radius: $radius-lg;
  padding: $space-lg;
  border: 1rpx solid #e8e0d5;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.04);
  transition: all 0.2s;

  &:active { box-shadow: 0 4rpx 16rpx rgba(74, 55, 40, 0.08); }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-md;
}

.order-id {
  font-size: $text-sm;
  color: $text-tertiary;
}

.order-status {
  font-size: $text-sm;
  font-weight: $font-bold;
}

.status-wait { color: #D4A86A; }
.status-paid { color: #7A9EC9; }
.status-shipped { color: #7AB88A; }
.status-done { color: $text-tertiary; }
.status-cancel { color: $text-tertiary; }

/* ========== 商品预览 ========== */
.order-goods {
  display: flex;
  align-items: center;
  gap: $space-sm;
  margin-bottom: $space-md;
  flex-wrap: wrap;
}

.goods-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-sm;
  overflow: hidden;
  flex-shrink: 0;
}

.goods-thumb {
  width: 100%;
  height: 100%;
  background: $bg-secondary;
}

.goods-count {
  width: 120rpx;
  height: 120rpx;
  background: $bg-secondary;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $text-sm;
  color: $text-tertiary;
  flex-shrink: 0;
}

/* ========== 订单底部 ========== */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1rpx solid #f0ebe3;
  padding-top: $space-md;
}

.order-time {
  font-size: $text-xs;
  color: $text-tertiary;
}

.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: $space-sm;
}

.order-total {
  font-size: $text-md;
  font-weight: $font-bold;
  color: #D4B48C;
}

.order-actions {
  display: flex;
  gap: $space-sm;
}

.action-btn {
  padding: 6rpx 20rpx;
  border-radius: $radius-full;
  font-size: $text-xs;
  font-weight: $font-semibold;
  border: none;
}

.cancel-btn {
  background: $bg-secondary;
  color: $text-secondary;
  border: 1rpx solid #e8e0d5;
}

.pay-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(212, 180, 140, 0.2);
}

.express-btn, .confirm-btn {
  background: #ffffff;
  color: #D4B48C;
  border: 1rpx solid #D4B48C;
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx $space-xl 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: $space-lg;
}

.empty-title {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
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
}

/* ========== 加载 ========== */
.loading-wrap {
  padding: $space-xl;
  text-align: center;
}

.loading-text {
  font-size: $text-sm;
  color: $text-tertiary;
}
</style>
