#!/bin/bash

echo "🔧 Fixing navigation warnings in HomeScreen..."

# First, let's examine the current HomeScreen navigation logic
cat > check-navigation.js << 'NAVCHECK'
const fs = require('fs');
const path = require('path');

const homeScreenPath = 'src/screens/HomeScreen-working.js';

if (fs.existsSync(homeScreenPath)) {
  const content = fs.readFileSync(homeScreenPath, 'utf8');
  
  console.log('Current navigation logic in HomeScreen:');
  console.log('========================================');
  
  // Extract the navigateToScreen function
  const navigateFunctionMatch = content.match(/const navigateToScreen = \(([^)]+)\) => \{([^}]+)\}/s);
  if (navigateFunctionMatch) {
    console.log('Found navigateToScreen function:');
    console.log(navigateFunctionMatch[0]);
  }
  
  // Check specific navigation calls
  const checks = [
    { name: 'MarketMoves', pattern: /MarketMoves.*navigation\.navigate/ },
    { name: 'Analytics', pattern: /Analytics.*navigation\.navigate/ },
    { name: 'LiveGames', pattern: /LiveGames.*navigation\.navigate/ },
    { name: 'Fantasy', pattern: /Fantasy.*navigation\.navigate/ },
    { name: 'Predictions', pattern: /Predictions.*navigation\.navigate/ },
    { name: 'ParlayArchitect', pattern: /ParlayArchitect.*navigation\.navigate/ },
  ];
  
  console.log('\nNavigation pattern checks:');
  checks.forEach(check => {
    const hasPattern = check.pattern.test(content);
    console.log(`${check.name}: ${hasPattern ? '✅ Found' : '❌ Not found'}`);
  });
}
NAVCHECK

node check-navigation.js

# Now create a fixed version of HomeScreen
cat > src/screens/HomeScreen-production.js << 'HOMESCREENFIXED'
// src/screens/HomeScreen-production.js
// Fixed navigation with proper screen names
import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  ScrollView, TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const navigateToScreen = (screenName) => {
    // console.log('Navigating to:', screenName); // Removed for production
    
    // Handle direct tab navigation
    if (screenName === 'MarketMoves') {
      navigation.navigate('EditorsUpdates');
      return;
    }
    
    if (screenName === 'Analytics') {
      navigation.navigate('AnalyticsTab', { screen: 'AnalyticsMain' });
      return;
    }
    
    // Handle stack navigation
    if (screenName === 'LiveGames') {
      navigation.navigate('LiveSports', { screen: 'LiveGames' });
      return;
    }
    
    if (screenName === 'Fantasy') {
      navigation.navigate('PremiumTab', { screen: 'Fantasy' });
      return;
    }
    
    if (screenName === 'Predictions') {
      navigation.navigate('WinnersCircle', { screen: 'Predictions' });
      return;
    }
    
    if (screenName === 'ParlayArchitect') {
      navigation.navigate('WinnersCircle', { screen: 'ParlayArchitect' });
      return;
    }
    
    // Handle other screens
    if (['NFL', 'NHLStatsTrends', 'SportsWire'].includes(screenName)) {
      navigation.navigate('LiveSports', { screen: screenName });
      return;
    }
    
    if (['PlayerMetrics', 'PlayerDashboard', 'MatchAnalytics'].includes(screenName)) {
      navigation.navigate('AnalyticsTab', { screen: screenName });
      return;
    }
    
    if (screenName === 'ExpertSelections') {
      navigation.navigate('WinnersCircle', { screen: 'ExpertSelections' });
      return;
    }
    
    if (['Login', 'PremiumAccess'].includes(screenName)) {
      navigation.navigate('PremiumTab', { screen: screenName });
      return;
    }
    
    // Fallback - navigate to the tab directly
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="football" size={36} color="#ef4444" />
          <Text style={styles.title}>Sports Pro Analytics</Text>
          <Text style={styles.subtitle}>Production Ready</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>Working Features</Text>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('MarketMoves')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="megaphone" size={24} color="#10b981" />
              </View>
              <Text style={styles.tabTitle}>Market Moves</Text>
              <Text style={styles.tabSubtitle}>Latest news & insights</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('LiveGames')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#ef444420' }]}>
                <Ionicons name="play-circle" size={24} color="#ef4444" />
              </View>
              <Text style={styles.tabTitle}>Live Games</Text>
              <Text style={styles.tabSubtitle}>Real-time scores & stats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('Fantasy')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#f59e0b20' }]}>
                <Ionicons name="trophy" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.tabTitle}>Fantasy Tools</Text>
              <Text style={styles.tabSubtitle}>Fantasy league management</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('Predictions')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#8b5cf620' }]}>
                <Ionicons name="trending-up" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.tabTitle}>AI Predictions</Text>
              <Text style={styles.tabSubtitle}>Machine learning forecasts</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="build" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Other Features</Text>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('NFL')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#dc262620' }]}>
                <Ionicons name="american-football" size={24} color="#dc2626" />
              </View>
              <Text style={styles.tabTitle}>NFL Analytics</Text>
              <Text style={styles.tabSubtitle}>Advanced football stats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('PlayerMetrics')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="stats-chart" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.tabTitle}>Player Metrics</Text>
              <Text style={styles.tabSubtitle}>Player performance data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('ParlayArchitect')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#f59e0b20' }]}>
                <Ionicons name="build" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.tabTitle}>Parlay Architect</Text>
              <Text style={styles.tabSubtitle}>Custom bet construction</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('ExpertSelections')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#eab30820' }]}>
                <Ionicons name="star" size={24} color="#eab308" />
              </View>
              <Text style={styles.tabTitle}>Expert Selections</Text>
              <Text style={styles.tabSubtitle}>Daily expert picks</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#94a3b8" />
            <Text style={styles.sectionTitle}>Account & Settings</Text>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('Login')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="log-in" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.tabTitle}>Login</Text>
              <Text style={styles.tabSubtitle}>Account access</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tabCard}
              onPress={() => navigateToScreen('Settings')}
            >
              <View style={[styles.tabIcon, { backgroundColor: '#64748b20' }]}>
                <Ionicons name="settings" size={24} color="#64748b" />
              </View>
              <Text style={styles.tabTitle}>Settings</Text>
              <Text style={styles.tabSubtitle}>App configuration</Text>
            </TouchableOpacity>
          </View>
        </View>
        
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
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold',
    marginLeft: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tabCard: {
    backgroundColor: '#1e293b',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabIcon: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  tabTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tabSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
HOMESCREENFIXED

# Update GroupedTabNavigator to use the new HomeScreen
cp src/screens/HomeScreen-production.js src/screens/HomeScreen-working.js

echo "\n✅ Navigation fixes applied!"
echo "Created HomeScreen-production.js and updated HomeScreen-working.js"
echo "\nNavigation is now properly configured for:"
echo "- MarketMoves → EditorsUpdates tab"
echo "- Analytics → AnalyticsTab with AnalyticsMain screen"
echo "- LiveGames → LiveSports stack with LiveGames screen"
echo "- Fantasy → PremiumTab with Fantasy screen"
echo "- Predictions → WinnersCircle stack with Predictions screen"
echo "- ParlayArchitect → WinnersCircle stack with ParlayArchitect screen"
