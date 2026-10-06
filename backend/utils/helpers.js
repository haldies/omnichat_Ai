const crypto = require('crypto');

// Generate secure random string
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (basic validation)
function isValidPhoneNumber(phone) {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

// Sanitize string for database storage
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

// Format bytes to human readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format duration in milliseconds to human readable format
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

// Deep clone object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
function isEmpty(obj) {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
}

// Debounce function
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Parse user agent string
function parseUserAgent(userAgent) {
  const ua = userAgent || '';
  
  // Simple parsing - you might want to use a library like 'ua-parser-js' for more detailed parsing
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/?([\d.]+)/i);
  const os = ua.match(/(Windows|Mac|Linux|Android|iOS)/i);
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  
  return {
    browser: browser ? `${browser[1]} ${browser[2]}` : 'Unknown',
    os: os ? os[1] : 'Unknown',
    mobile,
    raw: ua
  };
}

// Generate pagination metadata
function generatePaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
}

// Validate and parse pagination parameters
function parsePaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

// Generate API response format
function apiResponse(success, data = null, error = null, meta = null) {
  const response = { success };
  
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  if (meta !== null) response.meta = meta;
  
  return response;
}

// Validate required fields in object
function validateRequiredFields(obj, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!(field in obj) || obj[field] === null || obj[field] === undefined || obj[field] === '') {
      missing.push(field);
    }
  }
  
  return missing;
}

// Convert string to slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Mask sensitive data
function maskSensitiveData(obj, sensitiveFields = ['password', 'token', 'secret', 'key']) {
  const masked = deepClone(obj);
  
  function maskRecursive(item) {
    if (Array.isArray(item)) {
      return item.map(maskRecursive);
    }
    
    if (item && typeof item === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(item)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '***masked***';
        } else {
          result[key] = maskRecursive(value);
        }
      }
      return result;
    }
    
    return item;
  }
  
  return maskRecursive(masked);
}

// Calculate time difference
function getTimeDifference(startTime, endTime = new Date()) {
  const diff = endTime - startTime;
  return {
    milliseconds: diff,
    seconds: Math.floor(diff / 1000),
    minutes: Math.floor(diff / (1000 * 60)),
    hours: Math.floor(diff / (1000 * 60 * 60)),
    days: Math.floor(diff / (1000 * 60 * 60 * 24))
  };
}

// Generate random color
function generateRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

// Check if URL is valid
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  generateSecureToken,
  isValidEmail,
  isValidPhoneNumber,
  sanitizeString,
  formatBytes,
  formatDuration,
  deepClone,
  isEmpty,
  debounce,
  throttle,
  retryWithBackoff,
  parseUserAgent,
  generatePaginationMeta,
  parsePaginationParams,
  apiResponse,
  validateRequiredFields,
  slugify,
  maskSensitiveData,
  getTimeDifference,
  generateRandomColor,
  isValidUrl
};