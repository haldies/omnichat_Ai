import React from 'react';

import Button from '../../../components/ui/Button';

const ChartCard = ({ 
  title, 
  subtitle, 
  children, 
  actions = [], 
  fullHeight = false 
}) => {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 md:p-6 ${fullHeight ? 'h-full' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 md:mb-6 space-y-2 lg:space-y-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground font-headline mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm md:text-base text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {actions?.length > 0 && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            {actions?.map((action, index) => (
              <Button
                key={index}
                variant={action?.variant || 'ghost'}
                size="sm"
                iconName={action?.icon}
                onClick={action?.onClick}
              >
                {action?.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;