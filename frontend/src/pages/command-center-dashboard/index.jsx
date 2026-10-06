import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import ConversationCard from './components/ConversationCard';
import ConversationThread from './components/ConversationThread';
import FilterBar from './components/FilterBar';
import QuickActions from './components/QuickActions';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';
import socketService from '../../services/socket';
import { MessageSquare, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const CommandCenterDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    platform: 'all',
    status: 'all',
    priority: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Load data functions
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getConversations({ limit: 100 });

      if (response.success) {
        // Transform data to match component format
        const transformedConversations = response.data.map(conv => ({
          id: conv.id,
          chatId: conv.chatId,
          customerName: conv.customerName,
          customerAvatar: conv.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.customerName)}&background=random`,
          customerAvatarAlt: `Avatar for ${conv.customerName}`,
          platform: conv.platform,
          aiStatus: conv.aiStatus || 'active',
          priority: conv.priority || 'medium',
          lastMessage: conv.lastMessage ? (conv.lastMessage.length > 50 ? conv.lastMessage.substring(0, 50) + '...' : conv.lastMessage) : '',
          lastMessageTime: new Date(conv.lastMessageTime),
          lastMessageType: conv.lastMessageType || 'text',
          unreadCount: conv.unreadCount || 0,
          tags: conv.tags || [],
          username: conv.username,
          firstName: conv.firstName,
          lastName: conv.lastName,
          title: conv.title,
          messageCount: conv.messageCount || 0,
          messages: [] // Will be loaded when conversation is selected
        }));

        setConversations(transformedConversations);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to load conversations');
      }
    } catch (err) {
      console.error('❌ Error loading conversations:', err);
      setError(`Failed to load conversations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load conversations from API
  useEffect(() => {
    loadConversations();

    // Connect to Socket.IO
    socketService.connect();

    // Add a small delay to ensure socket is connected before adding listeners
    const timeoutId = setTimeout(() => {
      setIsConnected(socketService.isConnected());

      // Listen for real-time updates
      socketService.onNewMessage(handleNewMessage);
      socketService.onSentMessage(handleSentMessage);
      socketService.onChatUpdated(handleChatUpdated);
      socketService.on('telegram:status_changed', handleStatusChanged);

    }, 1000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      socketService.removeAllListeners();
      socketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time Socket.IO handlers with useCallback
  const handleNewMessage = useCallback((data) => {
    // Update conversations list
    setConversations(prevConversations => {
      const updated = prevConversations.map(conv => {
        if (conv.chatId === data.chatId) {
          return {
            ...conv,
            lastMessage: data.message.content.length > 50 ? data.message.content.substring(0, 50) + '...' : data.message.content,
            lastMessageTime: new Date(data.message.timestamp),
            unreadCount: conv.unreadCount + 1
          };
        }
        return conv;
      });
      return updated;
    });

    // Update selected conversation if it's the same chat
    setSelectedConversation(prev => {
      if (prev?.chatId === data.chatId) {
        const updated = {
          ...prev,
          messages: [...(prev.messages || []), {
            id: data.message.id,
            sender: data.message.sender,
            content: data.message.content,
            timestamp: new Date(data.message.timestamp),
            messageType: data.message.messageType
          }],
          lastMessage: data.message.content,
          lastMessageTime: new Date(data.message.timestamp)
        };
        return updated;
      }
      return prev;
    });
  }, []);

  const handleSentMessage = useCallback((data) => {
    // Only update if message doesn't exist (prevent double from Socket.IO)
    setSelectedConversation(prev => {
      if (prev?.chatId === data.chatId) {
        const messageExists = prev.messages?.some(
          msg => msg.id === data.message.id || msg.content === data.message.content
        );

        if (!messageExists) {
          const updated = {
            ...prev,
            messages: [...(prev.messages || []), {
              id: data.message.id,
              sender: data.message.sender,
              content: data.message.content,
              timestamp: new Date(data.message.timestamp),
              messageType: data.message.messageType
            }],
            lastMessage: data.message.content,
            lastMessageTime: new Date(data.message.timestamp)
          };
          return updated;
        }
      }
      return prev;
    });

    // Update conversations list
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.chatId === data.chatId) {
          return {
            ...conv,
            lastMessage: data.message.content.length > 50 ? data.message.content.substring(0, 50) + '...' : data.message.content,
            lastMessageTime: new Date(data.message.timestamp)
          };
        }
        return conv;
      });
    });
  }, []);

  const handleChatUpdated = useCallback((data) => {
    loadConversations();
  }, []);

  // Handle status change from Socket.IO
  const handleStatusChanged = useCallback((data) => {
    // Update conversations list
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.chatId === data.chatId) {
          return {
            ...conv,
            aiStatus: data.aiStatus
          };
        }
        return conv;
      });
    });

    // Update selected conversation
    setSelectedConversation(prev => {
      if (prev?.chatId === data.chatId) {
        return {
          ...prev,
          aiStatus: data.aiStatus
        };
      }
      return prev;
    });
  }, []);

  // Load full conversation with messages when selected
  const handleConversationSelect = async (conversation) => {
    try {
      const response = await api.getConversation(conversation.id, { limit: 100 });

      if (response.success) {
        const fullConversation = {
          ...conversation,
          messages: response.data.messages.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            messageType: msg.messageType,
            confidence: msg.sender === 'ai' ? 0.95 : undefined
          }))
        };

        setSelectedConversation(fullConversation);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setSelectedConversation(conversation);
    }
  };

  // Apply filters to conversations
  useEffect(() => {
    let filtered = conversations;

    if (filters?.search) {
      filtered = filtered?.filter(
        (conv) =>
          conv?.customerName?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
          conv?.lastMessage?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    if (filters?.platform !== 'all') {
      filtered = filtered?.filter((conv) => conv?.platform === filters?.platform);
    }

    if (filters?.status !== 'all') {
      filtered = filtered?.filter((conv) => conv?.aiStatus === filters?.status);
    }

    if (filters?.priority !== 'all') {
      filtered = filtered?.filter((conv) => conv?.priority === filters?.priority);
    }

    setFilteredConversations(filtered);
  }, [filters, conversations]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      platform: 'all',
      status: 'all',
      priority: 'all'
    });
  };

  const handleSendMessage = async (message, isHumanMode = false) => {
    if (selectedConversation && message?.trim()) {
      try {
        // Optimistically add message to UI
        const tempId = `temp-${Date.now()}`;
        const newMessage = {
          id: tempId,
          sender: isHumanMode ? 'agent' : 'ai',
          content: message,
          timestamp: new Date(),
          messageType: 'text',
          sending: true
        };

        // Update UI immediately
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...(prev.messages || []), newMessage]
        }));

        // Send message via API
        const response = await api.sendConversationMessage(
          selectedConversation.id,
          message,
          'text'
        );

        if (response.success) {
          // Replace temp message with real one
          setSelectedConversation(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === tempId
                ? {
                  id: response.data.id,
                  sender: isHumanMode ? 'agent' : 'ai',
                  content: message,
                  timestamp: new Date(response.data.timestamp),
                  messageType: response.data.messageType,
                  sending: false
                }
                : msg
            ),
            lastMessage: message,
            lastMessageTime: new Date()
          }));

          // Update conversations list
          setConversations(prevConversations =>
            prevConversations.map((conv) => {
              if (conv.id === selectedConversation.id) {
                return {
                  ...conv,
                  lastMessage: message,
                  lastMessageTime: new Date(),
                  aiStatus: isHumanMode ? 'handover' : 'active'
                };
              }
              return conv;
            })
          );
        }
      } catch (err) {
        console.error('Error sending message:', err);

        // Remove temp message on error
        setSelectedConversation(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => !msg.sending)
        }));

        alert('Failed to send message. Please try again.');
        throw err;
      }
    }
  };

  const handleTakeOver = async () => {
    if (selectedConversation) {
      try {
        const response = await api.updateConversationStatus(
          selectedConversation.id,
          'handover'
        );

        if (response.success) {
          setSelectedConversation(prev => ({
            ...prev,
            aiStatus: 'handover'
          }));

          setConversations(prevConversations =>
            prevConversations.map((conv) => {
              if (conv.id === selectedConversation.id) {
                return { ...conv, aiStatus: 'handover' };
              }
              return conv;
            })
          );
        }
      } catch (err) {
        console.error('Error taking over conversation:', err);
        alert('Failed to take over conversation. Please try again.');
      }
    }
  };

  const handleReleaseToAI = async () => {
    if (selectedConversation) {
      try {
        const response = await api.updateConversationStatus(
          selectedConversation.id,
          'active'
        );

        if (response.success) {
          setSelectedConversation(prev => ({
            ...prev,
            aiStatus: 'active'
          }));

          setConversations(prevConversations =>
            prevConversations.map((conv) => {
              if (conv.id === selectedConversation.id) {
                return { ...conv, aiStatus: 'active' };
              }
              return conv;
            })
          );
        }
      } catch (err) {
        console.error('Error releasing conversation to AI:', err);
        alert('Failed to release conversation. Please try again.');
      }
    }
  };

  const handleQuickAction = (actionId) => {
    console.log('Quick action triggered:', actionId);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`
        }>

        <Header />

        <main className="flex-1 overflow-hidden flex flex-col pt-16">
          <div className="flex-1 flex overflow-hidden">

            {/* Left Panel: Conversation List */}
            <div className="w-full lg:w-[400px] flex flex-col border-r border-slate-200 bg-white h-full overflow-hidden">
              {/* Header & Filters - Fixed */}
              <div className="flex-shrink-0 p-4 border-b border-slate-100 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Inbox
                  </h1>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <Wifi className="w-3 h-3 mr-1" />
                        Live
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline
                      </span>
                    )}
                    <button
                      onClick={loadConversations}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <FilterBar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onSearch={handleSearch}
                  onClearFilters={handleClearFilters} />
              </div>

              {/* Conversation List - Scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {loading && conversations.length === 0 ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-100">
                        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <Skeleton className="h-3 w-3/4" />
                          <div className="flex gap-2 pt-1">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
                      {error}
                    </div>
                    <button
                      onClick={loadConversations}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredConversations?.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {filteredConversations.map((conversation) => (
                      <ConversationCard
                        key={conversation?.id}
                        conversation={conversation}
                        isActive={selectedConversation?.id === conversation?.id}
                        onClick={() => handleConversationSelect(conversation)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="font-medium mb-1">No conversations found</p>
                    <p className="text-sm mb-4">Try adjusting your filters</p>
                    <button
                      onClick={handleClearFilters}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
              {selectedConversation ? (
                <ConversationThread
                  conversation={selectedConversation}
                  onSendMessage={handleSendMessage}
                  onTakeOver={handleTakeOver}
                  onReleaseToAI={handleReleaseToAI}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a conversation</h3>
                  <p className="text-slate-500 max-w-sm text-center">
                    Choose a conversation from the list to start chatting or view details.
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CommandCenterDashboard;
