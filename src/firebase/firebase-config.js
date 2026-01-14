// src/firebase/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCi7YQ-vawFT3sIr1i8yuhhx-1vSplAneA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nba-fantasy-ai.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nba-fantasy-ai",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nba-fantasy-ai.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "718718403866",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:718718403866:web:e26e10994d62799a048379",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BLTPX9LJ7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize other services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Change the analytics export to be conditional:
let analytics = null;

// Only initialize analytics on web
if (typeof window !== 'undefined') {
  const { getAnalytics } = require("firebase/analytics");
  analytics = getAnalytics(app);
}

export { analytics };

export default app;
