<template>
  <view class="page">
    <!-- 搜索区域 - 仅在没有传入单号时显示 -->
    <view class="search-box" v-if="!isFromOrder">
      <view class="search-input-wrapper">
        <input
          class="search-input"
          v-model="trackingNumber"
          placeholder="请输入快递单号"
          confirm-type="search"
          @confirm="queryKuaidiInfo"
        />
        <view class="clear-btn" v-if="trackingNumber" @click="clearInput">
          <text class="clear-icon">×</text>
        </view>
      </view>
      <button class="search-btn" @click="queryKuaidiInfo" :disabled="loading">
        <text v-if="!loading">查询</text>
        <text v-else>查询中...</text>
      </button>
    </view>

    <!-- 快递公司选择 - 仅在没有传入单号时显示 -->
    <view class="company-section" v-if="!isFromOrder && companiesList.length > 0">
      <view class="section-title">选择快递公司（可选）</view>
      <scroll-view class="company-list" scroll-x>
        <view
          class="company-item"
          v-for="item in companiesList"
          :key="item.code"
          :class="{ active: selectedCompany === item.code }"
          @click="selectCompany(item.code)"
        >
          <text class="company-name">{{ item.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 查询结果 -->
    <view class="result-section" v-if="kuaidiInfo">
      <!-- 快递状态卡片 -->
      <view class="status-card">
        <view class="status-header">
          <view class="status-icon" :class="statusClass">
            <text class="icon-text">{{ statusIcon }}</text>
          </view>
          <view class="status-info">
            <text class="status-text">{{ kuaidiInfo.stateDesc || '查询中' }}</text>
            <text class="company-text">{{ companyName }} {{ trackingNumber }}</text>
          </view>
        </view>
      </view>

      <!-- 物流轨迹 -->
      <view class="timeline-section">
        <view class="section-title">物流轨迹</view>
        <view class="timeline">
          <view
            class="timeline-item"
            v-for="(item, index) in kuaidiInfo.data"
            :key="index"
            :class="{ first: index === 0 }"
          >
            <view class="timeline-left">
              <text class="time-date">{{ formatDate(item.time) }}</text>
              <text class="time-hour">{{ formatHour(item.time) }}</text>
            </view>
            <view class="timeline-line">
              <view class="timeline-dot" :class="{ active: index === 0 }"></view>
              <view class="timeline-connector" v-if="index !== kuaidiInfo.data.length - 1"></view>
            </view>
            <view class="timeline-content">
              <text class="timeline-text">{{ item.context }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!kuaidiInfo && !loading && !errorMsg">
      <view class="empty-icon-wrap">
        <uni-icons type="search" size="64" color="$text-tertiary"></uni-icons>
      </view>
      <text class="empty-text">输入快递单号查询物流信息</text>
    </view>

    <!-- 错误提示 -->
    <view class="error-state" v-if="errorMsg">
      <text class="error-text">{{ errorMsg }}</text>
    </view>
  </view>
</template>

<script setup>
import { getKuaidiCompanies, queryKuaidi } from '@/api/api.js'
import { onLoad } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'

// 响应式数据
const trackingNumber = ref('')
const phone = ref('')  // 收件人手机号
const loading = ref(false)
const kuaidiInfo = ref(null)
const errorMsg = ref('')
const companies = ref({})
const selectedCompany = ref('')
const isFromOrder = ref(false)  // 是否从订单页面跳转过来

// 页面加载时接收参数
onLoad((options) => {
  if (options && options.num) {
    trackingNumber.value = options.num
    phone.value = options.phone || ''  // 接收手机号
    isFromOrder.value = true  // 标记为从订单页面跳转
    // 自动查询
    queryKuaidiInfo()
  }
})

// 快递公司列表
const companiesList = computed(() => {
  return Object.entries(companies.value).map(([code, name]) => ({
    code,
    name
  }))
})

// 快递公司名称
const companyName = computed(() => {
  if (!kuaidiInfo.value) return ''
  const com = kuaidiInfo.value.com
  return companies.value[com] || com || '未知快递'
})

// 状态样式
const statusClass = computed(() => {
  if (!kuaidiInfo.value) return ''
  const state = parseInt(kuaidiInfo.value.state)
  switch (state) {
    case 0: return 'transit'
    case 1: return 'pickup'
    case 3: return 'signed'
    case 5: return 'delivering'
    case 4:
    case 6: return 'returned'
    default: return 'transit'
  }
})

// 状态图标
const statusIcon = computed(() => {
  if (!kuaidiInfo.value) return '?'
  const state = parseInt(kuaidiInfo.value.state)
  switch (state) {
    case 0: return '运'
    case 1: return '揽'
    case 3: return '签'
    case 5: return '派'
    case 4:
    case 6: return '退'
    default: return '?'
  }
})

// 查询快递信息
async function queryKuaidiInfo() {
  if (!trackingNumber.value.trim()) {
    uni.showToast({ title: '请输入快递单号', icon: 'none' })
    return
  }

  loading.value = true
  errorMsg.value = ''
  kuaidiInfo.value = null

  try {
    const result = await queryKuaidi(trackingNumber.value.trim(), selectedCompany.value, phone.value)
    console.log('快递查询结果:', result)
    
    if (result) {
      // 检查返回的数据是否有效
      if (result.message && result.message.includes('数据不完整')) {
        // 单号不存在或无效
        errorMsg.value = '未查询到该快递单号的物流信息，请检查单号是否正确'
      } else if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        // 有物流轨迹数据，正常显示
        kuaidiInfo.value = result
      } else if (result.message === 'ok') {
        // 查询成功但暂无物流轨迹
        errorMsg.value = '暂无物流信息，请稍后再试'
      } else {
        errorMsg.value = '未查询到物流信息'
      }
    } else {
      errorMsg.value = '未查询到物流信息'
    }
  } catch (e) {
    console.error('查询快递失败:', e)
    errorMsg.value = e.message || '查询失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 清空输入
function clearInput() {
  trackingNumber.value = ''
  kuaidiInfo.value = null
  errorMsg.value = ''
  selectedCompany.value = ''
}

// 选择快递公司
function selectCompany(code) {
  if (selectedCompany.value === code) {
    selectedCompany.value = ''
  } else {
    selectedCompany.value = code
  }
}

// 格式化日期
function formatDate(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化时间
function formatHour(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 加载快递公司列表
async function loadCompanies() {
  try {
    const res = await getKuaidiCompanies()
    if (res) {
      companies.value = res
    }
  } catch (e) {
    console.error('加载快递公司列表失败:', e)
  }
}

// 页面加载
onMounted(() => {
  loadCompanies()
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
  padding: $space-md;
  padding-bottom: 180rpx;
}

.search-box {
  display: flex;
  gap: $space-md;
  margin-bottom: $space-md;

  .search-input-wrapper {
    flex: 1;
    position: relative;
    background: $bg-card;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    border: 1rpx solid $border-light;

    .search-input {
      flex: 1;
      height: 80rpx;
      padding: 0 80rpx 0 $space-lg;
      font-size: $text-base;
      color: $text-primary;
    }

    .clear-btn {
      position: absolute;
      right: $space-md;
      top: 50%;
      transform: translateY(-50%);
      width: 40rpx;
      height: 40rpx;
      background: $bg-secondary;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .clear-icon {
        color: $text-tertiary;
        font-size: 28rpx;
        line-height: 1;
      }
    }
  }

  .search-btn {
    width: 140rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: $primary-gradient;
    color: $text-white;
    font-size: $text-base;
    font-weight: $font-semibold;
    border-radius: $radius-lg;
    margin: 0;
    padding: 0;
    border: none;
    box-shadow: 0 4rpx 16rpx rgba(212, 180, 140, 0.2);

    &::after { border: none; }
    &:disabled { opacity: 0.6; }
    &:active { opacity: 0.8; }
  }
}

.company-section {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $space-md;
  margin-bottom: $space-md;
  box-shadow: $shadow-sm;
  border: 1rpx solid $border-light;

  .section-title {
    font-size: $text-sm;
    font-weight: $font-bold;
    color: $text-secondary;
    margin-bottom: $space-md;
  }

  .company-list {
    white-space: nowrap;

    .company-item {
      display: inline-block;
      padding: $space-sm $space-md;
      margin-right: $space-sm;
      background: $bg-secondary;
      border-radius: $radius-full;
      border: 2rpx solid transparent;
      transition: all 0.2s;

      &.active {
        background: $primary-gradient-light;
        border-color: $primary-light;
      }

      .company-name {
        font-size: $text-xs;
        color: $text-secondary;
      }

      &.active .company-name {
        color: $primary;
        font-weight: $font-bold;
      }
    }
  }
}

.status-card {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $space-lg;
  margin-bottom: $space-md;
  box-shadow: $shadow-sm;
  border: 1rpx solid $border-light;

  .status-header {
    display: flex;
    align-items: center;

    .status-icon {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: $space-lg;

      &.transit { background: $info-light; }
      &.pickup { background: $warning-light; }
      &.signed { background: $success-light; }
      &.delivering { background: $warning-light; }
      &.returned { background: $error-light; }

      .icon-text {
        font-size: 40rpx;
        font-weight: bold;
        .transit & { color: $info; }
        .pickup & { color: $warning; }
        .signed & { color: $success; }
        .delivering & { color: $warning; }
        .returned & { color: $error; }
      }
    }

    .status-info {
      flex: 1;

      .status-text {
        display: block;
        font-size: $text-lg;
        font-weight: $font-bold;
        color: $text-primary;
        margin-bottom: $space-xs;
      }

      .company-text {
        font-size: $text-sm;
        color: $text-tertiary;
      }
    }
  }
}

.timeline-section {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $space-lg;
  box-shadow: $shadow-sm;
  border: 1rpx solid $border-light;

  .section-title {
    font-size: $text-base;
    font-weight: $font-bold;
    color: $text-secondary;
    margin-bottom: $space-lg;
  }

  .timeline {
    .timeline-item {
      display: flex;
      padding-bottom: $space-xl;
      position: relative;

      &.first {
        .timeline-text {
          color: $text-primary;
          font-weight: $font-medium;
        }
      }

      .timeline-left {
        width: 120rpx;
        text-align: center;
        flex-shrink: 0;

        .time-date {
          display: block;
          font-size: $text-xs;
          color: $text-tertiary;
          margin-bottom: 4rpx;
        }

        .time-hour {
          display: block;
          font-size: $text-xs;
          color: $text-tertiary;
        }
      }

      .timeline-line {
        width: 40rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;

        .timeline-dot {
          width: 20rpx;
          height: 20rpx;
          border-radius: 50%;
          background: $border-light;

          &.active {
            background: $primary;
            box-shadow: 0 0 0 8rpx rgba(196, 128, 106, 0.15);
          }
        }

        .timeline-connector {
          flex: 1;
          width: 2rpx;
          background: $border-light;
          margin-top: 10rpx;
        }
      }

      .timeline-content {
        flex: 1;
        padding-left: $space-md;

        .timeline-text {
          font-size: $text-base;
          color: $text-tertiary;
          line-height: 1.6;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx $space-lg;

  .empty-icon-wrap {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: $space-lg;
    opacity: 0.5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-text {
    font-size: $text-base;
    color: $text-tertiary;
  }
}

.error-state {
  display: flex;
  justify-content: center;
  padding: 100rpx $space-lg;

  .error-text {
    font-size: $text-base;
    color: $error;
  }
}
</style>
