// src/utils/auth.js - Authentication utilities

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    // Basic token validation - you might want to decode JWT and check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    // If token parsing fails, consider it invalid
    return false;
  }
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const requireAuth = (navigate, from = '/') => {
  if (!isAuthenticated()) {
    navigate('/login', { 
      state: { 
        from: { pathname: from },
        message: 'Please log in to access this feature.' 
      },
      replace: true 
    });
    return false;
  }
  return true;
};