import React, { useState } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import MetricCard from './components/MetricCard';
import ChartCard from './components/ChartCard';
import ConversationVolumeChart from './components/ConversationVolumeChart';
import AIPerformanceChart from './components/AIPerformanceChart';
import SatisfactionChart from './components/SatisfactionChart';
import ResponseTimeChart from './components/ResponseTimeChart';
import FilterBar from './components/FilterBar';
import BenchmarkCard from './components/BenchmarkCard';
import ROICalculator from './components/ROICalculator';
import ExportModal from './components/ExportModal';

const AnalyticsObservatory = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState('last30days');
  const [platform, setPlatform] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const overviewMetrics = [
    {
      title: "Total Conversations",
      value: "12,847",
      change: "+18.2%",
      changeType: "positive",
      icon: "MessageSquare",
      iconColor: "var(--color-primary)",
      trend: [40, 55, 48, 65, 72, 68, 85]
    },
    {
      title: "AI Resolution Rate",
      value: "87.3%",
      change: "+5.4%",
      changeType: "positive",
      icon: "Bot",
      iconColor: "var(--color-success)",
      trend: [60, 65, 70, 75, 80, 85, 87]
    },
    {
      title: "Avg Response Time",
      value: "2.4s",
      change: "-12.8%",
      changeType: "positive",
      icon: "Clock",
      iconColor: "var(--color-accent)",
      trend: [85, 78, 72, 65, 58, 52, 45]
    },
    {
      title: "Customer Satisfaction",
      value: "4.8/5.0",
      change: "+0.3",
      changeType: "positive",
      icon: "Star",
      iconColor: "var(--color-warning)",
      trend: [70, 72, 75, 78, 82, 85, 88]
    }
  ];

  const conversationVolumeData = [
    { date: "Dec 16", whatsapp: 245, telegram: 189, instagram: 156 },
    { date: "Dec 17", whatsapp: 268, telegram: 201, instagram: 178 },
    { date: "Dec 18", whatsapp: 289, telegram: 215, instagram: 192 },
    { date: "Dec 19", whatsapp: 312, telegram: 234, instagram: 208 },
    { date: "Dec 20", whatsapp: 298, telegram: 228, instagram: 198 },
    { date: "Dec 21", whatsapp: 325, telegram: 245, instagram: 215 },
    { date: "Dec 22", whatsapp: 342, telegram: 258, instagram: 228 }
  ];

  const aiPerformanceData = [
    { time: "00:00", confidence: 85, accuracy: 88, handover: 12 },
    { time: "04:00", confidence: 87, accuracy: 90, handover: 10 },
    { time: "08:00", confidence: 92, accuracy: 94, handover: 6 },
    { time: "12:00", confidence: 89, accuracy: 91, handover: 9 },
    { time: "16:00", confidence: 91, accuracy: 93, handover: 7 },
    { time: "20:00", confidence: 88, accuracy: 89, handover: 11 },
    { time: "23:59", confidence: 86, accuracy: 87, handover: 13 }
  ];

  const satisfactionData = [
    { name: "Excellent", value: 5847 },
    { name: "Good", value: 4235 },
    { name: "Average", value: 1892 },
    { name: "Poor", value: 645 },
    { name: "Very Poor", value: 228 }
  ];

  const responseTimeData = [
    { hour: "00:00", ai: 2.1, human: 45.3 },
    { hour: "04:00", ai: 1.9, human: 52.8 },
    { hour: "08:00", ai: 2.3, human: 38.5 },
    { hour: "12:00", ai: 2.8, human: 42.1 },
    { hour: "16:00", ai: 2.5, human: 36.9 },
    { hour: "20:00", ai: 2.2, human: 48.7 },
    { hour: "23:00", ai: 2.0, human: 55.2 }
  ];

  const benchmarkData = [
    {
      title: "AI Resolution Rate",
      yourValue: "87.3",
      industryAverage: "72.5",
      topPerformer: "94.2",
      icon: "Target",
      iconColor: "var(--color-success)"
    },
    {
      title: "Customer Satisfaction",
      yourValue: "4.8",
      industryAverage: "4.2",
      topPerformer: "4.9",
      unit: "/5",
      icon: "ThumbsUp",
      iconColor: "var(--color-warning)"
    },
    {
      title: "Response Time",
      yourValue: "2.4",
      industryAverage: "5.8",
      topPerformer: "1.8",
      unit: "s",
      icon: "Zap",
      iconColor: "var(--color-accent)"
    },
    {
      title: "Conversation Volume",
      yourValue: "428",
      industryAverage: "312",
      topPerformer: "645",
      unit: "/day",
      icon: "TrendingUp",
      iconColor: "var(--color-primary)"
    }
  ];

  const handleRefresh = () => {
    console.log('Refreshing analytics data...');
  };

  const handleExport = (exportConfig) => {
    console.log('Exporting analytics:', exportConfig);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div 
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Header />
        
        <main className="pt-20 px-4 md:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-headline mb-2">
                Analytics Observatory
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Comprehensive insights into conversation performance, AI effectiveness, and business impact
              </p>
            </div>

            <FilterBar
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              platform={platform}
              onPlatformChange={setPlatform}
              industry={industry}
              onIndustryChange={setIndustry}
              onExport={() => setIsExportModalOpen(true)}
              onRefresh={handleRefresh}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {overviewMetrics?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <ChartCard
                title="Conversation Volume"
                subtitle="Multi-platform conversation distribution over time"
                actions={[
                  { label: 'View Details', icon: 'ExternalLink', variant: 'ghost' }
                ]}
              >
                <ConversationVolumeChart data={conversationVolumeData} />
              </ChartCard>

              <ChartCard
                title="AI Performance Metrics"
                subtitle="Real-time AI confidence, accuracy, and handover rates"
                actions={[
                  { label: 'Optimize', icon: 'Settings', variant: 'ghost' }
                ]}
              >
                <AIPerformanceChart data={aiPerformanceData} />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <ChartCard
                title="Customer Satisfaction"
                subtitle="Distribution of customer feedback ratings"
                actions={[
                  { label: 'View Feedback', icon: 'MessageCircle', variant: 'ghost' }
                ]}
              >
                <SatisfactionChart data={satisfactionData} />
              </ChartCard>

              <ChartCard
                title="Response Time Analysis"
                subtitle="AI vs Human response time comparison"
                actions={[
                  { label: 'Improve Speed', icon: 'Zap', variant: 'ghost' }
                ]}
              >
                <ResponseTimeChart data={responseTimeData} />
              </ChartCard>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-headline mb-4 md:mb-6">
                Industry Benchmarks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {benchmarkData?.map((benchmark, index) => (
                  <BenchmarkCard key={index} {...benchmark} />
                ))}
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-headline mb-4 md:mb-6">
                ROI & Business Impact
              </h2>
              <ROICalculator />
            </div>
          </div>
        </main>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default AnalyticsObservatory;