const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/supabase');

const router = express.Router();

// Allow CORS for all widget routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to validate API key for widget requests
async function validateWidgetApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    const { widgetId } = req.body;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        message: 'Please provide X-API-Key header'
      });
    }

    // Find integration with matching widgetId and apiKey
    const integration = await prisma.integration.findFirst({
      where: {
        platform: 'WEBSITE',
        status: 'ACTIVE',
        config: {
          path: ['widgetId'],
          equals: widgetId
        }
      }
    });

    if (!integration) {
      console.warn(`⚠️  Widget not found: ${widgetId} from IP: ${req.ip}`);
      return res.status(404).json({
        success: false,
        error: 'Widget not found or inactive'
      });
    }

    // Validate API key
    if (integration.config?.apiKey !== apiKey) {
      console.warn(`⚠️  Invalid API key for widget: ${widgetId} from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key does not match the widget configuration'
      });
    }

    // Attach integration to request
    req.integration = integration;
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

// Handle widget message
router.post('/message', validateWidgetApiKey, [
  body('widgetId').notEmpty().withMessage('Widget ID is required'),
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { widgetId, sessionId, message, userName, userEmail, timestamp } = req.body;
    const integration = req.integration; // From middleware

    // Security: Validate message length
    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 5000 characters)'
      });
    }

    // Security: Validate domain if configured AND testing mode is disabled
    const allowedDomains = integration.config?.allowedDomains || [];
    const testingMode = integration.config?.testingMode ?? false;
    const origin = req.headers.origin || req.headers.referer;
    
    if (!testingMode && allowedDomains.length > 0 && origin) {
      const originDomain = new URL(origin).hostname;
      const isAllowed = allowedDomains.some(domain => {
        // Support wildcard subdomains
        if (domain.startsWith('*.')) {
          const baseDomain = domain.substring(2);
          return originDomain.endsWith(baseDomain);
        }
        return originDomain === domain;
      });

      if (!isAllowed) {
        console.warn(`⚠️  Unauthorized domain access: ${originDomain} for widget: ${widgetId}`);
        return res.status(403).json({
          success: false,
          error: 'Domain not authorized',
          message: `This widget is not authorized for domain: ${originDomain}`
        });
      }
    }

    // Log widget usage
    await prisma.apiUsageLog.create({
      data: {
        integrationId: integration.id,
        platform: 'WEBSITE',
        endpoint: '/api/widget/message',
        method: 'POST',
        requestData: {
          widgetId,
          sessionId,
          messageLength: message.length,
          origin: origin || 'unknown',
          ip: req.ip
        },
        statusCode: 200
      }
    }).catch(err => console.error('Failed to log widget usage:', err));

    // Find or create conversation thread
    let thread = await prisma.conversationThread.findFirst({
      where: {
        integrationId: integration.id,
        externalThreadId: sessionId
      }
    });

    if (!thread) {
      thread = await prisma.conversationThread.create({
        data: {
          integrationId: integration.id,
          externalThreadId: sessionId,
          platform: 'WEBSITE',
          customerName: userName || 'Website Visitor',
          customerEmail: userEmail || null,
          status: 'ACTIVE',
          lastActivityAt: new Date()
        }
      });
    } else if (userName && thread.customerName === 'Website Visitor') {
      // Update thread with user info if it was previously anonymous
      thread = await prisma.conversationThread.update({
        where: { id: thread.id },
        data: {
          customerName: userName,
          customerEmail: userEmail || thread.customerEmail
        }
      });
    }

    // Save incoming message
    const incomingMessage = await prisma.message.create({
      data: {
        threadId: thread.id,
        content: message,
        direction: 'INCOMING',
        status: 'DELIVERED',
        senderName: userName || 'Website Visitor',
        metadata: {
          sessionId,
          widgetId,
          timestamp,
          userName: userName || null,
          userEmail: userEmail || null,
          origin: origin || 'unknown',
          userAgent: req.headers['user-agent']
        }
      }
    });

    // Update thread last activity
    await prisma.conversationThread.update({
      where: { id: thread.id },
      data: {
        lastActivityAt: new Date(),
        lastMessage: message
      }
    });

    // Emit socket event for real-time update (format compatible with Command Center)
    const io = req.app.get('io');
    if (io) {
      // Emit in format expected by Command Center
      io.emit('new-message', {
        chatId: thread.id, // Use threadId as chatId for consistency
        conversationId: thread.id,
        platform: 'WEBSITE',
        message: {
          id: incomingMessage.id,
          sender: 'customer',
          content: message,
          timestamp: incomingMessage.createdAt,
          messageType: 'text'
        }
      });

      // Also emit chat updated event
      io.emit('chat-updated', {
        chatId: thread.id,
        conversationId: thread.id,
        platform: 'WEBSITE',
        lastMessage: message,
        lastMessageTime: new Date(),
        customerName: thread.customerName
      });
    }

    // Auto-reply logic (you can enhance this with AI)
    const autoReply = generateAutoReply(message, integration.config);

    if (autoReply) {
      // Save outgoing message
      const outgoingMessage = await prisma.message.create({
        data: {
          threadId: thread.id,
          content: autoReply,
          direction: 'OUTGOING',
          status: 'SENT',
          metadata: {
            automated: true
          }
        }
      });

      // Emit socket event for auto-reply
      if (io) {
        io.emit('sent-message', {
          chatId: thread.id,
          conversationId: thread.id,
          platform: 'WEBSITE',
          message: {
            id: outgoingMessage.id,
            sender: 'ai',
            content: autoReply,
            timestamp: outgoingMessage.createdAt,
            messageType: 'text'
          }
        });
      }

      return res.json({
        success: true,
        message: incomingMessage,
        reply: autoReply
      });
    }

    res.json({
      success: true,
      message: incomingMessage,
      reply: null
    });

  } catch (error) {
    console.error('Error handling widget message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

// Get widget configuration
router.get('/config/:widgetId', async (req, res) => {
  try {
    const { widgetId } = req.params;

    const integration = await prisma.integration.findFirst({
      where: {
        platform: 'WEBSITE',
        status: 'ACTIVE',
        config: {
          path: ['widgetId'],
          equals: widgetId
        }
      },
      select: {
        id: true,
        name: true,
        config: true
      }
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Widget not found'
      });
    }

    res.json({
      success: true,
      data: {
        widgetId: integration.config.widgetId,
        name: integration.name,
        primaryColor: integration.config.primaryColor,
        position: integration.config.position,
        greetingMessage: integration.config.greetingMessage,
        welcomeMessage: integration.config.welcomeMessage,
        offlineMessage: integration.config.offlineMessage,
        showAgentAvatar: integration.config.showAgentAvatar,
        enableFileUpload: integration.config.enableFileUpload,
        enableEmoji: integration.config.enableEmoji,
        soundEnabled: integration.config.soundEnabled
      }
    });

  } catch (error) {
    console.error('Error getting widget config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get widget configuration'
    });
  }
});

// Get conversation history for session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    const thread = await prisma.conversationThread.findFirst({
      where: {
        externalThreadId: sessionId,
        platform: 'WEBSITE'
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: parseInt(limit)
        }
      }
    });

    if (!thread) {
      return res.json({
        success: true,
        data: {
          messages: []
        }
      });
    }

    res.json({
      success: true,
      data: {
        threadId: thread.id,
        messages: thread.messages
      }
    });

  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation history'
    });
  }
});

// Simple auto-reply generator
function generateAutoReply(message, config) {
  const lowerMessage = message.toLowerCase();

  // Greeting responses
  if (lowerMessage.match(/^(hi|hello|hey|halo|hai)/)) {
    return config.greetingMessage || 'Hi! How can we help you today?';
  }

  // Business hours check
  if (config.businessHours?.enabled) {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const schedule = config.businessHours.schedule[day];
    
    if (schedule && !schedule.enabled) {
      return config.offlineMessage || 'We\'re currently offline. Leave us a message and we\'ll get back to you soon!';
    }
  }

  // FAQ responses
  const faqs = {
    'hours': 'Our business hours are Monday to Friday, 9 AM to 5 PM.',
    'price|pricing|cost': 'For pricing information, please contact our sales team.',
    'support|help': 'I\'m here to help! Please describe your issue and our team will assist you shortly.',
    'contact': 'You can reach us via this chat, email, or phone. How would you prefer to be contacted?'
  };

  for (const [pattern, response] of Object.entries(faqs)) {
    if (lowerMessage.match(new RegExp(pattern))) {
      return response;
    }
  }

  // Default response
  return 'Thank you for your message! Our team will respond shortly.';
}

module.exports = router;
