<template>
  <view class="page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">模板管理</text>
      <view class="add-btn" @click="showAddDialog">
        <text class="u-iconfont" style="font-size: 32rpx; color: #fff;">&#xe62d;</text>
        <text>添加模板</text>
      </view>
    </view>

    <!-- 模板列表 -->
    <view v-if="loading" class="loading">加载中...</view>
    
    <view v-else-if="templates.length === 0" class="empty">
      <text class="u-iconfont" style="font-size: 80rpx; color: #D4B48C;">&#xe673;</text>
      <text>暂无模板</text>
    </view>

    <view v-else class="template-list">
      <view v-for="template in templates" :key="template.id" class="template-item">
        <image v-if="template.thumbnail" :src="template.thumbnail" class="thumb" mode="aspectFill" />
        <view v-else class="thumb placeholder">
          <text class="u-iconfont" style="font-size: 48rpx; color: #ccc;">&#xe617;</text>
        </view>
        <view class="info">
          <text class="name">{{ template.name }}</text>
          <text class="desc">{{ template.description || '暂无描述' }}</text>
          <view class="meta">
            <text>{{ template.beadCount || 0 }}颗珠子</text>
            <text>手围{{ template.size || 16 }}cm</text>
          </view>
        </view>
        <view class="actions">
          <text class="delete-btn" @click="deleteTemplate(template.id)">删除</text>
        </view>
      </view>
    </view>

    <!-- 添加模板弹窗 -->
    <view v-if="showDialog" class="dialog-mask" @click="showDialog = false">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加模板</text>
          <text class="u-iconfont dialog-close" style="font-size: 32rpx; color: #999;" @click="showDialog = false">&#xe685;</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="label">模板名称</text>
            <input class="input" v-model="form.name" placeholder="请输入模板名称" />
          </view>
          <view class="form-item">
            <text class="label">模板描述</text>
            <input class="input" v-model="form.description" placeholder="请输入模板描述" />
          </view>
          <view class="form-item">
            <text class="label">缩略图URL</text>
            <input class="input" v-model="form.thumbnail" placeholder="请输入图片URL" />
          </view>
          <view class="form-item">
            <text class="label">手围大小(cm)</text>
            <input class="input" type="number" v-model="form.size" placeholder="默认16" />
          </view>
          <view class="form-item">
            <text class="label">珠子数据(JSON)</text>
            <textarea class="textarea" v-model="form.beadsJson" placeholder='请输入JSON格式的珠子数据，如：[{productId:1,title:珠子1,price:10,size:8,color:#ff0000,imageUrl:url}]' />
          </view>
        </view>
        <view class="dialog-footer">
          <button class="cancel-btn" @click="showDialog = false">取消</button>
          <button class="confirm-btn" @click="addTemplate">确认添加</button>
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
const showDialog = ref(false)
const form = ref({
  name: '',
  description: '',
  thumbnail: '',
  size: 16,
  beadsJson: ''
})

// 加载模板列表
async function loadTemplates() {
  loading.value = true
  try {
    const res = await getTemplateList()
    templates.value = res.map(item => ({
      ...item,
      beadCount: item.beads ? item.beads.length : 0
    }))
  } catch (e) {
    console.error('加载模板列表失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 显示添加弹窗
function showAddDialog() {
  form.value = {
    name: '',
    description: '',
    thumbnail: '',
    size: 16,
    beadsJson: ''
  }
  showDialog.value = true
}

// 添加模板
async function addTemplate() {
  if (!form.value.name) {
    uni.showToast({ title: '请输入模板名称', icon: 'none' })
    return
  }

  let beads = []
  try {
    if (form.value.beadsJson) {
      beads = JSON.parse(form.value.beadsJson)
    }
  } catch (e) {
    uni.showToast({ title: '珠子数据JSON格式错误', icon: 'none' })
    return
  }

  const templateData = {
    name: form.value.name,
    description: form.value.description,
    thumbnail: form.value.thumbnail,
    size: Number(form.value.size) || 16,
    beads: beads
  }

  try {
    // TODO: 调用后端API添加模板
    // await addTemplate(templateData)
    
    // 临时存储到本地，实际应该调用后端API
    const stored = uni.getStorageSync('diy_templates') || []
    stored.push({
      id: Date.now(),
      ...templateData
    })
    uni.setStorageSync('diy_templates', stored)
    
    uni.showToast({ title: '添加成功', icon: 'success' })
    showDialog.value = false
    loadTemplates()
  } catch (e) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

// 删除模板
async function deleteTemplate(id) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个模板吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 调用后端API删除模板
        const stored = uni.getStorageSync('diy_templates') || []
        const filtered = stored.filter(t => t.id !== id)
        uni.setStorageSync('diy_templates', filtered)
        uni.showToast({ title: '删除成功', icon: 'success' })
        loadTemplates()
      }
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
  background: #f5f5f5;
  padding: 24rpx;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.add-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #fff;
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

/* 加载和空状态 */
.loading, .empty {
  text-align: center;
  padding: 200rpx 0;
  color: #999;
}

/* 模板列表 */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.template-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: flex;
  gap: 24rpx;
  font-size: 24rpx;
  color: #666;
}

.actions {
  display: flex;
  align-items: center;
}

.delete-btn {
  color: #ff4d4f;
  font-size: 26rpx;
  padding: 8rpx 16rpx;
}

/* 弹窗 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.dialog-body {
  padding: 32rpx;
  max-height: 600rpx;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.input {
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.textarea {
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.dialog-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  text-align: center;
  border: none;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #fff;
}
</style>
