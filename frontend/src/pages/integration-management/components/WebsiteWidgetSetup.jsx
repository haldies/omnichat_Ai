import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WebsiteWidgetSetup = ({ onComplete, onClose, existingConfig = null }) => {
  const [step, setStep] = useState(1);
  const [showPreviewChat, setShowPreviewChat] = useState(false);
  const [config, setConfig] = useState({
    widgetName: existingConfig?.widgetName || 'Customer Support',
    websiteUrl: existingConfig?.websiteUrl || '',
    allowedDomains: existingConfig?.allowedDomains || [],
    testingMode: existingConfig?.testingMode ?? true, // Enable by default for easy testing
    apiKey: existingConfig?.apiKey || '', // Will be generated
    primaryColor: existingConfig?.primaryColor || '#3b82f6',
    position: existingConfig?.position || 'bottom-right',
    greetingMessage: existingConfig?.greetingMessage || 'Hi! How can we help you today?',
    welcomeMessage: existingConfig?.welcomeMessage || 'Welcome! We\'re here to help.',
    offlineMessage: existingConfig?.offlineMessage || 'We\'re currently offline. Leave us a message!',
    showAgentAvatar: existingConfig?.showAgentAvatar ?? true,
    enableFileUpload: existingConfig?.enableFileUpload ?? true,
    enableEmoji: existingConfig?.enableEmoji ?? true,
    soundEnabled: existingConfig?.soundEnabled ?? true,
    businessHours: existingConfig?.businessHours || {
      enabled: false,
      timezone: 'Asia/Jakarta',
      schedule: {
        monday: { open: '09:00', close: '17:00', enabled: true },
        tuesday: { open: '09:00', close: '17:00', enabled: true },
        wednesday: { open: '09:00', close: '17:00', enabled: true },
        thursday: { open: '09:00', close: '17:00', enabled: true },
        friday: { open: '09:00', close: '17:00', enabled: true },
        saturday: { open: '09:00', close: '14:00', enabled: false },
        sunday: { open: '09:00', close: '14:00', enabled: false }
      }
    }
  });

  const [errors, setErrors] = useState({});

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right', icon: 'ArrowDownRight' },
    { value: 'bottom-left', label: 'Bottom Left', icon: 'ArrowDownLeft' },
    { value: 'top-right', label: 'Top Right', icon: 'ArrowUpRight' },
    { value: 'top-left', label: 'Top Left', icon: 'ArrowUpLeft' }
  ];

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!config.widgetName.trim()) {
        newErrors.widgetName = 'Widget name is required';
      }
      if (!config.websiteUrl.trim()) {
        newErrors.websiteUrl = 'Website URL is required';
      } else if (!/^https?:\/\/.+/.test(config.websiteUrl)) {
        newErrors.websiteUrl = 'Please enter a valid URL (http:// or https://)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleComplete = () => {
    if (validateStep(step)) {
      onComplete({
        platform: 'website',
        config
      });
    }
  };

  const generateEmbedCode = () => {
    const widgetId = existingConfig?.widgetId || `widget-${Date.now()}`;
    const apiKey = config.apiKey || 'YOUR_API_KEY_HERE';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    return `<!-- OmniChat Widget -->
<script>
  (function() {
    window.OmniChatConfig = {
      widgetId: '${widgetId}',
      apiKey: '${apiKey}',
      apiUrl: '${apiUrl}',
      primaryColor: '${config.primaryColor}',
      position: '${config.position}',
      greetingMessage: '${config.greetingMessage}',
      welcomeMessage: '${config.welcomeMessage}',
      offlineMessage: '${config.offlineMessage}',
      showAgentAvatar: ${config.showAgentAvatar},
      enableFileUpload: ${config.enableFileUpload},
      enableEmoji: ${config.enableEmoji},
      soundEnabled: ${config.soundEnabled}
    };
    
    var script = document.createElement('script');
    script.src = '${apiUrl}/widget/omnichat-widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
<!-- End OmniChat Widget -->`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="Globe" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Website Chat Widget Setup</h2>
                <p className="text-sm text-muted-foreground">Step {step} of 3</p>
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
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Widget Name *
                    </label>
                    <input
                      type="text"
                      value={config.widgetName}
                      onChange={(e) => setConfig({ ...config, widgetName: e.target.value })}
                      placeholder="e.g., Customer Support"
                      className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.widgetName ? 'border-error' : 'border-border'
                      }`}
                    />
                    {errors.widgetName && (
                      <p className="text-xs text-error mt-1">{errors.widgetName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      value={config.websiteUrl}
                      onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.websiteUrl ? 'border-error' : 'border-border'
                      }`}
                    />
                    {errors.websiteUrl && (
                      <p className="text-xs text-error mt-1">{errors.websiteUrl}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Where you'll install this widget
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-2 mb-3">
                      <Icon name="Key" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">API Key Authentication</p>
                        <p className="text-xs text-blue-700 mt-1">
                          An API key will be automatically generated for secure widget authentication.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">API Key Preview:</p>
                      <code className="text-xs text-foreground break-all">
                        {config.apiKey || 'Will be generated after setup'}
                      </code>
                    </div>
                  </div>

                  {/* Testing Mode Toggle */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.testingMode}
                        onChange={(e) => setConfig({ ...config, testingMode: e.target.checked })}
                        className="w-5 h-5 rounded border-green-400 text-green-600 focus:ring-green-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="TestTube" size={16} className="text-green-600" />
                          <span className="text-sm font-semibold text-green-900">Testing Mode</span>
                          <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
                            {config.testingMode ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-xs text-green-800 mb-2">
                          {config.testingMode ? (
                            <>
                              ✅ <strong>Domain validation disabled</strong> - Widget works on any domain (localhost, 127.0.0.1, etc)
                            </>
                          ) : (
                            <>
                              🔒 <strong>Domain validation enabled</strong> - Only allowed domains can use the widget
                            </>
                          )}
                        </p>
                        <p className="text-xs text-green-700">
                          {config.testingMode ? (
                            <>Perfect for development and testing. Disable for production.</>
                          ) : (
                            <>Recommended for production. Add allowed domains below.</>
                          )}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Domain Whitelist - Only show if Testing Mode is OFF */}
                  {!config.testingMode && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex gap-2 mb-2">
                        <Icon name="Shield" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900">🔒 Domain Whitelist (Required for Production)</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Add domains that are allowed to use this widget. Requests from other domains will be blocked.
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-amber-800 mb-2 font-medium">Add allowed domains:</p>
                        <input
                          type="text"
                          placeholder="example.com or *.example.com"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const domain = e.target.value.trim();
                              if (domain && !config.allowedDomains.includes(domain)) {
                                setConfig({
                                  ...config,
                                  allowedDomains: [...config.allowedDomains, domain]
                                });
                                e.target.value = '';
                              }
                            }
                          }}
                          className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        <div className="mt-2 space-y-1 text-xs text-amber-700">
                          <p>• Press <kbd className="px-1 py-0.5 bg-amber-100 rounded">Enter</kbd> to add domain</p>
                          <p>• Example: <code className="px-1 py-0.5 bg-amber-100 rounded">tokosaya.com</code> or <code className="px-1 py-0.5 bg-amber-100 rounded">*.tokosaya.com</code></p>
                        </div>
                        
                        {config.allowedDomains.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-amber-800 mb-2 font-medium">Allowed domains:</p>
                            <div className="flex flex-wrap gap-2">
                              {config.allowedDomains.map((domain, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md"
                                >
                                  <Icon name="Check" size={12} className="text-green-600" />
                                  {domain}
                                  <button
                                    onClick={() => {
                                      setConfig({
                                        ...config,
                                        allowedDomains: config.allowedDomains.filter((_, i) => i !== index)
                                      });
                                    }}
                                    className="hover:text-amber-900"
                                  >
                                    <Icon name="X" size={12} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {config.allowedDomains.length === 0 && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-xs text-red-700">
                              ⚠️ <strong>Warning:</strong> No domains added. Please add at least one domain for production.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {config.testingMode && (
                    <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                      <div className="flex gap-2">
                        <Icon name="Info" size={16} className="text-info flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-info">
                          <p className="font-medium mb-1">Testing Mode Active</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Widget will work on <strong>any domain</strong> (localhost, 127.0.0.1, etc)</li>
                            <li>Perfect for development and testing</li>
                            <li><strong>Remember to disable Testing Mode</strong> before going to production</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Customize Appearance</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-16 h-12 rounded-lg border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Widget Position
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {positions.map((pos) => (
                        <button
                          key={pos.value}
                          onClick={() => setConfig({ ...config, position: pos.value })}
                          className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                            config.position === pos.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon name={pos.icon} size={20} className="text-foreground" />
                          <span className="text-sm font-medium text-foreground">{pos.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Greeting Message
                    </label>
                    <input
                      type="text"
                      value={config.greetingMessage}
                      onChange={(e) => setConfig({ ...config, greetingMessage: e.target.value })}
                      placeholder="Hi! How can we help you today?"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Welcome Message
                    </label>
                    <textarea
                      value={config.welcomeMessage}
                      onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                      placeholder="Welcome! We're here to help."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showAgentAvatar}
                        onChange={(e) => setConfig({ ...config, showAgentAvatar: e.target.checked })}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Show agent avatar</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.enableFileUpload}
                        onChange={(e) => setConfig({ ...config, enableFileUpload: e.target.checked })}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Enable file upload</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.enableEmoji}
                        onChange={(e) => setConfig({ ...config, enableEmoji: e.target.checked })}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Enable emoji picker</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.soundEnabled}
                        onChange={(e) => setConfig({ ...config, soundEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Enable notification sound</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Installation Code</h3>
                
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Code" size={18} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">Embed Code</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Copy"
                        onClick={copyToClipboard}
                      >
                        Copy
                      </Button>
                    </div>
                    <pre className="text-xs text-foreground overflow-x-auto bg-background p-4 rounded border border-border">
                      <code>{generateEmbedCode()}</code>
                    </pre>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                    <div className="flex gap-3">
                      <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-foreground">Installation Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Copy the embed code above</li>
                          <li>Paste it before the closing &lt;/body&gt; tag in your website</li>
                          <li>Save and publish your changes</li>
                          <li>The chat widget will appear on your website</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900">
                        <p className="font-medium mb-1">Security Notice:</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-800">
                          <li>Keep your API key secure and never expose it publicly</li>
                          <li>The API key is embedded in the widget code (client-side)</li>
                          <li>Use domain whitelist for additional security</li>
                          <li>You can regenerate the API key anytime from settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">Widget Preview</h4>
                    <div className="relative bg-muted/30 rounded-lg p-8 min-h-[400px]">
                      {/* Preview Widget Button */}
                      <div
                        className={`absolute ${
                          config.position === 'bottom-right' ? 'bottom-4 right-4' :
                          config.position === 'bottom-left' ? 'bottom-4 left-4' :
                          config.position === 'top-right' ? 'top-4 right-4' :
                          'top-4 left-4'
                        }`}
                      >
                        <button
                          onClick={() => setShowPreviewChat(!showPreviewChat)}
                          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          <Icon name="MessageCircle" size={24} className="text-white" />
                        </button>
                      </div>

                      {/* Preview Chat Window */}
                      {showPreviewChat && (
                        <div
                          className={`absolute ${
                            config.position.includes('right') ? 'right-4' : 'left-4'
                          } ${
                            config.position.includes('bottom') ? 'bottom-20' : 'top-20'
                          } w-80 bg-white rounded-2xl shadow-2xl overflow-hidden`}
                        >
                          {/* Header */}
                          <div
                            className="p-4 text-white"
                            style={{ backgroundColor: config.primaryColor }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-sm">{config.widgetName}</h3>
                                <p className="text-xs opacity-90 flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                  Online
                                </p>
                              </div>
                              <button
                                onClick={() => setShowPreviewChat(false)}
                                className="hover:bg-white/20 rounded-lg p-1 transition-colors"
                              >
                                <Icon name="X" size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="p-4 bg-gray-50 h-64 overflow-y-auto">
                            <div className="text-center mb-4">
                              <div
                                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                                style={{ backgroundColor: `${config.primaryColor}20` }}
                              >
                                <Icon name="MessageCircle" size={20} style={{ color: config.primaryColor }} />
                              </div>
                              <h4 className="font-semibold text-sm text-gray-900">{config.welcomeMessage}</h4>
                              <p className="text-xs text-gray-600 mt-1">{config.greetingMessage}</p>
                            </div>

                            {/* Sample message */}
                            <div className="flex gap-2 mb-3">
                              {config.showAgentAvatar && (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                              )}
                              <div className="bg-white rounded-lg rounded-bl-sm p-3 shadow-sm max-w-[70%]">
                                <p className="text-sm text-gray-900">This is a preview message</p>
                                <p className="text-xs text-gray-500 mt-1">Just now</p>
                              </div>
                            </div>
                          </div>

                          {/* Input */}
                          <div className="p-3 bg-white border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              {config.enableFileUpload && (
                                <button className="text-gray-400 hover:text-gray-600 p-2">
                                  <Icon name="Paperclip" size={18} />
                                </button>
                              )}
                              <input
                                type="text"
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': config.primaryColor }}
                                disabled
                              />
                              {config.enableEmoji && (
                                <button className="text-gray-400 hover:text-gray-600 p-2">
                                  <Icon name="Smile" size={18} />
                                </button>
                              )}
                              <button
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: config.primaryColor }}
                              >
                                <Icon name="Send" size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-500">
                              Powered by <span className="font-semibold">OmniChat</span>
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="text-center text-muted-foreground text-sm">
                        Click the button to preview the widget
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : handleBack}
            iconName={step === 1 ? "X" : "ArrowLeft"}
            iconPosition="left"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                variant="default"
                onClick={handleNext}
                iconName="ArrowRight"
                iconPosition="right"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleComplete}
                iconName="Check"
                iconPosition="left"
              >
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteWidgetSetup;
