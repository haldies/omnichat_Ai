const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Integrations
  async getIntegrations() {
    return this.request('/integrations');
  }

  async getIntegration(id) {
    return this.request(`/integrations/${id}`);
  }

  async createIntegration(data) {
    return this.request('/integrations', {
      method: 'POST',
      body: data,
    });
  }

  async updateIntegration(id, data) {
    return this.request(`/integrations/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteIntegration(id) {
    return this.request(`/integrations/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleIntegration(id) {
    return this.request(`/integrations/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async getIntegrationStats(id, days = 30) {
    return this.request(`/integrations/${id}/stats?days=${days}`);
  }

  // Platforms
  async getPlatformStats() {
    return this.request('/platforms/stats');
  }

  async getSupportedPlatforms() {
    return this.request('/platforms/supported');
  }

  async getPlatformConfigTemplate(platform) {
    return this.request(`/platforms/${platform}/config-template`);
  }

  async validatePlatformConfig(platform, config) {
    return this.request(`/platforms/${platform}/validate-config`, {
      method: 'POST',
      body: { config },
    });
  }

  // Telegram
  async getTelegramBotInfo() {
    return this.request('/telegram/bot-info');
  }

  async setTelegramWebhook(url) {
    return this.request('/telegram/webhook', {
      method: 'POST',
      body: { url },
    });
  }

  async getTelegramWebhook() {
    return this.request('/telegram/webhook');
  }

  async deleteTelegramWebhook() {
    return this.request('/telegram/webhook', {
      method: 'DELETE',
    });
  }

  async sendTelegramMessage(chatId, text, options = {}) {
    return this.request('/telegram/send-message', {
      method: 'POST',
      body: { chatId, text, options },
    });
  }

  async getTelegramChats() {
    return this.request('/telegram/chats');
  }

  async getTelegramChat(chatId) {
    return this.request(`/telegram/chats/${chatId}`);
  }

  async getTelegramMessages(chatId, limit = 50, offset = 0) {
    return this.request(`/telegram/messages/${chatId}?limit=${limit}&offset=${offset}`);
  }

  async setupTelegramWebhook(botToken) {
    return this.request('/telegram/setup-webhook', {
      method: 'POST',
      body: { botToken },
    });
  }

  // Conversations (Command Center)
  async getConversations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    
    const query = params.toString();
    return this.request(`/conversations${query ? '?' + query : ''}`);
  }

  async getConversation(id, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const query = params.toString();
    return this.request(`/conversations/${id}${query ? '?' + query : ''}`);
  }

  async sendConversationMessage(id, message, messageType = 'text') {
    return this.request(`/conversations/${id}/messages`, {
      method: 'POST',
      body: { message, messageType },
    });
  }

  async updateConversationStatus(id, aiStatus) {
    return this.request(`/conversations/${id}/status`, {
      method: 'PATCH',
      body: { aiStatus },
    });
  }

  async getConversationMetrics(days = 30) {
    return this.request(`/conversations/metrics/summary?days=${days}`);
  }

  async getRecentActivities(limit = 20) {
    return this.request(`/conversations/activities/recent?limit=${limit}`);
  }

  // Health check
  async getHealth() {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${base}/health`);
    return res.json();
  }
}

export default new ApiService();