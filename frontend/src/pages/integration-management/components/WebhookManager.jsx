import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WebhookManager = ({ platform, webhooks, onAdd, onDelete, onTest }) => {
  if (!platform) {
    return (
      <div className="text-center py-12">
        <Icon name="Webhook" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Connected Platform</h3>
        <p className="text-muted-foreground">
          Connect a platform first to manage webhooks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Webhook Management</h2>
          <p className="text-muted-foreground">
            Manage webhooks for {platform.name}
          </p>
        </div>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={() => onAdd(platform.id)}
        >
          Add Webhook
        </Button>
      </div>

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-foreground">{webhook.url}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    webhook.status === 'active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {webhook.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Events: {webhook.events.join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last triggered: {webhook.lastTriggered}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Play"
                  onClick={() => onTest(webhook.id)}
                >
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Trash2"
                  onClick={() => onDelete(webhook.id)}
                  className="text-error hover:text-error"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {webhooks.length === 0 && (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <Icon name="Webhook" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No webhooks configured</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookManager;