// src/components/Layout/PageLayout.js
import React from 'react';
import './PageLayout.css';

const PageLayout = ({ children, className = '' }) => {
  return (
    <div className={`page-layout ${className}`}>
      {children}
    </div>
  );
};

export default PageLayout;