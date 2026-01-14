// API Service for Sports Analytics GPT
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pleasing-determination-production.up.railway.app';

const apiService = {
  logSecretPhrase: async (data) => {
    try {
      console.log('📝 API Logging:', data.phraseKey);
      
      // For now, just log to console
      return {
        success: true,
        eventId: `mock_${Date.now()}`,
        timestamp: new Date().toISOString(),
        note: 'Mock API response - backend not connected'
      };
    } catch (error) {
      console.error('❌ API Error:', error.message);
      return {
        success: false,
        error: error.message,
        eventId: `error_${Date.now()}`
      };
    }
  },

  // Authentication methods (mocked for now)
  login: async (email, password) => {
    console.log('🔐 Mock login for:', email);
    return { success: true, user: { id: 'mock_user', email: email } };
  },

  signup: async (userData) => {
    console.log('📝 Mock signup for:', userData.email);
    return { success: true, user: { id: 'mock_user', email: userData.email } };
  },

  logout: async () => {
    console.log('🚪 Mock logout');
    return { success: true };
  },

  // Health check
  checkHealth: async () => {
    return {
      status: 'online',
      baseUrl: BASE_URL,
      timestamp: new Date().toISOString()
    };
  }
};

export default apiService;
