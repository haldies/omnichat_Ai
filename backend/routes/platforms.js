const express = require('express');
const { supabase } = require('../config/supabase');

const router = express.Router();

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    // Get integration counts by platform
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('platform, status');

    if (integrationsError) throw integrationsError;

    // Get message counts by platform
    const { data: telegramMessages, error: telegramError } = await supabase
      .from('telegram_messages')
      .select('id', { count: 'exact' });

    if (telegramError) throw telegramError;

    // Get chat counts
    const { data: telegramChats, error: chatsError } = await supabase
      .from('telegram_chats')
      .select('id', { count: 'exact' });

    if (chatsError) throw chatsError;

    // Process statistics
    const stats = {
      integrations: {
        total: integrations?.length || 0,
        active: integrations?.filter(i => i.status === 'active').length || 0,
        inactive: integrations?.filter(i => i.status === 'inactive').length || 0,
        byPlatform: {}
      },
      messages: {
        telegram: telegramMessages?.length || 0,
        total: telegramMessages?.length || 0
      },
      chats: {
        telegram: telegramChats?.length || 0,
        total: telegramChats?.length || 0
      }
    };

    // Count integrations by platform
    integrations?.forEach(integration => {
      const platform = integration.platform;
      if (!stats.integrations.byPlatform[platform]) {
        stats.integrations.byPlatform[platform] = {
          total: 0,
          active: 0,
          inactive: 0
        };
      }
      stats.integrations.byPlatform[platform].total++;
      if (integration.status === 'active') {
        stats.integrations.byPlatform[platform].active++;
      } else {
        stats.integrations.byPlatform[platform].inactive++;
      }
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics'
    });
  }
});

// Get supported platforms
router.get('/supported', (req, res) => {
  const platforms = [
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Connect with Telegram Bot API',
      icon: 'MessageCircle',
      status: 'available',
      features: ['Messages', 'Media', 'Inline Keyboards', 'Webhooks'],
      setupRequired: ['Bot Token', 'Webhook URL']
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'WhatsApp Business API integration',
      icon: 'MessageSquare',
      status: 'coming_soon',
      features: ['Messages', 'Media', 'Templates', 'Webhooks'],
      setupRequired: ['Business Account', 'API Key']
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Discord bot integration',
      icon: 'Hash',
      status: 'coming_soon',
      features: ['Messages', 'Embeds', 'Slash Commands', 'Webhooks'],
      setupRequired: ['Bot Token', 'Guild ID']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Slack app integration',
      icon: 'Slack',
      status: 'coming_soon',
      features: ['Messages', 'Blocks', 'Slash Commands', 'Webhooks'],
      setupRequired: ['App Token', 'Workspace']
    }
  ];

  res.json({
    success: true,
    data: platforms
  });
});

// Get platform configuration template
router.get('/:platform/config-template', (req, res) => {
  const { platform } = req.params;

  const templates = {
    telegram: {
      botToken: {
        type: 'string',
        required: true,
        description: 'Telegram Bot Token from @BotFather',
        placeholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
      },
      webhookUrl: {
        type: 'string',
        required: false,
        description: 'Webhook URL for receiving updates',
        placeholder: 'https://your-domain.com/api/webhooks/telegram'
      },
      allowedUpdates: {
        type: 'array',
        required: false,
        description: 'Types of updates to receive',
        default: ['message', 'edited_message', 'callback_query'],
        options: ['message', 'edited_message', 'callback_query', 'inline_query']
      }
    },
    whatsapp: {
      accessToken: {
        type: 'string',
        required: true,
        description: 'WhatsApp Business API Access Token',
        placeholder: 'EAAxxxxxxxxx'
      },
      phoneNumberId: {
        type: 'string',
        required: true,
        description: 'Phone Number ID',
        placeholder: '123456789012345'
      },
      webhookVerifyToken: {
        type: 'string',
        required: true,
        description: 'Webhook Verify Token',
        placeholder: 'your_verify_token'
      }
    },
    discord: {
      botToken: {
        type: 'string',
        required: true,
        description: 'Discord Bot Token',
        placeholder: 'MTxxxxxxxxx.Yyyyyy.Zzzzzzzzzzzzzzzzzzzzzzzz'
      },
      guildId: {
        type: 'string',
        required: false,
        description: 'Discord Server (Guild) ID',
        placeholder: '123456789012345678'
      },
      clientId: {
        type: 'string',
        required: true,
        description: 'Discord Application Client ID',
        placeholder: '123456789012345678'
      }
    },
    slack: {
      botToken: {
        type: 'string',
        required: true,
        description: 'Slack Bot User OAuth Token',
        placeholder: 'xoxb-xxxxxxxxx-xxxxxxxxx-xxxxxxxxxxxxxxxx'
      },
      signingSecret: {
        type: 'string',
        required: true,
        description: 'Slack Signing Secret',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      },
      appToken: {
        type: 'string',
        required: false,
        description: 'Slack App-Level Token (for Socket Mode)',
        placeholder: 'xapp-x-xxxxxxxxx-xxxxxxxxx-xxxxxxxxxxxxxxxx'
      }
    }
  };

  const template = templates[platform];
  
  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Platform not supported'
    });
  }

  res.json({
    success: true,
    data: template
  });
});

// Validate platform configuration
router.post('/:platform/validate-config', (req, res) => {
  const { platform } = req.params;
  const { config } = req.body;

  if (!config || typeof config !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Configuration object is required'
    });
  }

  const validationResults = {
    telegram: validateTelegramConfig,
    whatsapp: validateWhatsAppConfig,
    discord: validateDiscordConfig,
    slack: validateSlackConfig,
    website: validateWebsiteConfig
  };

  const validator = validationResults[platform];
  
  if (!validator) {
    return res.status(404).json({
      success: false,
      error: 'Platform not supported'
    });
  }

  const validation = validator(config);

  res.json({
    success: validation.isValid,
    errors: validation.errors || [],
    warnings: validation.warnings || []
  });
});

// Validation functions
function validateTelegramConfig(config) {
  const errors = [];
  const warnings = [];

  if (!config.botToken) {
    errors.push('Bot Token is required');
  } else if (!/^\d+:[A-Za-z0-9_-]+$/.test(config.botToken)) {
    errors.push('Invalid Bot Token format');
  }

  if (config.webhookUrl && !/^https:\/\/.+/.test(config.webhookUrl)) {
    warnings.push('Webhook URL should use HTTPS for security');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateWhatsAppConfig(config) {
  const errors = [];
  const warnings = [];

  if (!config.accessToken) {
    errors.push('Access Token is required');
  }

  if (!config.phoneNumberId) {
    errors.push('Phone Number ID is required');
  }

  if (!config.webhookVerifyToken) {
    errors.push('Webhook Verify Token is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateDiscordConfig(config) {
  const errors = [];
  const warnings = [];

  if (!config.botToken) {
    errors.push('Bot Token is required');
  }

  if (!config.clientId) {
    errors.push('Client ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateSlackConfig(config) {
  const errors = [];
  const warnings = [];

  if (!config.botToken) {
    errors.push('Bot Token is required');
  }

  if (!config.signingSecret) {
    errors.push('Signing Secret is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateWebsiteConfig(config) {
  const errors = [];
  const warnings = [];

  if (!config.widgetName || !config.widgetName.trim()) {
    errors.push('Widget Name is required');
  }

  if (!config.websiteUrl || !config.websiteUrl.trim()) {
    errors.push('Website URL is required');
  } else if (!/^https?:\/\/.+/.test(config.websiteUrl)) {
    errors.push('Invalid Website URL format');
  }

  if (!config.primaryColor || !/^#[0-9A-Fa-f]{6}$/.test(config.primaryColor)) {
    warnings.push('Primary Color should be a valid hex color (e.g., #3b82f6)');
  }

  if (!config.position || !['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(config.position)) {
    warnings.push('Invalid widget position');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = router;