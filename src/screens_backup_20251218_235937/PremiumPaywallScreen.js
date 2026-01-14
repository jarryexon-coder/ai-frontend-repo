import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

const PremiumPaywallScreen = ({ visible, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Mock RevenueCat package data
  const packages = {
    monthly: {
      id: 'premium_monthly',
      price: '$9.99',
      period: 'month',
      description: 'Billed monthly',
      offerText: 'Most Flexible',
      savings: '',
    },
    yearly: {
      id: 'premium_yearly',
      price: '$79.99',
      period: 'year',
      description: 'Billed yearly',
      offerText: 'Best Value',
      savings: 'Save 33%',
    },
    lifetime: {
      id: 'premium_lifetime',
      price: '$199.99',
      period: 'lifetime',
      description: 'One-time payment',
      offerText: 'Best Deal',
      savings: 'Lifetime access',
    },
  };

  const features = [
    {
      icon: 'analytics',
      title: 'Advanced Analytics',
      description: 'Deep player & team insights',
    },
    {
      icon: 'flash',
      title: 'Live Predictions',
      description: 'Real-time game projections',
    },
    {
      icon: 'stats-chart',
      title: 'Player Prop Tools',
      description: 'Prop bet recommendations',
    },
    {
      icon: 'shield-checkmark',
      title: 'No Ads',
      description: 'Ad-free experience',
    },
    {
      icon: 'download',
      title: 'Data Exports',
      description: 'Export analytics to CSV',
    },
    {
      icon: 'people',
      title: 'Priority Support',
      description: '24/7 customer support',
    },
  ];

  const handlePurchase = async (packageId) => {
    setIsPurchasing(true);
    try {
      console.log('Starting purchase for:', packageId);
      
      // Here you would integrate with RevenueCat
      // Example: await Purchases.purchasePackage(packageId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success!',
        'Your premium subscription is now active.',
        [{ text: 'OK', onPress: onClose }]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchase = async () => {
    try {
      // RevenueCat restore purchases
      // await Purchases.restorePurchases();
      Alert.alert('Restored', 'Your purchases have been restored.');
    } catch (error) {
      Alert.alert('Error', 'Unable to restore purchases.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Ionicons name="star" size={60} color="#fbbf24" />
            <Text style={styles.title}>Go Premium</Text>
            <Text style={styles.subtitle}>Unlock the full potential of NBA Analytics</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView}>
          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name={feature.icon} size={24} color="#3b82f6" />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing Plans */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            
            {Object.entries(packages).map(([key, plan]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.planCard,
                  selectedPlan === key && styles.selectedPlanCard,
                ]}
                onPress={() => setSelectedPlan(key)}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planRadio}>
                    {selectedPlan === key && <View style={styles.planRadioSelected} />}
                  </View>
                  {plan.offerText && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{plan.offerText}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.planBody}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>per {plan.period}</Text>
                  {plan.savings && (
                    <Text style={styles.planSavings}>{plan.savings}</Text>
                  )}
                </View>
                
                <Text style={styles.planDescription}>{plan.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Terms & Privacy */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
              Subscriptions auto-renew unless canceled 24 hours before the end of the current period.
              Manage subscriptions in your account settings.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
            onPress={() => handlePurchase(packages[selectedPlan].id)}
            disabled={isPurchasing}
          >
            <LinearGradient
              colors={['#fbbf24', '#f59e0b']}
              style={styles.purchaseButtonGradient}
            >
              {isPurchasing ? (
                <Text style={styles.purchaseButtonText}>Processing...</Text>
              ) : (
                <Text style={styles.purchaseButtonText}>
                  Get {selectedPlan === 'lifetime' ? 'Lifetime Access' : 'Subscribe Now'} - {packages[selectedPlan].price}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchase}
          >
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  pricingSection: {
    marginTop: 30,
  },
  planCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedPlanCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  planBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  planBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planBody: {
    alignItems: 'center',
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  planSavings: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 6,
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  termsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  actionSection: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  purchaseButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  purchaseButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  restoreButton: {
    padding: 15,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PremiumPaywallScreen;
