/**
 * HTTP Request Utility
 */

const BASE_URL = 'https://service.jihao-family.com'

// Generate trace ID
function generateTraceId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Request wrapper
 * @param {Object} options - Request options
 * @param {string} options.url - API endpoint (without base URL)
 * @param {string} options.method - HTTP method
 * @param {Object} options.data - Request body
 * @param {boolean} options.auth - Whether to include auth token
 */
export function request(options) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')

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
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data)
        } else {
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

export default request
