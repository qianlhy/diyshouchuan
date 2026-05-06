<template>
  <view class="page" v-if="order">
    <!-- 订单状态 -->
    <view class="status-banner" :class="statusBannerClass">
      <text class="status-icon">{{ statusIcon }}</text>
      <text class="status-text">{{ statusText }}</text>
    </view>

    <!-- 收货地址 -->
    <view class="section address-section" v-if="order.receiverName">
      <view class="addr-row">
        <view class="addr-icon-wrap">
          <text class="u-iconfont" style="font-size: 28rpx; color: #ffffff;">&#xe64e;</text>
        </view>
        <view class="addr-text">
          <view class="addr-name">{{ order.receiverName }} {{ order.receiverPhone }}</view>
          <view class="addr-detail">{{ order.receiverProvince }} {{ order.receiverCity }} {{ order.receiverDistrict }} {{ order.receiverDetail }}</view>
        </view>
      </view>
    </view>

    <!-- 商品清单 -->
    <view class="section">
      <view class="goods-item" v-for="item in order.items" :key="item.id || item.productId">
        <image v-if="item.imageUrl || item.image" :src="item.imageUrl || item.image" mode="aspectFill" class="goods-thumb" />
        <view v-else class="goods-thumb" style="background: #F2EDE4;"></view>
        <view class="goods-info">
          <view class="goods-name">{{ item.title }}</view>
          <view class="goods-price-row">
            <text class="goods-price">¥{{ item.price }}</text>
            <text class="goods-qty">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="section info-section">
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ order.orderNo }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ formatTime(order.createTime) }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">商品金额</text>
        <text class="info-value">¥{{ order.totalAmount }}</text>
      </view>
      <view class="info-row" v-if="order.shippingFee > 0">
        <text class="info-label">运费</text>
        <text class="info-value">¥{{ order.shippingFee }}</text>
      </view>
      <view class="info-row total-row">
        <text class="info-label total-label">实付款</text>
        <text class="info-value total-value">¥{{ (order.totalAmount + (order.shippingFee || 0)).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-bar" v-if="order.status === 0">
      <view class="cancel-btn" @click="cancelOrder">取消订单</view>
      <view class="pay-btn" @click="goPay">去支付</view>
    </view>

    <view class="bottom-bar" v-if="order.status === 2">
      <view class="express-btn" @click="viewExpress">查看物流</view>
      <view class="receive-btn" @click="confirmReceive">确认收货</view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { cancelOrder as apiCancelOrder, completeOrder, orderDetail } from '../../api/index.js'
import { resolveImageUrl } from '../../utils/imageHelper.js'

const order = ref(null)
const STATUS_MAP = {
  0: { text: '待支付', icon: '⏰', cls: 'status-wait' },
  1: { text: '已支付，等待发货', icon: '✓', cls: 'status-paid' },
  2: { text: '已发货，运输中', icon: '🚚', cls: 'status-shipped' },
  3: { text: '已完成', icon: '✅', cls: 'status-done' },
  4: { text: '已取消', icon: '✗', cls: 'status-cancel' },
}

let statusText = ref('加载中...')
let statusIcon = ref('')
let statusBannerClass = ref('')

function formatTime(time) {
  if (!time) return '-'
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function loadDetail(id) {
  try {
    const res = await orderDetail(Number(id))
    order.value = res && res.order ? res.order : res
    if (order.value) {
      order.value.items = (order.value.items || []).map(item => ({
        ...item,
        imageUrl: resolveImageUrl(item.imageUrl || item.image),
        image: resolveImageUrl(item.imageUrl || item.image)
      }))
      const s = STATUS_MAP[order.value.status] || STATUS_MAP[0]
      statusText.value = s.text
      statusIcon.value = s.icon
      statusBannerClass.value = s.cls
    }
  } catch(e) {
    console.error('加载订单详情失败:', e)
  }
}

async function cancelOrder() {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    confirmText: '取消订单',
    confirmColor: '#D4836A',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiCancelOrder(order.value.id)
          uni.showToast({ title: '订单已取消', icon: 'success' })
          setTimeout(() => { uni.navigateBack() }, 1500)
        } catch(e) {
          uni.showToast({ title: e.message || '取消失败', icon: 'none' })
        }
      }
    }
  })
}

async function goPay() {
  if (!order.value) return
  
  uni.showLoading({ title: '正在发起支付...', mask: true })
  
  try {
    // 调用后端获取支付参数
    const payRes = await orderPay(order.value.orderNo, 1) // 1=微信支付
    console.log('支付参数:', payRes)
    
    if (!payRes || !payRes.nonceStr) {
      uni.hideLoading()
      uni.showToast({ title: '获取支付信息失败', icon: 'none' })
      return
    }
    
    // 调起微信支付
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: payRes.timeStamp || String(Date.now()),
      nonceStr: payRes.nonceStr,
      package: payRes.packageValue || payRes.package,
      signType: payRes.signType || 'RSA',
      paySign: payRes.paySign,
      success: (res) => {
        uni.hideLoading()
        uni.showToast({ title: '支付成功', icon: 'success' })
        // 刷新订单状态
        setTimeout(() => {
          loadDetail(order.value.id)
        }, 1500)
      },
      fail: (err) => {
        uni.hideLoading()
        console.error('支付失败:', err)
        if (err.errCode === -2) {
          uni.showToast({ title: '用户取消支付', icon: 'none' })
        } else {
          uni.showToast({ title: '支付失败', icon: 'none' })
        }
      }
    })
  } catch (e) {
    uni.hideLoading()
    console.error('发起支付失败:', e)
    uni.showToast({ title: e.message || '支付失败', icon: 'none' })
  }
}

function viewExpress() {
  uni.navigateTo({ url: `/pages/kuaidi/query?orderId=${order.value.id}` })
}

async function confirmReceive() {
  uni.showModal({
    title: '提示',
    content: '确认已收到货物吗？',
    confirmText: '确认收货',
    confirmColor: '#D4B48C',
    success: async (res) => {
      if (res.confirm) {
        try {
          await completeOrder(order.value.id)
          uni.showToast({ title: '已确认收货', icon: 'success' })
          loadDetail(order.value.id)
        } catch(e) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

onLoad((options) => {
  const id = options && options.id ? options.id : ''
  if (id) loadDetail(id)
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
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: 160rpx;
}

/* ========== 状态横幅 ========== */
.status-banner {
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-xl $space-lg;
}

.status-banner.status-wait { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); }
.status-banner.status-paid { background: linear-gradient(135deg, #EEF4FC, #BBDEFB); }
.status-banner.status-shipped { background: linear-gradient(135deg, #EDF5EE, #C8E6C9); }
.status-banner.status-done { background: linear-gradient(135deg, $bg-primary, $bg-secondary); }
.status-banner.status-cancel { background: $bg-secondary; }

.status-icon { font-size: $text-xl; }
.status-text { font-size: $text-md; font-weight: $font-bold; color: $text-primary; }

/* ========== 收货地址 ========== */
.address-section { padding: $space-lg; }

.addr-row {
  display: flex;
  gap: $space-md;
  align-items: flex-start;
}

.addr-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.addr-text { flex: 1; }

.addr-name {
  font-size: $text-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.addr-detail {
  font-size: $text-sm;
  color: $text-tertiary;
  line-height: 1.5;
}

/* ========== 商品 ========== */
.section {
  background: #ffffff;
  padding: $space-lg;
  margin-bottom: $space-sm;
}

.goods-item {
  display: flex;
  gap: $space-md;
  align-items: flex-start;
  padding-bottom: $space-md;
  border-bottom: 1rpx solid #f0ebe3;

  &:last-child { border-bottom: none; padding-bottom: 0; }
}

.goods-thumb {
  width: 120rpx;
  height: 120rpx;
  background: $bg-secondary;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.goods-info { flex: 1; }

.goods-name {
  font-size: $text-base;
  color: $text-primary;
  font-weight: $font-medium;
  line-height: 1.4;
  margin-bottom: $space-xs;
}

.goods-price-row {
  display: flex;
  justify-content: space-between;
}

.goods-price {
  font-size: $text-md;
  font-weight: $font-bold;
  color: #D4B48C;
}

.goods-qty { font-size: $text-sm; color: $text-tertiary; }

/* ========== 信息 ========== */
.info-section { background: #ffffff; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-xs 0;
  font-size: $text-sm;
}

.info-label { color: $text-secondary; }
.info-value { color: $text-primary; }

.total-row { border-top: 1rpx solid #e8e0d5; padding-top: $space-md; margin-top: $space-xs; }
.total-label { font-size: $text-md; font-weight: $font-bold; color: $text-primary; }
.total-value { font-size: $text-xl; font-weight: $font-bold; color: #D4B48C; }

/* ========== 底部操作 ========== */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: $space-sm;
  padding: $space-md $space-lg calc($space-md + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #e8e0d5;
  box-shadow: 0 -4rpx 24rpx rgba(74, 55, 40, 0.06);
  z-index: 100;
}

.cancel-btn, .pay-btn, .express-btn, .receive-btn {
  padding: 10rpx 32rpx;
  border-radius: $radius-full;
  font-size: $text-sm;
  font-weight: $font-semibold;
}

.cancel-btn {
  background: $bg-secondary;
  color: $text-secondary;
  border: 1rpx solid #e8e0d5;
}

.pay-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(212, 180, 140, 0.2);
}

.express-btn {
  background: #ffffff;
  color: #D4B48C;
  border: 1rpx solid #D4B48C;
}

.receive-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(212, 180, 140, 0.2);
}
</style>
