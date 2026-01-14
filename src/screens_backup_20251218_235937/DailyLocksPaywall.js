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
import revenueCatService from '../services/revenuecat-service';

const DailyLocksPaywall = ({ visible, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly_locks_subscription');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [packages, setPackages] = useState([]);

  const features = [
    {
      icon: 'lock-closed',
      title: 'Daily Expert Picks',
      description: 'Curated picks with high win probability',
    },
    {
      icon: 'trending-up',
      title: '85% Accuracy Rate',
      description: 'Proven track record of success',
    },
    {
      icon: 'time',
      title: 'Early Access',
      description: 'Get picks before public release',
    },
    {
      icon: 'stats-chart',
      title: 'Detailed Analysis',
      description: 'Comprehensive breakdown for each pick',
    },
    {
      icon: 'notifications',
      title: 'Instant Alerts',
      description: 'Get notified when new picks drop',
    },
    {
      icon: 'shield-checkmark',
      title: 'Money-Back Guarantee',
      description: '30-day satisfaction guarantee',
    },
  ];

  useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    try {
      // Get locks_offering packages
      const locksPackages = await revenueCatService.getOfferings('locks_offering');
      
      if (locksPackages && locksPackages.length > 0) {
        setPackages(locksPackages);
        // Set default selection to monthly
        const monthly = locksPackages.find(p => p.identifier === 'monthly_locks_subscription');
        if (monthly) setSelectedPlan(monthly.identifier);
      } else {
        // Fallback with UPDATED pricing
        setPackages([
          {
            identifier: 'weekly_locks_subscription',
            product: {
              identifier: 'com.yourcompany.locks.weekly',
              priceString: '$29.99',
              description: 'Weekly locks subscription',
              title: 'Weekly Locks',
            },
          },
          {
            identifier: 'monthly_locks_subscription',
            product: {
              identifier: 'com.yourcompany.locks.monthly',
              priceString: '$99.99',
              description: 'Monthly locks subscription',
              title: 'Monthly Locks',
            },
          },
        ]);
      }
    } catch (error) {
      console.log('Error loading packages:', error);
    }
  };

  const handlePurchase = async (packageIdentifier) => {
    setIsPurchasing(true);
    try {
      const result = await revenueCatService.purchasePackage(packageIdentifier);
      
      if (result.success) {
        Alert.alert(
          '🔓 Daily Locks Unlocked!',
          'You now have access to expert daily picks.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        if (!result.userCancelled) {
          Alert.alert('Error', result.error || 'Purchase failed');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await revenueCatService.restorePurchases();
      if (result.success) {
        if (result.restoredEntitlements.includes('daily_locks')) {
          Alert.alert('Success', 'Daily Locks access restored!');
          onClose();
        } else {
          Alert.alert('No Access Found', 'No active Daily Locks subscription found.');
        }
      } else {
        Alert.alert('Error', result.error || 'Restore failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to restore purchases');
    }
  };

  const getPackageTitle = (pkg) => {
    return pkg.product.title || pkg.identifier.replace('_', ' ').replace('subscription', '');
  };

  // Calculate daily cost for comparison
  const calculateDailyCost = (price, period) => {
    const priceNum = parseFloat(price.replace('$', ''));
    if (period === 'Weekly') {
      return (priceNum / 7).toFixed(2);
    } else if (period === 'Monthly') {
      return (priceNum / 30).toFixed(2);
    }
    return priceNum.toFixed(2);
  };

  // Calculate savings percentage for monthly vs weekly
  const calculateMonthlySavings = () => {
    const weeklyPrice = 29.99;
    const monthlyPrice = 99.99;
    const weeklyMonthlyEquivalent = weeklyPrice * 4.33; // Average weeks in a month
    
    const savings = ((weeklyMonthlyEquivalent - monthlyPrice) / weeklyMonthlyEquivalent * 100).toFixed(0);
    return savings > 0 ? savings : 0;
  };

  // Calculate monthly equivalent for weekly plan
  const calculateMonthlyEquivalent = () => {
    return (29.99 * 4.33).toFixed(2); // Average weeks in a month
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
          colors={['#8b5cf6', '#7c3aed']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Ionicons name="lock-open" size={60} color="#fbbf24" />
            <Text style={styles.title}>Daily Locks Pro</Text>
            <Text style={styles.subtitle}>Premium expert picks with 85%+ accuracy</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView}>
          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What You Get</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name={feature.icon} size={24} color="#8b5cf6" />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Value Proposition */}
          <View style={styles.valueSection}>
            <View style={styles.valueCard}>
              <Ionicons name="cash" size={30} color="#8b5cf6" />
              <Text style={styles.valueTitle}>Premium Quality = Premium Results</Text>
              <Text style={styles.valueText}>
                One winning pick at -110 odds covers your weekly subscription!
              </Text>
            </View>
          </View>

          {/* Pricing Comparison */}
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>Monthly Plan Saves You ${calculateMonthlySavings()}%</Text>
            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Weekly Plan</Text>
                <Text style={styles.comparisonValue}>$29.99/week</Text>
                <Text style={styles.comparisonNote}>≈ ${calculateMonthlyEquivalent()}/month</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Monthly Plan</Text>
                <Text style={styles.comparisonValue}>$99.99/month</Text>
                <Text style={styles.comparisonSave}>Save ${(calculateMonthlyEquivalent() - 99.99).toFixed(2)}/month</Text>
              </View>
            </View>
          </View>

          {/* Pricing - UPDATED Products */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            
            {packages.map((pkg, index) => {
              const isWeekly = pkg.identifier.includes('weekly');
              const dailyCost = calculateDailyCost(
                pkg.product.priceString,
                isWeekly ? 'Weekly' : 'Monthly'
              );
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.planCard,
                    selectedPlan === pkg.identifier && styles.selectedPlanCard,
                  ]}
                  onPress={() => setSelectedPlan(pkg.identifier)}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planRadio}>
                      {selectedPlan === pkg.identifier && <View style={styles.planRadioSelected} />}
                    </View>
                    {!isWeekly && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>
                          Best Value
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.planBody}>
                    <Text style={styles.planTitle}>{getPackageTitle(pkg)}</Text>
                    <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
                    <Text style={styles.planDescription}>{pkg.product.description}</Text>
                    
                    <Text style={styles.dailyCost}>
                      Only ${dailyCost}/day
                    </Text>
                    
                    {!isWeekly && (
                      <Text style={styles.monthlySavings}>
                        Save {calculateMonthlySavings()}% vs weekly
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ROI Calculator */}
          <View style={styles.roiSection}>
            <Text style={styles.roiTitle}>ROI Calculator</Text>
            <View style={styles.roiGrid}>
              <View style={styles.roiItem}>
                <Text style={styles.roiValue}>1</Text>
                <Text style={styles.roiLabel}>Winning Pick</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#8b5cf6" style={styles.roiArrow} />
              <View style={styles.roiItem}>
                <Text style={styles.roiValue}>$91</Text>
                <Text style={styles.roiLabel}>Profit at -110</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#8b5cf6" style={styles.roiArrow} />
              <View style={styles.roiItem}>
                <Text style={styles.roiValue}>3x</Text>
                <Text style={styles.roiLabel}>ROI Weekly</Text>
              </View>
            </View>
            <Text style={styles.roiNote}>
              Based on 85% win rate and standard -110 odds
            </Text>
          </View>

          {/* Testimonials */}
          <View style={styles.testimonialsSection}>
            <Text style={styles.sectionTitle}>High Roller Results</Text>
            <View style={styles.testimonialCard}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.testimonialText}>
                "The $99/month seems steep until you're up $5,000 in 30 days. This service pays for itself."
              </Text>
              <Text style={styles.testimonialAuthor}>- David K., Professional Bettor</Text>
            </View>
          </View>

          {/* Guarantee */}
          <View style={styles.guaranteeSection}>
            <Ionicons name="shield-checkmark" size={40} color="#10b981" />
            <Text style={styles.guaranteeTitle}>30-Day Profit Guarantee</Text>
            <Text style={styles.guaranteeText}>
              If you don't make a profit in your first 30 days, we'll refund your subscription, no questions asked.
            </Text>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
            onPress={() => handlePurchase(selectedPlan)}
            disabled={isPurchasing}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.purchaseButtonGradient}
            >
              {isPurchasing ? (
                <Text style={styles.purchaseButtonText}>Processing...</Text>
              ) : (
                <Text style={styles.purchaseButtonText}>
                  Unlock Daily Locks Pro - {packages.find(p => p.identifier === selectedPlan)?.product.priceString || '$99.99'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
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
    backgroundColor: '#f5f3ff',
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
  valueSection: {
    marginTop: 20,
  },
  valueCard: {
    backgroundColor: '#f5f3ff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  valueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginTop: 15,
    marginBottom: 10,
  },
  valueText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  comparisonSection: {
    marginTop: 20,
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 15,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 15,
    textAlign: 'center',
  },
  comparisonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
    textAlign: 'center',
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  comparisonNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
    textAlign: 'center',
  },
  comparisonSave: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
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
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
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
    backgroundColor: '#8b5cf6',
  },
  popularBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
  },
  planBody: {
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 5,
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  dailyCost: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 8,
  },
  monthlySavings: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
  roiSection: {
    marginTop: 30,
    backgroundColor: '#1e293b',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  roiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  roiGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  roiItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  roiValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  roiLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 5,
    textAlign: 'center',
  },
  roiArrow: {
    marginHorizontal: 10,
  },
  roiNote: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  testimonialsSection: {
    marginTop: 30,
  },
  testimonialCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 15,
    marginBottom: 10,
    lineHeight: 22,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  guaranteeSection: {
    marginTop: 30,
    marginBottom: 30,
    backgroundColor: '#f0fdf4',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  guaranteeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065f46',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  guaranteeText: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 20,
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
    color: '#8b5cf6',
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

export default DailyLocksPaywall;
