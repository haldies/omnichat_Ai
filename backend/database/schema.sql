-- OmniChat Database Schema
-- This file contains the complete database schema for the OmniChat application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('telegram', 'whatsapp', 'discord', 'slack')),
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telegram chats table
CREATE TABLE IF NOT EXISTS telegram_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id BIGINT UNIQUE NOT NULL,
    chat_type VARCHAR(20) NOT NULL CHECK (chat_type IN ('private', 'group', 'supergroup', 'channel')),
    title VARCHAR(255),
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    description TEXT,
    invite_link VARCHAR(500),
    pinned_message_id BIGINT,
    permissions JSONB,
    slow_mode_delay INTEGER,
    message_auto_delete_time INTEGER,
    has_protected_content BOOLEAN DEFAULT FALSE,
    sticker_set_name VARCHAR(255),
    can_set_sticker_set BOOLEAN DEFAULT FALSE,
    linked_chat_id BIGINT,
    location JSONB,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telegram messages table
CREATE TABLE IF NOT EXISTS telegram_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id BIGINT NOT NULL,
    telegram_message_id BIGINT NOT NULL,
    message_text TEXT,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'photo', 'video', 'audio', 'voice', 'document', 'sticker', 'location', 'contact', 'other', 'incoming', 'outgoing')),
    message_data JSONB,
    user_id BIGINT,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    reply_to_message_id BIGINT,
    forward_from_chat_id BIGINT,
    forward_from_message_id BIGINT,
    edit_date TIMESTAMP WITH TIME ZONE,
    media_group_id VARCHAR(255),
    has_media_spoiler BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint for telegram message ID and chat ID
    UNIQUE(telegram_message_id, chat_id)
);

-- WhatsApp chats table (for future use)
CREATE TABLE IF NOT EXISTS whatsapp_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    display_name VARCHAR(255),
    profile_name VARCHAR(255),
    chat_type VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (chat_type IN ('individual', 'group')),
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp messages table (for future use)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id VARCHAR(255) NOT NULL,
    whatsapp_message_id VARCHAR(255) UNIQUE NOT NULL,
    message_text TEXT,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text',
    message_data JSONB,
    phone_number VARCHAR(20),
    display_name VARCHAR(255),
    timestamp BIGINT,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation threads table
CREATE TABLE IF NOT EXISTS conversation_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    external_chat_id VARCHAR(255) NOT NULL, -- Can be telegram chat_id, whatsapp chat_id, etc.
    platform VARCHAR(50) NOT NULL,
    thread_title VARCHAR(255),
    participant_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
    tags TEXT[],
    assigned_agent_id UUID, -- For future agent assignment
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint
    UNIQUE(integration_id, external_chat_id, platform)
);

-- Message analytics table
CREATE TABLE IF NOT EXISTS message_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    total_messages INTEGER DEFAULT 0,
    incoming_messages INTEGER DEFAULT 0,
    outgoing_messages INTEGER DEFAULT 0,
    unique_chats INTEGER DEFAULT 0,
    response_time_avg INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for daily analytics per integration
    UNIQUE(integration_id, platform, date)
);

-- Webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    webhook_url VARCHAR(500),
    request_method VARCHAR(10) NOT NULL,
    request_headers JSONB,
    request_body JSONB,
    response_status INTEGER,
    response_body JSONB,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON integrations(platform);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON integrations(created_at);

CREATE INDEX IF NOT EXISTS idx_telegram_chats_chat_id ON telegram_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_chat_type ON telegram_chats(chat_type);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_last_message_at ON telegram_chats(last_message_at);

CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON telegram_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_telegram_message_id ON telegram_messages(telegram_message_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_message_type ON telegram_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_user_id ON telegram_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_created_at ON telegram_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_conversation_threads_integration_id ON conversation_threads(integration_id);
CREATE INDEX IF NOT EXISTS idx_conversation_threads_platform ON conversation_threads(platform);
CREATE INDEX IF NOT EXISTS idx_conversation_threads_status ON conversation_threads(status);
CREATE INDEX IF NOT EXISTS idx_conversation_threads_last_activity_at ON conversation_threads(last_activity_at);

CREATE INDEX IF NOT EXISTS idx_message_analytics_integration_id ON message_analytics(integration_id);
CREATE INDEX IF NOT EXISTS idx_message_analytics_platform ON message_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_message_analytics_date ON message_analytics(date);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_platform ON webhook_logs(platform);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_integration_id ON api_usage_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_platform ON api_usage_logs(platform);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telegram_chats_updated_at BEFORE UPDATE ON telegram_chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telegram_messages_updated_at BEFORE UPDATE ON telegram_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_chats_updated_at BEFORE UPDATE ON whatsapp_chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_messages_updated_at BEFORE UPDATE ON whatsapp_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversation_threads_updated_at BEFORE UPDATE ON conversation_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies can be added here if needed
-- ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own integrations" ON integrations FOR SELECT USING (auth.uid() = user_id);

-- Insert some sample data for testing (optional)
-- INSERT INTO integrations (name, platform, description, config, status) VALUES
-- ('Test Telegram Bot', 'telegram', 'Test integration for Telegram', '{"botToken": "test_token"}', 'inactive'),
-- ('WhatsApp Business', 'whatsapp', 'WhatsApp Business API integration', '{"accessToken": "test_token"}', 'inactive');

-- Create views for common queries
CREATE OR REPLACE VIEW integration_stats AS
SELECT 
    platform,
    COUNT(*) as total_integrations,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_integrations,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_integrations,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_integrations
FROM integrations 
GROUP BY platform;

CREATE OR REPLACE VIEW daily_message_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN message_type = 'incoming' THEN 1 END) as incoming_messages,
    COUNT(CASE WHEN message_type = 'outgoing' THEN 1 END) as outgoing_messages,
    COUNT(DISTINCT chat_id) as unique_chats
FROM telegram_messages 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;