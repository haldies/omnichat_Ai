
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ResponsePreviewTester = ({ onTestResponse }) => {
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!testQuery?.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const mockResult = {
        query: testQuery,
        response: `Based on your query about "${testQuery}", here's what I found:\n\nOur AI system has analyzed your question and generated a comprehensive response. This is a simulated response for testing purposes. In production, this would be the actual AI-generated answer based on your knowledge base and training data.\n\nThe confidence score indicates how certain the AI is about this response. Higher scores mean the AI has found strong matches in the knowledge base.`,
        confidence: Math.floor(Math.random() * 30) + 70,
        matchedKnowledge: [
          { id: 1, title: 'Product Information', relevance: 95 },
          { id: 2, title: 'Pricing Details', relevance: 87 },
          { id: 3, title: 'Support Guidelines', relevance: 72 }
        ],
        processingTime: `${(Math.random() * 2 + 0.5)?.toFixed(2)}s`,
        timestamp: new Date()?.toLocaleTimeString()
      };
      
      setTestResult(mockResult);
      setIsLoading(false);
      onTestResponse(mockResult);
    }, 1500);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'var(--color-success)';
    if (confidence >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon name="TestTube2" size={20} color="var(--color-accent)" className="md:w-6 md:h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground font-headline">
            Response Preview Tester
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Test AI responses before deployment
          </p>
        </div>
      </div>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter a test query..."
              value={testQuery}
              onChange={(e) => setTestQuery(e?.target?.value)}
              onKeyPress={(e) => e?.key === 'Enter' && handleTest()}
            />
          </div>
          <Button 
            variant="default" 
            size="default" 
            iconName="Play" 
            iconPosition="left"
            onClick={handleTest}
            loading={isLoading}
            disabled={!testQuery?.trim() || isLoading}
          >
            Test Response
          </Button>
        </div>

        {testResult && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 md:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="MessageSquare" size={16} color="var(--color-primary)" className="flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium text-muted-foreground">
                      Test Query
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-foreground font-medium">
                    {testResult?.query}
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div 
                    className="px-3 py-1 rounded-full text-xs md:text-sm font-semibold"
                    style={{ 
                      backgroundColor: `${getConfidenceColor(testResult?.confidence)}15`,
                      color: getConfidenceColor(testResult?.confidence)
                    }}
                  >
                    {testResult?.confidence}%
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="Bot" size={16} color="var(--color-success)" className="flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">
                    AI Response
                  </span>
                </div>
                <div className="bg-background rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm text-foreground whitespace-pre-line">
                    {testResult?.response}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={14} color="var(--color-muted-foreground)" className="flex-shrink-0" />
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Processing: {testResult?.processingTime}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={14} color="var(--color-muted-foreground)" className="flex-shrink-0" />
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Tested: {testResult?.timestamp}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-4 md:p-6">
              <h4 className="text-sm md:text-base font-semibold text-foreground mb-3 md:mb-4">
                Matched Knowledge Base Items
              </h4>
              <div className="space-y-2 md:space-y-3">
                {testResult?.matchedKnowledge?.map((item, index) => (
                  <div 
                    key={item?.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-xs md:text-sm text-foreground truncate">
                        {item?.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="w-16 md:w-20 bg-background rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item?.relevance}%` }}
                        />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-primary whitespace-nowrap">
                        {item?.relevance}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                iconName="Copy" 
                iconPosition="left"
              >
                Copy Response
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                iconName="Check" 
                iconPosition="left"
              >
                Approve & Deploy
              </Button>
            </div>
          </div>
        )}

        {!testResult && (
          <div className="text-center py-8 md:py-12 bg-muted/30 rounded-lg">
            <Icon name="TestTube2" size={40} color="var(--color-muted-foreground)" className="mx-auto mb-3 md:mb-4" />
            <p className="text-sm md:text-base text-muted-foreground">
              Enter a query above to test AI responses
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsePreviewTester;