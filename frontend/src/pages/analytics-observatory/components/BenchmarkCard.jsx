import React from 'react';
import Icon from '../../../components/AppIcon';

const BenchmarkCard = ({ 
  title, 
  yourValue, 
  industryAverage, 
  topPerformer,
  unit = '%',
  icon,
  iconColor 
}) => {
  const calculatePerformance = () => {
    const yourNum = parseFloat(yourValue);
    const avgNum = parseFloat(industryAverage);
    const diff = yourNum - avgNum;
    const percentage = ((diff / avgNum) * 100)?.toFixed(1);
    return {
      diff: diff?.toFixed(1),
      percentage,
      isAbove: diff > 0
    };
  };

  const performance = calculatePerformance();

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-elevation transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm md:text-base text-muted-foreground mb-2">{title}</p>
        </div>
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={20} color={iconColor} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Your Performance</span>
          <span className="text-xl md:text-2xl font-bold text-foreground font-headline">
            {yourValue}{unit}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Industry Average</span>
          <span className="text-base md:text-lg font-medium text-muted-foreground">
            {industryAverage}{unit}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Top Performer</span>
          <span className="text-base md:text-lg font-medium text-muted-foreground">
            {topPerformer}{unit}
          </span>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">vs Industry</span>
            <div className="flex items-center space-x-2">
              <Icon 
                name={performance?.isAbove ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
                color={performance?.isAbove ? 'var(--color-success)' : 'var(--color-error)'} 
              />
              <span 
                className={`text-sm font-bold ${
                  performance?.isAbove ? 'text-success' : 'text-error'
                }`}
              >
                {performance?.isAbove ? '+' : ''}{performance?.percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkCard;