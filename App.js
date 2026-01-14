// App.js - Updated to use hooks/useAuth
import React, { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import GroupedTabNavigator from './src/navigation/GroupedTabNavigator';
import Purchases from 'react-native-purchases';
import { Platform as RNPlatform } from 'react-native';

// Import from hooks/useAuth (single source of truth)
import { AuthProvider, useAuth } from './src/hooks/useAuth';

// Import TestSecretPhrase component with lazy loading
const TestSecretPhrase = React.lazy(() => import('./src/components/TestSecretPhrase'));
// Import AdminPanel with lazy loading
const AdminPanel = React.lazy(() => import('./src/components/AdminPanel'));
// Import Privacy Policy with lazy loading
const PrivacyPolicy = React.lazy(() => import('./src/components/PrivacyPolicy'));

// Create stack navigator
const Stack = createNativeStackNavigator();

// Loading fallback component
const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3b82f6" />
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});

// ========================================================
// File 1: fetchAppConfig function - Added to App.js
// ========================================================

// Example in your frontend's App.js or a config file
async function fetchAppConfig() {
  try {
    // Use the EXPO_PUBLIC_API_URL variable you set in Railway
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://pleasing-determination-production.up.railway.app';
    console.log('🔧 Fetching app config from:', apiBaseUrl);
    const response = await fetch(`${apiBaseUrl}/api/config`);
    const configData = await response.json();

    if (configData.success) {
      // Store this config globally (e.g., using React Context, AsyncStorage, or a state manager)
      console.log('✅ App config loaded:', configData.config);
      return configData.config;
    } else {
      console.warn('⚠️ Config fetch returned unsuccessful:', configData);
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to load app config:', error);
    // You can decide to use sensible defaults here
    return null;
  }
}

// Call this function when your app starts.
// ========================================================

// Initialize RevenueCat on app start
const initializeRevenueCat = async (userId = null) => {
  try {
    if (__DEV__) {
      console.log('🔄 Initializing RevenueCat with hardcoded keys...');
    }
    
    // Configuration from File 1
    const config = {
      apiKey: Platform.select({
        ios: 'appl_eDwUHlFEtBYuVyjQVzJaNpYuDAR',
        android: 'goog_cURaZuoYPhEGjHovjWYEvaSOxsh',
      }),
    };
    
    // Add appUserID if provided (optional)
    if (userId) {
      config.appUserID = userId;
    }
    
    // Check if we have a valid API key for the current platform
    if (config.apiKey) {
      Purchases.configure(config);
      
      if (__DEV__) {
        console.log(`✅ RevenueCat initialized for ${RNPlatform.OS}`);
      }
      return true;
    } else {
      if (__DEV__) {
        console.log('ℹ️ RevenueCat not configured for this platform - running in development mode');
      }
      return false;
    }
    
  } catch (error) {
    console.warn('⚠️ RevenueCat initialization skipped:', error.message);
    return false;
  }
};

// Initialize Firebase for Web Platform
const initializeFirebaseWeb = () => {
  if (RNPlatform.OS === 'web') {
    try {
      console.log('🔥 [Firebase] Attempting to initialize Firebase for web...');
      
      // Firebase configuration - Replace with your actual Firebase config
      // These should be in your environment variables
      const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
      };
      
      // Check if Firebase config is valid
      const isValidConfig = firebaseConfig.apiKey && 
                           firebaseConfig.apiKey !== "YOUR_API_KEY" &&
                           firebaseConfig.appId && 
                           firebaseConfig.appId !== "YOUR_APP_ID";
      
      if (isValidConfig) {
        // Dynamically import Firebase for web only
        const firebase = require('firebase/app');
        require('firebase/analytics');
        
        // Initialize Firebase only if not already initialized
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
          console.log('✅ [Firebase] Firebase Web SDK initialized successfully');
        } else {
          console.log('ℹ️ [Firebase] Firebase already initialized');
        }
        
        return true;
      } else {
        console.warn('⚠️ [Firebase] Invalid or missing Firebase configuration. Analytics will use console logging only.');
        console.warn('⚠️ [Firebase] Please set EXPO_PUBLIC_FIREBASE_* environment variables in your .env file');
        return false;
      }
    } catch (error) {
      console.error('❌ [Firebase] Failed to initialize Firebase for web:', error.message);
      console.log('ℹ️ [Firebase] Analytics will use console logging only');
      return false;
    }
  }
  
  console.log(`📱 [Firebase] Platform: ${RNPlatform.OS} - Firebase Web SDK not required`);
  return false;
};

// Simple Login Screen Component
const SimpleLoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoggingIn(true);
    const result = await login(email, password);
    setIsLoggingIn(false);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Please try again');
    }
  };

  const handleQuickDemo = () => {
    setEmail('demo@nba.com');
    setPassword('demo123');
    setTimeout(() => handleLogin(), 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={loginStyles.container}>
          <View style={loginStyles.header}>
            <Text style={loginStyles.title}>🏀 NBA Fantasy Pro</Text>
            <Text style={loginStyles.subtitle}>Sign in to access premium analytics</Text>
          </View>
          
          <View style={loginStyles.form}>
            <TextInput
              style={loginStyles.input}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoggingIn}
            />
            
            <TextInput
              style={loginStyles.input}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoggingIn}
            />
            
            <TouchableOpacity
              style={loginStyles.button}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={loginStyles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={loginStyles.demoButton}
              onPress={handleQuickDemo}
              disabled={isLoggingIn}
            >
              <Text style={loginStyles.demoButtonText}>Quick Demo Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={loginStyles.skipButton}
              onPress={handleQuickDemo}
            >
              <Text style={loginStyles.skipText}>Skip & Use Demo →</Text>
            </TouchableOpacity>
            
            <View style={loginStyles.infoBox}>
              <Text style={loginStyles.infoText}>
                💡 Demo: Use any email/password
              </Text>
              <Text style={loginStyles.infoText}>
                Data saved locally on your device
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('PrivacyPolicy')}
                style={{ marginTop: 10, alignItems: 'center' }}
              >
                <Text style={{ 
                  color: '#3b82f6', 
                  textDecorationLine: 'underline',
                  fontSize: 14 
                }}>
                  📄 View Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  skipText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 8,
  },
});

// Public routes that don't require authentication
const PublicStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#0f172a',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: {
        backgroundColor: '#0f172a',
      },
    }}
  >
    <Stack.Screen
      name="Login"
      component={SimpleLoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PrivacyPolicy"
      options={{ 
        title: 'Privacy Policy',
        headerStyle: {
          backgroundColor: '#1e293b',
        },
        headerTintColor: '#3b82f6',
      }}
    >
      {(props) => (
        <React.Suspense fallback={<LoadingFallback />}>
          <PrivacyPolicy {...props} />
        </React.Suspense>
      )}
    </Stack.Screen>
  </Stack.Navigator>
);

// Protected routes that require authentication
const ProtectedStack = () => {
  const { user, checkAdminStatus } = useAuth();
  
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#0f172a',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={GroupedTabNavigator}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="TestSecretPhrase" 
        options={{ 
          title: 'Secret Phrase Tester',
          headerStyle: {
            backgroundColor: '#1e293b',
          },
          headerTintColor: '#3b82f6',
        }}
      >
        {(props) => (
          <React.Suspense fallback={<LoadingFallback />}>
            <TestSecretPhrase {...props} />
          </React.Suspense>
        )}
      </Stack.Screen>
      
      {/* Admin Panel - Only accessible to admin users */}
      <Stack.Screen 
        name="AdminPanel" 
        options={{ 
          title: 'Admin Panel',
          headerStyle: {
            backgroundColor: '#1e293b',
          },
          headerTintColor: '#3b82f6',
        }}
      >
        {(props) => {
          const isAdmin = checkAdminStatus();
          
          if (!isAdmin) {
            Alert.alert('Access Denied', 'You need admin privileges to access this panel.');
            props.navigation.goBack();
            return null;
          }
          
          return (
            <React.Suspense fallback={<LoadingFallback />}>
              <AdminPanel {...props} />
            </React.Suspense>
          );
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// Root Navigator with authentication logic
const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  const [isRevenueCatReady, setIsRevenueCatReady] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [appConfig, setAppConfig] = useState(null);

  // Test API connection on startup
  const testApiConnection = async () => {
    try {
      console.log('🔧 Testing API connection on startup...');
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://pleasing-determination-production.up.railway.app';
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        const endTime = Date.now();
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend connected:', baseUrl);
          console.log('⚡ Latency:', endTime - startTime, 'ms');
          setApiTestResult({ 
            success: true, 
            baseUrl, 
            latency: endTime - startTime,
            message: data.message || 'Healthy'
          });
        } else {
          console.warn('⚠️ Backend connection failed with status:', response.status);
          setApiTestResult({ 
            success: false, 
            baseUrl, 
            error: `HTTP ${response.status}`,
            note: 'Backend health check failed'
          });
        }
      } catch (fetchError) {
        console.error('❌ Connection test failed:', fetchError.message);
        setApiTestResult({ 
          success: false, 
          error: fetchError.message,
          note: 'Network error or backend is unreachable'
        });
      }
    } catch (error) {
      console.error('❌ Connection test setup failed:', error);
      setApiTestResult({ 
        success: false, 
        error: error.message,
        note: 'API test setup error'
      });
    }
  };

  // Fetch app config on startup - Added from File 1
  const fetchAppConfigOnStartup = async () => {
    console.log('🔧 Fetching app configuration on startup...');
    try {
      const config = await fetchAppConfig();
      if (config) {
        setAppConfig(config);
        console.log('✅ App configuration loaded successfully');
        
        // You can now use the config throughout your app
        // For example, you might want to store it in context or global state
        // console.log('App Config Details:', {
        //   apiUrl: config.apiUrl,
        //   features: config.features,
        //   version: config.version
        // });
      } else {
        console.warn('⚠️ No app config loaded, using defaults');
      }
    } catch (error) {
      console.error('❌ Failed to fetch app config on startup:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Initialize RevenueCat with optional user ID
      const revenueCatInitialized = await initializeRevenueCat(user?.id || null);
      setIsRevenueCatReady(revenueCatInitialized);
      
      // Initialize Firebase for Web
      const firebaseInitialized = initializeFirebaseWeb();
      setIsFirebaseReady(firebaseInitialized);
      
      // Test API connection
      await testApiConnection();
      
      // Fetch app config - Added from File 1
      await fetchAppConfigOnStartup();
      
      // Log initialization status
      console.log('🚀 [App Initialization]');
      console.log(`   - RevenueCat: ${revenueCatInitialized ? '✅ Ready' : '⏳ Not configured'}`);
      console.log(`   - Firebase: ${firebaseInitialized ? '✅ Web SDK Ready' : '📱 Console logging only'}`);
      console.log(`   - Platform: ${RNPlatform.OS}`);
      console.log(`   - API Test: ${apiTestResult?.success ? '✅ Connected' : '❌ Failed'}`);
      console.log(`   - App Config: ${appConfig ? '✅ Loaded' : '❌ Not loaded'}`);
      console.log(`   - User Status: ${user ? '✅ Logged In' : '🔓 Not Logged In'}`);
      
      // Short splash screen
      setTimeout(() => {
        setShowSplash(false);
      }, 1500);
    };
    
    init();
  }, [user?.id]);

  // Show splash screen
  if (showSplash) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 36, color: '#3b82f6', marginBottom: 20 }}>🏀</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 }}>NBA Fantasy Pro</Text>
        <Text style={{ color: '#94a3b8' }}>Loading app configuration...</Text>
      </View>
    );
  }

  // Show loading while checking auth or initializing services
  if (isLoading || !isRevenueCatReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#94a3b8', marginTop: 20 }}>
          {isLoading ? 'Checking login status...' : 'Initializing app services...'}
        </Text>
        <Text style={{ color: '#64748b', marginTop: 10, fontSize: 12 }}>
          Firebase: {isFirebaseReady ? 'Ready' : 'Console mode'}
        </Text>
        {apiTestResult && (
          <Text style={{ color: apiTestResult.success ? '#10b981' : '#ef4444', marginTop: 10, fontSize: 12 }}>
            API: {apiTestResult.success ? 'Connected' : 'Failed'}
          </Text>
        )}
        {appConfig && (
          <Text style={{ color: '#10b981', marginTop: 10, fontSize: 12 }}>
            Config: Loaded
          </Text>
        )}
      </View>
    );
  }

  // Show protected stack if user is authenticated, otherwise show public stack
  return user ? <ProtectedStack /> : <PublicStack />;
};

// Main App Component
function App() {
  // Log app startup
  useEffect(() => {
    console.log('🚀 NBA Fantasy Pro App Starting...');
    console.log(`📱 Platform: ${RNPlatform.OS}`);
    console.log(`🏗️  Environment: ${__DEV__ ? 'Development' : 'Production'}`);
    
    // Additional debug info for React Native
    console.log('🔍 React Native Environment:');
    console.log('   - Platform:', Platform.OS);
    console.log('   - Platform Version:', Platform.Version);
    console.log('   - Is TV:', Platform.isTV);
    console.log('   - Is Testing:', Platform.isTesting);
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
registerRootComponent(App);
