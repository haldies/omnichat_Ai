import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CustomerDetailPanel = ({ customer, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'conversations', label: 'Conversations', icon: 'MessageSquare' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'preferences', label: 'Preferences', icon: 'Settings' }
  ];

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: 'text-success bg-success/10',
      neutral: 'text-muted-foreground bg-muted',
      negative: 'text-error bg-error/10'
    };
    return colors?.[sentiment] || colors?.neutral;
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      whatsapp: 'MessageCircle',
      telegram: 'Send',
      instagram: 'Instagram'
    };
    return icons?.[platform] || 'MessageSquare';
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
            Customer Profile
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6 lg:mb-8">
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative mb-4">
                  <Image
                    src={customer?.avatar}
                    alt={customer?.avatarAlt}
                    className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover"
                  />
                  <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-card ${customer?.isOnline ? 'bg-success' : 'bg-muted'}`} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Upload"
                  iconPosition="left"
                  className="w-full lg:w-auto"
                >
                  Change Photo
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                      {customer?.name}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      {customer?.email}
                    </p>
                  </div>
                  <Button
                    variant={editMode ? 'default' : 'outline'}
                    size="sm"
                    iconName={editMode ? 'Check' : 'Edit'}
                    iconPosition="left"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'Save' : 'Edit'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10">
                      <Icon name="Activity" size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Health Score</p>
                      <p className={`text-lg md:text-xl lg:text-2xl font-bold ${getHealthScoreColor(customer?.healthScore)}`}>
                        {customer?.healthScore}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 md:p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10">
                      <Icon name="TrendingUp" size={20} color="var(--color-accent)" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Lifetime Value</p>
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                        ${customer?.lifetimeValue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {customer?.platforms?.map((platform) => (
                    <div
                      key={platform}
                      className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm"
                    >
                      <Icon name={getPlatformIcon(platform)} size={16} />
                      <span className="capitalize">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-b border-border mb-6">
              <div className="flex gap-1 overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                      border-b-2 transition-colors flex-shrink-0
                      ${activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <Icon name={tab?.icon} size={16} />
                    {tab?.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={customer?.phone}
                      disabled={!editMode}
                    />
                    <Input
                      label="Location"
                      type="text"
                      value={customer?.location}
                      disabled={!editMode}
                    />
                    <Input
                      label="Company"
                      type="text"
                      value={customer?.company}
                      disabled={!editMode}
                      className="md:col-span-2"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Customer Segment
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {customer?.segments?.map((segment, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm"
                      >
                        {segment}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Quick Stats
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Interactions</p>
                      <p className="text-xl md:text-2xl font-bold text-foreground">
                        {customer?.totalInteractions}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Avg Response Time</p>
                      <p className="text-xl md:text-2xl font-bold text-foreground">
                        {customer?.avgResponseTime}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Satisfaction</p>
                      <p className="text-xl md:text-2xl font-bold text-success">
                        {customer?.satisfactionScore}%
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Last Contact</p>
                      <p className="text-sm md:text-base font-semibold text-foreground">
                        {customer?.lastInteraction}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'conversations' && (
              <div className="space-y-4">
                {customer?.conversationHistory?.map((conversation) => (
                  <div
                    key={conversation?.id}
                    className="p-4 md:p-5 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <Icon name={getPlatformIcon(conversation?.platform)} size={20} color="var(--color-primary)" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm md:text-base">
                            {conversation?.subject}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {conversation?.date} • {conversation?.time}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(conversation?.sentiment)}`}>
                        {conversation?.sentiment}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
                      {conversation?.preview}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="MessageSquare" size={14} />
                        {conversation?.messageCount} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        {conversation?.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Sentiment Trend
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-success/10 rounded-lg">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Positive</p>
                      <p className="text-2xl md:text-3xl font-bold text-success">
                        {customer?.sentimentAnalysis?.positive}%
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Neutral</p>
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        {customer?.sentimentAnalysis?.neutral}%
                      </p>
                    </div>
                    <div className="p-4 bg-error/10 rounded-lg">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Negative</p>
                      <p className="text-2xl md:text-3xl font-bold text-error">
                        {customer?.sentimentAnalysis?.negative}%
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Interaction Patterns
                  </h4>
                  <div className="space-y-3">
                    {customer?.interactionPatterns?.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm md:text-base text-foreground">{pattern?.day}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 md:w-48 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${pattern?.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground w-12 text-right">
                            {pattern?.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Engagement Metrics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="MousePointer" size={20} color="var(--color-primary)" />
                        <p className="text-sm text-muted-foreground">Click Rate</p>
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        {customer?.engagementMetrics?.clickRate}%
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Reply" size={20} color="var(--color-accent)" />
                        <p className="text-sm text-muted-foreground">Response Rate</p>
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        {customer?.engagementMetrics?.responseRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Communication Preferences
                  </h4>
                  <div className="space-y-4">
                    <Select
                      label="Preferred Channel"
                      options={[
                        { value: 'whatsapp', label: 'WhatsApp' },
                        { value: 'telegram', label: 'Telegram' },
                        { value: 'instagram', label: 'Instagram' }
                      ]}
                      value={customer?.preferences?.preferredChannel}
                      disabled={!editMode}
                    />
                    <Select
                      label="Contact Time"
                      options={[
                        { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
                        { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
                        { value: 'evening', label: 'Evening (5 PM - 9 PM)' }
                      ]}
                      value={customer?.preferences?.contactTime}
                      disabled={!editMode}
                    />
                    <Select
                      label="Language"
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Spanish' },
                        { value: 'fr', label: 'French' }
                      ]}
                      value={customer?.preferences?.language}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Notification Settings
                  </h4>
                  <div className="space-y-3">
                    {customer?.preferences?.notifications?.map((notification, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <span className="text-sm md:text-base text-foreground">
                          {notification?.type}
                        </span>
                        <div className={`w-12 h-6 rounded-full transition-colors ${notification?.enabled ? 'bg-primary' : 'bg-muted'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${notification?.enabled ? 'translate-x-6' : 'translate-x-1'} mt-0.5`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-4">
                    Tags & Labels
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {customer?.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-accent/10 text-accent rounded-lg text-sm"
                      >
                        {tag}
                        {editMode && <Icon name="X" size={14} className="cursor-pointer" />}
                      </span>
                    ))}
                    {editMode && (
                      <button className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        <Icon name="Plus" size={14} />
                        Add Tag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" iconName="Save" iconPosition="left">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPanel;