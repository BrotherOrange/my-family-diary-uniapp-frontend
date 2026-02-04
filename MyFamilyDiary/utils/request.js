/**
 * HTTP Request Utility
 * 支持双Token认证（Access Token + Refresh Token）
 */

const BASE_URL = 'https://service.jihao-family.com'

// 是否正在刷新Token
let isRefreshing = false
// 等待刷新的请求队列
let refreshSubscribers = []

// Generate trace ID
function generateTraceId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 订阅Token刷新完成事件
 * @param {Function} callback - 刷新完成后的回调
 */
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback)
}

/**
 * 通知所有订阅者Token已刷新
 * @param {string} newAccessToken - 新的Access Token
 */
function onTokenRefreshed(newAccessToken) {
  refreshSubscribers.forEach(callback => callback(newAccessToken))
  refreshSubscribers = []
}

/**
 * 通知所有订阅者刷新失败
 * @param {Error} error - 错误信息
 */
function onRefreshFailed(error) {
  refreshSubscribers.forEach(callback => callback(null, error))
  refreshSubscribers = []
}

/**
 * 刷新Token
 * @returns {Promise<string>} 新的Access Token
 */
async function doRefreshToken() {
  const refreshTokenValue = uni.getStorageSync('refreshToken')
  if (!refreshTokenValue) {
    throw new Error('No refresh token')
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + '/v1/token/refresh',
      method: 'POST',
      data: { refreshToken: refreshTokenValue },
      header: {
        'Content-Type': 'application/json',
        'x-trace-id': generateTraceId()
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const { accessToken, refreshToken } = res.data.data
          uni.setStorageSync('accessToken', accessToken)
          uni.setStorageSync('refreshToken', refreshToken)
          resolve(accessToken)
        } else {
          reject(new Error(res.data.message || 'Token刷新失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 处理Token过期，跳转登录页
 */
function handleTokenExpired() {
  uni.removeStorageSync('accessToken')
  uni.removeStorageSync('refreshToken')
  uni.removeStorageSync('userInfo')
  // 兼容旧的token字段
  uni.removeStorageSync('token')

  uni.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none'
  })

  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/auth/login'
    })
  }, 1500)
}

/**
 * Request wrapper
 * @param {Object} options - Request options
 * @param {string} options.url - API endpoint (without base URL)
 * @param {string} options.method - HTTP method
 * @param {Object} options.data - Request body
 * @param {boolean} options.auth - Whether to include auth token
 * @param {boolean} options.skipAutoRefresh - Skip auto refresh on 401 (for refresh API itself)
 */
export function request(options) {
  return new Promise((resolve, reject) => {
    const accessToken = uni.getStorageSync('accessToken')
    // 兼容旧的token字段
    const legacyToken = uni.getStorageSync('token')
    const token = accessToken || legacyToken

    const header = {
      'Content-Type': 'application/json',
      'x-trace-id': generateTraceId()
    }

    if (options.auth && token) {
      header['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: async (res) => {
        // 处理 token 过期（401 Unauthorized）
        if (res.statusCode === 401) {
          // 如果是刷新Token接口本身返回401，直接跳转登录
          if (options.skipAutoRefresh) {
            handleTokenExpired()
            reject({ message: '登录已过期' })
            return
          }

          // 尝试刷新Token
          if (!isRefreshing) {
            isRefreshing = true

            try {
              const newAccessToken = await doRefreshToken()
              isRefreshing = false
              onTokenRefreshed(newAccessToken)

              // 重试当前请求
              header['Authorization'] = `Bearer ${newAccessToken}`
              uni.request({
                url: BASE_URL + options.url,
                method: options.method || 'GET',
                data: options.data,
                header,
                success: (retryRes) => {
                  if (retryRes.statusCode === 200 && retryRes.data.success) {
                    resolve(retryRes.data)
                  } else {
                    handleRequestError(retryRes, reject)
                  }
                },
                fail: (err) => {
                  uni.showToast({
                    title: '网络错误，请检查网络连接',
                    icon: 'none'
                  })
                  reject(err)
                }
              })
            } catch (refreshError) {
              isRefreshing = false
              onRefreshFailed(refreshError)
              handleTokenExpired()
              reject({ message: '登录已过期' })
            }
          } else {
            // 已经在刷新中，等待刷新完成后重试
            subscribeTokenRefresh((newAccessToken, error) => {
              if (error) {
                reject({ message: '登录已过期' })
                return
              }

              // 重试当前请求
              header['Authorization'] = `Bearer ${newAccessToken}`
              uni.request({
                url: BASE_URL + options.url,
                method: options.method || 'GET',
                data: options.data,
                header,
                success: (retryRes) => {
                  if (retryRes.statusCode === 200 && retryRes.data.success) {
                    resolve(retryRes.data)
                  } else {
                    handleRequestError(retryRes, reject)
                  }
                },
                fail: (err) => {
                  uni.showToast({
                    title: '网络错误，请检查网络连接',
                    icon: 'none'
                  })
                  reject(err)
                }
              })
            })
          }
          return
        }

        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data)
        } else {
          handleRequestError(res, reject)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * 处理请求错误
 * @param {Object} res - 响应对象
 * @param {Function} reject - Promise reject函数
 */
function handleRequestError(res, reject) {
  // 优先显示 errors 中的具体错误信息
  let errorMsg = '请求失败'
  if (res.data.errors) {
    // errors 可能是字符串或数组
    errorMsg = typeof res.data.errors === 'string'
      ? res.data.errors
      : res.data.errors[0] || res.data.message
  } else if (res.data.message) {
    errorMsg = res.data.message
  }
  uni.showToast({
    title: errorMsg,
    icon: 'none'
  })
  reject(res.data)
}

export default request
