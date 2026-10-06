import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState('pdf');
  const [sections, setSections] = useState({
    overview: true,
    conversationVolume: true,
    aiPerformance: true,
    satisfaction: true,
    responseTime: true,
    benchmarks: true
  });

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' }
  ];

  const handleSectionToggle = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev?.[section] }));
  };

  const handleExport = () => {
    onExport({ format, sections });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Download" size={20} color="var(--color-primary)" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground font-headline">
              Export Analytics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <Select
            label="Export Format"
            options={formatOptions}
            value={format}
            onChange={setFormat}
          />

          <div>
            <p className="text-sm md:text-base font-medium text-foreground mb-3">
              Select Sections to Include
            </p>
            <div className="space-y-2">
              <Checkbox
                label="Overview Metrics"
                checked={sections?.overview}
                onChange={() => handleSectionToggle('overview')}
              />
              <Checkbox
                label="Conversation Volume"
                checked={sections?.conversationVolume}
                onChange={() => handleSectionToggle('conversationVolume')}
              />
              <Checkbox
                label="AI Performance"
                checked={sections?.aiPerformance}
                onChange={() => handleSectionToggle('aiPerformance')}
              />
              <Checkbox
                label="Customer Satisfaction"
                checked={sections?.satisfaction}
                onChange={() => handleSectionToggle('satisfaction')}
              />
              <Checkbox
                label="Response Time Analysis"
                checked={sections?.responseTime}
                onChange={() => handleSectionToggle('responseTime')}
              />
              <Checkbox
                label="Industry Benchmarks"
                checked={sections?.benchmarks}
                onChange={() => handleSectionToggle('benchmarks')}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 md:p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" iconName="Download" onClick={handleExport}>
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;