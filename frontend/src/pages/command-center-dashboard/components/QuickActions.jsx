import React from 'react';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onAction }) => {
  const actions = [
    { id: 'new-chat', label: 'New Chat', icon: 'Plus', variant: 'default' },
    { id: 'bulk-assign', label: 'Bulk Assign', icon: 'Users', variant: 'outline' },
    { id: 'export', label: 'Export Data', icon: 'Download', variant: 'outline' },
    { id: 'settings', label: 'Settings', icon: 'Settings', variant: 'ghost' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {actions?.map((action) => (
        <Button
          key={action?.id}
          variant={action?.variant}
          size="sm"
          iconName={action?.icon}
          iconPosition="left"
          onClick={() => onAction(action?.id)}
        >
          {action?.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;