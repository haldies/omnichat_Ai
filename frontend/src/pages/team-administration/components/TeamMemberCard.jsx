import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TeamMemberCard = ({ member, onViewProfile, onEditRole, onViewPerformance }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'busy':
        return 'bg-warning';
      case 'offline':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-primary/10 text-primary';
      case 'Manager':
        return 'bg-accent/10 text-accent';
      case 'Agent':
        return 'bg-secondary/10 text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-elevation transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-shrink-0">
          <Image
            src={member?.avatar}
            alt={member?.avatarAlt}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
          />
          <div className={`absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 ${getStatusColor(member?.status)} rounded-full border-2 border-card`} />
        </div>

        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
              {member?.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(member?.role)} whitespace-nowrap`}>
              {member?.role}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Icon name="Mail" size={14} />
              <span className="truncate">{member?.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Clock" size={14} />
              <span className="whitespace-nowrap">{member?.shift}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
            <div className="bg-muted/50 rounded-lg p-2 md:p-3">
              <div className="text-xs text-muted-foreground mb-1">Conversations</div>
              <div className="text-base md:text-lg font-semibold text-foreground whitespace-nowrap">
                {member?.stats?.conversations}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 md:p-3">
              <div className="text-xs text-muted-foreground mb-1">Avg Response</div>
              <div className="text-base md:text-lg font-semibold text-foreground whitespace-nowrap">
                {member?.stats?.avgResponse}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 md:p-3">
              <div className="text-xs text-muted-foreground mb-1">Satisfaction</div>
              <div className="text-base md:text-lg font-semibold text-success whitespace-nowrap">
                {member?.stats?.satisfaction}%
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 md:p-3">
              <div className="text-xs text-muted-foreground mb-1">Resolved</div>
              <div className="text-base md:text-lg font-semibold text-foreground whitespace-nowrap">
                {member?.stats?.resolved}%
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewProfile(member?.id)}>
              View Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEditRole(member?.id)}>
              Edit Role
            </Button>
            <Button variant="default" size="sm" onClick={() => onViewPerformance(member?.id)}>
              Performance
            </Button>
          </div>
        </div>
      </div>
      {member?.achievements && member?.achievements?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Award" size={16} color="var(--color-accent)" />
            <span className="text-sm font-medium text-foreground">Recent Achievements</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {member?.achievements?.map((achievement, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs"
                title={achievement?.description}
              >
                <Icon name={achievement?.icon} size={12} />
                <span>{achievement?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;