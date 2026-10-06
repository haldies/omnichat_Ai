import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import KnowledgeManager from './components/KnowledgeManager';
import ChatbotTester from './components/ChatbotTester';
import { API_ENDPOINTS, apiCall } from '../../config/api';

const AIAgentControlPanel = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.STATS);
      if (data.status === 'success') {
        setTotalDocuments(data.stats?.vector_store?.collection?.vectors_count || 0);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKnowledgeUpdate = () => {
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <Header />
      <main 
        className={`pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground font-headline mb-2">
              AI Chatbot
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Kelola pengetahuan AI dan test chatbot Anda
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <KnowledgeManager 
                totalDocuments={totalDocuments}
                onUpdate={handleKnowledgeUpdate}
              />
              <ChatbotTester />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIAgentControlPanel;