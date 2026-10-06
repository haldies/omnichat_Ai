import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const PerformanceLeaderboard = ({ leaderboard }) => {
  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return { icon: 'Trophy', color: 'var(--color-warning)' };
      case 2:
        return { icon: 'Medal', color: '#C0C0C0' };
      case 3:
        return { icon: 'Award', color: '#CD7F32' };
      default:
        return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
            Performance Leaderboard
          </h3>
          <p className="text-sm text-muted-foreground">
            Top performers this month
          </p>
        </div>
        <Icon name="TrendingUp" size={24} color="var(--color-success)" />
      </div>
      <div className="space-y-3 md:space-y-4">
        {leaderboard?.map((member, index) => {
          const medal = getMedalIcon(member?.rank);
          return (
            <div
              key={member?.id}
              className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg transition-all duration-300 ${
                member?.rank <= 3 ? 'bg-accent/5 border border-accent/20' : 'bg-muted/30'
              } hover:shadow-md`}
            >
              <div className="flex-shrink-0 w-8 md:w-10 text-center">
                {medal ? (
                  <Icon name={medal?.icon} size={24} color={medal?.color} />
                ) : (
                  <span className="text-base md:text-lg font-bold text-muted-foreground">
                    {member?.rank}
                  </span>
                )}
              </div>
              <div className="relative flex-shrink-0">
                <Image
                  src={member?.avatar}
                  alt={member?.avatarAlt}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
                />
                {member?.rank === 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                    <Icon name="Crown" size={12} color="white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <h4 className="text-sm md:text-base font-semibold text-foreground truncate">
                    {member?.name}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {member?.role}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="MessageSquare" size={12} />
                    <span className="whitespace-nowrap">{member?.conversations} chats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    <span className="whitespace-nowrap">{member?.avgResponse}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="ThumbsUp" size={12} />
                    <span className="whitespace-nowrap">{member?.satisfaction}%</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className={`text-xl md:text-2xl font-bold ${getScoreColor(member?.score)}`}>
                  {member?.score}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  Performance Score
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-muted/50 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Target" size={16} color="var(--color-primary)" />
              <span className="text-xs text-muted-foreground">Team Average</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">82.5</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="TrendingUp" size={16} color="var(--color-success)" />
              <span className="text-xs text-muted-foreground">Improvement</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-success">+12%</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Users" size={16} color="var(--color-accent)" />
              <span className="text-xs text-muted-foreground">Active Agents</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">12</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceLeaderboard;