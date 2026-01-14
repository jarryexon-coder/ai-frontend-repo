import React from 'react';
import { SearchProvider } from '../providers/SearchProvider';
import HomeScreen from './HomeScreen-working.js';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

// Import useAuth from our new AuthContext
import { useAuth } from '../hooks/useAuth';

export default function WrappedHomeScreen(props) {
  const { user, logout, isAuthenticated } = useAuth();

  // Enhanced HomeScreen with auth info
  const EnhancedHomeScreen = (screenProps) => {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        {/* Auth Banner - Fixed with SafeAreaView */}
        <View style={styles.authBanner}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>
              {isAuthenticated ? `Welcome, ${user?.name || user?.email || 'User'}!` : '🏀 NBA Fantasy Pro'}
            </Text>
            <Text style={styles.userEmail}>
              {isAuthenticated ? user?.email : 'Demo Mode - Sign in to save preferences'}
            </Text>
          </View>
          
          {isAuthenticated ? (
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => {
                // Force logout to show login screen
                logout();
              }}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Original HomeScreen */}
        <View style={{ flex: 1 }}>
          <HomeScreen {...screenProps} />
        </View>
      </SafeAreaView>
    );
  };

  return (
    <SearchProvider>
      <EnhancedHomeScreen {...props} />
    </SearchProvider>
  );
}

const styles = StyleSheet.create({
  authBanner: {
    backgroundColor: '#1e293b',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
