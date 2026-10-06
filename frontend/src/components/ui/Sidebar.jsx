import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Get business name from user data
  const getBusinessName = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.business?.name || user?.businessName || 'OmniChat AI';
    } catch {
      return 'OmniChat AI';
    }
  };

  const businessName = getBusinessName();

  const navigationItems = [
    {
      path: '/command-center-dashboard',
      label: 'Command Center',
      icon: 'LayoutDashboard',
    },
    {
      path: '/ai-agent-control-panel',
      label: 'AI Chatbot',
      icon: 'Bot',
    },
    {
      path: '/integration-management',
      label: 'Integrations',
      icon: 'Plug',
    },
    {
      path: '/analytics-observatory',
      label: 'Analytics',
      icon: 'BarChart3',
    },
    {
      path: '/team-administration',
      label: 'Team Admin',
      icon: 'Users',
    },
    {
      path: '/customer-profile-hub',
      label: 'Customer Profiles',
      icon: 'UserCircle',
    },
  ];

  const isActive = (path) => location?.pathname === path;

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-md hover:bg-muted transition-colors"
        aria-label="Toggle mobile menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} />
      </button>
      {isMobileOpen && (
        <div
          className="mobile-menu-overlay lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
      <aside
        className={`
          fixed lg:fixed top-0 left-0 h-full bg-card border-r border-border z-40
          transition-all duration-300 ease-smooth
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'sidebar-collapsed' : ''}
        `}
      >
        <div className="sidebar-header">
          <div className="flex items-center">
            <div className="sidebar-logo">
              <Icon name="MessageSquare" size={24} color="var(--color-primary)" />
            </div>
            <span className="sidebar-logo-text">{businessName}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navigationItems?.map((item) => (
              <li key={item?.path}>
                <Link
                  to={item?.path}
                  onClick={closeMobileMenu}
                  className={`nav-item ${isActive(item?.path) ? 'active' : ''}`}
                  title={isCollapsed ? item?.label : ''}
                >
                  <Icon name={item?.icon} size={20} className="nav-item-icon" />
                  <span className="nav-item-text">{item?.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300"
              aria-label="Collapse sidebar"
            >
              <Icon name="ChevronsLeft" size={20} />
              <span className="ml-2">Collapse</span>
            </button>
          </div>
        )}

        {isCollapsed && (
          <div className="p-4 border-t border-border">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <Icon name="ChevronsRight" size={20} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;