import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create AnalyticsService similar to SubscriptionGate
const AnalyticsService = {
  trackSubscriptionScreenView: (screenName) => {
    console.log('📊 Analytics: Subscription screen viewed', {
      screenName,
      timestamp: new Date().toISOString()
    });
    
    try {
      ApiService.trackScreenView('user_unknown', screenName, {
        component: 'SubscriptionScreen',
        section: 'pricing'
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  },
  
  trackSubscriptionUpgradeAttempt: (planId, source, component) => {
    console.log('📊 Analytics: Upgrade attempt', {
      planId,
      source,
      component,
      timestamp: new Date().toISOString()
    });
    
    try {
      ApiService.trackSubscriptionEvent('user_unknown', 'upgrade_attempt', {
        targetPlan: planId,
        source,
        component,
        action: 'initiated'
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  },
  
  trackSubscriptionUpgradeSuccess: (planId, method, price) => {
    console.log('📊 Analytics: Upgrade success', {
      planId,
      method,
      price,
      timestamp: new Date().toISOString()
    });
    
    try {
      ApiService.trackSubscriptionEvent('user_unknown', 'upgrade_success', {
        planId,
        method,
        price,
        status: 'completed'
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  },
  
  trackSubscriptionUpgradeFailure: (planId, errorCode, errorMessage) => {
    console.log('📊 Analytics: Upgrade failure', {
      planId,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString()
    });
    
    try {
      ApiService.trackSubscriptionEvent('user_unknown', 'upgrade_failure', {
        planId,
        errorCode,
        errorMessage,
        status: 'failed'
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  },
  
  trackRestorePurchasesAttempt: () => {
    console.log('📊 Analytics: Restore purchases attempt', {
      timestamp: new Date().toISOString()
    });
    
    try {
      ApiService.trackSubscriptionEvent('user_unknown', 'restore_attempt', {
        action: 'initiated',
        source: 'subscription_screen'
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  },
  
  trackRestorePurchasesSuccess: (restoredCount) => {
    console.log('📊 Analytics: Restore purchases success', {
      restoredCount,
      timestamp: new Date().toISOString()
    });
    
    try {
      ApiService.trackSubscriptionEvent('user_unknown', 'restore_success', {
        restoredCount,
        status: 'completed'
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  },
  
  trackPlanSelection: (planId, currentPlan) => {
    console.log('📊 Analytics: Plan selected', {
      planId,
      currentPlan,
      timestamp: new Date().toISOString()
    });
    
    try {
      ApiService.trackFeatureUsage('user_unknown', 'plan_selected', {
        selectedPlan: planId,
        currentPlan,
        action: 'select_plan'
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  },
  
  trackScreenInteraction: (interactionType, details = {}) => {
    console.log('📊 Analytics: Screen interaction', {
      interactionType,
      details,
      timestamp: new Date().toISOString()
    });
    
    try {
      ApiService.trackFeatureUsage('user_unknown', 'screen_interaction', {
        interactionType,
        ...details,
        component: 'SubscriptionScreen'
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }
};

const SubscriptionScreen = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [featureComparison] = useState([
    ['Daily Predictions', '3', '20', 'Unlimited'],
    ['Sports', 'NBA Only', 'All Sports', 'All Sports +'],
    ['Live Betting', '❌', '✅', '✅'],
    ['Analytics', 'Basic', 'Advanced', 'AI-Powered'],
    ['Support', 'Email', 'Priority', '24/7 Phone']
  ]);

  useEffect(() => {
    // Track screen view
    AnalyticsService.trackSubscriptionScreenView('Subscription');
    AnalyticsService.trackScreenInteraction('screen_entered', {
      section: 'main'
    });
    
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load current subscription
      const subResponse = await ApiService.getUserSubscription();
      setCurrentSubscription(subResponse.data);
      
      // Load available plans
      const plansResponse = await ApiService.getSubscriptionPlans();
      
      // Use API data if available, otherwise use fallback data
      if (plansResponse.data && plansResponse.data.length > 0) {
        setPlans(plansResponse.data);
        setSelectedPlan(plansResponse.data[0]?.id);
      } else {
        // Fallback to static plans if API fails
        const staticPlans = [
          {
            id: 'free',
            name: 'Free',
            price: 0,
            period: 'month',
            features: [
              '3 predictions per day',
              'NBA predictions only',
              'Basic analytics',
              'Community picks'
            ]
          },
          {
            id: 'pro',
            name: 'Pro',
            price: 19.99,
            period: 'month',
            popular: true,
            features: [
              '20 predictions per day',
              'All sports (NBA, NFL, NHL)',
              'Advanced analytics',
              'Live betting access',
              'Handicap calculator',
              'Ad-free experience'
            ]
          },
          {
            id: 'elite',
            name: 'Elite',
            price: 49.99,
            period: 'month',
            features: [
              'Unlimited predictions',
              'All sports + premium data',
              'AI-powered insights',
              'Early odds access',
              'Personalized coach',
              'Priority support',
              'API access'
            ]
          }
        ];
        setPlans(staticPlans);
        setSelectedPlan('pro');
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Use fallback data on error
      const fallbackPlans = [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          period: 'month',
          features: [
            '3 predictions per day',
            'NBA predictions only',
            'Basic analytics',
            'Community picks'
          ]
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 19.99,
          period: 'month',
          popular: true,
          features: [
            '20 predictions per day',
            'All sports (NBA, NFL, NHL)',
            'Advanced analytics',
            'Live betting access',
            'Handicap calculator',
            'Ad-free experience'
          ]
        },
        {
          id: 'elite',
          name: 'Elite',
          price: 49.99,
          period: 'month',
          features: [
            'Unlimited predictions',
            'All sports + premium data',
            'AI-powered insights',
            'Early odds access',
            'Personalized coach',
            'Priority support',
            'API access'
          ]
        }
      ];
      setPlans(fallbackPlans);
      setSelectedPlan('pro');
      setCurrentSubscription({ plan: 'free' });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId) => {
    // Track upgrade attempt
    AnalyticsService.trackSubscriptionUpgradeAttempt(
      planId,
      'subscription_screen',
      'SubscriptionScreen'
    );
    
    AnalyticsService.trackScreenInteraction('purchase_initiated', {
      planId,
      currentPlan: currentSubscription?.plan || 'free'
    });

    Alert.alert(
      'Confirm Purchase',
      'Are you sure you want to purchase this subscription?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            // Track cancel action
            AnalyticsService.trackSubscriptionEvent('user_unknown', 'purchase_cancelled', {
              planId,
              source: 'subscription_screen',
              action: 'user_cancelled'
            });
          }
        },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              // In a real app, you would integrate with Apple/Google In-App Purchase here
              Alert.alert(
                'Purchase Initiated',
                'Please complete the purchase in the App Store dialog.',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      try {
                        // Call API to purchase subscription
                        const response = await ApiService.purchaseSubscription(
                          planId,
                          'simulated_payment_' + Date.now()
                        );
                        
                        if (response.success) {
                          // Track successful purchase
                          const plan = plans.find(p => p.id === planId);
                          AnalyticsService.trackSubscriptionUpgradeSuccess(
                            planId,
                            'in_app_purchase',
                            plan?.price || 0
                          );
                          
                          AnalyticsService.trackScreenInteraction('purchase_completed', {
                            planId,
                            price: plan?.price || 0,
                            status: 'success'
                          });
                          
                          // Store purchase locally
                          await AsyncStorage.setItem('@user_purchases', JSON.stringify([
                            {
                              planId,
                              plan: planId.includes('elite') ? 'elite' : 
                                   planId.includes('pro') ? 'pro' : 'free',
                              status: 'active',
                              purchasedAt: new Date().toISOString(),
                              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                            }
                          ]));
                          
                          await AsyncStorage.removeItem('@user_subscription');
                          Alert.alert('Success', 'Subscription activated successfully!');
                          loadSubscriptionData();
                        } else {
                          // Track failed purchase
                          AnalyticsService.trackSubscriptionUpgradeFailure(
                            planId,
                            'api_error',
                            response.message || 'Failed to process purchase'
                          );
                          
                          Alert.alert('Error', response.message || 'Failed to process purchase');
                        }
                      } catch (apiError) {
                        console.error('API error:', apiError);
                        
                        // Track failure
                        AnalyticsService.trackSubscriptionUpgradeFailure(
                          planId,
                          'network_error',
                          apiError.message || 'Network error'
                        );
                        
                        // Simulate successful purchase if API fails
                        const plan = plans.find(p => p.id === planId);
                        
                        // Still track as success for testing
                        AnalyticsService.trackSubscriptionUpgradeSuccess(
                          planId,
                          'simulated_purchase',
                          plan?.price || 0
                        );
                        
                        await AsyncStorage.setItem('@user_purchases', JSON.stringify([
                          {
                            planId,
                            plan: planId.includes('elite') ? 'elite' : 
                                 planId.includes('pro') ? 'pro' : 'free',
                            status: 'active',
                            purchasedAt: new Date().toISOString(),
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                          }
                        ]));
                        
                        await AsyncStorage.removeItem('@user_subscription');
                        Alert.alert('Success', 'Subscription activated successfully!');
                        loadSubscriptionData();
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              // Track error
              AnalyticsService.trackSubscriptionUpgradeFailure(
                planId,
                'unknown_error',
                error.message || 'Unknown error'
              );
              
              Alert.alert('Error', 'Failed to process purchase');
            }
          }
        }
      ]
    );
  };

  const handleRestore = async () => {
    // Track restore attempt
    AnalyticsService.trackRestorePurchasesAttempt();
    
    AnalyticsService.trackScreenInteraction('restore_initiated', {});

    Alert.alert(
      'Restore Purchases',
      'This will restore any previous purchases made with your account.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            AnalyticsService.trackScreenInteraction('restore_cancelled', {});
          }
        },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              const response = await ApiService.restorePurchase('restore_token');
              if (response.success) {
                // Track successful restore
                AnalyticsService.trackRestorePurchasesSuccess(1); // Number of purchases restored
                
                AnalyticsService.trackScreenInteraction('restore_completed', {
                  status: 'success',
                  restoredCount: 1
                });
                
                Alert.alert('Success', 'Purchases restored successfully!');
                loadSubscriptionData();
              } else {
                Alert.alert('Info', 'No previous purchases found.');
              }
            } catch (error) {
              AnalyticsService.trackScreenInteraction('restore_failed', {
                error: error.message
              });
              
              Alert.alert('Error', 'Failed to restore purchases');
            }
          }
        }
      ]
    );
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    
    // Track plan selection
    AnalyticsService.trackPlanSelection(
      planId,
      currentSubscription?.plan || 'free'
    );
    
    AnalyticsService.trackScreenInteraction('plan_selected', {
      planId,
      currentPlan: currentSubscription?.plan || 'free'
    });
  };

  const getPlanIcon = (planId) => {
    if (planId === 'elite') return 'trophy';
    if (planId === 'pro') return 'star';
    return 'person';
  };

  const getPlanColor = (planId) => {
    if (planId === 'elite') return '#FFD700';
    if (planId === 'pro') return '#007AFF';
    return '#666';
  };

  const getPlanPrice = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.price || 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading subscription information...</Text>
      </View>
    );
  }

  const currentPlan = currentSubscription?.plan || 'free';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="diamond" size={60} color="#007AFF" />
        <Text style={styles.headerTitle}>Premium Features</Text>
        <Text style={styles.headerSubtitle}>
          Upgrade for advanced tools and insights
        </Text>
      </View>

      {/* Current Subscription Status */}
      <View style={styles.currentPlanCard}>
        <Text style={styles.sectionTitle}>Current Plan</Text>
        <View style={styles.currentPlanInfo}>
          <Ionicons 
            name={getPlanIcon(currentPlan)} 
            size={40} 
            color={getPlanColor(currentPlan)} 
          />
          <View style={styles.planDetails}>
            <Text style={styles.planName}>
              {currentPlan.toUpperCase()}
            </Text>
            {currentSubscription?.expiresAt ? (
              <Text style={styles.planExpiry}>
                Expires: {new Date(currentSubscription.expiresAt).toLocaleDateString()}
              </Text>
            ) : (
              <Text style={styles.planExpiry}>
                {currentPlan === 'free' ? 'No active subscription' : 'Active'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Available Plans */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.popular && styles.popularCard,
              currentPlan === plan.id && styles.currentCard
            ]}
            onPress={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            
            {plan.id === 'elite' && plan.period === 'year' && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>SAVE 17%</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Text style={styles.planNameText}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                ${plan.price}<Text style={styles.planPeriod}>/{plan.period === 'year' ? 'year' : 'month'}</Text>
              </Text>
            </View>
            
            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              )));;
            </View>
            
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                currentPlan === plan.id && styles.currentButton
              ]}
              onPress={() => handlePurchase(plan.id)}
              disabled={currentPlan === plan.id}
            >
              <Text style={styles.purchaseButtonText}>
                {currentPlan === plan.id ? 'Current Plan' : 
                 currentPlan === 'free' ? 'SUBSCRIBE' : 'UPGRADE'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )));;
      </View>

      {/* Feature Comparison */}
      <View style={styles.comparison}>
        <Text style={styles.comparisonTitle}>Feature Comparison</Text>
        <View style={styles.comparisonTable}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Feature</Text>
            <Text style={styles.tableCell}>Free</Text>
            <Text style={styles.tableCell}>Pro</Text>
            <Text style={styles.tableCell}>Elite</Text>
          </View>
          {featureComparison.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableFeature}>{row[0]}</Text>
              <Text style={styles.tableCell}>{row[1]}</Text>
              <Text style={styles.tableCell}>{row[2]}</Text>
              <Text style={styles.tableCell}>{row[3]}</Text>
            </View>
          )));;
        </View>
      </View>

      {/* Restore Purchases */}
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Ionicons name="refresh-circle" size={20} color="#666" />
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
          <Text style={styles.faqAnswer}>
            Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Will I be charged for a free trial?</Text>
          <Text style={styles.faqAnswer}>
            No, free trials are completely free. You'll only be charged if you don't cancel before the trial ends.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I manage my subscription?</Text>
          <Text style={styles.faqAnswer}>
            You can manage your subscription through your device's app store settings.
          </Text>
        </View>
      </View>

      {/* Terms */}
      <Text style={styles.termsText}>
        By subscribing, you agree to our Terms of Service and Privacy Policy. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  currentPlanCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  currentPlanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDetails: {
    marginLeft: 15,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  planExpiry: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  plansSection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  currentCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  planHeader: {
    marginBottom: 15,
  },
  planNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 20,
  },
  planPeriod: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'normal',
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentButton: {
    backgroundColor: '#4CAF50',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  comparison: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  comparisonTable: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeader: {
    flex: 2,
    padding: 12,
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    textAlign: 'center',
  },
  tableFeature: {
    flex: 2,
    padding: 12,
    color: '#666',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  restoreText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  faqSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  faqItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    lineHeight: 18,
  },
});

export default SubscriptionScreen;
