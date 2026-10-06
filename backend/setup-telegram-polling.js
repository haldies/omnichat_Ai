/**
 * Setup Telegram Bot with Polling Mode (for local development)
 * This script will continuously poll Telegram for new messages
 */

const TelegramBot = require('node-telegram-bot-api');
const { PrismaClient } = require('./prisma/generated/client');
const { emitSocketEvent } = require('./utils/socketHelper');

const prisma = new PrismaClient();

async function getBotToken() {
  try {
    const integration = await prisma.integration.findFirst({
      where: { 
        platform: 'TELEGRAM',
        status: 'ACTIVE'
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

async function upsertChat(chat) {
  try {
    await prisma.telegramChat.upsert({
      where: { chatId: BigInt(chat.id) },
      update: {
        chatType: chat.type.toUpperCase(),
        title: chat.title || null,
        username: chat.username || null,
        firstName: chat.first_name || null,
        lastName: chat.last_name || null,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        chatId: BigInt(chat.id),
        chatType: chat.type.toUpperCase(),
        title: chat.title || null,
        username: chat.username || null,
        firstName: chat.first_name || null,
        lastName: chat.last_name || null,
        lastMessageAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error upserting chat:', error);
  }
}

function getMessageType(message) {
  if (message.text) return 'TEXT';
  if (message.photo) return 'PHOTO';
  if (message.video) return 'VIDEO';
  if (message.audio) return 'AUDIO';
  if (message.voice) return 'VOICE';
  if (message.document) return 'DOCUMENT';
  if (message.sticker) return 'STICKER';
  if (message.location) return 'LOCATION';
  if (message.contact) return 'CONTACT';
  return 'OTHER';
}

async function startPolling(io) {
  try {
    const botToken = await getBotToken();
    
    console.log('\n🤖 ═══════════════════════════════════════════════════════');
    console.log('🚀 Starting Telegram Bot in POLLING MODE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📡 Bot will check for new messages every few seconds');
    console.log('💡 This is for LOCAL DEVELOPMENT only');
    console.log('🌐 For production, use WEBHOOK mode with public URL');
    console.log('═══════════════════════════════════════════════════════\n');

    const bot = new TelegramBot(botToken, { polling: true });

    // Get bot info
    const botInfo = await bot.getMe();
    console.log(`✅ Bot connected: @${botInfo.username} (${botInfo.first_name})`);
    console.log('👂 Listening for messages...\n');

    // Handle incoming messages
    bot.on('message', async (msg) => {
      try {
        const chatId = msg.chat.id;
        const messageText = msg.text || '';
        const messageType = getMessageType(msg);
        const timestamp = new Date(msg.date * 1000);

        // Log incoming message
        console.log('\n📨 ═══════════════════════════════════════════════════════');
        console.log('📱 INCOMING TELEGRAM MESSAGE');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`👤 From: ${msg.from.first_name || ''} ${msg.from.last_name || ''} (@${msg.from.username || 'no_username'})`);
        console.log(`💬 Chat: ${msg.chat.title || msg.chat.first_name || 'Private'} (ID: ${chatId})`);
        console.log(`📝 Message: ${messageText || '[Media/Other]'}`);
        console.log(`🕐 Time: ${timestamp.toLocaleString('id-ID')}`);
        console.log('═══════════════════════════════════════════════════════\n');

        // Create temporary message object for immediate Socket.IO emit
        const tempMessageId = `temp_${Date.now()}`;
        const messageData = {
          id: tempMessageId,
          telegramMessageId: msg.message_id.toString(),
          sender: 'customer',
          content: messageText,
          messageType: messageType.toLowerCase(),
          timestamp: timestamp,
          username: msg.from?.username,
          firstName: msg.from?.first_name,
          lastName: msg.from?.last_name
        };

        // Emit Socket.IO event IMMEDIATELY
        if (io) {
          emitSocketEvent(io, 'telegram:message', {
            type: 'new_message',
            chatId: chatId.toString(),
            message: messageData
          });
          console.log('✅ Message sent to frontend via Socket.IO');
        }

        // Store in database in background
        setImmediate(async () => {
          try {
            await upsertChat(msg.chat);

            await prisma.telegramMessage.create({
              data: {
                chatId: BigInt(chatId),
                telegramMessageId: BigInt(msg.message_id),
                messageText: messageText,
                messageType: messageType,
                messageDirection: 'INCOMING',
                messageData: msg,
                userId: msg.from?.id ? BigInt(msg.from.id) : null,
                username: msg.from?.username || null,
                firstName: msg.from?.first_name || null,
                lastName: msg.from?.last_name || null,
                createdAt: timestamp
              }
            });

            console.log('✅ Message saved to database\n');
          } catch (dbError) {
            console.error('❌ Error saving to database:', dbError.message);
          }
        });

      } catch (error) {
        console.error('❌ Error handling message:', error);
      }
    });

    // Handle errors
    bot.on('polling_error', (error) => {
      console.error('❌ Polling error:', error.message);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Stopping bot...');
      await bot.stopPolling();
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Stopping bot...');
      await bot.stopPolling();
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start polling:', error);
    process.exit(1);
  }
}

module.exports = { startPolling };
