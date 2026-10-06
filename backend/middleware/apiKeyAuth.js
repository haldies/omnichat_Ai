const { prisma } = require('../config/supabase');

/**
 * API Key Authentication Middleware
 * Validates API key from header and attaches business info to request
 */
async function apiKeyAuth(req, res, next) {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        message: 'Please provide an API key in X-API-Key header or Authorization header'
      });
    }

    // Find API key in database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey }
    });

    if (!apiKeyRecord) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }

    // Check if API key is expired
    if (apiKeyRecord.expiresAt && new Date(apiKeyRecord.expiresAt) < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'API key expired',
        message: 'The provided API key has expired'
      });
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    }).catch(err => console.error('Failed to update API key last used:', err));

    // Attach API key info to request
    req.apiKey = apiKeyRecord;
    req.apiKeyId = apiKeyRecord.id;

    // Get business info if businessId exists in permissions
    if (apiKeyRecord.permissions?.businessId) {
      const business = await prisma.business.findUnique({
        where: { id: apiKeyRecord.permissions.businessId }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          error: 'Business not found',
          message: 'The business associated with this API key does not exist'
        });
      }

      if (business.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          error: 'Business inactive',
          message: 'The business associated with this API key is not active'
        });
      }

      req.business = business;
      req.businessId = business.id;
    }

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * Optional API Key Auth - allows requests without API key but attaches info if provided
 */
async function optionalApiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey) {
    return next();
  }

  try {
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey }
    });

    if (apiKeyRecord && (!apiKeyRecord.expiresAt || new Date(apiKeyRecord.expiresAt) >= new Date())) {
      req.apiKey = apiKeyRecord;
      req.apiKeyId = apiKeyRecord.id;

      if (apiKeyRecord.permissions?.businessId) {
        const business = await prisma.business.findUnique({
          where: { id: apiKeyRecord.permissions.businessId }
        });

        if (business && business.status === 'ACTIVE') {
          req.business = business;
          req.businessId = business.id;
        }
      }

      // Update last used
      await prisma.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() }
      }).catch(err => console.error('Failed to update API key last used:', err));
    }
  } catch (error) {
    console.error('Optional API key auth error:', error);
  }

  next();
}

/**
 * Check if API key has specific permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const permissions = req.apiKey.permissions || {};
    
    // Check if permission exists and is true
    if (permissions[permission] !== true && !permissions.all) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This API key does not have '${permission}' permission`
      });
    }

    next();
  };
}

module.exports = {
  apiKeyAuth,
  optionalApiKeyAuth,
  requirePermission
};
