import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConfidenceThresholdControl = ({ currentThreshold, onThresholdChange }) => {
  const [localThreshold, setLocalThreshold] = useState(currentThreshold);
  const [isEditing, setIsEditing] = useState(false);

  const handleSliderChange = (e) => {
    setLocalThreshold(parseInt(e?.target?.value));
  };

  const handleSave = () => {
    onThresholdChange(localThreshold);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalThreshold(currentThreshold);
    setIsEditing(false);
  };

  const getThresholdColor = (value) => {
    if (value >= 80) return 'var(--color-success)';
    if (value >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getThresholdLabel = (value) => {
    if (value >= 80) return 'High Confidence';
    if (value >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="Sliders" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-foreground font-headline">
              Confidence Threshold
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Adjust AI response sensitivity
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button 
            variant="outline" 
            size="sm" 
            iconName="Edit2" 
            iconPosition="left"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-lg md:text-xl lg:text-2xl"
              style={{ 
                backgroundColor: `${getThresholdColor(localThreshold)}15`,
                color: getThresholdColor(localThreshold)
              }}
            >
              {localThreshold}%
            </div>
            <div className="min-w-0">
              <p className="text-sm md:text-base font-medium text-foreground">
                {getThresholdLabel(localThreshold)}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Current setting
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={localThreshold}
              onChange={handleSliderChange}
              disabled={!isEditing}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${getThresholdColor(localThreshold)} 0%, ${getThresholdColor(localThreshold)} ${localThreshold}%, var(--color-muted) ${localThreshold}%, var(--color-muted) 100%)`
              }}
            />
          </div>

          <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
            <span>0% (More responses)</span>
            <span>100% (Fewer, high-quality)</span>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center space-x-3 pt-2 md:pt-4 border-t border-border">
            <Button 
              variant="default" 
              size="sm" 
              iconName="Check" 
              iconPosition="left"
              onClick={handleSave}
              className="flex-1"
            >
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              iconName="X" 
              iconPosition="left"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-3 md:p-4">
          <div className="flex items-start space-x-2 md:space-x-3">
            <Icon name="Info" size={16} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-muted-foreground">
              Higher thresholds mean AI will only respond when very confident, escalating more conversations to human agents. Lower thresholds allow AI to handle more queries but may reduce accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceThresholdControl;