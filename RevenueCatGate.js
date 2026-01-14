// File: src/components/RevenueCatGate.js
import React from 'react';
import { 
  View, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import the updated hooks
import usePremiumAccess from '../hooks/usePremiumAccess';
import useDailyLocks from '../hooks/useDailyLocks';

const RevenueCatGate = ({ 
  children, 
  requiredEntitlement = 'premium_access',
  featureName = 'This feature',
  dailyLockCheck = false // Set to true if this feature uses daily locks
}) => {
  const navigation = useNavigation();
  
  // Use the appropriate hook
  const premium = usePremiumAccess();
  const daily = useDailyLocks();
  
  // Determine which hook to use based on requirements
  let hook;
  if (requiredEntitlement === 'premium_access') {
    hook = premium;
  } else if (requiredEntitlement === 'daily_locks' || dailyLockCheck) {
    hook = daily;
  } else {
    // Default to premium
    hook = premium;
  }

  const { hasAccess, loading, locksRemaining } = hook;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  // For daily locks with remaining free locks
  if (dailyLockCheck && locksRemaining > 0) {
    return children;
  }

  // For premium access or paid daily locks
  if (hasAccess) {
    return children;
  }

  // User doesn't have access - show upgrade prompt
  const isPremiumAccess = requiredEntitlement === 'premium_access' && !dailyLockCheck;
  const isDailyLocks = requiredEntitlement === 'daily_locks' || dailyLockCheck;
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed" size={60} color="#ef4444" />
        <Text style={styles.title}>
          {isPremiumAccess ? 'Premium Feature' : 'Limited Feature'}
        </Text>
        <Text style={styles.description}>
          {isPremiumAccess 
            ? `${featureName} requires a premium subscription.`
            : `You've used your ${daily.dailyLimit} free ${featureName.toLowerCase()} for today.`}
        </Text>
        
        {isDailyLocks && (
          <View style={styles.locksInfo}>
            <Text style={styles.locksText}>
              Free locks remaining today: {locksRemaining}/{daily.dailyLimit}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          // Navigate to Premium screen with appropriate focus
          navigation.navigate('PremiumTab', { 
            screen: 'PremiumAccess',
            params: { 
              focus: isPremiumAccess ? 'subscriptions' : 'locks',
              feature: featureName
            }
          });
        }}
      >
        <Ionicons 
          name={isPremiumAccess ? "diamond" : "unlock"} 
          size={20} 
          color="#fff" 
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>
          {isPremiumAccess 
            ? 'View Subscription Plans' 
            : 'Get Unlimited Access'}
        </Text>
      </TouchableOpacity>

      {isDailyLocks && locksRemaining === 0 && (
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            // Grant test access in development
            if (__DEV__) {
              hook.grantTestAccess?.();
            }
          }}
        >
          <Text style={styles.secondaryButtonText}>
            {__DEV__ ? 'Grant Test Access (Dev Only)' : 'Try Again Tomorrow'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.footerText}>
        {isPremiumAccess 
          ? 'Unlock all premium features with a subscription.'
          : 'Subscribe for unlimited access every day.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 10,
    color: '#94a3b8',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  locksInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  locksText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 250,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#334155',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#475569',
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

export default RevenueCatGate;
