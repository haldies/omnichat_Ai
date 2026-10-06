import React from 'react';
import Icon from '../../../components/AppIcon';

const CustomerJourneyMap = ({ customer }) => {
  const journeyStages = [
    {
      stage: 'Awareness',
      icon: 'Eye',
      date: 'Jan 15, 2025',
      touchpoints: [
        { platform: 'Instagram', action: 'Viewed product post', sentiment: 'positive' }
      ],
      status: 'completed'
    },
    {
      stage: 'Consideration',
      icon: 'Search',
      date: 'Jan 18, 2025',
      touchpoints: [
        { platform: 'WhatsApp', action: 'Asked about pricing', sentiment: 'neutral' },
        { platform: 'Website', action: 'Visited pricing page', sentiment: 'positive' }
      ],
      status: 'completed'
    },
    {
      stage: 'Purchase',
      icon: 'ShoppingCart',
      date: 'Jan 22, 2025',
      touchpoints: [
        { platform: 'WhatsApp', action: 'Completed order', sentiment: 'positive' }
      ],
      status: 'completed'
    },
    {
      stage: 'Retention',
      icon: 'Heart',
      date: 'Ongoing',
      touchpoints: [
        { platform: 'Telegram', action: 'Subscribed to updates', sentiment: 'positive' },
        { platform: 'WhatsApp', action: 'Support inquiry', sentiment: 'neutral' }
      ],
      status: 'active'
    },
    {
      stage: 'Advocacy',
      icon: 'Share2',
      date: 'Future',
      touchpoints: [],
      status: 'pending'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-success text-white',
      active: 'bg-primary text-white',
      pending: 'bg-muted text-muted-foreground'
    };
    return colors?.[status] || colors?.pending;
  };

  const getSentimentIcon = (sentiment) => {
    const icons = {
      positive: 'ThumbsUp',
      neutral: 'Minus',
      negative: 'ThumbsDown'
    };
    return icons?.[sentiment] || 'Minus';
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: 'text-success',
      neutral: 'text-muted-foreground',
      negative: 'text-error'
    };
    return colors?.[sentiment] || colors?.neutral;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 lg:p-8">
      <h3 className="text-lg md:text-xl font-bold text-foreground mb-6">
        Customer Journey Map
      </h3>
      <div className="relative">
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6 md:space-y-8">
          {journeyStages?.map((stage, index) => (
            <div key={index} className="relative pl-16 md:pl-20">
              <div className={`absolute left-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center ${getStatusColor(stage?.status)}`}>
                <Icon name={stage?.icon} size={20} />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-foreground">
                      {stage?.stage}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {stage?.date}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(stage?.status)}`}>
                    {stage?.status}
                  </span>
                </div>

                {stage?.touchpoints?.length > 0 ? (
                  <div className="space-y-2">
                    {stage?.touchpoints?.map((touchpoint, tIndex) => (
                      <div
                        key={tIndex}
                        className="flex items-center justify-between p-3 bg-card rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            name={touchpoint?.platform === 'WhatsApp' ? 'MessageCircle' : touchpoint?.platform === 'Telegram' ? 'Send' : touchpoint?.platform === 'Instagram' ? 'Instagram' : 'Globe'}
                            size={16}
                            className="text-primary"
                          />
                          <span className="text-sm text-foreground">
                            {touchpoint?.action}
                          </span>
                        </div>
                        <Icon
                          name={getSentimentIcon(touchpoint?.sentiment)}
                          size={16}
                          className={getSentimentColor(touchpoint?.sentiment)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No touchpoints recorded yet
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyMap;