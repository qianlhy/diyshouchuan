/**
 * 图片路径处理工具
 * - DIY 下单截图：上传/读取均走服务器
 * - 其他图片：走 COS 公开地址
 */

import { API_BASE_URL } from '../config.js'

const LEGACY_COS_BASE_URL = 'https://yiyszbd-1423651520.cos.ap-nanjing.myqcloud.com'
const WXCLOUD_COS_BASE_URL = 'https://7072-prod-6gf1u2dc2e9e4f49-1391651365.cos.ap-shanghai.myqcloud.com'
const IMAGE_PATH_PREFIX = '/admin/common/image/'
const SERVER_DIY_DESIGN_PATTERN = /\/uploads\/diy_design\/([^/?#]+)/i

function normalizeRelativePath(url) {
  if (!url) return ''

  let path = String(url).trim()

  if (path.startsWith(LEGACY_COS_BASE_URL)) {
    path = path.substring(LEGACY_COS_BASE_URL.length)
  } else if (path.startsWith(WXCLOUD_COS_BASE_URL)) {
    path = path.substring(WXCLOUD_COS_BASE_URL.length)
  } else if (path.startsWith(API_BASE_URL)) {
    path = path.substring(API_BASE_URL.length)
  } else if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      path = new URL(path).pathname
    } catch (e) {
      return path
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

function isServerDiyDesignImage(url) {
  return SERVER_DIY_DESIGN_PATTERN.test(String(url || ''))
}

function resolveServerDiyDesignUrl(url) {
  const match = String(url || '').match(SERVER_DIY_DESIGN_PATTERN)
  if (!match || !match[1]) return ''
  return `${API_BASE_URL}/diy-images/${match[1]}`
}

/**
 * 将各种格式的图片路径转为相对路径（用于提交订单等场景）
 */
export function toRelativeImagePath(url) {
  return normalizeRelativePath(url)
}

/**
 * 解析图片URL
 */
export function resolveImageUrl(url) {
  if (!url) {
    return ''
  }

  const raw = String(url).trim()
  if (raw.includes('/diy-images/')) {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw
    }
    return `${API_BASE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`
  }

  if (isServerDiyDesignImage(raw)) {
    return resolveServerDiyDesignUrl(raw)
  }

  const relativePath = normalizeRelativePath(raw)
  return `${LEGACY_COS_BASE_URL}${relativePath}`
}

/**
 * 从上传接口响应中提取图片相对路径
 */
export function extractUploadPath(uploadRes) {
  if (!uploadRes) return ''
  if (typeof uploadRes === 'string') return uploadRes

  const candidates = [
    uploadRes.publicUrl,
    uploadRes.path,
    uploadRes.url,
    uploadRes.fileUrl,
    uploadRes.fileName,
    uploadRes.data?.path,
    uploadRes.data?.url
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

export function resolveImageUrls(urls) {
  if (!Array.isArray(urls)) {
    return []
  }
  return urls.map(url => resolveImageUrl(url))
}

export function resolveProductImages(product) {
  if (!product) return product

  return {
    ...product,
    coverImage: resolveImageUrl(product.coverImage || product.cover_image),
    imageUrl: resolveImageUrl(product.imageUrl || product.image_url),
    images: resolveImageUrls(product.images || product.imageList)
  }
}

export function resolveOrderItemImages(item) {
  if (!item) return item

  return {
    ...item,
    imageUrl: resolveImageUrl(item.imageUrl || item.image),
    image: resolveImageUrl(item.image || item.imageUrl)
  }
}
