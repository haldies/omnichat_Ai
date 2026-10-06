// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000',
  API_VERSION: '/api/v1',
  TIMEOUT: 30000, // 30 seconds
};

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/health`,
  STATS: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/stats`,
  UPLOAD_PDF: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/documents/upload-pdf`,
  ADD_DOCUMENTS: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/documents/add`,
  QUERY: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/query`,
  QUERY_AGENTIC: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/query/agentic`,
  SEARCH: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/search`,
  COLLECTION_INFO: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/collection/info`,
  COLLECTION_CLEAR: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/collection/clear`,
  DELETE_DOCUMENTS: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/documents/delete`,
};

// Get business ID from user data
export const getBusinessId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.businessId || userData.business?.id;
  }
  return null;
};

// Get headers with business ID
export const getHeaders = (additionalHeaders = {}) => {
  const businessId = getBusinessId();
  return {
    'X-Business-ID': businessId || '',
    ...additionalHeaders
  };
};

// Helper function for API calls
export const apiCall = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    // Add business ID header
    const headers = {
      ...getHeaders(),
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};
