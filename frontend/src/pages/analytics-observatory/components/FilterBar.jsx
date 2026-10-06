import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterBar = ({ 
  dateRange, 
  onDateRangeChange, 
  platform, 
  onPlatformChange,
  industry,
  onIndustryChange,
  onExport,
  onRefresh 
}) => {
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'instagram', label: 'Instagram' }
  ];

  const industryOptions = [
    { value: 'all', label: 'All Industries' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'realestate', label: 'Real Estate' },
    { value: 'services', label: 'Services' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 mb-4 md:mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Date Range"
          options={dateRangeOptions}
          value={dateRange}
          onChange={onDateRangeChange}
        />
        
        <Select
          label="Platform"
          options={platformOptions}
          value={platform}
          onChange={onPlatformChange}
        />
        
        <Select
          label="Industry"
          options={industryOptions}
          value={industry}
          onChange={onIndustryChange}
        />
        
        <div className="flex items-end space-x-2">
          <Button
            variant="outline"
            iconName="RefreshCw"
            onClick={onRefresh}
            className="flex-1"
          >
            Refresh
          </Button>
          <Button
            variant="default"
            iconName="Download"
            onClick={onExport}
            className="flex-1"
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;