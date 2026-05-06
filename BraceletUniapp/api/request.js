/**
 * HTTP请求封装 - 统一处理JWT认证和错误
 */

import {
    API_BASE_URL,
    REQUEST_HEADERS,
    REQUEST_TIMEOUT,
    RESPONSE_CODE,
    TOKEN_HEADER
} from '../config.js'
import { getToken, handleTokenExpired } from '../utils/auth.js'

/**
 * 统一请求方法
 * @param {Object} options 请求配置
 * @param {String} options.url 接口路径（相对路径）
 * @param {String} options.method 请求方法 GET/POST/PUT/DELETE
 * @param {Object} options.data 请求参数
 * @param {Boolean} options.needAuth 是否需要认证，默认true
 * @param {Object} options.header 自定义请求头
 */
export function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    needAuth = true,
    header = {}
  } = options

  // 构建完整URL
  const fullUrl = `${API_BASE_URL}${url}`
  
  // 添加调试日志
  console.log(`📡 ${method}请求:`, fullUrl)
  if (method !== 'GET' && data && Object.keys(data).length > 0) {
    console.log('📦 请求数据:', data)
  }

  // 构建请求头
  const requestHeader = {
    ...REQUEST_HEADERS,
    ...header
  }

  // 如果需要认证，添加Token
  if (needAuth) {
    const token = getToken()
    if (token) {
      requestHeader[TOKEN_HEADER] = token
    } else {
      console.warn('请求需要认证但Token不存在:', url)
    }
  }

  return new Promise((resolve, reject) => {
    // GET请求不应该使用data，参数已经在URL中
    const requestConfig = {
      url: fullUrl,
      method,
      header: requestHeader,
      timeout: REQUEST_TIMEOUT,
    }
    
    // 只有非GET请求才传递data
    if (method !== 'GET') {
      requestConfig.data = data
    }
    
    uni.request({
      ...requestConfig,
      success: (res) => {
        // 检查HTTP状态码
        if (res.statusCode !== 200) {
          const error = {
            code: res.statusCode,
            msg: `HTTP错误: ${res.statusCode}`,
            data: null
          }
          console.error('HTTP请求失败:', error)
          reject(error)
          return
        }

        // 检查业务状态码
        const responseData = res.data
        
        // 兼容处理：无论新旧接口，只要code是0或1都视为成功
        // 新接口 code=0 为成功，旧接口 code=1 为成功
        const isSuccess = responseData.code === RESPONSE_CODE.SUCCESS || responseData.code === RESPONSE_CODE.SUCCESS_NEW
        
        if (isSuccess) {
          // 成功，返回data字段
          resolve(responseData.data || responseData)
        } else {
          // 业务失败
          const error = {
            code: responseData.code,
            msg: responseData.msg || '请求失败',
            data: responseData.data
          }
          console.error('业务请求失败:', error)
          
          // 如果是token失效，清除本地token并跳转登录
          if (responseData.code === 401 || responseData.msg?.includes('token')) {
            handleTokenExpired()
          }
          
          reject(error)
        }
      },
      fail: (err) => {
        const error = {
          code: 0,
          msg: err.errMsg || '网络请求失败',
          data: null
        }
        console.error('网络请求失败:', error)
        reject(error)
      }
    })
  })
}

/**
 * GET请求
 */
export function get(url, params = {}, needAuth = true) {
  // GET请求参数需要拼接到URL上
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  // 调试日志
  console.log('📤 GET请求:', fullUrl, '参数:', params)

  return request({
    url: fullUrl,
    method: 'GET',
    needAuth
  })
}

/**
 * POST请求
 */
export function post(url, data = {}, needAuth = true) {
  return request({
    url,
    method: 'POST',
    data,
    needAuth
  })
}

/**
 * PUT请求
 */
export function put(url, data = {}, needAuth = true) {
  return request({
    url,
    method: 'PUT',
    data,
    needAuth
  })
}

/**
 * DELETE请求
 */
export function del(url, data = {}, needAuth = true) {
  return request({
    url,
    method: 'DELETE',
    data,
    needAuth
  })
}
