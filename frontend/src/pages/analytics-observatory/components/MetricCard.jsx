
import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  iconColor, 
  trend = [] 
}) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <div className="bg-card border border-border rounded-xl p-3 hover:shadow-elevation transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{title}</p>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">
            {value}
          </h3>
        </div>
        <div 
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={16} color={iconColor} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Icon 
            name={isPositive ? 'TrendingUp' : isNegative ? 'TrendingDown' : 'Minus'} 
            size={14} 
            color={isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-error)' : 'var(--color-muted-foreground)'} 
          />
          <span 
            className={`text-xs font-medium ${
              isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-muted-foreground'
            }`}
          >
            {change}
          </span>
        </div>
        
        {trend?.length > 0 && (
          <div className="flex items-end space-x-0.5 h-5">
            {trend?.map((height, index) => (
              <div
                key={index}
                className="w-0.5 bg-primary/30 rounded-full transition-all duration-300"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;