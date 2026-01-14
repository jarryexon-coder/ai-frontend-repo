// src/services/firebase-service.js - Updated to be empty/null service
// This file is kept for backward compatibility but does nothing
// Firebase is now initialized via src/firebase/firebase-config-simple.js

class FirebaseService {
  constructor() {
    this.initialized = true;
  }

  initialize = () => {
    console.log('ℹ️ Firebase is initialized via firebase-config-simple.js');
    return true;
  };

  // Mock methods for compatibility
  trackScreenView = () => {};
  trackButtonClick = () => {};
  trackPurchase = () => {};
  trackSubscription = () => {};
  setUserProperties = () => {};
  setUserId = () => {};
}

export default new FirebaseService();
