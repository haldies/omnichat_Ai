const express = require('express');
const { prisma } = require('../config/supabase');
const TelegramService = require('../services/telegramService');
const { emitSocketEvent } = require('../utils/socketHelper');
const { supabaseAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(supabaseAuth);

// Get bot token from database
async function getBotToken(businessId) {
  try {
    const integration = await prisma.integration.findFirst({
      where: { 
        platform: 'TELEGRAM',
        status: 'ACTIVE',
        businessId: businessId
      }
    });
    
    if (!integration || !integration.config?.botToken) {
      throw new Error('No active Telegram integration found');
    }
    
    return integration.config.botToken;
  } catch (error) {
    console.error('Error getting bot token:', error);
    throw error;
  }
}

// Get all conversations with latest messages
router.get('/', async (req, res) => {
  try {
    const { platform, status, priority, search, limit = 50 } = req.query;

    // Get user's business integrations
    const integrations = await prisma.integration.findMany({
      where: {
        businessId: req.user.businessId,
        status: 'ACTIVE'
      }
    });

    if (integrations.length === 0) {
      return res.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          message: 'No active integrations found'
        }
      });
    }

    const integrationIds = integrations.map(i => i.id);
    const conversations = [];

    // Get conversations from ConversationThread (for Website, WhatsApp, etc.)
    const threads = await prisma.conversationThread.findMany({
      where: {
        integrationId: { in: integrationIds }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        integration: {
          select: {
            platform: true
          }
        }
      },
      orderBy: { lastActivityAt: 'desc' },
      take: parseInt(limit)
    });

    // Transform ConversationThread to conversation format
    for (const thread of threads) {
      const messageCount = await prisma.message.count({
        where: { threadId: thread.id }
      });

      const lastMessage = thread.messages[0];

      conversations.push({
        id: thread.id,
        chatId: thread.id, // Use thread ID as chatId
        customerName: thread.customerName || 'Unknown',
        customerAvatar: null,
        platform: thread.integration.platform.toLowerCase(),
        chatType: 'private',
        aiStatus: thread.status === 'ACTIVE' ? 'active' : 'handover',
        priority: thread.priority?.toLowerCase() || 'medium',
        lastMessage: lastMessage?.content || thread.lastMessage || '',
        lastMessageTime: lastMessage?.createdAt || thread.lastActivityAt,
        lastMessageType: lastMessage?.messageType?.toLowerCase() || 'text',
        unreadCount: 0,
        messageCount,
        tags: thread.tags || [],
        username: null,
        firstName: thread.customerName,
        lastName: null,
        title: thread.threadTitle,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt
      });
    }

    // Get Telegram chats (legacy support)
    const telegramIntegration = integrations.find(i => i.platform === 'TELEGRAM');
    if (telegramIntegration) {
      const chats = await prisma.telegramChat.findMany({
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        take: parseInt(limit)
      });

      for (const chat of chats) {
        const messageCount = await prisma.telegramMessage.count({
          where: { chatId: chat.chatId }
        });

        const lastMessage = chat.messages[0];

        conversations.push({
          id: chat.id,
          chatId: chat.chatId.toString(),
          customerName: chat.firstName 
            ? `${chat.firstName}${chat.lastName ? ' ' + chat.lastName : ''}`
            : chat.username || chat.title || 'Unknown',
          customerAvatar: null,
          platform: 'telegram',
          chatType: chat.chatType.toLowerCase(),
          aiStatus: chat.aiStatus ? chat.aiStatus.toLowerCase() : 'active',
          priority: 'medium',
          lastMessage: lastMessage?.messageText || '',
          lastMessageTime: lastMessage?.createdAt || chat.lastMessageAt,
          lastMessageType: lastMessage?.messageType?.toLowerCase() || 'text',
          unreadCount: 0,
          messageCount,
          tags: [],
          username: chat.username,
          firstName: chat.firstName,
          lastName: chat.lastName,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        });
      }
    }

    // Sort by last message time
    conversations.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    // Apply filters
    let filtered = conversations;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.customerName.toLowerCase().includes(searchLower) ||
        conv.lastMessage.toLowerCase().includes(searchLower) ||
        (conv.username && conv.username.toLowerCase().includes(searchLower))
      );
    }

    if (platform && platform !== 'all') {
      filtered = filtered.filter(conv => conv.platform === platform);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(conv => conv.aiStatus === status);
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter(conv => conv.priority === priority);
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      message: error.message
    });
  }
});

// Get conversation by ID with all messages
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    // Try to find in ConversationThread first (for Website, WhatsApp, etc.)
    const thread = await prisma.conversationThread.findUnique({
      where: { id },
      include: {
        integration: {
          select: {
            platform: true,
            businessId: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: parseInt(limit),
          skip: parseInt(offset)
        }
      }
    });

    if (thread) {
      // Check if thread belongs to user's business
      if (thread.integration.businessId !== req.user.businessId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Transform messages
      const messages = thread.messages.map(msg => ({
        id: msg.id,
        sender: msg.direction === 'INCOMING' ? 'customer' : 'agent',
        content: msg.content,
        messageType: msg.messageType?.toLowerCase() || 'text',
        timestamp: msg.createdAt,
        senderName: msg.senderName,
        metadata: msg.metadata
      }));

      const conversation = {
        id: thread.id,
        chatId: thread.id,
        customerName: thread.customerName || 'Unknown',
        customerEmail: thread.customerEmail,
        customerPhone: thread.customerPhone,
        customerAvatar: null,
        platform: thread.integration.platform.toLowerCase(),
        chatType: 'private',
        aiStatus: thread.status === 'ACTIVE' ? 'active' : 'handover',
        priority: thread.priority?.toLowerCase() || 'medium',
        title: thread.threadTitle,
        messages,
        messageCount: messages.length,
        tags: thread.tags || [],
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastMessageAt: thread.lastActivityAt
      };

      return res.json({
        success: true,
        data: conversation
      });
    }

    // Fallback to Telegram chat
    // Check if user has active Telegram integration
    const integration = await prisma.integration.findFirst({
      where: {
        businessId: req.user.businessId,
        platform: 'TELEGRAM',
        status: 'ACTIVE'
      }
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Find chat by ID
    const chat = await prisma.telegramChat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: parseInt(limit),
          skip: parseInt(offset)
        }
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Transform messages
    const messages = chat.messages.map(msg => ({
      id: msg.id,
      telegramMessageId: msg.telegramMessageId.toString(),
      sender: msg.messageDirection === 'INCOMING' ? 'customer' : 
              msg.messageDirection === 'OUTGOING' ? 'agent' : 'system',
      content: msg.messageText || '',
      messageType: msg.messageType.toLowerCase(),
      timestamp: msg.createdAt,
      userId: msg.userId?.toString(),
      username: msg.username,
      firstName: msg.firstName,
      lastName: msg.lastName,
      messageData: msg.messageData,
      replyToMessageId: msg.replyToMessageId?.toString(),
      editDate: msg.editDate
    }));

    const conversation = {
      id: chat.id,
      chatId: chat.chatId.toString(),
      customerName: chat.firstName 
        ? `${chat.firstName}${chat.lastName ? ' ' + chat.lastName : ''}`
        : chat.username || chat.title || 'Unknown',
      customerAvatar: null,
      platform: 'telegram',
      chatType: chat.chatType.toLowerCase(),
      aiStatus: chat.aiStatus?.toLowerCase() || 'active',
      priority: 'medium',
      username: chat.username,
      firstName: chat.firstName,
      lastName: chat.lastName,
      title: chat.title,
      description: chat.description,
      messages,
      messageCount: messages.length,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastMessageAt: chat.lastMessageAt
    };

    res.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
      message: error.message
    });
  }
});

// Send message to conversation
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, messageType = 'text' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Try to find in ConversationThread first (for Website, WhatsApp, etc.)
    const thread = await prisma.conversationThread.findUnique({
      where: { id },
      include: {
        integration: {
          select: {
            platform: true,
            config: true
          }
        }
      }
    });

    if (thread) {
      // Handle ConversationThread (Website, WhatsApp, etc.)
      const timestamp = new Date();
      
      // Save message to database
      const storedMessage = await prisma.message.create({
        data: {
          threadId: thread.id,
          content: message,
          direction: 'OUTGOING',
          messageType: messageType.toUpperCase(),
          status: 'SENT',
          senderName: req.user?.name || 'Agent',
          metadata: {
            sentBy: req.user?.id,
            sentByName: req.user?.name
          }
        }
      });

      // Update thread last activity
      await prisma.conversationThread.update({
        where: { id: thread.id },
        data: {
          lastActivityAt: timestamp,
          lastMessage: message
        }
      });

      console.log('\n📤 ═══════════════════════════════════════════════════════');
      console.log(`📱 OUTGOING ${thread.integration.platform} MESSAGE`);
      console.log('═══════════════════════════════════════════════════════');
      console.log(`👤 To: ${thread.customerName}`);
      console.log(`💬 Thread ID: ${thread.id}`);
      console.log(`📝 Message: ${message}`);
      console.log(`🕐 Time: ${timestamp.toLocaleString('id-ID')}`);
      console.log('═══════════════════════════════════════════════════════\n');

      // Emit Socket.IO event for real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('sent-message', {
          chatId: thread.id,
          conversationId: id,
          platform: thread.integration.platform.toLowerCase(),
          message: {
            id: storedMessage.id,
            sender: 'agent',
            content: message,
            timestamp: timestamp,
            messageType: messageType.toLowerCase()
          }
        });
      }

      return res.json({
        success: true,
        data: {
          id: storedMessage.id,
          sender: 'agent',
          content: message,
          messageType: messageType.toLowerCase(),
          timestamp: timestamp
        }
      });
    }

    // Fallback to Telegram chat
    const chat = await prisma.telegramChat.findUnique({
      where: { id }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Get bot token and send message
    const botToken = await getBotToken(req.user.businessId);
    const telegramService = new TelegramService(botToken);
    
    const sentMessage = await telegramService.sendMessage(
      chat.chatId.toString(),
      message
    );

    console.log('\n📤 ═══════════════════════════════════════════════════════');
    console.log('📱 OUTGOING TELEGRAM MESSAGE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`👤 To: ${chat.firstName || ''} ${chat.lastName || ''} (@${chat.username || 'no_username'})`);
    console.log(`💬 Chat ID: ${chat.chatId}`);
    console.log(`📝 Message: ${message}`);
    console.log(`🕐 Time: ${new Date().toLocaleString('id-ID')}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Create temporary message object for immediate response
    const tempMessageId = `temp_${Date.now()}`;
    const timestamp = new Date(sentMessage.date * 1000);
    
    const messageData = {
      id: tempMessageId,
      telegramMessageId: sentMessage.message_id.toString(),
      sender: 'agent',
      content: message,
      messageType: messageType.toLowerCase(),
      timestamp: timestamp
    };

    // Emit Socket.IO event IMMEDIATELY for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('telegram:message', {
        type: 'sent_message',
        chatId: chat.chatId.toString(),
        conversationId: id,
        message: messageData
      });
    }

    // Send response to frontend immediately
    res.json({
      success: true,
      data: messageData
    });

    // Store in database in background (non-blocking)
    setImmediate(async () => {
      try {
        const storedMessage = await prisma.telegramMessage.create({
          data: {
            chatId: chat.chatId,
            telegramMessageId: BigInt(sentMessage.message_id),
            messageText: message,
            messageType: messageType.toUpperCase(),
            messageDirection: 'OUTGOING',
            messageData: sentMessage,
            createdAt: timestamp
          }
        });

        // Update chat's last message time
        await prisma.telegramChat.update({
          where: { id },
          data: { lastMessageAt: timestamp }
        });

        console.log('✅ Message saved to database:', storedMessage.id);
      } catch (dbError) {
        console.error('❌ Error saving message to database:', dbError);
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// Update conversation AI status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { aiStatus } = req.body;

    if (!aiStatus || !['active', 'handover'].includes(aiStatus.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid aiStatus. Must be "active" or "handover"'
      });
    }

    // Try to find in ConversationThread first (for Website, WhatsApp, etc.)
    const thread = await prisma.conversationThread.findUnique({
      where: { id },
      include: {
        integration: {
          select: {
            platform: true
          }
        }
      }
    });

    if (thread) {
      // Update ConversationThread status
      const updatedThread = await prisma.conversationThread.update({
        where: { id },
        data: { 
          status: aiStatus.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'CLOSED',
          updatedAt: new Date()
        }
      });

      // Emit Socket.IO event for status change
      const io = req.app.get('io');
      if (io) {
        io.emit('status-changed', {
          chatId: thread.id,
          conversationId: id,
          platform: thread.integration.platform.toLowerCase(),
          aiStatus: aiStatus.toLowerCase()
        });
      }

      return res.json({
        success: true,
        data: {
          id: updatedThread.id,
          chatId: updatedThread.id,
          aiStatus: aiStatus.toLowerCase()
        }
      });
    }

    // Fallback to Telegram chat
    const chat = await prisma.telegramChat.findUnique({
      where: { id }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Update aiStatus
    const updatedChat = await prisma.telegramChat.update({
      where: { id },
      data: { 
        aiStatus: aiStatus.toUpperCase(),
        updatedAt: new Date()
      }
    });

    // Emit Socket.IO event for status change
    const io = req.app.get('io');
    if (io) {
      io.emit('telegram:status_changed', {
        chatId: chat.chatId.toString(),
        conversationId: id,
        aiStatus: aiStatus.toLowerCase()
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedChat.id,
        chatId: updatedChat.chatId.toString(),
        aiStatus: updatedChat.aiStatus.toLowerCase()
      }
    });

  } catch (error) {
    console.error('Error updating conversation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation status',
      message: error.message
    });
  }
});

// Get conversation metrics/stats
router.get('/metrics/summary', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Total active conversations
    const activeConversations = await prisma.telegramChat.count({
      where: {
        lastMessageAt: {
          gte: startDate
        }
      }
    });

    // Total messages
    const totalMessages = await prisma.telegramMessage.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    // Incoming vs Outgoing
    const incomingMessages = await prisma.telegramMessage.count({
      where: {
        messageDirection: 'INCOMING',
        createdAt: {
          gte: startDate
        }
      }
    });

    const outgoingMessages = await prisma.telegramMessage.count({
      where: {
        messageDirection: 'OUTGOING',
        createdAt: {
          gte: startDate
        }
      }
    });

    // Calculate AI resolution rate (mock for now)
    const aiResolutionRate = outgoingMessages > 0 
      ? Math.round((outgoingMessages / incomingMessages) * 100)
      : 0;

    // Average response time (simplified calculation)
    const avgResponseTime = '2.3m'; // You can implement proper calculation

    res.json({
      success: true,
      data: {
        activeConversations,
        totalMessages,
        incomingMessages,
        outgoingMessages,
        aiResolutionRate: `${aiResolutionRate}%`,
        avgResponseTime,
        customerSatisfaction: '4.8' // Mock data
      }
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

// Get recent activities
router.get('/activities/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent messages as activities
    const recentMessages = await prisma.telegramMessage.findMany({
      include: {
        chat: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    const activities = recentMessages.map(msg => {
      const customerName = msg.chat.firstName 
        ? `${msg.chat.firstName}${msg.chat.lastName ? ' ' + msg.chat.lastName : ''}`
        : msg.chat.username || msg.chat.title || 'Unknown';

      let type = 'message';
      let description = '';

      if (msg.messageDirection === 'INCOMING') {
        type = 'message';
        description = `New message received from ${customerName}`;
      } else if (msg.messageDirection === 'OUTGOING') {
        type = 'resolved';
        description = `Sent response to ${customerName}`;
      }

      return {
        id: msg.id,
        type,
        description,
        agent: msg.messageDirection === 'OUTGOING' ? 'AI Assistant' : 'System',
        timestamp: msg.createdAt,
        chatId: msg.chatId.toString(),
        messagePreview: msg.messageText?.substring(0, 100)
      };
    });

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities',
      message: error.message
    });
  }
});

module.exports = router;
