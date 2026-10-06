const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('../prisma/generated/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase clients (optional for now)
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;
  console.log('✅ Supabase clients initialized');
} else {
  console.log('⚠️  Supabase clients not initialized (missing credentials)');
}

// Prisma client with PostgreSQL adapter for Supabase
let prisma;

try {
  // Create connection pool for Prisma
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Create Prisma adapter
  const adapter = new PrismaPg(pool);

  // Initialize Prisma client with adapter
  prisma = new PrismaClient({ 
    adapter,
    log: ['error'] // Only log errors, no query logs
  });

  console.log('✅ Prisma client initialized with PostgreSQL adapter');
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error.message);
  
  // Fallback to regular Prisma client without adapter
  prisma = new PrismaClient({
    log: ['error'] // Only log errors, no query logs
  });
}

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = {
  supabase,
  supabaseAdmin,
  prisma,
  testConnection
};