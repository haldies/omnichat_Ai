import React, { useState, useRef, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ConversationThread = ({ conversation, onSendMessage, onTakeOver, onReleaseToAI }) => {
  const [message, setMessage] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync isHumanMode with conversation aiStatus
  const isHumanMode = conversation?.aiStatus === 'handover';

  const quickReplies = [
    "Thank you for contacting us!",
    "I'll check that for you right away.",
    "Is there anything else I can help you with?",
    "Your request has been processed successfully."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const handleSend = async () => {
    if (message?.trim() && !isSending) {
      setIsSending(true);
      try {
        await onSendMessage(message, isHumanMode);
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleTakeOver = () => {
    if (onTakeOver) {
      onTakeOver();
    }
  };

  const handleReleaseControl = () => {
    if (onReleaseToAI) {
      onReleaseToAI();
    }
  };

  const handleQuickReply = (reply) => {
    setMessage(reply);
    setShowQuickReplies(false);
  };

  const formatMessageTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Icon name="MessageSquare" size={64} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No Conversation Selected
          </h3>
          <p className="text-sm text-slate-500">
            Select a conversation from the list to view messages
          </p>
        </div>
      </div>
    );
  }

  // Display all messages
  const displayedMessages = conversation?.messages || [];

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={conversation?.customerAvatar}
              alt={conversation?.customerAvatarAlt}
              className="w-10 h-10 rounded-full object-cover border border-slate-100"
            />
            <div>
              <h2 className="font-semibold text-slate-900">
                {conversation?.customerName}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="capitalize">{conversation?.platform}</span>
                <span>•</span>
                <span className={`capitalize ${conversation?.aiStatus === 'active' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {conversation?.aiStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isHumanMode && conversation?.aiStatus !== 'handover' && (
              <Button
                variant="outline"
                size="sm"
                iconName="UserCheck"
                iconPosition="left"
                onClick={handleTakeOver}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                Take Over
              </Button>
            )}
            {isHumanMode && (
              <Button
                variant="outline"
                size="sm"
                iconName="Bot"
                iconPosition="left"
                onClick={handleReleaseControl}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Release to AI
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Icon name="MoreVertical" size={20} className="text-slate-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {displayedMessages.map((msg) => (
          <div
            key={msg?.id}
            className={`flex ${msg?.sender === 'customer' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`
                max-w-[70%] rounded-2xl p-3 shadow-sm
                ${msg?.sender === 'customer'
                  ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                  : msg?.sender === 'ai'
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-tr-none'
                    : 'bg-emerald-600 text-white rounded-tr-none'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg?.sender === 'ai' && (
                  <Icon name="Bot" size={14} className="text-emerald-600" />
                )}
                <span className={`text-xs font-medium ${msg?.sender === 'agent' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {msg?.sender === 'customer'
                    ? conversation?.customerName
                    : msg?.sender === 'ai' ? 'AI Assistant' : 'You'}
                </span>
                {msg?.confidence && (
                  <span className="text-xs text-emerald-600/70">
                    ({Math.round(msg?.confidence * 100)}%)
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{msg?.content}</p>
              <span className={`text-[10px] mt-1 block text-right ${msg?.sender === 'agent' ? 'text-emerald-100' : 'text-slate-400'}`}>
                {formatMessageTime(msg?.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white p-3 shadow-sm">
        {/* Mode Indicator */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isHumanMode ? (
              <>
                <Icon name="User" size={16} className="text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">Human Mode - You can reply</span>
              </>
            ) : (
              <>
                <Icon name="Bot" size={16} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500">AI Mode - AI is handling this conversation</span>
              </>
            )}
          </div>
          {!isHumanMode && (
            <button
              onClick={handleTakeOver}
              className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded transition-colors font-medium"
            >
              Take Over
            </button>
          )}
        </div>

        {!isHumanMode && (
          <div className="mb-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={14} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-700 font-medium mb-0.5">AI is currently handling this conversation</p>
                <p className="text-[11px] text-slate-500">Click "Take Over" to switch to Human Mode and start replying manually.</p>
              </div>
            </div>
          </div>
        )}

        {showQuickReplies && isHumanMode && (
          <div className="mb-2 flex flex-wrap gap-2">
            {quickReplies?.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="text-sm px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            disabled={!isHumanMode}
            className="text-slate-400 hover:text-emerald-600"
          >
            <Icon name="Zap" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!isHumanMode}
            className="text-slate-400 hover:text-emerald-600"
          >
            <Icon name="Paperclip" size={20} />
          </Button>
          <div className="flex-1">
            <Input
              type="text"
              placeholder={isHumanMode ? "Type your message..." : "AI is handling this conversation..."}
              value={message}
              onChange={(e) => setMessage(e?.target?.value)}
              onKeyPress={(e) => e?.key === 'Enter' && !e?.shiftKey && handleSend()}
              disabled={!isHumanMode || isSending}
              className={!isHumanMode ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'bg-white'}
            />
          </div>
          <Button
            variant="default"
            size="icon"
            onClick={handleSend}
            disabled={!isHumanMode || !message?.trim() || isSending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSending ? (
              <Icon name="Loader2" size={20} className="animate-spin" />
            ) : (
              <Icon name="Send" size={20} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationThread;