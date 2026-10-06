const { prisma } = require('../config/supabase');

class DatabaseService {
  constructor() {
    this.prisma = prisma;
  }

  // Integration operations
  async createIntegration(data) {
    return await this.prisma.integration.create({
      data: {
        ...data,
        platform: data.platform.toUpperCase()
      }
    });
  }

  async getIntegrations(filters = {}) {
    const where = {};
    
    if (filters.platform) {
      where.platform = filters.platform.toUpperCase();
    }
    
    if (filters.status) {
      where.status = filters.status.toUpperCase();
    }

    return await this.prisma.integration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            conversationThreads: true,
            messageAnalytics: true
          }
        }
      }
    });
  }

  async getIntegrationById(id) {
    return await this.prisma.integration.findUnique({
      where: { id },
      include: {
        conversationThreads: {
          take: 10,
          orderBy: { lastActivityAt: 'desc' }
        },
        messageAnalytics: {
          take: 30,
          orderBy: { date: 'desc' }
        }
      }
    });
  }

  async updateIntegration(id, data) {
    const updateData = { ...data };
    if (updateData.platform) {
      updateData.platform = updateData.platform.toUpperCase();
    }

    return await this.prisma.integration.update({
      where: { id },
      data: updateData
    });
  }

  async deleteIntegration(id) {
    return await this.prisma.integration.delete({
      where: { id }
    });
  }

  // Telegram operations
  async createTelegramChat(chatData) {
    return await this.prisma.telegramChat.upsert({
      where: { chatId: chatData.chatId },
      update: {
        ...chatData,
        lastMessageAt: new Date()
      },
      create: {
        ...chatData,
        lastMessageAt: new Date()
      }
    });
  }

  async getTelegramChats(limit = 50, offset = 0) {
    return await this.prisma.telegramChat.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
  }

  async getTelegramChatById(chatId) {
    return await this.prisma.telegramChat.findUnique({
      where: { chatId: BigInt(chatId) },
      include: {
        messages: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async createTelegramMessage(messageData) {
    // Ensure chatId is BigInt
    const data = {
      ...messageData,
      chatId: BigInt(messageData.chatId),
      telegramMessageId: BigInt(messageData.telegramMessageId)
    };

    if (messageData.userId) {
      data.userId = BigInt(messageData.userId);
    }

    return await this.prisma.telegramMessage.create({
      data
    });
  }

  async getTelegramMessages(chatId, limit = 50, offset = 0) {
    return await this.prisma.telegramMessage.findMany({
      where: { chatId: BigInt(chatId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  async updateTelegramMessage(telegramMessageId, chatId, data) {
    return await this.prisma.telegramMessage.update({
      where: {
        telegramMessageId_chatId: {
          telegramMessageId: BigInt(telegramMessageId),
          chatId: BigInt(chatId)
        }
      },
      data
    });
  }

  // WhatsApp operations
  async createWhatsAppChat(chatData) {
    return await this.prisma.whatsAppChat.upsert({
      where: { chatId: chatData.chatId },
      update: {
        ...chatData,
        lastMessageAt: new Date()
      },
      create: {
        ...chatData,
        lastMessageAt: new Date()
      }
    });
  }

  async createWhatsAppMessage(messageData) {
    return await this.prisma.whatsAppMessage.create({
      data: messageData
    });
  }

  // Conversation operations
  async createConversationThread(threadData) {
    return await this.prisma.conversationThread.create({
      data: {
        ...threadData,
        platform: threadData.platform.toUpperCase()
      }
    });
  }

  async getConversationThreads(integrationId, limit = 50, offset = 0) {
    return await this.prisma.conversationThread.findMany({
      where: { integrationId },
      orderBy: { lastActivityAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        integration: true
      }
    });
  }

  async updateConversationThread(id, data) {
    return await this.prisma.conversationThread.update({
      where: { id },
      data: {
        ...data,
        lastActivityAt: new Date()
      }
    });
  }

  // Analytics operations
  async createOrUpdateMessageAnalytics(analyticsData) {
    const { integrationId, platform, date } = analyticsData;
    
    return await this.prisma.messageAnalytics.upsert({
      where: {
        integrationId_platform_date: {
          integrationId,
          platform: platform.toUpperCase(),
          date: new Date(date)
        }
      },
      update: {
        totalMessages: { increment: 1 },
        incomingMessages: analyticsData.messageDirection === 'INCOMING' ? { increment: 1 } : undefined,
        outgoingMessages: analyticsData.messageDirection === 'OUTGOING' ? { increment: 1 } : undefined
      },
      create: {
        integrationId,
        platform: platform.toUpperCase(),
        date: new Date(date),
        totalMessages: 1,
        incomingMessages: analyticsData.messageDirection === 'INCOMING' ? 1 : 0,
        outgoingMessages: analyticsData.messageDirection === 'OUTGOING' ? 1 : 0,
        uniqueChats: 1
      }
    });
  }

  async getMessageAnalytics(integrationId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.prisma.messageAnalytics.findMany({
      where: {
        integrationId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });
  }

  // Logging operations
  async createWebhookLog(logData) {
    return await this.prisma.webhookLog.create({
      data: {
        ...logData,
        platform: logData.platform.toUpperCase()
      }
    });
  }

  async createApiUsageLog(logData) {
    return await this.prisma.apiUsageLog.create({
      data: {
        ...logData,
        platform: logData.platform.toUpperCase()
      }
    });
  }

  async createSystemLog(level, message, meta = {}) {
    return await this.prisma.systemLog.create({
      data: {
        level: level.toUpperCase(),
        message,
        meta
      }
    });
  }

  // Statistics operations
  async getPlatformStats() {
    const integrations = await this.prisma.integration.groupBy({
      by: ['platform', 'status'],
      _count: true
    });

    const messageStats = await this.prisma.messageAnalytics.aggregate({
      _sum: {
        totalMessages: true,
        incomingMessages: true,
        outgoingMessages: true
      }
    });

    const conversationStats = await this.prisma.conversationThread.groupBy({
      by: ['status'],
      _count: true
    });

    return {
      integrations,
      messages: messageStats._sum,
      conversations: conversationStats
    };
  }

  // Health check
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }

  // Cleanup operations
  async cleanupOldLogs(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const webhookLogs = await this.prisma.webhookLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } }
    });

    const apiLogs = await this.prisma.apiUsageLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } }
    });

    const systemLogs = await this.prisma.systemLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } }
    });

    return {
      webhookLogs: webhookLogs.count,
      apiLogs: apiLogs.count,
      systemLogs: systemLogs.count
    };
  }
}

module.exports = new DatabaseService();