import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PlatformCard = ({ platform, onConnect, onDisconnect, onTest, onConfigure }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'disconnected':
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle2';
      case 'error':
        return 'AlertCircle';
      case 'disconnected':
      default:
        return 'Circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'disconnected':
      default:
        return 'Not Connected';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {platform.logo ? (
              <Image
                src={platform.logo}
                alt={platform.logoAlt || `${platform.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon name="Plug" size={24} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{platform.name}</h3>
            <p className="text-sm text-muted-foreground">{platform.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {platform.certified && (
            <div className="w-5 h-5 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="Shield" size={12} className="text-success" />
            </div>
          )}
          <div className={`flex items-center gap-1 ${getStatusColor(platform.status)}`}>
            <Icon name={getStatusIcon(platform.status)} size={16} />
            <span className="text-sm font-medium">{getStatusText(platform.status)}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {platform.description}
      </p>

      {platform.status === 'error' && platform.errorMessage && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{platform.errorMessage}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {platform.status === 'connected' ? (
          <>
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
              iconPosition="left"
              onClick={() => onConfigure(platform.id)}
              className="flex-1"
            >
              Configure
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="TestTube"
              onClick={() => onTest(platform.id)}
            >
              Test
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Unplug"
              onClick={() => onDisconnect(platform.id)}
              className="text-error hover:text-error"
            >
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="default"
              size="sm"
              iconName="Plug"
              iconPosition="left"
              onClick={() => onConnect(platform.id)}
              className="flex-1"
            >
              Connect
            </Button>
            {platform.status === 'error' && (
              <Button
                variant="outline"
                size="sm"
                iconName="RotateCcw"
                onClick={() => onConnect(platform.id)}
              >
                Retry
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlatformCard;