-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'PENDING');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('TELEGRAM', 'WHATSAPP', 'DISCORD', 'SLACK', 'INSTAGRAM', 'FACEBOOK', 'WEBSITE');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'PHOTO', 'VIDEO', 'AUDIO', 'VOICE', 'DOCUMENT', 'STICKER', 'LOCATION', 'CONTACT', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('PRIVATE', 'GROUP', 'SUPERGROUP', 'CHANNEL');

-- CreateEnum
CREATE TYPE "AiStatus" AS ENUM ('ACTIVE', 'HANDOVER');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('ERROR', 'WARN', 'INFO', 'DEBUG');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'AGENT', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL');

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "status" "IntegrationStatus" NOT NULL DEFAULT 'INACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_chats" (
    "id" TEXT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "chat_type" "ChatType" NOT NULL,
    "ai_status" "AiStatus" NOT NULL DEFAULT 'ACTIVE',
    "title" TEXT,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "description" TEXT,
    "invite_link" TEXT,
    "pinned_message_id" BIGINT,
    "permissions" JSONB,
    "slow_mode_delay" INTEGER,
    "message_auto_delete_time" INTEGER,
    "has_protected_content" BOOLEAN NOT NULL DEFAULT false,
    "sticker_set_name" TEXT,
    "can_set_sticker_set" BOOLEAN NOT NULL DEFAULT false,
    "linked_chat_id" BIGINT,
    "location" JSONB,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_messages" (
    "id" TEXT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "telegram_message_id" BIGINT NOT NULL,
    "message_text" TEXT,
    "message_type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "message_direction" "MessageDirection" NOT NULL DEFAULT 'INCOMING',
    "message_data" JSONB,
    "user_id" BIGINT,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "reply_to_message_id" BIGINT,
    "forward_from_chat_id" BIGINT,
    "forward_from_message_id" BIGINT,
    "edit_date" TIMESTAMP(3),
    "media_group_id" TEXT,
    "has_media_spoiler" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_chats" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "phone_number" TEXT,
    "display_name" TEXT,
    "profile_name" TEXT,
    "chat_type" "ChatType" NOT NULL DEFAULT 'PRIVATE',
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "whatsapp_message_id" TEXT NOT NULL,
    "message_text" TEXT,
    "message_type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "message_direction" "MessageDirection" NOT NULL DEFAULT 'INCOMING',
    "message_data" JSONB,
    "phone_number" TEXT,
    "display_name" TEXT,
    "timestamp" BIGINT,
    "status" TEXT DEFAULT 'sent',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_threads" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "external_thread_id" TEXT,
    "external_chat_id" TEXT,
    "platform" "Platform" NOT NULL,
    "customer_name" TEXT,
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "thread_title" TEXT,
    "last_message" TEXT,
    "participant_count" INTEGER NOT NULL DEFAULT 1,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[],
    "assigned_agent_id" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "message_type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "sender_name" TEXT,
    "sender_avatar" TEXT,
    "metadata" JSONB,
    "attachments" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_analytics" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "date" DATE NOT NULL,
    "total_messages" INTEGER NOT NULL DEFAULT 0,
    "incoming_messages" INTEGER NOT NULL DEFAULT 0,
    "outgoing_messages" INTEGER NOT NULL DEFAULT 0,
    "unique_chats" INTEGER NOT NULL DEFAULT 0,
    "response_time_avg" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "webhook_url" TEXT,
    "request_method" TEXT NOT NULL,
    "request_headers" JSONB,
    "request_body" JSONB,
    "response_status" INTEGER,
    "response_body" JSONB,
    "processing_time_ms" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "request_data" JSONB,
    "response_data" JSONB,
    "status_code" INTEGER,
    "response_time_ms" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "status" "BusinessStatus" NOT NULL DEFAULT 'ACTIVE',
    "subscription_plan" TEXT,
    "subscription_expiry" TIMESTAMP(3),
    "max_users" INTEGER NOT NULL DEFAULT 10,
    "max_integrations" INTEGER NOT NULL DEFAULT 5,
    "settings" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_business_id_idx" ON "integrations"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_chats_chat_id_key" ON "telegram_chats"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_messages_telegram_message_id_chat_id_key" ON "telegram_messages"("telegram_message_id", "chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_chats_chat_id_key" ON "whatsapp_chats"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_messages_whatsapp_message_id_key" ON "whatsapp_messages"("whatsapp_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_threads_integration_id_external_thread_id_key" ON "conversation_threads"("integration_id", "external_thread_id");

-- CreateIndex
CREATE INDEX "messages_thread_id_idx" ON "messages"("thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_analytics_integration_id_platform_date_key" ON "message_analytics"("integration_id", "platform", "date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_business_id_idx" ON "users"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_messages" ADD CONSTRAINT "telegram_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "telegram_chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "whatsapp_chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_threads" ADD CONSTRAINT "conversation_threads_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_threads" ADD CONSTRAINT "conversation_threads_assigned_agent_id_fkey" FOREIGN KEY ("assigned_agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "conversation_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_analytics" ADD CONSTRAINT "message_analytics_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
