const express = require('express');
const { body, validationResult } = require('express-validator');
const TelegramService = require('../services/telegramService');
const { prisma } = require('../config/supabase');

const router = express.Router();

// Create telegram service instance with token from request
const getTelegramService = (botToken) => {
  if (!botToken) {
    throw new Error('Bot token is required');
  }
  return new TelegramService(botToken);
};

// Get bot info with token from integration
router.get('/bot-info', async (req, res) => {
  try {
    const { integrationId } = req.query;
    
    let botToken;
    if (integrationId) {
      // Get token from specific integration
      const integration = await prisma.integration.findUnique({
        where: { id: integrationId }
      });
      
      if (!integration || integration.platform !== 'TELEGRAM') {
        return res.status(404).json({
          success: false,
          error: 'Telegram integration not found'
        });
      }
      
      botToken = integration.config?.botToken;
    } else {
      // Get token from any active Telegram integration
      const integration = await prisma.integration.findFirst({
        where: { 
          platform: 'TELEGRAM',
          status: 'ACTIVE'
        }
      });
      
      if (integration) {
        botToken = integration.config?.botToken;
      } else {
        // Fallback to environment variable
        botToken = process.env.TELEGRAM_BOT_TOKEN;
      }
    }

    if (!botToken) {
      return res.status(400).json({
        success: false,
        error: 'Bot token not configured'
      });
    }

    const telegramService = getTelegramService(botToken);
    const botInfo = await telegramService.getBotInfo();
    
    res.json({
      success: true,
      data: botInfo
    });
  } catch (error) {
    console.error('Error getting bot info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bot information',
      details: error.message
    });
  }
});

// Set webhook with token from integration
router.post('/webhook', [
  body('url').isURL().withMessage('Valid webhook URL is required'),
  body('integrationId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { url, integrationId } = req.body;
    
    let botToken;
    if (integrationId) {
      const integration = await prisma.integration.findUnique({
        where: { id: integrationId }
      });
      
      if (!integration || integration.platform !== 'TELEGRAM') {
        return res.status(404).json({
          success: false,
          error: 'Telegram integration not found'
        });
      }
      
      botToken = integration.config?.botToken;
    } else {
      botToken = process.env.TELEGRAM_BOT_TOKEN;
    }

    if (!botToken) {
      return res.status(400).json({
        success: false,
        error: 'Bot token not configured'
      });
    }

    const telegramService = getTelegramService(botToken);
    const result = await telegramService.setWebhook(url);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set webhook'
    });
  }
});

// Get webhook info
router.get('/webhook', async (req, res) => {
  try {
    const { integrationId } = req.query;
    
    let botToken;
    if (integrationId) {
      // Get token from specific integration
      const integration = await prisma.integration.findUnique({
        where: { id: integrationId }
      });
      
      if (!integration || integration.platform !== 'TELEGRAM') {
        return res.status(404).json({
          success: false,
          error: 'Telegram integration not found'
        });
      }
      
      botToken = integration.config?.botToken;
    } else {
      // Get token from any active Telegram integration
      const integration = await prisma.integration.findFirst({
        where: { 
          platform: 'TELEGRAM',
          status: 'ACTIVE'
        }
      });
      
      if (integration) {
        botToken = integration.config?.botToken;
      } else {
        // Fallback to environment variable
        botToken = process.env.TELEGRAM_BOT_TOKEN;
      }
    }

    if (!botToken) {
      return res.status(400).json({
        success: false,
        error: 'Bot token not configured'
      });
    }

    const telegramService = getTelegramService(botToken);
    const webhookInfo = await telegramService.getWebhookInfo();
    
    res.json({
      success: true,
      data: webhookInfo
    });
  } catch (error) {
    console.error('Error getting webhook info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get webhook information',
      details: error.message
    });
  }
});

// Delete webhook
router.delete('/webhook', async (req, res) => {
  try {
    const { integrationId } = req.query;
    
    let botToken;
    if (integrationId) {
      const integration = await prisma.integration.findUnique({
        where: { id: integrationId }
      });
      
      if (!integration || integration.platform !== 'TELEGRAM') {
        return res.status(404).json({
          success: false,
          error: 'Telegram integration not found'
        });
      }
      
      botToken = integration.config?.botToken;
    } else {
      botToken = process.env.TELEGRAM_BOT_TOKEN;
    }

    if (!botToken) {
      return res.status(400).json({
        success: false,
        error: 'Bot token not configured'
      });
    }

    const telegramService = getTelegramService(botToken);
    const result = await telegramService.deleteWebhook();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete webhook'
    });
  }
});

// Send message
router.post('/send-message', [
  body('chatId').notEmpty().withMessage('Chat ID is required'),
  body('text').notEmpty().withMessage('Message text is required'),
  body('integrationId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { chatId, text, options, integrationId } = req.body;
    
    let botToken;
    if (integrationId) {
      const integration = await prisma.integration.findUnique({
        where: { id: integrationId }
      });
      
      if (!integration || integration.platform !== 'TELEGRAM') {
        return res.status(404).json({
          success: false,
          error: 'Telegram integration not found'
        });
      }
      
      botToken = integration.config?.botToken;
    } else {
      botToken = process.env.TELEGRAM_BOT_TOKEN;
    }

    if (!botToken) {
      return res.status(400).json({
        success: false,
        error: 'Bot token not configured'
      });
    }

    const telegramService = getTelegramService(botToken);
    const result = await telegramService.sendMessage(chatId, text, options);
    
    // Log message to database
    try {
      await prisma.telegramMessage.create({
        data: {
          chatId: BigInt(chatId),
          telegramMessageId: BigInt(result.message_id),
          messageText: text,
          messageDirection: 'OUTGOING',
          messageType: 'TEXT',
          messageData: result
        }
      });
    } catch (dbError) {
      console.error('Failed to log message to database:', dbError);
      // Don't fail the request if logging fails
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// Get chat messages
router.get('/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await prisma.telegramMessage.findMany({
      where: { chatId: BigInt(chatId) },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// Get all chats
router.get('/chats', async (req, res) => {
  try {
    const chats = await prisma.telegramChat.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chats'
    });
  }
});

// Get chat by ID
router.get('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await prisma.telegramChat.findUnique({
      where: { chatId: BigInt(chatId) },
      include: {
        messages: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat'
    });
  }
});

// Update chat
router.put('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const updates = req.body;

    const chat = await prisma.telegramChat.update({
      where: { chatId: BigInt(chatId) },
      data: updates
    });

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update chat'
    });
  }
});

// Setup webhook automatically
router.post('/setup-webhook', [
  body('botToken').notEmpty().withMessage('Bot token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { botToken } = req.body;
    const telegramService = getTelegramService(botToken);
    
    // Use ngrok or your production URL
    // For development, you'll need to setup ngrok or similar service
    const webhookUrl = process.env.WEBHOOK_URL || 'https://your-domain.com/api/webhooks/telegram';
    
    const result = await telegramService.setWebhook(webhookUrl);
    
    res.json({
      success: true,
      data: {
        ...result,
        webhookUrl
      }
    });
  } catch (error) {
    console.error('Error setting up webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup webhook'
    });
  }
});

module.exports = router;