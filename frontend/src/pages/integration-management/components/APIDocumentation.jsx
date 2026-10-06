import React from 'react';
import Icon from '../../../components/AppIcon';

const APIDocumentation = ({ platform }) => {
  if (!platform) {
    return (
      <div className="text-center py-12">
        <Icon name="BookOpen" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Connected Platform</h3>
        <p className="text-muted-foreground">
          Connect a platform first to view API documentation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">API Documentation</h2>
        <p className="text-muted-foreground">
          API documentation for {platform.name}
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Getting Started</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Base URL</h4>
            <code className="bg-muted px-3 py-2 rounded text-sm">
              {import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api'}
            </code>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the request headers:
            </p>
            <code className="bg-muted px-3 py-2 rounded text-sm block">
              X-API-Key: your_api_key_here
            </code>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Available Endpoints</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-success text-success-foreground px-2 py-1 rounded text-xs font-mono">
                  GET
                </span>
                <code className="text-sm">/integrations</code>
                <span className="text-sm text-muted-foreground">- Get all integrations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
                  POST
                </span>
                <code className="text-sm">/integrations</code>
                <span className="text-sm text-muted-foreground">- Create integration</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-success text-success-foreground px-2 py-1 rounded text-xs font-mono">
                  GET
                </span>
                <code className="text-sm">/telegram/chats</code>
                <span className="text-sm text-muted-foreground">- Get Telegram chats</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
                  POST
                </span>
                <code className="text-sm">/telegram/send-message</code>
                <span className="text-sm text-muted-foreground">- Send Telegram message</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;