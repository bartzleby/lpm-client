// src/components/BottomNavigation/BottomNavigation.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNavigation.css';

// Dashboard Icon Component
const DashboardIcon = ({ isActive }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={isActive ? "#059669" : "#6B7280"} 
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="9" y1="9" x2="9" y2="15"/>
    <line x1="15" y1="9" x2="15" y2="15"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
  </svg>
);

// Poker Table Icon Component (simplified version of your SVG)
const PokerTableIcon = ({ isActive }) => (
  <svg 
    width="28" 
    height="28" 
    viewBox="0 0 452.31 452.31" 
    fill={isActive ? "#059669" : "#6B7280"}
  >
    <path d="M337.03,129.9h-43.98c-12.69,0-25.61,2.43-38.38,7.21c-9.1,3.41-18.7,5.14-28.52,5.14c-9.82,0-19.41-1.73-28.52-5.14c-12.77-4.79-25.69-7.21-38.38-7.21h-43.98c-53.07,0-96.25,43.18-96.25,96.25s43.18,96.25,96.25,96.25h221.75c53.07,0,96.25-43.18,96.25-96.25C433.28,173.08,390.1,129.9,337.03,129.9z"/>
    <path d="M337.26,111.11h-74.51c-0.77,0-1.53,0.22-2.17,0.64c-10.27,6.65-22.17,10.17-34.42,10.17c-12.25,0-24.16-3.52-34.42-10.17c-0.65-0.42-1.4-0.64-2.17-0.64h-74.51C51.61,111.11,0,162.72,0,226.15c0,63.44,51.61,115.04,115.04,115.04h222.22c63.44,0,115.04-51.61,115.04-115.04C452.31,162.72,400.7,111.11,337.26,111.11z"/>
  </svg>
);

// Profile Icon Component
const ProfileIcon = ({ isActive }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={isActive ? "#059669" : "#6B7280"} 
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Don't show navigation on login/signup pages
  const hideOnPages = ['/login', '/signup'];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      icon: DashboardIcon,
      label: 'Dashboard'
    },
    {
      id: 'poker-table',
      path: '/',
      icon: PokerTableIcon,
      label: 'Table'
    },
    {
      id: 'profile',
      path: '/profile',
      icon: ProfileIcon,
      label: 'Profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bottom-navigation">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              <div className={`nav-icon ${isActive ? 'nav-icon--active' : ''}`}>
                <IconComponent isActive={isActive} />
              </div>
              <span className={`nav-label ${isActive ? 'nav-label--active' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;