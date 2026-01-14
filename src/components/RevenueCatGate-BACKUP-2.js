// File: src/components/RevenueCatGate.js
import React from 'react';
import { 
  View, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // ADDED
import { Ionicons } from '@expo/vector-icons';

// Import the updated hooks
import usePremiumAccess from '../hooks/usePremiumAccess';
import useDailyLocks from '../hooks/useDailyLocks';

const RevenueCatGate = ({ 
  children, 
  requiredEntitlement = 'premium_access',
  featureName = 'This feature'
}) => {
  const navigation = useNavigation(); // ADDED
  
  // Use the appropriate hook based on the required entitlement
  const premium = usePremiumAccess();
  const daily = useDailyLocks();
  
  const { hasAccess, loading } = requiredEntitlement === 'premium_access' ? premium : daily;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  if (hasAccess) {
    return children;
  }

  // User doesn't have access - show upgrade prompt
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed" size={60} color="#007AFF" />
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.description}>
          {featureName} requires {requiredEntitlement === 'premium_access' ? 'a premium subscription' : 'daily unlocks'}.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          // Navigate to the appropriate screen
          if (requiredEntitlement === 'premium_access') {
            navigation.navigate('Premium');
          } else {
            navigation.navigate('Premium', { feature: 'daily_locks' });
          }
        }}
      >
        <Text style={styles.buttonText}>
          {requiredEntitlement === 'premium_access' ? 'View Subscription Plans' : 'Get More Unlocks'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Your current plan doesn't include this feature.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    justifyContent: 'center'
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 30
  }
});

export default RevenueCatGate;
