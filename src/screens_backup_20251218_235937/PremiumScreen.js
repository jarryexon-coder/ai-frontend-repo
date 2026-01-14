import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      period: '/month',
      features: [
        'Live scores (15 min delay)',
        'Basic player stats',
        '3 fantasy teams',
        'Standard betting odds',
        'Basic alerts'
      ],
      color: '#3b82f6'
    },
    {
      id: 'pro',
      name: 'PRO',
      price: '$19.99',
      period: '/month',
      features: [
        '✅ Real-time scores (no delay)',
        '✅ Advanced player analytics',
        '✅ Unlimited fantasy teams',
        '✅ Premium betting insights',
        '✅ AI-powered predictions',
        '✅ Arbitrage opportunities',
        '✅ Live game tracking',
        '✅ Priority support'
      ],
      color: '#8b5cf6',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$49.99',
      period: '/month',
      features: [
        'Everything in PRO',
        'Custom API access',
        'Whale betting signals',
        'Personal fantasy coach',
        'Direct line to analysts',
        'Custom reports'
      ],
      color: '#f59e0b'
    }
  ];

  const currentPlan = plans.find(plan => plan.id === selectedPlan);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>👑 Premium Features</Text>
          <Text style={styles.subtitle}>Unlock the full power of NBA Fantasy PRO</Text>
        </View>

        {/* Current Plan Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Your Current Plan</Text>
          <View style={styles.currentPlan}>
            <View>
              <Text style={styles.currentPlanName}>BASIC Plan</Text>
              <Text style={styles.currentPlanExpiry}>Expires: Dec 31, 2024</Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {plans.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.popular && styles.popularPlan
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>
              
              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureText}>• {feature}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={[styles.selectButton, { backgroundColor: plan.color }]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <Text style={styles.selectButtonText}>
                  {selectedPlan === plan.id ? 'SELECTED' : 'SELECT PLAN'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium Features List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Benefits</Text>
          
          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Text style={styles.benefitEmoji}>🤖</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>AI Predictions</Text>
              <Text style={styles.benefitDescription}>Machine learning models predict game outcomes, player performances, and betting value with 87% accuracy.</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Text style={styles.benefitEmoji}>💰</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Arbitrage Finder</Text>
              <Text style={styles.benefitDescription}>Automatically find risk-free betting opportunities across different sportsbooks.</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Text style={styles.benefitEmoji}>📈</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Advanced Analytics</Text>
              <Text style={styles.benefitDescription}>Deep dive into player efficiency, team matchups, and historical performance data.</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Text style={styles.benefitEmoji}>⚡</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Real-time Alerts</Text>
              <Text style={styles.benefitDescription}>Get instant notifications for injuries, lineup changes, and betting line movements.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#8b5cf6', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#e9d5ff', marginTop: 5 },
  statusCard: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statusTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 15 },
  currentPlan: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentPlanName: { fontSize: 20, fontWeight: 'bold', color: '#3b82f6' },
  currentPlanExpiry: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  upgradeButton: { backgroundColor: '#8b5cf6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  upgradeButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  section: { margin: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 15 },
  planCard: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 2, borderColor: '#e5e7eb', position: 'relative' },
  planCardSelected: { borderColor: '#8b5cf6', backgroundColor: '#faf5ff' },
  popularPlan: { borderColor: '#f59e0b' },
  popularBadge: { position: 'absolute', top: -10, right: 20, backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  popularText: { fontSize: 10, fontWeight: 'bold', color: '#78350f' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  planName: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  priceContainer: { alignItems: 'flex-end' },
  planPrice: { fontSize: 32, fontWeight: 'bold', color: '#1e3a8a' },
  planPeriod: { fontSize: 14, color: '#6b7280' },
  featuresList: { marginBottom: 20 },
  featureItem: { marginBottom: 8 },
  featureText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  selectButton: { padding: 15, borderRadius: 8, alignItems: 'center' },
  selectButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  benefitCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  benefitIcon: { width: 50, height: 50, backgroundColor: '#f3f4f6', borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  benefitEmoji: { fontSize: 24 },
  benefitContent: { flex: 1 },
  benefitTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  benefitDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
});
