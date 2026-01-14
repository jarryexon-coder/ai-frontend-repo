// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Critical: Redirect 'firebase' web package imports to our stub
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'firebase/app': require.resolve('./src/services/firebase-web-stub.js'),
  'firebase/analytics': require.resolve('./src/services/firebase-web-stub.js'),
  // Add other firebase/web modules if needed (e.g., 'firebase/firestore')
  'firebase/firestore': require.resolve('./src/services/firebase-web-stub.js'),
};

module.exports = config;
