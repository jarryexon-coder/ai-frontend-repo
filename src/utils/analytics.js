// src/utils/analytics.js - EXPO-COMPATIBLE FIREBASE ANALYTICS
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Firebase conditionally
let firebase = null;
let firebaseAnalytics = null;
let firebaseLoaded = false;

// Console log to verify Firebase loading
console.log('🔍 [Analytics Init] Platform:', Platform.OS);

if (Platform.OS === 'web') {
  try {
    console.log('🔍 [Analytics Init] Attempting to load Firebase Web SDK...');
    firebase = require('firebase/app');
    require('firebase/analytics');
    
    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
      console.warn('⚠️ [Analytics] Firebase not initialized. You need to call initializeApp() in your app entry point.');
    } else {
      firebaseAnalytics = firebase.analytics;
      firebaseLoaded = true;
      console.log('✅ [Analytics] Firebase Web SDK loaded successfully');
    }
  } catch (error) {
    console.log('❌ [Analytics] Firebase Web SDK not available:', error.message);
  }
} else {
  // For native (iOS/Android), we'll use console logging only
  console.log('📱 [Analytics] Native platform - using console logging only');
  firebaseLoaded = false;
}

/**
 * Log an event to Firebase Analytics (web only), console and local storage
 */
export const logEvent = async (eventName, eventParams = {}) => {
  console.log(`📊 [Analytics] ${eventName}:`, JSON.stringify(eventParams));
  
  try {
    // Log to Firebase Analytics if available (web only)
    if (Platform.OS === 'web' && firebaseAnalytics && firebaseLoaded) {
      try {
        console.log(`🌐 [Firebase Web] Logging event: ${eventName}`);
        firebaseAnalytics().logEvent(eventName, eventParams);
      } catch (firebaseError) {
        console.warn('❌ [Firebase Web] Analytics error:', firebaseError.message);
      }
    }
    
    // Save to local storage for debugging (works on all platforms)
    try {
      const existingEvents = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');
      existingEvents.push({
        event: eventName,
        params: eventParams,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        firebase_logged: Platform.OS === 'web' && firebaseLoaded
      });
      
      // Keep only the last 1000 events
      if (existingEvents.length > 1000) {
        existingEvents.splice(0, existingEvents.length - 1000);
      }
      
      await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
      console.log(`💾 [Local Storage] Event saved: ${eventName}`);
    } catch (storageError) {
      console.warn('⚠️ [Local Storage] Failed to save event:', storageError.message);
    }
    
  } catch (error) {
    console.warn('⚠️ [Analytics] Failed to log event:', error.message);
  }
};

/**
 * Log a user action with additional context
 */
export const logUserAction = async (action, context = {}) => {
  console.log(`👤 [User Action] ${action}:`, context);
  return logEvent(`user_${action}`, {
    ...context,
    timestamp: new Date().toISOString(),
    platform: Platform.OS
  });
};

/**
 * Log AI prompt usage
 */
export const logAIPrompt = async (prompt, sport, playerName = '', promptType = 'suggested') => {
  return logEvent('ai_prompt_used', {
    prompt: prompt.substring(0, 200), // Limit size for storage
    sport: sport,
    player_name: playerName,
    prompt_type: promptType,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log AI response received
 */
export const logAIResponse = async (prompt, response, sport, responseTime = 0) => {
  return logEvent('ai_response_received', {
    prompt_preview: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    response_preview: response.substring(0, 100) + (response.length > 100 ? '...' : ''),
    sport: sport,
    response_time_ms: responseTime,
    response_length: response.length,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log search analytics
 */
export const logSearch = async (query, resultCount, sport, searchType = 'general') => {
  return logEvent('search_performed', {
    query: query,
    results_count: resultCount,
    sport: sport,
    search_type: searchType,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log screen view - using custom event for cross-platform compatibility
 */
export const logScreenView = async (screenName, params = {}) => {
  console.log(`🖥️ [Screen View] ${screenName}`);
  
  // For web only, we can also set the current screen in Firebase
  if (Platform.OS === 'web' && firebaseAnalytics && firebaseLoaded) {
    try {
      // Web SDK method for setting current screen
      firebaseAnalytics().setCurrentScreen(screenName);
    } catch (screenError) {
      console.warn('❌ [Firebase Web] Screen view error:', screenError.message);
    }
  }
  
  // Log as custom event for all platforms
  return logEvent('screen_view', {
    screen_name: screenName,
    screen_class: params.screen_class || screenName,
    ...params,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get analytics events from storage
 */
export const getAnalyticsEvents = async (limit = 50) => {
  try {
    const eventsString = await AsyncStorage.getItem('analytics_events');
    if (eventsString) {
      const events = JSON.parse(eventsString);
      return events.slice(-limit).reverse(); // Return most recent events first
    }
    return [];
  } catch (error) {
    console.error('❌ Failed to get analytics events:', error);
    return [];
  }
};

/**
 * Clear analytics events
 */
export const clearAnalyticsEvents = async () => {
  try {
    await AsyncStorage.removeItem('analytics_events');
    console.log('🧹 [Analytics] All events cleared from storage');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear analytics events:', error);
    return false;
  }
};

/**
 * Export analytics events as JSON
 */
export const exportAnalytics = async () => {
  try {
    const events = await getAnalyticsEvents(1000);
    return {
      export_date: new Date().toISOString(),
      total_events: events.length,
      platform: Platform.OS,
      firebase_available: firebaseLoaded,
      events: events
    };
  } catch (error) {
    console.error('❌ Failed to export analytics:', error);
    return null;
  }
};

/**
 * Get Firebase status for debugging
 */
export const getFirebaseStatus = () => {
  return {
    platform: Platform.OS,
    firebase_loaded: firebaseLoaded,
    firebase_module: firebase ? 'Web SDK' : 'None',
    analytics_module: firebaseAnalytics ? 'Available' : 'Not available'
  };
};

// Log initialization status
console.log('🔍 [Analytics Final Status]', getFirebaseStatus());

export default {
  logEvent,
  logUserAction,
  logAIPrompt,
  logAIResponse,
  logSearch,
  logScreenView,
  getAnalyticsEvents,
  clearAnalyticsEvents,
  exportAnalytics,
  getFirebaseStatus
};
