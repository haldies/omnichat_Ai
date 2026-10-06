import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMetricsCard = ({ title, value, change, changeType, icon, iconColor }) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-elevation transition-all duration-300">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">{title}</p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground font-headline truncate">
            {value}
          </p>
        </div>
        <div 
          className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={20} color={iconColor} className="md:w-6 md:h-6 lg:w-7 lg:h-7" />
        </div>
      </div>
      {change && (
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${
            isPositive ? 'bg-success/10 text-success' : isNegative ?'bg-error/10 text-error': 'bg-muted text-muted-foreground'
          }`}>
            <Icon 
              name={isPositive ? 'TrendingUp' : isNegative ? 'TrendingDown' : 'Minus'} 
              size={14} 
              className="flex-shrink-0"
            />
            <span className="text-xs md:text-sm font-medium whitespace-nowrap">{change}</span>
          </div>
          <span className="text-xs md:text-sm text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetricsCard;