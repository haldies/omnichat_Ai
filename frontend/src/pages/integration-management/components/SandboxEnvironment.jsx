import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SandboxEnvironment = ({ platform }) => {
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  if (!platform) {
    return (
      <div className="text-center py-12">
        <Icon name="TestTube" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Connected Platform</h3>
        <p className="text-muted-foreground">
          Connect a platform first to use the sandbox
        </p>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId.trim()) return;

    setSending(true);
    setResult(null);

    try {
      // Mock API call - replace with actual API service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult({
        success: true,
        message: 'Message sent successfully!',
        data: {
          chatId,
          message,
          timestamp: new Date().toISOString()
        }
      });
      
      setMessage('');
    } catch (error) {
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Sandbox Environment</h2>
        <p className="text-muted-foreground">
          Test your {platform.name} integration in a safe environment
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Send Test Message</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chat ID
              </label>
              <Input
                type="text"
                placeholder="Enter chat ID"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
                placeholder="Enter your test message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button
              variant="default"
              onClick={handleSendMessage}
              disabled={sending || !message.trim() || !chatId.trim()}
              iconName={sending ? 'Loader2' : 'Send'}
              iconPosition="left"
              className={`w-full ${sending ? 'animate-spin' : ''}`}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Response</h3>
          
          {!result && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="MessageSquare" size={32} className="mx-auto mb-2" />
              <p>Send a message to see the response</p>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-success/10 border-success/20' 
                : 'bg-error/10 border-error/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon 
                  name={result.success ? 'CheckCircle2' : 'AlertCircle'} 
                  size={20} 
                  className={result.success ? 'text-success' : 'text-error'} 
                />
                <h4 className={`font-medium ${
                  result.success ? 'text-success' : 'text-error'
                }`}>
                  {result.success ? 'Success' : 'Error'}
                </h4>
              </div>
              <p className={`text-sm mb-3 ${
                result.success ? 'text-success' : 'text-error'
              }`}>
                {result.message}
              </p>
              
              {result.data && (
                <div className="bg-muted/50 rounded p-3">
                  <pre className="text-xs text-muted-foreground overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={16} className="text-info mt-0.5" />
          <div>
            <p className="text-sm text-info font-medium mb-1">Sandbox Mode</p>
            <p className="text-xs text-info/80">
              This is a test environment. Messages sent here will use your actual {platform.name} integration but are marked as test messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxEnvironment;