<template>
  <view class="page">
    <!-- 顶部搜索栏 -->
    <view class="top-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="search-header">
      <view class="search-box" @click="goProductList">
        <view class="search-icon">
          <text class="u-iconfont" style="font-size: 30rpx; color: #9a8b7a;">&#xe62a;</text>
        </view>
        <text class="search-placeholder">搜索手串、材质、风格</text>
      </view>
      <view class="msg-btn" @click="goMessage">
        <text class="u-iconfont" style="font-size: 40rpx; color: #4A3728;">&#xe615;</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        circular
        :indicator-dots="true"
        :autoplay="true"
        :interval="4000"
        :duration="500"
        indicator-active-color="#D4B48C"
        indicator-color="rgba(255,255,255,0.6)"
      >
        <swiper-item v-for="(item, index) in banners" :key="item.id || index">
          <image
            class="banner-image"
            :src="item.imageUrl"
            mode="aspectFill"
            @click="onBannerClick(item)"
          ></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷分类入口 -->
    <view class="category-grid">
      <view class="category-item" @click="goDesign">
        <view class="cat-icon-wrap" style="background: #F9F3EC;">
          <text class="u-iconfont" style="font-size: 44rpx; color: #D4B48C;">&#xe673;</text>
        </view>
        <text class="cat-label">DIY定制</text>
      </view>
      <view class="category-item" @click="goProductList">
        <view class="cat-icon-wrap" style="background: #F5F0EC;">
          <text class="u-iconfont" style="font-size: 44rpx; color: #8B6E4E;">&#xe617;</text>
        </view>
        <text class="cat-label">成品选购</text>
      </view>
      <view class="category-item" @click="goTemplateList">
        <view class="cat-icon-wrap" style="background: #F5F0E8;">
          <text class="u-iconfont" style="font-size: 44rpx; color: #C9A86C;">&#xe669;</text>
        </view>
        <text class="cat-label">模板中心</text>
      </view>
      <view class="category-item" @click="goOrderList">
        <view class="cat-icon-wrap" style="background: #EDF5EE;">
          <text class="u-iconfont" style="font-size: 44rpx; color: #7AB88A;">&#xe690;</text>
        </view>
        <text class="cat-label">我的订单</text>
      </view>
    </view>

    <!-- 热门模板 -->
    <view class="template-section">
      <view class="section-header">
        <view class="header-left">
          <text class="section-icon">&#xe673;</text>
          <text class="section-title">创意广场</text>
        </view>
        <view class="header-right" @click="goTemplateList">
          <text class="more-text">查看更多</text>
          <text class="u-iconfont" style="font-size: 24rpx; color: #999;">&#xe62a;</text>
        </view>
      </view>
      <view v-if="templateLoading" class="template-loading">加载中...</view>
      <view v-else-if="templates.length === 0" class="template-empty">暂无模板</view>
      <scroll-view v-else scroll-x class="template-scroll" show-scrollbar="false">
        <view class="template-list">
          <view
            v-for="template in templates.slice(0, 5)"
            :key="template.id"
            class="template-item"
            @click="useTemplate(template)"
          >
            <image
              v-if="template.thumbnail"
              :src="template.thumbnail"
              class="template-thumb"
              mode="aspectFill"
            />
            <view v-else class="template-thumb placeholder">
              <text class="u-iconfont" style="font-size: 40rpx; color: #D4B48C;">&#xe617;</text>
            </view>
            <text class="template-name">{{ template.name }}</text>
            <text class="template-count">{{ template.beadCount || 0 }}颗珠子</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部Slogan -->
    <view class="footer-slogan">
      <view class="slogan-line"></view>
      <text class="slogan-text">拾光手串 · 匠心定制</text>
      <view class="slogan-line"></view>
    </view>

    <!-- 完善资料弹窗 -->
    <view v-if="showEditProfile" class="overlay" @click.self="showEditProfile = false">
      <view class="edit-popup">
        <view class="popup-header">
          <text class="popup-title">完善个人资料</text>
          <text class="popup-close" @click="showEditProfile = false">✕</text>
        </view>

        <view class="form-item">
          <text class="form-label">头像</text>
          <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="avatar-preview" :src="tempAvatarUrl || '/static/tabbar/mine.png'" mode="aspectFill"></image>
            <text class="avatar-tip">点击更换头像</text>
          </button>
        </view>

        <view class="form-item">
          <text class="form-label">昵称</text>
          <input type="nickname" class="nickname-input" v-model="tempNickname" placeholder="请输入昵称" @blur="onNicknameBlur" />
        </view>

        <view class="agreement-row" @click="toggleAgreement">
          <view class="checkbox" :class="{ checked: agreedPrivacy }">
            <text v-if="agreedPrivacy" class="check-icon">✓</text>
          </view>
          <view class="agreement-text">
            <text>我已阅读并同意</text>
            <text class="link" @click.stop="showPrivacy">《隐私政策》</text>
            <text>和</text>
            <text class="link" @click.stop="showTerms">《用户服务协议》</text>
          </view>
        </view>

        <button class="confirm-btn" :class="{ disabled: !agreedPrivacy }" @click="confirmLogin">确认登录</button>
        <text class="skip-btn" @click="skipLogin">跳过，使用默认</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { getBannerList, getTemplateList, loginWithWeixinCode, userGet, userSet } from '../../api/index.js'
import { resolveImageUrl } from '../../utils/imageHelper.js'

const statusBarHeight = ref(20)
const banners = ref([])
const user = ref(null)
const templates = ref([])
const templateLoading = ref(false)

const showEditProfile = ref(false)
const tempAvatarUrl = ref('')
const tempNickname = ref('')
const agreedPrivacy = ref(false)

const toggleAgreement = () => {
  agreedPrivacy.value = !agreedPrivacy.value
}

const showPrivacy = () => {
  uni.navigateTo({ url: '/pages/privacy/index' })
}

const showTerms = () => {
  uni.navigateTo({ url: '/pages/terms/index' })
}

const getStatusBarHeight = () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
}

const loadBanners = async () => {
  try {
    const list = await getBannerList()
    if (Array.isArray(list)) {
      banners.value = list.map(item => {
        let imageUrl = item.imageUrl || ''
        imageUrl = resolveImageUrl(imageUrl)
        return { ...item, imageUrl }
      })
    }
  } catch (e) {
    console.error('获取轮播图失败', e)
  }
}

// 加载模板列表
const loadTemplates = async () => {
  templateLoading.value = true
  try {
    const res = await getTemplateList()
    templates.value = res.map(item => ({
      ...item,
      beadCount: item.beads ? item.beads.length : 0
    }))
  } catch (e) {
    console.error('加载模板列表失败:', e)
  } finally {
    templateLoading.value = false
  }
}

// 查看模板详情
const useTemplate = (template) => {
  // 存储当前选中的模板信息
  uni.setStorageSync('current_template_id', template.id)
  uni.setStorageSync('current_template_data', template)
  uni.setStorageSync('template_list_cache', templates.value)
  
  // 跳转到模板详情页
  uni.navigateTo({
    url: '/pages/template/detail'
  })
}

const checkLogin = () => {
  user.value = userGet()
}

const handleUserClick = () => {
  if (!user.value) {
    showEditProfile.value = true
    tempNickname.value = '微信用户'
    tempAvatarUrl.value = ''
  }
}

const onChooseAvatar = (e) => {
  const { avatarUrl } = e.detail
  tempAvatarUrl.value = avatarUrl
}

const onNicknameBlur = (e) => {
  tempNickname.value = e.detail.value
}

const confirmLogin = () => {
  if (!agreedPrivacy.value) {
    uni.showToast({ title: '请先阅读并勾选同意协议', icon: 'none' })
    return
  }
  const userInfo = {
    nickName: tempNickname.value || '微信用户',
    avatarUrl: tempAvatarUrl.value || ''
  }
  performLogin(userInfo)
}

const skipLogin = () => {
  if (!agreedPrivacy.value) {
    uni.showToast({ title: '请先阅读并勾选同意协议', icon: 'none' })
    return
  }
  const userInfo = { nickName: '微信用户', avatarUrl: '' }
  performLogin(userInfo)
}

const performLogin = (userInfo) => {
  userSet(userInfo)
  user.value = userInfo
  showEditProfile.value = false
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
       if (loginRes.code) {
         try {
           await loginWithWeixinCode(loginRes.code, userInfo)
         } catch(e) {
           console.error('后端登录失败', e)
         }
       }
    }
  })
}

const onBannerClick = (item, index) => {
  // 先预览大图
  const urls = banners.value.map(b => b.imageUrl).filter(Boolean)
  if (urls.length > 0) {
    uni.previewImage({
      current: item.imageUrl,
      urls: urls,
      success: () => {
        // 预览关闭后，如果有链接则跳转
        if (item.link) {
          setTimeout(() => {
            const tabbarPages = ['/pages/index/index', '/pages/design/index', '/pages/cart/index', '/pages/mine/index']
            if (tabbarPages.includes(item.link)) {
              uni.switchTab({ url: item.link })
            } else {
              uni.navigateTo({ url: item.link })
            }
          }, 300)
        }
      }
    })
  }
}

const goDesign = () => uni.switchTab({ url: '/pages/design/index' })
const goProductList = () => uni.navigateTo({ url: '/pages/product/list' })
const goTemplateList = () => uni.navigateTo({ url: '/pages/template/list' })
const goOrderList = () => uni.navigateTo({ url: '/pages/order/list' })
const goAbout = () => uni.navigateTo({ url: '/pages/about/index' })
const goMessage = () => uni.showToast({ title: '暂无消息', icon: 'none' })

onShow(() => {
  checkLogin()
  setTimeout(() => checkLogin(), 1000)
  setTimeout(() => checkLogin(), 2000)
})

onMounted(() => {
  getStatusBarHeight()
  loadBanners()
  loadTemplates()
  checkLogin()
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
  padding-bottom: 180rpx;
}

/* ========== 顶部搜索栏 ========== */
.top-bar {
  width: 100%;
  background: $bg-primary;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 0 $space-md $space-sm;
  gap: $space-sm;
  background: $bg-primary;
}

.search-box {
  flex: 1;
  height: 72rpx;
  background: #ffffff;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 $space-md;
  gap: $space-sm;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.05);
  border: 1rpx solid #e8e0d5;
}

.search-icon {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-placeholder {
  font-size: $text-sm;
  color: #9a8b7a;
  flex: 1;
}

.msg-btn {
  width: 72rpx;
  height: 72rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.05);
  border: 1rpx solid #e8e0d5;
}

/* ========== 轮播图 ========== */
.banner-section {
  padding: 0 $space-md;
  margin-bottom: $space-lg;

  swiper {
    height: 320rpx;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(74, 55, 40, 0.08);

    .banner-image { width: 100%; height: 100%; }
  }
}

/* ========== 快捷分类 ========== */
.category-grid {
  display: flex;
  padding: 0 $space-md;
  margin-bottom: $space-lg;
  gap: $space-md;
}

.category-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-xs;

  &:active { opacity: 0.7; }
}

.cat-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}

.cat-label {
  font-size: $text-xs;
  color: $text-secondary;
  font-weight: $font-medium;
}

/* ========== 分隔标题 ========== */
.section-header {
  display: flex;
  align-items: center;
  padding: 0 $space-md;
  margin-bottom: $space-md;
  gap: $space-md;
}

.section-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #e8e0d5, transparent);
}

.section-title {
  font-size: $text-sm;
  color: $text-tertiary;
  letter-spacing: 4rpx;
  white-space: nowrap;
  font-weight: $font-medium;
}

/* ========== 商品列表 ========== */
.product-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-md;
  padding: 0 $space-md;
  margin-bottom: $space-xl;
}

.product-card {
  background: #ffffff;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(74, 55, 40, 0.05);
  border: 1rpx solid #e8e0d5;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 4rpx 16rpx rgba(74, 55, 40, 0.1);
  }
}

.product-img-wrap {
  position: relative;
  width: 100%;
  height: 280rpx;
  overflow: hidden;
  background: $bg-secondary;
}

.product-img {
  width: 100%;
  height: 100%;
}

.product-tag {
  position: absolute;
  top: $space-xs;
  left: $space-xs;
  background: #D4B48C;
  color: #ffffff;
  font-size: 18rpx;
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
  font-weight: $font-semibold;
}

.product-info {
  padding: $space-sm;
}

.product-name {
  font-size: $text-sm;
  color: $text-primary;
  font-weight: $font-semibold;
  margin-bottom: 4rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.product-price {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.price-symbol {
  font-size: $text-xs;
  color: #D4B48C;
  font-weight: $font-semibold;
}

.price-num {
  font-size: $text-base;
  color: #D4B48C;
  font-weight: $font-bold;
}

.price-orig {
  font-size: $text-xs;
  color: $text-tertiary;
  text-decoration: line-through;
  margin-left: 6rpx;
}

.buy-btn {
  background: #D4B48C;
  color: #ffffff;
  font-size: $text-xs;
  font-weight: $font-semibold;
  padding: 6rpx 18rpx;
  border-radius: $radius-full;
}

/* ========== 热门模板 ========== */
.template-section {
  margin: $space-lg $space-md;
  background: #fff;
  border-radius: $radius-lg;
  padding: $space-md;
}

.template-section .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-md;
}

.template-section .header-left {
  display: flex;
  align-items: center;
  gap: $space-xs;
}

.template-section .section-icon {
  font-family: "uicon-iconfont";
  font-size: 32rpx;
  color: #D4B48C;
}

.template-section .section-title {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.template-section .header-right {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.template-section .more-text {
  font-size: $text-sm;
  color: $text-secondary;
}

.template-loading,
.template-empty {
  text-align: center;
  padding: $space-lg 0;
  font-size: $text-sm;
  color: $text-secondary;
}

.template-scroll {
  white-space: nowrap;
}

.template-list {
  display: flex;
  flex-direction: row;
  gap: $space-md;
  padding: 4rpx;
}

.template-item {
  flex-shrink: 0;
  width: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-thumb {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  background: #f5f0ec;
}

.template-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-item .template-name {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $text-primary;
  margin-top: $space-sm;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-item .template-count {
  font-size: $text-xs;
  color: $text-secondary;
  margin-top: 4rpx;
}

/* ========== 底部Slogan ========== */
.footer-slogan {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-lg 0 $space-xl;
  gap: $space-md;
}

.slogan-line {
  width: 60rpx;
  height: 1rpx;
  background: #e8e0d5;
}

.slogan-text {
  font-size: $text-xs;
  color: $text-tertiary;
  letter-spacing: 4rpx;
}

/* ========== 弹窗 ========== */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-popup {
  width: 620rpx;
  background-color: #fff;
  border-radius: $radius-xl;
  padding: $space-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.popup-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-xl;
}

.popup-title {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.popup-close {
  font-size: $text-lg;
  color: $text-tertiary;
  padding: 8rpx;
}

.form-item {
  width: 100%;
  margin-bottom: $space-lg;

  .form-label {
    font-size: $text-base;
    color: $text-secondary;
    margin-bottom: $space-md;
    display: block;
  }
}

.avatar-wrapper {
  width: 100%;
  height: 200rpx;
  background-color: $bg-secondary;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1rpx dashed #e8e0d5;

  &::after { border: none; }

  .avatar-preview {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-bottom: $space-sm;
  }

  .avatar-tip { font-size: $text-xs; color: $text-tertiary; }
}

.nickname-input {
  width: 100%;
  height: 88rpx;
  background-color: $bg-secondary;
  border-radius: $radius-lg;
  padding: 0 $space-lg;
  font-size: $text-base;
  box-sizing: border-box;
}

.agreement-row {
  width: 100%;
  display: flex;
  align-items: flex-start;
  margin-top: $space-md;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #D4B48C;
  border-radius: 6rpx;
  margin-right: 16rpx;
  margin-top: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #fff;

  &.checked {
    background: #D4B48C;
    border-color: #D4B48C;
  }
}

.check-icon {
  font-size: 22rpx;
  color: #fff;
  line-height: 1;
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #9a8b7a;
  line-height: 1.8;

  .link {
    color: #D4B48C;
  }
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #E8D5B8, #D4B48C);
  color: #ffffff;
  font-size: $text-base;
  font-weight: $font-medium;
  border-radius: $radius-full;
  margin-top: $space-md;
  box-shadow: 0 4rpx 16rpx rgba(212, 180, 140, 0.25);

  &::after { border: none; }

  &.disabled {
    background: #e8ddd0;
    box-shadow: none;
  }
}

.skip-btn {
  font-size: $text-sm;
  color: $text-tertiary;
  padding: $space-md;
}
</style>
