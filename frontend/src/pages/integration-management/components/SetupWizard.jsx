import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import WebsiteWidgetSetup from './WebsiteWidgetSetup';
import WhatsAppSetup from './WhatsAppSetup';

const SetupWizard = ({ platform, onClose, onComplete }) => {
  // If platform is website, use WebsiteWidgetSetup component
  if (platform.id === 'website') {
    return (
      <WebsiteWidgetSetup
        onComplete={onComplete}
        onClose={onClose}
        existingConfig={platform.config}
      />
    );
  }

  // If platform is whatsapp, use WhatsAppSetup component
  if (platform.id === 'whatsapp') {
    return (
      <WhatsAppSetup
        onComplete={onComplete}
        onClose={onClose}
        existingConfig={platform.config}
      />
    );
  }

  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Platform-specific configuration templates
  const getConfigTemplate = (platformId) => {
    const templates = {
      telegram: {
        botToken: {
          label: 'Bot Token',
          type: 'password',
          placeholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
          required: true,
          description: 'Get this token from @BotFather on Telegram'
        },
        webhookUrl: {
          label: 'Webhook URL (Optional)',
          type: 'url',
          placeholder: 'https://your-domain.com/api/webhooks/telegram',
          required: false,
          description: 'URL where Telegram will send updates'
        }
      },
      whatsapp: {
        provider: {
          label: 'WhatsApp Provider',
          type: 'select',
          options: [
            { value: 'meta', label: 'Meta (Official)' },
            { value: 'twilio', label: 'Twilio' },
            { value: '360dialog', label: '360Dialog' },
            { value: 'messagebird', label: 'MessageBird' },
            { value: 'infobip', label: 'Infobip' },
            { value: 'other', label: 'Other Provider' }
          ],
          required: true,
          description: 'Select your WhatsApp Business API provider'
        },
        accessToken: {
          label: 'Access Token',
          type: 'password',
          placeholder: 'EAAxxxxxxxxx',
          required: true,
          description: 'Your WhatsApp Business API Access Token'
        },
        phoneNumberId: {
          label: 'Phone Number ID',
          type: 'text',
          placeholder: '123456789012345',
          required: true,
          description: 'Your WhatsApp Business phone number ID'
        },
        businessAccountId: {
          label: 'Business Account ID (Optional)',
          type: 'text',
          placeholder: '123456789012345',
          required: false,
          description: 'Your WhatsApp Business Account ID (WABA ID)'
        },
        webhookVerifyToken: {
          label: 'Webhook Verify Token',
          type: 'password',
          placeholder: 'your_verify_token',
          required: true,
          description: 'Token to verify webhook requests from WhatsApp'
        },
        apiVersion: {
          label: 'API Version (Optional)',
          type: 'text',
          placeholder: 'v18.0',
          required: false,
          description: 'WhatsApp API version (default: v18.0)'
        }
      },
      instagram: {
        accessToken: {
          label: 'Access Token',
          type: 'password',
          placeholder: 'IGQVJxxxxxxxxx',
          required: true,
          description: 'Instagram Basic Display API Access Token'
        },
        appId: {
          label: 'App ID',
          type: 'text',
          placeholder: '123456789012345',
          required: true,
          description: 'Your Instagram App ID'
        }
      }
    };

    return templates[platformId] || {};
  };

  const configTemplate = getConfigTemplate(platform.id);

  useEffect(() => {
    // Initialize config with existing values if editing
    if (platform.config) {
      setConfig(platform.config);
    }
  }, [platform]);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateConfig = () => {
    const newErrors = {};
    
    Object.entries(configTemplate).forEach(([field, template]) => {
      if (template.required && !config[field]) {
        newErrors[field] = `${template.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateConfig()) {
        setStep(2);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateConfig()) return;

    setLoading(true);
    try {
      await onComplete({
        platform: platform.id,
        config
      });
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Settings" size={32} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Configure {platform.name}
        </h3>
        <p className="text-muted-foreground">
          Enter your {platform.name} credentials to connect
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(configTemplate).map(([field, template]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-foreground mb-2">
              {template.label}
              {template.required && <span className="text-error ml-1">*</span>}
            </label>
            {template.type === 'select' ? (
              <select
                value={config[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors[field] ? 'border-error' : 'border-border'
                }`}
              >
                <option value="">Select {template.label}</option>
                {template.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={template.type}
                placeholder={template.placeholder}
                value={config[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                error={errors[field]}
              />
            )}
            {template.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {template.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {errors.general && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-error text-sm">{errors.general}</p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle2" size={32} className="text-success" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Review Configuration
        </h3>
        <p className="text-muted-foreground">
          Please review your settings before connecting
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-foreground">Configuration Summary</h4>
        {Object.entries(configTemplate).map(([field, template]) => (
          <div key={field} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{template.label}:</span>
            <span className="text-sm text-foreground">
              {config[field] ? 
                (template.type === 'password' ? '••••••••' : config[field]) : 
                'Not set'
              }
            </span>
          </div>
        ))}
      </div>

      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={16} className="text-info mt-0.5" />
          <div>
            <p className="text-sm text-info font-medium mb-1">Security Note</p>
            <p className="text-xs text-info/80">
              Your credentials are stored securely and encrypted. They will only be used to connect to {platform.name}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Setup {platform.name}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : handleBack}
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            variant="default"
            onClick={step === 1 ? handleNext : handleComplete}
            disabled={loading}
            iconName={loading ? 'Loader2' : undefined}
            iconPosition="left"
            className={loading ? 'animate-spin' : ''}
          >
            {loading ? 'Connecting...' : step === 1 ? 'Next' : 'Connect'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;