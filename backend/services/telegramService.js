const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
  constructor(botToken = null) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN;
    
    if (!this.botToken) {
      console.warn('Telegram bot token not provided. Telegram features will be disabled.');
      return;
    }

    // Initialize bot without polling (we'll use webhooks)
    this.bot = new TelegramBot(this.botToken, { polling: false });
  }

  // Check if bot is properly configured
  isConfigured() {
    return !!this.botToken && !!this.bot;
  }

  // Get bot information
  async getBotInfo() {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const botInfo = await this.bot.getMe();
      return botInfo;
    } catch (error) {
      console.error('Error getting bot info:', error);
      throw new Error('Failed to get bot information');
    }
  }

  // Set webhook
  async setWebhook(url, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const defaultOptions = {
        allowed_updates: ['message', 'edited_message', 'callback_query', 'inline_query']
      };

      const webhookOptions = { ...defaultOptions, ...options };
      const result = await this.bot.setWebHook(url, webhookOptions);
      
      console.log(`Webhook set to: ${url}`);
      return result;
    } catch (error) {
      console.error('Error setting webhook:', error);
      throw new Error('Failed to set webhook');
    }
  }

  // Get webhook info
  async getWebhookInfo() {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const webhookInfo = await this.bot.getWebHookInfo();
      return webhookInfo;
    } catch (error) {
      console.error('Error getting webhook info:', error);
      throw new Error('Failed to get webhook information');
    }
  }

  // Delete webhook
  async deleteWebhook() {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const result = await this.bot.deleteWebHook();
      console.log('Webhook deleted');
      return result;
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw new Error('Failed to delete webhook');
    }
  }

  // Send message
  async sendMessage(chatId, text, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const defaultOptions = {
        parse_mode: 'HTML'
      };

      const messageOptions = { ...defaultOptions, ...options };
      const result = await this.bot.sendMessage(chatId, text, messageOptions);
      
      console.log(`Message sent to chat ${chatId}`);
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Send photo
  async sendPhoto(chatId, photo, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const result = await this.bot.sendPhoto(chatId, photo, options);
      console.log(`Photo sent to chat ${chatId}`);
      return result;
    } catch (error) {
      console.error('Error sending photo:', error);
      throw new Error('Failed to send photo');
    }
  }

  // Send document
  async sendDocument(chatId, document, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const result = await this.bot.sendDocument(chatId, document, options);
      console.log(`Document sent to chat ${chatId}`);
      return result;
    } catch (error) {
      console.error('Error sending document:', error);
      throw new Error('Failed to send document');
    }
  }

  // Edit message
  async editMessageText(text, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const result = await this.bot.editMessageText(text, options);
      console.log('Message edited');
      return result;
    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error('Failed to edit message');
    }
  }

  // Delete message
  async deleteMessage(chatId, messageId) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const result = await this.bot.deleteMessage(chatId, messageId);
      console.log(`Message ${messageId} deleted from chat ${chatId}`);
      return result;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  // Answer callback query
  async answerCallbackQuery(callbackQueryId, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const result = await this.bot.answerCallbackQuery(callbackQueryId, options);
      return result;
    } catch (error) {
      console.error('Error answering callback query:', error);
      throw new Error('Failed to answer callback query');
    }
  }

  // Answer inline query
  async answerInlineQuery(inlineQueryId, results, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const result = await this.bot.answerInlineQuery(inlineQueryId, results, options);
      return result;
    } catch (error) {
      console.error('Error answering inline query:', error);
      throw new Error('Failed to answer inline query');
    }
  }

  // Get chat
  async getChat(chatId) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const chat = await this.bot.getChat(chatId);
      return chat;
    } catch (error) {
      console.error('Error getting chat:', error);
      throw new Error('Failed to get chat information');
    }
  }

  // Get chat member
  async getChatMember(chatId, userId) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const member = await this.bot.getChatMember(chatId, userId);
      return member;
    } catch (error) {
      console.error('Error getting chat member:', error);
      throw new Error('Failed to get chat member information');
    }
  }

  // Send message with inline keyboard
  async sendMessageWithKeyboard(chatId, text, keyboard, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Telegram bot not configured');
    }

    try {
      const messageOptions = {
        ...options,
        reply_markup: {
          inline_keyboard: keyboard
        }
      };

      const result = await this.sendMessage(chatId, text, messageOptions);
      return result;
    } catch (error) {
      console.error('Error sending message with keyboard:', error);
      throw new Error('Failed to send message with keyboard');
    }
  }

  // Create inline keyboard button
  createInlineButton(text, callbackData) {
    return {
      text: text,
      callback_data: callbackData
    };
  }

  // Create URL button
  createUrlButton(text, url) {
    return {
      text: text,
      url: url
    };
  }

  // Format message with HTML
  formatHtmlMessage(text, options = {}) {
    let formatted = text;

    if (options.bold) {
      formatted = `<b>${formatted}</b>`;
    }

    if (options.italic) {
      formatted = `<i>${formatted}</i>`;
    }

    if (options.code) {
      formatted = `<code>${formatted}</code>`;
    }

    if (options.link) {
      formatted = `<a href="${options.link}">${formatted}</a>`;
    }

    return formatted;
  }

  // Escape HTML characters
  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

module.exports = TelegramService;