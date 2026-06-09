const LEGACY_COS_BASE_URL = 'https://yiyszbd-1423651520.cos.ap-nanjing.myqcloud.com'
const WXCLOUD_COS_BASE_URL = 'https://7072-prod-6gf1u2dc2e9e4f49-1391651365.cos.ap-shanghai.myqcloud.com'
const IMAGE_PATH_PREFIX = '/admin/common/image/'
const SERVER_DIY_DESIGN_PATTERN = /\/uploads\/diy_design\/([^/?#]+)/i

function getApiBase () {
  return (process.env.VUE_APP_API_TARGET || process.env.VUE_APP_BASE_URL || window.location.origin || '').replace(/\/$/, '')
}

function isServerDiyDesignImage (url) {
  return SERVER_DIY_DESIGN_PATTERN.test(String(url || ''))
}

function resolveServerDiyDesignUrl (url) {
  const match = String(url || '').match(SERVER_DIY_DESIGN_PATTERN)
  if (!match || !match[1]) return ''
  const apiBase = getApiBase()
  return `${apiBase}/diy-images/${match[1]}`
}

function normalizeRelativePath (url) {
  if (!url) return ''

  let path = String(url).trim()

  if (path.startsWith(LEGACY_COS_BASE_URL)) {
    path = path.substring(LEGACY_COS_BASE_URL.length)
  } else if (path.startsWith(WXCLOUD_COS_BASE_URL)) {
    path = path.substring(WXCLOUD_COS_BASE_URL.length)
  } else {
    const apiBase = getApiBase()
    if (apiBase && path.startsWith(apiBase)) {
      path = path.substring(apiBase.length)
    } else if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        path = new URL(path).pathname
      } catch (e) {
        return path
      }
    }
  }

  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  if (!path.startsWith(IMAGE_PATH_PREFIX)) {
    path = `${IMAGE_PATH_PREFIX}${path.replace(/^\//, '')}`
  }

  return path
}

/**
 * 解析图片 URL
 * - DIY 下单截图（/uploads/diy_design/）：走服务器专用接口
 * - 其他图片：走原 COS 公开地址
 */
export function getImageUrl (url) {
  if (!url) return ''

  const raw = String(url).trim()
  if (raw.includes('/diy-images/')) {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw
    }
    const apiBase = getApiBase()
    return `${apiBase}${raw.startsWith('/') ? raw : `/${raw}`}`
  }

  if (isServerDiyDesignImage(raw)) {
    return resolveServerDiyDesignUrl(raw)
  }

  const relativePath = normalizeRelativePath(raw)
  return `${LEGACY_COS_BASE_URL}${relativePath}`
}

export function toRelativeImagePath (url) {
  return normalizeRelativePath(url)
}

/**
 * 从订单对象解析主图（优先 DIY 设计图）
 */
export function getOrderProductImage (order) {
  if (!order) return ''

  if (order.productImage) {
    return getImageUrl(order.productImage)
  }

  const items = order.items || []
  for (const item of items) {
    if (item.diyData) {
      try {
        const diy = typeof item.diyData === 'string' ? JSON.parse(item.diyData) : item.diyData
        if (diy && diy.imageUrl) {
          return getImageUrl(diy.imageUrl)
        }
      } catch (e) {}
    }

    const itemImage = item.productImage || item.imageUrl || item.image
    if (itemImage) {
      return getImageUrl(itemImage)
    }
  }

  return ''
}
