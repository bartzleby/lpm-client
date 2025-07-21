// src/App.js - Updated with authentication routes
import './App.css';
import { Routes, Route } from 'react-router-dom';
import PokerTable from './pages/PokerTable/PokerTable';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes - poker table accessible to all */}
        <Route path="/" element={<PokerTable />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Future protected routes can go here */}
        {/* <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} /> */}
        {/* <Route path="/hands" element={<ProtectedRoute><HandHistory /></ProtectedRoute>} /> */}
      </Routes>
    </div>
  );
}

export default App;