// src/screens/HomeScreen.js
import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  ScrollView, TouchableOpacity, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  // Quick access buttons (free features)
  const quickLinks = [
    { name: 'LiveGames', icon: 'play-circle', color: '#ef4444', label: 'Live Games' },
    { name: 'NFL', icon: 'american-football', color: '#10b981', label: 'NFL Analytics' },
    { name: 'Predictions', icon: 'trending-up', color: '#8b5cf6', label: 'AI Predictions' },
    { name: 'Fantasy', icon: 'trophy', color: '#f59e0b', label: 'Fantasy Tools' },
    { name: 'PlayerStats', icon: 'stats-chart', color: '#3b82f6', label: 'Player Stats' },
    { name: 'DailyPicks', icon: 'star', color: '#eab308', label: 'Daily Picks' },
    { name: 'Analytics', icon: 'analytics', color: '#06b6d4', label: 'Analytics' },
    { name: 'SportsNewsHub', icon: 'newspaper', color: '#8b5cf6', label: 'Sports News' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="football" size={36} color="#ef4444" />
          <Text style={styles.title}>Sports Pro Analytics</Text>
          <Text style={styles.subtitle}>Premium Insights & Real-time Data</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ===== PREMIUM ACCESS SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Premium Features</Text>
          
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => navigation.navigate('Tools', { screen: 'Premium' })}
          >
            <View style={styles.premiumCardHeader}>
              <Ionicons name="diamond" size={28} color="#f59e0b" />
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>UPGRADE</Text>
              </View>
            </View>
            <Text style={styles.premiumCardTitle}>Premium Access</Text>
            <Text style={styles.premiumCardText}>
              Unlock all premium features: Advanced AI predictions, detailed player analytics, fantasy tools, and ad-free experience.
            </Text>
            <View style={styles.premiumFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>AI Predictions</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>Advanced Stats</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>Fantasy Tools</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.featureText}>No Ads</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dailyLocksCard}
            onPress={() => navigation.navigate('Betting', { screen: 'DailyPicks' })}
          >
            <View style={styles.dailyLocksHeader}>
              <Ionicons name="lock-closed" size={28} color="#8b5cf6" />
              <Text style={styles.dailyLocksTitle}>Daily Locks</Text>
            </View>
            <Text style={styles.dailyLocksText}>
              Today's expert picks with highest confidence ratings. Updated daily at 9 AM EST.
            </Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>87% Accuracy Rate</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* ===== QUICK ACCESS SECTION ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ Quick Access</Text>
            <Text style={styles.sectionSubtitle}>Free Features</Text>
          </View>
          
          <View style={styles.grid}>
            {quickLinks.map((link) => (
              <TouchableOpacity
                key={link.name}
                style={styles.card}
                onPress={() => {
                  // Handle navigation based on screen grouping
                  if (['NFL', 'NHL', 'LiveGames', 'SportsNewsHub'].includes(link.name)) {
                    navigation.navigate('Sports', { screen: link.name });
                  } else if (['PlayerStats', 'PlayerProfile', 'GameDetails', 'Analytics'].includes(link.name)) {
                    navigation.navigate('Analytics', { screen: link.name });
                  } else if (['Predictions', 'ParlayBuilder', 'DailyPicks'].includes(link.name)) {
                    navigation.navigate('Betting', { screen: link.name });
                  } else if (['Fantasy', 'EditorUpdates', 'Login', 'Premium'].includes(link.name)) {
                    navigation.navigate('Tools', { screen: link.name });
                  } else {
                    navigation.navigate(link.name);
                  }
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: link.color + '20' }]}>
                  <Ionicons name={link.icon} size={28} color={link.color} />
                </View>
                <Text style={styles.cardTitle}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* ===== STATS SECTION ===== */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Today's Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Live Games</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>78.5%</Text>
              <Text style={styles.statLabel}>AI Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>245</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
          </View>
        </View>
        
        {/* ===== BOTTOM SPACER ===== */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { 
    paddingVertical: 20, 
    paddingHorizontal: 16,
    backgroundColor: '#1e293b', 
    borderBottomWidth: 1, 
    borderBottomColor: '#334155' 
  },
  headerContent: {
    alignItems: 'center',
  },
  title: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: 10,
    textAlign: 'center'
  },
  subtitle: { 
    color: '#94a3b8', 
    fontSize: 16, 
    marginTop: 5,
    textAlign: 'center'
  },
  content: { flex: 1, padding: 16 },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  premiumCard: {
    backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    backgroundColor: '#1a2235',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b40',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  premiumCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumBadgeText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiumCardTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  premiumCardText: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  premiumFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
  },
  dailyLocksCard: {
    backgroundColor: '#1a2235',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8b5cf640',
  },
  dailyLocksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyLocksTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  dailyLocksText: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  confidenceBadge: {
    backgroundColor: '#8b5cf620',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  confidenceText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1e293b',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
});
