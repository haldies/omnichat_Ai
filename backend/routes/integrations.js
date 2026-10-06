const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/supabase');
const { supabaseAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(supabaseAuth);

// Get all integrations
router.get('/', async (req, res) => {
  try {
    const { platform, status, limit = 50, offset = 0 } = req.query;
    
    // Filter by businessId from authenticated user
    const where = {
      businessId: req.user.businessId
    };
    
    if (platform) where.platform = platform.toUpperCase();
    if (status) where.status = status.toUpperCase();

    const integrations = await prisma.integration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        _count: {
          select: {
            conversationThreads: true,
            messageAnalytics: true
          }
        }
      }
    });

    const total = await prisma.integration.count({ where });

    res.json({
      success: true,
      data: integrations,
      meta: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations'
    });
  }
});

// Get integration by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const integration = await prisma.integration.findFirst({
      where: { 
        id,
        businessId: req.user.businessId
      },
      include: {
        conversationThreads: {
          take: 10,
          orderBy: { lastActivityAt: 'desc' }
        },
        messageAnalytics: {
          take: 30,
          orderBy: { date: 'desc' }
        },
        _count: {
          select: {
            conversationThreads: true,
            messageAnalytics: true,
            apiUsageLogs: true
          }
        }
      }
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    res.json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration'
    });
  }
});

// Create new integration
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('platform').isIn(['TELEGRAM', 'WHATSAPP', 'DISCORD', 'SLACK', 'INSTAGRAM', 'FACEBOOK', 'WEBSITE']).withMessage('Invalid platform'),
  body('config').isObject().withMessage('Config must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, platform, config, description, status } = req.body;
    
    // Get businessId from authenticated user
    const businessId = req.user.businessId;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID not found in user session'
      });
    }
    
    const integration = await prisma.integration.create({
      data: {
        name,
        platform: platform.toUpperCase(),
        config,
        description: description || '',
        status: status || 'INACTIVE',
        businessId: businessId
      }
    });

    // Auto-setup Telegram webhook if platform is Telegram
    if (platform.toUpperCase() === 'TELEGRAM' && config.botToken) {
      try {
        const TelegramService = require('../services/telegramService');
        const telegramService = new TelegramService(config.botToken);
        
        const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
        if (webhookUrl) {
          await telegramService.setWebhook(webhookUrl);
          console.log(`✅ Telegram webhook auto-configured for integration: ${name}`);
        } else {
          console.log(`⚠️  TELEGRAM_WEBHOOK_URL not set, skipping auto-setup for: ${name}`);
        }
      } catch (webhookError) {
        console.error('Failed to auto-setup Telegram webhook:', webhookError.message);
        // Don't fail the integration creation if webhook setup fails
      }
    }

    res.status(201).json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Integration with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create integration'
    });
  }
});

// Update integration
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('platform').optional().isIn(['TELEGRAM', 'WHATSAPP', 'DISCORD', 'SLACK', 'INSTAGRAM', 'FACEBOOK', 'WEBSITE']).withMessage('Invalid platform'),
  body('config').optional().isObject().withMessage('Config must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.platform) {
      updateData.platform = updateData.platform.toUpperCase();
    }

    // Check if integration belongs to user's business
    const existing = await prisma.integration.findFirst({
      where: {
        id,
        businessId: req.user.businessId
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    const integration = await prisma.integration.update({
      where: { id },
      data: updateData
    });

    // Auto-setup Telegram webhook if platform is Telegram and botToken is updated
    if (integration.platform === 'TELEGRAM' && updateData.config?.botToken) {
      try {
        const TelegramService = require('../services/telegramService');
        const telegramService = new TelegramService(updateData.config.botToken);
        
        const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
        if (webhookUrl) {
          await telegramService.setWebhook(webhookUrl);
          console.log(`✅ Telegram webhook auto-updated for integration: ${integration.name}`);
        }
      } catch (webhookError) {
        console.error('Failed to auto-update Telegram webhook:', webhookError.message);
        // Don't fail the integration update if webhook setup fails
      }
    }

    res.json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update integration'
    });
  }
});

// Delete integration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if integration belongs to user's business
    const existing = await prisma.integration.findFirst({
      where: {
        id,
        businessId: req.user.businessId
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    await prisma.integration.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting integration:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete integration'
    });
  }
});

// Toggle integration status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current integration (check businessId)
    const current = await prisma.integration.findFirst({
      where: { 
        id,
        businessId: req.user.businessId
      }
    });

    if (!current) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    const newStatus = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const integration = await prisma.integration.update({
      where: { id },
      data: { status: newStatus }
    });

    // Auto-setup Telegram webhook when activating
    if (newStatus === 'ACTIVE' && integration.platform === 'TELEGRAM' && integration.config?.botToken) {
      try {
        const TelegramService = require('../services/telegramService');
        const telegramService = new TelegramService(integration.config.botToken);
        
        const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
        if (webhookUrl) {
          await telegramService.setWebhook(webhookUrl);
          console.log(`✅ Telegram webhook auto-configured on activation: ${integration.name}`);
        }
      } catch (webhookError) {
        console.error('Failed to auto-setup Telegram webhook on activation:', webhookError.message);
        // Don't fail the status toggle if webhook setup fails
      }
    }

    res.json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error toggling integration status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle integration status'
    });
  }
});

// Get integration statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const integration = await prisma.integration.findFirst({
      where: { 
        id,
        businessId: req.user.businessId
      }
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get message analytics
    const analytics = await prisma.messageAnalytics.findMany({
      where: {
        integrationId: id,
        date: {
          gte: startDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Get conversation threads count
    const threadsCount = await prisma.conversationThread.count({
      where: { integrationId: id }
    });

    // Get active threads count
    const activeThreadsCount = await prisma.conversationThread.count({
      where: { 
        integrationId: id,
        status: 'ACTIVE'
      }
    });

    // Calculate totals
    const totals = analytics.reduce((acc, curr) => ({
      totalMessages: acc.totalMessages + curr.totalMessages,
      incomingMessages: acc.incomingMessages + curr.incomingMessages,
      outgoingMessages: acc.outgoingMessages + curr.outgoingMessages,
      uniqueChats: Math.max(acc.uniqueChats, curr.uniqueChats)
    }), {
      totalMessages: 0,
      incomingMessages: 0,
      outgoingMessages: 0,
      uniqueChats: 0
    });

    res.json({
      success: true,
      data: {
        integration,
        analytics,
        totals,
        threadsCount,
        activeThreadsCount
      }
    });
  } catch (error) {
    console.error('Error fetching integration stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration statistics'
    });
  }
});

module.exports = router;