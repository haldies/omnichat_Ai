const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

// Simple API key authentication middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

// JWT authentication middleware
const jwtAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database with business info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        businessId: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        business: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    // If user doesn't have businessId, create a default business
    if (!user.businessId) {
      console.log(`⚠️  User ${user.email} has no business, creating default business...`);
      
      const business = await prisma.business.create({
        data: {
          name: `${user.name}'s Business`,
          email: user.email,
          status: 'ACTIVE',
          maxUsers: 10,
          maxIntegrations: 5
        }
      });

      // Update user with businessId
      await prisma.user.update({
        where: { id: user.id },
        data: { businessId: business.id }
      });

      user.businessId = business.id;
      user.business = business;
      
      console.log(`✅ Created business ${business.id} for user ${user.email}`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Auth error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Supabase authentication middleware
const supabaseAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Try JWT auth as fallback
      return jwtAuth(req, res, next);
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      // Try JWT auth as fallback
      return jwtAuth(req, res, next);
    }

    req.user = user;
    next();
  } catch (error) {
    // Try JWT auth as fallback
    return jwtAuth(req, res, next);
  }
};

// Optional authentication middleware (allows both authenticated and anonymous access)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            avatar: true
          }
        });
        
        if (user && user.status === 'ACTIVE') {
          req.user = user;
        }
      } catch (err) {
        // Continue without authentication
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role?.toLowerCase() || 'agent';
    const allowedRoles = roles.map(r => r.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Webhook signature verification middleware (for Telegram)
const verifyTelegramWebhook = (req, res, next) => {
  // Telegram doesn't require signature verification by default
  // but you can implement it if you set a secret token
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  
  if (secretToken) {
    const providedToken = req.headers['x-telegram-bot-api-secret-token'];
    
    if (providedToken !== secretToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook secret'
      });
    }
  }

  next();
};

// Rate limiting by user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, timestamps] of requests.entries()) {
      requests.set(key, timestamps.filter(time => time > windowStart));
      if (requests.get(key).length === 0) {
        requests.delete(key);
      }
    }

    // Check current user's requests
    const userRequests = requests.get(userId) || [];
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    userRequests.push(now);
    requests.set(userId, userRequests);

    next();
  };
};

module.exports = {
  apiKeyAuth,
  jwtAuth,
  supabaseAuth,
  optionalAuth,
  requireRole,
  verifyTelegramWebhook,
  userRateLimit
};