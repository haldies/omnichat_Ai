import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ABTestingManager = ({ tests, onCreateTest, onStopTest }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    variantA: '',
    variantB: '',
    category: 'general'
  });

  const handleCreateTest = () => {
    onCreateTest(newTest);
    setNewTest({ name: '', variantA: '', variantB: '', category: 'general' });
    setIsCreating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--color-success)';
      case 'completed': return 'var(--color-primary)';
      case 'paused': return 'var(--color-warning)';
      default: return 'var(--color-muted)';
    }
  };

  const getWinnerVariant = (test) => {
    if (test?.variantAScore > test?.variantBScore) return 'A';
    if (test?.variantBScore > test?.variantAScore) return 'B';
    return 'Tie';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon name="FlaskConical" size={20} color="var(--color-accent)" className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-foreground font-headline">
              A/B Testing Manager
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {tests?.filter(t => t?.status === 'active')?.length} active tests
            </p>
          </div>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          iconName="Plus" 
          iconPosition="left"
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          Create New Test
        </Button>
      </div>
      {isCreating && (
        <div className="bg-muted/50 rounded-lg p-4 md:p-6 mb-4 md:mb-6 space-y-4">
          <h4 className="text-sm md:text-base font-semibold text-foreground">
            Create New A/B Test
          </h4>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Test Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Greeting Message Test"
              value={newTest?.name}
              onChange={(e) => setNewTest({ ...newTest, name: e?.target?.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Variant A Response</label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter first response variant..."
              value={newTest?.variantA}
              onChange={(e) => setNewTest({ ...newTest, variantA: e?.target?.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Variant B Response</label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter second response variant..."
              value={newTest?.variantB}
              onChange={(e) => setNewTest({ ...newTest, variantB: e?.target?.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <select
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              value={newTest?.category}
              onChange={(e) => setNewTest({ ...newTest, category: e?.target?.value })}
            >
              <option value="general">General</option>
              <option value="product">Product</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="default" 
              size="sm" 
              iconName="Check" 
              iconPosition="left"
              onClick={handleCreateTest}
              disabled={!newTest?.name || !newTest?.variantA || !newTest?.variantB}
              className="flex-1"
            >
              Start Test
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              iconName="X" 
              iconPosition="left"
              onClick={() => setIsCreating(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        {tests?.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-muted/30 rounded-lg">
            <Icon name="FlaskConical" size={40} color="var(--color-muted-foreground)" className="mx-auto mb-3 md:mb-4" />
            <p className="text-sm md:text-base text-muted-foreground">
              No A/B tests created yet
            </p>
          </div>
        ) : (
          tests?.map(test => (
            <div 
              key={test?.id}
              className="bg-background border border-border rounded-lg p-4 md:p-6 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm md:text-base font-semibold text-foreground">
                      {test?.name}
                    </h4>
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
                      style={{ 
                        backgroundColor: `${getStatusColor(test?.status)}15`,
                        color: getStatusColor(test?.status)
                      }}
                    >
                      {test?.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={14} className="flex-shrink-0" />
                      <span>{test?.totalSamples} samples</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} className="flex-shrink-0" />
                      <span>Started {test?.startDate}</span>
                    </div>
                    {test?.status === 'completed' && (
                      <div className="flex items-center space-x-1">
                        <Icon name="Trophy" size={14} color="var(--color-success)" className="flex-shrink-0" />
                        <span className="text-success font-medium">
                          Winner: Variant {getWinnerVariant(test)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {test?.status === 'active' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    iconName="Square" 
                    iconPosition="left"
                    onClick={() => onStopTest(test?.id)}
                  >
                    Stop Test
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-medium text-foreground">
                      Variant A
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-primary">
                      {test?.variantAScore}% score
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
                    {test?.variantA}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Conversions</span>
                      <span className="font-medium text-foreground">{test?.variantAConversions}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Avg Response Time</span>
                      <span className="font-medium text-foreground">{test?.variantAResponseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-medium text-foreground">
                      Variant B
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-primary">
                      {test?.variantBScore}% score
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
                    {test?.variantB}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Conversions</span>
                      <span className="font-medium text-foreground">{test?.variantBConversions}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Avg Response Time</span>
                      <span className="font-medium text-foreground">{test?.variantBResponseTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {test?.status === 'completed' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Statistical Significance
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-success">
                      {test?.significance}% confident
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ABTestingManager;