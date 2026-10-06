import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ROICalculator = () => {
  const [inputs, setInputs] = useState({
    monthlyConversations: '500',
    avgResponseTime: '15',
    agentHourlyCost: '25',
    aiSubscription: '299'
  });

  const [results, setResults] = useState(null);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculateROI = () => {
    const conversations = parseFloat(inputs?.monthlyConversations);
    const responseTime = parseFloat(inputs?.avgResponseTime);
    const hourlyCost = parseFloat(inputs?.agentHourlyCost);
    const subscription = parseFloat(inputs?.aiSubscription);

    const manualHours = (conversations * responseTime) / 60;
    const manualCost = manualHours * hourlyCost;
    
    const aiHours = (conversations * 2) / 60;
    const aiCost = subscription + (aiHours * hourlyCost * 0.2);
    
    const monthlySavings = manualCost - aiCost;
    const annualSavings = monthlySavings * 12;
    const roi = ((monthlySavings * 12) / (subscription * 12)) * 100;

    setResults({
      manualCost: manualCost?.toFixed(2),
      aiCost: aiCost?.toFixed(2),
      monthlySavings: monthlySavings?.toFixed(2),
      annualSavings: annualSavings?.toFixed(2),
      roi: roi?.toFixed(1),
      timesSaved: (manualHours - aiHours)?.toFixed(1)
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-success/10 flex items-center justify-center">
          <Icon name="Calculator" size={24} color="var(--color-success)" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground font-headline">
            ROI Calculator
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Calculate your potential savings with AI automation
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          label="Monthly Conversations"
          type="number"
          value={inputs?.monthlyConversations}
          onChange={(e) => handleInputChange('monthlyConversations', e?.target?.value)}
          placeholder="500"
        />
        
        <Input
          label="Avg Response Time (minutes)"
          type="number"
          value={inputs?.avgResponseTime}
          onChange={(e) => handleInputChange('avgResponseTime', e?.target?.value)}
          placeholder="15"
        />
        
        <Input
          label="Agent Hourly Cost ($)"
          type="number"
          value={inputs?.agentHourlyCost}
          onChange={(e) => handleInputChange('agentHourlyCost', e?.target?.value)}
          placeholder="25"
        />
        
        <Input
          label="AI Subscription ($)"
          type="number"
          value={inputs?.aiSubscription}
          onChange={(e) => handleInputChange('aiSubscription', e?.target?.value)}
          placeholder="299"
        />
      </div>
      <Button
        variant="default"
        iconName="Calculator"
        iconPosition="left"
        onClick={calculateROI}
        fullWidth
        className="mb-6"
      >
        Calculate ROI
      </Button>
      {results && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Manual Cost</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">${results?.manualCost}</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">AI Cost</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">${results?.aiCost}</p>
            </div>
          </div>

          <div className="bg-success/10 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm md:text-base font-medium text-foreground">Monthly Savings</p>
              <p className="text-2xl md:text-3xl font-bold text-success">${results?.monthlySavings}</p>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm md:text-base font-medium text-foreground">Annual Savings</p>
              <p className="text-2xl md:text-3xl font-bold text-success">${results?.annualSavings}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm md:text-base font-medium text-foreground">ROI</p>
              <p className="text-2xl md:text-3xl font-bold text-success">{results?.roi}%</p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={20} color="var(--color-primary)" />
              <p className="text-sm md:text-base text-foreground">
                <span className="font-bold">{results?.timesSaved} hours</span> saved per month
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ROICalculator;