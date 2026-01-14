import { apiClient, API_ENDPOINTS } from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('📝 Registering user:', userData.email);
      const result = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
      console.log('✅ User registered successfully');
      return result;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('🔐 Logging in user:', credentials.email);
      const result = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
      console.log('✅ User logged in successfully');
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async (token) => {
    try {
      const result = await apiClient.get(API_ENDPOINTS.PROFILE);
      return result;
    } catch (error) {
      console.error('❌ Profile fetch failed:', error);
      throw error;
    }
  },

  // Test authentication service
  testAuthConnection: async () => {
    try {
      const result = await apiClient.testConnection();
      return result;
    } catch (error) {
      console.error('❌ Auth service connection test failed:', error);
      throw error;
    }
  }
};

export default authService;
