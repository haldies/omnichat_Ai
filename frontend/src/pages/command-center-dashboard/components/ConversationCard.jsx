import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ConversationCard = ({ conversation, isActive, onClick }) => {
  const getPlatformIcon = (platform) => {
    const icons = {
      whatsapp: 'MessageCircle',
      telegram: 'Send',
      instagram: 'Instagram'
    };
    return icons?.[platform] || 'MessageSquare';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      whatsapp: '#25D366',
      telegram: '#0088cc',
      instagram: '#E4405F'
    };
    return colors?.[platform] || 'var(--color-primary)';
  };

  const getAIStatusColor = (status) => {
    const colors = {
      active: 'var(--color-success)',
      monitoring: 'var(--color-warning)',
      handover: 'var(--color-error)'
    };
    return colors?.[status] || 'var(--color-muted)';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'var(--color-error)',
      medium: 'var(--color-warning)',
      low: 'var(--color-success)'
    };
    return colors?.[priority] || 'var(--color-muted)';
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b border-border cursor-pointer transition-all duration-200
        hover:bg-muted/50
        ${isActive ? 'bg-primary/5 border-l-4 border-l-primary' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Image
            src={conversation?.customerAvatar}
            alt={conversation?.customerAvatarAlt}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center"
            style={{ backgroundColor: getPlatformColor(conversation?.platform) }}
          >
            <Icon
              name={getPlatformIcon(conversation?.platform)}
              size={12}
              color="#FFFFFF"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {conversation?.customerName}
              </h3>
              {conversation?.priority !== 'low' && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getPriorityColor(conversation?.priority) }}
                  title={`${conversation?.priority} priority`}
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(conversation?.lastMessageTime)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {conversation?.lastMessage}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${getAIStatusColor(conversation?.aiStatus)}20`,
                  color: getAIStatusColor(conversation?.aiStatus)
                }}
              >
                <Icon name="Bot" size={12} />
                <span className="capitalize">{conversation?.aiStatus}</span>
              </div>
              {conversation?.unreadCount > 0 && (
                <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {conversation?.unreadCount}
                </div>
              )}
            </div>
            {conversation?.tags && conversation?.tags?.length > 0 && (
              <div className="flex items-center gap-1">
                {conversation?.tags?.slice(0, 2)?.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;