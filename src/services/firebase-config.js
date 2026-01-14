import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCi7YQ-vawFT3sIr1i8yuhhx-1vSplAneA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nba-fantasy-ai.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nba-fantasy-ai",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nba-fantasy-ai.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "718718403866",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:718718403866:web:e26e10994d62799a048379",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BLTPX9LJ7K"
};

export const isFirebaseSupported = () => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && typeof window.firebase !== 'undefined';
  }
  return false;
};

let firebaseApp = null;
let firebaseAnalytics = null;

export const getFirebaseApp = async () => {
  if (Platform.OS !== 'web' || __DEV__) {
    return null;
  }

  if (!firebaseApp && typeof window !== 'undefined') {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getAnalytics } = await import('firebase/analytics');
      firebaseApp = initializeApp(firebaseConfig);
      firebaseAnalytics = getAnalytics(firebaseApp);
      console.log('✅ Firebase initialized for web analytics');
    } catch (error) {
      console.warn('⚠️ Firebase initialization skipped:', error.message);
    }
  }
  return { app: firebaseApp, analytics: firebaseAnalytics };
};

export class AnalyticsService {
  static async logEvent(eventName, eventParams = {}) {
    try {
      const eventData = {
        event: eventName,
        params: eventParams,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        environment: __DEV__ ? 'development' : 'production',
      };

      if (__DEV__) {
        console.log(`📊 Analytics Event: ${eventName}`, eventParams);
      }

      await this.saveEventLocally(eventData);

      if (Platform.OS === 'web' && !__DEV__) {
        await this.sendToFirebase(eventName, eventParams);
      }

      return true;
    } catch (error) {
      console.warn('Analytics event logging failed:', error.message);
      return false;
    }
  }

  static async saveEventLocally(eventData) {
    try {
      const existingEvents = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');
      existingEvents.push(eventData);
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }
      await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
    } catch (error) {
      console.warn('Failed to save event locally:', error.message);
    }
  }

  static async sendToFirebase(eventName, eventParams) {
    try {
      const firebase = await getFirebaseApp();
      if (firebase?.analytics) {
        const { logEvent } = await import('firebase/analytics');
        logEvent(firebase.analytics, eventName, eventParams);
      }
    } catch (error) {
      console.warn('Firebase analytics not available:', error.message);
    }
  }

  static async getEvents() {
    try {
      const events = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');
      return events;
    } catch (error) {
      console.warn('Failed to get analytics events:', error.message);
      return [];
    }
  }

  static async clearEvents() {
    try {
      await AsyncStorage.removeItem('analytics_events');
    } catch (error) {
      console.warn('Failed to clear analytics events:', error.message);
    }
  }
}
