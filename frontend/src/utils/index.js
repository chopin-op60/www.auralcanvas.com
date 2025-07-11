import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化日期
 * @param {string|Date} date 
 * @param {string} format 
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 相对时间
 * @param {string|Date} date 
 * @returns {string}
 */
export function fromNow(date) {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 获取文件完整URL
 * @param {string} filePath 
 * @returns {string}
 */
export function getFileUrl(filePath) {
  if (!filePath) return ''
  
  // 如果已经是完整URL，直接返回
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  
  // 构建完整的文件URL
  const baseUrl = import.meta.env.VITE_UPLOAD_URL || 'https://www.auralcanvas.fun'
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`
  
  return `${baseUrl}${cleanPath}`
}

/**
 * 文件大小格式化
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * 防抖函数
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 校验邮箱
 * @param {string} email 
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * 校验用户名
 * @param {string} username 
 * @returns {boolean}
 */
export function validateUsername(username) {
  return username && username.length >= 3 && username.length <= 20
}

/**
 * 校验密码强度
 * @param {string} password 
 * @returns {object}
 */
export function validatePassword(password) {
  const result = {
    isValid: false,
    strength: 0,
    message: ''
  }
  
  if (!password) {
    result.message = '密码不能为空'
    return result
  }
  
  if (password.length < 6) {
    result.message = '密码至少需要6位'
    return result
  }
  
  // 计算密码强度
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  result.strength = strength
  result.isValid = true
  
  switch (strength) {
    case 0:
    case 1:
      result.message = '密码强度：弱'
      break
    case 2:
    case 3:
      result.message = '密码强度：中'
      break
    default:
      result.message = '密码强度：强'
  }
  
  return result
}

/**
 * 复制到剪贴板
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // 备选方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

/**
 * 截断文本
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * URL参数序列化
 * @param {object} params 
 * @returns {string}
 */
export function serializeParams(params) {
  if (!params || typeof params !== 'object') return ''
  
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  }
  
  return searchParams.toString()
}
