import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { API_ENDPOINTS, apiCall } from '../../../config/api';

const ChatbotTester = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! Saya AI chatbot Anda. Tanyakan apa saja tentang dokumen yang sudah Anda upload.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await apiCall(API_ENDPOINTS.QUERY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          top_k: 5,
        }),
      });

      const assistantMessage = {
        role: 'assistant',
        content: data.answer || 'Maaf, saya tidak dapat menjawab pertanyaan Anda.',
        sources: data.sources || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Pastikan Anda sudah mengupload dokumen PDF terlebih dahulu.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={24} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Test Chatbot
        </h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[400px] max-h-[600px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {message.role === 'user' ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>

            {/* Message Content */}
            <div className={`
              flex-1 max-w-[80%]
              ${message.role === 'user' ? 'text-right' : 'text-left'}
            `}>
              <div className={`
                inline-block p-3 rounded-lg text-sm
                ${message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border text-foreground'
                }
              `}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Sources (only for assistant messages with sources) */}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="mb-1">Sumber: {message.sources.length} dokumen</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-lg bg-background border border-border">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border pt-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pertanyaan Anda di sini..."
            disabled={loading}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 self-end"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tekan Enter untuk kirim, Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
};

export default ChatbotTester;
