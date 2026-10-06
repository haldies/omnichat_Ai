import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from "components/ProtectedRoute";
import Login from './pages/login';
import LandingPage from './pages/landing-page';
import CommandCenterDashboard from './pages/command-center-dashboard';
import AnalyticsObservatory from './pages/analytics-observatory';
import AIAgentControlPanel from './pages/ai-agent-control-panel';
import IntegrationManagement from './pages/integration-management';
import CustomerProfileHub from './pages/customer-profile-hub';
import TeamAdministration from './pages/team-administration';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><CommandCenterDashboard /></ProtectedRoute>} />
        <Route path="/command-center-dashboard" element={<ProtectedRoute><CommandCenterDashboard /></ProtectedRoute>} />
        <Route path="/analytics-observatory" element={<ProtectedRoute><AnalyticsObservatory /></ProtectedRoute>} />
        <Route path="/ai-agent-control-panel" element={<ProtectedRoute><AIAgentControlPanel /></ProtectedRoute>} />
        <Route path="/integration-management" element={<ProtectedRoute><IntegrationManagement /></ProtectedRoute>} />
        <Route path="/customer-profile-hub" element={<ProtectedRoute><CustomerProfileHub /></ProtectedRoute>} />
        <Route path="/team-administration" element={<ProtectedRoute><TeamAdministration /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
