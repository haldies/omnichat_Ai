const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { testConnection } = require('./config/supabase');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Import routes
const integrationRoutes = require('./routes/integrations');
const telegramRoutes = require('./routes/telegram');
const webhookRoutes = require('./routes/webhooks');
const platformRoutes = require('./routes/platforms');
const conversationRoutes = require('./routes/conversations');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/team');
const widgetRoutes = require('./routes/widget');

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4028',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Trust proxy - required for Cloudflare, ngrok, and other proxies
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Test event handler
  socket.on('test', (data) => {
    console.log('🧪 Test event received from client:', data);
    socket.emit('test-response', { message: 'Hello from backend!', receivedAt: new Date() });
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Security middleware - disable for widget files
app.use((req, res, next) => {
  if (req.path.startsWith('/widget')) {
    // Skip helmet for widget files to avoid CORS issues
    return next();
  }
  helmet()(req, res, next);
});
app.use(compression());

// Rate limiting - skip for webhooks and widget
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path.startsWith('/api/webhooks') || req.path.startsWith('/api/widget')
});
app.use('/api/', limiter);

// Widget-specific rate limiting (more permissive)
const widgetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute per IP
  message: 'Too many messages, please slow down.',
  keyGenerator: (req) => {
    // Rate limit by IP + widgetId combination
    return `${req.ip}-${req.body?.widgetId || 'unknown'}`;
  }
});
app.use('/api/widget/message', widgetLimiter);

// CORS middleware - allow all origins for widget
app.use((req, res, next) => {
  // Allow all origins for widget files and API
  if (req.path.startsWith('/widget') || req.path.startsWith('/api/widget')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    return next();
  }
  
  // Regular CORS for API
  cors({
    origin: function (origin, callback) {
      console.log('🌐 CORS request from origin:', origin);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('✅ Allowing request with no origin');
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log('✅ Origin allowed:', origin);
        callback(null, true);
      } else {
        console.log('❌ Origin not allowed:', origin);
        console.log('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
  })(req, res, next);
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve widget files with proper headers
app.use('/widget', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Content-Type', req.path.endsWith('.js') ? 'application/javascript' : 'text/html');
  next();
}, express.static('public/widget', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await require('./services/databaseService').healthCheck();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: { status: 'unhealthy', error: error.message }
    });
  }
});

// API routes
app.use('/api/integrations', integrationRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/widget', widgetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Auto-setup Telegram webhook on server start
async function setupTelegramWebhook() {
  try {
    const { prisma } = require('./config/supabase');
    const TelegramService = require('./services/telegramService');
    
    // Get active Telegram integration
    const integration = await prisma.integration.findFirst({
      where: { 
        platform: 'TELEGRAM',
        status: 'ACTIVE'
      }
    });

    if (!integration || !integration.config?.botToken) {
      console.log('⚠️  Telegram: No active integration found, skipping webhook setup');
      return;
    }

    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('⚠️  Telegram: TELEGRAM_WEBHOOK_URL not set in .env, skipping webhook setup');
      return;
    }

    const botToken = integration.config.botToken;
    const telegramService = new TelegramService(botToken);

    // Get bot info
    const botInfo = await telegramService.getBotInfo();
    console.log(`🤖 Telegram: Bot found - @${botInfo.username}`);

    // Setup webhook
    await telegramService.setWebhook(webhookUrl);
    console.log(`✅ Telegram: Webhook set to ${webhookUrl}`);

    // Verify webhook
    const webhookInfo = await telegramService.getWebhookInfo();
    if (webhookInfo.url === webhookUrl) {
      console.log(`✅ Telegram: Webhook verified successfully`);
    } else {
      console.log(`⚠️  Telegram: Webhook verification failed`);
    }
  } catch (error) {
    console.error('❌ Telegram: Failed to setup webhook:', error.message);
  }
}

// Initialize database connection and start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    // Start server
    httpServer.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: Connected with Prisma + PostgreSQL`);
      console.log(`🔌 Socket.IO: Real-time enabled`);
      
      // Auto-setup Telegram webhook
      await setupTelegramWebhook();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };
