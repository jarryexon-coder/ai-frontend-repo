// src/utils/RevenueCatConfig.js
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

export const initializeRevenueCat = async () => {
  try {
    if (__DEV__) {
      console.log('🔄 Initializing RevenueCat...');
    }
    
    // Use your actual RevenueCat API keys
    const APIKeys = {
      ios: 'YOUR_IOS_APP_SPECIFIC_API_KEY_HERE',
      android: 'YOUR_ANDROID_APP_SPECIFIC_API_KEY_HERE'
    };
    
    const apiKey = Platform.select({
      ios: APIKeys.ios,
      android: APIKeys.android,
      default: 'YOUR_WEB_API_KEY_HERE'
    });
    
    // Only initialize if we have an API key and it's not already initialized
    if (apiKey && apiKey !== 'YOUR_IOS_APP_SPECIFIC_API_KEY_HERE') {
      if (Platform.OS === 'web') {
        // Web initialization if needed
        Purchases.setup({ apiKey });
      } else {
        Purchases.configure({ apiKey });
      }
      
      if (__DEV__) {
        console.log('✅ RevenueCat initialized successfully');
      }
    } else {
      console.warn('⚠️ RevenueCat API key not configured. Running in dev mode.');
    }
    
    return true;
  } catch (error) {
    console.warn('❌ RevenueCat initialization failed:', error.message);
    return false;
  }
};

export const isRevenueCatConfigured = () => {
  // Check if Purchases has been configured by checking for a method
  return Purchases && Purchases.getCustomerInfo && typeof Purchases.getCustomerInfo === 'function';
};
