import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const CustomerFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'instagram', label: 'Instagram' }
  ];

  const segmentOptions = [
    { value: 'all', label: 'All Segments' },
    { value: 'vip', label: 'VIP Customer' },
    { value: 'high-value', label: 'High Value' },
    { value: 'active', label: 'Active User' },
    { value: 'at-risk', label: 'At Risk' }
  ];

  const healthScoreOptions = [
    { value: 'all', label: 'All Scores' },
    { value: 'excellent', label: 'Excellent (80-100)' },
    { value: 'good', label: 'Good (60-79)' },
    { value: 'poor', label: 'Poor (0-59)' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'health-high', label: 'Health Score (High to Low)' },
    { value: 'health-low', label: 'Health Score (Low to High)' },
    { value: 'value-high', label: 'Lifetime Value (High to Low)' },
    { value: 'interactions', label: 'Most Interactions' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-5 lg:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Filter" size={20} />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          iconPosition="left"
          onClick={onClearFilters}
        >
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Search customers..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
        />

        <Select
          placeholder="Select platform"
          options={platformOptions}
          value={filters?.platform}
          onChange={(value) => onFilterChange('platform', value)}
        />

        <Select
          placeholder="Select segment"
          options={segmentOptions}
          value={filters?.segment}
          onChange={(value) => onFilterChange('segment', value)}
        />

        <Select
          placeholder="Select health score"
          options={healthScoreOptions}
          value={filters?.healthScore}
          onChange={(value) => onFilterChange('healthScore', value)}
        />
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            options={sortOptions}
            value={filters?.sortBy}
            onChange={(value) => onFilterChange('sortBy', value)}
            className="w-full md:w-64"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;