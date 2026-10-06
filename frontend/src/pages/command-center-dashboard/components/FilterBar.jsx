import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FilterBar = ({ filters, onFilterChange, onSearch, onClearFilters }) => {
  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'instagram', label: 'Instagram' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'AI Active' },
    { value: 'monitoring', label: 'AI Monitoring' },
    { value: 'handover', label: 'Human Handover' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder="Search conversations..."
        value={filters?.search}
        onChange={(e) => onSearch(e?.target?.value)}
        className="w-full"
      />
      
      <div className="grid grid-cols-3 gap-2">
        <Select
          options={platformOptions}
          value={filters?.platform}
          onChange={(value) => onFilterChange('platform', value)}
          placeholder="Platform"
        />
        <Select
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          placeholder="Status"
        />
        <Select
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => onFilterChange('priority', value)}
          placeholder="Priority"
        />
      </div>
      
      {Object.values(filters)?.filter(v => v && v !== 'all')?.length > 0 && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Filter" size={14} />
            <span>{Object.values(filters)?.filter(v => v && v !== 'all')?.length} active</span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            iconName="X"
            iconPosition="left"
            onClick={onClearFilters}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;