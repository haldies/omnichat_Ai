import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      message: 'MessageSquare',
      handover: 'UserCheck',
      resolved: 'CheckCircle',
      escalated: 'AlertTriangle',
      note: 'FileText'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      message: 'var(--color-primary)',
      handover: 'var(--color-warning)',
      resolved: 'var(--color-success)',
      escalated: 'var(--color-error)',
      note: 'var(--color-accent)'
    };
    return colors?.[type] || 'var(--color-muted)';
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date?.toLocaleDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${getActivityColor(activity?.type)}20` }}
            >
              <Icon
                name={getActivityIcon(activity?.type)}
                size={16}
                color={getActivityColor(activity?.type)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground mb-1">{activity?.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{activity?.agent}</span>
                <span>•</span>
                <span>{formatTime(activity?.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;