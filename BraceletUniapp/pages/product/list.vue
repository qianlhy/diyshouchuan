<template>
  <view class="page">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="u-iconfont search-icon" style="font-size: 28rpx; color: #9a8b7a;">&#xe62a;</text>
        <input
          class="search-input"
          v-model="searchKey"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="onSearch"
        />
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <scroll-view class="tabs-scroll" scroll-x>
        <view
          class="tab"
          :class="{ active: activeCid === 0 }"
          @click="switchCategory(0)"
        >全部</view>
        <view
          class="tab"
          :class="{ active: activeCid === c.id }"
          v-for="c in categories"
          :key="c.id"
          @click="switchCategory(c.id)"
        >{{ c.name }}</view>
      </scroll-view>
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view class="product-card" v-for="p in products" :key="p.id" @click="goDetail(p.id)">
        <view class="product-img-wrap">
          <image v-if="p.coverImage" :src="p.coverImage" mode="aspectFill" class="product-img" />
          <view class="product-tag" v-if="p.stock > 0">库存{{ p.stock }}</view>
        </view>
        <view class="product-info">
          <text class="product-name">{{ p.title }}</text>
          <text class="product-desc" v-if="p.description">{{ p.description }}</text>
          <view class="product-bottom">
            <view class="price-wrap">
              <text class="price-symbol">¥</text>
              <text class="price-num">{{ p.price }}</text>
            </view>
            <view class="buy-btn">查看</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!products.length && !loading">
      <text class="empty-text">暂无相关商品</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { productList, categoryList } from '../../api/index.js'
import { resolveImageUrl } from '../../utils/imageHelper.js'
import { onLoad } from '@dcloudio/uni-app'

const products = ref([])
const categories = ref([])
const activeCid = ref(0)
const searchKey = ref('')

function goDetail(id) {
  uni.navigateTo({ url: '/pages/product/detail?id=' + id })
}

async function loadProducts(cid) {
  try {
    const res = await productList(cid)
    let productData = Array.isArray(res) ? res : (res.data || [])
    products.value = productData.map(p => ({
      ...p,
      coverImage: resolveImageUrl(p.coverImage)
    }))
  } catch (e) {
    console.error('加载商品失败:', e)
  }
}

onLoad(async (options) => {
  const categoryId = options && options.categoryId ? Number(options.categoryId) : 0
  try {
    const cats = await categoryList()
    categories.value = Array.isArray(cats) ? cats : (cats.data || [])
    activeCid.value = 0
    await loadProducts(0)
  } catch (e) {}
})

async function switchCategory(cid) {
  activeCid.value = Number(cid) || 0
  await loadProducts(activeCid.value)
}

function onSearch() {
  loadProducts(activeCid.value)
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
  background: $bg-primary;
  min-height: 100vh;
  padding-bottom: 180rpx;
}

/* ========== 搜索栏 ========== */
.search-bar {
  padding: $space-md $space-md 0;
  background: $bg-primary;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: $space-sm;
  background: #ffffff;
  border-radius: $radius-full;
  padding: 0 $space-md;
  height: 72rpx;
  border: 1rpx solid #e8e0d5;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.04);
}

.search-icon {
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: $text-sm;
  color: $text-primary;
}

/* ========== 分类标签 ========== */
.category-tabs {
  padding: $space-md $space-md 0;
  background: $bg-primary;
}

.tabs-scroll {
  white-space: nowrap;
}

.tab {
  display: inline-flex;
  padding: 10rpx 24rpx;
  background: #ffffff;
  color: $text-secondary;
  border-radius: $radius-full;
  font-size: $text-sm;
  margin-right: $space-sm;
  border: 1rpx solid #e8e0d5;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab.active {
  color: #D4B48C;
  font-weight: $font-bold;
  background: linear-gradient(135deg, #FDF8F3, #FAF2E8);
  border-color: #D4B48C;
  box-shadow: 0 4rpx 16rpx rgba(212, 180, 140, 0.15);
}

/* ========== 商品列表 ========== */
.product-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-md;
  padding: $space-md;
  margin-top: $space-md;
}

.product-card {
  background: #ffffff;
  border-radius: $radius-md;
  overflow: hidden;
  border: 1rpx solid #e8e0d5;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.04);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 4rpx 16rpx rgba(74, 55, 40, 0.08);
  }
}

.product-img-wrap {
  position: relative;
  width: 100%;
  height: 320rpx;
  background: $bg-secondary;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
}

.product-tag {
  position: absolute;
  bottom: $space-xs;
  right: $space-xs;
  background: rgba(74, 55, 40, 0.6);
  color: #ffffff;
  font-size: 18rpx;
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
}

.product-info {
  padding: $space-sm;
}

.product-name {
  font-size: $text-sm;
  color: $text-primary;
  font-weight: $font-semibold;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4rpx;
}

.product-desc {
  font-size: $text-xs;
  color: $text-tertiary;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: $space-xs;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: $space-xs;
}

.price-wrap {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: $text-xs;
  color: #D4B48C;
  font-weight: $font-semibold;
}

.price-num {
  font-size: $text-md;
  color: #D4B48C;
  font-weight: $font-bold;
}

.buy-btn {
  background: #D4B48C;
  color: #ffffff;
  font-size: $text-xs;
  font-weight: $font-semibold;
  padding: 6rpx 18rpx;
  border-radius: $radius-full;
}

/* ========== 空状态 ========== */
.empty-state {
  padding: 120rpx $space-md;
  text-align: center;
}

.empty-text {
  font-size: $text-base;
  color: $text-tertiary;
}
</style>
