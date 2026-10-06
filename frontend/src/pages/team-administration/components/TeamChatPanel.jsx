import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TeamChatPanel = ({ channels, messages, onSendMessage }) => {
  const [selectedChannel, setSelectedChannel] = useState(channels?.[0]?.id || null);
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (messageText?.trim()) {
      onSendMessage(selectedChannel, messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const selectedChannelData = channels?.find(ch => ch?.id === selectedChannel);
  const channelMessages = messages?.filter(msg => msg?.channelId === selectedChannel);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-[600px]">
      <div className="flex flex-col lg:flex-row h-full">
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-muted/30 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
              Team Channels
            </h3>
            <p className="text-xs text-muted-foreground">
              {channels?.length} active channels
            </p>
          </div>
          <div className="p-2">
            {channels?.map((channel) => (
              <button
                key={channel?.id}
                onClick={() => setSelectedChannel(channel?.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-all duration-200 ${
                  selectedChannel === channel?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    name={channel?.icon}
                    size={16}
                    color={selectedChannel === channel?.id ? 'white' : 'var(--color-muted-foreground)'}
                  />
                  <span className="text-sm font-medium truncate">{channel?.name}</span>
                </div>
                {channel?.unread > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-80">{channel?.lastMessage}</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-error text-error-foreground rounded-full">
                      {channel?.unread}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name={selectedChannelData?.icon || 'Hash'} size={20} color="var(--color-primary)" />
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">
                    {selectedChannelData?.name || 'Select a channel'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChannelData?.description || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Icon name="Search" size={18} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="MoreVertical" size={18} />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {channelMessages?.map((message) => (
              <div key={message?.id} className="flex gap-3">
                <Image
                  src={message?.avatar}
                  alt={message?.avatarAlt}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {message?.sender}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message?.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {message?.content}
                  </p>
                  {message?.attachment && (
                    <div className="mt-2 p-3 bg-muted rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="Paperclip" size={14} />
                        <span className="text-xs font-medium text-foreground">
                          {message?.attachment?.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {message?.attachment?.size}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Icon name="Paperclip" size={18} />
              </Button>
              <Input
                type="text"
                placeholder={`Message #${selectedChannelData?.name || 'channel'}`}
                value={messageText}
                onChange={(e) => setMessageText(e?.target?.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                variant="default"
                size="icon"
                onClick={handleSendMessage}
                disabled={!messageText?.trim()}
              >
                <Icon name="Send" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChatPanel;