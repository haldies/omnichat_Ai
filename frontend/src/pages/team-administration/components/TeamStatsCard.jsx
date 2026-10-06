import React from 'react';

const TeamStatsCard = ({ title, value, subtitle, icon: Icon, iconColor }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-background">
          <Icon size={24} style={{ color: iconColor }} />
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
};

export default TeamStatsCard;
