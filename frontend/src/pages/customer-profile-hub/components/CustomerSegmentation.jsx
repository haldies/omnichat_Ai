import React from 'react';
import Icon from '../../../components/AppIcon';

const CustomerSegmentation = ({ segmentData }) => {
  const segments = [
    {
      name: 'VIP Customers',
      count: segmentData?.vip,
      percentage: 15,
      color: 'bg-primary',
      icon: 'Crown',
      description: 'High-value customers with exceptional engagement'
    },
    {
      name: 'High Value',
      count: segmentData?.highValue,
      percentage: 25,
      color: 'bg-accent',
      icon: 'TrendingUp',
      description: 'Customers with significant lifetime value'
    },
    {
      name: 'Active Users',
      count: segmentData?.active,
      percentage: 40,
      color: 'bg-success',
      icon: 'Activity',
      description: 'Regular engagement across platforms'
    },
    {
      name: 'At Risk',
      count: segmentData?.atRisk,
      percentage: 20,
      color: 'bg-warning',
      icon: 'AlertTriangle',
      description: 'Declining engagement, needs attention'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-bold text-foreground">
          Customer Segmentation
        </h3>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          View Details
          <Icon name="ChevronRight" size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {segments?.map((segment, index) => (
          <div
            key={index}
            className="p-4 md:p-5 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${segment?.color}/10 flex items-center justify-center`}>
                  <Icon name={segment?.icon} size={20} className={segment?.color?.replace('bg-', 'text-')} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm md:text-base">
                    {segment?.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {segment?.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {segment?.count}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  customers
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xl md:text-2xl font-bold ${segment?.color?.replace('bg-', 'text-')}`}>
                  {segment?.percentage}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of total
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`${segment?.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${segment?.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Info" size={16} className="text-primary" />
          <p className="text-sm font-medium text-foreground">
            Segmentation Insights
          </p>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          Customer segments are automatically updated based on interaction patterns, lifetime value, and engagement metrics. Use these insights to personalize communication strategies and improve customer retention.
        </p>
      </div>
    </div>
  );
};

export default CustomerSegmentation;