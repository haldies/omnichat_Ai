#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting OmniChat Backend Development Server...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Please copy .env.example to .env and configure your settings:');
  console.log('   cp .env.example .env\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please update your .env file with the missing variables.\n');
  process.exit(1);
}

// Check if Telegram bot token is configured
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.log('⚠️  Telegram bot token not configured.');
  console.log('   Telegram features will be disabled.');
  console.log('   Add TELEGRAM_BOT_TOKEN to your .env file to enable Telegram integration.\n');
}

console.log('✅ Environment variables loaded');

// Check if database is set up
console.log('🔍 Checking database setup...');

try {
  const { supabase } = require('../config/supabase');
  
  // Test connection by trying to fetch from integrations table
  supabase.from('integrations').select('*').limit(1)
    .then(({ error }) => {
      if (error) {
        console.log('❌ Database not set up or connection failed.');
        console.log('📊 Run the following command to set up the database:');
        console.log('   npm run db:setup\n');
        
        // Ask user if they want to set up database now
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        rl.question('Would you like to set up the database now? (y/N): ', (answer) => {
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            console.log('\n🔧 Setting up database...');
            try {
              execSync('npm run db:setup', { stdio: 'inherit' });
              console.log('\n✅ Database setup completed!');
              startServer();
            } catch (error) {
              console.log('\n❌ Database setup failed:', error.message);
              process.exit(1);
            }
          } else {
            console.log('\n⚠️  Skipping database setup. Server may not work properly.');
            startServer();
          }
          rl.close();
        });
      } else {
        console.log('✅ Database connection successful');
        startServer();
      }
    })
    .catch((error) => {
      console.log('❌ Database connection failed:', error.message);
      console.log('📊 Please check your Supabase configuration and run:');
      console.log('   npm run db:setup\n');
      process.exit(1);
    });
    
} catch (error) {
  console.log('❌ Failed to load database configuration:', error.message);
  process.exit(1);
}

function startServer() {
  console.log('\n🚀 Starting development server...');
  console.log('📊 Server will be available at: http://localhost:' + (process.env.PORT || 3001));
  console.log('🔍 Health check: http://localhost:' + (process.env.PORT || 3001) + '/health');
  
  if (process.env.TELEGRAM_BOT_TOKEN) {
    console.log('🤖 Telegram bot configured');
  }
  
  console.log('\n📝 Logs will appear below:\n');
  
  // Start the server
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.log('\n❌ Server failed to start:', error.message);
    process.exit(1);
  }
}