/**
 * 登录认证管理模块
 * 统一管理登录状态、token处理和登录验证
 */

import { API_BASE_URL, API_PATHS, STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from '../config.js'

// ============ 登录状态管理 ============

/**
 * 获取本地存储的token
 */
export function getToken() {
  try {
    return uni.getStorageSync(STORAGE_TOKEN_KEY) || ''
  } catch (e) {
    console.error('获取token失败:', e)
    return ''
  }
}

/**
 * 获取本地存储的用户信息
 */
export function getUserInfo() {
  try {
    return uni.getStorageSync(STORAGE_USER_KEY) || null
  } catch (e) {
    console.error('获取用户信息失败:', e)
    return null
  }
}

/**
 * 保存登录信息
 */
export function saveLoginInfo(token, userInfo) {
  try {
    uni.setStorageSync(STORAGE_TOKEN_KEY, token)
    uni.setStorageSync(STORAGE_USER_KEY, userInfo)
    console.log('登录信息已保存')
  } catch (e) {
    console.error('保存登录信息失败:', e)
  }
}

/**
 * 清除登录信息
 */
export function clearLoginInfo() {
  try {
    uni.removeStorageSync(STORAGE_TOKEN_KEY)
    uni.removeStorageSync(STORAGE_USER_KEY)
    console.log('登录信息已清除')
  } catch (e) {
    console.error('清除登录信息失败:', e)
  }
}

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  const token = getToken()
  const user = getUserInfo()
  return !!(token && user)
}

// ============ 微信登录流程 ============

/**
 * 执行微信登录
 * @param {Object} profile 用户信息 { nickName, avatarUrl }
 * @returns {Promise} 登录结果
 */
export function wechatLogin(profile = {}) {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '登录中...', mask: true })
    
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (loginRes.code) {
          // 调用后端登录接口
          callLoginApi(loginRes.code, profile)
            .then(resolve)
            .catch(reject)
        } else {
          uni.hideLoading()
          reject(new Error('获取微信code失败'))
        }
      },
      fail: (err) => {
        uni.hideLoading()
        reject(new Error('微信登录失败: ' + err.errMsg))
      }
    })
  })
}

/**
 * 调用后端登录接口
 */
function callLoginApi(code, profile) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${API_PATHS.WECHAT_LOGIN}`,
      method: 'POST',
      data: {
        code,
        nickName: profile.nickName || '微信用户',
        avatarUrl: profile.avatarUrl || ''
      },
      success: (res) => {
        uni.hideLoading()
        
        console.log('登录接口原始响应:', res)
        
        if (res.statusCode !== 200) {
          reject(new Error(`请求失败: ${res.statusCode}`))
          return
        }
        
        const data = res.data
        console.log('登录接口数据:', data)
        
        // 后端返回格式: { code: 1, msg: '', data: { id, openid, token, nickname, avatar } }
        // code为1表示成功，code为0表示失败
        if (data.code === 1) {
          const userData = data.data
          if (userData && userData.token) {
            // 保存登录信息
            saveLoginInfo(userData.token, {
              id: userData.id,
              openid: userData.openid,
              nickName: userData.nickname,
              avatarUrl: userData.avatar
            })
            resolve(userData)
          } else {
            reject(new Error('登录响应缺少token'))
          }
        } else {
          // code不为1，表示登录失败
          reject(new Error(data.msg || '登录失败'))
        }
      },
      fail: (err) => {
        uni.hideLoading()
        reject(new Error('网络请求失败: ' + err.errMsg))
      }
    })
  })
}

// ============ 登录验证和跳转 ============

/**
 * 需要登录才能执行的函数
 * @param {Function} callback 登录成功后执行的回调
 * @param {Object} options 选项 { showTip: true }
 */
export function requireLogin(callback, options = {}) {
  if (isLoggedIn()) {
    // 已登录，直接执行
    callback()
  } else {
    // 未登录，显示提示并跳转登录页
    if (options.showTip !== false) {
      uni.showToast({ title: '请先登录', icon: 'none' })
    }
    
    // 跳转到登录页面
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/index',
        success: () => {
          // 注册登录成功事件监听
          uni.$once('loginSuccess', () => {
            callback()
          })
        }
      })
    }, 500)
  }
}

/**
 * 检查登录状态，未登录时跳转登录页
 * @returns {Boolean} 是否已登录
 */
export function checkLogin(redirectUrl = '') {
  if (isLoggedIn()) {
    return true
  }
  
  uni.showToast({ title: '请先登录', icon: 'none' })
  
  setTimeout(() => {
    const url = redirectUrl ? `/pages/login/index?redirect=${encodeURIComponent(redirectUrl)}` : '/pages/login/index'
    uni.navigateTo({ url })
  }, 500)
  
  return false
}

// ============ Token处理 ============

/**
 * 获取请求头中的认证信息
 */
export function getAuthHeader() {
  const token = getToken()
  return token ? { 'authentication': token } : {}
}

/**
 * 处理token过期
 */
export function handleTokenExpired() {
  clearLoginInfo()
  uni.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/index/index' })
  }, 2000)
}

export default {
  getToken,
  getUserInfo,
  saveLoginInfo,
  clearLoginInfo,
  isLoggedIn,
  wechatLogin,
  requireLogin,
  checkLogin,
  getAuthHeader,
  handleTokenExpired
}
