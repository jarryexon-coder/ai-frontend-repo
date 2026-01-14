// app.config.js - FIXED VERSION
module.exports = {
  expo: {
    name: 'NBA Fantasy App',
    slug: 'nba-fantasy-app',
    version: '1.0.0',
    runtimeVersion: '1.0.0',
    scheme: 'nbafantasyapp',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.nbafantasyai',
      buildNumber: '1',
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: 'com.jerryjiya.myapp_new',
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      versionCode: 1
    },
    web: {
      favicon: './assets/favicon.png'
    }, // <-- ADDED MISSING COMMA HERE (this was the error)
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            deploymentTarget: '15.1'
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0"
          }
        }
      ],
      'expo-asset'
    ],
    extra: {
      // Use your Railway URL, not localhost
      apiUrl: 'https://pleasing-determination-production.up.railway.app',
      apiBaseUrl: 'https://pleasing-determination-production.up.railway.app/api',
      environment: 'development'
    }
  }
};
