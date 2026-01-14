// src/services/firebase.js - COMPLETE HYBRID ANALYTICS SERVICE
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform detection
const IS_WEB = Platform.OS === 'web';
const IS_NATIVE = Platform.OS === 'ios' || Platform.OS === 'android';

// Firebase instances
let nativeAnalytics = null;
let webAnalytics = null;
let firebaseWebApp = null;

// ===== INITIALIZE NATIVE FIREBASE (iOS/Android) =====
if (IS_NATIVE) {
  try {
    // Using require to avoid importing on web
    const analytics = require('@react-native-firebase/analytics').default;
    nativeAnalytics = analytics();
    console.log('✅ Native Firebase Analytics initialized');
  } catch (error) {
    console.warn('❌ Native Firebase Analytics failed:', error.message);
  }
}

// ===== INITIALIZE WEB FIREBASE (only on web platform) =====
if (IS_WEB && typeof window !== 'undefined') {
  // Use dynamic imports to avoid bundling web SDK in native apps
  const initializeWebFirebase = async () => {
    try {
      const { initializeApp, getApp, getApps } = await import('firebase/app');
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      
      const firebaseConfig = {
        apiKey: "AIzaSyBjE2Of8ox9OMph797VOu05kbXwCUrDrlY",
        authDomain: "ai-fantasy-assistant-aa2f6.firebaseapp.com",
        projectId: "ai-fantasy-assistant-aa2f6",
        storageBucket: "ai-fantasy-assistant-aa2f6.firebasestorage.app",
        messagingSenderId: "909799347654",
        appId: "1:90979347654:web:adca0f7aec0ad9e9f48ec7",
        measurementId: "G-QTSWN0T7JV"
      };
      
      // Initialize or get existing app
      if (getApps().length === 0) {
        firebaseWebApp = initializeApp(firebaseConfig);
      } else {
        firebaseWebApp = getApp();
      }
      
      // Check if analytics is supported in this browser environment
      const analyticsSupported = await isSupported();
      if (analyticsSupported) {
        webAnalytics = getAnalytics(firebaseWebApp);
        console.log('✅ Web Firebase Analytics initialized');
      } else {
        console.warn('⚠️ Web Firebase Analytics not supported in this browser');
      }
    } catch (error) {
      console.warn('❌ Web Firebase initialization failed:', error.message);
    }
  };
  
  // Initialize web Firebase (non-blocking)
  initializeWebFirebase();
}

// ===== LOCAL STORAGE HELPER =====
const saveEventLocally = async (eventName, eventParams = {}) => {
  try {
    const eventData = {
      event: eventName,
      params: eventParams,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      sentToFirebase: false // Will update if successfully sent
    };
    
    const existingEvents = JSON.parse(
      await AsyncStorage.getItem('analytics_events') || '[]'
    );
    
    existingEvents.push(eventData);
    
    // Keep only last 500 events
    if (existingEvents.length > 500) {
      existingEvents.splice(0, existingEvents.length - 500);
    }
    
    await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
    return eventData; // Return for potential update
  } catch (error) {
    console.warn('Failed to save event locally:', error.message);
    return null;
  }
};

// ===== MAIN ANALYTICS FUNCTION =====
const logAnalyticsEvent = async (eventName, eventParams = {}) => {
  console.log(`📊 [${Platform.OS.toUpperCase()}] Analytics Event: ${eventName}`, eventParams);
  
  // Step 1: Save locally first (for reliability)
  const localEvent = await saveEventLocally(eventName, eventParams);
  
  // Step 2: Send to appropriate Firebase service
  try {
    if (IS_NATIVE && nativeAnalytics) {
      // iOS/Android: Use native Firebase
      await nativeAnalytics.logEvent(eventName, eventParams);
      console.log(`  ✅ Sent to Native Firebase`);
      
    } else if (IS_WEB && webAnalytics) {
      // Web: Use web Firebase SDK
      const { logEvent } = await import('firebase/analytics');
      await logEvent(webAnalytics, eventName, eventParams);
      console.log(`  ✅ Sent to Web Firebase`);
      
    } else {
      // No Firebase available (development or unsupported)
      console.log(`  📱 Saved locally only (Firebase not available)`);
      return false;
    }
    
    // Mark as sent in local storage
    if (localEvent) {
      localEvent.sentToFirebase = true;
      localEvent.firebaseSentAt = new Date().toISOString();
      
      const existingEvents = JSON.parse(
        await AsyncStorage.getItem('analytics_events') || '[]'
      );
      
      // Update the last event
      if (existingEvents.length > 0) {
        existingEvents[existingEvents.length - 1] = localEvent;
        await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
      }
    }
    
    return true;
    
  } catch (firebaseError) {
    console.warn(`❌ Firebase analytics failed:`, firebaseError.message);
    console.log(`  📦 Event saved locally only`);
    return false;
  }
};

// ===== ADDITIONAL ANALYTICS FUNCTIONS =====
const logScreenView = async (screenName, screenClass = '') => {
  const params = { screen_name: screenName };
  if (screenClass) params.screen_class = screenClass;
  
  return logAnalyticsEvent('screen_view', params);
};

const setUserProperty = async (propertyName, propertyValue) => {
  try {
    if (IS_NATIVE && nativeAnalytics) {
      await nativeAnalytics.setUserProperty(propertyName, propertyValue);
    } else if (IS_WEB && webAnalytics) {
      const { setUserProperties } = await import('firebase/analytics');
      setUserProperties(webAnalytics, { [propertyName]: propertyValue });
    }
    
    // Also save locally
    await AsyncStorage.setItem(`user_property_${propertyName}`, propertyValue);
    console.log(`✅ Set user property: ${propertyName} = ${propertyValue}`);
    
  } catch (error) {
    console.warn('Failed to set user property:', error.message);
  }
};

const setUserId = async (userId) => {
  try {
    if (IS_NATIVE && nativeAnalytics) {
      await nativeAnalytics.setUserId(userId);
    } else if (IS_WEB && webAnalytics) {
      const { setUserId } = await import('firebase/analytics');
      setUserId(webAnalytics, userId);
    }
    
    // Save locally
    await AsyncStorage.setItem('analytics_user_id', userId);
    console.log(`✅ Set user ID: ${userId}`);
    
  } catch (error) {
    console.warn('Failed to set user ID:', error.message);
  }
};

// ===== UTILITY FUNCTIONS =====
const getStoredEvents = async () => {
  try {
    return JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');
  } catch (error) {
    console.warn('Failed to get stored events:', error.message);
    return [];
  }
};

const clearStoredEvents = async () => {
  try {
    await AsyncStorage.removeItem('analytics_events');
    console.log('✅ Cleared stored analytics events');
  } catch (error) {
    console.warn('Failed to clear events:', error.message);
  }
};

// ===== EXPORTS =====
export {
  logAnalyticsEvent,
  logScreenView,
  setUserProperty,
  setUserId,
  getStoredEvents,
  clearStoredEvents,
  nativeAnalytics,
  webAnalytics,
};
