// useResponsiveLayout.js - Custom hook for handling responsive layout

import { useState, useEffect } from 'react';

export const useResponsiveLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Check for mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLayoutClass = () => isMobile ? 'mobile-layout' : 'desktop-layout';
  const getActionSectionClass = () => isMobile ? 'action-section-mobile' : 'action-section-desktop';

  return {
    isMobile,
    getLayoutClass,
    getActionSectionClass
  };
};