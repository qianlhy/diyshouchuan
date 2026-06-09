<template>
  <view class="page">
    <!-- 顶部返回栏 -->
    <view class="header-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="header-title">模板详情</text>
      <view class="header-right"></view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 模板详情内容 -->
    <view v-else-if="templateData" class="content">
      <!-- 模板大图 -->
      <view class="image-section">
        <swiper
          v-if="templateData.images && templateData.images.length > 0"
          class="image-swiper"
          circular
          :indicator-dots="true"
          :autoplay="true"
          :interval="4000"
          indicator-active-color="#D4B48C"
          indicator-color="rgba(255,255,255,0.6)"
        >
          <swiper-item v-for="(img, index) in templateData.images" :key="index">
            <image class="template-image" :src="img" mode="aspectFill" @click="previewImage(img)" />
          </swiper-item>
        </swiper>
        <image
          v-else-if="templateData.thumbnail"
          class="template-image"
          :src="templateData.thumbnail"
          mode="aspectFill"
          @click="previewImage(templateData.thumbnail)"
        />
        <view v-else class="image-placeholder">
          <text class="u-iconfont" style="font-size: 120rpx; color: #D4B48C;">&#xe617;</text>
        </view>
      </view>

      <!-- 模板信息 -->
      <view class="info-section">
        <view class="info-header">
          <view class="info-left">
            <text class="template-name">{{ templateData.name }}</text>
            <view class="author-row">
              <text class="author-label">作者</text>
              <text class="author-name">@{{ templateData.authorName || '拾光手串' }}</text>
            </view>
            <text class="usage-count">{{ templateData.usageCount || 0 }}人使用过</text>
          </view>
          <view class="info-right">
            <image
              v-if="templateData.thumbnail"
              class="small-preview"
              :src="templateData.thumbnail"
              mode="aspectFill"
            />
            <view v-else class="small-preview placeholder">
              <text class="u-iconfont" style="font-size: 48rpx; color: #D4B48C;">&#xe617;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 设计构成 -->
      <view class="composition-section">
        <view class="section-title">
          <text class="title-text">设计构成</text>
        </view>
        <view class="composition-table">
          <view class="table-header">
            <text class="col-name">材料名称</text>
            <text class="col-price">单价</text>
            <text class="col-count">数量</text>
            <text class="col-total">金额</text>
          </view>
          <view class="table-body">
            <view
              v-for="(bead, index) in beadList"
              :key="index"
              class="table-row"
            >
              <text class="col-name">{{ bead.name }}</text>
              <text class="col-price">{{ bead.price }}</text>
              <text class="col-count">{{ bead.count }}</text>
              <text class="col-total">{{ bead.total }}</text>
            </view>
          </view>
          <view class="table-footer">
            <text class="footer-label">合计：</text>
            <text class="footer-total">¥{{ totalPrice }}</text>
          </view>
        </view>
      </view>

      <!-- 提示文字 -->
      <view class="tips-section">
        <text class="tips-text">点击右下角"使用该设计"，基于此设计开始创作！</text>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer"></view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="error-state">
      <text class="u-iconfont" style="font-size: 100rpx; color: #ccc;">&#xe617;</text>
      <text class="error-text">模板加载失败</text>
      <text class="retry-btn" @click="loadTemplateDetail">重新加载</text>
    </view>

    <!-- 底部按钮 -->
    <view v-if="templateData" class="bottom-bar">
      <button class="use-design-btn" @click="useTemplate">
        <text class="btn-text">使用该设计</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { resolveImageUrl } from '../../utils/imageHelper.js'

const templateData = ref(null)
const loading = ref(false)

// 计算珠子列表（按名称分组统计）
const beadList = computed(() => {
  if (!templateData.value || !templateData.value.beads) return []
  
  const beads = templateData.value.beads
  // 按名称分组统计
  const groupMap = {}
  beads.forEach(bead => {
    const key = `${bead.title || bead.name || '未知材料'}${bead.size ? bead.size + 'mm' : ''}`
    if (!groupMap[key]) {
      groupMap[key] = {
        name: key,
        price: (Number(bead.price) || 0).toFixed(0),
        count: 0,
        total: 0
      }
    }
    groupMap[key].count += 1
    groupMap[key].total += Number(bead.price) || 0
  })
  
  return Object.values(groupMap).map(item => ({
    ...item,
    total: item.total.toFixed(1)
  }))
})

// 计算总价
const totalPrice = computed(() => {
  if (!templateData.value || !templateData.value.beads) return '0.00'
  const total = templateData.value.beads.reduce((sum, b) => sum + Number(b.price || 0), 0)
  return total.toFixed(0)
})

// 加载模板详情
async function loadTemplateDetail() {
  const templateId = uni.getStorageSync('current_template_id')
  if (!templateId) {
    uni.showToast({ title: '模板信息不存在', icon: 'none' })
    setTimeout(() => goBack(), 1500)
    return
  }

  loading.value = true
  try {
    // 从存储中获取模板数据
    const cachedTemplates = uni.getStorageSync('template_list_cache') || []
    const template = cachedTemplates.find(t => t.id === templateId)
    
    if (template) {
      templateData.value = {
        ...template,
        thumbnail: resolveImageUrl(template.thumbnail),
        images: template.images ? template.images.map(resolveImageUrl) : []
      }
    } else {
      // 如果缓存中没有，显示默认数据
      templateData.value = uni.getStorageSync('current_template_data')
    }
  } catch (e) {
    console.error('加载模板详情失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 预览图片
function previewImage(url) {
  const urls = templateData.value.images && templateData.value.images.length > 0
    ? templateData.value.images
    : [url]
  uni.previewImage({
    current: url,
    urls: urls
  })
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 使用该模板
function useTemplate() {
  if (!templateData.value) return

  // 将模板数据存储到本地
  uni.setStorageSync('diy_template_data', {
    beads: templateData.value.beads || [],
    size: templateData.value.size || 16,
    fromTemplate: true,
    templateName: templateData.value.name
  })

  // 跳转到制作台
  uni.switchTab({
    url: '/pages/design/index',
    success: () => {
      uni.$emit('loadTemplateData')
    }
  })
}

onLoad(() => {
  loadTemplateDetail()
})
</script>

<style lang="scss">
@import '@/static/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $bg-primary;
}

/* 顶部导航栏 */
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid rgba(0,0,0,0.05);
  
  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .back-arrow {
      font-size: 48rpx;
      color: #333;
      font-weight: 300;
    }
  }
  
  .header-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
  }
  
  .header-right {
    width: 60rpx;
  }
}

/* 图片区域 */
.image-section {
  width: 100%;
  height: 500rpx;
  background: #f5f5f5;
  
  .image-swiper {
    width: 100%;
    height: 100%;
  }
  
  .template-image {
    width: 100%;
    height: 100%;
  }
  
  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #F9F3EC 0%, #F5F0EC 100%);
  }
}

/* 信息区域 */
.info-section {
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
  
  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .info-left {
    flex: 1;
    
    .template-name {
      font-size: 36rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 16rpx;
      display: block;
    }
    
    .author-row {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      
      .author-label {
        font-size: 24rpx;
        color: $text-tertiary;
        margin-right: 8rpx;
      }
      
      .author-name {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
    
    .usage-count {
      font-size: 24rpx;
      color: $primary;
      font-weight: 500;
    }
  }
  
  .info-right {
    margin-left: 20rpx;
    
    .small-preview {
      width: 140rpx;
      height: 140rpx;
      border-radius: 12rpx;
      overflow: hidden;
      background: #f5f5f5;
      
      &.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #F9F3EC 0%, #F5F0EC 100%);
      }
    }
  }
}

/* 设计构成 */
.composition-section {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
  
  .section-title {
    margin-bottom: 24rpx;
    
    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
      position: relative;
      padding-left: 20rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6rpx;
        height: 28rpx;
        background: $primary;
        border-radius: 3rpx;
      }
    }
  }
  
  .composition-table {
    border-radius: 16rpx;
    overflow: hidden;
    background: #F9F7F4;
    
    .table-header {
      display: flex;
      padding: 24rpx 20rpx;
      background: rgba(201, 168, 108, 0.1);
      
      text {
        font-size: 24rpx;
        color: $text-secondary;
        font-weight: 500;
      }
    }
    
    .table-row {
      display: flex;
      padding: 24rpx 20rpx;
      border-bottom: 1rpx solid rgba(0,0,0,0.03);
      
      &:last-child {
        border-bottom: none;
      }
      
      text {
        font-size: 26rpx;
        color: $text-primary;
      }
    }
    
    .col-name {
      flex: 2.5;
      text-align: left;
    }
    
    .col-price, .col-count {
      flex: 1;
      text-align: center;
    }
    
    .col-total {
      flex: 1;
      text-align: right;
    }
    
    .table-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 24rpx 20rpx;
      background: rgba(201, 168, 108, 0.05);
      border-top: 1rpx solid rgba(201, 168, 108, 0.1);
      
      .footer-label {
        font-size: 26rpx;
        color: $text-secondary;
        margin-right: 12rpx;
      }
      
      .footer-total {
        font-size: 32rpx;
        font-weight: 600;
        color: $primary;
      }
    }
  }
}

/* 提示区域 */
.tips-section {
  padding: 20rpx 30rpx;
  text-align: center;
  
  .tips-text {
    font-size: 24rpx;
    color: $text-tertiary;
  }
}

.bottom-spacer {
  height: 140rpx;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid rgba(0,0,0,0.05);
  
  .use-design-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, $primary 0%, #B48C5C 100%);
    border-radius: 44rpx;
    border: none;
    
    .btn-text {
      font-size: 30rpx;
      color: #fff;
      font-weight: 600;
    }
    
    &:active {
      opacity: 0.9;
    }
  }
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  
  .loading-text {
    font-size: 28rpx;
    color: $text-tertiary;
  }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
  
  .error-text {
    font-size: 28rpx;
    color: $text-secondary;
    margin-top: 20rpx;
    margin-bottom: 40rpx;
  }
  
  .retry-btn {
    padding: 16rpx 48rpx;
    background: $primary;
    color: #fff;
    font-size: 28rpx;
    border-radius: 32rpx;
  }
}

.u-iconfont {
  font-family: "uicon-iconfont";
  text-decoration: none;
  text-align: center;
}
</style>
