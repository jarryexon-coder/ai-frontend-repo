// src/components/ProtectedRoute.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth'; // Import from hook directly

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isLoading, checkAdminStatus } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    // In React Native, we typically handle this via navigation
    // You might want to use navigation.replace('Login') here
    // For now, we'll return null and let the navigator handle redirection
    return null;
  }

  if (requireAdmin && !checkAdminStatus()) {
    // Admin access required but user is not admin
    // You can show an alert or navigate back
    return null;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});

export default ProtectedRoute;
