import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

const SubscriptionScreen = () => {
  const { user, isPremium, upgradeToPremium, logout } = useAuth();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏀 NBA Fantasy Pro</Text>
        <Text style={styles.subtitle}>Subscription & Premium Features</Text>
      </View>

      {/* Current Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Your Current Status</Text>
        
        {user ? (
          <>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            
            <View style={[styles.badge, isPremium ? styles.premiumBadge : styles.freeBadge]}>
              <Text style={styles.badgeText}>
                {isPremium ? '⭐ PREMIUM MEMBER' : 'FREE ACCOUNT'}
              </Text>
            </View>
            
            {isPremium && user.premiumExpiry && (
              <View style={styles.expiryInfo}>
                <Text style={styles.expiryText}>
                  Premium valid until: {new Date(user.premiumExpiry).toLocaleDateString()}
                </Text>
                {user.premiumPlan && (
                  <Text style={styles.planText}>Plan: {user.premiumPlan}</Text>
                )}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noUserText}>Not signed in</Text>
        )}
      </View>

      {/* Premium Features List */}
      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>Premium Features</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Elite Insights & Analytics</Text>
            <Text style={styles.featureDescription}>
              Advanced statistics, player tracking, and game predictions
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎯</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Parlay Builder</Text>
            <Text style={styles.featureDescription}>
              Build custom parlays with real-time odds and recommendations
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📰</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Sports News Hub</Text>
            <Text style={styles.featureDescription}>
              Breaking news, injury reports, and expert analysis
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⭐</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Expert Daily Picks</Text>
            <Text style={styles.featureDescription}>
              Curated picks from professional analysts
            </Text>
          </View>
        </View>
      </View>

      {/* Pricing Options */}
      {!isPremium && (
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Upgrade to Premium</Text>
          
          <TouchableOpacity
            style={[styles.pricingOption, styles.monthlyOption]}
            onPress={async () => {
              const result = await upgradeToPremium('monthly');
              if (result.success) {
                alert('🎉 Welcome to Premium!');
              }
            }}
          >
            <Text style={styles.optionTitle}>Monthly Plan</Text>
            <Text style={styles.optionPrice}>$9.99</Text>
            <Text style={styles.optionPeriod}>per month</Text>
            <Text style={styles.optionFeatures}>All premium features • Cancel anytime</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricingOption, styles.yearlyOption]}
            onPress={async () => {
              const result = await upgradeToPremium('yearly');
              if (result.success) {
                alert('🎉 Welcome to Premium!');
              }
            }}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={styles.optionTitle}>Yearly Plan</Text>
            <Text style={styles.optionPrice}>$79.99</Text>
            <Text style={styles.optionPeriod}>per year</Text>
            <Text style={styles.optionDiscount}>Save 33% compared to monthly</Text>
            <Text style={styles.optionFeatures}>All premium features • Billed annually</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoOption}
            onPress={async () => {
              const result = await upgradeToPremium('demo');
              if (result.success) {
                alert('Demo premium access granted! Explore all features.');
              }
            }}
          >
            <Text style={styles.demoOptionText}>Try Demo Premium (Free)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Account Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Account Actions</Text>
        
        {user ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={logout}
            >
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
            
            {isPremium && (
              <TouchableOpacity
                style={[styles.actionButton, styles.manageButton]}
                onPress={() => alert('Manage subscription coming soon!')}
              >
                <Text style={styles.manageButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.loginButton]}
            onPress={() => {
              logout(); // This will trigger login screen on next restart
              alert('Please restart the app to log in');
            }}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Analytics Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📈 Analytics Tracking</Text>
        <Text style={styles.infoText}>
          Your activity is logged to MongoDB Atlas for:
        </Text>
        <Text style={styles.infoBullet}>• User authentication events</Text>
        <Text style={styles.infoBullet}>• Premium subscription changes</Text>
        <Text style={styles.infoBullet}>• App usage patterns</Text>
        <Text style={styles.infoText}>
          Check data with: ./quick-check.sh
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 24,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  statusCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  userEmail: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    color: '#94a3b8',
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  premiumBadge: {
    backgroundColor: '#10b981',
  },
  freeBadge: {
    backgroundColor: '#6b7280',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  expiryInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  expiryText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  planText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  noUserText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  featuresCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 18,
  },
  pricingCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  pricingOption: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  monthlyOption: {
    borderColor: '#3b82f6',
  },
  yearlyOption: {
    borderColor: '#10b981',
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  optionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionPrice: {
    color: '#3b82f6',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionPeriod: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  optionDiscount: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionFeatures: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  demoOption: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  demoOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#3b82f6',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#10b981',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  infoBullet: {
    color: '#94a3b8',
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },
});

export default SubscriptionScreen;
