const express = require('express');
const TelegramService = require('../services/telegramService');
const { prisma } = require('../config/supabase');
const { emitSocketEvent } = require('../utils/socketHelper');

const router = express.Router();

// Get bot token from database
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

// Telegram webhook endpoint
router.post('/telegram', async (req, res) => {
  try {
    const update = req.body;
    
    // Log incoming message with clear formatting
    if (update.message) {
      const msg = update.message;
      const from = msg.from;
      const chat = msg.chat;
      console.log('\n📨 ═══════════════════════════════════════════════════════');
      console.log('📱 INCOMING TELEGRAM MESSAGE');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`👤 From: ${from.first_name || ''} ${from.last_name || ''} (@${from.username || 'no_username'})`);
      console.log(`💬 Chat: ${chat.title || chat.first_name || 'Private'} (ID: ${chat.id})`);
      console.log(`📝 Message: ${msg.text || '[Media/Other]'}`);
      console.log(`🕐 Time: ${new Date(msg.date * 1000).toLocaleString('id-ID')}`);
      console.log('═══════════════════════════════════════════════════════\n');
    }

    // Process the update
    await processTelegramUpdate(update);

    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error processing Telegram webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process webhook' 
    });
  }
});

// Process Telegram updates
async function processTelegramUpdate(update) {
  try {
    if (update.message) {
      await handleMessage(update.message);
    } else if (update.edited_message) {
      await handleEditedMessage(update.edited_message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    } else if (update.inline_query) {
      await handleInlineQuery(update.inline_query);
    }
  } catch (error) {
    console.error('Error processing update:', error);
    throw error;
  }
}

// Handle incoming messages
async function handleMessage(message) {
  try {
    const chatId = message.chat.id;
    const messageText = message.text || '';
    const messageType = getMessageType(message);
    const timestamp = new Date(message.date * 1000);

    // Create temporary message object for immediate Socket.IO emit
    const tempMessageId = `temp_${Date.now()}`;
    const messageData = {
      id: tempMessageId,
      telegramMessageId: message.message_id.toString(),
      sender: 'customer',
      content: messageText,
      messageType: messageType.toLowerCase(),
      timestamp: timestamp,
      username: message.from?.username,
      firstName: message.from?.first_name,
      lastName: message.from?.last_name
    };

    // Emit Socket.IO event IMMEDIATELY for real-time update
    const io = require('../server').io;
    if (io) {
      emitSocketEvent(io, 'telegram:message', {
        type: 'new_message',
        chatId: chatId.toString(),
        message: messageData
      });
    }

    // Store in database in background (non-blocking)
    setImmediate(async () => {
      try {
        // Store chat information
        await upsertChat(message.chat);

        // Store message using Prisma
        const storedMessage = await prisma.telegramMessage.create({
          data: {
            chatId: BigInt(chatId),
            telegramMessageId: BigInt(message.message_id),
            messageText: messageText,
            messageType: messageType.toUpperCase(),
            messageDirection: 'INCOMING',
            messageData: message,
            userId: message.from?.id ? BigInt(message.from.id) : null,
            username: message.from?.username || null,
            firstName: message.from?.first_name || null,
            lastName: message.from?.last_name || null,
            createdAt: timestamp
          }
        });

        console.log('✅ Incoming message saved to database:', storedMessage.id);
      } catch (dbError) {
        console.error('❌ Error saving incoming message to database:', dbError);
      }
    });

    // Process commands
    if (messageText.startsWith('/')) {
      await handleCommand(message);
    } else {
      // Handle regular messages - you can add AI processing here
      await handleRegularMessage(message);
    }

  } catch (error) {
    console.error('Error handling message:', error);
    throw error;
  }
}

// Handle edited messages
async function handleEditedMessage(message) {
  try {
    // Update the message in database using Prisma
    await prisma.telegramMessage.updateMany({
      where: {
        telegramMessageId: BigInt(message.message_id),
        chatId: BigInt(message.chat.id)
      },
      data: {
        messageText: message.text || '',
        messageData: message,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error handling edited message:', error);
    throw error;
  }
}

// Handle callback queries (inline keyboard buttons)
async function handleCallbackQuery(callbackQuery) {
  try {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Answer the callback query
    await telegramService.answerCallbackQuery(callbackQuery.id);

    // Process the callback data
    // You can add your callback handling logic here
    console.log('Callback query received:', data);

  } catch (error) {
    console.error('Error handling callback query:', error);
    throw error;
  }
}

// Handle inline queries
async function handleInlineQuery(inlineQuery) {
  try {
    // You can implement inline query handling here
    console.log('Inline query received:', inlineQuery.query);
    
    // Answer with empty results for now
    await telegramService.answerInlineQuery(inlineQuery.id, []);

  } catch (error) {
    console.error('Error handling inline query:', error);
    throw error;
  }
}

// Handle bot commands
async function handleCommand(message) {
  try {
    const command = message.text.split(' ')[0].toLowerCase();
    const chatId = message.chat.id;
    
    // Get bot token and create service instance
    const botToken = await getBotToken();
    const telegramService = new TelegramService(botToken);

    switch (command) {
      case '/start':
        // Just log, don't send auto-reply
        console.log('📝 /start command received from:', chatId);
        // Agent can reply manually from dashboard
        break;

      case '/help':
        // Just log, don't send auto-reply
        console.log('📝 /help command received from:', chatId);
        break;

      case '/status':
        // Just log, don't send auto-reply
        console.log('📝 /status command received from:', chatId);
        break;

      case '/settings':
        // Just log, don't send auto-reply
        console.log('📝 /settings command received from:', chatId);
        break;

      default:
        console.log('📝 Unknown command received:', command);
    }
  } catch (error) {
    console.error('Error handling command:', error);
    throw error;
  }
}

// Handle regular messages (non-commands)
async function handleRegularMessage(message) {
  try {
    const chatId = message.chat.id;
    const messageText = message.text;

    console.log('📨 Regular message received:', {
      chatId: chatId,
      text: messageText,
      from: message.from
    });

    // Check if chat has AI enabled
    const chat = await prisma.telegramChat.findUnique({
      where: { chatId: BigInt(chatId) }
    });

    if (chat && chat.aiStatus === 'ACTIVE') {
      console.log('🤖 AI auto-reply is ENABLED for this chat');
      
      // Call RAG API for AI response
      try {
        const fetch = require('node-fetch');
        const ragApiUrl = process.env.RAG_API_URL || 'http://localhost:8000';
        
        // Get business ID from integration
        const integration = await prisma.integration.findFirst({
          where: { 
            platform: 'TELEGRAM',
            status: 'ACTIVE'
          }
        });

        if (!integration) {
          console.log('⚠️  No active integration found, skipping AI reply');
          return;
        }

        console.log('🧠 Querying RAG API...');
        const ragResponse = await fetch(`${ragApiUrl}/api/v1/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Business-ID': integration.businessId
          },
          body: JSON.stringify({
            query: messageText,
            top_k: 3
          })
        });

        if (!ragResponse.ok) {
          console.log('⚠️  RAG API error:', ragResponse.status);
          return;
        }

        const ragData = await ragResponse.json();
        const aiAnswer = ragData.answer;

        console.log('✅ AI Response:', aiAnswer.substring(0, 100) + '...');

        // Format AI response with business name signature
        const formattedAnswer = `${aiAnswer}\n\n— OmniChat AI`;

        // Send AI response back to user
        const botToken = await getBotToken();
        const telegramService = new TelegramService(botToken);
        
        const sentMessage = await telegramService.sendMessage(
          chatId.toString(),
          formattedAnswer
        );

        console.log('📤 AI response sent to user');

        // Store AI response in database (background)
        setImmediate(async () => {
          try {
            await prisma.telegramMessage.create({
              data: {
                chatId: BigInt(chatId),
                telegramMessageId: BigInt(sentMessage.message_id),
                messageText: formattedAnswer,
                messageType: 'TEXT',
                messageDirection: 'OUTGOING',
                messageData: sentMessage,
                createdAt: new Date(sentMessage.date * 1000)
              }
            });

            // Emit Socket.IO event
            const io = require('../server').io;
            if (io) {
              emitSocketEvent(io, 'telegram:message', {
                type: 'sent_message',
                chatId: chatId.toString(),
                message: {
                  id: `ai_${Date.now()}`,
                  telegramMessageId: sentMessage.message_id.toString(),
                  sender: 'agent',
                  content: formattedAnswer,
                  messageType: 'text',
                  timestamp: new Date(sentMessage.date * 1000)
                }
              });
            }

            console.log('✅ AI response saved to database');
          } catch (dbError) {
            console.error('❌ Error saving AI response:', dbError);
          }
        });

      } catch (aiError) {
        console.error('❌ Error processing AI response:', aiError);
      }
    } else {
      console.log('👤 AI auto-reply is DISABLED, waiting for manual reply');
    }

  } catch (error) {
    console.error('Error handling regular message:', error);
    throw error;
  }
}

// Upsert chat information
async function upsertChat(chat) {
  try {
    const chatData = {
      chatId: BigInt(chat.id),
      chatType: chat.type.toUpperCase(),
      title: chat.title || null,
      username: chat.username || null,
      firstName: chat.first_name || null,
      lastName: chat.last_name || null,
      description: chat.description || null,
      lastMessageAt: new Date(),
      updatedAt: new Date()
    };

    // Use upsert with Prisma
    await prisma.telegramChat.upsert({
      where: { chatId: BigInt(chat.id) },
      update: {
        ...chatData,
        createdAt: undefined // Don't update createdAt
      },
      create: chatData
    });

    // Emit Socket.IO event for chat update (convert BigInt to string)
    const io = require('../server').io;
    if (io) {
      emitSocketEvent(io, 'telegram:chat_updated', {
        chatId: chat.id.toString(),
        chat: {
          chatId: chat.id.toString(),
          chatType: chat.type.toUpperCase(),
          title: chat.title || null,
          username: chat.username || null,
          firstName: chat.first_name || null,
          lastName: chat.last_name || null,
          description: chat.description || null,
          lastMessageAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

  } catch (error) {
    console.error('Error upserting chat:', error);
    throw error;
  }
}

// Get message type
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

module.exports = router;