import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrainingModuleCard = ({ module, onStartModule, onViewProgress }) => {
  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-primary';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', color: 'bg-success/10 text-success' };
      case 'in-progress':
        return { text: 'In Progress', color: 'bg-warning/10 text-warning' };
      case 'not-started':
        return { text: 'Not Started', color: 'bg-muted text-muted-foreground' };
      default:
        return { text: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  const statusBadge = getStatusBadge(module.status);

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-elevation transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={module.icon} size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 truncate">
              {module.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {module.description}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusBadge?.color} whitespace-nowrap ml-2`}>
          {statusBadge?.text}
        </span>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">{module.progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getProgressColor(module.progress)} transition-all duration-500`}
            style={{ width: `${module.progress}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
            <span className="text-xs text-muted-foreground">Duration</span>
          </div>
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            {module.duration}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="BookOpen" size={14} color="var(--color-muted-foreground)" />
            <span className="text-xs text-muted-foreground">Lessons</span>
          </div>
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            {module.lessons} lessons
          </div>
        </div>
      </div>
      {module.certification && (
        <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg mb-4">
          <Icon name="Award" size={16} color="var(--color-accent)" />
          <span className="text-xs font-medium text-accent">
            Certification Available
          </span>
        </div>
      )}
      <div className="flex gap-2">
        {module.status === 'not-started' ? (
          <Button
            variant="default"
            size="sm"
            iconName="Play"
            iconPosition="left"
            onClick={() => onStartModule(module.id)}
            fullWidth
          >
            Start Module
          </Button>
        ) : module.status === 'in-progress' ? (
          <Button
            variant="default"
            size="sm"
            iconName="PlayCircle"
            iconPosition="left"
            onClick={() => onStartModule(module.id)}
            fullWidth
          >
            Continue Learning
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={() => onStartModule(module.id)}
            fullWidth
          >
            Review Module
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProgress(module.id)}
        >
          Details
        </Button>
      </div>
    </div>
  );
};

export default TrainingModuleCard;