import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConnectionTest = ({ platform, onClose, onRunTest }) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunTest = async () => {
    setTesting(true);
    setResults(null);

    try {
      const result = await onRunTest(platform.id, {
        platform: platform.id,
        config: platform.config
      });
      
      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        message: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Test Connection - {platform.name}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="TestTube" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Connection Test
            </h3>
            <p className="text-muted-foreground">
              Test your {platform.name} integration to ensure it's working properly
            </p>
          </div>

          {!results && !testing && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Yang akan di-test:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• ✅ Koneksi ke Telegram API</li>
                  <li>• ✅ Status bot (aktif/tidak)</li>
                  <li>• ✅ Webhook configuration</li>
                  <li>• ✅ Chat yang masuk</li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-foreground">
                  💡 <strong>Tips:</strong> Test ini akan langsung cek ke Telegram API secara real-time untuk memastikan bot kamu aktif dan bisa menerima pesan.
                </p>
              </div>
            </div>
          )}

          {testing && (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Testing koneksi ke Telegram...</p>
              <p className="text-xs text-muted-foreground mt-2">Mohon tunggu sebentar</p>
            </div>
          )}

          {results && (
            <div className={`p-4 rounded-lg border ${
              results.success 
                ? 'bg-success/10 border-success/20' 
                : 'bg-error/10 border-error/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon 
                  name={results.success ? 'CheckCircle2' : 'AlertCircle'} 
                  size={20} 
                  className={results.success ? 'text-success' : 'text-error'} 
                />
                <h4 className={`font-medium ${
                  results.success ? 'text-success' : 'text-error'
                }`}>
                  {results.success ? 'Test Berhasil ✅' : 'Test Gagal ❌'}
                </h4>
              </div>
              <p className={`text-sm whitespace-pre-line ${
                results.success ? 'text-success' : 'text-error'
              }`}>
                {results.message}
              </p>
              
              {results.success && results.data && (
                <div className="mt-4 space-y-3">
                  {/* Bot Info */}
                  {results.data.bot && (
                    <div className="p-3 bg-muted/50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Bot" size={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">Info Bot</span>
                      </div>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p><strong>Username:</strong> @{results.data.bot.username}</p>
                        <p><strong>Name:</strong> {results.data.bot.first_name}</p>
                        <p><strong>ID:</strong> {results.data.bot.id}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Webhook Info */}
                  {results.data.webhook && (
                    <div className="p-3 bg-muted/50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Webhook" size={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">Webhook Status</span>
                      </div>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p><strong>URL:</strong> {results.data.webhook.url || 'Belum diset'}</p>
                        {results.data.webhook.pending_update_count !== undefined && (
                          <p><strong>Pending updates:</strong> {results.data.webhook.pending_update_count}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Chats Info */}
                  {results.data.chats && results.data.chats.length > 0 && (
                    <div className="p-3 bg-muted/50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="MessageCircle" size={16} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Chat Terbaru ({results.data.chatCount})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {results.data.chats.map((chat, idx) => (
                          <div key={idx} className="text-xs p-2 bg-background rounded">
                            <p className="font-medium text-foreground">
                              {chat.firstName || chat.username || 'Unknown'}
                              {chat.username && <span className="text-muted-foreground"> (@{chat.username})</span>}
                            </p>
                            <p className="text-muted-foreground text-[10px]">
                              {new Date(chat.lastMessageAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>

          <div className="flex gap-2">
            {results && (
              <Button
                variant="outline"
                onClick={() => {
                  setResults(null);
                }}
              >
                Reset
              </Button>
            )}
            <Button
              variant="default"
              onClick={handleRunTest}
              disabled={testing}
              iconName={testing ? 'Loader2' : 'Play'}
              iconPosition="left"
              className={testing ? 'animate-spin' : ''}
            >
              {testing ? 'Testing...' : 'Run Test'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;