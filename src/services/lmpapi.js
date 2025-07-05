// Updated lmpapi.js - simplified and working version
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5005/api',
    timeout: 10000,
    withCredentials: false, // Important: explicitly set to false
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Simplified interceptors - only for debugging
apiClient.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

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
        return Promise.reject(error);
    }
);

// API functions
export const saveHand = async (hand) => {
    try {
        console.log('💾 Saving hand...');
        const response = await apiClient.post('/hands', hand);
        console.log('✅ Hand saved successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error saving hand:', error);
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
        throw error;
    }
};

export default apiClient;