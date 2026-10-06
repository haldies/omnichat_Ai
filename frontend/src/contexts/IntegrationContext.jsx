import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const IntegrationContext = createContext();

export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
};

export const IntegrationProvider = ({ children }) => {
  const [integrations, setIntegrations] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load integrations from backend
  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getIntegrations();
      if (response.success) {
        setIntegrations(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load supported platforms
  const loadPlatforms = async () => {
    try {
      const response = await ApiService.getSupportedPlatforms();
      if (response.success) {
        setPlatforms(response.data);
      }
    } catch (err) {
      console.error('Failed to load platforms:', err);
    }
  };

  // Create new integration
  const createIntegration = async (integrationData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.createIntegration(integrationData);
      if (response.success) {
        setIntegrations(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update integration
  const updateIntegration = async (id, updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.updateIntegration(id, updates);
      if (response.success) {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === id ? response.data : integration
          )
        );
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete integration
  const deleteIntegration = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await ApiService.deleteIntegration(id);
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle integration status
  const toggleIntegration = async (id) => {
    try {
      setError(null);

      const response = await ApiService.toggleIntegration(id);
      if (response.success) {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === id ? response.data : integration
          )
        );
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Test integration connection
  const testIntegration = async (integration) => {
    try {
      setError(null);

      if (integration.platform === 'TELEGRAM' || integration.id === 'telegram') {
        // Test Telegram bot - real-time check
        try {
          // Test 1: Get bot info (real-time dari Telegram API)
          const botResponse = await ApiService.getTelegramBotInfo();
          
          if (!botResponse.success) {
            return {
              success: false,
              message: `Bot tidak dapat terhubung: ${botResponse.error}`
            };
          }

          // Test 2: Get webhook info
          const webhookResponse = await ApiService.getTelegramWebhook();
          
          // Test 3: Get chats from database (optional)
          let chatCount = 0;
          let recentChats = [];
          try {
            const chatsResponse = await ApiService.getTelegramChats();
            chatCount = chatsResponse.data?.length || 0;
            recentChats = chatsResponse.data?.slice(0, 3) || [];
          } catch (err) {
            console.log('Could not fetch chats:', err);
          }
          
          return {
            success: true,
            message: `✅ Bot aktif dan terhubung!\n\n` +
                     `Bot: @${botResponse.data.username}\n` +
                     `Webhook: ${webhookResponse.data?.url ? '✅ Terpasang' : '⚠️ Belum terpasang'}\n` +
                     `Chat: ${chatCount} percakapan`,
            data: {
              bot: botResponse.data,
              webhook: webhookResponse.data,
              chats: recentChats,
              chatCount
            }
          };
        } catch (err) {
          return {
            success: false,
            message: `❌ Test gagal: ${err.message}`
          };
        }
      }

      // Add other platform tests here
      return {
        success: false,
        message: 'Test belum tersedia untuk platform ini'
      };
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  };

  // Get platform configuration template
  const getPlatformTemplate = async (platform) => {
    try {
      const response = await ApiService.getPlatformConfigTemplate(platform.toLowerCase());
      return response.success ? response.data : {};
    } catch (err) {
      console.error('Failed to get platform template:', err);
      return {};
    }
  };

  // Validate platform configuration
  const validateConfig = async (platform, config) => {
    try {
      const response = await ApiService.validatePlatformConfig(platform.toLowerCase(), config);
      return response;
    } catch (err) {
      return {
        success: false,
        errors: [err.message]
      };
    }
  };

  // Convert backend integration to frontend platform format
  const integrationToPlatform = (integration) => {
    const platformMap = {
      'TELEGRAM': {
        type: 'Messaging Platform',
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1539deafe-1766247304706.png",
        logoAlt: 'Telegram blue logo with white paper plane icon on circular background',
        description: 'Integrate Telegram Bot API for instant messaging and automated customer interactions.',
        certified: true
      },
      'WHATSAPP': {
        type: 'Messaging Platform',
        logo: "https://images.unsplash.com/photo-1644035772775-8e26685ad2f0",
        logoAlt: 'WhatsApp Business green logo with white phone icon on rounded square background',
        description: 'Connect with customers through WhatsApp Business API for automated messaging and customer support.',
        certified: true
      },
      'INSTAGRAM': {
        type: 'Social Media Platform',
        logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1578531c9-1765127398454.png",
        logoAlt: 'Instagram gradient logo with white camera icon transitioning from purple to orange on rounded square',
        description: 'Manage Instagram Direct Messages and automated responses through Instagram Basic Display API.',
        certified: true
      }
    };

    const platformInfo = platformMap[integration.platform] || {
      type: 'Platform',
      logo: "https://via.placeholder.com/64",
      logoAlt: `${integration.platform} logo`,
      description: `${integration.platform} integration`,
      certified: false
    };

    return {
      id: integration.platform.toLowerCase(),
      name: integration.name,
      ...platformInfo,
      status: integration.status === 'ACTIVE' ? 'connected' : 
               integration.status === 'ERROR' ? 'error' : 'disconnected',
      integrationId: integration.id,
      config: integration.config
    };
  };

  // Get platforms with integration status
  const getPlatformsWithStatus = () => {
    return integrations.map(integrationToPlatform);
  };

  // Load data on mount
  useEffect(() => {
    loadIntegrations();
    loadPlatforms();
  }, []);

  const value = {
    integrations,
    platforms,
    loading,
    error,
    loadIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    toggleIntegration,
    testIntegration,
    getPlatformTemplate,
    validateConfig,
    getPlatformsWithStatus,
    setError
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};