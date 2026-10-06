const { supabase } = require('../config/supabase');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.enableDatabaseLogging = process.env.ENABLE_DB_LOGGING === 'true';
  }

  // Log levels: error, warn, info, debug
  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
  }

  async logToDatabase(level, message, meta = {}) {
    if (!this.enableDatabaseLogging) return;

    try {
      await supabase.from('system_logs').insert([{
        level,
        message,
        meta,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
      this.logToDatabase('error', message, meta);
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
      this.logToDatabase('warn', message, meta);
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, meta));
      this.logToDatabase('info', message, meta);
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, meta));
      this.logToDatabase('debug', message, meta);
    }
  }

  // Log webhook requests
  async logWebhook(platform, req, res, processingTime, error = null) {
    try {
      const logData = {
        platform,
        webhook_url: req.originalUrl,
        request_method: req.method,
        request_headers: req.headers,
        request_body: req.body,
        response_status: res.statusCode,
        processing_time_ms: processingTime,
        error_message: error?.message || null,
        created_at: new Date().toISOString()
      };

      await supabase.from('webhook_logs').insert([logData]);
    } catch (logError) {
      console.error('Failed to log webhook:', logError);
    }
  }

  // Log API usage
  async logApiUsage(integrationId, platform, endpoint, method, requestData, responseData, statusCode, responseTime, error = null) {
    try {
      const logData = {
        integration_id: integrationId,
        platform,
        endpoint,
        method,
        request_data: requestData,
        response_data: responseData,
        status_code: statusCode,
        response_time_ms: responseTime,
        error_message: error?.message || null,
        created_at: new Date().toISOString()
      };

      await supabase.from('api_usage_logs').insert([logData]);
    } catch (logError) {
      console.error('Failed to log API usage:', logError);
    }
  }

  // Log message analytics
  async logMessageAnalytics(integrationId, platform, messageType = 'incoming') {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Try to update existing record
      const { data: existing } = await supabase
        .from('message_analytics')
        .select('*')
        .eq('integration_id', integrationId)
        .eq('platform', platform)
        .eq('date', today)
        .single();

      if (existing) {
        // Update existing record
        const updates = {
          total_messages: existing.total_messages + 1,
          updated_at: new Date().toISOString()
        };

        if (messageType === 'incoming') {
          updates.incoming_messages = existing.incoming_messages + 1;
        } else if (messageType === 'outgoing') {
          updates.outgoing_messages = existing.outgoing_messages + 1;
        }

        await supabase
          .from('message_analytics')
          .update(updates)
          .eq('id', existing.id);
      } else {
        // Create new record
        const newRecord = {
          integration_id: integrationId,
          platform,
          date: today,
          total_messages: 1,
          incoming_messages: messageType === 'incoming' ? 1 : 0,
          outgoing_messages: messageType === 'outgoing' ? 1 : 0,
          unique_chats: 1
        };

        await supabase.from('message_analytics').insert([newRecord]);
      }
    } catch (error) {
      console.error('Failed to log message analytics:', error);
    }
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;