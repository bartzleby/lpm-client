// src/App.js - Updated with bottom navigation
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

import PokerTable from './pages/PokerTable/PokerTable';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';

// Import the new bottom navigation component
import BottomNavigation from './components/BottomNavigation/BottomNavigation';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes - poker table accessible to all */}
        <Route path="/" element={<PokerTable />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Catch-all redirect - removed duplicate root route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Bottom navigation - will auto-hide on login/signup pages */}
      <BottomNavigation />
    </div>
  );
}

export default App;