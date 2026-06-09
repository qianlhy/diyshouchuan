/**
 * 订单数据归一化：对齐后端 OrderListVO / OrderDetailVO 与前端展示字段
 */

export function parseDateTime(time) {
  if (!time) return null
  if (time instanceof Date) return isNaN(time.getTime()) ? null : time
  if (typeof time === 'number') {
    const d = new Date(time)
    return isNaN(d.getTime()) ? null : d
  }
  if (Array.isArray(time) && time.length >= 3) {
    const [y, m, d, h = 0, min = 0, sec = 0] = time
    return new Date(y, m - 1, d, h, min, sec)
  }
  const str = String(time).trim()
  if (!str) return null
  // 后端格式 yyyy-MM-dd HH:mm，iOS 需用 / 分隔
  const iosSafe = str.replace(/-/g, '/')
  let d = new Date(iosSafe)
  if (isNaN(d.getTime())) {
    d = new Date(str.replace(' ', 'T'))
  }
  return isNaN(d.getTime()) ? null : d
}

export function formatOrderTime(time) {
  const d = parseDateTime(time)
  if (!d) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function toMoneyNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function formatOrderAmount(amount, shippingFee = 0) {
  const total = toMoneyNumber(amount) + toMoneyNumber(shippingFee)
  return total.toFixed(2)
}

export function normalizeOrderItem(item) {
  if (!item) return item
  const image = item.imageUrl || item.image || item.productImage || ''
  return {
    ...item,
    imageUrl: image,
    image,
    price: toMoneyNumber(item.price),
    quantity: item.quantity ?? 1
  }
}

export function normalizeOrder(raw) {
  if (!raw) return null
  const id = raw.id ?? raw.orderId
  const totalAmount = toMoneyNumber(raw.totalAmount ?? raw.amount)
  const items = (raw.items || raw.orderItems || []).map(normalizeOrderItem)

  return {
    ...raw,
    id,
    orderId: id,
    orderNo: raw.orderNo || raw.order_no || '',
    totalAmount,
    amount: totalAmount,
    shippingFee: toMoneyNumber(raw.shippingFee),
    items,
    status: raw.status ?? 0
  }
}
