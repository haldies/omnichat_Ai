const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample integrations
    console.log('📝 Creating sample integrations...');
    
    const telegramIntegration = await prisma.integration.upsert({
      where: { 
        id: 'telegram-demo-integration' 
      },
      update: {},
      create: {
        id: 'telegram-demo-integration',
        name: 'Demo Telegram Bot',
        platform: 'TELEGRAM',
        description: 'Demo Telegram integration for testing and development',
        config: {
          botToken: 'your_bot_token_here',
          webhookUrl: 'https://your-domain.com/api/webhooks/telegram',
          allowedUpdates: ['message', 'edited_message', 'callback_query']
        },
        status: 'INACTIVE'
      }
    });

    const whatsappIntegration = await prisma.integration.upsert({
      where: { 
        id: 'whatsapp-demo-integration' 
      },
      update: {},
      create: {
        id: 'whatsapp-demo-integration',
        name: 'WhatsApp Business Demo',
        platform: 'WHATSAPP',
        description: 'Demo WhatsApp Business integration',
        config: {
          accessToken: 'your_access_token_here',
          phoneNumberId: 'your_phone_number_id_here',
          webhookVerifyToken: 'your_verify_token_here'
        },
        status: 'INACTIVE'
      }
    });

    console.log(`✅ Created integration: ${telegramIntegration.name}`);
    console.log(`✅ Created integration: ${whatsappIntegration.name}`);

    // Create sample Telegram chat
    console.log('💬 Creating sample Telegram chat...');
    
    const sampleChat = await prisma.telegramChat.upsert({
      where: {
        chatId: BigInt(123456789)
      },
      update: {},
      create: {
        chatId: BigInt(123456789),
        chatType: 'PRIVATE',
        firstName: 'Demo',
        lastName: 'User',
        username: 'demo_user',
        lastMessageAt: new Date()
      }
    });

    console.log(`✅ Created sample chat: ${sampleChat.firstName} ${sampleChat.lastName}`);

    // Create sample messages
    console.log('📨 Creating sample messages...');
    
    const sampleMessages = [
      {
        chatId: BigInt(123456789),
        telegramMessageId: BigInt(1),
        messageText: 'Hello! This is a demo message.',
        messageType: 'TEXT',
        messageDirection: 'INCOMING',
        userId: BigInt(987654321),
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User'
      },
      {
        chatId: BigInt(123456789),
        telegramMessageId: BigInt(2),
        messageText: 'Welcome to OmniChat! How can I help you today?',
        messageType: 'TEXT',
        messageDirection: 'OUTGOING'
      }
    ];

    for (const messageData of sampleMessages) {
      await prisma.telegramMessage.upsert({
        where: {
          telegramMessageId_chatId: {
            telegramMessageId: messageData.telegramMessageId,
            chatId: messageData.chatId
          }
        },
        update: {},
        create: messageData
      });
    }

    console.log(`✅ Created ${sampleMessages.length} sample messages`);

    // Create sample conversation thread
    console.log('🧵 Creating sample conversation thread...');
    
    const conversationThread = await prisma.conversationThread.upsert({
      where: {
        integrationId_externalChatId_platform: {
          integrationId: telegramIntegration.id,
          externalChatId: '123456789',
          platform: 'TELEGRAM'
        }
      },
      update: {},
      create: {
        integrationId: telegramIntegration.id,
        externalChatId: '123456789',
        platform: 'TELEGRAM',
        threadTitle: 'Demo User Conversation',
        participantCount: 1,
        status: 'ACTIVE',
        priority: 'NORMAL',
        tags: ['demo', 'test']
      }
    });

    console.log(`✅ Created conversation thread: ${conversationThread.threadTitle}`);

    // Create sample message analytics
    console.log('📊 Creating sample analytics...');
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const analyticsData = [
      {
        integrationId: telegramIntegration.id,
        platform: 'TELEGRAM',
        date: today,
        totalMessages: 15,
        incomingMessages: 8,
        outgoingMessages: 7,
        uniqueChats: 3,
        responseTimeAvg: 2500 // 2.5 seconds
      },
      {
        integrationId: telegramIntegration.id,
        platform: 'TELEGRAM',
        date: yesterday,
        totalMessages: 23,
        incomingMessages: 12,
        outgoingMessages: 11,
        uniqueChats: 5,
        responseTimeAvg: 1800 // 1.8 seconds
      }
    ];

    for (const analytics of analyticsData) {
      await prisma.messageAnalytics.upsert({
        where: {
          integrationId_platform_date: {
            integrationId: analytics.integrationId,
            platform: analytics.platform,
            date: analytics.date
          }
        },
        update: {},
        create: analytics
      });
    }

    console.log(`✅ Created ${analyticsData.length} analytics records`);

    // Create sample API key
    console.log('🔑 Creating sample API key...');
    
    const apiKey = await prisma.apiKey.upsert({
      where: {
        key: 'demo_api_key_12345'
      },
      update: {},
      create: {
        name: 'Demo API Key',
        key: 'demo_api_key_12345',
        permissions: ['read', 'write'],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });

    console.log(`✅ Created API key: ${apiKey.name}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - ${2} integrations created`);
    console.log(`   - ${1} Telegram chat created`);
    console.log(`   - ${sampleMessages.length} messages created`);
    console.log(`   - ${1} conversation thread created`);
    console.log(`   - ${analyticsData.length} analytics records created`);
    console.log(`   - ${1} API key created`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });