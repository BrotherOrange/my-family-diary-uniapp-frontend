/**
 * COS 对象存储 API
 */

import request from '@/utils/request'

/**
 * 上传头像到 COS
 * @param {string} openId - 用户 OpenID
 * @param {string} base64Image - 头像 Base64 编码（不含前缀）
 * @returns {Promise<{data: string}>} 返回头像临时链接
 */
export function uploadAvatar(openId, base64Image) {
  return request({
    url: '/v1/cos/avatar/upload',
    method: 'POST',
    data: { openId, base64Image },
    auth: true
  })
}

/**
 * 获取头像临时链接
 * @param {string} openId - 用户 OpenID
 * @returns {Promise<{data: string}>} 返回头像临时链接
 */
export function getAvatarUrl(openId) {
  return request({
    url: '/v1/cos/avatar/url',
    method: 'GET',
    data: { openId },
    auth: true
  })
}
