<template>
  <view class="page">
    <!-- 地址列表 -->
    <view v-if="addresses.length" class="address-list">
      <view
        class="address-item"
        v-for="addr in addresses"
        :key="addr.id"
      >
        <view class="addr-content" @click="selectAddress(addr)">
          <view class="addr-header">
            <text class="addr-name">{{ addr.name }}</text>
            <text class="addr-phone">{{ addr.phone }}</text>
            <view class="default-tag" v-if="addr.isDefault">默认</view>
          </view>
          <text class="addr-full">{{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}</text>
        </view>

        <view class="addr-actions">
          <view class="action-btn edit-btn" @click="editAddress(addr)">
            <text class="u-iconfont" style="font-size: 28rpx; color: #9a8b7a;">&#xe63c;</text>
            <text class="action-label">编辑</text>
          </view>
          <view class="action-btn del-btn" @click="deleteAddress(addr)">
            <text class="u-iconfont" style="font-size: 28rpx; color: #D4836A;">&#xe685;</text>
            <text class="action-label del-label">删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="u-iconfont empty-icon" style="font-size: 120rpx; color: #D4B48C;">&#xe64e;</text>
      <text class="empty-title">暂无收货地址</text>
      <text class="empty-desc">点击下方添加收货地址</text>
    </view>

    <!-- 新增地址按钮 -->
    <view class="add-bar">
      <button class="add-btn" @click="addAddress">
        <text class="u-iconfont" style="font-size: 28rpx; color: #ffffff;">&#xe60c;</text>
        <text class="add-text">添加新地址</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { addressDelete, addressList } from '../../api/index.js'

const addresses = ref([])
const showEdit = ref(false)
const currentEdit = ref(null)
const form = ref({ name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false })

async function loadAddresses() {
  try {
    const res = await addressList()
    addresses.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e) {
    console.error('加载地址失败:', e)
  }
}

function addAddress() {
  form.value = { name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: addresses.value.length === 0 }
  currentEdit.value = null
  uni.navigateTo({ url: '/pages/address/edit' })
}

function editAddress(addr) {
  form.value = { ...addr }
  currentEdit.value = addr
  uni.navigateTo({ url: `/pages/address/edit?id=${addr.id}` })
}

async function deleteAddress(addr) {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    confirmText: '删除',
    confirmColor: '#D4B48C',
    success: async (res) => {
      if (res.confirm) {
        try {
          await addressDelete(addr.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          await loadAddresses()
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

function selectAddress(addr) {
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]
  if (prevPage && prevPage.$vm && prevPage.$vm.selectedAddress !== undefined) {
    prevPage.$vm.selectedAddress = addr
  }
  uni.navigateBack()
}

onShow(() => { loadAddresses() })
onMounted(() => { loadAddresses() })
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
  padding: $space-md;
  padding-bottom: 200rpx;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.address-item {
  background: #ffffff;
  border-radius: $radius-lg;
  border: 1rpx solid #e8e0d5;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.04);
  overflow: hidden;
  transition: all 0.2s;

  &:active { box-shadow: 0 4rpx 16rpx rgba(74, 55, 40, 0.08); }
}

.addr-content {
  padding: $space-lg;
}

.addr-header {
  display: flex;
  align-items: center;
  gap: $space-sm;
  margin-bottom: 8rpx;
}

.addr-name {
  font-size: $text-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.addr-phone {
  font-size: $text-sm;
  color: $text-secondary;
  margin-left: $space-sm;
}

.default-tag {
  font-size: 18rpx;
  color: #ffffff;
  background: #D4B48C;
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
  font-weight: $font-semibold;
  margin-left: $space-sm;
}

.addr-full {
  font-size: $text-sm;
  color: $text-tertiary;
  line-height: 1.6;
}

.addr-actions {
  display: flex;
  border-top: 1rpx solid #f0ebe3;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: $space-md;
  transition: all 0.2s;

  &:active { background: $bg-hover; }
}

.action-label {
  font-size: $text-sm;
  color: $text-secondary;
}

.del-label { color: #D4836A; }

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx $space-xl 0;
}

.empty-icon {
  margin-bottom: $space-lg;
  opacity: 0.6;
}

.empty-title {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-sm;
}

.empty-desc {
  font-size: $text-base;
  color: $text-tertiary;
}

/* ========== 添加按钮 ========== */
.add-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $space-md $space-lg calc($space-md + env(safe-area-inset-bottom));
  background: $bg-primary;
  box-shadow: 0 -4rpx 24rpx rgba(74, 55, 40, 0.06);
  z-index: 100;
}

.add-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-sm;
  font-size: $text-md;
  font-weight: $font-semibold;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(212, 180, 140, 0.25);
  margin: 0;

  &::after { border: none; }
  &:active { transform: scale(0.98); }
}
</style>
