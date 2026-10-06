import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, change, changeType, icon, iconColor }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'var(--color-success)';
    if (changeType === 'negative') return 'var(--color-error)';
    return 'var(--color-muted-foreground)';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-elevation transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon name={icon} size={20} color={iconColor} />
        </div>
        {change && (
          <div
            className="flex items-center gap-1 text-xs md:text-sm font-medium"
            style={{ color: getChangeColor() }}
          >
            <Icon name={getChangeIcon()} size={16} />
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
        {value}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground">{title}</p>
    </div>
  );
};

export default MetricsCard;