import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WhatsAppSetup = ({ onComplete, onClose, existingConfig = null }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    accessToken: existingConfig?.accessToken || '',
    phoneNumberId: existingConfig?.phoneNumberId || '',
    businessAccountId: existingConfig?.businessAccountId || '',
    webhookVerifyToken: existingConfig?.webhookVerifyToken || `verify_${Date.now()}`
  });
  const [errors, setErrors] = useState({});

  const validateConfig = () => {
    const newErrors = {};

    if (!config.accessToken.trim()) {
      newErrors.accessToken = 'Access Token is required';
    }
    if (!config.phoneNumberId.trim()) {
      newErrors.phoneNumberId = 'Phone Number ID is required';
    }
    if (!config.webhookVerifyToken.trim()) {
      newErrors.webhookVerifyToken = 'Webhook Verify Token is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateConfig()) {
      setStep(2);
    }
  };

  const handleComplete = () => {
    if (validateConfig()) {
      onComplete({
        platform: 'whatsapp',
        config: {
          ...config,
          provider: 'meta',
          apiVersion: 'v18.0'
        }
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="MessageCircle" size={40} className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Connect WhatsApp Business
        </h3>
        <p className="text-muted-foreground">
          Enter your WhatsApp Business API credentials from Meta
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Access Token *
          </label>
          <input
            type="password"
            value={config.accessToken}
            onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
            placeholder="EAAxxxxxxxxx"
            className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.accessToken ? 'border-error' : 'border-border'
            }`}
          />
          {errors.accessToken && (
            <p className="text-xs text-error mt-1">{errors.accessToken}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Get from Meta Business Suite → WhatsApp → API Setup
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone Number ID *
          </label>
          <input
            type="text"
            value={config.phoneNumberId}
            onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
            placeholder="123456789012345"
            className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.phoneNumberId ? 'border-error' : 'border-border'
            }`}
          />
          {errors.phoneNumberId && (
            <p className="text-xs text-error mt-1">{errors.phoneNumberId}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Your WhatsApp Business phone number ID
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Business Account ID (Optional)
          </label>
          <input
            type="text"
            value={config.businessAccountId}
            onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
            placeholder="123456789012345"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your WhatsApp Business Account ID (WABA ID)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Webhook Verify Token *
          </label>
          <input
            type="text"
            value={config.webhookVerifyToken}
            onChange={(e) => setConfig({ ...config, webhookVerifyToken: e.target.value })}
            placeholder="your_verify_token"
            className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.webhookVerifyToken ? 'border-error' : 'border-border'
            }`}
          />
          {errors.webhookVerifyToken && (
            <p className="text-xs text-error mt-1">{errors.webhookVerifyToken}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Token to verify webhook requests (auto-generated, you can change it)
          </p>
        </div>
      </div>

      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex gap-2">
          <Icon name="Info" size={16} className="text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm text-info">
            <p className="font-medium mb-1">Where to find these credentials:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to Meta Business Suite</li>
              <li>Select your WhatsApp Business Account</li>
              <li>Navigate to API Setup</li>
              <li>Copy the Access Token and Phone Number ID</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-2">
          <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium mb-1">Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              <li>Facebook Business Manager account</li>
              <li>WhatsApp Business Account (WABA)</li>
              <li>Verified WhatsApp Business phone number</li>
            </ul>
          </div>
        </div>
      </div>
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
          Please review your WhatsApp Business settings
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-foreground">Configuration Summary</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Access Token:</span>
            <span className="text-sm text-foreground font-mono">••••••••</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Phone Number ID:</span>
            <span className="text-sm text-foreground font-mono">{config.phoneNumberId}</span>
          </div>
          
          {config.businessAccountId && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Business Account ID:</span>
              <span className="text-sm text-foreground font-mono">{config.businessAccountId}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Webhook Verify Token:</span>
            <span className="text-sm text-foreground font-mono">••••••••</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Icon name="Webhook" size={18} className="text-green-600" />
          Webhook Configuration
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          After setup, configure your webhook in Meta Business Suite:
        </p>
        <div className="bg-white rounded-lg p-3 mb-3">
          <p className="text-xs text-muted-foreground mb-1">Callback URL:</p>
          <code className="text-xs text-foreground break-all">
            {window.location.origin.replace('http://localhost:4028', 'https://your-tunnel-url.trycloudflare.com')}/api/webhooks/whatsapp
          </code>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Verify Token:</p>
          <code className="text-xs text-foreground break-all">
            {config.webhookVerifyToken}
          </code>
        </div>
      </div>

      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex gap-2">
          <Icon name="Info" size={16} className="text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm text-info">
            <p className="font-medium mb-1">Next Steps:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Complete this setup</li>
              <li>Go to Meta Business Suite → WhatsApp → Configuration</li>
              <li>Add the webhook URL and verify token</li>
              <li>Subscribe to webhook events (messages)</li>
              <li>Start receiving messages!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Icon name="MessageCircle" size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">WhatsApp Business Setup</h2>
                <p className="text-sm text-muted-foreground">Step {step} of 2</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            >
              <Icon name="X" size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-green-600' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : () => setStep(1)}
            iconName={step === 1 ? "X" : "ArrowLeft"}
            iconPosition="left"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            variant="default"
            onClick={step === 1 ? handleNext : handleComplete}
            iconName={step === 1 ? "ArrowRight" : "Check"}
            iconPosition="right"
            className="bg-green-600 hover:bg-green-700"
          >
            {step === 1 ? 'Next' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSetup;
