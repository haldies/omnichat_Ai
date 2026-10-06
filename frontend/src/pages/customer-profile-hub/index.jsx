import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CustomerCard from './components/CustomerCard';
import CustomerDetailPanel from './components/CustomerDetailPanel';
import CustomerFilters from './components/CustomerFilters';
import CustomerJourneyMap from './components/CustomerJourneyMap';
import CustomerSegmentation from './components/CustomerSegmentation';
import CustomerStats from './components/CustomerStats';

const CustomerProfileHub = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    platform: 'all',
    segment: 'all',
    healthScore: 'all',
    sortBy: 'recent'
  });

  const stats = {
    totalCustomers: '2,847',
    activeToday: '1,234',
    avgHealthScore: '78',
    atRisk: '156'
  };

  const segmentData = {
    vip: 427,
    highValue: 712,
    active: 1139,
    atRisk: 569
  };

  const mockCustomers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    company: 'Tech Innovations Inc.',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18811c304-1763296452128.png",
    avatarAlt: 'Professional headshot of woman with blonde hair in business attire smiling at camera',
    isOnline: true,
    healthScore: 92,
    lifetimeValue: 15420,
    platforms: ['whatsapp', 'telegram', 'instagram'],
    totalInteractions: 247,
    lastInteraction: '2 hours ago',
    avgResponseTime: '5 min',
    satisfactionScore: 95,
    segments: ['VIP Customer', 'High Value', 'Active User'],
    tags: ['Premium', 'Tech Savvy', 'Early Adopter'],
    conversationHistory: [
    {
      id: 1,
      platform: 'whatsapp',
      subject: 'Product Inquiry',
      date: 'Dec 22, 2025',
      time: '2:30 PM',
      preview: 'Hi, I wanted to know more about your premium subscription plans and the features included...',
      sentiment: 'positive',
      messageCount: 12,
      duration: '15 min'
    },
    {
      id: 2,
      platform: 'telegram',
      subject: 'Support Request',
      date: 'Dec 20, 2025',
      time: '10:15 AM',
      preview: 'I am having trouble accessing my account dashboard. Could you help me resolve this issue?',
      sentiment: 'neutral',
      messageCount: 8,
      duration: '10 min'
    },
    {
      id: 3,
      platform: 'instagram',
      subject: 'Feedback',
      date: 'Dec 18, 2025',
      time: '4:45 PM',
      preview: 'Just wanted to say that your customer service is amazing! The response time is incredible...',
      sentiment: 'positive',
      messageCount: 5,
      duration: '5 min'
    }],

    sentimentAnalysis: {
      positive: 75,
      neutral: 20,
      negative: 5
    },
    interactionPatterns: [
    { day: 'Monday', percentage: 85 },
    { day: 'Tuesday', percentage: 70 },
    { day: 'Wednesday', percentage: 90 },
    { day: 'Thursday', percentage: 65 },
    { day: 'Friday', percentage: 80 }],

    engagementMetrics: {
      clickRate: 68,
      responseRate: 92
    },
    preferences: {
      preferredChannel: 'whatsapp',
      contactTime: 'afternoon',
      language: 'en',
      notifications: [
      { type: 'Email Updates', enabled: true },
      { type: 'SMS Alerts', enabled: false },
      { type: 'Push Notifications', enabled: true },
      { type: 'Marketing Messages', enabled: false }]

    }
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@business.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, USA',
    company: 'Digital Solutions LLC',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f32d7107-1763295912115.png",
    avatarAlt: 'Professional headshot of Asian man with glasses wearing dark blue suit and tie',
    isOnline: false,
    healthScore: 78,
    lifetimeValue: 8950,
    platforms: ['whatsapp', 'telegram'],
    totalInteractions: 156,
    lastInteraction: '1 day ago',
    avgResponseTime: '8 min',
    satisfactionScore: 88,
    segments: ['High Value', 'Active User'],
    tags: ['Business', 'Reliable', 'Frequent Buyer'],
    conversationHistory: [
    {
      id: 1,
      platform: 'whatsapp',
      subject: 'Order Status',
      date: 'Dec 21, 2025',
      time: '11:20 AM',
      preview: 'Can you provide an update on my recent order? I need it delivered by the end of this week...',
      sentiment: 'neutral',
      messageCount: 6,
      duration: '8 min'
    },
    {
      id: 2,
      platform: 'telegram',
      subject: 'Feature Request',
      date: 'Dec 19, 2025',
      time: '3:00 PM',
      preview: 'Would love to see integration with our existing CRM system. Is this something you are planning?',
      sentiment: 'positive',
      messageCount: 10,
      duration: '12 min'
    }],

    sentimentAnalysis: {
      positive: 60,
      neutral: 35,
      negative: 5
    },
    interactionPatterns: [
    { day: 'Monday', percentage: 75 },
    { day: 'Tuesday', percentage: 80 },
    { day: 'Wednesday', percentage: 70 },
    { day: 'Thursday', percentage: 85 },
    { day: 'Friday', percentage: 60 }],

    engagementMetrics: {
      clickRate: 72,
      responseRate: 85
    },
    preferences: {
      preferredChannel: 'telegram',
      contactTime: 'morning',
      language: 'en',
      notifications: [
      { type: 'Email Updates', enabled: true },
      { type: 'SMS Alerts', enabled: true },
      { type: 'Push Notifications', enabled: false },
      { type: 'Marketing Messages', enabled: true }]

    }
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@startup.io',
    phone: '+1 (555) 345-6789',
    location: 'Austin, USA',
    company: 'Creative Agency Co.',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_183808107-1763293582927.png",
    avatarAlt: 'Professional headshot of Hispanic woman with long dark hair wearing red blazer smiling warmly',
    isOnline: true,
    healthScore: 85,
    lifetimeValue: 12300,
    platforms: ['instagram', 'whatsapp'],
    totalInteractions: 198,
    lastInteraction: '30 min ago',
    avgResponseTime: '6 min',
    satisfactionScore: 91,
    segments: ['VIP Customer', 'Active User'],
    tags: ['Creative', 'Influencer', 'Brand Ambassador'],
    conversationHistory: [
    {
      id: 1,
      platform: 'instagram',
      subject: 'Collaboration Opportunity',
      date: 'Dec 23, 2025',
      time: '9:00 AM',
      preview: 'I love your products and would like to discuss a potential collaboration for my upcoming campaign...',
      sentiment: 'positive',
      messageCount: 15,
      duration: '20 min'
    },
    {
      id: 2,
      platform: 'whatsapp',
      subject: 'Product Feedback',
      date: 'Dec 21, 2025',
      time: '1:30 PM',
      preview: 'The new features are fantastic! My team is really enjoying the improved workflow and efficiency...',
      sentiment: 'positive',
      messageCount: 7,
      duration: '9 min'
    }],

    sentimentAnalysis: {
      positive: 85,
      neutral: 12,
      negative: 3
    },
    interactionPatterns: [
    { day: 'Monday', percentage: 90 },
    { day: 'Tuesday', percentage: 85 },
    { day: 'Wednesday', percentage: 95 },
    { day: 'Thursday', percentage: 80 },
    { day: 'Friday', percentage: 88 }],

    engagementMetrics: {
      clickRate: 78,
      responseRate: 94
    },
    preferences: {
      preferredChannel: 'instagram',
      contactTime: 'evening',
      language: 'en',
      notifications: [
      { type: 'Email Updates', enabled: true },
      { type: 'SMS Alerts', enabled: false },
      { type: 'Push Notifications', enabled: true },
      { type: 'Marketing Messages', enabled: true }]

    }
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@enterprise.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, USA',
    company: 'Global Enterprises',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1665ca73c-1763296377705.png",
    avatarAlt: 'Professional headshot of Asian man with short black hair in charcoal gray suit with confident expression',
    isOnline: false,
    healthScore: 65,
    lifetimeValue: 6780,
    platforms: ['telegram', 'whatsapp'],
    totalInteractions: 89,
    lastInteraction: '3 days ago',
    avgResponseTime: '12 min',
    satisfactionScore: 76,
    segments: ['Active User', 'At Risk'],
    tags: ['Enterprise', 'Decision Maker'],
    conversationHistory: [
    {
      id: 1,
      platform: 'telegram',
      subject: 'Pricing Inquiry',
      date: 'Dec 20, 2025',
      time: '2:15 PM',
      preview: 'We are considering upgrading to the enterprise plan. Can you provide detailed pricing information?',
      sentiment: 'neutral',
      messageCount: 9,
      duration: '14 min'
    },
    {
      id: 2,
      platform: 'whatsapp',
      subject: 'Technical Issue',
      date: 'Dec 17, 2025',
      time: '10:45 AM',
      preview: 'Experiencing some connectivity issues with the API integration. Need urgent assistance...',
      sentiment: 'negative',
      messageCount: 11,
      duration: '18 min'
    }],

    sentimentAnalysis: {
      positive: 45,
      neutral: 40,
      negative: 15
    },
    interactionPatterns: [
    { day: 'Monday', percentage: 60 },
    { day: 'Tuesday', percentage: 55 },
    { day: 'Wednesday', percentage: 65 },
    { day: 'Thursday', percentage: 50 },
    { day: 'Friday', percentage: 58 }],

    engagementMetrics: {
      clickRate: 55,
      responseRate: 70
    },
    preferences: {
      preferredChannel: 'telegram',
      contactTime: 'morning',
      language: 'en',
      notifications: [
      { type: 'Email Updates', enabled: true },
      { type: 'SMS Alerts', enabled: true },
      { type: 'Push Notifications', enabled: true },
      { type: 'Marketing Messages', enabled: false }]

    }
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@retail.com',
    phone: '+1 (555) 567-8901',
    location: 'Chicago, USA',
    company: 'Retail Solutions Inc.',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11176ce80-1763296378826.png",
    avatarAlt: 'Professional headshot of woman with curly brown hair wearing teal blouse with friendly smile',
    isOnline: true,
    healthScore: 88,
    lifetimeValue: 11200,
    platforms: ['whatsapp', 'instagram'],
    totalInteractions: 176,
    lastInteraction: '1 hour ago',
    avgResponseTime: '7 min',
    satisfactionScore: 89,
    segments: ['High Value', 'Active User'],
    tags: ['Retail', 'Loyal Customer', 'Advocate'],
    conversationHistory: [
    {
      id: 1,
      platform: 'whatsapp',
      subject: 'Bulk Order',
      date: 'Dec 22, 2025',
      time: '3:45 PM',
      preview: 'Looking to place a bulk order for our retail stores. Can we discuss volume discounts?',
      sentiment: 'positive',
      messageCount: 13,
      duration: '16 min'
    },
    {
      id: 2,
      platform: 'instagram',
      subject: 'Product Review',
      date: 'Dec 19, 2025',
      time: '5:20 PM',
      preview: 'Absolutely love the new product line! Our customers have been giving excellent feedback...',
      sentiment: 'positive',
      messageCount: 6,
      duration: '7 min'
    }],

    sentimentAnalysis: {
      positive: 80,
      neutral: 15,
      negative: 5
    },
    interactionPatterns: [
    { day: 'Monday', percentage: 82 },
    { day: 'Tuesday', percentage: 78 },
    { day: 'Wednesday', percentage: 85 },
    { day: 'Thursday', percentage: 75 },
    { day: 'Friday', percentage: 80 }],

    engagementMetrics: {
      clickRate: 74,
      responseRate: 88
    },
    preferences: {
      preferredChannel: 'whatsapp',
      contactTime: 'afternoon',
      language: 'en',
      notifications: [
      { type: 'Email Updates', enabled: true },
      { type: 'SMS Alerts', enabled: false },
      { type: 'Push Notifications', enabled: true },
      { type: 'Marketing Messages', enabled: true }]

    }
  },
  {
    id: 6,
    name: 'James Wilson',
    email: 'james.wilson@consulting.com',
    phone: '+1 (555) 678-9012',
    location: 'Boston, USA',
    company: 'Strategic Consulting Group',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c44cc582-1763292830729.png",
    avatarAlt: 'Professional headshot of man with salt and pepper hair wearing navy suit with professional demeanor',
    isOnline: false,
    healthScore: 72,
    lifetimeValue: 9450,
    platforms: ['telegram', 'whatsapp'],
    totalInteractions: 134,
    lastInteraction: '2 days ago',
    avgResponseTime: '10 min',
    satisfactionScore: 82,
    segments: ['High Value', 'Active User'],
    tags: ['Consultant', 'Strategic Partner'],
    conversationHistory: [
    {
      id: 1,
      platform: 'telegram',
      subject: 'Partnership Discussion',
      date: 'Dec 21, 2025',
      time: '11:00 AM',
      preview: 'Would like to explore partnership opportunities between our organizations. When can we schedule a call?',
      sentiment: 'positive',
      messageCount: 8,
      duration: '11 min'
    },
    {
      id: 2,
      platform: 'whatsapp',
      subject: 'Service Inquiry',
      date: 'Dec 18, 2025',
      time: '2:30 PM',
      preview: 'Need more information about your consulting services and implementation timeline...',
      sentiment: 'neutral',
      messageCount: 10,
      duration: '13 min'
    }],

    sentimentAnalysis: {
      positive: 65,
      neutral: 30,
      negative: 5
    },
    interactionPatterns: [
    { day: 'Monday', percentage: 70 },
    { day: 'Tuesday', percentage: 75 },
    { day: 'Wednesday', percentage: 68 },
    { day: 'Thursday', percentage: 80 },
    { day: 'Friday', percentage: 65 }],

    engagementMetrics: {
      clickRate: 66,
      responseRate: 80
    },
    preferences: {
      preferredChannel: 'telegram',
      contactTime: 'morning',
      language: 'en',
      notifications: [
      { type: 'Email Updates', enabled: true },
      { type: 'SMS Alerts', enabled: true },
      { type: 'Push Notifications', enabled: false },
      { type: 'Marketing Messages', enabled: false }]

    }
  }];


  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      platform: 'all',
      segment: 'all',
      healthScore: 'all',
      sortBy: 'recent'
    });
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseDetail = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <main
        className={`
          pt-16 transition-all duration-300
          ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Customer Profile Hub
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Unified customer view with comprehensive interaction analytics and journey mapping
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left">

                  Export
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  iconName="Plus"
                  iconPosition="left">

                  Add Customer
                </Button>
              </div>
            </div>
          </div>

          <CustomerStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <CustomerSegmentation segmentData={segmentData} />
            </div>
            <div>
              <CustomerJourneyMap customer={mockCustomers?.[0]} />
            </div>
          </div>

          <CustomerFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters} />


          <div className="bg-card border border-border rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Customer Profiles
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`
                  }>

                  <Icon name="Grid" size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`
                  }>

                  <Icon name="List" size={20} />
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' : 'space-y-4'}>
              {mockCustomers?.map((customer) =>
              <CustomerCard
                key={customer?.id}
                customer={customer}
                onClick={() => handleCustomerClick(customer)}
                isSelected={selectedCustomer?.id === customer?.id} />

              )}
            </div>
          </div>
        </div>
      </main>
      {selectedCustomer &&
      <CustomerDetailPanel
        customer={selectedCustomer}
        onClose={handleCloseDetail} />

      }
    </div>);

};

export default CustomerProfileHub;