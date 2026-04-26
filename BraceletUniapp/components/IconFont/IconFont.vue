<template>
  <text 
    class="custom-icon"
    :style="iconStyle"
  >{{ iconChar }}</text>
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

// Emoji图标映射 - 使用精美emoji替代
const emojiMap = {
  // 购物车
  'cart': '🛒',
  'cart-filled': '🛒',
  // 用户
  'person': '👤',
  'person-filled': '👤',
  // 订单状态
  'wallet': '💳',
  'wallet-filled': '💳',
  'checkbox': '☑️',
  'checkbox-filled': '✅',
  'paperplane': '📦',
  'paperplane-filled': '📦',
  'star': '⭐',
  'star-filled': '⭐',
  // 功能
  'location': '📍',
  'location-filled': '📍',
  'staff': '🎧',
  'staff-filled': '🎧',
  'settings': '⚙️',
  'settings-filled': '⚙️',
  'info': 'ℹ️',
  'info-filled': 'ℹ️',
  // 其他
  'locked': '🔒',
  'locked-filled': '🔒',
  'shop': '🏪',
  'arrow-right': '→',
  'home': '🏠',
  'home-filled': '🏠',
  'color': '🎨',
  'scan': '📷'
}

const iconChar = computed(() => emojiMap[props.type] || '•')

const iconStyle = computed(() => {
  const size = typeof props.size === 'number' ? props.size : parseInt(props.size)
  return {
    fontSize: size + 'rpx',
    color: props.color,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
</script>

<style scoped>
.custom-icon {
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
}
</style>
