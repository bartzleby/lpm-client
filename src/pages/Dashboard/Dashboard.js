// src/pages/Dashboard/Dashboard.js

import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your poker performance overview.</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Session Stats</h3>
          <div className="stat-item">
            <span className="stat-label">Total Sessions:</span>
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Hands:</span>
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Net Winnings:</span>
            <span className="stat-value">$0.00</span>
          </div>
        </div>

        <div className="recent-hands-card">
          <h3>Recent Hands</h3>
          <div className="empty-state">
            <p>No hands recorded yet</p>
            <button className="btn-primary">Record Your First Hand</button>
          </div>
        </div>

        <div className="performance-chart-card">
          <h3>Performance Chart</h3>
          <div className="chart-placeholder">
            <p>Chart will appear here once you have recorded hands</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;