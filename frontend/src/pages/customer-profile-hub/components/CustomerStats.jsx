import React from 'react';
import Icon from '../../../components/AppIcon';

const CustomerStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Customers',
      value: stats?.totalCustomers,
      change: '+12.5%',
      trend: 'up',
      icon: 'Users',
      color: 'primary'
    },
    {
      label: 'Active Today',
      value: stats?.activeToday,
      change: '+8.3%',
      trend: 'up',
      icon: 'Activity',
      color: 'success'
    },
    {
      label: 'Avg Health Score',
      value: stats?.avgHealthScore,
      change: '+5.2%',
      trend: 'up',
      icon: 'Heart',
      color: 'accent'
    },
    {
      label: 'At Risk',
      value: stats?.atRisk,
      change: '-3.1%',
      trend: 'down',
      icon: 'AlertTriangle',
      color: 'warning'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-4 md:p-5 lg:p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg bg-${stat?.color}/10 flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} color={`var(--color-${stat?.color})`} />
            </div>
            <span className={`flex items-center gap-1 text-xs font-medium ${stat?.trend === 'up' ? 'text-success' : 'text-error'}`}>
              <Icon name={stat?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
              {stat?.change}
            </span>
          </div>

          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
            {stat?.value}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {stat?.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CustomerStats;