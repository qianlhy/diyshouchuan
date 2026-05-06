<template>
  <view class="page">
    <!-- 编辑资料卡片 -->
    <view class="edit-card">
      <view class="form-item">
        <text class="label">头像</text>
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image class="avatar" :src="form.avatarUrl || '/static/tabbar/mine.png'" mode="aspectFill" />
          <text class="tip">点击更换</text>
        </button>
      </view>

      <view class="form-item">
        <text class="label">昵称</text>
        <input
          class="nickname-input"
          type="nickname"
          v-model="form.nickName"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <button class="save-btn" @click="handleSave">保存</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserInfo, saveLoginInfo } from '../../utils/auth.js'

const form = ref({
  nickName: '',
  avatarUrl: ''
})

onLoad(() => {
  const user = getUserInfo()
  if (user) {
    form.value.nickName = user.nickName || ''
    form.value.avatarUrl = user.avatarUrl || ''
  }
})

function onChooseAvatar(e) {
  const { avatarUrl } = e.detail
  if (avatarUrl) {
    form.value.avatarUrl = avatarUrl
  }
}

function handleSave() {
  if (!form.value.nickName.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  // 更新本地用户信息
  const user = getUserInfo()
  if (user) {
    saveLoginInfo(user.token || '', {
      ...user,
      nickName: form.value.nickName,
      avatarUrl: form.value.avatarUrl
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9F6F2;
  padding: 30rpx;
}

.edit-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 40rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    display: block;
    font-size: 28rpx;
    color: #4A3728;
    margin-bottom: 20rpx;
    font-weight: 500;
  }
}

.avatar-btn {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f5f0ec;
  border-radius: 16rpx;
  
  &::after {
    border: none;
  }
  
  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    border: 2rpx solid #e8e0d5;
  }
  
  .tip {
    font-size: 28rpx;
    color: #9a8b7a;
  }
}

.nickname-input {
  height: 90rpx;
  padding: 0 24rpx;
  background: #f5f0ec;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #4A3728;
}

.save-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: #D4B48C;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 16rpx;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.9;
  }
}
</style>
