// src/services/apilivepokermate.js - Updated with authentication
import axios from 'axios';
import { getAuthToken, logout } from '../utils/auth';

const apiClient = axios.create({
    baseURL: 'http://localhost:5005/api',
    timeout: 10000,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.statusText}`);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        // Handle authentication errors
        if (error.response?.status === 401) {
            console.log('🔒 Authentication failed, logging out...');
            logout();
        }

        return Promise.reject(error);
    }
);

// Authentication API functions
export const signup = async (userData) => {
    try {
        console.log('📝 Creating new account...');
        const response = await apiClient.post('/auth/signup', userData);
        console.log('✅ Account created successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error creating account:', error);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        console.log('🔐 Logging in...');
        const response = await apiClient.post('/auth/login', credentials);
        console.log('✅ Login successful');
        return response.data;
    } catch (error) {
        console.error('❌ Error logging in:', error);
        throw error;
    }
};

export const refreshToken = async () => {
    try {
        console.log('🔄 Refreshing token...');
        const response = await apiClient.post('/auth/refresh');
        console.log('✅ Token refreshed successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error refreshing token:', error);
        throw error;
    }
};

// Hand management API functions
export const saveHand = async (hand) => {
    try {
        console.log('💾 Saving hand...');
        const response = await apiClient.post('/hands', hand);
        console.log('✅ Hand saved successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error saving hand:', error);
        
        // If it's an auth error, the interceptor will handle logout
        // For other errors, we can provide specific messaging
        if (error.response?.status === 401) {
            throw new Error('Please log in to save hands');
        }
        
        throw error;
    }
};

export const getHands = async () => {
    try {
        console.log('📥 Getting hands...');
        const response = await apiClient.get('/hands');
        console.log('✅ Hands retrieved successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error getting hands:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Please log in to view your hands');
        }
        
        throw error;
    }
};

export const deleteHand = async (handId) => {
    try {
        console.log('🗑️ Deleting hand:', handId);
        const response = await apiClient.delete(`/hands/${handId}`);
        console.log('✅ Hand deleted successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error deleting hand:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Please log in to delete hands');
        }
        
        throw error;
    }
};

// User profile functions
export const getUserProfile = async () => {
    try {
        console.log('👤 Getting user profile...');
        const response = await apiClient.get('/auth/profile');
        console.log('✅ Profile retrieved successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error getting profile:', error);
        throw error;
    }
};

export const updateUserProfile = async (profileData) => {
    try {
        console.log('👤 Updating user profile...');
        const response = await apiClient.put('/auth/profile', profileData);
        console.log('✅ Profile updated successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        throw error;
    }
};

export default apiClient;