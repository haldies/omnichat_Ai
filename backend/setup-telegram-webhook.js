/**
 * Setup Telegram Webhook
 * Run this script to configure Telegram webhook with your public URL
 */

const { PrismaClient } = require('./prisma/generated/client');
const TelegramService = require('./services/telegramService');

const prisma = new PrismaClient();

async function setupWebhook() {
  try {
    console.log('\n🤖 ═══════════════════════════════════════════════════════');
    console.log('🔧 Setting up Telegram Webhook');
    console.log('═══════════════════════════════════════════════════════\n');

    // Get active Telegram integration
    const integration = await prisma.integration.findFirst({
      where: { 
        platform: 'TELEGRAM',
        status: 'ACTIVE'
      }
    });

    if (!integration || !integration.config?.botToken) {
      console.error('❌ No active Telegram integration found');
      console.log('💡 Please create a Telegram integration first in the app');
      process.exit(1);
    }

    const botToken = integration.config.botToken;
    const telegramService = new TelegramService(botToken);

    // Get bot info
    const botInfo = await telegramService.getBotInfo();
    console.log(`✅ Bot found: @${botInfo.username} (${botInfo.first_name})`);

    // Setup webhook URL from environment variable
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('❌ TELEGRAM_WEBHOOK_URL not set in .env file');
      console.log('💡 Please add TELEGRAM_WEBHOOK_URL to your .env file');
      process.exit(1);
    }
    
    console.log(`\n🌐 Setting webhook URL: ${webhookUrl}`);
    
    await telegramService.setWebhook(webhookUrl);
    
    console.log('✅ Webhook set successfully!');
    
    // Verify webhook
    const webhookInfo = await telegramService.getWebhookInfo();
    console.log('\n📋 Webhook Info:');
    console.log(`   URL: ${webhookInfo.url}`);
    console.log(`   Pending Updates: ${webhookInfo.pending_update_count}`);
    console.log(`   Max Connections: ${webhookInfo.max_connections || 40}`);
    
    if (webhookInfo.last_error_date) {
      console.log(`   ⚠️  Last Error: ${webhookInfo.last_error_message}`);
      console.log(`   Error Date: ${new Date(webhookInfo.last_error_date * 1000).toLocaleString()}`);
    }
    
    console.log('\n✅ Setup complete! Your bot is now ready to receive messages.');
    console.log('💬 Try sending a message to your bot on Telegram!');

    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
setupWebhook();
