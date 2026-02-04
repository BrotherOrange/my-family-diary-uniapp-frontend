/**
 * Authentication API
 */

import request from '@/utils/request'

/**
 * User login
 * @param {string} openId - WeChat OpenID
 * @param {string} password - User password
 */
export function login(openId, password) {
  return request({
    url: '/v1/login',
    method: 'POST',
    data: { openId, password }
  })
}

/**
 * User register
 * @param {Object} data - Registration data
 * @param {string} data.openId - WeChat OpenID
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 */
export function register(data) {
  return request({
    url: '/v1/register',
    method: 'POST',
    data
  })
}

/**
 * Get WeChat account info (exchange code for openId)
 * @param {string} code - WeChat login code
 * @param {string} iv - Encryption IV
 * @param {string} encryptedData - Encrypted user data
 */
export function getWeChatAccountInfo(code, iv, encryptedData) {
  return request({
    url: '/v1/wechat/account/info',
    method: 'POST',
    data: { code, iv, encryptedData }
  })
}

/**
 * Silent login - exchange code for openId only
 * @param {string} code - WeChat login code
 */
export function code2Session(code) {
  return request({
    url: '/v1/wechat/account/code2session',
    method: 'POST',
    data: { code }
  })
}

/**
 * WeChat silent login - get code only
 * Returns a Promise with the login code
 */
export function wxLogin() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error('Failed to get login code'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * Check if user exists by openId
 * @param {string} openId - WeChat OpenID
 * @returns {Promise<{registered: boolean, username?: string, avatarUrl?: string}>}
 */
export function checkUserExists(openId) {
  return request({
    url: '/v1/user/exists',
    method: 'GET',
    data: { openId }
  })
}

/**
 * User logout
 * Invalidates all tokens for the current user
 * @returns {Promise<void>}
 */
export function logout() {
  return request({
    url: '/v1/logout',
    method: 'POST',
    auth: true
  })
}

/**
 * Refresh token
 * Use refresh token to get new access token and refresh token
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export function refreshToken(refreshToken) {
  return request({
    url: '/v1/token/refresh',
    method: 'POST',
    data: { refreshToken },
    skipAutoRefresh: true  // 避免刷新接口本身触发自动刷新
  })
}
