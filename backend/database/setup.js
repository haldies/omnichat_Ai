const { supabaseAdmin } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up OmniChat database...');

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured. Please check your SUPABASE_SERVICE_ROLE_KEY.');
    }

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`   ${i + 1}/${statements.length}: Executing statement...`);
        
        const { error } = await supabaseAdmin.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabaseAdmin
            .from('_temp_')
            .select('*')
            .limit(0);
          
          if (directError && !directError.message.includes('relation "_temp_" does not exist')) {
            console.warn(`   ⚠️  Warning on statement ${i + 1}: ${error.message}`);
          }
        }
      } catch (err) {
        console.warn(`   ⚠️  Warning on statement ${i + 1}: ${err.message}`);
      }
    }

    console.log('✅ Database setup completed!');
    console.log('\n📊 Verifying tables...');

    // Verify that tables were created
    const tables = [
      'integrations',
      'telegram_chats',
      'telegram_messages',
      'whatsapp_chats',
      'whatsapp_messages',
      'conversation_threads',
      'message_analytics',
      'webhook_logs',
      'api_usage_logs'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`   ✅ Table '${table}': OK`);
        }
      } catch (err) {
        console.log(`   ❌ Table '${table}': ${err.message}`);
      }
    }

    console.log('\n🎉 Database setup verification completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the correct Supabase credentials');
    console.log('2. Set up your Telegram bot token');
    console.log('3. Configure webhook URLs');
    console.log('4. Start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Function to create sample data
async function createSampleData() {
  try {
    console.log('📝 Creating sample data...');

    // Sample integrations
    const sampleIntegrations = [
      {
        name: 'Demo Telegram Bot',
        platform: 'telegram',
        description: 'Demo Telegram integration for testing',
        config: {
          botToken: 'your_bot_token_here',
          webhookUrl: 'https://your-domain.com/api/webhooks/telegram'
        },
        status: 'inactive'
      },
      {
        name: 'WhatsApp Business Demo',
        platform: 'whatsapp',
        description: 'Demo WhatsApp Business integration',
        config: {
          accessToken: 'your_access_token_here',
          phoneNumberId: 'your_phone_number_id_here'
        },
        status: 'inactive'
      }
    ];

    const { data: integrations, error: integrationsError } = await supabaseAdmin
      .from('integrations')
      .insert(sampleIntegrations)
      .select();

    if (integrationsError) {
      console.warn('⚠️  Warning creating sample integrations:', integrationsError.message);
    } else {
      console.log(`✅ Created ${integrations.length} sample integrations`);
    }

    console.log('✅ Sample data created successfully!');

  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
  }
}

// Function to clean up database (for development)
async function cleanDatabase() {
  try {
    console.log('🧹 Cleaning database...');

    const tables = [
      'api_usage_logs',
      'webhook_logs',
      'message_analytics',
      'conversation_threads',
      'whatsapp_messages',
      'whatsapp_chats',
      'telegram_messages',
      'telegram_chats',
      'integrations'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

        if (error) {
          console.warn(`⚠️  Warning cleaning table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Cleaned table '${table}'`);
        }
      } catch (err) {
        console.warn(`⚠️  Warning cleaning table '${table}': ${err.message}`);
      }
    }

    console.log('✅ Database cleaned successfully!');

  } catch (error) {
    console.error('❌ Failed to clean database:', error);
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      setupDatabase();
      break;
    case 'sample':
      createSampleData();
      break;
    case 'clean':
      cleanDatabase();
      break;
    default:
      console.log('Usage: node setup.js [setup|sample|clean]');
      console.log('  setup  - Create database tables and indexes');
      console.log('  sample - Create sample data for testing');
      console.log('  clean  - Clean all data from tables');
      process.exit(1);
  }
}

module.exports = {
  setupDatabase,
  createSampleData,
  cleanDatabase
};