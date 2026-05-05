<template>
  <u-icon 
    :name="iconName"
    :size="iconSize"
    :color="color"
    bold
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 32
  },
  color: {
    type: String,
    default: '#333'
  }
})

// uView Plus 图标映射 - 需要 uicon- 前缀
const iconMap = {
  // 购物车
  'cart': 'uicon-shopping-cart',
  'cart-filled': 'uicon-shopping-cart-fill',
  // 用户
  'person': 'uicon-account',
  'person-filled': 'uicon-account-fill',
  // 订单状态
  'wallet': 'uicon-red-packet',
  'wallet-filled': 'uicon-red-packet-fill',
  'checkbox': 'uicon-checkmark-circle',
  'checkbox-filled': 'uicon-checkmark-circle-fill',
  'paperplane': 'uicon-car',
  'paperplane-filled': 'uicon-car-fill',
  'star': 'uicon-star',
  'star-filled': 'uicon-star-fill',
  // 功能
  'location': 'uicon-map',
  'location-filled': 'uicon-map-fill',
  'staff': 'uicon-server-fill',
  'staff-filled': 'uicon-server-fill',
  'settings': 'uicon-setting',
  'settings-filled': 'uicon-setting-fill',
  'info': 'uicon-info-circle',
  'info-filled': 'uicon-info-circle-fill',
  // 其他
  'locked': 'uicon-lock',
  'locked-filled': 'uicon-lock-fill',
  'shop': 'uicon-home',
  'shop-filled': 'uicon-home-fill',
  'arrow-right': 'uicon-arrow-right',
  'home': 'uicon-home',
  'home-filled': 'uicon-home-fill',
  'scan': 'uicon-scan',
  'grid': 'uicon-grid',
  'minus': 'uicon-minus',
  'plus': 'uicon-plus',
  'trash': 'uicon-trash',
  'trash-filled': 'uicon-trash-fill',
  'close': 'uicon-close',
  'close-filled': 'uicon-close-circle-fill',
  'checkmark': 'uicon-checkmark',
  'checkmark-filled': 'uicon-checkmark-circle-fill',
  'search': 'uicon-search',
  'edit': 'uicon-edit-pen',
  'eye': 'uicon-eye',
  'eye-filled': 'uicon-eye-fill',
  'eye-off': 'uicon-eye-off',
  'heart': 'uicon-heart',
  'heart-filled': 'uicon-heart-fill',
  'share': 'uicon-share',
  'share-filled': 'uicon-share-fill',
  'phone': 'uicon-phone',
  'phone-filled': 'uicon-phone-fill',
  'email': 'uicon-email',
  'email-filled': 'uicon-email-fill',
  'notification': 'uicon-bell',
  'notification-filled': 'uicon-bell-fill',
  'more': 'uicon-more-dot-fill',
  'more-filled': 'uicon-more-circle-fill',
  'back': 'uicon-arrow-left',
  'forward': 'uicon-arrow-right',
  'up': 'uicon-arrow-up',
  'down': 'uicon-arrow-down'
}

const iconName = computed(() => iconMap[props.type] || props.type)

const iconSize = computed(() => {
  const s = typeof props.size === 'number' ? props.size : parseInt(props.size)
  // uView Plus 图标大小需要是数字（单位：px/rpx）
  return s
})
</script>
