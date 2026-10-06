import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PlatformCard from './components/PlatformCard';
import SetupWizard from './components/SetupWizard';
import WebhookManager from './components/WebhookManager';
import ConnectionTest from './components/ConnectionTest';
import APIDocumentation from './components/APIDocumentation';
import SandboxEnvironment from './components/SandboxEnvironment';
import { useIntegration } from '../../contexts/IntegrationContext';
import ApiService from '../../services/api';

const IntegrationManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('platforms');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [stats, setStats] = useState({
    totalPlatforms: 0,
    connectedCount: 0,
    errorCount: 0,
    activeWebhooks: 0
  });

  const {
    integrations,
    loading,
    error,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    toggleIntegration,
    testIntegration,
    getPlatformTemplate,
    validateConfig,
    getPlatformsWithStatus,
    loadIntegrations
  } = useIntegration();

  // Available platform templates
  const availablePlatforms = [
    {
      id: 'website',
      name: 'Website Chat Widget',
      type: 'Web Platform',
      logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      logoAlt: 'Website chat widget icon with browser and chat bubble',
      description: 'Add a live chat widget to your website for real-time customer support and engagement.',
      certified: true,
      status: 'available',
      features: ['Live Chat', 'Customizable Widget', 'File Sharing', 'Typing Indicators', 'Chat History'],
      setupFields: ['widgetName', 'websiteUrl', 'primaryColor', 'position', 'greetingMessage']
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      type: 'Messaging Platform',
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1539deafe-1766247304706.png",
      logoAlt: 'Telegram blue logo with white paper plane icon on circular background',
      description: 'Integrate Telegram Bot API for instant messaging and automated customer interactions.',
      certified: true,
      status: 'available',
      features: ['Messages', 'Media', 'Inline Keyboards', 'Webhooks'],
      setupFields: ['botToken', 'webhookUrl']
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      type: 'Messaging Platform',
      logo: "https://images.unsplash.com/photo-1644035772775-8e26685ad2f0",
      logoAlt: 'WhatsApp Business green logo with white phone icon on rounded square background',
      description: 'Connect with customers through WhatsApp Business API (WABA). Supports multiple providers: Twilio, 360Dialog, MessageBird, and more.',
      certified: true,
      status: 'available',
      features: ['Messages', 'Media', 'Templates', 'Webhooks', 'Business Profile', 'Quick Replies'],
      setupFields: ['provider', 'accessToken', 'phoneNumberId', 'businessAccountId', 'webhookVerifyToken']
    },
    {
      id: 'instagram',
      name: 'Instagram Messaging',
      type: 'Social Media Platform',
      logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1578531c9-1765127398454.png",
      logoAlt: 'Instagram gradient logo with white camera icon transitioning from purple to orange on rounded square',
      description: 'Manage Instagram Direct Messages and automated responses through Instagram Basic Display API.',
      certified: true,
      status: 'available',
      features: ['Direct Messages', 'Media', 'Stories', 'Webhooks'],
      setupFields: ['accessToken', 'appId', 'appSecret']
    }
  ];

  // Merge available platforms with connected integrations
  const getAllPlatforms = () => {
    const connectedPlatforms = getPlatformsWithStatus();
    const connectedIds = connectedPlatforms.map(p => p.id);
    
    // Add available platforms that aren't connected yet
    const availableNotConnected = availablePlatforms
      .filter(platform => !connectedIds.includes(platform.id))
      .map(platform => ({
        ...platform,
        status: 'disconnected'
      }));

    return [...connectedPlatforms, ...availableNotConnected];
  };

  const platforms = getAllPlatforms();

  // Load webhooks and stats
  useEffect(() => {
    loadWebhooks();
    updateStats();
  }, [integrations]);

  const loadWebhooks = async () => {
    // Mock webhooks for now - you can implement webhook API later
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const mockWebhooks = [
      {
        id: 'webhook-1',
        url: `${baseUrl}/api/webhooks/whatsapp`,
        status: 'active',
        events: ['message.received', 'message.sent', 'message.delivered'],
        lastTriggered: '2 minutes ago'
      },
      {
        id: 'webhook-2',
        url: `${baseUrl}/api/webhooks/telegram`,
        status: 'active',
        events: ['message.received', 'user.typing'],
        lastTriggered: '5 minutes ago'
      }
    ];
    setWebhooks(mockWebhooks);
  };

  const updateStats = () => {
    const connectedCount = platforms.filter(p => p.status === 'connected').length;
    const errorCount = platforms.filter(p => p.status === 'error').length;
    const availableCount = platforms.filter(p => p.status === 'available' || p.status === 'disconnected').length;
    
    setStats({
      totalPlatforms: platforms.length,
      connectedCount,
      errorCount,
      availableCount,
      activeWebhooks: webhooks.length
    });
  };

  const viewOptions = [
    { id: 'platforms', label: 'Platforms', icon: 'Plug' },
    { id: 'webhooks', label: 'Webhooks', icon: 'Webhook' },
    { id: 'documentation', label: 'API Docs', icon: 'BookOpen' },
    { id: 'sandbox', label: 'Sandbox', icon: 'TestTube' }
  ];

  const handleConnect = async (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platform);
      setShowSetupWizard(true);
    }
  };

  const handleDisconnect = async (platformId) => {
    try {
      const platform = platforms.find(p => p.id === platformId);
      if (platform && platform.integrationId) {
        await toggleIntegration(platform.integrationId);
      }
    } catch (err) {
      console.error('Failed to disconnect platform:', err);
    }
  };

  const handleTest = async (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platform);
      setShowConnectionTest(true);
    }
  };

  const handleConfigure = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platform);
      setShowSetupWizard(true);
    }
  };

  const handleCompleteSetup = async (formData) => {
    try {
      const { platform, config } = formData;
      
      // Generate widgetId for website platform
      if (platform === 'website' && !config.widgetId) {
        config.widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Generate API key for website platform
      if (platform === 'website' && !config.apiKey) {
        config.apiKey = `wgt_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
      }
      
      // Validate configuration
      const validation = await validateConfig(platform, config);
      if (!validation.success) {
        throw new Error(validation.errors?.join(', ') || 'Configuration validation failed');
      }

      let integration;
      if (selectedPlatform.integrationId) {
        // Update existing integration
        console.log('Updating integration:', selectedPlatform.integrationId);
        integration = await updateIntegration(selectedPlatform.integrationId, {
          config,
          status: 'ACTIVE'
        });
      } else {
        // Create new integration
        console.log('Creating new integration:', {
          name: selectedPlatform.name,
          platform: platform.toUpperCase(),
          config
        });
        
        integration = await createIntegration({
          name: selectedPlatform.name,
          platform: platform.toUpperCase(),
          description: selectedPlatform.description,
          config,
          status: 'ACTIVE'
        });
      }

      console.log('✅ Integration saved successfully:', integration);

      // Setup webhook for Telegram
      if (platform.toLowerCase() === 'telegram' && config.botToken) {
        try {
          await ApiService.setupTelegramWebhook(config.botToken);
          console.log('✅ Telegram webhook setup successful');
        } catch (webhookErr) {
          console.error('⚠️  Failed to setup webhook:', webhookErr);
          // Don't fail the whole setup if webhook fails
        }
      }

      // Close wizard
      setShowSetupWizard(false);
      setSelectedPlatform(null);
      
      // Reload integrations without full page reload
      await loadIntegrations();
      
    } catch (err) {
      console.error('❌ Setup failed:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      throw err;
    }
  };

  const handleAddWebhook = (platformId, webhookData) => {
    console.log('Adding webhook:', platformId, webhookData);
    // Implement webhook creation
  };

  const handleDeleteWebhook = (webhookId) => {
    console.log('Deleting webhook:', webhookId);
    // Implement webhook deletion
  };

  const handleTestWebhook = (webhookId) => {
    console.log('Testing webhook:', webhookId);
    // Implement webhook testing
  };

  const handleRunTest = async (platformId, testConfig) => {
    try {
      const platform = platforms.find(p => p.id === platformId);
      if (platform) {
        const result = await testIntegration(platform);
        return result;
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      <Header />
      <main className={`pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        <div className="p-3 md:p-4 lg:p-6">
          {error && (
            <div className="mb-3 p-3 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <p className="text-error text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-1">
                  Integration Management
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Connect and manage your communication platforms
                </p>
              </div>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => setActiveView('platforms')}
              >
                Add Integration
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Plug" size={18} className="text-primary" />
                  <Icon name="TrendingUp" size={14} className="text-success" />
                </div>
                <p className="text-xl md:text-2xl font-semibold text-foreground mb-0.5">
                  {stats.totalPlatforms}
                </p>
                <p className="text-xs text-muted-foreground">Total Platforms</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="CheckCircle2" size={18} className="text-success" />
                  <span className="text-[10px] px-1.5 py-0.5 bg-success/10 text-success rounded-full font-medium">
                    Active
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-semibold text-foreground mb-0.5">
                  {stats.connectedCount}
                </p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="AlertCircle" size={18} className="text-error" />
                  {stats.errorCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-error/10 text-error rounded-full font-medium">
                      Alert
                    </span>
                  )}
                </div>
                <p className="text-xl md:text-2xl font-semibold text-foreground mb-0.5">
                  {stats.errorCount}
                </p>
                <p className="text-xs text-muted-foreground">Needs Attention</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Webhook" size={18} className="text-primary" />
                  <Icon name="Activity" size={14} className="text-success" />
                </div>
                <p className="text-xl md:text-2xl font-semibold text-foreground mb-0.5">
                  {stats.activeWebhooks}
                </p>
                <p className="text-xs text-muted-foreground">Active Webhooks</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap gap-1 border-b border-border overflow-x-auto">
              {viewOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveView(option.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all border-b-2 whitespace-nowrap ${
                    activeView === option.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={option.icon} size={16} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {activeView === 'platforms' && (
            <div>
              {/* Connected Platforms Section */}
              {platforms.filter(p => p.status === 'connected').length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-foreground mb-3">Connected Platforms</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {platforms
                      .filter(p => p.status === 'connected')
                      .map((platform) => (
                        <PlatformCard
                          key={platform.id}
                          platform={platform}
                          onConnect={handleConnect}
                          onDisconnect={handleDisconnect}
                          onTest={handleTest}
                          onConfigure={handleConfigure}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Available Platforms Section */}
              <div className="mb-6">
                <h2 className="text-base font-semibold text-foreground mb-3">
                  {platforms.filter(p => p.status === 'connected').length > 0 ? 'Available Platforms' : 'Connect Your First Platform'}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {platforms
                    .filter(p => p.status !== 'connected')
                    .map((platform) => (
                      <PlatformCard
                        key={platform.id}
                        platform={platform}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                        onTest={handleTest}
                        onConfigure={handleConfigure}
                      />
                    ))}
                </div>
              </div>

              {/* Error Platforms Section */}
              {platforms.filter(p => p.status === 'error').length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={18} className="text-error" />
                    Platforms with Issues
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {platforms
                      .filter(p => p.status === 'error')
                      .map((platform) => (
                        <PlatformCard
                          key={platform.id}
                          platform={platform}
                          onConnect={handleConnect}
                          onDisconnect={handleDisconnect}
                          onTest={handleTest}
                          onConfigure={handleConfigure}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {platforms.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Plug" size={40} className="text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-medium text-foreground mb-2">No platforms available</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    There seems to be an issue loading the platforms
                  </p>
                  <Button
                    variant="outline"
                    iconName="RefreshCw"
                    iconPosition="left"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeView === 'webhooks' && (
            <WebhookManager
              platform={platforms.find((p) => p.status === 'connected')}
              webhooks={webhooks}
              onAdd={handleAddWebhook}
              onDelete={handleDeleteWebhook}
              onTest={handleTestWebhook}
            />
          )}

          {activeView === 'documentation' && (
            <APIDocumentation platform={platforms.find((p) => p.status === 'connected')} />
          )}

          {activeView === 'sandbox' && (
            <SandboxEnvironment platform={platforms.find((p) => p.status === 'connected')} />
          )}
        </div>
      </main>

      {showSetupWizard && selectedPlatform && (
        <SetupWizard
          platform={selectedPlatform}
          onClose={() => {
            setShowSetupWizard(false);
            setSelectedPlatform(null);
          }}
          onComplete={handleCompleteSetup}
        />
      )}

      {showConnectionTest && selectedPlatform && (
        <ConnectionTest
          platform={selectedPlatform}
          onClose={() => {
            setShowConnectionTest(false);
            setSelectedPlatform(null);
          }}
          onRunTest={handleRunTest}
        />
      )}
    </div>
  );
};

export default IntegrationManagement;