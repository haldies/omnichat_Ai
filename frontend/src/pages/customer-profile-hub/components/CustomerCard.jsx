import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const CustomerCard = ({ customer, onClick, isSelected }) => {
  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getHealthScoreBg = (score) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      whatsapp: 'MessageCircle',
      telegram: 'Send',
      instagram: 'Instagram'
    };
    return icons?.[platform] || 'MessageSquare';
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-card border rounded-lg p-4 md:p-5 lg:p-6 cursor-pointer
        transition-all duration-300 hover:shadow-md
        ${isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'}
      `}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className="relative flex-shrink-0">
          <Image
            src={customer?.avatar}
            alt={customer?.avatarAlt}
            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-card ${customer?.isOnline ? 'bg-success' : 'bg-muted'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm md:text-base lg:text-lg truncate">
              {customer?.name}
            </h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreBg(customer?.healthScore)} ${getHealthScoreColor(customer?.healthScore)}`}>
              <Icon name="Activity" size={12} />
              <span>{customer?.healthScore}</span>
            </div>
          </div>

          <p className="text-muted-foreground text-xs md:text-sm mb-2 truncate">
            {customer?.email}
          </p>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {customer?.platforms?.map((platform) => (
              <div
                key={platform}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <Icon name={getPlatformIcon(platform)} size={14} />
                <span className="capitalize">{platform}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="MessageSquare" size={14} />
              <span>{customer?.totalInteractions}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Clock" size={14} />
              <span>{customer?.lastInteraction}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;