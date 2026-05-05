<template>
  <view class="page" v-if="detail">
    <!-- 轮播图区域 -->
    <swiper class="gallery" circular :indicator-dots="bannerList.length > 1" :autoplay="true" :interval="4000" :duration="500">
      <swiper-item v-for="(img, index) in bannerList" :key="index">
        <image class="gallery-img" :src="img" mode="aspectFill" @click="handlePreview(index)" />
      </swiper-item>
    </swiper>

    <!-- 商品信息 -->
    <view class="info-card">
      <view class="price-row">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ detail.price }}</text>
      </view>
      <view class="product-name">{{ detail.title }}</view>
      <view class="product-desc" v-if="detail.description">{{ detail.description }}</view>
    </view>

    <!-- 数量选择 -->
    <view class="qty-card">
      <view class="qty-label">数量</view>
      <view class="qty-stepper">
        <view class="qty-btn" @click="dec">−</view>
        <input class="qty-ipt" type="number" v-model.number="count" />
        <view class="qty-btn" @click="inc">+</view>
      </view>
    </view>

    <!-- 占位 -->
    <view style="height: 20rpx;"></view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <button class="btn-cart" @click="handleAdd">加入购物车</button>
      <button class="btn-buy" @click="buyNow">立即购买</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { productDetail, cartAdd, orderCreate } from '../../api/index.js'
import { resolveImageUrl } from '../../utils/imageHelper.js'
import { updateCartBadge } from '../../utils/cartBadge.js'
import { onLoad } from '@dcloudio/uni-app'

const detail = ref(null)
const product = ref(null)
const bannerList = ref([])
let pid = ''
const count = ref(1)

function inc () { count.value = Number(count.value || 1) + 1 }
function dec () { count.value = Math.max(1, Number(count.value || 1) - 1) }

function handlePreview(current) {
  if (!bannerList.value || bannerList.value.length === 0) return
  uni.previewImage({
    urls: bannerList.value,
    current: bannerList.value[current],
    indicator: 'number',
    loop: true
  })
}

async function handleAdd() {
  try {
    await cartAdd(Number(pid), Number(count.value))
    uni.showToast({ title: '已加入购物车', icon: 'success' })
    updateCartBadge()
  } catch (e) {
    console.error('添加购物车失败:', e)
    if (e.code === 401) {
      uni.showModal({
        title: '提示',
        content: '请先登录后再操作',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            uni.reLaunch({ url: '/pages/index/index' })
          }
        }
      })
    } else {
      uni.showToast({ title: e.msg || '添加失败，请重试', icon: 'none' })
    }
  }
}

async function buyNow() {
  try {
    const item = {
        productId: product.value.id,
        title: product.value.title,
        price: product.value.price,
        image: product.value.coverImage,
        imageUrl: product.value.coverImage,
        quantity: Number(count.value)
    }
    uni.setStorageSync('direct_buy_item', item)
    uni.navigateTo({ url: '/pages/order/confirm?mode=direct' })
  } catch (e) {
    console.error('立即购买失败:', e)
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

onLoad(async (options) => {
  pid = options && options.id ? options.id : ''
  if (!pid) return
  try {
    const res = await productDetail(Number(pid))
    product.value = res && res.product ? res.product : res

    if (product.value) {
      if (product.value.coverImage) {
        product.value.coverImage = resolveImageUrl(product.value.coverImage)
      }

      let details = []
      if (product.value.detailImages) {
        details = Array.isArray(product.value.detailImages)
          ? product.value.detailImages
          : (typeof product.value.detailImages === 'string' ? JSON.parse(product.value.detailImages) : [])
      }

      const processedDetails = details.map(img => resolveImageUrl(img))

      const images = new Set()
      if (product.value.coverImage) images.add(product.value.coverImage)
      processedDetails.forEach(img => images.add(img))

      bannerList.value = Array.from(images).filter(Boolean)
    }

    detail.value = product.value || null
  } catch (e) {
    console.error('获取详情失败', e)
  }
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
  background: $bg-primary;
  min-height: 100vh;
  padding-bottom: 140rpx;
}

/* ========== 轮播图 ========== */
.gallery {
  height: 460rpx;
  background: $bg-secondary;
}

.gallery-img {
  width: 100%;
  height: 100%;
}

/* ========== 信息卡片 ========== */
.info-card {
  background: #ffffff;
  padding: $space-lg;
  margin: $space-sm 0;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: $space-sm;
}

.price-symbol {
  font-size: $text-sm;
  color: #D4B48C;
  font-weight: $font-semibold;
}

.price-value {
  font-size: $text-2xl;
  color: #D4B48C;
  font-weight: $font-bold;
}

.product-name {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
  line-height: 1.4;
  margin-bottom: $space-xs;
}

.product-desc {
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.6;
}

/* ========== 数量选择 ========== */
.qty-card {
  background: #ffffff;
  padding: $space-lg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-sm;
}

.qty-label {
  font-size: $text-base;
  color: $text-primary;
  font-weight: $font-medium;
}

.qty-stepper {
  display: flex;
  align-items: center;
  gap: $space-sm;
}

.qty-btn {
  width: 64rpx;
  height: 64rpx;
  background: $bg-secondary;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: $text-primary;
  transition: all 0.2s;

  &:active { background: #e8e0d5; }
}

.qty-ipt {
  width: 100rpx;
  height: 64rpx;
  text-align: center;
  background: $bg-secondary;
  border: 1rpx solid #e8e0d5;
  border-radius: $radius-md;
  font-size: $text-base;
  font-weight: $font-medium;
  color: $text-primary;
}

/* ========== 底部操作栏 ========== */
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  padding: $space-sm $space-lg calc($space-sm + env(safe-area-inset-bottom));
  display: flex;
  gap: $space-sm;
  box-shadow: 0 -4rpx 24rpx rgba(74, 55, 40, 0.06);
  border-top: 1rpx solid #e8e0d5;
  z-index: 100;
}

.btn-cart, .btn-buy {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: $radius-full;
  font-size: $text-md;
  font-weight: $font-semibold;
  border: none;
  margin: 0;

  &::after { border: none; }
}

.btn-cart {
  background: #ffffff;
  color: #D4B48C;
  border: 2rpx solid #D4B48C;
}

.btn-buy {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(212, 180, 140, 0.25);
}
</style>
