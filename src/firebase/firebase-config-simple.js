// src/firebase/firebase-config-simple.js
// Simplified Firebase config for React Native/Expo WITHOUT Analytics
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCi7YQ-vawFT3sIr1i8yuhhx-1vSplAneA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nba-fantasy-ai.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nba-fantasy-ai",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nba-fantasy-ai.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "718718403866",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:718718403866:web:e26e10994d62799a048379",
  // NOTE: measurementId is REMOVED - Analytics doesn't work in React Native
};

// Initialize Firebase only once
let app;
let auth;
let db;
let storage;

try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully (Analytics DISABLED for React Native)');
  } else {
    app = getApp();
    console.log('ℹ️ Firebase already initialized, using existing app');
  }
  
  // Initialize Auth with persistence - Only if not already initialized
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (authError) {
    if (authError.code === 'auth/already-initialized') {
      auth = getAuth(app);
      console.log('ℹ️ Auth already initialized, using existing auth instance');
    } else {
      throw authError;
    }
  }
  
  // Initialize Firestore and Storage
  db = getFirestore(app);
  storage = getStorage(app);
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.error('Full error:', error);
  
  // Create fallback mock objects
  app = { name: 'FirebaseMock' };
  auth = { 
    currentUser: null,
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
    signOut: () => Promise.resolve()
  };
  db = {
    collection: () => ({ 
      doc: () => ({ 
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.reject(new Error('Firebase not initialized'))
      })
    })
  };
  storage = {
    ref: () => ({ 
      put: () => Promise.reject(new Error('Firebase not initialized'))
    })
  };
}

// Export services
export { app, auth, db, storage };
export default app;

// Export a function to check Firebase status
export const checkFirebaseStatus = () => {
  return {
    appInitialized: !!app && app.name !== 'FirebaseMock',
    authAvailable: !!auth,
    dbAvailable: !!db,
    storageAvailable: !!storage,
  };
};
