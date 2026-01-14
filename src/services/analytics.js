// src/services/analytics.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple analytics service that works across platforms
const AnalyticsService = {
  // Initialize analytics
  async init() {
    console.log('📊 Analytics service initialized for platform:', Platform.OS);
  },

  // Log an event
  async logEvent(eventName, eventParams = {}) {
    try {
      const eventData = {
        event: eventName,
        params: eventParams,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        appVersion: '1.0.0',
      };

      // Log to console for debugging
      console.log(`📊 Analytics Event: ${eventName}`, eventParams);

      // Store locally in AsyncStorage
      try {
        const existingEvents = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');
        existingEvents.push(eventData);
        
        // Keep only last 100 events
        if (existingEvents.length > 100) {
          existingEvents.splice(0, existingEvents.length - 100);
        }
        
        await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
      } catch (storageError) {
        console.warn('Could not save analytics event locally:', storageError);
      }

      // If on web, also send to Firebase
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        await this.sendToFirebase(eventName, eventParams);
      }

      return true;
    } catch (error) {
      console.warn('Analytics event failed:', error);
      return false;
    }
  },

  // Send to Firebase on web
  async sendToFirebase(eventName, eventParams) {
    try {
      // Dynamic import for Firebase (web only)
      const firebaseModule = await import('firebase/app');
      const analyticsModule = await import('firebase/analytics');
      
      // Check if Firebase is initialized
      if (!firebaseModule.getApps().length) {
        // Initialize Firebase with your config
        const firebaseConfig = {
          apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
          measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
        };
        
        firebaseModule.initializeApp(firebaseConfig);
      }
      
      const app = firebaseModule.getApp();
      const analytics = analyticsModule.getAnalytics(app);
      
      if (analytics) {
        await analyticsModule.logEvent(analytics, eventName, eventParams);
        console.log('✅ Firebase analytics event sent:', eventName);
      }
    } catch (firebaseError) {
      console.log('Firebase analytics not available on web:', firebaseError.message);
    }
  },

  // Get all stored events
  async getEvents() {
    try {
      const events = await AsyncStorage.getItem('analytics_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.warn('Could not get analytics events:', error);
      return [];
    }
  },

  // Clear all events
  async clearEvents() {
    try {
      await AsyncStorage.removeItem('analytics_events');
      return true;
    } catch (error) {
      console.warn('Could not clear analytics events:', error);
      return false;
    }
  }
};

export default AnalyticsService;
