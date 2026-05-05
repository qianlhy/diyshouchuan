<template>
  <view class="page">
    <!-- 地址列表 -->
    <view v-if="addresses && addresses.length > 0" class="address-list">
      <view 
        v-for="addr in addresses" 
        :key="addr.id" 
        class="addr-item"
        :class="{ selected: selectedId === addr.id }"
        @click="selectAddress(addr)"
      >
        <view class="addr-header">
          <view class="addr-name">{{ addr.name }}</view>
          <view class="addr-phone">{{ addr.phone }}</view>
          <view v-if="addr.isDefault" class="default-tag">默认</view>
        </view>
        <view class="addr-detail">
          {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
        </view>
        <view class="check-icon" v-if="selectedId === addr.id">✓</view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty">
      <view class="empty-icon">📍</view>
      <view class="empty-text">还没有收货地址</view>
      <button class="add-btn" @click="goAddAddress">添加新地址</button>
    </view>

    <!-- 底部添加按钮 -->
    <view v-if="addresses && addresses.length > 0" class="bottom-bar">
      <button class="add-btn" @click="goAddAddress">+ 添加新地址</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addressList } from '../../api/index.js'

const addresses = ref([])
const selectedId = ref(null)
const eventChannel = ref(null)

onLoad(() => {
  // 获取事件通道
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  eventChannel.value = currentPage.getOpenerEventChannel()
  
  loadAddresses()
})

// 加载地址列表
async function loadAddresses() {
  try {
    const res = await addressList()
    addresses.value = Array.isArray(res) ? res : (res.data || [])
    
    // 默认选中第一个或默认地址
    if (addresses.value.length > 0) {
      const defaultAddr = addresses.value.find(addr => addr.isDefault)
      selectedId.value = defaultAddr ? defaultAddr.id : addresses.value[0].id
    }
  } catch (e) {
    console.error('加载地址失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 选择地址
function selectAddress(addr) {
  selectedId.value = addr.id
  
  // 触发选择事件，传递地址数据
  if (eventChannel.value) {
    eventChannel.value.emit('selectAddress', addr)
  }
  
  // 延迟返回，让用户看到选中效果
  setTimeout(() => {
    uni.navigateBack()
  }, 300)
}

// 添加新地址
function goAddAddress() {
  uni.navigateTo({ url: '/pages/address/edit' })
}
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: 160rpx;
}

.address-list {
  padding: $space-md;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.addr-item {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $space-lg;
  position: relative;
  border: 2rpx solid $border-light;
  transition: all 0.3s;

  &:active { background: $bg-secondary; }
}

.addr-item.selected {
  border-color: $primary;
  background: $primary-gradient-light;
}

.addr-header {
  display: flex;
  align-items: center;
  gap: $space-md;
  margin-bottom: $space-sm;
}

.addr-name {
  font-size: $text-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.addr-phone {
  font-size: $text-sm;
  color: $text-secondary;
}

.default-tag {
  padding: 4rpx 16rpx;
  background: $primary-gradient;
  color: $text-white;
  font-size: $text-xs;
  border-radius: $radius-md;
  font-weight: $font-semibold;
}

.addr-detail {
  font-size: $text-sm;
  color: $text-tertiary;
  line-height: 1.6;
  padding-right: 80rpx;
}

.check-icon {
  position: absolute;
  right: $space-lg;
  top: 50%;
  transform: translateY(-50%);
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: $primary-gradient;
  color: $text-white;
  font-size: $text-md;
  font-weight: $font-bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $space-md;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: $space-lg;
}

.empty-text {
  font-size: $text-base;
  color: $text-tertiary;
  margin-bottom: $space-xl;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $space-md $space-lg calc($space-md + env(safe-area-inset-bottom));
  background: $bg-card;
  border-top: 1rpx solid $border-light;
  box-shadow: 0 -4rpx 24rpx rgba(0,0,0,0.06);
}

.add-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: $primary-gradient;
  color: $text-white;
  font-size: $text-md;
  font-weight: $font-semibold;
  border-radius: $radius-xl;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(212, 180, 140, 0.25);

  &::after { border: none; }
  &:active { transform: scale(0.98); }
}
</style>
