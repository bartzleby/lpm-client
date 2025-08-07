// src/pages/Profile/Profile.js
import React, { useState } from 'react';
import './Profile.css';
import PageLayout from '../../components/Layout/PageLayout';


const Profile = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    preferredStakes: '1/2',
    homeVenue: 'Bellagio',
    timezone: 'Pacific'
  });

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <PageLayout>
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button 
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button 
          className={`tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Export Data
        </button>
      </div>

      {activeTab === 'account' && (
        <div className="account-section">
          <h3>Account Information</h3>
          <div className="form-group">
            <label>Username:</label>
            <input 
              type="text" 
              value={profile.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <button className="btn-primary">Save Changes</button>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="preferences-section">
          <h3>Poker Preferences</h3>
          <div className="form-group">
            <label>Preferred Stakes:</label>
            <select 
              value={profile.preferredStakes}
              onChange={(e) => handleInputChange('preferredStakes', e.target.value)}
            >
              <option value="1/2">$1/$2</option>
              <option value="2/5">$2/$5</option>
              <option value="5/10">$5/$10</option>
            </select>
          </div>
          <div className="form-group">
            <label>Home Venue:</label>
            <input 
              type="text" 
              value={profile.homeVenue}
              onChange={(e) => handleInputChange('homeVenue', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Timezone:</label>
            <select 
              value={profile.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="Pacific">Pacific</option>
              <option value="Mountain">Mountain</option>
              <option value="Central">Central</option>
              <option value="Eastern">Eastern</option>
            </select>
          </div>
          <button className="btn-primary">Save Preferences</button>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="export-section">
          <h3>Export Your Data</h3>
          <p>Export your hand history for use in third-party poker software</p>
          
          <div className="export-options">
            <div className="export-option">
              <h4>PokerTracker 4 Format</h4>
              <p>Compatible with PokerTracker 4</p>
              <button className="btn-secondary">Export PT4</button>
            </div>
            
            <div className="export-option">
              <h4>DriveHUD Format</h4>
              <p>Compatible with DriveHUD</p>
              <button className="btn-secondary">Export DriveHUD</button>
            </div>
            
            <div className="export-option">
              <h4>Raw JSON</h4>
              <p>Complete data export in JSON format</p>
              <button className="btn-secondary">Export JSON</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageLayout>
  );
};

export default Profile;