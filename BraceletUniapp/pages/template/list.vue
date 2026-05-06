<template>
  <view class="page">
    <!-- 顶部标题区 -->
    <view class="header">
      <text class="title">DIY模板</text>
      <text class="subtitle">选择模板，快速开始创作</text>
    </view>

    <!-- 模板列表 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="templates.length === 0" class="empty-state">
      <text class="u-iconfont empty-icon" style="font-size: 100rpx; color: #D4B48C;">&#xe673;</text>
      <text class="empty-text">暂无模板</text>
      <text class="empty-subtext">敬请期待更多精彩模板</text>
    </view>

    <view v-else class="template-grid">
      <view
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        @click="useTemplate(template)"
      >
        <view class="card-image">
          <image
            v-if="template.thumbnail"
            :src="template.thumbnail"
            mode="aspectFill"
            class="thumbnail"
          />
          <view v-else class="placeholder-image">
            <text class="u-iconfont" style="font-size: 60rpx; color: #D4B48C;">&#xe617;</text>
          </view>
        </view>
        <view class="card-content">
          <text class="template-name">{{ template.name }}</text>
          <text v-if="template.description" class="template-desc">{{ template.description }}</text>
          <view class="template-meta">
            <text class="bead-count">{{ template.beadCount || 0 }}颗珠子</text>
            <text class="template-price">¥{{ template.price || 0 }}</text>
          </view>
        </view>
        <view class="use-btn">
          <text>立即使用</text>
          <text class="u-iconfont" style="font-size: 24rpx; color: #fff;">&#xe62a;</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getTemplateList } from '../../api/index.js'

const templates = ref([])
const loading = ref(false)

// 加载模板列表
async function loadTemplates() {
  loading.value = true
  try {
    const res = await getTemplateList()
    // 处理模板数据，计算珠子数量和价格
    templates.value = res.map(item => ({
      ...item,
      beadCount: item.beads ? item.beads.length : 0,
      price: item.beads ? item.beads.reduce((sum, b) => sum + Number(b.price || 0), 0).toFixed(2) : '0.00'
    }))
  } catch (e) {
    console.error('加载模板列表失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 使用模板
function useTemplate(template) {
  // 将模板数据存储到本地
  uni.setStorageSync('diy_template_data', {
    beads: template.beads || [],
    size: template.size || 16,
    fromTemplate: true,
    templateName: template.name
  })

  // 跳转到制作台
  uni.switchTab({
    url: '/pages/design/index',
    success: () => {
      // 发送事件通知制作台加载模板
      uni.$emit('loadTemplateData')
    }
  })
}

onShow(() => {
  loadTemplates()
})
</script>

<style scoped>
/* uView Plus 字体图标 */
.u-iconfont {
  font-family: "uicon-iconfont";
  text-decoration: none;
  text-align: center;
}

.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FAF7F2 0%, #FFFFFF 100%);
  padding: 24rpx;
}

/* 头部 */
.header {
  padding: 40rpx 0;
  text-align: center;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #4A4A4A;
  display: block;
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #9A8B7A;
}

/* 加载状态 */
.loading-state {
  padding: 200rpx 0;
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: #9A8B7A;
}

/* 空状态 */
.empty-state {
  padding: 200rpx 0;
  text-align: center;
}

.empty-icon {
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #4A4A4A;
  display: block;
  margin-bottom: 12rpx;
}

.empty-subtext {
  font-size: 26rpx;
  color: #9A8B7A;
}

/* 模板网格 */
.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.template-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.template-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
}

.card-image {
  width: 100%;
  height: 240rpx;
  background: #F5F0E8;
  position: relative;
}

.thumbnail {
  width: 100%;
  height: 100%;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  padding: 24rpx;
}

.template-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #4A4A4A;
  display: block;
  margin-bottom: 8rpx;
}

.template-desc {
  font-size: 24rpx;
  color: #9A8B7A;
  display: block;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bead-count {
  font-size: 24rpx;
  color: #9A8B7A;
}

.template-price {
  font-size: 32rpx;
  font-weight: 700;
  color: #D4B48C;
}

.use-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
  padding: 20rpx;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}
</style>
