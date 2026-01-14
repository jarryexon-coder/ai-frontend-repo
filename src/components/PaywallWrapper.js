import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const PaywallWrapper = ({ children, requiredEntitlement = 'premium' }) => {
  const { user, isPremium, isLoading, upgradeToPremium } = useAuth();
  const navigation = useNavigation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <View style={styles.paywallContainer}>
        <Text style={styles.title}>🔒 Premium Content</Text>
        <Text style={styles.message}>
          Sign in to access premium features
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // This would navigate to login, but login is handled at app level
            // For now, just show a message
            alert('Please log out and log back in to access this content');
          }}
        >
          <Text style={styles.buttonText}>Sign In Required</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If user is authenticated but not premium, show paywall
  if (!isPremium) {
    return (
      <View style={styles.paywallContainer}>
        <Text style={styles.title}>🌟 Upgrade to Premium</Text>
        <Text style={styles.message}>
          Unlock all premium features including:
        </Text>
        
        <View style={styles.featuresList}>
          <Text style={styles.feature}>• Elite Insights & Analytics</Text>
          <Text style={styles.feature}>• Advanced Player Statistics</Text>
          <Text style={styles.feature}>• Parlay Builder & Predictions</Text>
          <Text style={styles.feature}>• Expert Daily Picks</Text>
          <Text style={styles.feature}>• Sports News Hub</Text>
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity
            style={[styles.pricingButton, styles.monthlyButton]}
            onPress={async () => {
              const result = await upgradeToPremium('monthly');
              if (result.success) {
                alert('🎉 Successfully upgraded to Premium!');
              } else {
                alert('Upgrade failed: ' + result.error);
              }
            }}
          >
            <Text style={styles.pricingTitle}>Monthly</Text>
            <Text style={styles.pricingPrice}>$9.99</Text>
            <Text style={styles.pricingPeriod}>per month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricingButton, styles.yearlyButton]}
            onPress={async () => {
              const result = await upgradeToPremium('yearly');
              if (result.success) {
                alert('🎉 Successfully upgraded to Premium!');
              } else {
                alert('Upgrade failed: ' + result.error);
              }
            }}
          >
            <Text style={styles.pricingTitle}>Yearly</Text>
            <Text style={styles.pricingPrice}>$79.99</Text>
            <Text style={styles.pricingPeriod}>per year</Text>
            <Text style={styles.saveBadge}>Save 33%</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => {
            // Grant temporary demo access
            upgradeToPremium('demo').then(result => {
              if (result.success) {
                alert('Demo premium access granted! This will reset on logout.');
              }
            });
          }}
        >
          <Text style={styles.demoButtonText}>Try Demo Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Free Features</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // User is authenticated AND premium - show the content
  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 20,
    fontSize: 16,
  },
  paywallContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#cbd5e1',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresList: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },
  feature: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 8,
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 16,
  },
  pricingButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  monthlyButton: {
    borderColor: '#3b82f6',
  },
  yearlyButton: {
    borderColor: '#10b981',
  },
  pricingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  pricingPrice: {
    color: '#3b82f6',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pricingPeriod: {
    color: '#94a3b8',
    fontSize: 14,
  },
  saveBadge: {
    backgroundColor: '#10b981',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default PaywallWrapper;
