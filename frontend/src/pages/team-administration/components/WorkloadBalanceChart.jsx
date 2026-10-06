import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const WorkloadBalanceChart = ({ workloadData }) => {
  const maxWorkload = Math.max(...workloadData?.map(agent => agent?.activeChats));

  const getWorkloadColor = (percentage) => {
    if (percentage >= 90) return 'bg-error';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const getWorkloadStatus = (percentage) => {
    if (percentage >= 90) return { text: 'Overloaded', color: 'text-error' };
    if (percentage >= 70) return { text: 'High Load', color: 'text-warning' };
    return { text: 'Balanced', color: 'text-success' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
            Workload Balance
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time agent capacity monitoring
          </p>
        </div>
        <Icon name="Activity" size={24} color="var(--color-primary)" />
      </div>
      <div className="space-y-4">
        {workloadData?.map((agent) => {
          const workloadPercentage = (agent?.activeChats / agent?.capacity) * 100;
          const status = getWorkloadStatus(workloadPercentage);

          return (
            <div key={agent?.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Image
                    src={agent?.avatar}
                    alt={agent?.avatarAlt}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {agent?.name}
                      </h4>
                      <span className={`text-xs font-medium ${status?.color} whitespace-nowrap`}>
                        {status?.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="whitespace-nowrap">
                        {agent?.activeChats} / {agent?.capacity} chats
                      </span>
                      <span className="whitespace-nowrap">
                        Avg: {agent?.avgResponseTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-base md:text-lg font-bold text-foreground">
                    {Math.round(workloadPercentage)}%
                  </div>
                </div>
              </div>
              <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getWorkloadColor(workloadPercentage)} transition-all duration-500`}
                  style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                />
                {workloadPercentage > 100 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="AlertTriangle" size={14} color="white" />
                  </div>
                )}
              </div>
              {agent?.expertise && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent?.expertise?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Users" size={14} color="var(--color-success)" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-success">
              {workloadData?.filter(a => (a?.activeChats / a?.capacity) < 0.7)?.length}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="AlertCircle" size={14} color="var(--color-warning)" />
              <span className="text-xs text-muted-foreground">High Load</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-warning">
              {workloadData?.filter(a => {
                const pct = (a?.activeChats / a?.capacity);
                return pct >= 0.7 && pct < 0.9;
              })?.length}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="AlertTriangle" size={14} color="var(--color-error)" />
              <span className="text-xs text-muted-foreground">Overloaded</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-error">
              {workloadData?.filter(a => (a?.activeChats / a?.capacity) >= 0.9)?.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadBalanceChart;